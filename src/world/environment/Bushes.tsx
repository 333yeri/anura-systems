/**
 * Bushes — proper bush shapes (not spheres), blocking line-of-sight in understory
 *
 * User feedback: 'the bushes look like balls not like bushes'
 *
 * Real bushes are:
 * - Wider than tall (1.5-2x wider)
 * - Multi-lobed (multiple bumps clustered together)
 * - Irregular top, not perfect dome
 * - Have visible leaf detail
 *
 * Solution: pre-bake a "bush cluster" geometry — 3-4 overlapping deformed
 * spheres merged into one mesh — then instance it 600 times across the
 * world. Per-instance variation via scale, rotation, color tint.
 *
 * Performance: 1 draw call via InstancedMesh (was already).
 */

import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

// Mulberry32 PRNG
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
  scale: [number, number, number]; // width, height, depth (wider than tall)
  rotationY: number;
  color: [number, number, number];
}

const BUSH_COUNT = 900; // Increased from 500 for wider coverage area

/**
 * Build a single bush cluster geometry — multiple deformed spheres
 * merged into one BufferGeometry. Result: a multi-lobed organic bush shape.
 */
function buildBushClusterGeometry(seed: number): THREE.BufferGeometry {
  const rng = mulberry32(seed);

  // 4-6 overlapping deformed spheres per bush, each scaled and offset
  const lobeCount = 4 + Math.floor(rng() * 3); // 4-6 lobes
  const merged = new THREE.BufferGeometry();

  // Collect merged attributes
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];

  // Bush is wider than tall (1.5x wider on X-axis)
  const baseWidth = 1.0;
  const baseHeight = 0.7; // squashed
  const baseDepth = 0.9;

  for (let lobe = 0; lobe < lobeCount; lobe++) {
    // Each lobe is a sphere offset from center
    const offsetX = (rng() - 0.5) * 0.7;
    const offsetY = (rng() - 0.5) * 0.3; // small Y offset
    const offsetZ = (rng() - 0.5) * 0.6;

    // Each lobe has slightly different size for organic variation
    const lobeSize = 0.45 + rng() * 0.35;

    // Create sphere geometry for this lobe
    const sphereGeo = new THREE.SphereGeometry(lobeSize, 7, 5);

    // Deform vertices slightly (jitter for organic feel)
    const pos = sphereGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Random jitter proportional to radius (more at edges)
      const jitter = 0.15;
      const jx = (rng() - 0.5) * jitter * lobeSize;
      const jy = (rng() - 0.5) * jitter * lobeSize * 0.5;
      const jz = (rng() - 0.5) * jitter * lobeSize;

      pos.setXYZ(i, x + jx, y + jy, z + jz);
    }

    // Apply squash (wider than tall) + offset to lobe position
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(offsetX * baseWidth, offsetY * baseHeight, offsetZ * baseDepth),
      new THREE.Quaternion(),
      new THREE.Vector3(baseWidth, baseHeight, baseDepth)
    );
    sphereGeo.applyMatrix4(matrix);
    sphereGeo.computeVertexNormals();

    // Append this sphere's attributes to merged
    const spherePos = sphereGeo.attributes.position;
    const sphereNorm = sphereGeo.attributes.normal;
    const sphereCount = spherePos.count;

    for (let i = 0; i < sphereCount; i++) {
      positions.push(spherePos.getX(i), spherePos.getY(i), spherePos.getZ(i));
      normals.push(sphereNorm.getX(i), sphereNorm.getY(i), sphereNorm.getZ(i));

      // Each vertex gets same color (color is per-instance via InstancedMesh)
      colors.push(1, 1, 1);
    }

    sphereGeo.dispose();
  }

  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.computeVertexNormals();

  return merged;
}

