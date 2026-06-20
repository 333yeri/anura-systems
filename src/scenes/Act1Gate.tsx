import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import CRTFrame from '../r3f/CRTFrame';
import Frog from '../r3f/Frog';
import LoadingBar from '../components/LoadingBar';
import Terminal from '../components/Terminal';
import { useProgress } from '../lib/useProgress';

interface Act1GateProps {
  onComplete: () => void;
}

const TERMINAL_LINES = [
  'INITIALIZING ANURA SYSTEMS...',
  'BIOSENSORS ONLINE...',
  'SWAMP_VOLUME DETECTED...',
  'LANDING SEQUENCE ARMED...',
  'GATE OPEN',
];

/**
 * Act 1 — The Gate.
 *
 * - Cream CRT floats in pure black void (no desk, no environment)
 * - Slow ambient bob on the CRT itself
 * - Stylized 3D frog inside the screen, slowly rotating Y-axis (Minecraft hover)
 * - HUD overlay: chunky loading bar above the frog, terminal text below
 * - When progress hits 100: brief screen-out, then transition to Act 2
 */
export default function Act1Gate({ onComplete }: Act1GateProps) {
  const { progress, phase } = useProgress();

  useEffect(() => {
    if (progress >= 99.5) {
      const t = setTimeout(onComplete, 1000);
      return () => clearTimeout(t);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, #0e0e0e 0%, #050505 70%)',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.2, 5.5], fov: 30 }}
        gl={{ antialias: true }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* warm key light from upper-right, like a sun-through-window */}
        <directionalLight position={[4, 5, 5]} intensity={1.5} color="#FFE8C0" />
        {/* cool fill from the opposite side */}
        <directionalLight position={[-4, 2, 3]} intensity={0.7} color="#7a8b5a" />
        {/* amber rim light from behind */}
        <directionalLight position={[0, 2, -4]} intensity={0.6} color="#D4AF37" />
        <ambientLight intensity={0.5} />

        <FloatingCRT>
          <Frog scale={0.55} position={[0, 0, 0]} />
        </FloatingCRT>
      </Canvas>

      {/* ===== HUD overlay — positioned over the CRT screen area ===== */}
      <div
        style={{
          position: 'fixed',
          left: '22%',
          right: '22%',
          top: '28%',
          bottom: '28%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* loading bar at top of screen */}
        <LoadingBar progress={progress} />

        {/* middle spacer — the frog lives here in 3D, HUD leaves room */}
        <div />

        {/* terminal at bottom of screen */}
        <Terminal
          lines={TERMINAL_LINES}
          startProgress={4}
          endProgress={62}
          globalProgress={progress}
        />
      </div>

      {/* ===== Footer status line ===== */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.3em',
          color: '#555',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        [ACT 1 / 5] — THE GATE · {phase.toUpperCase()}
      </div>
    </motion.div>
  );
}

/** CRT floats in space — slow Y bob + tiny rotation drift */
function FloatingCRT({ children }: { children?: React.ReactNode }) {
  const ref = useRef<{ position: { y: number }; rotation: { z: number } } | null>(null);
  // We use a ref to a wrapped Group, set up via R3F
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const grp = (ref as any).current;
    if (grp) {
      grp.position.y = Math.sin(t * 0.6) * 0.08;
      grp.rotation.z = Math.sin(t * 0.4) * 0.015;
    }
  });
  return (
    <group ref={ref as any}>
      <CRTFrame>{children}</CRTFrame>
    </group>
  );
}