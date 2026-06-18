/**
 * Hotspots.js
 * ------------------------------------------------------------------
 * Anura Systems — raycaster + fresnel outline glow system for
 * clickable props.  When the user hovers a hotspot the underlying
 * mesh gets a pulsing phosphor-green outline; clicking it opens a
 * modal populated from the hotspot's data payload.
 *
 * Three.js r0.160 (compatible with r0.154+).
 * ES module.
 * ------------------------------------------------------------------
 */

import * as THREE from 'three';
import { EffectComposer }   from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }       from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass }  from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass }      from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass }       from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader }       from 'three/examples/jsm/shaders/FXAAShader.js';

// ---- Tunables --------------------------------------------------------------

const OUTLINE_COLOR        = 0x4AFF8C;   // phosphor green
const OUTLINE_HIDDEN_COLOR = 0x1a4a2a;   // darker version for occluded edges
const OUTLINE_BASE_STRENGTH = 4;         // centre of the pulse
const OUTLINE_PULSE_AMP     = 2;         // 4 ± 2  →  2 .. 6
const OUTLINE_PULSE_PERIOD  = 1.6;       // seconds, full sine cycle
const OUTLINE_GLOW          = 0.8;
const OUTLINE_THICKNESS     = 1.5;
const HOVER_CURSOR_CLASS    = 'is-hovering-hotspot';

// UnrealBloomPass — the cinematic dial. Strength is wired to camera
// progress so different Acts have different bloom intensity:
//   Act I  (spawn):     0.4  — restrained, distant
//   Act II (descent):   0.7  — building
//   Act III (mid):      1.0  — full glow
//   Act IV (sanctuary): 1.4  — peak, campfire + mushroom halo
// Active Theory does exactly this with their per-scene bloom variants.
const BLOOM_STRENGTH_MIN    = 0.4;
const BLOOM_STRENGTH_MAX    = 1.4;
const BLOOM_RADIUS          = 0.85;
const BLOOM_THRESHOLD       = 0.0;     // bloom everything brighter than pure black

const POINTER_EVENT_NAME  = 'anura:hotspotClick';

export class HotspotSystem {
  /**
   * @param {THREE.Scene}    scene
   * @param {THREE.Camera}   camera
   * @param {THREE.WebGLRenderer} renderer
   * @param {HTMLCanvasElement} canvas
   */
  constructor(scene, camera, renderer, canvas) {
    this.scene     = scene;
    this.camera    = camera;
    this.renderer  = renderer;
    this.canvas    = canvas;

    /** @type {Array<object>} user-supplied hotspot descriptors */
    this.hotspots     = [];
    /** @type {Array<THREE.Mesh>} invisible proxy spheres used for raycasting */
    this.proxyMeshes  = [];
    /** map: hotspot descriptor → real visible mesh(es) to outline */
    this._visibleByHotspot = new Map();

    this.raycaster       = new THREE.Raycaster();
    this.pointer         = new THREE.Vector2();
    this.pointerActive   = false; // true once the first pointermove arrives
    this.hoveredHotspot  = null;
    this.hoveredProxy    = null;

    this.composer       = null;
    this.outlinePass    = null;
    this.fxaaPass       = null;
    this._size          = new THREE.Vector2();
    this._elapsed       = 0;

    // Bound handlers so we can remove them later if dispose() is called.
    this._onPointerMove = this.onPointerMove.bind(this);
    this._onPointerLeave = this.onPointerLeave.bind(this);
    this._onClick       = this.onClick.bind(this);
    this._onKey         = this.onKey.bind(this);
    this._onResize      = this.onResize.bind(this);

    this.initComposer();
    this.bindEvents();
  }

  // ------------------------------------------------------------------
  // Post-processing setup
  // ------------------------------------------------------------------

