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
import { samplePathPoints } from './Path';

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

  // Sample the actual camera path curve at 80 points to get [x, z] along it
  const pathPoints = samplePathPoints(80);

  // For each path segment between samples, place trees on both sides.
  // Density zones match the user's diagram progression:
  //   entry (open):       4 trees per side
  //   transition:         6 trees per side
  //   dense rainforest:   10 trees per side (hero)
  //   opening up:         6 trees per side
  //   U-turn + clearing:  4 trees per side

  type Zone = {
    sampleRange: [number, number]; // range of path indices to cover
    countPerSide: number;
    sideSpread: number;     // distance from path center to tree
    isHero: boolean;
  };

  const zones: Zone[] = [
    // Entry zone: skip first 12 samples (spawn area) so trees never block the camera.
    // Trees start where the path actually bends away from camera forward direction.
    { sampleRange: [12, 22],  countPerSide: 4,  sideSpread: 4.5, isHero: false }, // entry
    { sampleRange: [22, 35],  countPerSide: 6,  sideSpread: 3.2, isHero: false }, // transition
    { sampleRange: [35, 60],  countPerSide: 10, sideSpread: 2.5, isHero: true  }, // dense rainforest
    { sampleRange: [60, 72],  countPerSide: 6,  sideSpread: 3.5, isHero: false }, // opening up
    { sampleRange: [72, 80],  countPerSide: 4,  sideSpread: 5.5, isHero: false }, // 90° turn + clearing
  ];

  for (const zone of zones) {
    const [startIdx, endIdx] = zone.sampleRange;
    const treesPerSide = zone.countPerSide;

    for (let side = -1; side <= 1; side += 2) {
      // Evenly distribute tree count across the path range
      for (let i = 0; i < treesPerSide; i++) {
        // Pick a sample index within the zone (with jitter)
        const sampleT = (i + 0.5) / treesPerSide; // 0 to 1
        const jitter = (rng() - 0.5) / treesPerSide * 0.5;
        const sampleIdx = Math.round(startIdx + (endIdx - startIdx) * (sampleT + jitter));
        const idx = Math.max(0, Math.min(pathPoints.length - 1, sampleIdx));

        const [pathX, pathZ] = pathPoints[idx];

        // Offset perpendicular to path tangent at this sample
        // (sample neighboring points to estimate tangent)
        const idxNext = Math.min(idx + 1, pathPoints.length - 1);
        const [pathXNext, pathZNext] = pathPoints[idxNext];
        const tangentX = pathXNext - pathX;
        const tangentZ = pathZNext - pathZ;
        const tangentLen = Math.sqrt(tangentX * tangentX + tangentZ * tangentZ) || 1;
        // Perpendicular: rotate tangent 90° (so cross product with up vector)
        // left perpendicular: (-tangentZ, tangentX) / len
        const perpX = -tangentZ / tangentLen;
        const perpZ = tangentX / tangentLen;

        const sideOffset = zone.sideSpread + rng() * 1.2;
        const x = pathX + perpX * side * sideOffset;
        const z = pathZ + perpZ * side * sideOffset;

        // Scale variation — note: GLOBAL_SCALE = 0.025, so per-instance
        // scale 1.0-1.8 gives tree height ~1.5-3m (realistic jungle size)
        let scale: number;
        if (zone.isHero) {
          scale = 1.4 + rng() * 0.4;  // 1.4-1.8x for hero (dense rainforest, larger trees)
        } else {
          scale = 0.9 + rng() * 0.7;  // 0.9-1.6x general
        }

        // Variant selection — weight hero variants (v01, v04) in hero zones
        let variant: number;
        if (zone.isHero) {
          const r = rng();
          variant = r < 0.4 ? 0 : r < 0.7 ? 3 : Math.floor(rng() * 5);
        } else {
          variant = Math.floor(rng() * 5);
        }

        trees.push({
          variant,
          position: [x, -0.5, z],
          scale,
          rotationY: rng() * Math.PI * 2,
          hueShift: (rng() - 0.5) * 0.1,
          isHero: zone.isHero,
        });
      }
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
  // World scale is ~1 unit = 1 meter.
  // GLOBAL_SCALE = 0.025 makes trees 0.5-1.5m tall in-scene — realistic understory size
  // (smaller so they don't fill the frame when camera is close)
  const instances = useMemo(() => buildForest(42), []);
  const GLOBAL_SCALE = 0.025;

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