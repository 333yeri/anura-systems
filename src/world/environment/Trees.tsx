/**
 * Trees — M2: Real tree GLBs with variation system
 *
 * Replaces the lollipop placeholders from M1 with real tree GLBs
 * (tree__v01-v05) loaded via useGLTF. Uses a single tree variant
 * picked at random per placement, with per-instance scale + rotation
 * + hue jitter variation.
 *
 * Forest progression (per locked architecture):
 *   - Open entry (scroll 25-35%): wide spacing, mixed scales
 *   - Dense rainforest (scroll 45-75%): tight spacing, mostly hero trees
 *   - Opening (scroll 75-95%): mid spacing, mixed
 *   - Clearing (scroll 95-100%): wide spacing, framing only
 *
 * Since we don't have the scroll path yet (M10), we use STATIC
 * placement with the same density curve as if the camera was at
 * each point. Will be wired to scroll-driven positioning in M10.
 */

import { useMemo, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { palette, hexToVec3 } from '../../shared/palette';

// All 5 tree GLBs (preloaded)
const TREE_PATHS = [
  '/assets/models/tree__v01.glb',
  '/assets/models/tree__v02.glb',
  '/assets/models/tree__v03.glb',
  '/assets/models/tree__v04.glb',
  '/assets/models/tree__v05.glb',
];

// Preload all
TREE_PATHS.forEach((p) => useGLTF.preload(p));

// Mulberry32 — deterministic PRNG so the forest is identical across reloads
function mulberry32(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface TreeInstance {
  variant: number;       // which GLB (0-4)
  position: [number, number, number];
  scale: number;         // uniform scale factor
  rotationY: number;     // Y rotation in radians
  hueShift: number;      // small hue jitter (-0.05 to +0.05)
  isHero: boolean;       // true = larger, denser placement zone
}

function buildForest(seed = 42): TreeInstance[] {
  const rng = mulberry32(seed);
  const trees: TreeInstance[] = [];

  type Zone = { zMin: number; zMax: number; count: number; isHero: boolean; sideSpread: number };

  // Curved path keyframes (must match Path.tsx PATH_KEYFRAMES for curve points)
  // Each row: [z, x] — used to place trees ALONG the path, offset to the sides
  const pathPoints: Array<[number, number]> = [
    [0, 0], [-3, 1.2], [-8, 2.5], [-14, 3], [-22, -1],
    [-28, -5], [-34, 0], [-40, 4], [-46, 6], [-52, 9],
    [-55, 12], [-57, 13], [-60, 14],
  ];

  const zones: Zone[] = [
    { zMin: -2,   zMax: -10,  count: 8,  isHero: false, sideSpread: 4 },  // entry
    { zMin: -10,  zMax: -22,  count: 10, isHero: false, sideSpread: 3.5 }, // transition
    { zMin: -22,  zMax: -46,  count: 24, isHero: true,  sideSpread: 2.8 }, // dense rainforest
    { zMin: -46,  zMax: -54,  count: 8,  isHero: false, sideSpread: 4 },  // opening up
    { zMin: -54,  zMax: -60,  count: 6,  isHero: false, sideSpread: 5 },  // clearing frames
  ];

  for (const zone of zones) {
    for (let i = 0; i < zone.count; i++) {
      // Pick a z within the zone
      const z = zone.zMin + (i / Math.max(zone.count - 1, 1)) * (zone.zMax - zone.zMin);
      const zJitter = z + (rng() - 0.5) * 1.5;
      const finalZ = Math.max(zone.zMin, Math.min(zone.zMax, zJitter));

      // Estimate path x at this z (linear interpolation between keyframes)
      let pathX = 0;
      for (let p = 0; p < pathPoints.length - 1; p++) {
        const [z1, x1] = pathPoints[p];
        const [z2, x2] = pathPoints[p + 1];
        if (finalZ >= Math.min(z1, z2) && finalZ <= Math.max(z1, z2)) {
          const t = (finalZ - z1) / (z2 - z1 || 1);
          pathX = x1 + (x2 - x1) * t;
          break;
        }
      }

      // Place trees to LEFT and RIGHT of path (alternate sides)
      const side = i % 2 === 0 ? -1 : 1;
      const sideOffset = zone.sideSpread + rng() * 1.5;
      const x = pathX + side * sideOffset;

      // Scale variation
      let scale: number;
      if (zone.isHero) {
        scale = 1.2 + rng() * 0.5;  // 1.2-1.7x for hero (dense rainforest, larger trees)
      } else {
        scale = 0.9 + rng() * 0.7;  // 0.9-1.6x general
      }

      // Variant selection
      let variant: number;
      if (zone.isHero) {
        const r = rng();
        variant = r < 0.4 ? 0 : r < 0.7 ? 3 : Math.floor(rng() * 5);
      } else {
        variant = Math.floor(rng() * 5);
      }

      trees.push({
        variant,
        position: [x, -0.5, finalZ],
        scale,
        rotationY: rng() * Math.PI * 2,
        hueShift: (rng() - 0.5) * 0.1,
        isHero: zone.isHero,
      });
    }
  }

  return trees;
}

/**
 * Single tree group — clones a loaded GLB scene, applies per-instance
 * transforms and material variation.
 */
function TreeInstance({ inst, treeScenes }: { inst: TreeInstance; treeScenes: THREE.Group[] }) {
  const ref = useRef<THREE.Group>(null);
  const scene = treeScenes[inst.variant];

  // Clone once per instance so we can tweak materials without affecting others
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    // Apply hue shift to leaf material only
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.MeshStandardMaterial;
        if (mat && mat.name && mat.name.toLowerCase().includes('leav')) {
          // Clone material so we can tweak per-instance
          const newMat = mat.clone();
          // Hue shift via color
          const baseColor = new THREE.Color(mat.color.getHex());
          const hsl = { h: 0, s: 0, l: 0 };
          baseColor.getHSL(hsl);
          hsl.h = (hsl.h + inst.hueShift + 1) % 1;
          hsl.s = Math.max(0.2, Math.min(0.8, hsl.s));  // clamp saturation
          newMat.color.setHSL(hsl.h, hsl.s, hsl.l);
          obj.material = newMat;
        }
      }
    });
    return c;
  }, [scene, inst.hueShift]);

  return (
    <group ref={ref} position={inst.position} rotation={[0, inst.rotationY, 0]} scale={inst.scale}>
      <primitive object={cloned} />
    </group>
  );
}

export default function Trees() {
  // Load all 5 tree GLBs
  const treeScenes = TREE_PATHS.map((p) => useGLTF(p).scene);

  // Build deterministic forest layout
  // NOTE: tree GLBs are sized 20-60 units in their source files (per inspection).
  // World scale is ~1 unit = 1 meter, so we apply GLOBAL_SCALE = 0.04 to make
  // trees ~1-2.5m tall in-scene (realistic tree size).
  const instances = useMemo(() => buildForest(42), []);
  const GLOBAL_SCALE = 0.04;

  // Cast shadows for hero trees only (perf optimization)
  useEffect(() => {
    treeScenes.forEach((scene) => {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.castShadow = true;
          obj.receiveShadow = false;
        }
      });
    });
  }, [treeScenes]);

  return (
    <group scale={GLOBAL_SCALE}>
      {instances.map((inst, i) => (
        <TreeInstance key={i} inst={inst} treeScenes={treeScenes} />
      ))}
    </group>
  );
}