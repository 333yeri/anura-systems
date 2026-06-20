---
status: locked
locked-at: 2026-06-19
strategy: code-side-now-upgrade-later
---

# 44 — Yeri Animation Strategy (LOCKED)

> **Decision:** Path B — code-side animations now, upgrade later
> **Status:** ✅ LOCKED
> **Quality bar:** 5/10 (acceptable now, upgradeable later)

---

## DECISION RATIONALE

The user has a Yeri GLB with 25-joint skin + a skeleton GLB, but
no baked animations. Hand-animating breathing/coughing in Blender
would take 1-2 weeks. Mixamo would give 7/10 quality in 1 day
but delays the world build.

The user chose: **ship with code-side animations now, perfect
later when budget allows**.

This is the right move. The world skeleton is the critical path.
Animations can be upgraded without redoing the world.

---

## CODE-SIDE ANIMATION SET (what we'll build)

All implemented in `useFrame` against the existing 25-joint skeleton.
No Blender animation work required. No Mixamo upload required.

### 1. Idle bob (constant, 5/10 quality)
- Whole-body subtle Y oscillation: ±2cm over 2.5s sine wave
- Adds gentle "alive" feeling
- Implementation: `scene.position.y = Math.sin(t * 0.4) * 0.02`
- **Visible from any distance**

### 2. Fake breathing (chest expansion shader, 5/10 quality)
- Vertex shader scales chest/shoulder vertices subtly: ±1.5% over 4s
- Implemented as a custom material modifier on the torso mesh
- Reads as breathing from normal camera distance (~3-5m)
- Will not hold up at close-up — but Yeri is never the close-up focus
- **Visible from any distance, reads as breathing**

### 3. Head turn (occasional, 7/10 quality)
- Rotate head bone toward fire direction
- Cycle: looking forward → look at fire (1s ease) → hold (2-4s) →
  look back (1s ease) → hold → repeat
- Random pause between turns (8-25s)
- Implementation: lerp on head bone rotation
- **Reads as natural head movement**

### 4. Cough animation (occasional, 4/10 quality)
- Brief body dip + head forward
- Triggered every 30-90s (randomized)
- Implementation: brief Y-position drop + head bone rotation
  forward, then return
- **Reads as a small body movement, not a real cough but acceptable**

### 5. Weight shift (occasional, 6/10 quality)
- Subtle shoulder/hip bone rotation
- Happens every 20-60s
- Implementation: random small rotations on shoulder + hip bones
- **Reads as "settling into position"**

### 6. Eye blink (constant, 4/10 quality)
- Brief scale-down of eye vertices
- Random blink every 3-6s
- Implementation: scale eye mesh vertices via shader
- **Subtle, may not be visible at distance but adds life**

---

## WHAT'S NOT INCLUDED (deferred to upgrade)

- ❌ Realistic skeletal breathing (chest expansion with diaphragm
  motion) — requires baked animation
- ❌ Authentic cough motion (chest compress, head shake, body
  shudder) — requires baked animation
- ❌ Finger/hand micro-movements — not visible anyway
- ❌ Hair physics — too expensive for current scope
- ❌ Subtle cloth simulation (hoodie drawstring movement) — too
  expensive

---

## UPGRADE PATH (when budget allows)

When the user has bigger budget, animations can be upgraded by:

1. **Mixamo path** (1 day, $0):
   - Upload Yeri GLB to mixamo.com
   - Get idle, breathing, cough animations
   - Replace code-side animations with Mixamo GLB animations
   - Quality: 7/10

2. **Hand-animate in Blender** (1-2 weeks, $0-2000 if hired):
   - Open Yeri GLB in Blender
   - Author all animations manually with proper skeletal deformation
   - Export as GLB with baked animations
   - Quality: 9-10/10

3. **Hire an animator** (1-2 weeks, $200-1000):
   - Upwork/Fiverr
   - Provide Yeri GLB + spec
   - Get back GLB with animations
   - Quality: 8-9/10

**Same Yeri GLB throughout, just different animation sources.**
No need to re-export Yeri, re-texture, re-rig. Animation is
isolated.

---

## IMPLEMENTATION FILE

When the world is built, the Yeri animation code lives in:
```
src/world/characters/Yeri.tsx
```

It will:
1. Load the GLB via `useGLTF`
2. Apply the fake-breathing shader modifier
3. Run `useFrame` with the animation state machine
4. Be positionable via props (sit on log, look at fire)

---

## NEXT STEPS (current session)

Now that animation strategy is locked, we move to:

1. **World skeleton** (3-5 days) — sky + moon + ground + first tree + lighting + fog
2. **Hotspot + HUD system** (3-5 days)
3. **Scroll-driven camera** (2-3 days)
4. **Polish** (3-5 days)

The Yeri animation code gets written as part of the world build
(step 1). Yeri will sit on the log in Act 4 with the code-side
animations. Upgrade later when budget allows.

---

## WHAT'S PENDING FOR THE NEXT SESSION

User said "b" — Path B. They understand:
- Code-side animations now = 5/10 quality
- Upgrade to Mixamo or hand-animation later = 7-10/10 quality
- World skeleton is the priority

Ready to start world skeleton when user gives the go-ahead.
