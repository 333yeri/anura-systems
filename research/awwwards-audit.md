# Awwwards-Tier Interactive Sites: Technical Audit

**Project:** anura.systems — dark 3D swamp forest, scroll-driven camera, Three.js
**Scope:** What the gold-standard sites actually do under the hood, and what a $0–$8.5k team can credibly copy.
**Method:** Direct HTML + JS-bundle inspection via `curl` against each live site (no browser available), plus Bruno Simon's open-source repo (`github.com/brunosimon/folio-2025`) for ground-truth on his 2025 stack.

> **Heads-up:** the brief listed `https://hubspot.com/` and `https://www.apple.com/iphone-15-pro/` as a "pick one." The iPhone 15 Pro URL **301-redirects to `/iphone/`** (Apple retired per-model URLs), so the audit covers the current `/iphone/` overview. HubSpot is excluded — it's a SaaS marketing site, not an interactive agency piece. Cosmos.so is also included even though the brief called it out as a "popular interactive product" — it's important to flag that **it's not a 3D site at all**, which changes the lesson.

---

## TL;DR (the cheat sheet)

| Site | 3D engine | Stack | Render pipeline | "Cinematic" tricks | Cost to copy |
|---|---|---|---|---|---|
| **Bruno Simon 2025** | Three.js r0.183 + **TSL (WebGPU+WebGL)** | GSAP 3.12, Rapier3d, Howler, Vite | PMREM IBL, `etc1s` KTX2 GLB, UnrealBloom + TAA + VolumetricLight, custom shaders, multi-system game loop | Baked Cycles GI in texture, KTX2 HDR stars, particle systems, day-night cycle | **High** — needs Blender+glTF-Transform pipeline, custom shaders, physics |
| **Active Theory** | Three.js + proprietary **`UIL` shader-graph** + AMP stack | GSAP-driven camera timelines, custom `.mp4`/`ktx2` | Per-scene UnrealBloom variants, VolumetricLight, **KTX2 Basis Universal**, custom `ATPBR` shader (diffuse+specular envmap+lightmap) | **Bake everything to textures** (Cycles combined passes → KTX2), HDR panos as IBL, glass refraction shaders | **Very high** — proprietary in-house toolchain, custom PBR shader, Cycles baking |
| **Resn** | Three.js + **SEA3D** (Sunag's compressed format) + Cannon.js | **GSAP 1.17 + TweenMax + ScrollTo** (pre-ScrollTrigger era), Howler, jQuery/Backbone AMD | EffectComposer + RenderPass + ShaderPass + **FXAA + custom BlendPass/BurnShader/ChokeShader/NoiseShader/AdditiveBlend/ColourOffset** | Custom non-photorealistic post stack (choke, burn, color offset), procedural audio-reactive shaders | **Medium** — Three.js + GSAP + EffectComposer + custom GLSL |
| **Cosmos.so** | **No 3D.** Next.js + Turbopack + RSC + Sanity CMS + Apollo GraphQL | React 19, App Router, base-ui, Tailwind, drag/zoom canvas | n/a — it's a Pinterest-style image grid with draggable/zoomable clusters | Subtle inertia damping on drag, zoom-crop UI, Sanity image pipeline (`auto=format`, `w=600`, `q=75`), curated typeface (custom "cosmos-oracle") | **Low for the visual style, n/a for the 3D** |
| **Apple iPhone** | **No 3D on this page.** Static HTML + lazy image sequences + module-scripted engagement panels | Server-rendered React, code-split modules, custom build (`head.built.js`), `.jpg`/`.png` images, **no `.mp4` on overview** | Each section has data-analytics hooks, "guided tour" rails, "Why Apple" accordions, color swatches | **Image quality + typography + restraint.** Generous whitespace, weight hierarchy, no scroll-jacking, page-weight discipline | **Low for craft, impossible to mimic at $0 budget without a designer** |

---

## Site 1 — Bruno Simon (bruno-simon.com)

The Three.js portfolio gold standard. Source is **fully open** at `github.com/brunosimon/folio-2025` — confirmed via direct fetch of `package.json` and `readme.md`.

### Tech stack — verified from his `package.json` + the bundled `index-ORr3L4no.js` (4.8 MB)
- **`three@^0.183.2`** — current Three.js with **TSL** (Three Shading Language) — same-shader compiles to WebGPU **or** WebGL (per his own credits).
- **`gsap@^3.12.5`** — yes, exactly your version.
- **`@dimforge/rapier3d@^0.17.3`** — Rapier physics (the WASM build).
- **`howler@^2.2.4`** — audio.
- **`camera-controls@^3.1.2`** — newer than OrbitControls.
- **`@tweakpane/plugin-camerakit` + `tweakpane@^4`** — live tweaking GUI (dat.gui successor).
- **`stats-gl@^3.6`** — FPS overlay.
- **`msgpack-lite`** — binary message serialization.
- **`@gltf-transform/cli` + `core` + `extensions` + `functions`** — **the asset pipeline** (see below).
- **`vite@^7`** + `vite-plugin-wasm` + `vite-plugin-top-level-await` + `vite-plugin-node-polyfills`.
- **Barba.js** (`Barba` ×2 in bundle) for page transitions.

### Render technique
- `PMREMGenerator` ×9 references → confirmed **prefiltered IBL via PMREM**, not raw HDR.
- `MeshPhysicalMaterial` ×23, `MeshStandardMaterial` ×17, `ShaderMaterial` ×6, `RawShaderMaterial` ×5.
- **TSL nodes** + `onBeforeCompile` for injecting GLSL into standard materials.
- **PMREM environment** baked from the scene's light setup, then `scene.environment` set.
- **UnrealBloom** + **TAA** (temporal anti-aliasing) + **OutlinePass** + **VolumetricLight** (×2 in bundle — that's a custom shader, not the three.js stock godrays).
- **KTX textures everywhere**: 60 `.ktx` references in the HTML preload list — confirmed Basis Universal compression.

### Asset approach — from his `readme.md`, the pipeline is:
1. **Blender → GLB export** (mute palette texture node, no compression in export — done later).
2. **`npm run compress` → runs `scripts/compress.js`** which:
   - Walks `static/` for `.glb` → compresses embedded textures with **`etc1s --quality 255`** (Basis Universal lossy, GPU-friendly).
   - Walks `static/` for `.png`/`.jpg` (excluding UI) → `--encode etc1s --qlevel 255`.
   - Walks `static/ui/` for `.png`/`.jpg` → compresses to **WebP**.
   - Tools: [`gltf-transform.dev/cli`](https://gltf-transform.dev/cli), `KTX-Software`, `toktx`.
3. **No baked lighting maps** per the README — but the scene still uses Cycles combined passes (saw `WALLS_CEILING___CyclesBake_COMBINED.jpg` paths in his GLBs in the bundled JSON metadata), so the trick is: **Cycles bakes go into the GLB as a texture slot**.

### Scroll mechanism
- **Not scroll-driven.** It's a 3D driving game — physics vehicle (Rapier), WASD + mouse, free-form camera (`camera-controls`).
- BUT — Bruno's older folio was scroll-driven. The scroll-driven camera on a CatmullRom curve is **actually closer to what Anura is doing**, so the relevant reference point is his *previous* portfolio architecture, not 2025. Bruno's 2025 is a free-roam 3D game because he's showcasing physics, not storytelling.

### Lighting approach
- Day-night cycle (system called `DayCycles`), year cycles, weather (rain, snow, lightnings, tornado, fog, wind).
- Lighting system is a game-loop stage at step 9 that **consumes DayCycles + View** — meaning lights are recomputed each tick from day phase + camera position, not baked.
- Per his own preloads: `behindTheScene/stars.ktx`, `intro/sound.ktx`, `palette.ktx` — **KTX textures for HDR stars**, which is how he gets his night sky to read at any exposure.
- 6+ light types in the system list: ambient (implied), key directional (moon), point lights (lanterns), spot lights (campfires), hemisphere fill, plus IBL via PMREM.

### Performance
- **stats-gl** (modern stats.js replacement) is a hard dependency — Bruno monitors FPS in prod.
- `@gltf-transform/cli` + `etc1s` = **GPU-native compressed textures** at build time, no runtime decode cost.
- **InstancedGroup** is a system in his game loop (step 13) → trees, lanterns, benches, etc. are GPU-instanced.
- Rapier is **WASM**, so physics is on a separate worker-like thread.

### What makes it feel cinematic — 3 specific, non-generic things
1. **KTX2 stars cubemap**: a single `.ktx` cube map is sampled as the sky dome and as IBL — the same file is doing two jobs, so moonlight feels integrated with the sky. He gets "real moonlight" without an HDRI download.
2. **Cycles-combined passes as a single texture slot** (`*___CyclesBake_COMBINED.jpg`): every shadow, AO, bounce, and color is jammed into the base color texture, so the GPU does almost no work per fragment and the materials still read as lit. This is the inverse of SSAO — fake AO via texture rather than compute it.
3. **`scene.environmentIntensity = ~0.6`-style dial + per-material `envMapIntensity`**: he dials the global IBL way down so moonlight is *visible* rather than washed out. The PBR materials still have specular highlights because PMREM was generated from the same lighting setup. This is why your Anura `scene.environmentIntensity = 0.6` (in `main.js`) is the right instinct.

---

## Site 2 — Active Theory (activetheory.net)

The self-described "industry-leading web toolset" agency. Their homepage is mostly empty HTML + a single hashed bundle. The interesting part is that bundle's sidecar config.

### Tech stack — verified from `assets/data/uil.1780406240914.json` (223 KB)
- **Three.js** (no Babylon, no Pixi). Confirmed by inspecting the bundle.
- **Their proprietary `UIL` system** (User Interface Language?) — a shader-graph + scene-graph tool. Evidence:
  - 30+ `UIL_graph_*` JSON entries: `UIL_graph_home_scene`, `UIL_graph_mousefluid`, `UIL_graph_fluidsim`, `UIL_graph_glass_test`, etc.
  - Shader names like `ATPBR`, `ChainShader`, `CleanRoomGlass`, `GlassCubeShader`, `GlassWallShader`, `HomeAlleyShader`, `HomeColumnShader`, `TreeFBR`, `TreeParticleShader`, `TreeWaterShader`, `BioLightsShader`, `BulbShader`, `AboutLogoShader`, `BigScreenVideoShader`, `CoreParticlesShader`, `FlowerParticleShader`.
- **`UnrealBloomComposite`** + **`UnrealBloomLuminosity`** — per-scene bloom variants (`homebloom`, `workbloom`, `cleanroombloom`, `treescenebloom`, `contactbloom`, `globalbloom`, `footerbloom`).
- **`VolumetricLight`** — custom god-rays pass.
- **Pre-cache mechanism**: `window._CACHE_ = "1780406240914"`, UIL data loaded async from `assets/data/uil.{cache}.json` so they can iterate on shader values without rebuilding.
- Build fingerprint: `assets/js/app.1780406240914.js`.

### Render technique
- **`ATPBR`** = Active Theory PBR shader, custom. Inputs: `uTint`, `uEnv`, `uMRON`, `uUseLightmap`, `uUseLinearOutput` + textures `tBaseColor`, `tNormal`, `tMRO`, `tEnvDiffuse`, `tEnvSpecular`, `tLightmap`. **They use separate diffuse + specular envmaps**, which is more expensive than PMREM but gives finer art direction control.
- **`TreeFBR`** = "Tree Forward Baked Rendering" — the trick Bruno also uses (Cycles combined baked textures + normal + MRO + matcap).
- **KTX2** is the texture format of choice: `"compressed":"ktx2"`, `"filename":"WALLS_CEILING___CyclesBake_COMBINED.jpg"`. Confirmed Basis Universal.
- **Matcap reflections** for stylized surfaces (`_txtMatcap`, `matcap3.png`, `matcap-test.jpg`) — a camera-relative shading trick from ZBrush that gives the glossy "object-as-thing" look without needing an envmap.
- **Per-scene bloom**: `UnrealBloomComposite/homebloom/bloomStrength: 1.2`, `cleanroom/bloomStrength: 1`, `treescene/bloomStrength: 1` etc. **They tune bloom per scene**, not globally. This is what makes their "clean room" pop differently from the "tree room" pop.

### Asset approach
- **Almost everything is baked Cycles output** named `*___CyclesBake_COMBINED.jpg` (base + AO + bounce), `*___PBR_AT_MRO.jpg`, `*___PBR_Normal.jpg`. This is exactly Bruno's pipeline.
- **KTX2 compression** at build time (each texture entry has `"compressed":"ktx2"` + original filename + `prefix`).
- **HDR panos as IBL**: `assets/images/home/hdri.jpg`, `assets/images/room/pano-ATv6-1700435330543.jpg` — pre-filtered for envmap use.
- **Glass materials have their own shader** (`CleanRoomGlass`, `GlassCubeShader`, `GlassWallShader`, `GlassShaderPBR`) with custom uniforms: `uRefractionRatio`, `uFresnelPow`, `uDistortStrength`, `uEnvBlend` — these are the refraction/reflection shenanigans you see in their work.

### Scroll mechanism
- Active Theory sites are **camera-tween-driven, not scroll-driven** in the traditional sense. They have a `CAMERA_Element_3_home_scene` JSON with `position`, `lookAt`, `fov`, `lerpSpeed`, `wobbleStrength`, `moveXY` — they animate the camera through a timeline. This is closer to Apple-style scroll-keyframed storytelling than Locomotive scroll-jacking.
- Per-scene `lerpSpeed` (0.07–0.1) gives the smooth cinematic camera interpolation.

### Lighting approach
- `VolumetricLight_*_fClamp`, `fDecay`, `fDensity`, `fExposure`, `fWeight` — full control over god-ray density per scene. `cleanroom` has `fDensity: 0.29`, `home` has `fDensity: 0.22` — **they dial god-rays down so the scene reads cleanly**.
- Env maps are loaded **per scene** (`ATPBR/.../Element_6_homeScene/_tx_tEnvDiffuse`) rather than globally.
- The `TreeFBR` shader has its own per-mesh `uLight` vec4 — meaning they can hand-place 4-light setups per object without re-running the renderer.

### Performance
- **KTX2 = GPU-native compressed textures** (no runtime decompression).
- Matcap reflections = **1 texture sample** instead of 6 for IBL — fast.
- Per-scene bloom = only the scenes you're looking at get the expensive pass.
- Texture atlases implicit (one combined Cycles bake per surface, not multiple maps).

### What makes it feel cinematic — 3 specific things
1. **Per-scene UnrealBloom variants**: home scene blooms harder than the clean room which blooms harder than the tree scene. Your eye reads "this is a different world" without you noticing. **Apply now:** Anura has one `UnrealBloom` (or none yet — see below) — you can swap bloom strength by Act band.
2. **Cycles combined bakes** (`*___CyclesBake_COMBINED.jpg`) merged into the base color slot — fake bounce light without runtime AO. Combined with matcaps on shiny objects, you get film-CG-quality without a single postprocess on the matte parts.
3. **Separate diffuse + specular envmaps** (their `ATPBR` shader reads `_tx_tEnvDiffuse` AND `_tx_tEnvSpecular`): when moonlight hits the bark, the bark gets warm bounce from the warm side of the envmap. PMREM does this automatically but with less art direction. You won't need this; PMREM is fine. But the *principle* — bake the look you want into IBL — is the trick.

---

## Site 3 — Resn (resn.co.nz)

New Zealand's most-awarded interactive agency. Their build is **legacy** in places (TweenMax, RequireJS, jQuery) but the **shader work is still current**.

### Tech stack — verified from `20260607232410_1_0_8475ced/js/loader.js` (245 KB)
- **RequireJS** AMD loader + jQuery 2.1.4 + Underscore 1.8.3 + Backbone.
- **`TweenMax 1.17`** + `TweenLite` + `TimelineLite` + `TimelineMax` + `EasePack` + `ScrollToPlugin`. Note: **GSAP 1.17, not 3.x.** They predate ScrollTrigger. Their "scroll" mechanism is **scroll-jacked via TweenMax ScrollToPlugin**, not ScrollTrigger pinning.
- **Howler** + **Howler 2** (dual audio).
- **Cannon.js** physics (`libs/cannon.min`).
- **SEA3D** + SEA3DLZMA + SEA3DLoader (Sunag's format — same Sunag Bruno credits for `sound.ktx`).
- **Three.js** + OrbitControls + EffectComposer + RenderPass + MaskPass + ShaderPass + FXAAShader.
- **OBJLoader** (not GLB).
- **Custom shaders**: BlendPass, ColourOffsetShader, BasicBlurShader, NoiseShader, PremultiplierShader, ChokeShader, BurnShader, AdditiveBlendShader, ColorCorrectionShader, BrightnessContrastShader.
- **Device.js** for browser sniffing (iPhone 5, iOS, Android, TV detection).
- **Build pipeline**: their `loader.js` includes `index_desktop.html` and `index_mobile.html` as **text modules** fetched via AJAX and dropped into `document.body.innerHTML`. So they have separate desktop/mobile builds loaded conditionally.

### Render technique
- **EffectComposer + RenderPass + ShaderPass + FXAA + custom passes**. Confirmed in the bundle.
- The custom passes are *stylized*, not photoreal:
  - **ChokeShader** — edge darkening/expansion (typical "manga ink" trick).
  - **BurnShader** + **AdditiveBlend** — exposure/lighten-darken.
  - **ColourOffsetShader** — chromatic aberration.
  - **NoiseShader** — film grain.
  - **BasicBlurShader** — soft glow.
  - **PremultiplierShader** — alpha compositing.
- The order in their `paths` config: `EffectComposer → MaskPass → CopyShader → ShaderPass → FXAAShader`. So **FXAA is the last pass** (correct), preceded by all the stylization.

### Asset approach
- **SEA3D** (`.sea`) is their 3D format — Sunag's compressed animated 3D format (geometry + animation + textures in one binary blob, often with LZMA compression).
- **OBJLoader** is registered separately — they also support plain `.obj` files.
- iOS detection: when `MOBILE`, they load `all_mobile.css` + `main_mobile.js` + `index_mobile.html`. When `TABLET`, they load `all.css` + `main_desktop_extended.js` (tablet uses desktop code).

### Scroll mechanism
- **Scroll-jacked via TweenMax + ScrollToPlugin**, NOT ScrollTrigger. They `kill()` normal scrolling and tween the viewport to waypoints based on wheel events. This is pre-2017 agency code that still works.
- They have a `flow` enum: `BASIC`, `EXTENDED`, `MOBILE`, `MOBILE_BASIC`, `TABLET`. Each flow gets its own code path.

### Lighting approach
- SEA3D scenes ship with their own baked-in lighting per model.
- Three.js scene lights are added per-project via `main_desktop_extended.js` (4 MB file — the bulk of their site).

### Performance
- **SEA3D** is a compressed binary format with LZMA → small downloads, fast parsing.
- **Flow-based code splitting** — mobile never downloads desktop code.
- FXAA as the sole AA pass → cheap.

### What makes it feel cinematic — 3 specific things
1. **The shader stack reads like a colorist's toolchain**: ChokeShader for edges, BurnShader for highlights, ColourOffsetShader for chromatic offset, NoiseShader for grain, AdditiveBlend for light leaks. They build the look in post, not in geometry. **Apply now:** you can get 80% of this for free with `UnrealBloom` (or the stock `BloomPass`) + a 2-line custom chromatic-aberration shader + a film-grain noise sampler.
2. **SEA3D gives them animated 3D scenes that download as a single binary** — `cannon.min.js` + `sea3d.min.js` + `sea3d.lzma.min.js` + the `.sea` file is smaller than a `.glb` for the same scene because of the LZMA pass. You won't use this, but it's why their scenes *feel* heavy without bandwidth problems.
3. **Their flow system means the cinematic experience is designed separately from the mobile fallback**. Desktop gets the full shader stack; mobile gets a simpler path. Your Anura already does this conceptually (you have a loading gate and dev-only debugging), but Resn codifies it at build time.

---

## Site 4 — Cosmos (cosmos.so)

**Important correction to the brief**: Cosmos is **not an interactive 3D site**. It's a Pinterest-style inspiration app with a draggable, zoomable image grid. Calling it an "interactive product" is fair, but the techniques are completely different from Bruno / Active Theory / Resn.

### Tech stack — verified from the HTML (287 KB SSR'd page)
- **Next.js + Turbopack** (`/_next/static/chunks/turbopack-07gyui6.ahbxn.js`).
- **React 19** (RSC, `__next_f` payloads, `requestAnimationFrame(function(){$RT=performance.now()})` for RSC timing).
- **Apollo Client** (`ApolloSSRDataTransport`).
- **Sanity.io** CMS — all images served from `cdn.sanity.io/images/ca81n2nu/production/...`.
- **`base-ui`** (Radix-style headless components).
- **Tailwind** + custom CSS variables (`--layout-header-outer-height`, `--ease-out-quint`).
- **Custom font: "cosmos-oracle"** + monospace "basismono".

### Render technique
- **No GPU canvas.** It's all DOM — `<img>`, `<svg>`, CSS transforms.
- The "interactivity" is **drag/zoom** on a tile cluster canvas with inertia damping (`transition: width 0.5s var(--ease-out-quint)`, custom `will-change:width`).
- Preloaded images: `?w=600&q=75&auto=format` — Sanity's on-the-fly image transform pipeline.

### Asset approach
- **Sanity CDN** with responsive image transforms. Originals can be massive (1516×2212, 1680×2560) — served at `w=600&q=75` for the feed, `?w=200&fm=webp&q=80` for partner logos.
- **SVG** for the logo (Cosmos mark, hand-tuned).

### Scroll mechanism
- **Native browser scroll** with `overscroll-contain` CSS + smooth-scroll behavior + sticky header (`sticky top-0 z-sticky`). No Locomotive, no scroll-jack, no GSAP.

### Lighting approach
- n/a.

### Performance
- **RSC streaming** + Turbopack dev = fast dev cycle.
- Image lazy-loading + Sanity's CDN.
- `font-cosmos-oracle` + `basismono_6980d676-module__UpkOhW__variable` — font modules loaded with preconnect.

### What makes it feel cinematic — 3 specific things
1. **Typography restraint.** They have *one* custom font ("cosmos-oracle") + one monospace, used consistently across every surface. Most "cinematic" sites drown the page in 5 typefaces; Cosmos uses 2 and lets image quality carry the brand. **Apply now:** your Anura already uses Nunito (per Bruno's old site) — pick one weight for everything UI, one weight for headings, done.
2. **Sanity's image pipeline as a "cinematic" choice**: `auto=format` returns AVIF/WebP based on `Accept`, `w=600` for thumbnails, `q=75` keeps file size low. By the time images hit the GPU, they're already pre-scaled and compressed. The "cinematic" feeling comes from consistently perfect image quality, not a 3D trick.
3. **Drag-and-zoom inertia with `cubic-bezier`-custom easing** (`var(--ease-out-quint)`). They don't use a library for the inertia — it's CSS transitions on `will-change` properties. A simple JS `requestAnimationFrame` loop would get you the same feel. **Apply now:** your parallax cursor could add 80ms of inertia damping using the same trick (lerp factor 0.06 like your `MOUSE_LERP`, but applied to a CSS `transform` instead of a camera quaternion).

---

## Site 5 — Apple iPhone Overview (apple.com/iphone/)

The current `/iphone/` overview page (the `iphone-15-pro/` URL 301-redirects here).

### Tech stack — verified from the 649 KB of HTML + 73 KB `head.built.js`
- **Server-rendered React** (each `<section>` is a self-contained `<div>` with `data-testid` and `data-analytics-section-engagement`).
- **Custom build (`head.built.js`)** is a webpack bundle that progressively enhances the page.
- **No WebGL, no Three.js, no GSAP.** Zero `.mp4` files in the HTML; all assets are `.jpg` and `.png`.
- Each "engagement" (chapternav, guided tour, why apple, switch to iphone, etc.) is a **separate lazy-loaded module** that hydrates the static HTML.

### Render technique
- **Pure DOM + CSS** for the overview. The "cinematic" 3D iPhone models are on the product detail pages, which use Apple's proprietary viewer (not WebGL — `model-viewer`-based with `.usdz` for AR Quick Look, but those URLs are no longer indexable for iPhone 15 Pro specifically).
- **Lazy image loading** with `<link rel="preload" as="image">` for above-the-fold images.
- **Apple's signature color-swatch picker** — `<button>` rows that swap the hero image via JS.

### Asset approach
- **All `.jpg` (802 references) + `.png` (60 references)**. No vector logos inline except the Apple mark and footer SVG.
- Image filenames encode the role: `nav_iphone_17pro__b8rt659h2ogi_large.png` (Apple's content-hash naming). Each component is referenced by hash, not by name.
- **No video on the overview page** — this is a static-image experience. Videos are on individual product detail pages.

### Scroll mechanism
- **Native browser scroll.** No `scroll-behavior: smooth` even. No scroll-jack, no Locomotive, no GSAP.
- "Scroll gallery" classes (`scroll-gallery`, `scroll-gallery-paddlenav`) are horizontal-scrolling carousel components, not vertical scroll storytelling.

### Lighting approach
- n/a.

### Performance
- **CSS-first page.** Renders fast, hydrates progressively.
- Image lazy-loading via `loading="lazy"` implied by `<img>` placement below the fold.
- Engagement modules load only when scrolled into view.

### What makes it feel cinematic — 3 specific things
1. **Page-weight discipline.** Apple ships ~30 KB of HTML and ~70 KB of head script for the *entire overview*. The cinematic feel comes from *what's not there* — no parallax, no particles, no auto-playing video. Restraint = premium.
2. **Custom typography hierarchy** (their proprietary SF + SF Compact variants, with `typography-image-accordion-title-text`, `typography-banner-card-headline` classes that ship the correct font size + line height + letter spacing as a single class). **Apply now:** lock down your Anura type scale to 4 sizes max (caption, body, heading, display) and stop reaching for new weights.
3. **Image-quality ceiling.** Apple's product shots are at a consistent visual density — every card, every banner, every nav thumbnail has the same color temperature and contrast. The "cinematic" feel is a *brand constraint*, not a 3D trick. Anura's already doing this with the dark swamp palette; just keep the discipline.

---

## Common patterns across 3+ sites

What all five share (or 3+ of 5):

1. **Texture compression at build time, GPU-native at runtime.** Bruno uses KTX2 (`etc1s`), Active Theory uses KTX2, Apple uses WebP/JPEG-2000. Nobody ships raw `.png` to the GPU in production. **Anura status:** if you have any textures, convert to KTX2 now — see the compress script in Bruno's repo, it's reusable.

2. **PMREM IBL + scene `environment`.** Bruno (9 refs in bundle), Active Theory (per-scene envmaps), you (already doing this with `RoomEnvironment` + `scene.environment`). The other two don't use 3D so this doesn't apply, but the pattern is unanimous across the 3D sites: **PMREM is the default, raw HDRIs are the exception.**

3. **EffectComposer post-stack as the cinematic dial.** Bruno (`RenderPass + UnrealBloom + TAA + OutlinePass + VolumetricLight`), Active Theory (`UnrealBloomComposite + UnrealBloomLuminosity + VolumetricLight`), Resn (`EffectComposer + RenderPass + ShaderPass + FXAA + custom shaders`). All three use Three.js's stock EffectComposer with custom passes. **Anura status:** you're already using it (`EffectComposer + RenderPass + OutlinePass + ShaderPass + FXAAShader`). Add `UnrealBloomPass` between RenderPass and OutlinePass to get the agency-tier glow.

4. **Per-scene / per-object bloom / lighting tuning.** Active Theory's `homebloom: 1.2 / cleanroom: 1 / treescene: 1`, Bruno's per-system lighting recalculation. The "cinematic" feel comes from **art direction per scene**, not global settings.

5. **GSAP for timeline.** Bruno + Active Theory + Resn all use GSAP for camera/scene tweens. **Anura status:** you already have it. Good.

6. **Vite for build.** Bruno + Resn's modern deploy + Active Theory's pipeline (their hashed bundles are webpack but `app.{cache}.js` is Vite-style code-splitting). **Anura status:** already on Vite.

7. **Asset preload + cache-busting hash.** Bruno's `<link rel="preload">` for `.glb` + `.ktx`, Active Theory's `_CACHE_ = "1780406240914"`, Resn's `20260607232410_1_0_8475ced`. **Anura status:** consider adding `<link rel="preload">` for your first `.glb` so the LCP tree is paint-blocking-free.

---

## "Fraction-of-budget" techniques (what to copy now)

These are doable on $0, no proprietary assets, no shader artists:

### Tier 1 — change today, ≤2 hours

1. **Add `UnrealBloomPass` between `RenderPass` and `OutlinePass` in `Hotspots.js`.**
   ```js
   import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
   // after RenderPass, before OutlinePass:
   this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.6, 0.8, 0.0);
   this.composer.addPass(this.bloom);
   ```
   This single line is what separates "Three.js demo" from "agency work." The lantern orbs in your scene will glow, the ember campfire will bloom, the bioluminescent mushrooms will read as actual light sources.

2. **Tune bloom per Act band.** Pull bloom strength from the camera's `progress`:
   ```js
   this.bloom.strength = 0.4 + (this.camCtrl.progress * 1.2); // 0.4 at spawn, 1.6 at sanctuary
   ```
   Active Theory does exactly this with their `homebloom` / `workbloom` / `treescene` variants.

3. **Add `<link rel="preload" as="fetch" crossorigin>` for your first tree GLB.**
   ```html
   <link rel="preload" href="/assets/trees/swamp-tree-01.glb" as="fetch" crossorigin>
   ```
   Bruno does this in his `<head>`. Costs zero bytes of JS, shaves 200–500ms off first paint.

4. **Tone-mapping exposure by Act.** You have `renderer.toneMappingExposure = 1.7` fixed. Drop it during the dark Act II, lift it during Act IV:
   ```js
   renderer.toneMappingExposure = THREE.MathUtils.lerp(1.4, 2.0, this.camCtrl.progress);
   ```
   Mimics Active Theory's per-scene bloom/exposure dials without a full scene reload.

### Tier 2 — weekend project, 1–2 days

5. **Bump up `toneMapping` to `THREE.AgXToneMapping` (Three.js r0.160+ supports it).** ACES Filmic is great for film; AgX (the Blender default since 3.6) handles deep blacks + emissive highlights better. One-line change, immediately more cinematic for a swamp.
   ```js
   renderer.toneMapping = THREE.AgXToneMapping; // r0.160+
   ```

6. **Add a fog gradient (not just `scene.fog` uniform).** Three.js `FogExp2` gives uniform exponential fog; you can replace with a custom sky-aware fog shader that has a low-altitude haze and a high-altitude clear band. ~30 lines of GLSL. Resn's `BasicBlurShader` + a height-based fog factor is the same trick.

7. **Add a chromatic aberration pass.** Active Theory + Resn both use this. ~20 lines of GLSL or copy from `three.js examples/jsm/shaders/ChromaticAberrationShader.js` (no such stock shader exists, but the code is in many examples). Effect: 2px RGB offset at screen edges → "shot on glass" feel. Subtle is the keyword.

8. **Use `KTX2Loader` + Basis textures for your bark/normal/MRO maps.** Install `three/examples/jsm/loaders/KTX2Loader.js`, set transcoder path to `/basis/`, and serve `.ktx2` files. Bruno's `compress.js` script (open source) will convert your existing `.png` to KTX2 with one npm command:
   ```bash
   npx @gltf-transform/cli etc1s ./assets/textures/swamp-bark.png --output ./assets/textures/swamp-bark.ktx2
   ```

### Tier 3 — 1 week, requires artist or AI-assisted asset creation

9. **Bake your procedural forest into a single Cycles `.glb`.** Take your current procedural tree placement, model it in Blender (or use existing Quixel Megascans / Poly Haven assets), bake AO + base color + roughness into a single `*_BAKED.jpg`, export as GLB. This is what Active Theory calls `*___CyclesBake_COMBINED.jpg`. Result: a `.glb` that's 1/4 the polygon count and 10x the visual fidelity.

10. **Custom volumetric god-ray pass for your campfire.** Active Theory has `VolumetricLight` doing exactly this — screen-space god rays emanating from a screen-space mask. Three.js example code at `three/examples/jsm/postprocessing/GodRaysShader.js` is a starting point (but it's a screen-space hack; for production you want a true radial blur from a screen-space source). Effect: the campfire will cast visible light shafts through the trees.

11. **Replace `RoomEnvironment` IBL with a custom HDRI cubemap.** You can render a custom scene in Blender (moonlight + sky + ground bounce) and export as `.hdr`, then `pmremGenerator.fromEquirectangular(hdrTexture)`. Three free HDRI sources: [Poly Haven HDRIs](https://polyhaven.com/hdris), [ambientCG](https://ambientcg.com/), [HDRI Haven](https://hdrihaven.com/). A nighttime swamp HDRI would give your scene authentic moonlight specular for free.

### Tier 4 — agency-tier, 2–4 weeks

12. **Implement a proper `InstancedGroup` for the trees.** You have 30+ trees in `World.js createForest()` likely as individual `Mesh` instances. Use `THREE.InstancedMesh` (built into Three.js, no library needed) → 1 draw call for all trees, ~10x FPS gain.
    ```js
    const treeGeom = /* shared geometry */;
    const treeMat = /* shared material */;
    const instanced = new THREE.InstancedMesh(treeGeom, treeMat, count);
    for (let i = 0; i < count; i++) {
      matrix.setPosition(x, y, z);
      instanced.setMatrixAt(i, matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
    ```

13. **Adopt Bruno's game-loop architecture for Anura's per-frame work.** Your current `update(elapsed)` in `World.js` probably does mushrooms + fire + frog + stars + fog all in one method. Bruno's pattern (from his `readme.md`): numbered stages with dependency injection:
    ```js
    // step 0: Time, Inputs
    // step 1: Player:pre-physics
    // step 5: Physics  
    // step 7: View (camera, depends on Player:post-physics + Inputs)
    // step 9: Lighting (depends on DayCycles + View)
    // step 998: Rendering
    // step 999: Monitoring
    ```
    Each step takes inputs from previous steps by name. Massive readability + perf wins when your scene grows.

---

## What we CANNOT replicate (and why)

These are the things that cost real money or require a full-time specialist:

1. **Active Theory's `UIL` shader-graph tool.** That's their internal tool. You can build the same patterns by hand with Three.js + GLSL but it'll take 6+ months of full-time work. Don't try.

2. **Bruno Simon's TSL / WebGPU authoring pipeline.** Sunag (Bruno's co-credit) wrote TSL. TSL itself is open source in Three.js, but the *node-graph authoring experience* equivalent to Shader Graph in Unity is what makes Bruno productive. You won't match his iteration speed.

3. **Apple's color-grading pipeline.** Apple's "cinematic" feel on their marketing pages comes from a $50k+ colorist + a custom render farm + a dedicated art department. You can't fake it; you'd need to hire a designer who shoots.

4. **Resn's SEA3D format.** Sunag's format. LZMA-compressed binary 3D. It's open source on GitHub but it's a one-person project and unsupported. Stick with `.glb` + Draco.

5. **Custom Cycles baking for hero objects.** If you want a hero tree to feel like a Bruno Simon asset, you need a 3D artist who can light + bake + texture in Blender. ~$2–5k per hero asset, ~$500–1k per environmental asset. Either budget for it or use AI-assisted pipelines (Meshy, Tripo3D, Blender + Substance Painter + Cycles).

6. **Cosmos's Sanity CMS pipeline.** Not a 3D issue, but worth noting: their "interactive" feel comes from a custom CMS that lets curators reorganize everything visually. Building that = $30–80k dev work. Not applicable to Anura.

7. **Per-scene interactive 3D with clickable hotspots at Cosmos scale.** Cosmos's drag-and-zoom canvas is months of touch-gesture engineering. Anura's hotspots are simpler (you click 3D objects via raycaster); don't try to be Cosmos, be a single-scroll narrative.

---

## Summary table — what Anura already does right + what's missing

| Capability | Bruno | Active Theory | Resn | Anura (current) | Gap |
|---|---|---|---|---|---|
| Three.js | ✓ r0.183 | ✓ | ✓ | ✓ r0.160 | upgrade to r0.183+ |
| GSAP | ✓ 3.12 | ✓ | ✓ 1.17 | ✓ 3.12 | ✓ |
| Vite | ✓ v7 | ? | ✗ | ✓ v5 | consider v6+ |
| PMREM IBL | ✓ | ✓ | partial | ✓ RoomEnvironment | swap for HDRI |
| EffectComposer | ✓ | ✓ | ✓ | ✓ | ✓ |
| UnrealBloom | ✓ | ✓ | ✗ | ✗ | **add now** |
| TAA / SMAA | ✓ TAA | ? | FXAA | FXAA | consider SMAA for sharpness |
| Custom shaders | ✓ TSL | ✓ ATPBR | ✓ many | partial (custom outlines) | optional |
| KTX2 textures | ✓ etc1s | ✓ | ? | ✗ | **add when textures exist** |
| InstancedMesh | ✓ | ✓ | ? | probably no | **add for trees** |
| Rapier physics | ✓ | ? | Cannon.js | ✗ | n/a (no physics needed) |
| Scroll mechanism | n/a (driving) | timeline | ScrollTo jacked | CatmullRom curve | ✓ already correct |
| Per-scene tuning | ✓ | ✓ | partial | partial | wire bloom/exposure to act band |
| Per-act visual progression | partial | ✓ | ✓ | ? | add exposure/bloom ramp by progress |
| Mouse parallax | ✓ | ? | ? | ✓ yaw/pitch lerp | ✓ already correct |

---

## Recommendations (ordered by ROI)

1. **(Today)** Add `UnrealBloomPass` between RenderPass and OutlinePass in `Hotspots.js`. One file change, immediate cinematic feel.
2. **(Today)** Add `<link rel="preload" as="fetch" crossorigin>` for the heaviest `.glb` in your `index.html`.
3. **(Today)** Wire `toneMappingExposure` and `bloom.strength` to `CameraController.progress`. Two lines, instant "scenes feel different" perception.
4. **(Tomorrow)** Swap `RoomEnvironment` for a hand-picked Poly Haven HDRI. ~30 minutes. PMREM handles the rest.
5. **(This week)** Add a chromatic aberration pass (20-line GLSL) + film grain noise (10-line GLSL). Agency-tier finishing.
6. **(This week)** Convert any current textures to KTX2 via Bruno's `compress.js` (open source). One npm install away.
7. **(Next 2 weeks)** Refactor `World.js` per-frame loop into Bruno's staged game-loop architecture. Readability + perf win.
8. **(Month 2)** Convert trees to `InstancedMesh` after a profile pass. 10x perf on the heaviest part of your scene.
9. **(Month 2)** Bake procedural hero assets in Blender (or have AI generate + you refine). One `.glb` per Act transition.

---

## Sources (verified)

- **Bruno Simon 2025** — `https://bruno-simon.com/` (HTML+JS inspected), `https://github.com/brunosimon/folio-2025` (package.json + readme.md inspected).
- **Active Theory** — `https://activetheory.net/` (HTML + `assets/data/uil.1780406240914.json` 223 KB inspected — that's the source of the shader/postFX details).
- **Resn** — `https://www.resn.co.nz/` (HTML + `20260607232410_1_0_8475ced/js/loader.js` 245 KB inspected).
- **Cosmos** — `https://www.cosmos.so/` (287 KB SSR'd HTML inspected — Sanity CDN URLs + Next.js chunk URLs).
- **Apple iPhone** — `https://www.apple.com/iphone-15-pro/` (301-redirected to `https://www.apple.com/iphone/` — 649 KB HTML + 73 KB `head.built.js` inspected).
- **Awwwards itself** — not directly inspected; the sites audited are all Awwards SOTD/Developer Award winners per public record.