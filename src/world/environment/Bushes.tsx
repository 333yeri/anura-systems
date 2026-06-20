/**
 * Bushes — dense low understory that blocks line of sight
 *
 * User feedback: 'we need more bushes to fill so we cant look further ahead'
 *
 * Trees are tall (7-12m) but the user can see far between them.
 * Bushes fill the understory — 0.5-1.5m tall — blocking sight lines
 * along the path so the journey feels enclosed and intimate.
 *
 * Bushes are scattered DENSELY across the entire world area, including
 * right next to the path. They use simple sphere geometry (no GLB
 * needed) for performance — 500+ bushes would crash if we used GLBs.
 */

import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Mulberry32 PRNG for deterministic layout
function mulberry32(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BushInstance {
  position: [number, number, number];
  scale: number;
  rotationY: number;
  color: [number, number, number]; // vertex color tint
}

const BUSH_COUNT = 600;

function buildBushes(seed = 44): BushInstance[] {
  const rng = mulberry32(seed);
  const bushes: BushInstance[] = [];

  // Coverage area: same as background forest
  const X_MIN = -30;
  const X_MAX = 30;
  const Z_MIN = -90;
  const Z_MAX = 5;

  // Path keyframes (same as Path.tsx) for path corridor exclusion
  const pathKeyframes: Array<[number, number]> = [
    [0, 0], [2, 1], [-2, 3], [-7, 5], [-14, -1], [-19, -6], [-26, -2],
    [-32, 4], [-38, 6], [-44, 10], [-42, 16], [-38, 14], [-36, 14],
  ];

  for (let i = 0; i < BUSH_COUNT; i++) {
    // Random position in world area
    const x = X_MIN + rng() * (X_MAX - X_MIN);
    const z = Z_MIN + rng() * (Z_MAX - Z_MIN);

    // Skip too close to spawn (let spawn view be clear)
    const distToSpawn = Math.sqrt(x * x + (z - 5) ** 2);
    if (distToSpawn < 14) continue;

    // Skip path corridor — but smaller than trees (1.5m so bushes can crowd the path edges)
    let tooCloseToPath = false;
    for (const [px, pz] of pathKeyframes) {
      const dist = Math.sqrt((x - px) ** 2 + (z - pz) ** 2);
      if (dist < 1.5) {
        tooCloseToPath = true;
        break;
      }
    }
    if (tooCloseToPath) continue;

    // Small scale (0.5-1.5m tall bushes)
    const scaleRoll = rng();
    let scale: number;
    if (scaleRoll < 0.6) {
      scale = 0.4 + rng() * 0.3; // 0.4-0.7m (small ferns)
    } else if (scaleRoll < 0.9) {
      scale = 0.7 + rng() * 0.5; // 0.7-1.2m (medium bushes)
    } else {
      scale = 1.2 + rng() * 0.4; // 1.2-1.6m (large bushes)
    }

    // Color tint — variations of dark green
    const hue = 0.30 + (rng() - 0.5) * 0.06; // green hue
    const sat = 0.55 + rng() * 0.25;
    const light = 0.18 + rng() * 0.10; // lighter (was 0.08) — reads as foliage not shadow
    const col = new THREE.Color().setHSL(hue, sat, light);

    bushes.push({
      position: [x, -0.5, z],
      scale,
      rotationY: rng() * Math.PI * 2,
      color: [col.r, col.g, col.b],
    });
  }

  return bushes;
}

/**
 * Single Bush — instanced sphere with vertex colors.
 *
 * Using InstancedMesh for performance (600 instances, 1 draw call).
 */
function BushMesh({ instances }: { instances: BushInstance[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    instances.forEach((bush, i) => {
      dummy.position.set(bush.position[0], bush.position[1] + bush.scale * 0.5, bush.position[2]);
      dummy.rotation.set(0, bush.rotationY, 0);
      dummy.scale.setScalar(bush.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.setRGB(bush.color[0], bush.color[1], bush.color[2]);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instances]);

  // Animate gentle sway (very subtle)
  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // No need to animate for now — bushes are static
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, BUSH_COUNT]}
      castShadow={false}
      receiveShadow={false}
    >
      {/* Slightly higher subdivision for organic look */}
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial
        roughness={0.9}
        metalness={0.0}
        vertexColors
        flatShading
      />
    </instancedMesh>
  );
}

export default function Bushes() {
  const instances = useMemo(() => buildBushes(44), []);
  return <BushMesh instances={instances} />;
}