  initComposer() {
    this.renderer.getSize(this._size);

    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(this._size.x, this._size.y);

    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // UnrealBloomPass — between RenderPass and OutlinePass. This is the
    // #1 missing piece from the Awwwards audit. Mushroom glow, campfire
    // ember, lantern orbs, moonlight on water all gain agency-grade
    // glow. Strength is mutated in setBloomFromProgress() per frame.
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this._size.x, this._size.y),
      BLOOM_STRENGTH_MIN,    // strength (overridden per frame)
      BLOOM_RADIUS,          // radius
      BLOOM_THRESHOLD        // threshold
    );
    this.composer.addPass(this.bloomPass);

    this.outlinePass = new OutlinePass(
      new THREE.Vector2(this._size.x, this._size.y),
      this.scene,
      this.camera
    );
    this.outlinePass.edgeStrength    = OUTLINE_BASE_STRENGTH;
    this.outlinePass.edgeGlow        = OUTLINE_GLOW;
    this.outlinePass.edgeThickness   = OUTLINE_THICKNESS;
    this.outlinePass.pulsePeriod     = OUTLINE_PULSE_PERIOD;
    this.outlinePass.visibleEdgeColor.set(OUTLINE_COLOR);
    this.outlinePass.hiddenEdgeColor .set(OUTLINE_HIDDEN_COLOR);
    this.composer.addPass(this.outlinePass);

    this.fxaaPass = new ShaderPass(FXAAShader);
    this._setFXAAResolution();
    this.composer.addPass(this.fxaaPass);
  }

  // Per-Act bloom dial — called each frame from update().
  // progress is CameraController's 0..1 scroll position.
  // Smooth ease-in-out so bloom doesn't jump at Act boundaries.
  setBloomFromProgress(progress) {
    if (!this.bloomPass) return;
    const t = Math.max(0, Math.min(1, progress));
    // Slight S-curve so mid-Acts feel like a plateau not a slope
    const eased = t * t * (3 - 2 * t);
    this.bloomPass.strength = BLOOM_STRENGTH_MIN + eased * (BLOOM_STRENGTH_MAX - BLOOM_STRENGTH_MIN);
  }

  _setFXAAResolution() {
    const pr = this.renderer.getPixelRatio();
    this.fxaaPass.material.uniforms['resolution'].value.set(
      1 / (this._size.x * pr),
      1 / (this._size.y * pr)
    );
  }

  // ------------------------------------------------------------------
  // Hotspot registration
  // ------------------------------------------------------------------

  /**
   * Register a list of hotspots.  Each entry is:
   *   {
   *     name:     string,
   *     position: THREE.Vector3,
   *     radius:   number,
   *     data:     { kicker, title, body, cta, ... }   // modal payload
   *     mesh?:    THREE.Object3D | THREE.Object3D[]    // visible target(s) for outline
   *     proxy?:   THREE.Mesh                           // pre-existing invisible proxy (optional)
   *   }
   *
   * If `hs.proxy` is supplied we re-use it (no duplicate sphere); otherwise we
   * create one ourselves.
   *
   * @param {Array<object>} hotspots
   */
  registerHotspots(hotspots) {
    if (!Array.isArray(hotspots)) {
      console.warn('[HotspotSystem] registerHotspots expected an array, got', hotspots);
      return;
    }

    this.hotspots     = hotspots.slice();
    this.proxyMeshes  = [];
    this._visibleByHotspot.clear();

    for (const hs of hotspots) {
      if (!hs.position) {
        console.warn('[HotspotSystem] hotspot missing position, skipping', hs);
        continue;
      }

      // -- (optional) invisible proxy sphere for raycasting ------
      let proxy = hs.proxy || null;
      if (!proxy) {
        const radius = typeof hs.radius === 'number' ? hs.radius : 0.5;
        const proxyGeom = new THREE.SphereGeometry(radius, 16, 12);
        const proxyMat  = new THREE.MeshBasicMaterial({
          visible: false,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        proxy = new THREE.Mesh(proxyGeom, proxyMat);
        proxy.position.copy(hs.position);
        proxy.name = `hotspot-proxy:${hs.name || ''}`;
        this.scene.add(proxy);
      }
      proxy.userData.hotspot = hs;
      proxy.userData.isHotspotProxy = true;
      proxy.renderOrder = -1;
      this.proxyMeshes.push(proxy);

      // -- visible mesh reference (for the outline) ---------------
      const visibles = this._collectVisibleTargets(hs.mesh);
      this._visibleByHotspot.set(hs, visibles);

      // Tag the visible meshes so downstream systems can find them
      for (const v of visibles) {
        v.userData.hotspot = hs;
        v.userData.hotspotProxy = proxy;
      }
    }
  }

  /**
   * Normalise the optional `mesh` field into a flat array of
   * Object3D targets safe to feed to OutlinePass.selectedObjects.
   */
  _collectVisibleTargets(mesh) {
    if (!mesh) return [];
    const arr = Array.isArray(mesh) ? mesh : [mesh];
    const out = [];
    for (const m of arr) {
      if (!m) continue;
      if (m.isObject3D) out.push(m);
    }
    return out;
  }

  // ------------------------------------------------------------------
  // Event wiring
  // ------------------------------------------------------------------

  bindEvents() {
    this.canvas.addEventListener('pointermove',  this._onPointerMove);
    this.canvas.addEventListener('pointerleave', this._onPointerLeave);
    this.canvas.addEventListener('click',        this._onClick);
    window.addEventListener('keydown',            this._onKey);
    window.addEventListener('resize',             this._onResize);

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());

    // Close on backdrop click (only when the click lands on the
    // modal element itself, not on its inner content).
    const modal = document.getElementById('hotspot-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }
  }

  onPointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    this.pointerActive = true;
  }

  onPointerLeave() {
    this.pointerActive = false;
    this._setHover(null, null);
  }

  onClick() {
    if (this.hoveredHotspot) {
      this.openModal(this.hoveredHotspot.data);
    }
  }

  onKey(e) {
    if (e.key === 'Escape') this.closeModal();
  }

  onResize() {
    this.renderer.getSize(this._size);
    if (this.composer)    this.composer.setSize(this._size.x, this._size.y);
    if (this.outlinePass) this.outlinePass.setSize(this._size.x, this._size.y);
    if (this.bloomPass)   this.bloomPass.setSize(this._size.x, this._size.y);
    this._setFXAAResolution();
  }

  // Per-Act visual dial — call once per frame from main loop with the
  // current camera progress. Wires bloom strength + tone-mapping exposure
  // so different Acts feel different (restrained at spawn, peak at
  // sanctuary). Per the Awwwards audit: Active Theory does this exact
  // thing with their homebloom / cleanroom / treescene variants.
  syncVisualsToProgress(progress) {
    this.setBloomFromProgress(progress);

    // Tone-mapping exposure ramp — slightly brighter mid-journey so the
    // user feels "you're opening up" at Act III, then dimmer again at
    // sanctuary so the campfire reads as the brightest thing on screen.
    const t = Math.max(0, Math.min(1, progress));
    const eased = t * t * (3 - 2 * t); // same ease curve as bloom
    // exposure rises 1.55 → 1.85 → settles 1.75 at the end
    let exposure;
    if (eased < 0.6) {
      // First 60%: lerp 1.55 → 1.85
      exposure = 1.55 + (eased / 0.6) * 0.30;
    } else {
      // Last 40%: lerp 1.85 → 1.75
      exposure = 1.85 - ((eased - 0.6) / 0.4) * 0.10;
    }
    if (this.renderer && this.renderer.toneMappingExposure !== undefined) {
      this.renderer.toneMappingExposure = exposure;
    }
  }

  // ------------------------------------------------------------------
  // Per-frame update — raycast + outline pulse
  // ------------------------------------------------------------------

  update(deltaSeconds) {
    // -- pulse the outline strength on a sine wave ----------------
    if (this.outlinePass) {
      this._elapsed += typeof deltaSeconds === 'number'
        ? deltaSeconds
        : 0; // fall back to whatever the OutlinePass internal clock uses
      const t = (typeof deltaSeconds === 'number')
        ? this._elapsed
        : performance.now() / 1000;
      const phase = (t * Math.PI * 2) / OUTLINE_PULSE_PERIOD;
      this.outlinePass.edgeStrength =
        OUTLINE_BASE_STRENGTH + Math.sin(phase) * OUTLINE_PULSE_AMP;
    }

    // -- hover detection ------------------------------------------
    if (!this.pointerActive) return;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.proxyMeshes, false);

    if (intersects.length > 0) {
      const proxy = intersects[0].object;
      const hs    = proxy.userData.hotspot;
      this._setHover(hs, proxy);
    } else {
      this._setHover(null, null);
    }
  }

  _setHover(hotspot, proxy) {
    if (hotspot === this.hoveredHotspot) return;

    this.hoveredHotspot = hotspot;
    this.hoveredProxy   = proxy;

    if (hotspot) {
      // Prefer the visible mesh(es) the user attached; fall back to
      // the invisible proxy if nothing was supplied.
      const visibles = this._visibleByHotspot.get(hotspot);
      this.outlinePass.selectedObjects = (visibles && visibles.length)
        ? visibles
        : [proxy];
      this.canvas.classList.add(HOVER_CURSOR_CLASS);
    } else {
      this.outlinePass.selectedObjects = [];
      this.canvas.classList.remove(HOVER_CURSOR_CLASS);
    }
  }

  // ------------------------------------------------------------------
  // Render — the caller is expected to call this instead of
  // renderer.render(scene, camera).
  // ------------------------------------------------------------------

  render() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ------------------------------------------------------------------
  // Modal control
  // ------------------------------------------------------------------

  openModal(data) {
    if (!data) return;
    const modal = document.getElementById('hotspot-modal');
    if (!modal) return;

    const kicker = document.getElementById('modal-kicker');
    const title  = document.getElementById('modal-title');
    const body   = document.getElementById('modal-body');
    const cta    = document.getElementById('modal-cta');

    if (kicker) kicker.textContent = data.kicker || '';
    if (title)  title.textContent  = data.title  || data.name || '';
    if (body)   body.innerHTML     = data.body   || '';
    if (cta) {
      cta.innerHTML = data.cta || '';
      if (data.cta) cta.classList.add('is-active');
      else          cta.classList.remove('is-active');
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    // Notify the rest of the app (e.g. analytics, audio cues).
    this.canvas.dispatchEvent(new CustomEvent(POINTER_EVENT_NAME, {
      detail: data,
      bubbles: true,
    }));
  }

  closeModal() {
    const modal = document.getElementById('hotspot-modal');
    if (!modal) return;
    if (!modal.classList.contains('is-open')) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  isModalOpen() {
    const modal = document.getElementById('hotspot-modal');
    return !!(modal && modal.classList.contains('is-open'));
  }

  // ------------------------------------------------------------------
  // Cleanup
  // ------------------------------------------------------------------

  dispose() {
    this.canvas.removeEventListener('pointermove',  this._onPointerMove);
    this.canvas.removeEventListener('pointerleave', this._onPointerLeave);
    this.canvas.removeEventListener('click',        this._onClick);
    window.removeEventListener('keydown',            this._onKey);
    window.removeEventListener('resize',             this._onResize);

    for (const proxy of this.proxyMeshes) {
      this.scene.remove(proxy);
      proxy.geometry.dispose();
      proxy.material.dispose();
    }
    this.proxyMeshes = [];
    this._visibleByHotspot.clear();
    this.hotspots = [];

    if (this.composer) this.composer.dispose();
  }
}

export default HotspotSystem;
