/**
 * Anura Systems — main orchestrator
 * ----------------------------------------------------------------
 * Boots:
 *   1. Three.js renderer + scene
 *   2. World (forest, mushrooms, campfire, frog, stars, hotspots)
 *   3. CameraController (scroll-driven curve + parallax)
 *   4. HotspotSystem (raycaster + outline + modal)
 *   5. HUD + Act 1 gate dismissal
 *
 * Then runs a single requestAnimationFrame loop driving all updates.
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
const frog        = document.querySelector('.frog-wrap');

// ── Renderer ──────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.7;   // 1.4 → 1.7: moonlight reads, PBR textures pop
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ── Scene + Camera ────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2028);  // matches fog so horizon dissolves naturally

// ── IBL environment (PBR requires this — without it materials look flat/cartoony) ──
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTex;
scene.environmentIntensity = 0.6;  // subtle IBL — moonlight + key still drive the look
pmrem.dispose();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 1.65, 20);   // match camera path start (spawn)

// ── Systems ───────────────────────────────────────────────────────
const world      = new World(scene);
const camCtrl    = new CameraController(camera, canvas);
const hotspots   = new HotspotSystem(scene, camera, renderer, canvas);

// Register hotspots from world
hotspots.registerHotspots(world.getHotspots());

// Show HUD progress after first interaction
window.addEventListener('anura:worldEngaged', () => {
  hudProgress.classList.add('visible');
}, { once: true });

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

  world.update(elapsed);
  camCtrl.update(dt);
  hotspots.update(dt);

  hotspots.render();   // composer (renders via OutlinePass + FXAA)

  requestAnimationFrame(animate);
}
animate();

// ── Gate dismissal ────────────────────────────────────────────────
// Listen for the gate's own completion event, OR auto-dismiss after 4s fallback.
function dismissGate() {
  if (!gate || gate.classList.contains('dismissed')) return;
  gate.classList.add('dismissed');
  // Show scroll hint after a small breath
  setTimeout(() => scrollHint?.classList.add('visible'), 1200);
}

window.addEventListener('anura:gateComplete', dismissGate, { once: true });
// Safety fallback — never trap the user behind the gate
setTimeout(dismissGate, 6000);

// Pause pointer events on the canvas while the gate is up so the
// first click lands on "SCROLL TO DESCEND", not on a hotspot.
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