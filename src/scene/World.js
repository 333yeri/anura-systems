/**
 * Anura Systems — World
 * ----------------------------------------------------------------
 * Pass 1 (current): Lighting foundation only.
 *
 * Three lights:
 *   1. Moonlight — cool, low, casts long shadows
 *   2. Campfire  — warm, fades in as camera approaches Act 4
 *   3. Ambient   — barely there, just so pure black isn't pure black
 *
 * Nothing else. No trees, no water, no trail, no sky, no fog,
 * no fireflies, no mushrooms, no frogs, no Yeri, no tent, no bloom.
 *
 * Scene = black void + these 3 lights. Camera moves through space.
 * You can see nothing because there's nothing to see yet. That's
 * intentional — we're verifying the lighting math first.
 * ----------------------------------------------------------------
 */

import * as THREE from 'three';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.elapsed = 0;
    this.campfireBaseIntensity = 0;   // updated as camera approaches Act 4

    // ── 1. MOONLIGHT ──────────────────────────────────────────────
    // Cool pale blue-white. DirectionalLight = parallel rays like sun.
    // Position determines direction (light shines FROM position TO 0,0,0).
    // High overhead, slightly off-axis, so shadows fall at an angle.
    this.moonLight = new THREE.DirectionalLight(0xeaf2ff, 1.4);
    this.moonLight.position.set(-12, 18, 8);   // high, left, front
    this.moonLight.target.position.set(0, 0, 0);
    // Shadows off for now — nothing to cast shadows on yet.
    // Re-enabled when we add trees (later pass).
    this.moonLight.castShadow = false;
    this.scene.add(this.moonLight);
    this.scene.add(this.moonLight.target);

    // ── 2. CAMPFIRE ───────────────────────────────────────────────
    // Warm orange. PointLight = radiates in all directions from a point.
    // Placed at Act 4 clearing (z = -65 per the camera path).
    // Distance = how far the light reaches (meters). Decay = how it
    // falls off (2 = physically realistic inverse-square).
    // Intensity starts at 0 and ramps up as camera gets close.
    this.campfireLight = new THREE.PointLight(0xffb060, 0, 18, 2.0);
    this.campfireLight.position.set(0, 0.5, -65);   // campfire center
    this.campfireLight.castShadow = false;
    this.scene.add(this.campfireLight);

    // ── 3. AMBIENT ────────────────────────────────────────────────
    // Barely visible. Just so the void isn't pure #000.
    // Real night scenes use ambient this low — most of the world is
    // in shadow; only objects near a strong light source are visible.
    this.ambientLight = new THREE.AmbientLight(0x0a1018, 0.15);
    this.scene.add(this.ambientLight);

    // Total lights in scene: 3. That's it.
  }

  /**
   * Called every frame from main.js
   * @param {number} elapsed - seconds since start
   * @param {number} progress - camera scroll progress 0..1
   *   0 = at spawn (deep forest, no fire visible yet)
   *   1 = at Act 4 (campfire clearing, fire at full brightness)
   */
  update(elapsed, progress = 0) {
    this.elapsed = elapsed;

    // Campfire light ramps in over the last 40% of the path
    // (camera approaches Act 4 clearing).
    // progress < 0.6 → fire invisible
    // progress 0.6 → 1.0 → fire ramps from 0 to full
    const fireRamp = THREE.MathUtils.smoothstep(progress, 0.55, 0.95);
    this.campfireBaseIntensity = fireRamp * 4.5;   // peak intensity

    // Fire flicker: three sine waves at different frequencies
    // simulate the irregular pulse of real flames.
    const tongue = Math.sin(elapsed * 8.0) * 0.5 + Math.sin(elapsed * 13.7) * 0.3;
    const micro  = Math.sin(elapsed * 17.3 + 1.7) * 0.15;
    const breath = Math.sin(elapsed * 1.3) * 0.20;
    const flicker = (tongue + micro + breath) * 0.25;

    this.campfireLight.intensity =
      this.campfireBaseIntensity * (0.85 + flicker);
  }

  /**
   * Returns the list of interactive hotspots (props you can click).
   * Empty for now — added in later passes as we build props.
   */
  getHotspots() {
    return [];
  }
}