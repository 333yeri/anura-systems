/**
 * Act 4 Clearing — fire, log, tent, mug
 *
 * M7: Campfire + log + tent (Act 4 props)
 *
 * User-provided reference (Gemini image, Dec 2026):
 *   - Faceless hooded figure sitting on a log (left of fire)
 *   - Campfire in center (low to ground, warm orange glow)
 *   - Dark red/burgundy tipi tent to the right of fire
 *   - Full moon visible through canopy gap above
 *   - Trees ringing the clearing
 *
 * World position (matches ScrollCamera t=1.0):
 *   - Camera at (14, 1.6, -36) looking at (14, 1.4, -28) (forward = +Z)
 *   - So fire is in front of camera (lower z value, i.e., z > -36 toward camera)
 *   - Wait — camera looks toward -Z (smaller z). So fire is at z > -36 toward camera.
 *   - But the reference shows fire IN FRONT of camera, away from us. So fire is at z < -36.
 *
 * Hmm, let me reconsider. The ScrollCamera at t=1.0 has pos=[14, 1.6, -36] and
 * lookAt=[14, 1.4, -28]. The lookAt is at z=-28, which is LESS NEGATIVE than
 * the camera z=-36. So the camera is looking toward +Z direction
 * (less negative = forward = "ahead" of camera).
 *
 * So in world coords:
 *   - Camera at z=-36
 *   - Looking toward z=-28 (positive Z direction)
 *   - Objects "in front of camera" are at z > -36 (e.g., z=-32, z=-30, etc.)
 *
 * Reference image: fire in center, log+figure to LEFT of fire (lower X),
 * tent to RIGHT of fire (higher X). From the camera's POV.
 *
 * World positions:
 *   - Fire: (14, 0, -32) — directly ahead, ~4m
 *   - Log + Yeri position: (12, 0, -30) — to the left of fire, ~6m from camera
 *   - Tent: (17, 0, -32) — to the right of fire, ~6m from camera
 *   - Mug: (15, 0, -33) — small detail near fire
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ACT 4 world position — matches ScrollCamera t=1.0 keyframe
const ACT4_CENTER = { x: 14, z: -36 };

// Prop positions (relative to ACT4_CENTER)
const FIRE_POS = new THREE.Vector3(ACT4_CENTER.x + 0, 0, ACT4_CENTER.z + 4);   // directly ahead of camera
const LOG_POS  = new THREE.Vector3(ACT4_CENTER.x - 2, 0, ACT4_CENTER.z + 6);   // to the LEFT of fire
const TENT_POS = new THREE.Vector3(ACT4_CENTER.x + 3, 0, ACT4_CENTER.z + 4);   // to the RIGHT of fire
const MUG_POS  = new THREE.Vector3(ACT4_CENTER.x + 1, 0, ACT4_CENTER.z + 5);   // near fire (right side)

/**
 * The campfire — 3 logs in teepee formation + central flame mesh
 * + a strong warm point light. The flame mesh is a small bright sphere
 * with emissive material; the logs are 3 cylinders arranged like a teepee.
 */
function Campfire() {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Subtle flame flicker (modulates light intensity over time)
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (lightRef.current) {
      // Flicker intensity around base value 4.5
      const flicker = Math.sin(t * 12.0) * 0.3 + Math.sin(t * 23.7) * 0.2 + Math.sin(t * 7.3) * 0.15;
      lightRef.current.intensity = 4.5 + flicker;
    }
    if (flameMatRef.current) {
      // Pulse emissive intensity slightly
      const pulse = Math.sin(t * 9.0) * 0.15 + 0.85;
      flameMatRef.current.emissiveIntensity = 2.5 * pulse;
    }
  });

  return (
    <group position={FIRE_POS}>
      {/* 3 logs in teepee formation — each tilted toward the center */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2; // 0°, 120°, 240°
        const tilt = 0.45; // radians from vertical
        return (
          <mesh
            key={`log-${i}`}
            position={[
              Math.cos(angle) * 0.3,
              0.3,
              Math.sin(angle) * 0.3,
            ]}
            rotation={[
              Math.sin(angle) * tilt,
              angle,
              -Math.cos(angle) * tilt,
            ]}
            castShadow
          >
            <cylinderGeometry args={[0.06, 0.08, 0.7, 8]} />
            <meshStandardMaterial
              color="#2A1A0E"
              roughness={0.95}
              metalness={0.0}
            />
          </mesh>
        );
      })}

      {/* Charred ground beneath the fire (darker, slightly emissive) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshStandardMaterial
          color="#0A0604"
          emissive="#331100"
          emissiveIntensity={0.6}
          roughness={1.0}
        />
      </mesh>

      {/* Flame core — bright sphere with strong emissive */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.15, 12, 8]} />
        <meshStandardMaterial
          ref={flameMatRef}
          color="#FFD180"
          emissive="#FF6F00"
          emissiveIntensity={2.5}
          roughness={0.3}
          metalness={0.0}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Outer flame glow — slightly larger, more transparent */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial
          color="#FFB74D"
          emissive="#FF8F00"
          emissiveIntensity={1.2}
          roughness={0.5}
          metalness={0.0}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* The KEY element: warm point light that lights the scene */}
      <pointLight
        ref={lightRef}
        position={[0, 0.5, 0]}
        intensity={4.5}
        distance={12}        // ~6m effective radius
        decay={2}
        color="#FF8C42"     // warm orange-amber
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.002}
      />

      {/* Secondary lower light for ground illumination (more orange, more decay) */}
      <pointLight
        position={[0, 0.1, 0]}
        intensity={1.5}
        distance={5}
        decay={2.5}
        color="#FF6F1A"
      />
    </group>
  );
}

