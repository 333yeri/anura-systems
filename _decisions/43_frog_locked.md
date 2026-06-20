---
status: locked
locked-at: 2026-06-19
asset: user-provided GLB
quality-rating: 7-8/10 (recognizable, species-correct)
---

# 43 — Frog Asset LOCKED (Final)

> **Source:** user-provided GLB, 2026-06-19 22:09
> **Path:** `public/assets/models/char__frog__user_v01.glb`
> **Status:** ✅ LOCKED — use this asset in the project
> **Old frogs archived** (no longer active)

---

## ASSET INVENTORY

| File | Size | Tris | Status |
|---|---|---|---|
| `char__frog__user_v01.glb` | **10.83 MB** | **283,300** | ✅ PRIMARY — use this |
| `char__frog__procedural-v01.glb` | 171 KB | 3,890 | ❌ Archived (failed procedural attempt) |
| `char__frog__v01.glb` | 254 KB | 6,226 | ❌ Archived (not trusted by user) |
| `char__frog__v02.glb` | 500 KB | 11,520 | ❌ Archived (not trusted by user) |

---

## ASSET DETAILS — `char__frog__user_v01.glb`

**Geometry:**
- 171,291 vertices
- **283,300 triangles** — way above VQS locked 30-50k, hero tier ✅
- Single mesh, clean topology
- Bounding box: ~1 unit (good for in-scene scale)

**Materials:**
- 1 PBR material
- **Has baseColor texture** ✅
- Has metallic/roughness texture ✅
- No normal map (minor — could be added if needed)
- No emissive (we'll add cyan glow separately if needed)
- WebP textures (modern, GPU-friendly)

**What's correct in the render:**
- ✅ Reads as a frog immediately
- ✅ Bright leaf-green body
- ✅ Bright red-orange eyes with vertical pupils (Red-Eyed Tree Frog signature)
- ✅ Orange toes/feet
- ✅ Slight bumpy skin texture
- ✅ Recognizable species

**What's missing or off (vs reference image):**
- ⚠️ Blue side stripes/flanks not clearly visible (camera angle dependent)
- ❌ No bioluminescent cyan glow (we'd need to add it via shader)

---

## INTEGRATION PLAN

### Use the new frog as-is

- **Path**: `/assets/models/char__frog__user_v01.glb`
- **Loader**: `useGLTF` from drei
- **Default scale**: 1.0 (model is already ~1 unit)
- **Position**: load with `<primitive object={scene} position={[x, y, z]} />`

### Add cyan bioluminescent glow (optional, can be added in code)

If we want the frog to have the cyan glow effect from the spec,
we can either:
- **Option A**: Add a separate emissive sphere/cube behind/around
  the frog that emits cyan light (cheap, effective)
- **Option B**: Modify the GLB to add emissive material to specific
  vertices (cleaner but requires re-export)
- **Option C**: Use an outline glow shader in Three.js that
  detects the silhouette and adds a faint cyan edge

My recommendation: **Option A** for now (add a glowing aura
sprite/billboard around the frog). Easy, reversible, doesn't
require modifying the GLB.

### Add outline glow for Act 4 (when clickable)

In Act 4, the frog has subtle outline glow (per architecture lock).
Implementation: drei `<Outlines>` component wrapping the primitive,
or `OutlinePass` from postprocessing.

```tsx
<Outlines thickness={0.05} color="#6FCFB8" screenspace={true}>
  <primitive object={scene} />
</Outlines>
```

### Animation states

The GLB has no animations. We can add them in code:
- `idle-bob`: subtle Y movement via `useFrame` (1 cycle per 2-3s)
- `breathing`: scale modulation (1.0 → 1.02 → 1.0)
- `teleport-dissolve`: brief opacity fade when frog disappears
- `teleport-appear`: brief scale-up + fade when frog reappears

These are all simple `useFrame` modifications — no GLB animation
needed.

---

## UPDATED TIMELINE

| Phase | Asset | Status |
|---|---|---|
| Procedural frog attempt | procedural-v01 | ❌ Abandoned (2/10 quality) |
| User-provided AI-generated frog | char__frog__user_v01 | ✅ LOCKED (7-8/10) |
| Yeri textures + animations | yeri.glb + textures | Pending — start now |
| Trees (existing + variation) | tree__v01-v05 | Pending — start now |
| World skeleton | (new) | Pending — start after Yeri/textures |

**No more time spent on procedural frog generation.** Asset is
locked. Moving to next phase.

---

## FILES TOUCHED IN THIS SESSION

- ✅ `scripts/blender/build_frog.py` — written (works, archived for reference)
- ✅ `scripts/blender/render_frog_preview.py` — written
- ✅ `scripts/blender/render_user_frog.py` — written
- ✅ `public/assets/models/char__frog__user_v01.glb` — copied (primary)
- ✅ `_archive/char__frog__procedural-v01.glb` — moved
- ✅ `_archive/char__frog__v01.glb` — moved
- ✅ `_archive/char__frog__v02.glb` — moved
- ✅ `_decisions/42_frog_spec.md` — superseded by this file
- ✅ `_decisions/43_frog_locked.md` — this file (current)

---

## NEXT STEPS

1. ~~Hand-create frog in Blender~~ — user provided AI-rendered GLB instead
2. **Build Yeri textures + animations** (start next session)
3. **Build world skeleton** (sky + moon + ground + tree + lighting + fog)
4. **Integrate frog** into Act 1 CRT screen + Act 3/4 world positions
5. **Test end-to-end** in dev server

Send me a message when ready to continue. The frog is locked.
World skeleton is next.