function buildBushes(seed = 44): BushInstance[] {
  const rng = mulberry32(seed);
  const bushes: BushInstance[] = [];

  // Coverage area: same as background forest (wider for periphery fill)
  const X_MIN = -50;
  const X_MAX = 50;
  const Z_MIN = -110;
  const Z_MAX = 10;

  // Path keyframes (same as Path.tsx)
  const pathKeyframes: Array<[number, number]> = [
    [0, 0], [2, 1], [-2, 3], [-7, 5], [-14, -1], [-19, -6], [-26, -2],
    [-32, 4], [-38, 6], [-44, 10], [-42, 16], [-38, 14], [-36, 14],
  ];

  // CRITICAL: User said "not any tree covering the lens when scrolling"
  // Bushes also respect the camera FOV. We pick a random path sample and
  // place bushes in the 180° arc BEHIND the camera (entire forward half-plane
  // is excluded, plus buffer for mouse-look).
  const pathFlat = pathKeyframes;
  const EXCLUDED_HALF_WIDTH = Math.PI / 2; // 90° = half-plane in front
  const ALLOWED_RANGE = Math.PI; // 180°

  for (let i = 0; i < BUSH_COUNT; i++) {
    // Pick random path sample, then place bush in excluded-arc
    const sampleIdx = Math.floor(rng() * pathFlat.length);
    const [pathX, pathZ] = pathFlat[sampleIdx];

    // Estimate tangent
    const idxNext = Math.min(sampleIdx + 1, pathFlat.length - 1);
    const [pathXNext, pathZNext] = pathFlat[idxNext];
    const tangentX = pathXNext - pathX;
    const tangentZ = pathZNext - pathZ;
    const tangentLen = Math.sqrt(tangentX * tangentX + tangentZ * tangentZ) || 1;
    const tangentAngle = Math.atan2(tangentZ, tangentX);

    // Excluded arc (180° — no bushes in forward half-plane)
    const allowedStart = tangentAngle + EXCLUDED_HALF_WIDTH;
    const angle = allowedStart + rng() * ALLOWED_RANGE;

    // Bushes can be closer than trees (smaller plants) but still outside path corridor
    const minDist = 2.0; // Min bush distance from path (no bushes on the path itself)
    const distance = minDist + rng() * 8; // Up to 10m from path
    const x = pathX + Math.cos(angle) * distance;
    const z = pathZ + Math.sin(angle) * distance;

    // Skip too close to spawn (matches trees: 18m)
    const distToSpawn = Math.sqrt(x * x + (z - 5) ** 2);
    if (distToSpawn < 18) continue;

    // Bush size variation
    const baseScale = 0.4 + rng() * 0.8; // 0.4-1.2m wide
    const widthVar = 0.9 + rng() * 0.3;
    const heightVar = 0.7 + rng() * 0.4;
    const depthVar = 0.85 + rng() * 0.3;

    // Color tint — bright green-yellow for VISIBILITY in dark jungle
    // Higher lightness (0.32-0.50) so they show against dark mud ground
    const hue = 0.28 + (rng() - 0.5) * 0.06;
    const sat = 0.55 + rng() * 0.30;
    const light = 0.32 + rng() * 0.18; // BRIGHT (was 0.22)
    const col = new THREE.Color().setHSL(hue, sat, light);

    bushes.push({
      position: [x, -0.5, z],
      scale: [baseScale * widthVar, baseScale * heightVar, baseScale * depthVar],
      rotationY: rng() * Math.PI * 2,
      color: [col.r, col.g, col.b],
    });
  }

  return bushes;
}

/**
 * Instanced bush renderer
 */
function BushMesh({ instances }: { instances: BushInstance[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Pre-bake ONE bush cluster geometry (random shape, used for all instances)
  const bushGeometry = useMemo(() => buildBushClusterGeometry(45), []);

  useEffect(() => {
    return () => {
      bushGeometry.dispose();
    };
  }, [bushGeometry]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    instances.forEach((bush, i) => {
      dummy.position.set(
        bush.position[0],
        bush.position[1] + bush.scale[1] * 0.3, // lift so bottom is at ground
        bush.position[2]
      );
      dummy.rotation.set(0, bush.rotationY, 0);
      dummy.scale.set(bush.scale[0], bush.scale[1], bush.scale[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.setRGB(bush.color[0], bush.color[1], bush.color[2]);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instances, bushGeometry]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[bushGeometry, undefined, BUSH_COUNT]}
      castShadow={false}
      receiveShadow={false}
    >
      <meshStandardMaterial
        roughness={0.85}
        metalness={0.0}
        vertexColors
        flatShading
        side={THREE.DoubleSide}
        emissive="#1a3a0e"
        emissiveIntensity={0.15}
      />
    </instancedMesh>
  );
}

export default function Bushes() {
  const instances = useMemo(() => buildBushes(44), []);
  return <BushMesh instances={instances} />;
}