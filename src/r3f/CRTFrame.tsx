import { forwardRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 1980s CRT monitor — Commodore/Atari style — CREAM/BEIGE plastic.
 *
 * Floats in space. The 3D frog sits in the screen cavity, slowly rotating.
 *
 * Composition (back to front):
 *   - HOUSING: chunky cream/beige plastic shell, slightly squared corners
 *   - BEZEL: multi-step recessed well around the screen
 *   - SCREEN CAVITY: dark inset where the frog renders
 *   - POWER LED: amber emissive sphere with point light
 *   - VENT SLOTS: 14 thin recessed lines on top
 *   - BRAND STRIP: small recessed plate bottom-left
 *   - KNOBS: two control dials bottom-right
 *
 * No stand — the CRT floats. No desk surface.
 */

interface CRTFrameProps {
  children?: React.ReactNode;
}

const HOUSING_W = 2.5;
const HOUSING_H = 1.95;
const HOUSING_D = 1.15;
const SCREEN_W = 1.85;
const SCREEN_H = 1.40;
const Z_FRONT = HOUSING_D / 2;

const CRTFrame = forwardRef<THREE.Group, CRTFrameProps>(function CRTFrame(
  { children },
  ref,
) {
  return (
    <group ref={ref}>
      {/* ===== HOUSING — cream/beige Commodore plastic ===== */}
      <RoundedBox
        args={[HOUSING_W, HOUSING_H, HOUSING_D]}
        radius={0.06}
        smoothness={4}
        creaseAngle={0.4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#e8d9b8"        // warm cream — aged Commodore beige
          roughness={0.55}
          metalness={0.0}
        />
      </RoundedBox>

      {/* ===== INNER BEZEL — recessed well ===== */}
      {/* Step 1: outer frame */}
      <mesh position={[0, 0, Z_FRONT + 0.04]}>
        <boxGeometry args={[SCREEN_W + 0.45, SCREEN_H + 0.45, 0.04]} />
        <meshStandardMaterial color="#1a1410" roughness={0.85} />
      </mesh>
      {/* Step 2: tube cavity */}
      <mesh position={[0, 0, Z_FRONT + 0.085]}>
        <boxGeometry args={[SCREEN_W + 0.18, SCREEN_H + 0.18, 0.04]} />
        <meshStandardMaterial color="#000000" roughness={1.0} />
      </mesh>
      {/* Step 3: bezel frame */}
      <mesh position={[0, 0, Z_FRONT + 0.118]}>
        <boxGeometry args={[SCREEN_W + 0.18, SCREEN_H + 0.18, 0.01]} />
        <meshStandardMaterial color="#3a2f20" roughness={0.55} />
      </mesh>

      {/* ===== SCREEN BACKDROP — light backdrop so frog is visible ===== */}
      <mesh position={[0, 0, Z_FRONT + 0.115]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshStandardMaterial
          color="#2a3530"
          roughness={0.7}
          emissive="#1a2620"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* ===== SCREEN CONTENT — frog + any child meshes ===== */}
      <group position={[0, 0, Z_FRONT + 0.12]}>
        {children}
      </group>

      {/* ===== POWER LED — bottom right ===== */}
      <mesh position={[HOUSING_W / 2 - 0.18, -HOUSING_H / 2 + 0.18, Z_FRONT + 0.13]}>
        <sphereGeometry args={[0.028, 16, 12]} />
        <meshStandardMaterial
          color="#D4AF37"
          emissive="#D4AF37"
          emissiveIntensity={2.5}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        position={[HOUSING_W / 2 - 0.18, -HOUSING_H / 2 + 0.18, Z_FRONT + 0.5]}
        intensity={0.3}
        color="#D4AF37"
        distance={1.5}
        decay={2}
      />

      {/* ===== KNOBS — bottom right of bezel ===== */}
      {[-0.05, 0.18].map((dx, i) => (
        <group
          key={i}
          position={[HOUSING_W / 2 + dx - 0.3, -HOUSING_H / 2 + 0.18, Z_FRONT + 0.13]}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.055, 0.06, 0.05, 18]} />
            <meshStandardMaterial color="#3a2f20" roughness={0.5} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.028, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.008, 18]} />
            <meshStandardMaterial color="#5a4a35" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.033, 0.035]} rotation={[0, 0, i === 0 ? -0.5 : 0.4]}>
            <boxGeometry args={[0.009, 0.002, 0.028]} />
            <meshStandardMaterial color="#aaa" emissive="#666" />
          </mesh>
        </group>
      ))}

      {/* ===== BRAND STRIP — bottom-left of bezel ===== */}
      <mesh position={[-HOUSING_W / 2 + 0.35, -HOUSING_H / 2 + 0.18, Z_FRONT + 0.118]}>
        <boxGeometry args={[0.55, 0.06, 0.005]} />
        <meshStandardMaterial color="#3a2f20" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* ===== VENT SLOTS — top of housing ===== */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = -0.65 + i * 0.1;
        return (
          <mesh
            key={i}
            position={[x, HOUSING_H / 2 + 0.002, -0.25]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.06, 0.02]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        );
      })}
    </group>
  );
});

export default CRTFrame;