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
import { scrollIntendedQuat } from '../WorldCanvas';

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

// =================================================================
// PATH KEYFRAMES (12 keyframes matching the user diagram)
// =================================================================
// z = forward (negative = away from start)
// x = left/right
// y = ground level (0)
// t = scroll position (0 = start, 1 = end)
//
// KEYFRAMES PER USER DIAGRAM (2026-06-20):
//   - Spawn at frog position (0, 0)
//   - First right turn into jungle
//   - S-curve through dense jungle (NO preview of Act 4)
//   - Sharp 90° RIGHT turn at end (not a U-turn — user wants a proper
//     90° turn that REVEALS something on the other side)
//   - Act 4 reveal after the 90° turn
//
// IMPORTANT: At end, camera must face into Act 4 — not loop back.

// =================================================================
// PATH KEYFRAMES (15 keyframes matching the user diagram - snake path)
// =================================================================
// z = forward (negative = away from start)
// x = left/right
// y = ground level (0)
// t = scroll position (0 = start, 1 = end)
//
// Path geometry: Spawn → curve right → curve left → curve right →
// curve left → 90° RIGHT TURN → Act 4 reveal. The snake has CLEAR
// direction changes (3 visible bends) so the camera path actually
// looks like a snake, not a zigzag.
//
// CRITICAL: At end, camera must face into Act 4 — not loop back.
// The 90° turn reveals Act 4 (was hidden by dense jungle).

