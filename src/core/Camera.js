import * as THREE from 'three';

/**
 * CameraController
 * ---------------
 * Scroll-driven camera that rides a CatmullRomCurve3 path through the
 * Anura world. Mousemove adds a small dampened parallax offset on top of
 * the path-derived look direction. Designed for ONE persistent 3D scene
 * (no cuts) — progress 0..1 maps the journey from spawn to the sanctuary
 * campfire.
 *
 *   spawn (z= 30) ──► drift1 (z= 10) ──► drift2 (z=-10) ──►
 *   drift3 (z=-22) ──► sanctuary / campfire (z=-28)
 *
 * Public API:
 *   const cam = new CameraController(perspectiveCamera, domElement);
 *   cam.update(elapsedSeconds);   // call every frame
 *   cam.getPathLength();          // for UI / progress math
 *   cam.dispose();                // removes event listeners
 */
export class CameraController {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {HTMLElement} domElement  canvas / root element (used as wheel target)
   */
  constructor(camera, domElement) {
    this.camera = camera;
    this.dom = domElement;

    // --- scroll progress along the curve (0..1) -------------------------
    this.progress = 0;
    this.targetProgress = 0;

    // --- mouse parallax (radians) --------------------------------------
    // Yaw (targetX) and pitch (targetY) come straight from mousemove.
    // mouseX/mouseY are the damped values actually applied this frame.
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;

    // --- idle-drift bookkeeping ----------------------------------------
    // When the user has been quiet for IDLE_THRESHOLD_MS, the camera
    // begins a very slow forward crawl so the world feels alive.
    this.lastInput = 0;
    this.IDLE_THRESHOLD_MS = 3000;
    this.IDLE_DRIFT_PER_FRAME = 0.000015;

    // --- dampening factors (per-frame, frame-rate independent enough for
    //     60fps; lerp factors are fine at typical refresh rates) ----------
    this.PROGRESS_LERP = 0.08;
    this.MOUSE_LERP = 0.06;

    // --- parallax limits (radians) -------------------------------------
    // ±10° yaw, ±6° pitch — the spec says pitch bound is 6° not 10°.
    this.MAX_YAW = THREE.MathUtils.degToRad(10);   // 0.1745329
    this.MAX_PITCH = THREE.MathUtils.degToRad(6);  // 0.1047198

    // --- act-band thresholds (progress -> which act we're in) ----------
    this.ACT_BANDS = [
      { until: 0.25, label: 'ACT II' },
      { until: 0.7,  label: 'ACT III' },
      { until: 1.01, label: 'ACT IV' },
    ];

    // --- cached DOM elements (resolved lazily, null if absent) ---------
    this._hud = {
      progress: null,
      act: null,
      bar: null,
      hint: null,
    };

    // --- bookkeeping for handler removal -------------------------------
    this._handlers = null;

    this.buildPath();
    this._initialPlacement();
    this.bindEvents();
  }

  // --------------------------------------------------------------------
  //  Path construction
  // --------------------------------------------------------------------

