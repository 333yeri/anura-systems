/**
 * World skeleton — MILESTONE 1
 *
 * What's in this scene:
 * - Procedural night sky (skybox shader with stars + horizon gradient)
 * - Moon (sphere with crater displacement + emissive halo)
 * - Ground (large mud terrain plane, slightly displaced)
 * - One hero tree (placeholder geometry — replaced by tree GLBs in next milestone)
 * - Lighting (moon key + cool fill + warm foreground fill)
 * - Volumetric fog (THREE.FogExp2 + 3 fog planes for layered depth)
 * - Tone mapping (ACES Filmic, exposure 0.6)
 *
 * What's NOT in this scene (next milestones):
 * - Frog (Act 1 CRT screen + Act 3 guide position)
 * - Yeri (Act 4 clearing on log)
 * - Tent, campfire, log (Act 4 props)
 * - Fireflies, mushrooms, gems, plants (Act 3 clickables)
 * - Hotspots + raycasting
 * - Scroll-driven camera (static camera for now)
 * - Post-processing chain (basic lighting first, polish after)
 *
 * What this milestone proves:
 * - Sky + moon + ground + lighting match the locked aesthetic
 * - Fog depth works
 * - One tree silhouettes against the sky correctly
 * - Color palette renders correctly in the moonlit night
 */

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { palette, hexToVec3 } from '../shared/palette';
import Trees from './environment/Trees';

// =================================================================
// SKY DOME — procedural shader with stars + horizon gradient
// =================================================================

const SKY_VERTEX = /* glsl */ `
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const SKY_FRAGMENT = /* glsl */ `
uniform vec3 uHorizonColor;
uniform vec3 uZenithColor;
uniform vec3 uMistColor;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