/**
 * The log that Yeri will sit on (M6). For now, just a dark log
 * with the fire's light raking across it.
 */
function SittingLog() {
  return (
    <group position={LOG_POS}>
      {/* Main log body — horizontal cylinder */}
      <mesh
        position={[0, 0.3, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.22, 0.25, 2.2, 12]} />
        <meshStandardMaterial
          color="#1A0F08"
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>

      {/* End caps with a bit of bark detail (slight color variation) */}
      <mesh position={[1.1, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 12]} />
        <meshStandardMaterial color="#0F0805" roughness={1.0} />
      </mesh>
      <mesh position={[-1.1, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 12]} />
        <meshStandardMaterial color="#0F0805" roughness={1.0} />
      </mesh>

      {/* Small support underneath (logs don't float) */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2.4, 0.1, 0.6]} />
        <meshStandardMaterial color="#0A0604" roughness={1.0} />
      </mesh>
    </group>
  );
}

/**
 * The tipi/triangle tent — dark red/burgundy canvas, peaked at top.
 * 3-sided cone (triangular pyramid) for the canvas shape.
 */
function Tent() {
  // Slight tilt for "lived-in" feel
  const tiltX = -0.08; // tilt slightly forward
  const tiltZ = 0.05;  // tilt slightly right
  const rotationY = 0.15; // rotate slightly to face camera at an angle

  return (
    <group
      position={TENT_POS}
      rotation={[tiltX, rotationY, tiltZ]}
    >
      {/* Main tent body — triangular prism using cone with 3 radial segments */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.2, 1.8, 3]} />
        <meshStandardMaterial
          color="#6B1A20"  // dark burgundy red
          emissive="#2A0810"  // very subtle dark red glow (firelight bounce)
          emissiveIntensity={0.15}
          roughness={0.85}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tent entrance — small dark triangular cutout at front */}
      <mesh position={[0, 0.5, 0.3]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 3]} />
        <meshStandardMaterial
          color="#0A0604"
          roughness={1.0}
        />
      </mesh>

      {/* Tent pole peeking out the top */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color="#3A2A1A" roughness={0.9} />
      </mesh>

      {/* Subtle ground stain under tent (slight darker patch) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 12]} />
        <meshStandardMaterial
          color="#0A0805"
          roughness={1.0}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

/**
 * A small mug near the fire — adds lived-in detail.
 */
function Mug() {
  return (
    <group position={MUG_POS} rotation={[0, 0.4, 0]}>
      {/* Mug body */}
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.045, 0.14, 12]} />
        <meshStandardMaterial color="#5A4A3A" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Handle (small torus) */}
      <mesh position={[0.06, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.01, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#5A4A3A" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Smoke — a few drifting particles above the fire. Simple spheres
 * that drift upward and fade.
 */
function Smoke() {
  const groupRef = useRef<THREE.Group>(null);
  const particleRefs = useRef<THREE.Mesh[]>([]);

  // Use 5 smoke particles
  const particles = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      offsetX: (Math.random() - 0.5) * 0.3,
      offsetZ: (Math.random() - 0.5) * 0.3,
      phase: i * 0.4,
      baseY: 0.5 + i * 0.6,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    particleRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = particles[i];
      const y = p.baseY + ((t * 0.4 + p.phase) % 3.0);
      const x = p.offsetX + Math.sin(t * 0.5 + p.phase) * 0.1;
      const z = p.offsetZ + Math.cos(t * 0.5 + p.phase) * 0.1;
      mesh.position.set(x, y, z);
      // Fade with height
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 0.4 - (y - p.baseY) * 0.15);
      }
    });
  });

  return (
    <group ref={groupRef} position={FIRE_POS}>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) particleRefs.current[i] = el; }}
          position={[p.offsetX, p.baseY, p.offsetZ]}
        >
          <sphereGeometry args={[0.08, 6, 4]} />
          <meshStandardMaterial
            color="#888888"
            transparent
            opacity={0.4}
            roughness={1.0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Act 4 props — exported as a single component for easy mounting
 */
export default function Act4Props() {
  return (
    <group>
      <Campfire />
      <SittingLog />
      <Tent />
      <Mug />
      <Smoke />
    </group>
  );
}