export const PATH_KEYFRAMES: Array<{ pos: [number, number, number]; lookAt: [number, number, number]; t: number; label: string }> = [
  // Act 3 entry — open forest, clear sky
  { t: 0.00, pos: [0, 1.6, 5],     lookAt: [1, 1.6, 2],   label: 'frog spawn / Act 3 start' }, // Camera starts 5m BEHIND spawn point
  { t: 0.06, pos: [1.0, 1.6, 2],   lookAt: [2.5, 1.6, -2], label: 'enter jungle — first turn right' },

  // Snake bend 1: curve RIGHT then back LEFT (clear S)
  { t: 0.18, pos: [3, 1.6, -2],    lookAt: [6, 1.6, -6], label: 'snake right 1' },
  { t: 0.30, pos: [5, 1.6, -7],    lookAt: [3, 1.6, -13], label: 'snake back-left 1' },

  // Snake bend 2: curve LEFT then back RIGHT
  { t: 0.42, pos: [-1, 1.6, -14],  lookAt: [-5, 1.6, -18], label: 'snake left 2' },
  { t: 0.54, pos: [-6, 1.6, -19],  lookAt: [-2, 1.6, -25], label: 'snake back-right 2' },

  // Snake bend 3: curve RIGHT then back LEFT
  { t: 0.66, pos: [4, 1.6, -26],   lookAt: [8, 1.6, -30], label: 'snake right 3' },
  { t: 0.78, pos: [6, 1.6, -32],   lookAt: [3, 1.6, -36], label: 'snake back-left 3' },

  // Pre-turn approach — straighten path to set up the 90°
  { t: 0.85, pos: [0, 1.6, -38],   lookAt: [4, 1.6, -42], label: 'approaching the turn' },

  // 90° RIGHT TURN — the camera turns to face into Act 4
  // Position rotates around a pivot point to make a clean corner.
  // Before turn: facing -Z (forward). After turn: facing +X (right).
  { t: 0.92, pos: [6, 1.6, -44],   lookAt: [10, 1.6, -42], label: '90° turn start' },
  { t: 0.96, pos: [10, 1.6, -42],  lookAt: [14, 1.6, -38], label: '90° turn mid' },
  { t: 0.99, pos: [14, 1.6, -38],  lookAt: [16, 1.6, -32], label: '90° turn complete — Act 4 revealed' },

  // Act 4 final — camera settled, looking down the path into the clearing
  { t: 1.00, pos: [14, 1.6, -36],  lookAt: [14, 1.4, -28], label: 'Act 4 settled — fire + Yeri + moon' },
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
    // Create a path-like strip mesh by extruding an organic shape along the curve.
    // Width varies slightly along the path (narrower in dense jungle, wider in clearings).
    const tubularSegments = 200;
    const halfWidthBase = 0.5; // 1m wide path (single-person, NOT a road)

    // Sample points along curve
    const frames = curve.computeFrenetFrames(tubularSegments, false);

    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Mud colors — darker than current, more variation, NO artificial bright green
    const mudDark = new THREE.Color(...hexToVec3('#1A1612'));    // very dark wet mud
    const mudMid = new THREE.Color(...hexToVec3('#2A2218'));    // medium mud
    const mudWet = new THREE.Color(...hexToVec3('#0F0C08'));    // wet patches (very dark)
    const mudWorn = new THREE.Color(...hexToVec3('#33291E'));    // worn/foot-worn mud (slightly lighter)

    for (let i = 0; i <= tubularSegments; i++) {
      const t = i / tubularSegments;
      const point = curve.getPointAt(t);
      const tangent = frames.tangents[i];
      const normal = frames.normals[i];

      // Path width varies slightly along path (narrower in dense jungle)
      // Use sine wave for organic variation
      const widthMod = 1 + 0.15 * Math.sin(t * Math.PI * 8);
      const halfWidth = halfWidthBase * widthMod;

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

      // Color: muddy with variation, NO green
      // Random pattern of mud colors — never green
      const colRand = Math.sin(i * 12.9898) * 0.5 + 0.5; // deterministic noise
      let col;
      if (colRand < 0.3) col = mudDark;
      else if (colRand < 0.6) col = mudMid;
      else if (colRand < 0.75) col = mudWet;
      else col = mudWorn;

      colors.push(col.r, col.g, col.b);
      colors.push(col.r, col.g, col.b);

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
        roughness={0.95}
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

  // Track the last scroll position so we only update when user actually scrolled
  // (no continuous auto-play). Without this, the camera would constantly
  // damp toward the target even when the user isn't scrolling.
  const lastScroll = useRef<number>(-1);

  useFrame(() => {
    const t = scrollRef.current;

    // Only update camera when scroll has actually changed.
    // This prevents continuous auto-play — the camera holds still until
    // the user scrolls. The user explicitly controls the journey.
    if (t === lastScroll.current) return;
    lastScroll.current = t;

    const curve = buildCurve();

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

    // Smooth easing for cinematic feel between keyframes
    const eased = localT * localT * (3 - 2 * localT);  // smoothstep

    // Interpolate position
    const pos = new THREE.Vector3().lerpVectors(k0.pos, k1.pos, eased);
    // Slight Y bob for organic motion
    pos.y += Math.sin(t * Math.PI * 6) * 0.05;

    // Compute lookAt from the actual curve tangent at this point
    const curveT = THREE.MathUtils.clamp(t, 0, 1);
    const tangent = curve.getTangentAt(curveT);
    const look = pos.clone().add(tangent.clone().multiplyScalar(5));
    look.y = pos.y;

    // Light dampening (0.5 = ~50% of remaining distance per change).
    // Tighter than before — camera doesn't drift continuously.
    // The user-driven scroll directly controls position; the damp just
    // smooths the transition between scroll events.
    lastPos.current = [
      THREE.MathUtils.lerp(lastPos.current[0], pos.x, 0.5),
      THREE.MathUtils.lerp(lastPos.current[1], pos.y, 0.5),
      THREE.MathUtils.lerp(lastPos.current[2], pos.z, 0.5),
    ];
    lastLook.current = [
      THREE.MathUtils.lerp(lastLook.current[0], look.x, 0.5),
      THREE.MathUtils.lerp(lastLook.current[1], look.y, 0.5),
      THREE.MathUtils.lerp(lastLook.current[2], look.z, 0.5),
    ];

    camera.position.set(...lastPos.current);
    camera.lookAt(...lastLook.current);

    // CRITICAL: Write scroll camera's INTENDED rotation to the global shared ref.
    // This is what ParallaxCamera reads to apply mouse-look on top, WITHOUT
    // carrying forward the previous frame's parallax offset (which would cause drift).
    scrollIntendedQuat.current.copy(camera.quaternion);

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