// Hash function for procedural stars
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float stars(vec3 dir) {
  // Project direction to 2D for star sampling
  vec2 uv = vec2(atan(dir.z, dir.x), asin(dir.y));
  vec2 grid = uv * 200.0;
  vec2 cell = floor(grid);
  vec2 cellPos = fract(grid);

  float n = hash(cell);
  if (n < 0.985) return 0.0; // sparse stars

  // Random position within cell
  vec2 starPos = vec2(hash(cell + 1.0), hash(cell + 2.0));
  float d = distance(cellPos, starPos);
  float brightness = (n - 0.985) * 66.7; // scale brightness

  // Star sparkle (size + falloff)
  float size = 0.05 + hash(cell + 3.0) * 0.1;
  float star = smoothstep(size, 0.0, d) * brightness;

  // Subtle twinkle
  star *= 0.7 + 0.3 * sin(uTime * 2.0 + n * 100.0);

  return star;
}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float horizonFactor = smoothstep(-0.1, 0.4, dir.y);

  // Sky gradient: zenith to horizon
  vec3 sky = mix(uHorizonColor, uZenithColor, horizonFactor);

  // Mist near horizon (warm tint)
  float mistFactor = 1.0 - smoothstep(0.0, 0.15, abs(dir.y));
  sky = mix(sky, uMistColor, mistFactor * 0.4);

  // Stars (only above horizon)
  if (dir.y > 0.0) {
    float starField = stars(dir);
    sky += vec3(starField);
  }

  gl_FragColor = vec4(sky, 1.0);
}
`;

function Sky() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  const uniforms = useMemo(() => ({
    // Sky colors — darker, more like reference moonlit image
    uHorizonColor: { value: new THREE.Color(...hexToVec3('#1A1612')) },  // very dark warm brown
    uZenithColor: { value: new THREE.Color(...hexToVec3('#080A0C')) },   // deep blue-black
    uMistColor: { value: new THREE.Color(...hexToVec3(palette.mist_warm)) },
    uTime: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh scale={[500, 500, 500]} renderOrder={-1}>
      <sphereGeometry args={[1, 64, 32]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={SKY_VERTEX}
        fragmentShader={SKY_FRAGMENT}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// =================================================================
// MOON — sphere with crater displacement + emissive halo
// =================================================================

function Moon() {
  const moonRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  // Moon position: top of frame, upper-center, ~7-10% viewport height.
  // Camera at (0, 1.6, 6) fov 50 looking -Z.
  // At distance ~50, fov half-height = tan(25°) * 50 ≈ 23.
  // Upper portion: y ≈ 15-18 above camera (absolute y=17-20).
  const moonPos: [number, number, number] = [0, 18, -50];
  const moonScale = 2.8; // ~10% viewport at distance ~50

  return (
    <group position={moonPos}>
      {/* Halo billboard — cool silvery moonlight glow (NOT warm amber) */}
      <mesh ref={haloRef} renderOrder={1}>
        <planeGeometry args={[moonScale * 10, moonScale * 10]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          uniforms={{
            // Cool silvery halo — pulled from the moonlight color itself
            // (warm tones read as "green" when mixed with dark blue sky)
            uColor: { value: new THREE.Color(0.85, 0.88, 0.95) }, // cool silvery
          }}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={/* glsl */ `
            uniform vec3 uColor;
            varying vec2 vUv;
            void main() {
              float d = distance(vUv, vec2(0.5));
              float halo = 1.0 - smoothstep(0.0, 0.5, d);
              halo = pow(halo, 2.0);
              gl_FragColor = vec4(uColor * 1.5, halo * 0.9);
            }
          `}
        />
      </mesh>

      {/* Moon body — pure white moon (NOT warm tinted) */}
      <mesh ref={moonRef} renderOrder={2}>
        <sphereGeometry args={[moonScale, 32, 32]} />
        <meshBasicMaterial
          color={0xfaf8f0} // very pale warm-white (almost neutral)
          toneMapped={false}
        />
      </mesh>

      {/* Billboard the halo to face camera */}
      <BillboardFollower targetRef={haloRef} />
    </group>
  );
}

function BillboardFollower({ targetRef }: { targetRef: React.RefObject<THREE.Mesh> }) {
  const { camera } = useThree();
  useFrame(() => {
    if (targetRef.current) {
      targetRef.current.lookAt(camera.position);
    }
  });
  return null;
}

// =================================================================
// GROUND — large mud terrain plane with slight displacement
// =================================================================

function Ground() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(200, 200, 128, 128);
    g.rotateX(-Math.PI / 2);

    // Slight displacement for unevenness (per VQS Decision: subtle rolling hills ±0.5m)
    // Plus embedded grass patches via vertex colors
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const mudColor = new THREE.Color(...hexToVec3(palette.stone_base));
    const mudWet = new THREE.Color(...hexToVec3('#15110D'));
    const grassDark = new THREE.Color(...hexToVec3(palette.moss_shadow));
    const grassMid = new THREE.Color(...hexToVec3(palette.moss_mid));

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Subtle displacement
      const h =
        Math.sin(x * 0.05) * 0.15 +
        Math.cos(z * 0.07) * 0.12 +
        Math.sin(x * 0.2 + z * 0.15) * 0.05;
      pos.setY(i, h);

      // Vertex color zones — mostly mud, sparse darker grass patches
      // (per user feedback: ground was too bright green, looked fake)
      const grassNoise = Math.sin(x * 0.3) * Math.cos(z * 0.25) + Math.sin(x * 0.7 + z * 0.5) * 0.5;
      const isWet = (x * x + z * z) > 900 && grassNoise < -0.3;
      const isGrass = grassNoise > 0.6; // Higher threshold = less grass

      let col;
      if (isWet) {
        col = mudWet;
      } else if (isGrass) {
        col = grassMid;
      } else if (Math.random() > 0.85) { // Much rarer dark grass
        col = grassDark;
      } else {
        col = mudColor;
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();

    return g;
  }, []);

  return (
    <mesh geometry={geom} position={[0, -0.5, -10]} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.95}
        metalness={0.0}
      />
    </mesh>
  );
}

// =================================================================
// HERO TREE (placeholder — replaced by tree GLBs in next milestone)
// =================================================================

function HeroTreePlaceholder({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 6, 8]} />
        <meshStandardMaterial
          color={palette.stone_mid}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      {/* Foliage clusters — 3 stacked spheres */}
      <mesh position={[0, 7, 0]} castShadow>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshStandardMaterial
          color={palette.moss_shadow}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
      <mesh position={[1, 8, -0.5]} castShadow>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial
          color={palette.moss_mid}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
      <mesh position={[-0.8, 8, 0.8]} castShadow>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshStandardMaterial
          color={palette.moss_shadow}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}

// =================================================================
// FOG — single exponential fog (the FogPlanes read as solid stripes,
// so they're disabled for now — M11 polish will revisit)
// =================================================================

// (FogPlanes disabled — see World.tsx for the FogExp2 setup)

// =================================================================
// MAIN SCENE — wires everything together
// =================================================================

export default function World() {
  const { gl, scene } = useThree();

  // Apply renderer settings per VQS lock
  useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.6; // DARK per VQS lock
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set scene background to void
    scene.background = new THREE.Color(palette.void_000);
    // Stronger fog — denser for the night jungle feel, fades distant trees
    scene.fog = new THREE.FogExp2(palette.mist_cool, 0.06);
  }, [gl, scene]);

  return (
    <>
      {/* === ATMOSPHERE === */}
      <Sky />
      <Moon />

      {/* === LIGHTING (per VQS lock) === */}
      {/* Key light: the moon (warm, from upper-center) */}
      <directionalLight
        position={[0, 80, -50]}
        intensity={0.6}
        color={palette.moonlight}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Fill: cool moss-green tint from below */}
      <directionalLight
        position={[-20, 5, 10]}
        intensity={0.2}
        color={palette.shadow_cool}
      />

      {/* Foreground accent: warm, tight (per reference image — makes foreground readable
          while keeping background dark) */}
      <spotLight
        position={[5, 6, 8]}
        target-position={[0, 0, 0]}
        angle={0.7}
        penumbra={0.9}
        intensity={20}
        color={palette.mist_warm}
        distance={20}
        decay={1.5}
        castShadow={false}
      />

      {/* Ambient base (very dim — only to avoid pure-black frame) */}
      <ambientLight intensity={0.06} color={palette.shadow_cool} />

      {/* === GEOMETRY === */}
      <Ground />

      {/* === TREES (M2: real GLBs with variation system) === */}
      <Trees />
    </>
  );
}