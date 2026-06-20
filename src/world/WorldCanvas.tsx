/**
 * WorldCanvas — single Canvas that hosts the World + Path + ScrollCamera.
 * Debug overlay is OUTSIDE the canvas, polls the THREE scene via ref.
 *
 * CONTROLS:
 *   - SCROLL WHEEL: drives scrollRef (0-1) along the path
 *   - MOUSE MOVE: 5% parallax offset on look direction (subtle, not full control)
 *   - Page must be tall enough to scroll — we set body height to 600vh so users
 *     can scroll the entire path with the wheel.
 */

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import World from './World';
import Path, { ScrollCamera } from './environment/Path';

function getScrollFromURL(): number {
  if (typeof window === 'undefined') return 0;
  const params = new URLSearchParams(window.location.search);
  const s = params.get('scroll');
  if (s === null) return 0;
  const n = parseFloat(s);
  return isFinite(n) ? THREE.MathUtils.clamp(n, 0, 1) : 0;
}

// Shared state object that R3F writes to and outer React reads
const debugState = {
  camPos: { x: 0, y: 0, z: 0 },
  lookAt: { x: 0, y: 0, z: 0 },
  nearestTree: 999,
  visibleTrees: 0,
  treePositions: [] as Array<{ x: number; y: number; z: number }>,
};

export function getDebugState() {
  return debugState;
}

// Mouse parallax offset (5% of viewport) — exposed globally so ScrollCamera can read it
const mouseParallax = { x: 0, y: 0 };
export function getMouseParallax() {
  return mouseParallax;
}

/**
 * R3F component that updates debugState on a slow interval.
 * Runs INSIDE Canvas so it has access to camera + scene.
 */
function DebugStateUpdater() {
  const { camera, scene } = useThree();

  useEffect(() => {
    const interval = setInterval(() => {
      const camPos = camera.position;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

      let nearest = 999;
      let visible = 0;
      const positions: Array<{ x: number; y: number; z: number }> = [];

      scene.traverse((obj: THREE.Object3D) => {
        if ((obj as THREE.Mesh).isMesh && obj.userData.isTree) {
          const treePos = obj.getWorldPosition(new THREE.Vector3());
          positions.push({ x: treePos.x, y: treePos.y, z: treePos.z });

          const dist = camPos.distanceTo(treePos);
          const toTree = treePos.clone().sub(camPos);
          const forwardDist = toTree.dot(forward);
          if (forwardDist > 0 && forwardDist < 50) {
            visible++;
            if (dist < nearest) nearest = dist;
          }
        }
      });

      debugState.camPos = { x: camPos.x, y: camPos.y, z: camPos.z };
      debugState.lookAt = {
        x: camPos.x + forward.x * 5,
        y: camPos.y + forward.y * 5,
        z: camPos.z + forward.z * 5,
      };
      debugState.nearestTree = nearest;
      debugState.visibleTrees = visible;
      debugState.treePositions = positions;

      if (typeof window !== 'undefined') {
        (window as any).__anuraState = {
          camPos: { ...debugState.camPos },
          lookAt: { ...debugState.lookAt },
          nearestTree: debugState.nearestTree,
          visibleTrees: debugState.visibleTrees,
          treeCount: positions.length,
          treePositions: positions.slice(0, 30),
        };
      }
    }, 200);

    return () => clearInterval(interval);
  }, [camera, scene]);

  return null;
}

/**
 * DOM overlay that polls debugState and displays.
 */
function DebugOverlay() {
  const [, force] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => force(x => x + 1), 250);
    return () => clearInterval(interval);
  }, []);

  const s = debugState;
  const tooClose = s.nearestTree < 8;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.1em',
        color: '#888',
        background: 'rgba(0,0,0,0.7)',
        padding: '8px 12px',
        borderRadius: 4,
        pointerEvents: 'none',
        minWidth: 280,
        zIndex: 100,
      }}
    >
      <div>CAM: ({s.camPos.x.toFixed(1)}, {s.camPos.y.toFixed(1)}, {s.camPos.z.toFixed(1)})</div>
      <div>LOOK: ({s.lookAt.x.toFixed(1)}, {s.lookAt.y.toFixed(1)}, {s.lookAt.z.toFixed(1)})</div>
      <div style={{ color: tooClose ? '#ff6644' : '#88ff88' }}>
        NEAREST TREE: {s.nearestTree.toFixed(2)}m {tooClose ? '⚠ TOO CLOSE' : '✓'}
      </div>
      <div>VISIBLE TREES (50m fwd): {s.visibleTrees}</div>
      <div style={{ color: '#666', fontSize: 9, marginTop: 4 }}>
        TOTAL TREES: {s.treePositions.length}
      </div>
    </div>
  );
}

/**
 * ScrollDriver — uses WINDOW scroll position (driven by scroll wheel).
 * Body is 600vh tall so the user can scroll through the whole experience.
 * This is OUTSIDE Canvas (pure DOM).
 *
 * IMPORTANT: We MUST override overflow:hidden on html/body/#root
 * (set by global.css and index.html) for scrolling to work. Otherwise
 * the page is locked and wheel events do nothing.
 */
