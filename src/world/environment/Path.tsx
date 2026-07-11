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

// PATH KEYFRAMES — designed to look like a WILD JUNGLE TRAIL, not a road.
// Key principles:
// 1. Y values vary slightly (1.45-1.75) to suggest uneven ground
// 2. Slight Y offset in lookAt (1.3-1.7) so view tilts up/down with terrain
// 3. Non-integer coordinates for organic feel
// 4. Dense keyframes in dense zones (every 4-6% scroll) for smooth curves
// 5. Wider turns — no sharp 90° angles
// 6. Catmull-Rom interpolation smooths between keyframes
export const PATH_KEYFRAMES: Array<{ pos: [number, number, number]; lookAt: [number, number, number]; t: number; label: string }> = [
  // Act 3 entry — open forest, clear sky. Camera 5m behind spawn point.
  // Y starts slightly higher, dips down to path level.
  { t: 0.00, pos: [0.0, 1.7, 5.2],     lookAt: [0.8, 1.55, 2.5],   label: 'frog spawn / Act 3 start' },
  { t: 0.04, pos: [0.4, 1.65, 3.8],    lookAt: [1.4, 1.5, 1.5],    label: 'stepping onto path' },
  { t: 0.08, pos: [0.9, 1.6, 2.3],     lookAt: [2.0, 1.55, 0.5],   label: 'entering first curve' },
  { t: 0.12, pos: [1.6, 1.55, 0.8],    lookAt: [2.8, 1.5, -1.0],   label: 'gentle bend right' },
  { t: 0.16, pos: [2.4, 1.5, -0.8],    lookAt: [3.8, 1.55, -2.8],  label: 'curve continues' },

  // Snake bend 1: curve RIGHT then back LEFT. Y dips and rises.
  { t: 0.20, pos: [3.2, 1.55, -2.7],   lookAt: [4.4, 1.5, -4.5],   label: 'snake right 1 start' },
  { t: 0.24, pos: [4.0, 1.5, -4.5],    lookAt: [4.6, 1.55, -6.2],  label: 'snake right 1 mid' },
  { t: 0.28, pos: [4.5, 1.55, -6.3],   lookAt: [4.2, 1.5, -8.0],   label: 'snake right 1 peak' },
  { t: 0.32, pos: [4.6, 1.5, -8.0],    lookAt: [3.8, 1.55, -9.8],  label: 'snake curving back' },
  { t: 0.36, pos: [4.0, 1.55, -10.0],  lookAt: [2.6, 1.5, -11.8],  label: 'snake back-left 1' },

  // Snake bend 2: curve LEFT then back RIGHT. Lower Y for the "valley" feel.
  { t: 0.40, pos: [2.4, 1.6, -12.2],   lookAt: [0.6, 1.5, -13.0],  label: 'snake left 2 start' },
  { t: 0.44, pos: [0.4, 1.55, -13.5],  lookAt: [-1.8, 1.5, -14.5], label: 'snake left 2 deep' },
  { t: 0.48, pos: [-2.2, 1.5, -15.0],  lookAt: [-4.0, 1.55, -15.8], label: 'snake left 2 peak' },
  { t: 0.52, pos: [-4.2, 1.55, -16.5], lookAt: [-4.8, 1.5, -18.2], label: 'snake curving back' },
  { t: 0.56, pos: [-4.8, 1.5, -18.5],  lookAt: [-4.0, 1.55, -20.5], label: 'snake back-right 2' },
  { t: 0.60, pos: [-3.8, 1.55, -20.8], lookAt: [-2.2, 1.5, -22.5], label: 'snake back-right 2 mid' },

  // Snake bend 3: curve RIGHT then back LEFT. Slight Y rise.
  { t: 0.64, pos: [-1.5, 1.5, -23.0],  lookAt: [0.4, 1.55, -24.0], label: 'snake right 3 start' },
  { t: 0.68, pos: [0.8, 1.55, -24.5],  lookAt: [2.6, 1.5, -25.5], label: 'snake right 3 mid' },
  { t: 0.72, pos: [3.0, 1.5, -26.0],  lookAt: [4.6, 1.55, -27.5], label: 'snake right 3 peak' },
  { t: 0.76, pos: [4.8, 1.55, -28.2],  lookAt: [5.2, 1.5, -30.0], label: 'snake curving back' },
  { t: 0.80, pos: [5.0, 1.5, -30.5],  lookAt: [4.0, 1.55, -32.2], label: 'snake back-left 3' },
  { t: 0.84, pos: [3.4, 1.55, -33.0], lookAt: [1.8, 1.5, -34.2], label: 'snake back-left 3 mid' },

  // Pre-turn approach — gentle curve, slight Y rise to a small rise
  { t: 0.87, pos: [1.2, 1.5, -35.0],  lookAt: [0.4, 1.55, -37.0], label: 'approaching the rise' },
  { t: 0.90, pos: [0.0, 1.5, -37.5],  lookAt: [1.5, 1.5, -40.0], label: 'at the rise' },

  // 90° turn — SMOOTH, not sharp. Camera arcs around a wider pivot.
  // Y stays around 1.5 throughout the turn (no dramatic up/down).
  { t: 0.93, pos: [2.5, 1.5, -41.5],  lookAt: [4.8, 1.5, -42.0], label: 'turn arc start' },
  { t: 0.96, pos: [5.8, 1.5, -43.0],  lookAt: [8.5, 1.5, -42.0], label: 'turn arc mid' },
  { t: 0.99, pos: [9.5, 1.5, -41.0],  lookAt: [12.0, 1.5, -38.0], label: 'turn arc complete' },

  // Act 4 final — camera settled, looking down at the cozy scene.
  // Y slightly lower (1.55) for a more grounded feel.
  // Lookat Y=1.0 (lower than camera) so view tilts DOWN toward the fire
  // and Yeri at ground level — like looking at a campfire while sitting.
  { t: 1.00, pos: [12.5, 1.55, -38.5], lookAt: [14.5, 1.0, -32.0], label: 'Act 4 settled — fire + Yeri + moon' },
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

    // Interpolate position (no Y bob — keeps camera stable)
    const pos = new THREE.Vector3().lerpVectors(k0.pos, k1.pos, eased);

    // Compute the INTENDED look direction from the curve tangent
    // (this is what the camera "should" look at — the user's parallax
    //  is added on top of this in ParallaxCamera)
    const curveT = THREE.MathUtils.clamp(t, 0, 1);
    const tangent = curve.getTangentAt(curveT);
    const look = pos.clone().add(tangent.clone().multiplyScalar(5));

    // Tilt the camera DOWN at Act 4 so the fire and props at ground level
    // are in the central view (not at the bottom edge). The lookat's Y is
    // 0.55m below the camera's Y — a natural downward gaze like looking
    // at a campfire. This ramps in over the last 10% of the scroll.
    const lookDownFactor = Math.max(0, (t - 0.90) / 0.10); // 0 before 90%, 1 after 100%
    look.y = pos.y - 0.55 * lookDownFactor;

    // INSTANT position update (no damping).
    // User feedback: "fix the camera path scroll and why it wiggles"
    // Damping at 0.5 takes many seconds to converge, which caused the
    // wiggle/wobble when the user scrolled. Setting position instantly
    // means the camera is always exactly at the path keyframe.
    lastPos.current = [pos.x, pos.y, pos.z];
    lastLook.current = [look.x, look.y, look.z];

    camera.position.set(...lastPos.current);

    // DON'T call camera.lookAt() — the user's mouse-look (ParallaxCamera)
    // controls the look direction. We only update scrollIntendedQuat
    // for the parallax base. To compute the intended rotation without
    // overwriting the user's mouse rotation, we use a temporary
    // quaternion that points toward the curve tangent.
    const tempMatrix = new THREE.Matrix4().lookAt(
      camera.position,
      new THREE.Vector3(...lastLook.current),
      new THREE.Vector3(0, 1, 0)
    );
    scrollIntendedQuat.current.setFromRotationMatrix(tempMatrix);

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