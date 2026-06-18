# ANURA.SYSTEM — Canonical Vision

> **Source:** Miro board `uXjVHHr5uIE=` ("ANURA.SYSTEM"), exported as PDF, 4 pages,
> received via email on 2026-06-18.
>
> **Rule for this document:** every quoted block is **verbatim from the board**.
> Every `[ ]` flag is something I, Hermes, got wrong before this board
> arrived and need a re-decision on. Nothing in this document is my
> creative output — it's an extraction and an audit.

---

## 1. CORE IDEA (from the board)

> **"A new wave of craft emerges. The roads are quiet. The studios are
> dead. The free tools are poisoned. A class of work is rising —
> unconventionally small, unconventionally precise, unconventionally
> slow. Anura Systems builds the digital home for this class. Not as a
> showcase. As a quiet infrastructure."**

This is the soul. Read it twice. It tells us:

- We're not building for everyone. We're building for **a specific emerging
  class of craftspeople** — small, precise, slow, unconventional.
- We're **not a showcase**. The site isn't "look how pretty we make
  things." It's **quiet infrastructure** — a system that operates on
  behalf of these craftspeople.
- The competitive frame is **what's wrong out there**: dead studios,
  poisoned free tools, loud roads. Anura is the opposite of all three.

---

## 2. THE VISUALS — what the brand IS

> **"The brand is set in a swamp, around an active campfire, at night. The
> atmosphere is dark green and lively, like a forest breathing. There is no
> people — only the guide (the frog). The frogs sit at the campfire awaiting
> arrival."**

Five hard constraints on the visual language, all from the board:

1. **Dark green and lively.** Not black void, not neon. The swamp is the
   dominant visual identity.
2. **No people.** The visitor never sees a person in the brand. **Only the
   frog guide.** This rules out using stock photography, illustrations of
   humans, the Yeri character on the public site, etc.
3. **The frog sits at the campfire awaiting arrival.** The frog is not a
   mascot — it's a **gatekeeper / host / greeter**.
4. **Camera-only experience.** "No humans in interactive world — only
> camera, only frog guide." This means the **public-facing site must use
> only camera + frog + environment**. No third-person character models.
5. **Anura Systems is the COMPANY. The CAMPSITE is the studio.** The
   customer doesn't enter Anura-the-agency. They enter **the campsite**.

> **"Act 1. Loading bar — phosphor green, with text: SCROLL TO DESCEND.
> Act 3. Campfire is visible. CTA text above the fire pulses: 'IF YOU ARE
> WORTHY OF OUR PROCESS'. Act 5 (or 6?) is the consultation request form."**

Structure of the experience, from the board:

- **Act 1**: Loading. Phosphor green bar. "SCROLL TO DESCEND."
- **Act 2**: Drop / drift through the swamp.
- **Act 3**: Campfire is visible. CTA above the fire. **"IF YOU ARE WORTHY OF OUR PROCESS"** (pulses).
- **Act 5+**: The application / consultation form.

> **"Anura Systems works the way this forest grows — slowly, in layers, with
> attention to what the eye cannot see at first glance."**

This is the closing voice line — the manifesto-style closer. It tells us:

- Pace is slow.
- Layers are intentional.
- Hidden craft (the eye doesn't see at first glance) is the value.

---

## 3. TYPOGRAPHY (canonical)

> **"PP Neue Montreal — Headers / JetBrains Mono — Kernel Text / Commit
> Mono — UI Accents"**

Three-font system, all named specifically. **NOT Oswald + Share Tech Mono
+ Inter** (that was my fabricated font stack).

| Role | Font | Use |
|---|---|---|
| **Headers** | PP Neue Montreal | Display, headings, brand wordmark |
| **Kernel text** | JetBrains Mono | Body copy, body text |
| **UI accents** | Commit Mono | Buttons, labels, code blocks, system readouts |

These are all **paid/curated fonts** from Pangram Pangram, JetBrains, and
Commit Mono respectively. Need licensing confirmation before shipping
live.

---

## 4. COLOR PALETTE (canonical)

> **"void_000 #080808 / mist_100 #1C1E21 / peat_05 #1A2A1A / spectrum_200
> #8A9098 / embers_01 #D4AF37"**

Five colors. Not seven. Not with neon cyan.

| Token | Hex | Use |
|---|---|---|
| `void_000` | `#080808` | True black. Page background, negative space. |
| `mist_100` | `#1C1E21` | Warm dark grey. Surfaces, cards. |
| `peat_05` | `#1A2A1A` | Organic dark green. Swamp water, fog, environment tint. |
| `spectrum_200` | `#8A9098` | Neutral mid-grey. Body text, secondary UI. |
| `embers_01` | `#D4AF37` | Metallic gold. Campfire, fire particles, accent. |

**Misalignments I had baked into the current code:**

| I used | Board says | Status |
|---|---|---|
| `--void-000: #0D0F12` | `void_000 #080808` | ❌ wrong — needs swap |
| `--mist-100: #1A1D24` | `mist_100 #1C1E21` | ❌ wrong — needs swap |
| `--phosphor-green: #4AFF8C` | (not in palette) | ❌ invented, remove |
| `--neon-cyan-core: #00F3FF` | (not in palette) | ❌ invented, remove |
| `--frog-green: #4A7A2E` | `peat_05 #1A2A1A` | ⚠️ close but should match |
| `--ember-amber: #D4AF37` | `embers_01 #D4AF37` | ✅ correct |

**The "phosphor green" used in Act 1 loading bar and CTA pulse** — the
board doesn't have a phosphor-green in the palette. Two possibilities:

- **(a)** The "phosphor green" tone in the campfire/CTAs is actually a
  brighter version of `peat_05` (e.g. a `peat_03 #2A4A2A` highlight),
  not a separate color.
- **(b)** The board's "phosphor green" description refers to a TONE that
  emerges from the swamp scene's lighting (peat mixed with spectrum
  under emissive fire) rather than a literal CSS color.

**[ ] Yeray: which one is it? Or is there a separate green we should add
to the palette?**

---

## 5. PRICING & POSITIONING

> **"$8,500 – $12,000"**

That's the visible range. But the **Our Value** bubble says:

> **"Anura Systems is not an agency. It is a gate. Our first 1-2 projects
> are $4,000–$5,000 as we build our case studies. Then we look toward
> $8,500+. And then higher. Respect is not requested. It is naturally
> present when value is clear."**

So the pricing has three phases:

| Phase | Price | Purpose |
|---|---|---|
| **First 1-2 projects** | $4,000–$5,000 | Build case studies. Seed portfolio. |
| **Standard offer** | $8,500+ | The "real" pricing tier. Where the business lives. |
| **Higher** | Negotiated above $8,500 | Reputation allows. |

> **"Anura Systems is not an agency. It is a gate."**

This is a positioning statement. We're not a service provider — we're a
**filter**. Clients apply to enter; we let in only those we judge
worthy. The Application Gate is the literal mechanism of this positioning.

**Misalignments I had baked in:**

| I had | Board says | Status |
|---|---|---|
| $8,500 / $12,000 / $15,000–$30,000 (four tiers) | $4–5k seed → $8.5k+ standard | ❌ I invented tiers II/III/IV |
| "faceless digital architecture studio for top 1% physical craftspeople" | (right spirit, but) "faceless digital architecture studio that builds immersive, 60fps worlds for the top 1% of physical craftsmen" | ⚠️ mostly correct wording |

---

## 6. THE PACKAGES AND TIMES

> **"The Packages and Times"** — section header on the board. The contents
> of this bubble are partially visible. Reconstructed from context:

| Phase | Days | What happens |
|---|---|---|
| **Extraction Day 1–3** | 3 | First 72h. Discovery call, scope lock, intake. |
| **Prototype Day 4–14** | 11 | Build the prototype / first interactive. |
| **Edge Run Day 14–21** | 7 | Hardening, edge cases, polish. |

Total cycle: **~21 days per project** at the $8,500+ tier.