  buildPath() {
    // The five keyframes that define the journey. Y is held at 1.65 m
    // (eye-level) so the camera never rises/dips — motion is purely
    // forward with gentle lateral sway through the drift points.
    this.path = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3( 0, 1.65,  20),   // spawn (closer in so forest is visible)
        new THREE.Vector3( 0, 1.65,   6),   // drift midpoint 1
        new THREE.Vector3(-2, 1.65, -10),   // drift midpoint 2
        new THREE.Vector3( 1, 1.65, -22),   // drift midpoint 3
        new THREE.Vector3( 0, 1.65, -28),   // sanctuary / campfire
      ],
      /* closed = */ false,
      /* type   = */ 'catmullrom',
      /* tension = */ 0.3,
    );

    // Pre-cache the arc length so per-frame getPointAt() is uniform.
    this.pathLength = this.path.getLength();
  }

  _initialPlacement() {
    // Drop the camera at progress 0 and face the first look-ahead point.
    const start = this.path.getPointAt(0);
    const ahead = this.path.getPointAt(Math.min(1, 0.05));
    this.camera.position.copy(start);
    this.camera.lookAt(ahead);
  }

  // --------------------------------------------------------------------
  //  Event wiring
  // --------------------------------------------------------------------

  bindEvents() {
    this._handlers = {
      wheel: this._onWheel.bind(this),
      mousemove: this._onMouseMove.bind(this),
      resize: this._onResize.bind(this),
    };

    // Wheel is attached to the canvas/dom element so the page itself
    // doesn't scroll; we own the input.
    this.dom.addEventListener('wheel', this._handlers.wheel, { passive: false });
    window.addEventListener('mousemove', this._handlers.mousemove, { passive: true });
    window.addEventListener('resize', this._handlers.resize);
  }

  _onWheel(e) {
    // We never want the page to scroll — the wheel IS the camera control.
    e.preventDefault();
    this.targetProgress = THREE.MathUtils.clamp(
      this.targetProgress + e.deltaY * 0.0005,
      0,
      1,
    );
    this.lastInput = performance.now();
  }

  _onMouseMove(e) {
    // Normalize cursor to [-1, 1] across viewport, then map to radians.
    const w = window.innerWidth  || 1;
    const h = window.innerHeight || 1;
    const nx = (e.clientX / w) * 2 - 1;   // -1 left, +1 right
    const ny = (e.clientY / h) * 2 - 1;   // -1 top,  +1 bottom

    this.targetX =  nx * this.MAX_YAW;    // yaw:  +x  -> look right
    this.targetY = -ny * this.MAX_PITCH;  // pitch: +y  -> look up (screen y is flipped)
    this.lastInput = performance.now();
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  // --------------------------------------------------------------------
  //  Per-frame update
  // --------------------------------------------------------------------

  /**
   * @param {number} elapsed  seconds since start (unused — kept for parity
   *                          with the rest of the systems; all damping is
   *                          frame-rate-relative and stable at 60fps).
   */
  update(elapsed) {
    // -- 1. Idle drift -------------------------------------------------
    //    After 3 s of no scroll input, creep targetProgress forward.
    if (performance.now() - this.lastInput > this.IDLE_THRESHOLD_MS) {
      this.targetProgress = Math.min(
        1,
        this.targetProgress + this.IDLE_DRIFT_PER_FRAME,
      );
    }

    // -- 2. Damp scroll progress toward target -------------------------
    this.progress += (this.targetProgress - this.progress) * this.PROGRESS_LERP;

    // -- 3. Damp mouse parallax toward target --------------------------
    this.mouseX += (this.targetX - this.mouseX) * this.MOUSE_LERP;
    this.mouseY += (this.targetY - this.mouseY) * this.MOUSE_LERP;

    // -- 4. Position the camera on the path ----------------------------
    const pos = this.path.getPointAt(this.progress);
    this.camera.position.copy(pos);

    // -- 5. Base look direction: a point slightly ahead on the path ----
    //    0.05 ahead feels natural — far enough to anticipate movement,
    //    close enough that the path's curvature steers the gaze.
    const lookAheadT = Math.min(1, this.progress + 0.05);
    const lookAt = this.path.getPointAt(lookAheadT);
    this.camera.lookAt(lookAt);

    // -- 6. Add parallax on top of the base rotation -------------------
    //    Rotation is applied AFTER positioning/looking, so scroll moves
    //    the camera through space while mouse only rotates the view.
    this.camera.rotation.y += this.mouseX;
    this.camera.rotation.x += this.mouseY;

    // -- 7. HUD --------------------------------------------------------
    this._updateHud();
  }

  // --------------------------------------------------------------------
  //  HUD updates (cached lookups; safe to call every frame)
  // --------------------------------------------------------------------

  _updateHud() {
    // Progress percentage (0..100, two-digit padded).
    if (!this._hud.progress) {
      this._hud.progress = document.getElementById('progress-pct');
    }
    if (this._hud.progress) {
      const pct = Math.round(this.progress * 100);
      this._hud.progress.textContent = String(pct).padStart(2, '0');
    }

    // Vertical progress bar (height% of container).
    if (!this._hud.bar) {
      this._hud.bar = document.getElementById('hud-progress-bar');
    }
    if (this._hud.bar) {
      this._hud.bar.style.height = (this.progress * 100).toFixed(2) + '%';
    }

    // Act label — three bands.
    if (!this._hud.act) {
      this._hud.act = document.getElementById('act-label');
    }
    if (this._hud.act) {
      const label =
        this.ACT_BANDS.find((b) => this.progress < b.until)?.label ?? 'ACT IV';
      if (this._hud.act.textContent !== label) {
        this._hud.act.textContent = label;
      }
    }

    // Scroll hint — once the user has actually engaged the world, fade
    // it in via the .visible class (CSS owns the transition).
    if (this.progress > 0.02) {
      if (!this._hud.hint) {
        this._hud.hint = document.getElementById('scroll-hint');
      }
      if (this._hud.hint && !this._hud.hint.classList.contains('visible')) {
        this._hud.hint.classList.add('visible');
        // Custom event for any other system that wants to know.
        window.dispatchEvent(new CustomEvent('anura:worldEngaged'));
      }
    }
  }

  // --------------------------------------------------------------------
  //  Utilities
  // --------------------------------------------------------------------

  /** Cached arc length of the path in world units. */
  getPathLength() {
    return this.pathLength;
  }

  /**
   * Force the camera to a specific progress (e.g. for chapter jumps
   * added later). Skips the smoothing lerp on the next frame.
   */
  setProgress(p) {
    const clamped = THREE.MathUtils.clamp(p, 0, 1);
    this.targetProgress = clamped;
    this.progress = clamped;
    this.lastInput = performance.now();
  }

  /** Remove all listeners. Call when tearing down the scene. */
  dispose() {
    if (!this._handlers) return;
    this.dom.removeEventListener('wheel', this._handlers.wheel);
    window.removeEventListener('mousemove', this._handlers.mousemove);
    window.removeEventListener('resize', this._handlers.resize);
    this._handlers = null;
  }
}
