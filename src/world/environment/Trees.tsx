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

  // Forest zones (z ranges, matching the locked forest progression):
  //   entry (open):      z = -2 to -10, spacing 4-6m, total ~6 trees (close to camera)
  //   transition:        z = -10 to -20, spacing 4-6m, total ~6 trees
  //   dense rainforest:  z = -20 to -50, spacing 2-3m, total ~14 trees (hero)
  //   opening up:        z = -50 to -80, spacing 4-6m, total ~8 trees
  //   clearing:          z = -80 to -110, spacing 8-12m, total ~5 trees (framing)
  // Trees frame the path (centered ~2m wide corridor kept clear).

  type Zone = { zMin: number; zMax: number; count: number; isHero: boolean; xSpread: number };
  const zones: Zone[] = [
    { zMin: -2,   zMax: -10,  count: 6,  isHero: false, xSpread: 8  },  // entry
    { zMin: -10,  zMax: -20,  count: 6,  isHero: false, xSpread: 9  },  // transition
    { zMin: -20,  zMax: -50,  count: 14, isHero: true,  xSpread: 8  },  // dense rainforest
    { zMin: -50,  zMax: -80,  count: 8,  isHero: false, xSpread: 9  },  // opening up
    { zMin: -80,  zMax: -110, count: 5,  isHero: false, xSpread: 11 },  // clearing frames
  ];

  for (const zone of zones) {
    for (let i = 0; i < zone.count; i++) {
      // Evenly distribute z within zone, with jitter
      const zBase = zone.zMin + (i / Math.max(zone.count - 1, 1)) * (zone.zMax - zone.zMin);
      const z = zBase + (rng() - 0.5) * 2.5; // ±1.25m z jitter

      // Skip a 2.2m-wide corridor down center (where the path will be)
      let x: number;
      let attempts = 0;
      do {
        x = (rng() - 0.5) * 2 * zone.xSpread;
        attempts++;
      } while (Math.abs(x) < 2.2 && attempts < 6);

      // Scale variation
      let scale: number;
      if (zone.isHero) {
        scale = 1.2 + rng() * 0.5;  // 1.2-1.7x for hero (dense rainforest, larger trees)
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