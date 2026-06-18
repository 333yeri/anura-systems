# Anura Systems — Project Context

Auto-loaded by Hermes / Cursor / any agent working in this directory.
Read this first; do not re-derive from MEMORY.md or past transcripts.

## What this is

Single-page 3D cinematic canvas at **anura.systems**. Faceless digital
architecture studio targeting the top 1% of physical craftspeople (hedge
funds, family offices, premium brands). Pricing tiers: $8,500 / $12,000 /
$15,000–$30,000. Lead-gen site, not a portfolio.

Brand DNA: Swiss Brutalism × ancient swamp × CRT hacker terminal.
The aesthetic reference is **CS:Source / CS:GO / CS2** — realistic
proportions, sharp PBR materials, gritty moody atmosphere, baked
lighting feel. **NOT Roblox. NOT low-poly fantasy.**

## Stack (do not change without explicit user approval)

- **Three.js vanilla** r0.160 — NOT R3F, NOT Babylon
- **GSAP** 3.12 — installed but not yet integrated
- **Vite** 5 — dev server on port 9090, `npm run build` → `dist/`
- **Vanilla ES modules**, no React, no TypeScript
- **Vercel** — auto-deploys from GitHub master branch
- **GitHub** — `333yeri/anura-systems`, master branch, pushed

## Architecture

- **Single persistent `THREE.Scene`** — one camera, one world. No scene breaks.
- **Scroll-driven camera** along `CatmullRomCurve3` with 5+ keyframes
  (`src/core/Camera.js`)
- **Cursor parallax** ±10° yaw / ±6° pitch, dampened lerp
- **Hotspots** — raycaster on prop meshes, `OutlinePass` outline glow on
  hover (no scale — keeps cinematic feel), pointer cursor
  (`src/core/Hotspots.js`)
- **Loader gate** with CRT phosphor aesthetic — dismisses on
  `anura:gateComplete` event, 6s fallback timeout (`src/main.js`)
- **HUD** overlay (Oswald + Share Tech Mono) — brand mark, scroll hint,
  progress bar
- **NO Act 5** — application form is HTML overlay over canvas at
  sanctuary, not a route change

## File map

```
/root/projects/anura-systems/
├── index.html                 entry; debug iframe trick for headless inspection
├── src/
│   ├── main.js                orchestrator: renderer, scene, gate, animation loop
│   ├── style.css              12k brand-locked styles, palette + fonts
│   ├── scene/World.js         procedural + GLB forest, swamp water, lighting, fog
│   └── core/
│       ├── Camera.js          CatmullRomCurve3 path + parallax (touch + wheel)
│       └── Hotspots.js        raycaster + OutlinePass + EffectComposer
├── assets/models/             GLBs: tree.glb (20k tris), yeri.glb (317k tris), yeri_skeleton.glb (9.5k)
├── public/                    debug.html, yeri-test.html, tree-test.html (dev probes)
├── research/awwwards-audit.md full 38KB Awwwards-tier reference for visual quality
├── backups/                   pre-redo archives (do not modify)
└── CLAUDE.md                  this file
```

## Brand palette

```
--void-000       #0D0F12   page background, void
--mist-100       #1A1D24   HUD surface
--spectrum-white #FFFFFF   never used pure; use 90-95% opacity
--phosphor-green #4AFF8C   neon CTA, frog guide, ACT 1 loading bar
--ember-amber    #D4AF37   fire light, accent
--neon-cyan      #00F3FF   mushroom glow, terminal scanlines
--frog-green     #4A7A2E   organic dark green (canopy tint)
--moss-dark      #1F3A1A   ground reference
--moss-deep      #14271A   ground vertex tint
--rock-grey      #2A2A26   rock slab reference
```

**Typography:** Oswald (display), Share Tech Mono (mono), Inter (body).
Fallback stack: Impact, system-ui. No additional fonts without approval.

## Current state (live)