function ScrollDriver({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  useEffect(() => {
    // Make body scrollable (600vh = 6 viewport heights of scrollable distance)
    document.body.style.minHeight = '600vh';
    document.body.style.margin = '0';
    document.body.style.background = '#000';

    // Override overflow:hidden on html, body, and #root (forced by global CSS)
    const root = document.getElementById('root');
    const html = document.documentElement;

    // Save original values to restore on unmount
    const origHtmlOverflow = html.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    const origRootOverflow = root?.style.overflow || '';
    const origBodyHeight = document.body.style.height;

    // Force scrollable
    html.style.overflow = 'auto';
    html.style.height = 'auto';
    html.style.overflowY = 'auto';
    document.body.style.overflow = 'visible';
    document.body.style.overflowY = 'visible';
    document.body.style.height = 'auto';
    if (root) {
      root.style.overflow = 'visible';
      root.style.height = 'auto';
    }

    const handler = () => {
      // Map scrollY (0 to maxScroll) to scrollRef (0 to 1)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const t = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      scrollRef.current = THREE.MathUtils.clamp(t, 0, 1);

      // Update status indicator
      const status = document.querySelector('[data-scroll-status]');
      if (status) status.textContent = `SCROLL: ${(scrollRef.current * 100).toFixed(0)}% — scroll to explore`;
    };

    window.addEventListener('scroll', handler, { passive: true });
    handler(); // Initial sync

    return () => {
      window.removeEventListener('scroll', handler);
      document.body.style.minHeight = '';
      document.body.style.margin = '';
      // Restore original overflow values
      html.style.overflow = origHtmlOverflow;
      html.style.height = '';
      html.style.overflowY = '';
      document.body.style.overflow = origBodyOverflow;
      document.body.style.overflowY = '';
      document.body.style.height = origBodyHeight;
      if (root) {
        root.style.overflow = origRootOverflow;
        root.style.height = '';
      }
    };
  }, [scrollRef]);

  return null;
}

/**
 * MouseDriver — tracks mouse position and updates mouseParallax.
 *
 * FPS-STYLE CONTROLS: Mouse LEFT → camera turns LEFT → world
 * appears to move RIGHT (like turning your head left).
 *
 * Math (verified empirically via test):
 * - nx = -1 when mouse at far LEFT
 * - parallax.x = +0.05 makes camera turn LEFT (forward.x decreases)
 * - parallax.x = -0.05 makes camera turn RIGHT (forward.x increases)
 * - So mouseParallax.x = -nx * 0.05 (negate nx)
 *
 * Y axis (pitch):
 * - mouseParallax.y = -ny * 0.05: mouse up (ny=-1) → positive parallax → tilts up
 *
 * Pure DOM (outside Canvas).
 */
function MouseDriver() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Normalize to [-1, 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      // FPS-style: mouse-left → camera turns left
      mouseParallax.x = -nx * 0.05;
      mouseParallax.y = -ny * 0.05;
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return null;
}

/**
 * ParallaxCamera — applies 5% mouse-look offset RELATIVE to the
 * ScrollCamera's intended orientation.
 *
 * Bug fix: previous version used premultiply() every frame, which
 * accumulated drift (camera would keep rotating as long as mouse was
 * off-center). Now we just override the rotation each frame with:
 *   camera.quaternion = scrollCameraQuaternion * mouseOffset
 *
 * Result: mouse-look is a FIXED offset from where the scroll camera
 * wants to look, not an accumulating rotation. 5% = subtle parallax.
 *
 * Runs INSIDE Canvas (uses useFrame).
 */
function ParallaxCamera() {
  const { camera } = useThree();
  // Track the most recent scroll camera quaternion (set by ScrollCamera)
  const scrollQuat = useRef(new THREE.Quaternion());

  useFrame(() => {
    // The scroll camera just set the camera's quaternion. We capture it,
    // then overwrite with: scrollRot * mouseOffset
    // This means mouse-look is a FIXED offset on top of scroll camera.

    // Save current (which is the scroll camera's intended rotation)
    scrollQuat.current.copy(camera.quaternion);

    // Compute mouse offset
    const yawAngle = mouseParallax.x;
    const pitchAngle = mouseParallax.y;
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yawAngle
    );
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      pitchAngle
    );

    // Apply: scrollRot * yaw * pitch (yaw first, then pitch in local frame)
    // This gives mouse-look in the SCROLL CAMERA'S local frame, not world frame
    const final = scrollQuat.current.clone().multiply(yawQuat).multiply(pitchQuat);
    camera.quaternion.copy(final);
  });

  return null;
}

export default function WorldCanvas() {
  const scrollRef = useRef<number>(getScrollFromURL());

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 50, near: 0.1, far: 500 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: true,
        }}
        shadows
        style={{ width: '100vw', height: '100vh' }}
        dpr={[1, 2]}
      >
        <World />
        <Path />
        <ScrollCamera scrollRef={scrollRef} />
        <ParallaxCamera />
        <DebugStateUpdater />
      </Canvas>

      {/* Top-left status */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          left: 24,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.3em',
          color: '#555',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        [WORLD v0.6] — SCROLL · MOUSE-LOOK
      </div>

      {/* Top-right scroll indicator */}
      <div
        data-scroll-status
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.3em',
          color: '#555',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        SCROLL: {(scrollRef.current * 100).toFixed(0)}% — scroll to explore
      </div>

      {/* Debug overlay */}
      <DebugOverlay />

      {/* Drivers — outside Canvas, pure DOM */}
      <ScrollDriver scrollRef={scrollRef} />
      <MouseDriver />
    </div>
  );
}