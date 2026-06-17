# [ANURA.] SYSTEMS

> Single-page 3D cinematic experience. A persistent dark swamp forest you scroll through, with a CRT gate, parallax camera, and clickable hotspots revealing the studio's story.

## Stack

- **Vite 5** — build & dev server (port 9090)
- **Three.js r0.160** — WebGL renderer, scene graph, post-processing (OutlinePass + FXAA)
- **GSAP 3.12** — animation library (ready for text animations; not yet used)
- Vanilla ES modules — no React/Vue, no build step beyond Vite

## Run locally

```bash
npm install
npm run dev
# → http://localhost:9090
```

## Project layout

```
/root/projects/anura-systems/
├── index.html               Entry. CRT gate, world canvas, HUD, modal.
├── package.json             Three, GSAP, Vite.
├── vite.config.js           Port 9090, base './'.
├── public/
│   ├── favicon.ico
│   ├── frog_sprite_sheet.png   Used by gate preloader.
│   └── debug.html           JSON state dump (dev only)
└── src/
    ├── main.js              Orchestrator. Boots renderer, scene, systems.
    ├── style.css            Single source of truth. Brand tokens, gate, HUD, modal.
    ├── core/
    │   ├── Camera.js        Scroll-driven CatmullRomCurve3 path + mousemove parallax.
    │   └── Hotspots.js      Raycaster + OutlinePass + modal.
    └── scene/
        └── World.js         Procedural forest, mushrooms, campfire, frog, stars.
```

## The user journey

1. **Act 1 — The Gate.** CRT scanlines + flickering phosphor-green loading bar. Frog sprite cycles. Phrases: STANDBY → AWAITING_CREATOR → CALIBRATING_FOREST → WARMING_EMBERS → GATE_OPEN.
2. **Act 2/3 — The Drift.** Scroll the wheel. Camera moves along a 5-keyframe curve through the dark green forest. Mouse moves cursor → camera parallax ±10° (yaw) / ±6° (pitch), dampened.
3. **Act 4 — The Sanctuary.** Camera arrives at the campfire. Click hotspots (campfire, frog, mushroom, hanging-moss tree) to reveal manifesto copy in a phosphor-green modal.
4. *(CTA + application form TBD)*

## Brand DNA (locked)

| Token | Value | Use |
|-------|-------|-----|
| `--void-000` | `#0D0F12` | Background, fog |
| `--mist-100` | `#1A1D24` | Cards, surfaces |
| `--phosphor-green` | `#4AFF8C` | UI accents, hover outline, scroll hint |
| `--ember-amber` | `#D4AF37` | Campfire, ember CTAs |
| `--neon-cyan` | `#00F3FF` | Mushroom glow, CRT screen |
| `--frog-green` | `#4A7A2E` | Frog body, moss |
| Display font | Oswald 500/700 | `[ANURA.]` wordmark |
| Mono font | Share Tech Mono | Gate UI, HUD readouts |
| Body font | Inter 300/400/500 | Modal copy |

## Deploy to Vercel

### One-time setup

1. Go to https://vercel.com → Sign in with GitHub (`333yeri`)
2. Click **"Add New Project"**
3. Import `333yeri/anura-systems`
4. Vercel auto-detects Vite — confirm:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
   - **Install Command:** `npm install` (default)
5. Click **Deploy**

### After first deploy

1. **Settings → Domains** → add `anura.systems` (and `www.anura.systems`)
2. Vercel shows the DNS records to add at your registrar:
   - For apex (`anura.systems`): `A @ 76.76.21.21`
   - For `www`: `CNAME www cname.vercel-dns.com`
3. Update DNS at your domain registrar (Cloudflare / Namecheap / etc.)
4. SSL certificate auto-issues once DNS propagates (5–30 min)

### Continuous deployment

Every push to `master` triggers a production deploy automatically. Preview deploys fire on every PR.

### Manual deploy via CLI (optional)

```bash
npm i -g vercel
vercel login              # one-time
vercel link               # link local repo to Vercel project
vercel                    # deploy preview
vercel --prod             # deploy to production
```

### Domain troubleshooting

- DNS not propagating? `dig anura.systems` to check
- Vercel showing "Invalid Configuration"? Wait 30 min for DNS, then **Refresh** on the Domains page
- Want to redirect old URLs? Add a `vercel.json` rewrite — currently no rewrites configured

## Performance budget

- ~12,700 triangles total (well under the 30k target)
- 200 fire particles (GPU `Points`, no triangle cost)
- 200 stars (GPU `Points`)
- 72 instanced trees + 36 instanced mushrooms (1 draw call per layer)
- Target: 60fps on a 2020-era laptop with integrated graphics

## What's not done yet

- [ ] GSAP text animations on the journey (waiting on copy placement decision)
- [ ] Real GLTF frog model (currently low-poly placeholder)
- [ ] Audio (forest ambience, gate hum, fire crackle)
- [ ] Mobile responsiveness (current build assumes desktop pointer)
- [ ] Application form for the CTA at the sanctuary
- [ ] Domain `anura.systems` DNS wired up (Vercel side ready)

## Local testing shortcuts

- **Force-skip the gate:** in browser console, run `document.getElementById('loading-gate').classList.add('dismissed')`
- **Inspect scene state:** load `http://localhost:9090/debug.html` — dumps scene children, fog, lights, camera, progress as JSON overlay
- **Reload Vite without full refresh:** `r` in the browser triggers HMR

## License

Proprietary. © Anura Systems.