| Element | Status | Notes |
|---|---|---|
| Camera path | ✅ working | 5 keyframes, scroll-driven, parallax |
| Touch + wheel input | ✅ working | iOS/Android + desktop |
| Gate dismissal | ✅ working | CRT phosphor, 6s fallback |
| GLB trees (10 placed) | ✅ working | bark tufts + moss rocks at base |
| Procedural fallback forest | ✅ hidden when GLB loads |
| Sky dome | ✅ working | gradient + moon disc shader |
| Ground fog | ✅ working | FBM noise drift |
| Swamp water | ✅ working | ripple + moon streak shader |
| Cypress knees | ✅ working | 80 instanced cones |
| Cattails | ✅ working | 24 clusters |
| Mud patches | ✅ working | irregular geometry, ~50 patches |
| **Yeri character** | ❌ **NOT integrated** | 317k tris, placement TBD |
| **Hotspot labels / modals** | ❌ **empty modals** | spotlights work, copy is TODO |
| **Camera curve at 60%** | ❌ **straight path** | user wants curve right so sanctuary hidden until late |
| **GSAP text animations** | ❌ **not wired** | installed, awaiting position decisions |
| **UnrealBloomPass** | ❌ **missing** | **Tier-1 ROI from audit, do next** |
| **Performance pass** | ❌ **not done** | phone FPS unmeasured |
| **Vercel OAuth** | ❌ **user must do** | vercel.com/new → import 333yeri/anura-systems |

## Headless screenshot caveat

**The VPS has swiftshader (no GPU).** `chromium --headless` produces
near-black output for this scene. Don't trust local screenshots.
Real verification requires:
- User opens `https://anura-systems.vercel.app/` in their browser, OR
- User opens `http://localhost:9090/` via SSH tunnel, OR
- Deploy preview URL after each commit (Vercel does this automatically)

## Recent commits (master)

```
e467b4e fix mobile scroll: add touch event listeners + touch-action: none
cad62da swamp rebuild: standing water + cypress knees + cattails
bc875d7 cinematic dressing layer: sky dome + ground fog + bark tufts
867f7fe moonlight + IBL: PBR trees now read cinematic, not cartoon
63f13b2 merge subagent outputs, GLB tree integration
```

## User collaboration rules (from memory + sessions)

- Prefers concise 2-3 sentence messages, direct, action-oriented
- YOLO mode (no approvals) once direction is set
- "First draft is good, we will work on it detail by detail" — assistant
  does the coding, user does creative direction
- Doesn't want AI corporate filler. No "I'd be happy to help!"
- Visual fidelity is non-negotiable — would rather rebuild than ship
  something that looks "low poly like 5 triangles"
- Asks questions in batches; user thinks creatively, assistant executes
- Telegram is the comms channel; voice messages transcribed
- OpenRouter free (owl-alpha) is primary model; VPS has limited RAM so
  no local models

## Outstanding pending questions

1. **Yeri placement** — sitting on log / leaning against hanging-moss
   tree / standing by campfire? And tri budget (use 317k as-is,
   `yeri_skeleton.glb` at 9.5k plain, or decimate to ~30k)?
2. **Camera path curve at 60%** — curve right so campfire isn't
   directly visible until user scrolls there
3. **Per-Act bloom/exposure tuning** — after we wire it to progress,
   does each Act feel right?

## "Don't do this" list

- Don't suggest React, R3F, or other frameworks — vanilla Three.js only
- Don't suggest Vite v7+ — we use v5, no upgrade pressure
- Don't rebuild the trees without explicit user ask — they were given
  as assets, not for replacement
- Don't add hover `scale` to hotspots — we use outline glow to keep
  cinematic feel
- Don't enable email-sending — user keeps that manual (per their
  memory profile: "doesn't give Hermes email-sending")
- Don't fabricate plugin/code installs that didn't happen — verify
  with `npm ls` / `cat package.json` first
- Don't trust local headless screenshots on this VPS — see caveat above