/**
 * WorldCanvas — single Canvas that hosts the World + Path + ScrollCamera.
 *
 * Test scroll positions via URL: ?view=world&scroll=0.5
 * (0.0 = start / Act 3 entry, 1.0 = Act 4 reveal)
 *
 * NOTE: Real scroll binding to user scroll happens in M10 final pass.
 * For now, URL param drives the camera so we can test each path segment.
 */

import { Canvas } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
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

export default function WorldCanvas() {
  const scrollRef = useRef<number>(getScrollFromURL());

  // Listen for URL changes (back/forward, manual edit)
  useEffect(() => {
    const handler = () => {
      scrollRef.current = getScrollFromURL();
    };
    window.addEventListener('popstate', handler);
    // Poll for hash/query changes (no popstate for query changes)
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
        camera={{ position: [0, 1.6, 0], fov: 50, near: 0.1, far: 500 }}
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
      </Canvas>

      {/* Status overlay */}
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
        }}
      >
        [WORLD v0.3] — SKY · MOON · GROUND · FOG · TREES · PATH · CAMERA
      </div>

      {/* Scroll position indicator */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.3em',
          color: '#555',
          pointerEvents: 'none',
        }}
      >
        SCROLL: {(scrollRef.current * 100).toFixed(0)}% — try ?view=world&scroll=0.5
      </div>

      {/* Hotkey scroll controls (Q/E for ±5%, A/D for ±0.5%) */}
      <KeyboardScrollDriver scrollRef={scrollRef} />
    </div>
  );
}

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
      // Update URL to reflect scroll
      const url = new URL(window.location.href);
      url.searchParams.set('scroll', scrollRef.current.toFixed(3));
      window.history.replaceState({}, '', url.toString());

      // Update status text directly
      const status = document.querySelector('[data-scroll-status]');
      if (status) status.textContent = `SCROLL: ${(scrollRef.current * 100).toFixed(0)}%`;
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [scrollRef]);
  return null;
}