**[ ] Yeray: confirm the three phases above match the board. The exact
contents of the "Packages and Times" bubble are partially obscured in the
PDF export.**

---

## 7. TEAM EMAILS — THE OPERATING STRUCTURE

This is the canonical split of labor:

| Alias | Role | Managed by |
|---|---|---|
| `director@anura.systems` | Client-facing strategic lead. LinkedIn, onboarding, contract signatures, strategic updates. | **Daria** |
| `ops@anura.systems` | Systems/backend. Software platform notifications, task trackers, data scrapers, raw code updates. | **Yeray** |
| `anura.systems@proton.me` | Catch-all / general inbox. | (shared) |

**This is the actual role split.** Not "she does brand, you do code."
**She is the client-facing director. He is the systems operator.** This
matters because:

- Client-facing communications (LinkedIn DMs, contracts, onboarding
  emails) all flow to Daria via `director@`.
- All platform alerts (GitHub, Vercel, cron job failures, data scraper
  results) flow to Yeray via `ops@`.
- General inquiries land in `anura.systems@proton.me`.

The site's intake form should probably route to **`director@`** (it's the
first human point of contact for prospects), not the catch-all.

**Misalignments I had baked in:**
- I'd written code as if Yeray was the sole operator handling
  everything. The split is real and the system's communications should
  reflect it.

---

## 8. THE PILLARS (from the board)

The board has **5 dark-red bubble pillars** anchoring the right side of
the canvas:

| # | Pillar | Source verbatim |
|---|---|---|
| 1 | **THE CORE IDEA** | "A new wave of craft emerges…" (full quote in §1) |
| 2 | **THE VISUALS** | "The brand is set in a swamp, around an active campfire, at night…" (full quote in §2) |
| 3 | **$8,500 – $12,000** | (see §5) |
| 4 | **THE PACKAGES AND TIMES** | (see §6) |
| 5 | **OUR SOCIALS** | Empty on the board — to be filled |

**[ ] Yeray: Our Socials section is empty. Tell me when you decide what
goes there. (Instagram, LinkedIn, cold outreach — all to be designed.)**

---

## 9. ANURA SYSTEMS VALUES (from the board)

> **"Strategic Clarity / Operational Speed / Calibrated Trust"**

Three value statements. These are how Anura **describes itself
internally** — they're not necessarily the marketing copy but they
anchor the voice.

- **Strategic Clarity** — we know what we're doing and why. No
  exploration-for-its-own-sake. The work has direction.
- **Operational Speed** — we ship. We don't sit on tickets. The
  turnaround is part of the value.
- **Calibrated Trust** — we trust our process, the client trusts us,
  calibrated to the actual relationship. Not blind trust, not
  surveillance.

> **"Quiet operation with async windows"** — communication cadence is
> 12PM and 5PM. **Asynchronous by default.** The brand doesn't ping you
> 20 times a day.

This is the **opposite** of the "scanning applicant credentials / command
input box" sci-fi terminal voice I wrote into the gate. The board's
voice is **premium craft with quiet operations** — not cyberpunk
surveillance.

---

## 10. BRAINSTORM (page 4 of the board)

> **"GOTTA — Daria writes the scripts / Yeray builds the systems"**

The division of creative labor is locked:
- **Daria** writes all the scripts (marketing copy, intake
  questionnaires, social posts, contract language, CTA copy).
- **Yeray** builds all the systems (the website, the intake form, the
  cron jobs, the integrations, the deployment).

This means I should **not write copy**. I should write systems that
**render Daria's copy**. When copy is missing, the system should render a
clear placeholder, not my interpretation of "what feels right."

> **"I protect the gate. I protect the calm. I protect the equity. I do
> not chase. I attract."**

This is the brand's positioning in one line. **It's a statement of
stance, not a feature list.** It tells us:

- Gatekeeping is the explicit business model.
- Calm is the product.
- Equity (built value over time) is the goal.
- We don't chase clients — clients find us.

That last line is important. **The website is not a sales funnel. It's
a filter that lets the right people self-select in.**

