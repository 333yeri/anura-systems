/**
 * Path — M3 + M10 combined: muddy trail strip + scroll-driven camera path.
 *
 * The path is BOTH the visible muddy trail AND the camera curve.
 * One CatmullRomCurve3 defines:
 *   - The geometry of the trail mesh (sweep a rectangle along it)
 *   - The keyframes the camera follows as the user scrolls
 *
 * Per user diagram (2026-06-20):
 *   - Bottom: green dot = Act 3 start (frog spawn point)
 *   - Up-right: open forest, clear sky above (entry)
 *   - Snake through 6 dense jungle zones (red circles = dense tree clusters)
 *   - Big S-curve through dense jungle (no preview of what's coming)
 *   - Sharp right turn at top
 *   - Act 4 reveal (orange dot) — clearing appears around corner
 *   - Exit jungle → moon returns → cozy
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { palette, hexToVec3 } from '../../shared/palette';

// =================================================================
// PATH KEYFRAMES (12 keyframes matching the user diagram)
// =================================================================
// z = forward (negative = away from start)
// x = left/right
// y = ground level (0)
// t = scroll position (0 = start, 1 = end)
//
// Keyframes define both:
//   1. The CatmullRomCurve3 the camera follows
//   2. The trail mesh swept along the curve
//
// This is the LOCKED camera path per the user diagram.
// Don't modify without explicit user approval.

export const PATH_KEYFRAMES: Array<{ pos: [number, number, number]; lookAt: [number, number, number]; t: number; label: string }> = [
  // Act 3 entry — open forest, clear sky
  { t: 0.00, pos: [0, 1.6, 0],    lookAt: [1, 1.6, -3],   label: 'frog spawn / Act 3 start' },
  { t: 0.05, pos: [1.0, 1.6, -3], lookAt: [2.5, 1.6, -7], label: 'enter jungle — first turn right' },

  // First big bend through jungle (trees should be visible left/right here)
  { t: 0.12, pos: [3, 1.6, -7],   lookAt: [5, 1.6, -12],  label: 'snake through dense 1' },
  { t: 0.20, pos: [5, 1.6, -13],  lookAt: [2, 1.6, -18],  label: 'curve back-left' },
  { t: 0.28, pos: [1, 1.6, -19],  lookAt: [-3, 1.6, -22], label: 'swing left' },

  // Dense jungle S-curve (no preview of what's coming)
  { t: 0.36, pos: [-4, 1.6, -22], lookAt: [-7, 1.6, -27], label: 'dense jungle left' },
  { t: 0.44, pos: [-8, 1.6, -28], lookAt: [-4, 1.6, -33], label: 'dense jungle S-curve' },
  { t: 0.52, pos: [-2, 1.6, -34], lookAt: [2, 1.6, -38], label: 'dense jungle back-right' },
  { t: 0.60, pos: [4, 1.6, -39],  lookAt: [7, 1.6, -42], label: 'dense jungle right' },
  { t: 0.68, pos: [8, 1.6, -43],  lookAt: [5, 1.6, -48], label: 'dense jungle final' },

  // Pre-U-turn approach — bend right then back left
  { t: 0.76, pos: [3, 1.6, -49],  lookAt: [-2, 1.6, -53], label: 'sharp turn to left (back)' },

  // U-TURN — the camera turns 180° here, looking back at what was behind
  { t: 0.84, pos: [-3, 1.6, -55], lookAt: [0, 1.6, -50], label: 'U-turn start — looking back' },
  { t: 0.90, pos: [-2, 1.6, -52], lookAt: [2, 1.6, -50], label: 'U-turn mid — sweeping right' },
  { t: 0.95, pos: [2, 1.6, -51],  lookAt: [6, 1.6, -52], label: 'U-turn end — facing forward+right' },

  // Act 4 reveal — clearing appears around the corner (after U-turn)
  { t: 0.98, pos: [5, 1.6, -52],  lookAt: [10, 1.6, -54], label: 'Act 4 reveal — fire visible' },

  // Act 4 final — camera settled, looking at campfire + Yeri + moon
  { t: 1.00, pos: [7, 1.6, -53],  lookAt: [11, 1.5, -56], label: 'Act 4 settled — fire + Yeri + moon' },
];

// Build the curve from keyframes
function buildCurve(): THREE.CatmullRomCurve3 {
  const points = PATH_KEYFRAMES.map((k) => new THREE.Vector3(...k.pos));
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
}

// =================================================================
// PATH GEOMETRY — sweep a rectangle along the curve
// =================================================================

function PathMesh() {
  const curve = useMemo(buildCurve, []);

  const geom = useMemo(() => {
    // Create a flat strip mesh by extruding a rectangle along the curve
    const tubularSegments = 200;
    const widthSegments = 1;
    const halfWidth = 0.7; // 1.4m wide path (single-person + slight extra)

    // Sample points along curve
    const frames = curve.computeFrenetFrames(tubularSegments, false);

    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const mudColor = new THREE.Color(...hexToVec3(palette.stone_base));
    const mudWet = new THREE.Color(...hexToVec3('#15110D'));
    const mudWorn = new THREE.Color(...hexToVec3(palette.stone_mid));

    for (let i = 0; i <= tubularSegments; i++) {
      const t = i / tubularSegments;
      const point = curve.getPointAt(t);
      const tangent = frames.tangents[i];
      const normal = frames.normals[i];

      // Calculate left/right perpendicular to tangent (in horizontal plane)
      const right = new THREE.Vector3();
      right.crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      // Left edge
      const left = point.clone().sub(right.clone().multiplyScalar(halfWidth));
      left.y = 0; // flatten to ground
      positions.push(left.x, left.y, left.z);

      // Right edge
      const rightPos = point.clone().add(right.clone().multiplyScalar(halfWidth));
      rightPos.y = 0;
      positions.push(rightPos.x, rightPos.y, rightPos.z);

      // Color: alternating mud / wet / worn
      // Worn in the center, wet at edges (foot traffic compacts center, edges stay wet)
      const colLeft = i % 7 === 0 ? mudWet : mudColor;
      const colRight = i % 7 === 0 ? mudWet : mudColor;
      colors.push(colLeft.r, colLeft.g, colLeft.b);
      colors.push(colRight.r, colRight.g, colRight.b);

      // Indices (skip first segment)
      if (i > 0) {
        const base = i * 2;
        const prev = (i - 1) * 2;
        // Two triangles per quad
        indices.push(prev, base, prev + 1);
        indices.push(prev + 1, base, base + 1);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [curve]);

  return (
    <mesh geometry={geom} receiveShadow position={[0, 0.02, 0]}>
      <meshStandardMaterial
        vertexColors
        roughness={0.85}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// =================================================================
// SCROLL-DRIVEN CAMERA — follows the path based on scroll position
// =================================================================

interface ScrollCameraProps {
  scrollRef: React.MutableRefObject<number>; // 0-1 from scroll
  onPositionChange?: (pos: [number, number, number], lookAt: [number, number, number]) => void;
}

export function ScrollCamera({ scrollRef, onPositionChange }: ScrollCameraProps) {
  const curve = useMemo(buildCurve, []);
  const { camera } = useThree();
  const lastPos = useRef<[number, number, number]>([0, 1.6, 0]);
  const lastLook = useRef<[number, number, number]>([0, 1.6, -3]);

  // Convert keyframes to a lookup for smooth interpolation
  const keyframeLookup = useMemo(() => {
    return PATH_KEYFRAMES.map((k) => ({
      t: k.t,
      pos: new THREE.Vector3(...k.pos),
      lookAt: new THREE.Vector3(...k.lookAt),
    }));
  }, []);

  useFrame(() => {
    const t = scrollRef.current;

    // Find segment
    let i0 = 0;
    let i1 = 1;
    for (let i = 0; i < keyframeLookup.length - 1; i++) {
      if (t >= keyframeLookup[i].t && t <= keyframeLookup[i + 1].t) {
        i0 = i;
        i1 = i + 1;
        break;
      }
    }

    const k0 = keyframeLookup[i0];
    const k1 = keyframeLookup[i1];
    const localT = (t - k0.t) / Math.max(k1.t - k0.t, 0.001);

    // Smooth easing for cinematic feel
    const eased = localT * localT * (3 - 2 * localT);  // smoothstep

    // Interpolate position
    const pos = new THREE.Vector3().lerpVectors(k0.pos, k1.pos, eased);
    // Add a slight Y bob for organic motion
    pos.y += Math.sin(t * Math.PI * 6) * 0.05;

    // Look at is also interpolated, with a bit of look-ahead
    const look = new THREE.Vector3().lerpVectors(k0.lookAt, k1.lookAt, eased);

    // Damp camera to target (slight lag for cinematic feel)
    lastPos.current = [
      THREE.MathUtils.lerp(lastPos.current[0], pos.x, 0.15),
      THREE.MathUtils.lerp(lastPos.current[1], pos.y, 0.15),
      THREE.MathUtils.lerp(lastPos.current[2], pos.z, 0.15),
    ];
    lastLook.current = [
      THREE.MathUtils.lerp(lastLook.current[0], look.x, 0.15),
      THREE.MathUtils.lerp(lastLook.current[1], look.y, 0.15),
      THREE.MathUtils.lerp(lastLook.current[2], look.z, 0.15),
    ];

    camera.position.set(...lastPos.current);
    camera.lookAt(...lastLook.current);

    if (onPositionChange) {
      onPositionChange(lastPos.current, lastLook.current);
    }
  });

  return null;
}

// =================================================================
// DEFAULT EXPORT — the path mesh (camera is separate)
// =================================================================

export default function Path() {
  return <PathMesh />;
}

// Re-export the curve getter for use by other systems (frog position, etc.)
export function getPathCurve(): THREE.CatmullRomCurve3 {
  return buildCurve();
}

export function getPositionAlongPath(t: number): THREE.Vector3 {
  const curve = buildCurve();
  return curve.getPointAt(THREE.MathUtils.clamp(t, 0, 1));
}

export function getTangentAlongPath(t: number): THREE.Vector3 {
  const curve = buildCurve();
  return curve.getTangentAt(THREE.MathUtils.clamp(t, 0, 1));
}

// Sample the path curve at N points and return [x, z] pairs for tree placement
export function samplePathPoints(samples = 80): Array<[number, number]> {
  const curve = buildCurve();
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    pts.push([p.x, p.z]);
  }
  return pts;
}