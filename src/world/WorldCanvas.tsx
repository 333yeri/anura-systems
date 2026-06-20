/**
 * WorldCanvas — single Canvas that hosts the World + Path + ScrollCamera.
 * Debug overlay is OUTSIDE the canvas, polls the THREE scene via ref.
 *
 * Test scroll positions via URL: ?view=world&scroll=0.5
 * Keyboard: Q/E = ±5%, A/D = ±0.5%, 0 = start, 1 = Act 4 settled.
 */

import { Canvas, useThree } from '@react-three/fiber';
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

/**
 * R3F component that updates debugState on a slow interval.
 * Runs INSIDE Canvas so it has access to camera + scene.
 * Also exposes tree positions to window for browser console inspection.
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

      // Expose to window for Playwright inspection
      if (typeof window !== 'undefined') {
        (window as any).__anuraState = {
          camPos: { ...debugState.camPos },
          lookAt: { ...debugState.lookAt },
          nearestTree: debugState.nearestTree,
          visibleTrees: debugState.visibleTrees,
          treeCount: positions.length,
          treePositions: positions.slice(0, 30), // limit for debugging
        };
      }
    }, 200);

    return () => clearInterval(interval);
  }, [camera, scene]);

  return null;
}

/**
 * DOM overlay that polls debugState and displays.
 * OUTSIDE Canvas so it renders in regular React tree.
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

export default function WorldCanvas() {
  const scrollRef = useRef<number>(getScrollFromURL());

  useEffect(() => {
    const handler = () => {
      scrollRef.current = getScrollFromURL();
    };
    window.addEventListener('popstate', handler);
    const interval = setInterval(handler, 500);
    return () => {
      window.removeEventListener('popstate', handler);
      clearInterval(interval);
    };
  }, []);

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
        [WORLD v0.5] — SKY · MOON · GROUND · FOG · TREES · PATH · CAMERA
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
        SCROLL: {(scrollRef.current * 100).toFixed(0)}%
      </div>

      {/* Debug overlay (outside Canvas) */}
      <DebugOverlay />

      <KeyboardScrollDriver scrollRef={scrollRef} />
    </div>
  );
}

/**
 * KeyboardScrollDriver — Q/E for ±5%, A/D for ±0.5%, 0 = start, 1 = end.
 */
function KeyboardScrollDriver({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'Q') {
        scrollRef.current = THREE.MathUtils.clamp(scrollRef.current - 0.05, 0, 1);
      } else if (e.key === 'e' || e.key === 'E') {
        scrollRef.current = THREE.MathUtils.clamp(scrollRef.current + 0.05, 0, 1);
      } else if (e.key === 'a' || e.key === 'A') {
        scrollRef.current = THREE.MathUtils.clamp(scrollRef.current - 0.005, 0, 1);
      } else if (e.key === 'd' || e.key === 'D') {
        scrollRef.current = THREE.MathUtils.clamp(scrollRef.current + 0.005, 0, 1);
      } else if (e.key === '0') {
        scrollRef.current = 0;
      } else if (e.key === '1') {
        scrollRef.current = 1;
      }
      const url = new URL(window.location.href);
      url.searchParams.set('scroll', scrollRef.current.toFixed(3));
      window.history.replaceState({}, '', url.toString());

      const status = document.querySelector('[data-scroll-status]');
      if (status) status.textContent = `SCROLL: ${(scrollRef.current * 100).toFixed(0)}%`;
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [scrollRef]);
  return null;
}