> **"Anura Systems works the way this forest grows — slowly, in layers,
> with attention to what the eye cannot see at first glance."**

(See §2 — this is also the manifesto closer.)

---

## 11. THE QUESTIONNAIRE SCRIPT (partially filled on the board)

The board has the start of an intake questionnaire. Visible questions:

1. **"What is your website URL?"**
2. **"What do you build, craft, or deliver?"**
3. **"If your digital home could feel like anything, what would that
   be?"**

More questions likely exist on the board but weren't legible in the
PDF export.

**[ ] Yeray: send the full questionnaire text — even a phone photo of
the board will do.**

---

## 12. WHAT'S NOT ON THE BOARD

These sections have **headers but no content**:

- **INSTAGRAM** (empty)
- **LINKEDIN** (empty)
- **COLD OUTREACH** (empty)

These are distribution channels that haven't been designed yet. Per §10
("we don't chase, we attract"), cold outreach is philosophically
tension. Need a decision: do we have a cold-outreach program or not?

**There's also a pasted Q&A block at the bottom of page 4** that looks
like it's from another document (possibly an investor brief, internal
FAQ, or AI-conversation transcript about Anura). I haven't read it
because I can't tell if it's source-of-truth or context.

**[ ] Yeray: what is the pasted Q&A at the bottom of page 4? Should I
treat it as canonical, or is it scratch / pasted context?**

---

## 13. MISTAKES I MADE — AUDIT

These are things I had wrong before this board arrived. Each one is a
flag for re-decision, not "fix automatically":

| # | What I did | What the board says | Fix |
|---|---|---|---|
| 1 | Used **Oswald + Share Tech Mono + Inter** | PP Neue Montreal + JetBrains Mono + Commit Mono | Refactor `style.css` font imports. Need to source fonts (paid). |
| 2 | Used `--void-000: #0D0F12` | `#080808` | Swap CSS variable. |
| 3 | Used `--mist-100: #1A1D24` | `#1C1E21` | Swap CSS variable. |
| 4 | Invented `--neon-cyan-core: #00F3FF` | (not in palette) | Remove. |
| 5 | Invented `--phosphor-green: #4AFF8C` | (probably a peat tone, see §4) | Decide with Yeray. |
| 6 | Built $8.5k / $12k / $15k–$30k tier ladder | $4–5k seed → $8.5k+ standard | Re-price the pricing block. |
| 7 | Wrote copy in cyberpunk-terminal voice ("scanning applicant credentials") | Voice is "quiet operations / premium craft / calm" | Rewrite all copy. Wait for Daria's scripts. |
| 8 | Built the Yeri character (317k tris humanoid) into the project | "No people — only the frog guide" | Yeri is NOT used on the public site. May still have a private/internal use case. |
| 9 | Set `body { overflow: hidden }` and assumed we own scroll | Board doesn't comment on UX, but the "campfire awaits arrival" framing implies a more inviting feel | Maybe revisit. No change yet. |
| 10 | Refactored the website incrementally, ~20 commits over days | Board implies a more deliberate, sectioned build | Restart the build in sections, not continuous. |
| 11 | Made tone-mapping aggressive, exposure 1.7–1.85, bloom heavy | "Dark green and lively" implies restraint | Dial back to natural light, let the brand not the bloom do the work. |

---

## 14. WHAT TO DO NEXT (in order)

1. **You read this doc.** Mark up anything wrong. Add anything I missed.
2. **You answer the four `[ ]` flags** in §4, §6, §8, §11, §12.
3. **You confirm the 11 items in §13** — which are mistakes to correct,
   which were good guesses, which are still open.
4. **We lock the vision doc.** Once you say "yes, this is it," this
   becomes the source of truth that any future build session reads.
5. **We rebuild in sections** — not the whole site at once. Each section
   gets: research (if needed) → spec → design (you) → build (me) →
   verify → ship.

---

*Last updated 2026-06-18. All quotes verbatim from the Miro board export
unless marked `[ ]` for your review.*