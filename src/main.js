/**
 * Anura Systems — main orchestrator
 * ----------------------------------------------------------------
 * Pass 1 (current): Lighting foundation only.
 *   - Renderer with proper tone mapping for night scenes
 *   - Scene background = near-black
 *   - Subtle PBR environment (just enough to read silhouettes)
 *   - World adds 3 lights: moon, fire, ambient
 *   - Camera moves along path on scroll (path is invisible for now)
 *
 * What is NOT here yet (added back in later passes):
 *   - Trees, water, trail, sky, fog
 *   - Yeri, tent, frog, campfire mesh
 *   - Fireflies, mushrooms, god rays
 *   - Bloom, post-processing
 *   - Hotspots, modals
 * ----------------------------------------------------------------
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { World } from './scene/World.js';
import { CameraController } from './core/Camera.js';
import { HotspotSystem } from './core/Hotspots.js';

// ── DOM refs ──────────────────────────────────────────────────────
const canvas      = document.getElementById('world-canvas');
const gate        = document.getElementById('loading-gate');
const scrollHint  = document.getElementById('scroll-hint');
const hudProgress = document.getElementById('hud-progress');

// ── Renderer ──────────────────────────────────────────────────────
// Night-scene tone mapping: ACES Filmic is the movie-industry standard.
// It compresses bright highlights (the fire) without crushing shadows.
// Exposure 0.85 keeps the scene dim like real night.
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ── Scene + Camera ────────────────────────────────────────────────
const scene = new THREE.Scene();
// Background is the void. The moon light + tiny ambient define what's
// barely visible. No sky dome yet — added in a later pass.
scene.background = new THREE.Color(0x020308);

// ── IBL environment (PBR materials require this) ─────────────────
// When we add GLB trees in a later pass, they need an environment map
// to reflect — otherwise PBR materials look flat black. We use a tiny
// contribution (0.08) so the IBL just defines silhouettes without
// making the scene look like daylight.
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTex;
scene.environmentIntensity = 0.08;
pmrem.dispose();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 1.65, 20);

// ── Systems ───────────────────────────────────────────────────────
// CameraController still works — the scroll path is just traveling
// through empty space. We need it for the gate dismissal + feel.
const world    = new World(scene);
const camCtrl  = new CameraController(camera, canvas);
// HotspotSystem: instantiate but pass empty hotspots for now
const hotspots = new HotspotSystem(scene, camera, renderer, canvas);

world.camCtrl = camCtrl;
hotspots.registerHotspots(world.getHotspots());

// ── Resize ────────────────────────────────────────────────────────
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);
onResize();

// ── Animation loop ────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  const dt = clock.getDelta();
  const elapsed = clock.elapsedTime;

  world.update(elapsed, camCtrl.progress);
  camCtrl.update(dt);
  hotspots.update(dt);

  // No bloom, no post-process for now. Just the raw render.
  // (Hotspots.render() will fall back to renderer.render if no composer.)
  if (hotspots.render) hotspots.render();

  requestAnimationFrame(animate);
}
animate();

// ── Gate dismissal ────────────────────────────────────────────────
function dismissGate() {
  if (!gate || gate.classList.contains('dismissed')) return;
  gate.classList.add('dismissed');
  setTimeout(() => scrollHint?.classList.add('visible'), 1200);
  window.dispatchEvent(new CustomEvent('anura:worldEngaged'));
}

window.addEventListener('anura:gateComplete', dismissGate, { once: true });
setTimeout(dismissGate, 6000);

function blockCanvasWhileGated() {
  if (gate && !gate.classList.contains('dismissed')) {
    canvas.style.pointerEvents = 'none';
  } else {
    canvas.style.pointerEvents = 'auto';
    document.removeEventListener('anura:gateComplete', blockCanvasWhileGated);
  }
}
window.addEventListener('anura:gateComplete', blockCanvasWhileGated);

// ── Dev / debug surface ──────────────────────────────────────────
if (import.meta.env?.DEV) {
  window.__anura = { renderer, scene, camera, world, camCtrl, hotspots };
  console.info('[anura] dev mode — try window.__anura');
}