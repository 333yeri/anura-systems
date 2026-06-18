# ANURA SYSTEMS — Vision Document

**Status:** Sections 1 locked. Sections 2-13 awaiting extraction.

This is the canonical source of truth for Anura. Drawn verbatim from
the Miro board (exported 2026-06-18) plus verbatim from Yeray's voice
messages during this extraction session.

If anything below contradicts the Miro board, the board wins.

---

## §1 — The Core Idea

> A faceless, elite digital architecture studio. We don't build brochure
> websites. We engineer high-end digital experiences and automated
> business systems. We build everything based on a feeling — we don't
> just create a selling experience, we build an entire world that invites
> the client in.

**Locked 2026-06-18.** Yeray + Daria picked Option A (board page 2) +
requested: keep the emotion, drop "client-vetting engines and automated
sales funnels" (contradicts "we sell the feeling"), shorter overall.

---

## §2 — Visuals *(pending — Section 2 questions next)*

**Board references:** page 1 (Visual Board — 5 pillars of mood), page
2 ("The Visuals" + "Brand Design Spec" colors + "Performance Budget" +
"Typography Trinity"). Source of truth: `anura-systems/research/miro-v2.md`
(page 2 verbatim).

---

## §3 — The 5-Act Interactive Journey *(pending)*

**Board reference:** page 5 (full acts spec, captured verbatim).
Acts: 1 The Gate → 2 The Fall → 3 The Swamp Drift → 4 The Clearing →
5 The Ingress.

---

## §4 — Characters *(pending)*

**Board references:** Yeri (3D character at campfire, Act 4); the frog
(3D mascot, leads us Acts 1-4). Frog asset status: TBD.

---

## §5 — Text & Voice *(pending)*

**Board reference:** page 4 (act scripts + button script + questionnaire
script) + page 4 ("The Standards We Stand By"). Voice direction: quiet,
present, slightly spiritual, premium, calm.

---

## §6 — Packages & Times *(pending)*

**Board reference:** page 2 ($8,500 – $12,000 + the 3-way process).

---

## §7 — Pricing Trajectory *(pending)*

**Board reference:** page 4 ("Our Value" — $4-5k seed projects first,
then $8.5k+, then higher).

---

## §8 — Anura Systems Values *(pending)*

**Board reference:** page 2 (X-diagram: Deliberate and distraction-free
communication culture / Async calm values / The Creed / Perfectionist
Engineering / Elite engineering standards / Disciplined execution /
Aesthetic Sovereignty / Precision-built systems with no shortcuts).

---

## §9 — Email Aliases *(pending)*

**Board reference:** page 2 — `director@anura.systems` (Daria, client-
facing: LinkedIn, onboarding, messages, contract signatures, strategic
updates) + `ops@anura.systems` (Yeray, internal: notifications, task
trackers, scrapers, code updates). Plus `anura.systems@proton.me` /
`dandyLION25 ;)` for shared inbox.

---

## §10 — Brand Design Spec *(pending — colors, fonts)*

**Board reference:** page 2 — 5 colors (void/mist/peat/spectrum/embers),
3 fonts (PP Neue Montreal headers / JetBrains Mono kernel / Commit Mono
UI accents). Performance budget: 60fps, <15k tris, <2MB load.

---

## §11 — Intake Questionnaire *(pending)*

**Board reference:** page 4 (script for questionnaire: "You made it to
the gate" / "We're glad you're here" / 5 questions + SUBMIT → 3-5
business day response).

---

## §12 — Distribution *(pending — empty on board)*

**Board reference:** page 3 — three empty headers: INSTAGRAM /
LINKEDIN / COLD OUTREACH. You haven't filled these in yet. TBD.

---

## §13 — Work With Client Script *(pending)*

**Board reference:** page 4 — shared visual space + script approval at
Day 3 + weekly visual updates.

---

## §14 — Check Of Our Connection Before Work *(pending)*

**Board reference:** page 4 — three checks before any work: Equity /
Sovereignty / Calm.

---

## §15 — What The Rest Of The Market Does (Cheap) vs. What Anura Systems Does (Elite) *(pending)*

**Board reference:** page 4 — the comparison table (3 rows: what they
sell / how they work / how they communicate).

---

## §16 — Service List *(pending)*

**Board reference:** page 4 — "Graphic design, Web Design, Product
Design, Packaging Design, Web Development, Integrated Marketing
Strategy, SEO, Video Production, Digital Animation, Motion Graphics, 3D,
Immersive Digital, Experiential, AR, and VR."

---

## §17 — Audit: what I built before the Miro board arrived *(pending)*

**Locked 2026-06-18 — see end of file.** This section lists the 11
mistakes I made in earlier turns when I was building without the board
as source of truth.

---

## §18 — Open Questions

These need your decision before any code touches the next section:

1. **Visual quality floor:** Board says "older counter strike era. ~30k
   polys per character. 2007-2010 3D games. GTA IV / Crysis 1 / HL2
   quality." My current code goes photoreal (PBR + IBL + bloom). Do I
   dial it back to the board's spec, or is the photoreal acceptable as
   a v1 floor and we tune later?
2. **Frog asset:** Board has a frog as the guide character. We don't
   have a frog GLB. Do you have one, or do we source/build one?
3. **Audio:** Board specifies audio per act (CRT hum, flute, bass drop,
   fire crackle). We have no audio system. Integrate now, source later?
4. **Yeri character at campfire:** Board says Act 4 has "Yeri" 3D
   character. Is that your namesake (Yeray) literal, or a different
   character also named Yeri? We have a 317k-tris `yeri.glb` rigged
   humanoid that we haven't placed yet.
5. **Section 8 (Values)** — Daria wants variants on the X-diagram
   labels. I'll ask when we get there.

---

*Document is a living artifact. Each section gets `[LOCKED yyyy-mm-dd]`
when both Yeray and Daria sign off. Until then it's `[pending]`.*