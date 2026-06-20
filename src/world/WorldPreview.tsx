/**
 * WorldPreview — A standalone preview of the World skeleton.
 *
 * Mounts the World inside a Canvas. Use for testing the world
 * build in isolation before wiring it into the full scroll-driven
 * experience.
 *
 * Access via: ?view=world (handled by App.tsx)
 */

import { Canvas } from '@react-three/fiber';
import World from './World';

export default function WorldPreview() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.6, 6], fov: 50, near: 0.1, far: 500 }}
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
      </Canvas>

      {/* Status overlay — confirms build is running */}
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
        [WORLD v0.1] — SKY · MOON · GROUND · FOG · TREES
      </div>
    </div>
  );
}