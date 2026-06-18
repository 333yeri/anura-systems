// Anura Systems — persistent 3D swamp forest scene
// Brand DNA: dark swamp, phosphor green accents, ember amber fire,
// PBR-shaded ~30k tris, GLB assets for trees. Three.js r0.160 API.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ─── Brand palette — board Option A (dark warm premium) ─────────────────────
const VOID_BG     = 0x080808; // void_000   — true black
const MIST_BG     = 0x1C1E21; // mist_100   — cool charcoal
const PEAT_BG     = 0x1A241A; // peat_05    — warm charcoal w/ moss undertone
const SPECTRUM    = 0x8A9098; // spectrum   — slate gray
const EMBER_AMBER = 0xD4AF37; // embers_01  — metallic gold accent

// Derived scene colors (all stay inside the board palette family)
const MOSS_DARK   = 0x1F3A1A; // canopy tint (moss undertone)
const MOSS_DEEP   = 0x14271A; // ground vertex tint
const TRUNK_DARK  = 0x4a3020; // trunks (still warm to read in low light)
const CANOPY_A    = 0x2a5a2a; // darkest canopy
const CANOPY_B    = 0x3a6a3a; // mid canopy
const GROUND_COL  = 0x1A241A; // mossy ground (now uses peat_05)
const TRUNK_GROUND = 0x3a3028;
const FROG_BODY   = 0x4A7A2E; // frog (deep moss, warm)
const MOON_BLUE   = 0xC8D8FF; // pale moonlight (board: cold but soft)
const AMBIENT_COLD= 0x1C1E21; // mist ambient (board, not the cold blue I had)
const STAR_WHITE  = 0xFFFFFF;
const ROCK_GREY   = 0x2A2A26;
const MOSS_HANG   = 0x3a5a2a;
// Derived on-palette glow colors (kept inside the dark warm premium vibe)
const GHOST_MOSS  = 0x6A8C4A; // bioluminescent moss-green (mushroom glow)

// ─── Tiny seeded PRNG (mulberry32) — deterministic placement ───────────────
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class World {
  constructor(scene) {
    this.scene = scene;
    this.hotspots = []; // { mesh, name, position, radius, data }

    // Internal refs for animation
    this.mushroomMaterials = [];
    this.fireParticles = null;
    this.fireGeometry = null;
    this.fireMaterial = null;
    this.frog = null;
    this.frogBaseY = 0;
    this.campfireLight = null;
    this.stars = null;
    this.mushroomHotspotPulse = 0;

    // SSR-safe device pixel ratio
    this.dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

    this.build();
  }

  // ─── Build pipeline ──────────────────────────────────────────────────────
  build() {
    this.setupLights();
    this.setupFog();
    this.createGround();
    this.createCinematicDressing();     // sky dome, ground fog, bark tufts placeholder
    this.createForest();              // procedural fallback (will be visually overlaid by GLBs)
    this.loadGLBTrees();              // async — PBR trees land once loaded
    this.createPathLanterns();        // small warm glow markers along the path
    this.createMushrooms();
    this.createCampfire();
    this.createStars();
    this.createFrog();
    this.createHangingMossTree();
  }

  // ─── Small warm lanterns along the path — keep the drift visible ─────────
  createPathLanterns() {
    const positions = [
      { x:  1.5, z: 12, i: 0.7 },
      { x: -1.5, z:  4, i: 0.6 },
      { x:  2.0, z: -4, i: 0.7 },
      { x: -2.0, z:-14, i: 0.8 },
      { x:  1.5, z:-22, i: 0.9 },
    ];
    for (const p of positions) {
      const lampGeom = new THREE.SphereGeometry(0.08, 8, 6);
      const lampMat = new THREE.MeshBasicMaterial({ color: 0xffeebb });
      const lamp = new THREE.Mesh(lampGeom, lampMat);
      lamp.position.set(p.x, 0.6, p.z);
      this.scene.add(lamp);

      const light = new THREE.PointLight(0xffd28a, p.i, 6, 1.8);
      light.position.set(p.x, 0.7, p.z);
      this.scene.add(light);
    }
  }

  // ─── Global lighting & atmosphere ────────────────────────────────────────
  setupLights() {
    // Soft cold ambient — keeps dark materials faintly readable
    const ambient = new THREE.AmbientLight(0x6a7a8a, 2.6);
    this.scene.add(ambient);

    // Hemisphere — sky/ground gradient. Sky tinted toward moonlight blue,
    // ground toward mossy green so the floor reads warm-ish.
    const hemi = new THREE.HemisphereLight(0x8a9ad0, 0x3a4a3a, 2.2);
    this.scene.add(hemi);

    // Moonlight — the cinematic key light. High & angled so it cuts through
    // the canopy and casts long, soft shadows. Bumped intensity so PBR
    // textures catch the rim and look like real bark/leaf, not flat paint.
    const moon = new THREE.DirectionalLight(0xc8d8ff, 3.4);
    moon.position.set(-12, 22, 8);
    moon.target.position.set(0, 0, -10);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.near = 1;
    moon.shadow.camera.far = 60;
    moon.shadow.camera.left = -30;
    moon.shadow.camera.right = 30;
    moon.shadow.camera.top = 30;
    moon.shadow.camera.bottom = -30;
    moon.shadow.bias = -0.0005;
    moon.shadow.normalBias = 0.02;
    moon.shadow.radius = 4;
    this.scene.add(moon);
    this.scene.add(moon.target);
    this.moon = moon;

    // Warm key light from the campfire direction (long throw)
    const warmKey = new THREE.DirectionalLight(0xd4a070, 1.2);
    warmKey.position.set(0, 8, -30);
    warmKey.target.position.set(0, 0, 20);
    this.scene.add(warmKey);
    this.scene.add(warmKey.target);

    // Forward fill from camera position — illuminates the path ahead
    const pathFill = new THREE.PointLight(0x9aaaba, 2.4, 40, 1.2);
    pathFill.position.set(0, 4, 18);
    this.scene.add(pathFill);
  }

  setupFog() {
    // Lighter fog so trees and lanterns read clearly. Color still moody.
    this.scene.fog = new THREE.FogExp2(0x1a2028, 0.018);
  }

  // ─── Ground: shallow mud patches scattered across the swamp water plane ─
  // The ground is NO LONGER one big disc. Instead it's ~20 irregular mud
  // patches sitting on top of a water plane. The water is the dominant
  // surface; mud patches are where the trees and the path sit.
  createGround() {
    this.mudPatches = [];

    // Path mud strip: a long, narrow raised mud strip along x=0
    // following the camera path. Subtle elevation above water (~0.08m).
    const pathStripGeom = this.makeMudPatchGeometry(48, 2.5, 0xA1B2C3D4, 0.6, 0.08);
    const pathStrip = new THREE.Mesh(pathStripGeom, this.makeMudMaterial());
    pathStrip.position.set(0, 0.04, -15); // centred along camera path
    pathStrip.receiveShadow = true;
    this.scene.add(pathStrip);
    this.mudPatches.push(pathStrip);

    // Scattered mud islands for the trees — placed to roughly align with
    // the GLB tree placements so they look rooted, not floating.
    const treeBases = [
      { x:  6.0, z:  10, w: 2.5, h: 2.5 },
      { x: -7.5, z:   4, w: 2.8, h: 2.8 },
      { x:  4.2, z: -15, w: 3.2, h: 3.0 },
      { x: -6.0, z: -22, w: 2.6, h: 2.6 },
      { x:  7.0, z:  18, w: 2.4, h: 2.4 },
      { x: -4.0, z:  22, w: 2.2, h: 2.4 },
      { x:  8.0, z:  -4, w: 2.6, h: 2.6 },
      { x: -9.0, z: -10, w: 2.8, h: 2.8 },
      { x:  5.0, z: -28, w: 3.4, h: 3.0 },  // campfire island (slightly bigger)
      { x: -3.0, z:  14, w: 2.4, h: 2.4 },
    ];
    let seed = 0xBEEF5678;
    for (const b of treeBases) {
      const geom = this.makeMudPatchGeometry(b.w, b.h, seed++, 0.7, 0.12);
      const mesh = new THREE.Mesh(geom, this.makeMudMaterial());
      mesh.position.set(b.x, 0.05, b.z);
      mesh.receiveShadow = true;
      mesh.castShadow = false;
      this.scene.add(mesh);
      this.mudPatches.push(mesh);
    }

    // Outlying small mud tufts for texture — 30 small ones
    for (let i = 0; i < 30; i++) {
      const r = 5 + (i * 7.3 % 60);
      const theta = (i * 1.618) * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      // skip if inside path corridor
      if (Math.abs(x) < 2.5 && z > -55 && z < 18) continue;
      const w = 0.6 + (i * 0.13 % 1.2);
      const h = 0.6 + (i * 0.17 % 1.2);
      const geom = this.makeMudPatchGeometry(w, h, seed++, 0.85, 0.08);
      const mesh = new THREE.Mesh(geom, this.makeMudMaterial());
      mesh.position.set(x, 0.03, z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.mudPatches.push(mesh);
    }
  }

  // Builds an irregular mud patch: irregular circle, slight elevation noise
  makeMudPatchGeometry(radiusX, radiusZ, seed, irregularity = 0.7, maxHeight = 0.15) {
    const segs = 32;
    const rng = mulberry32(seed);
    const geom = new THREE.CircleGeometry(1.0, segs);
    geom.rotateX(-Math.PI / 2);

    // Deform circle into irregular patch
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const angle = Math.atan2(z, x);
      const r = Math.hypot(x, z);

      // Vary radius by angle for irregular outline
      const wobble = 1 + Math.sin(angle * 3 + rng() * 6) * irregularity * 0.2
                          + Math.cos(angle * 5 + rng() * 4) * irregularity * 0.15
                          + (rng() - 0.5) * irregularity * 0.25;
      const y = Math.sin(x * 2.7 + rng() * 3) * maxHeight * 0.6
              + Math.cos(z * 3.1 + rng() * 2) * maxHeight * 0.4
              + (rng() - 0.5) * maxHeight * 0.5;

      pos.setX(i, x * radiusX * wobble);
      pos.setZ(i, z * radiusZ * wobble);
      pos.setY(i, Math.max(0, y));
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
    return geom;
  }

  // Wet mud material — dark, slightly metallic-edge, with vertex colors
  // for subtle tonal variation per patch
  makeMudMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0x1a1208,             // very dark wet earth
      roughness: 0.75,             // wet, not matte
      metalness: 0.05,             // tiny specular catch from moonlight
      flatShading: false,
      vertexColors: true,
    });
  }

  // ─── Cinematic dressing: sky dome, ground fog, bark tufts ───────────────
  // Wraps the GLB trees in atmosphere so they read cinematic, not flat.
  createCinematicDressing() {
    this.createSkyDome();
    this.createSwampWater();      // ← THE swamp signal: standing water
    this.createGroundFog();
    this.createBarkTufts();
    this.createCypressKnees();    // knobby protrusions from water
    this.createCattails();        // vertical grass stalks breaking the surface
  }

  // Inverted sphere with vertical gradient (deep void → misty blue) + a
  // moon disc baked into the fragment shader. Behind the trees it gives
  // them a real silhouette read — flat colored background was Roblox feel.
  createSkyDome() {
    const skyGeom = new THREE.SphereGeometry(120, 32, 16);
    // Flip so we see the inside
    skyGeom.scale(-1, 1, 1);

    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTopColor:    { value: new THREE.Color(0x05080d) }, // deep void
        uMidColor:    { value: new THREE.Color(0x0e1a28) }, // misty horizon
        uBottomColor: { value: new THREE.Color(0x1a1410) }, // warm ground glow
        uMoonDir:     { value: new THREE.Vector3(-0.45, 0.7, 0.55).normalize() },
        uMoonColor:   { value: new THREE.Color(0xeaf2ff) },
        uMoonSize:    { value: 0.012 }, // angular size
      },
      vertexShader: /* glsl */`
        varying vec3 vWorldDir;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldDir = normalize(wp.xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3 vWorldDir;
        uniform vec3 uTopColor;
        uniform vec3 uMidColor;
        uniform vec3 uBottomColor;
        uniform vec3 uMoonDir;
        uniform vec3 uMoonColor;
        uniform float uMoonSize;
        void main() {
          float h = vWorldDir.y; // -1..1
          vec3 sky;
          if (h > 0.0) {
            // Upper hemisphere: deep void → misty blue
            float t = smoothstep(0.0, 0.6, h);
            sky = mix(uMidColor, uTopColor, t);
          } else {
            // Lower hemisphere: warmish ground bounce
            float t = smoothstep(0.0, -0.4, h);
            sky = mix(uMidColor, uBottomColor, t);
          }
          // Moon disc + soft halo
          float d = length(vWorldDir - uMoonDir);
          float moon = 1.0 - smoothstep(uMoonSize, uMoonSize * 1.4, d);
          float halo = 1.0 - smoothstep(uMoonSize * 1.4, uMoonSize * 8.0, d);
          halo = pow(halo, 1.5) * 0.25;
          sky += uMoonColor * moon;
          sky += uMoonColor * halo;
          // Subtle vertical haze near horizon
          float haze = 1.0 - smoothstep(0.0, 0.15, abs(h));
          sky += vec3(0.04, 0.06, 0.08) * haze * 0.4;
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
    });

    const sky = new THREE.Mesh(skyGeom, skyMat);
    sky.name = 'skyDome';
    sky.renderOrder = -1;
    this.scene.add(sky);
    this.skyDome = sky;
  }

  // ─── SWAMP WATER: the dominant surface ──────────────────────────────────
  // Single large plane at y=0 with a custom shader doing:
  //   - subtle ripple displacement (vert shader)
  //   - dark water color with depth gradient
  //   - specular moonlight streak — long bright reflection toward camera
  //   - caustic ripple pattern modulating specular highlight
  //   - distant haze fade so the water melts into fog
  // The water is what tells the user "this is a swamp" not "a forest on grass".
  createSwampWater() {
    const size = 120;
    const geom = new THREE.PlaneGeometry(size, size, 1, 1);
    geom.rotateX(-Math.PI / 2);

    const mat = new THREE.ShaderMaterial({
      transparent: false,
      uniforms: {
        uTime:       { value: 0 },
        uColorDeep:  { value: new THREE.Color(0x05080a) },   // nearly black deep
        uColorShallow: { value: new THREE.Color(0x0a1418) }, // dark teal
        uMoonDir:    { value: new THREE.Vector3(-0.45, 0.7, 0.55).normalize() },
        uMoonColor:  { value: new THREE.Color(0xeaf2ff) },
        uMoonIntensity: { value: 1.4 },
        uFogColor:   { value: new THREE.Color(0x1a2028) },
        uFogDist:    { value: 38.0 }, // water fades into fog past this distance
        uRippleStrength: { value: 0.08 }, // peak displacement amplitude
        uCausticScale:   { value: 1.4 },
      },
      vertexShader: /* glsl */`
        uniform float uTime;
        uniform float uRippleStrength;
        varying vec3 vWorldPos;
        varying float vRipple;

        // Cheap hash + value noise for ripple
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i + vec2(1,0));
          float c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
        }

        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          // Layered ripple — two scales for chop + swell
          float r1 = vnoise(wp.xz * 0.4 + uTime * 0.3) - 0.5;
          float r2 = vnoise(wp.xz * 1.5 - uTime * 0.2) - 0.5;
          float ripple = (r1 + r2 * 0.4) * uRippleStrength;
          wp.y += ripple;
          vWorldPos = wp.xyz;
          vRipple = ripple;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 uColorDeep;
        uniform vec3 uColorShallow;
        uniform vec3 uMoonDir;
        uniform vec3 uMoonColor;
        uniform float uMoonIntensity;
        uniform vec3 uFogColor;
        uniform float uFogDist;
        uniform float uTime;
        uniform float uCausticScale;
        varying vec3 vWorldPos;
        varying float vRipple;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i + vec2(1,0));
          float c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
        }
        float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 3; i++) { v += a * vnoise(p); p *= 2.05; a *= 0.5; }
          return v;
        }

        void main() {
          // Water base color: deep center, slightly brighter where ripple high
          float rippleNorm = vRipple * 12.0 + 0.5;
          vec3 base = mix(uColorDeep, uColorShallow, smoothstep(0.0, 0.7, rippleNorm));

          // Specular streak from moon
          // The moon reflection is strongest where the surface normal aligns
          // with the half-vector between camera and moon. For a flat-ish water
          // we approximate by sampling the wave gradient direction.
          // Simple approach: a long bright streak from the moon direction
          // projected onto XZ plane.
          vec2 moonXZ = normalize(uMoonDir.xz);
          vec2 fromMoonXZ = normalize(vWorldPos.xz - vec2(0.0));
          // cos of angle between view-from-moon and the camera direction (toward 0)
          vec2 toCenter = -normalize(vWorldPos.xz);
          float align = max(0.0, dot(toCenter, moonXZ));
          // Streak width: narrow near moon, widens toward camera
          float distFromCenter = length(vWorldPos.xz);
          float streakWidth = 0.18 + distFromCenter * 0.012;
          float streakFalloff = smoothstep(streakWidth, 0.0, abs(dot(toCenter, vec2(-moonXZ.y, moonXZ.x))));
          float streak = align * streakFalloff;

          // Caustic ripple modulation on the streak
          float caustic = fbm(vWorldPos.xz * uCausticScale + uTime * 0.15);
          streak *= 0.4 + caustic * 1.4;

          // Distance fog — water fades to fog color past uFogDist
          float fogMix = smoothstep(uFogDist * 0.5, uFogDist, distFromCenter);
          vec3 col = mix(base, uFogColor, fogMix);

          // Add the moon streak
          col += uMoonColor * streak * uMoonIntensity;

          // Subtle ambient water shimmer everywhere
          float shimmer = fbm(vWorldPos.xz * 2.5 - uTime * 0.1) * 0.04;
          col += vec3(shimmer) * (1.0 - fogMix);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const water = new THREE.Mesh(geom, mat);
    water.position.y = 0.0;
    water.name = 'swampWater';
    water.renderOrder = -1;
    water.receiveShadow = false; // shader handles its own lighting
    this.scene.add(water);
    this.swampWater = water;
    this.swampWaterMat = mat;
  }

  // Cypress knees — small dark conical knobs protruding from the water.
  // Scattered across the swamp; ~80 instances. The signature cypress knee
  // shape is a stubby bulb with a slightly tapered neck.
  createCypressKnees() {
    const geom = new THREE.ConeGeometry(0.18, 0.55, 8, 1, false);
    geom.translate(0, 0.275, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a0f06,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true,
    });

    const rng = mulberry32(0xC4CE55EE);
    const count = 80;
    const mesh = new THREE.InstancedMesh(geom, mat, count);
    const dummy = new THREE.Object3D();
    let placed = 0;
    for (let i = 0; i < count * 2 && placed < count; i++) {
      // Polar placement, biased outward
      const r = 4 + rng() * 55;
      const theta = rng() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      // Skip path corridor (camera must walk through clear water)
      if (Math.abs(x) < 2.2 && z > -55 && z < 18) continue;
      // Skip if too close to a tree base (avoid clipping)
      const distToTreeBase = Math.min(
        ...[6.0,-7.5,4.2,-6.0,7.0,-4.0,8.0,-9.0,5.0,-3.0].map((tx, j) => {
          const tz = [10,4,-15,-22,18,22,-4,-10,-28,14][j];
          return Math.hypot(x - tx, z - tz);
        })
      );
      if (distToTreeBase < 1.8) continue;

      dummy.position.set(x, 0, z);
      const s = 0.7 + rng() * 0.7;
      dummy.scale.set(s, s * (0.8 + rng() * 0.6), s);
      dummy.rotation.set(0, rng() * Math.PI * 2, (rng() - 0.5) * 0.2);
      dummy.updateMatrix();
      mesh.setMatrixAt(placed, dummy.matrix);
      placed++;
    }
    mesh.count = placed;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.cypressKnees = mesh;
  }

  // Cattails — vertical grass stalks breaking the water surface.
  // Each cattail = thin cylinder + small brown cigar at the top.
  createCattails() {
    const stalkGeom = new THREE.CylinderGeometry(0.025, 0.035, 1.6, 5);
    stalkGeom.translate(0, 0.8, 0);
    const headGeom = new THREE.CylinderGeometry(0.08, 0.06, 0.35, 6);
    headGeom.translate(0, 1.7, 0);

    const stalkMat = new THREE.MeshStandardMaterial({
      color: 0x2a3a1a,
      roughness: 0.9,
      metalness: 0.0,
    });
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x3a2a14,
      roughness: 0.85,
      metalness: 0.0,
      flatShading: true,
    });

    const rng = mulberry32(0xC477155);
    const count = 24;
    const group = new THREE.Group();
    group.name = 'cattails';

    for (let i = 0; i < count; i++) {
      // Cluster around path edges and far from trees
      const side = rng() < 0.5 ? -1 : 1;
      const r = 3 + rng() * 50;
      const x = side * (2.5 + rng() * 8);
      const z = -10 + rng() * 35;
      // Skip if too close to trees
      const cluster = new THREE.Group();
      cluster.position.set(x, 0, z);
      // 2-5 stalks per cluster
      const stalks = 2 + Math.floor(rng() * 4);
      for (let s = 0; s < stalks; s++) {
        const stalk = new THREE.Mesh(stalkGeom, stalkMat);
        stalk.position.set((rng() - 0.5) * 0.4, 0, (rng() - 0.5) * 0.4);
        stalk.rotation.set((rng() - 0.5) * 0.1, 0, (rng() - 0.5) * 0.15);
        const sc = 0.8 + rng() * 0.6;
        stalk.scale.set(sc, sc, sc);
        cluster.add(stalk);

        const head = new THREE.Mesh(headGeom, headMat);
        head.position.copy(stalk.position);
        head.rotation.copy(stalk.rotation);
        head.scale.copy(stalk.scale);
        cluster.add(head);
      }
      group.add(cluster);
    }
    this.scene.add(group);
    this.cattails = group;
  }

  // Thin horizontal fog plane between camera path and the trees. Renders as
  // additive translucent — gives a "god ray through canopy" feel without
  // volumetric raymarching. ~3% GPU cost.
  createGroundFog() {
    const fogGeom = new THREE.PlaneGeometry(120, 120, 1, 1);
    fogGeom.rotateX(-Math.PI / 2);

    const fogMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime:       { value: 0 },
        uColor:      { value: new THREE.Color(0x4a6080) },
        uDensity:    { value: 0.55 },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */`
        varying vec2 vUv;
        varying vec3 vWorldPos;
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uDensity;
        // 2D hash + value noise
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i + vec2(1,0));
          float c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
        }
        float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.05; a *= 0.5; }
          return v;
        }
        void main() {
          // Drift the noise slowly
          vec2 p = vWorldPos.xz * 0.07 + vec2(uTime * 0.02, uTime * 0.013);
          float n = fbm(p);
          // Falloff toward edges so the plane doesn't have a hard square edge
          float r = length(vUv - 0.5) * 2.0;
          float falloff = 1.0 - smoothstep(0.5, 0.95, r);
          float alpha = n * uDensity * falloff;
          gl_FragColor = vec4(uColor * alpha, alpha * 0.5);
        }
      `,
    });

    const fog = new THREE.Mesh(fogGeom, fogMat);
    fog.position.y = 0.6; // hovers just above ground
    fog.name = 'groundFog';
    fog.renderOrder = 1;
    this.scene.add(fog);
    this.groundFog = fog;
    this.groundFogMat = fogMat;
  }

  // Per-tree bark tufts and mossy ground cover placed at the base of each
  // GLB tree once it loads. Covers the harsh root/ground meeting so each
  // tree reads as rooted in earth, not pasted on a disc.
  createBarkTufts() {
    // Placeholders — actual tufts are added in loadGLBTrees() once positions known
    this.barkTufts = [];
    this.mossRocks = [];
  }

  // Called after GLB trees load — adds tufts at each tree base
  addTuftsForTree(treePos) {
    const rng = mulberry32(Math.floor((treePos.x * 31.7 + treePos.z * 17.3) * 1000));

    // Bark tuft: small dark mound around the trunk base
    const tuftGeom = new THREE.SphereGeometry(0.8, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    tuftGeom.scale(1.4, 0.5, 1.4);
    const tuftMat = new THREE.MeshStandardMaterial({
      color: 0x1a0f08,
      roughness: 1.0,
      metalness: 0.0,
    });
    const tuft = new THREE.Mesh(tuftGeom, tuftMat);
    tuft.position.copy(treePos);
    tuft.position.y = -0.05;
    tuft.receiveShadow = true;
    tuft.castShadow = true;
    this.scene.add(tuft);
    this.barkTufts.push(tuft);

    // 3-5 mossy rocks around base, varied sizes
    const rockCount = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < rockCount; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 0.8 + rng() * 1.2;
      const size = 0.15 + rng() * 0.35;
      const rockGeom = new THREE.DodecahedronGeometry(size, 0);
      const rockMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x2a3a1a).lerp(new THREE.Color(0x1a2a1a), rng()),
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true,
      });
      const rock = new THREE.Mesh(rockGeom, rockMat);
      rock.position.set(
        treePos.x + Math.cos(angle) * dist,
        size * 0.3,
        treePos.z + Math.sin(angle) * dist
      );
      rock.rotation.set(rng() * 0.4, rng() * Math.PI * 2, rng() * 0.4);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
      this.mossRocks.push(rock);
    }
  }

  // ─── Forest: 60–80 instanced low-poly trees in a ring around the path ────
  createForest() {
    const TREE_COUNT = 72;
    const rng = mulberry32(0x5EED7A11);

    // Trunk: brown-black cone (low segment count for poly budget)
    const trunkGeom = new THREE.CylinderGeometry(0.18, 0.28, 1.0, 6, 1, false);
    trunkGeom.translate(0, 0.5, 0); // base at y=0
    const trunkMat = new THREE.MeshStandardMaterial({
      color: TRUNK_DARK,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true,
    });
    const trunkInst = new THREE.InstancedMesh(trunkGeom, trunkMat, TREE_COUNT);
    trunkInst.name = 'forestTrunks';

    // Canopy: dark green low-poly sphere (octahedron feels swampier)
    const canopyGeom = new THREE.OctahedronGeometry(1.0, 1);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: CANOPY_B,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true,
    });
    const canopyInst = new THREE.InstancedMesh(canopyGeom, canopyMat, TREE_COUNT);
    canopyInst.name = 'forestCanopies';

    // Second canopy layer, darker, slightly larger and offset — depth
    const canopyGeom2 = new THREE.OctahedronGeometry(1.0, 1);
    const canopyMat2 = new THREE.MeshStandardMaterial({
      color: CANOPY_A,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true,
    });
    const canopyInst2 = new THREE.InstancedMesh(canopyGeom2, canopyMat2, TREE_COUNT);
    canopyInst2.name = 'forestCanopies2';

    // Place trees in a ring (8 < r < 70), avoiding the path corridor
    // (|x| < 4, -55 < z < 5). Allow some clustering by biased radii.
    const dummy = new THREE.Object3D();
    let placed = 0;
    let attempts = 0;
    while (placed < TREE_COUNT && attempts < TREE_COUNT * 6) {
      attempts++;
      // Bias ~30% of trees into clusters near the perimeter
      const cluster = rng() < 0.3;
      const r = cluster
        ? 25 + rng() * 40 // mid–far ring (clusters)
        : 8 + Math.pow(rng(), 0.6) * 62; // full ring, biased near
      const theta = rng() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      // Path carve-out: keep a clear corridor along ±x near origin
      if (Math.abs(x) < 4.2 && z > -55 && z < 6) continue;
      // Keep clear of campfire (z = -30, r > 5)
      const dxF = x - 0, dzF = z - -30;
      if (dxF * dxF + dzF * dzF < 36) continue;

      // Scale: trees 4–9 units tall
      const heightScale = 4 + rng() * 5;
      // Trunk ~50% of tree height, canopy 60–80% of remaining
      const trunkScale = heightScale * 0.5;
      const canopyScale = heightScale * 0.45 * (0.85 + rng() * 0.4);

      // Trunk instance
      dummy.position.set(x, 0, z);
      dummy.rotation.set(0, rng() * Math.PI * 2, 0);
      dummy.scale.set(1, trunkScale, 1);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(placed, dummy.matrix);

      // Primary canopy
      dummy.position.set(x, trunkScale + canopyScale * 0.55, z);
      dummy.rotation.set(rng() * 0.4, rng() * Math.PI * 2, rng() * 0.4);
      dummy.scale.set(canopyScale, canopyScale * 1.1, canopyScale);
      dummy.updateMatrix();
      canopyInst.setMatrixAt(placed, dummy.matrix);

      // Secondary canopy (offset, slightly bigger, darker)
      const ox = (rng() - 0.5) * 0.6;
      const oy = (rng() - 0.5) * 0.5;
      const oz = (rng() - 0.5) * 0.6;
      dummy.position.set(x + ox, trunkScale + canopyScale * 0.4 + oy, z + oz);
      dummy.rotation.set(rng() * Math.PI, rng() * Math.PI * 2, rng() * Math.PI);
      dummy.scale.set(canopyScale * 1.15, canopyScale * 0.9, canopyScale * 1.15);
      dummy.updateMatrix();
      canopyInst2.setMatrixAt(placed, dummy.matrix);

      placed++;
    }
    trunkInst.count = placed;
    canopyInst.count = placed;
    canopyInst2.count = placed;
    trunkInst.instanceMatrix.needsUpdate = true;
    canopyInst.instanceMatrix.needsUpdate = true;
    canopyInst2.instanceMatrix.needsUpdate = true;

    this.scene.add(trunkInst);
    this.scene.add(canopyInst);
    this.scene.add(canopyInst2);

    this.forest = { trunkInst, canopyInst, canopyInst2, count: placed };
  }

  // ─── Real GLB-loaded swamp trees — PBR-shaded, high quality ──────────────
  // Loads all 5 tree variants from email attachments and distributes them
  // across a ±60m × 145m area along the camera path (deep forest → clearing).
  // Three depth layers: close-up (large), midground, background (fog-faded).
  // Loaded asynchronously; falls back to procedural trees if all fail.
  loadGLBTrees() {
    this.glbTrees = [];
    this.glbReady = false;
    const loader = new GLTFLoader();

    // The 5 tree files. tree-1 and tree-2 are duplicates — weight accordingly.
    const treeFiles = [
      { file: 'tree.glb',   weight: 1.0 },
      { file: 'tree-1.glb', weight: 1.0 },
      { file: 'tree-2.glb', weight: 0.5 },   // duplicate of tree-1, less common
      { file: 'tree-3.glb', weight: 0.7 },   // smaller tree, used for far layer
      { file: 'tree-4.glb', weight: 1.0 },
    ];

    let pendingLoads = treeFiles.length;
    const loadedScenes = {};   // filename → gltf.scene
    const self = this;

    function onAllLoaded() {
      // ── POISSON-DISC-LIKE TREE PLACEMENT ───────────────────────────────
      // Avoid the camera path corridor (±2.5m around path centerline).
      // Distribute across 3 depth layers, biased by layer.

      const rng = mulberry32(0xA17EE);  // deterministic

      // Helper: minimum distance from any existing tree (in 2D x/z plane)
      function tooCloseToExisting(x, z, minDist) {
        for (const t of self.glbTrees) {
          const dx = t.position.x - x;
          const dz = t.position.z - z;
          if (dx*dx + dz*dz < minDist*minDist) return true;
        }
        return false;
      }

      // Helper: distance from camera path at this point. We approximate by
      // checking against the few keyframes (good enough since the path is
      // gentle).
      const pathPts = [
        [0, 80], [-1, 50], [0, 20], [-2, -10], [1, -22], [0, -45], [0, -65],
      ];
      function pathCorridorDistance(x, z) {
        let minD2 = Infinity;
        for (const [px, pz] of pathPts) {
          const dx = x - px;
          const dz = z - pz;
          const d2 = dx*dx + dz*dz;
          if (d2 < minD2) minD2 = d2;
        }
        return Math.sqrt(minD2);
      }

      // Layer config: number, lateral spread, scale, min spacing
      const layers = [
        // Foreground — close-up large trees along path, scale 1.0×
        { count: 24, xRange: 28, zRange: [-72, 82], scale: [0.14, 0.18], corridor: 3.5, minDist: 4.0, variants: [0, 1, 3, 4] },
        // Midground — middle distance, scale 0.7×
        { count: 36, xRange: 50, zRange: [-75, 82], scale: [0.10, 0.14], corridor: 4.0, minDist: 5.0, variants: [0, 1, 2, 3, 4] },
        // Background — far back, scale 0.5×, heavily fogged
        { count: 40, xRange: 80, zRange: [-78, 85], scale: [0.08, 0.12], corridor: 5.0, minDist: 6.0, variants: [2, 3] },
      ];

      let placed = 0;
      const totalTarget = layers.reduce((s, l) => s + l.count, 0);

      for (const layer of layers) {
        let layerPlaced = 0;
        let attempts = 0;
        const maxAttempts = layer.count * 40;  // safety bail

        while (layerPlaced < layer.count && attempts < maxAttempts) {
          attempts++;
          // Pick random position in layer bounds
          const x = (rng() - 0.5) * 2 * layer.xRange;
          const z = layer.zRange[0] + rng() * (layer.zRange[1] - layer.zRange[0]);

          // Skip if too close to camera path corridor
          if (pathCorridorDistance(x, z) < layer.corridor) continue;

          // Skip if too close to existing tree
          if (tooCloseToExisting(x, z, layer.minDist)) continue;

          // Pick a tree variant weighted by variants array
          const variant = layer.variants[Math.floor(rng() * layer.variants.length)];
          const fileInfo = treeFiles[variant];
          const src = loadedScenes[fileInfo.file];
          if (!src) continue;  // safety

          // Clone and place
          const clone = src.clone(true);
          const scaleVal = layer.scale[0] + rng() * (layer.scale[1] - layer.scale[0]);
          clone.position.set(x, 0, z);
          clone.rotation.y = rng() * Math.PI * 2;
          clone.scale.setScalar(scaleVal);
          clone.name = `glbTree_${variant}_${layerPlaced}`;

          // Shadow + receive
          clone.traverse((o) => {
            o.castShadow = (layer === layers[0]);   // only foreground casts shadows (perf)
            o.receiveShadow = true;
          });

          self.scene.add(clone);
          self.glbTrees.push(clone);

          // Add bark tuft + mossy rocks at base for foreground only
          if (layer === layers[0]) {
            self.addTuftsForTree(clone.position);
          }

          layerPlaced++;
          placed++;
        }
      }

      // Hide procedural fallback
      if (self.forest) {
        self.forest.trunkInst.visible    = false;
        self.forest.canopyInst.visible   = false;
        self.forest.canopyInst2.visible  = false;
      }

      // Compute combined bbox
      const bbox = new THREE.Box3();
      for (const t of self.glbTrees) bbox.expandByObject(t);

      self.glbReady = true;
      self.glbBbox = bbox;
      console.info(`[anura] GLB trees placed: ${placed} / ${totalTarget} target. ` +
                   `bbox=${bbox.min.toArray().map(n => n.toFixed(1))} to ${bbox.max.toArray().map(n => n.toFixed(1))}`);
      window.dispatchEvent(new CustomEvent('anura:treesReady', { detail: { count: placed } }));
    }

    // Helper: fix colorSpaces on a loaded scene (same as before)
    function fixMaterials(src) {
      src.traverse((obj) => {
        if (!obj.isMesh) return;
        const mat = obj.material;
        if (!mat) return;
        if (mat.map)             mat.map.colorSpace           = THREE.SRGBColorSpace;
        if (mat.normalMap)       mat.normalMap.colorSpace    = THREE.NoColorSpace;
        if (mat.roughnessMap)    mat.roughnessMap.colorSpace = THREE.NoColorSpace;
        if (mat.metalnessMap)    mat.metalnessMap.colorSpace = THREE.NoColorSpace;
        if (mat.aoMap)           mat.aoMap.colorSpace        = THREE.NoColorSpace;
        if (mat.emissiveMap)     mat.emissiveMap.colorSpace  = THREE.SRGBColorSpace;
        if (mat.alphaMap || obj.name?.toLowerCase().includes('leaf')) {
          mat.transparent = false;
          mat.alphaTest = 0.5;
          mat.side = THREE.DoubleSide;
          mat.depthWrite = true;
        }
      });
    }

    // Fire all 5 loads
    treeFiles.forEach(({ file }) => {
      loader.load(
        `/assets/models/${file}`,
        (gltf) => {
          fixMaterials(gltf.scene);
          loadedScenes[file] = gltf.scene;
          pendingLoads--;
          if (pendingLoads === 0) onAllLoaded();
        },
        undefined,
        (err) => {
          console.warn(`[anura] ${file} failed to load:`, err.message || err);
          pendingLoads--;
          if (pendingLoads === 0) {
            // If any loaded, proceed; otherwise keep procedural fallback
            if (Object.keys(loadedScenes).length > 0) onAllLoaded();
          }
        }
      );
    });
  }

  // ─── Mushrooms: 30–40 bioluminescent mushrooms near path / tree bases ────
  createMushrooms() {
    const MUSH_COUNT = 36;
    const rng = mulberry32(0xDEADBEEF);

    // Cluster of two to four mushrooms forms one "patch"
    const PATCH_COUNT = 12;
    const patches = [];
    for (let i = 0; i < PATCH_COUNT; i++) {
      // Distribute patches along the path corridor, sometimes offset into trees
      const onPath = rng() < 0.55;
      const x = onPath ? (rng() - 0.5) * 5 : (rng() - 0.5) * 22;
      const z = -8 - rng() * 38; // between campfire (-30) and front area
      patches.push(new THREE.Vector3(x, 0, z));
    }

    // Reuse geometries across all mushrooms (cheap)
    const stemGeom = new THREE.CylinderGeometry(0.04, 0.06, 0.22, 6, 1, false);
    stemGeom.translate(0, 0.11, 0);
    const capGeom = new THREE.SphereGeometry(0.13, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0xe6e2d0,
      roughness: 0.7,
      metalness: 0.0,
      flatShading: true,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xb0e8e8,
      emissive: GHOST_MOSS,
      emissiveIntensity: 1.5,
      roughness: 0.4,
      metalness: 0.0,
      flatShading: true,
    });
    this.mushroomMaterials.push(capMat);

    const group = new THREE.Group();
    group.name = 'mushrooms';
    this.mushroomGroup = group;
    let made = 0;
    for (const p of patches) {
      const clusterSize = 2 + Math.floor(rng() * 3); // 2–4
      for (let i = 0; i < clusterSize && made < MUSH_COUNT; i++) {
        const offset = new THREE.Vector3(
          (rng() - 0.5) * 1.6,
          0,
          (rng() - 0.5) * 1.6
        );
        const pos = p.clone().add(offset);
        const stem = new THREE.Mesh(stemGeom, stemMat);
        const cap = new THREE.Mesh(capGeom, capMat);
        const m = new THREE.Group();
        m.add(stem);
        m.add(cap);
        m.position.copy(pos);
        // Per-mushroom scale variation
        const s = 0.7 + rng() * 0.9;
        m.scale.set(s, s, s);
        m.rotation.y = rng() * Math.PI * 2;
        group.add(m);
        made++;
      }
    }
    this.scene.add(group);

    // Subtle point lights at the brightest patch to spill colour on ground
    // (limit to two — one per major cluster — to stay budget-friendly)
    const glowA = new THREE.PointLight(GHOST_MOSS, 0.35, 4, 1.6);
    glowA.position.set(patches[3].x, 0.4, patches[3].z);
    this.scene.add(glowA);
    const glowB = new THREE.PointLight(GHOST_MOSS, 0.35, 4, 1.6);
    glowB.position.set(patches[8].x, 0.4, patches[8].z);
    this.scene.add(glowB);

    // Hotspot: a mushroom cluster somewhere mid-path (≈ z = -15)
    const hotspotPos = new THREE.Vector3(patches[5].x, 0.5, patches[5].z);
    const hotspotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 12, 10),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hotspotMesh.position.copy(hotspotPos);
    hotspotMesh.name = 'hotspot_mushroom';
    this.scene.add(hotspotMesh);
    this.hotspots.push({
      mesh: group,                      // visible mushroom group for OutlinePass
      proxy: hotspotMesh,               // reuse as raycast proxy
      name: 'mushroom',
      position: hotspotPos.clone(),
      radius: 1.5,
      data: {
        kicker: 'BIOLUMINESCENCE',
        title: 'Light You Can Only See When You Stop',
        body:
          '<p>Every craftsman has a quiet, almost invisible layer of work — the part that no algorithm rewards, no client sees, no metric tracks.</p>' +
          '<p>It is also the part that makes everything else glow.</p>' +
          '<p>Anura Systems is built to honour that layer. To make the invisible visible without compromising it.</p>',
        cta: null,
      },
    });
  }

  // ─── Campfire: stacked logs + flame particle system + warm point light ───
  createCampfire() {
    const group = new THREE.Group();
    group.name = 'campfire';
    const pos = new THREE.Vector3(0, 0, -30);

    // Fire pit ring — a flat torus of dark stone around the logs
    const pitGeom = new THREE.TorusGeometry(1.1, 0.12, 6, 18);
    pitGeom.rotateX(Math.PI / 2);
    const pitMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true,
    });
    const pit = new THREE.Mesh(pitGeom, pitMat);
    pit.position.copy(pos).add(new THREE.Vector3(0, 0.08, 0));
    this.scene.add(pit);

    // Logs: 3 cylinders in a crossed stack
    const logGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8, 1, false);
    logGeom.rotateZ(Math.PI / 2);
    const logMat = new THREE.MeshStandardMaterial({
      color: 0x2a1a10,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true,
    });
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0xff8844,
      emissive: EMBER_AMBER,
      emissiveIntensity: 1.2,
      roughness: 0.6,
    });
    for (let i = 0; i < 3; i++) {
      const log = new THREE.Mesh(logGeom, logMat);
      log.position.copy(pos).add(new THREE.Vector3(0, 0.12 + i * 0.1, 0));
      log.rotation.y = (i * Math.PI) / 3;
      group.add(log);
    }
    // A few glowing embers on top
    for (let i = 0; i < 4; i++) {
      const ember = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 5),
        emberMat
      );
      const a = (i / 4) * Math.PI * 2;
      ember.position.copy(pos).add(new THREE.Vector3(
        Math.cos(a) * 0.25,
        0.4 + Math.random() * 0.05,
        Math.sin(a) * 0.25
      ));
      group.add(ember);
    }
    this.scene.add(group);

    // Flame particle system — 200 points, additive blending, custom shader
    // for vertical drift + flicker + amber→red gradient.
    const PARTICLE_COUNT = 200;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const lifetimes = new Float32Array(PARTICLE_COUNT); // 0..1
    const seeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.spawnFireParticle(positions, lifetimes, seeds, i, true);
    }
    this.fireGeometry = new THREE.BufferGeometry();
    this.fireGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.fireGeometry.setAttribute('aLife', new THREE.BufferAttribute(lifetimes, 1));
    this.fireGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    this.fireMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 38.0 * this.dpr },
        uColorHot: { value: new THREE.Color(0xfff0a0) },
        uColorWarm: { value: new THREE.Color(EMBER_AMBER) },
        uColorCool: { value: new THREE.Color(0x8a1a06) },
      },
      vertexShader: /* glsl */`
        attribute float aLife;
        attribute float aSeed;
        uniform float uTime;
        uniform float uSize;
        varying float vLife;
        varying float vSeed;
        void main() {
          vLife = aLife;
          vSeed = aSeed;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          // Size grows then shrinks across lifetime
          float s = sin(aLife * 3.14159);
          gl_PointSize = uSize * s * (1.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 uColorHot;
        uniform vec3 uColorWarm;
        uniform vec3 uColorCool;
        varying float vLife;
        varying float vSeed;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float r = length(uv);
          float disk = smoothstep(0.5, 0.05, r);
          if (disk <= 0.0) discard;
          // Age: 0 (fresh) → 1 (dying)
          float age = 1.0 - vLife;
          vec3 col;
          if (age < 0.3) {
            col = mix(uColorHot, uColorWarm, age / 0.3);
          } else {
            col = mix(uColorWarm, uColorCool, (age - 0.3) / 0.7);
          }
          // Flicker from per-particle seed
          col *= 0.85 + 0.3 * fract(sin(vSeed * 12.9898) * 43758.5453);
          gl_FragColor = vec4(col, disk * vLife);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.fireParticles = new THREE.Points(this.fireGeometry, this.fireMaterial);
    this.fireParticles.position.copy(pos).add(new THREE.Vector3(0, 0.15, 0));
    this.fireParticles.name = 'fireParticles';
    this.scene.add(this.fireParticles);

    // Warm point light at campfire
    this.campfireLight = new THREE.PointLight(EMBER_AMBER, 2.5, 15, 1.5);
    this.campfireLight.position.copy(pos).add(new THREE.Vector3(0, 0.6, 0));
    this.scene.add(this.campfireLight);

    // Stash the visible campfire group so hotspots can outline it
    this.campfireGroup = group;

    // Hotspot: campfire (proxy sphere for raycasting; visible mesh = campfire group)
    const hotspotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 12, 10),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hotspotMesh.position.copy(pos).add(new THREE.Vector3(0, 1.5, 0));
    hotspotMesh.name = 'hotspot_campfire';
    this.scene.add(hotspotMesh);
    this.hotspots.push({
      mesh: group,                      // visible target for OutlinePass
      proxy: hotspotMesh,               // reuse as raycast proxy
      name: 'campfire',
      position: hotspotMesh.position.clone(),
      radius: 2.0,
      data: {
        kicker: 'THE SANCTUARY',
        title: 'Where We Stopped Running',
        body:
          '<p>Anura Systems exists for the craftspeople who have spent years perfecting their craft, only to find their digital presence has been forgotten by the algorithm.</p>' +
          '<p>We are the gate. The sanctuary between the work and the world.</p>',
        cta: null,
      },
    });
  }

  spawnFireParticle(positions, lifetimes, seeds, i, initial = false) {
    // Birth position: a small disc above the logs
    const r = Math.sqrt(Math.random()) * 0.35;
    const a = Math.random() * Math.PI * 2;
    positions[i * 3 + 0] = Math.cos(a) * r;
    positions[i * 3 + 1] = initial ? Math.random() * 1.4 : 0.05;
    positions[i * 3 + 2] = Math.sin(a) * r;
    lifetimes[i] = Math.random();        // 0..1
    seeds[i] = Math.random();
  }

  // ─── Stars: 200 points in upper hemisphere only ─────────────────────────
  createStars() {
    const STAR_COUNT = 200;
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const rng = mulberry32(0xC0FFEE42);
    for (let i = 0; i < STAR_COUNT; i++) {
      // Uniform on upper hemisphere of a large sphere
      const u = rng();
      const v = rng() * 0.5 + 0.5; // bias to upper half
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const R = 90 + rng() * 10;
      positions[i * 3 + 0] = R * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = R * Math.cos(phi) + 5; // y > 10
      positions[i * 3 + 2] = R * Math.sin(phi) * Math.sin(theta);
      sizes[i] = 0.12 + rng() * 0.1;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: this.dpr },
      },
      vertexShader: /* glsl */`
        attribute float aSize;
        uniform float uPixelRatio;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 4.0 * uPixelRatio;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(1.0, 1.0, 1.0, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.stars = new THREE.Points(geom, mat);
    this.stars.name = 'stars';
    this.scene.add(this.stars);
  }

  // ─── Frog placeholder: low-poly body + head on a rock at the campfire ───
  createFrog() {
    const group = new THREE.Group();
    group.name = 'frog';

    // Body: scaled, low-poly icosahedron (a chunky little toad shape)
    const bodyGeom = new THREE.IcosahedronGeometry(0.28, 0);
    bodyGeom.scale(1.2, 0.85, 1.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: FROG_BODY,
      roughness: 0.8,
      metalness: 0.0,
      flatShading: true,
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.28;
    group.add(body);

    // Head: smaller icosahedron
    const headGeom = new THREE.IcosahedronGeometry(0.18, 0);
    const head = new THREE.Mesh(headGeom, bodyMat);
    head.position.set(0, 0.42, 0.22);
    group.add(head);

    // Eyes: two tiny spheres with a phosphor-green emissive
    const eyeGeom = new THREE.SphereGeometry(0.05, 8, 6);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x0a1a0a,
      emissive: 0x4dff7a,
      emissiveIntensity: 1.8,
      roughness: 0.3,
    });
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(-0.09, 0.5, 0.32);
    group.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.09;
    group.add(eyeR);

    // Front feet: two small flat boxes
    const footGeom = new THREE.BoxGeometry(0.1, 0.04, 0.14);
    const footL = new THREE.Mesh(footGeom, bodyMat);
    footL.position.set(-0.14, 0.08, 0.22);
    group.add(footL);
    const footR = footL.clone();
    footR.position.x = 0.14;
    group.add(footR);

    // Place on a rock just in front of the campfire, facing camera (+z)
    const rockGeom = new THREE.DodecahedronGeometry(0.45, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a32,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true,
    });
    const rock = new THREE.Mesh(rockGeom, rockMat);
    rock.position.set(1.4, 0.18, -28.2);
    rock.scale.set(1.0, 0.55, 1.2);
    this.scene.add(rock);

    group.position.set(1.4, 0.42, -28.2);
    group.rotation.y = Math.PI; // face camera (positive z direction)
    this.scene.add(group);

    this.frog = group;
    this.frogBaseY = group.position.y;

    // Hotspot: frog (proxy sphere for raycasting; visible mesh = frog group)
    const hotspotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 10),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hotspotMesh.position.copy(group.position).add(new THREE.Vector3(0, 0.2, 0));
    hotspotMesh.name = 'hotspot_frog';
    this.scene.add(hotspotMesh);
    this.hotspots.push({
      mesh: group,                      // visible frog group for OutlinePass
      proxy: hotspotMesh,               // reuse as raycast proxy
      name: 'frog',
      position: hotspotMesh.position.clone(),
      radius: 1.0,
      data: {
        kicker: 'THE GUIDE',
        title: 'A Small Voice, An Old Forest',
        body:
          '<p>Anura began as a single question from its founder — a designer–developer who had spent a decade watching meticulous work get flattened by the feed.</p>' +
          '<p>If the algorithm will not see the work, who will? The frog answers from the rock beside the fire: someone has to sit still long enough to notice.</p>',
        cta: null,
      },
    });
  }

  // ─── A special tree at z = -15 with hanging moss strips ────────────────
  createHangingMossTree() {
    const treePos = new THREE.Vector3(4.2, 0, -15);

    // Wrap the whole tree in a group so the hotspot can outline it
    const treeGroup = new THREE.Group();
    treeGroup.name = 'hangingMossTree';
    treeGroup.position.set(treePos.x, 0, treePos.z);
    this.scene.add(treeGroup);

    // Trunk (taller, gnarled)
    const trunkGeom = new THREE.CylinderGeometry(0.22, 0.32, 6.5, 6, 1, false);
    trunkGeom.translate(0, 3.25, 0);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: TRUNK_DARK,
      roughness: 0.95,
      flatShading: true,
    });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    treeGroup.add(trunk);

    // Canopy: layered
    const canopyMat = new THREE.MeshStandardMaterial({
      color: CANOPY_B,
      roughness: 0.9,
      flatShading: true,
    });
    for (let i = 0; i < 3; i++) {
      const r = 1.3 - i * 0.2;
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(r, 1), canopyMat);
      c.position.set(
        (Math.random() - 0.5) * 0.5,
        5.5 + i * 0.6,
        (Math.random() - 0.5) * 0.5
      );
      c.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      treeGroup.add(c);
    }

    // Hanging moss: 6 thin tapered strips (cones) drooping from the canopy
    const mossMat = new THREE.MeshStandardMaterial({
      color: MOSS_HANG,
      emissive: 0x113311,
      emissiveIntensity: 0.4,
      roughness: 0.85,
      flatShading: true,
    });
    for (let i = 0; i < 6; i++) {
      const len = 1.2 + Math.random() * 1.0;
      const mossGeom = new THREE.ConeGeometry(0.05, len, 4, 1, true);
      // Move pivot to the top so the cone "hangs" downward
      mossGeom.translate(0, -len / 2, 0);
      const m = new THREE.Mesh(mossGeom, mossMat);
      const a = (i / 6) * Math.PI * 2;
      m.position.set(
        Math.cos(a) * 0.7,
        5.2 - Math.random() * 0.4,
        Math.sin(a) * 0.7
      );
      m.rotation.z = (Math.random() - 0.5) * 0.4;
      m.rotation.x = (Math.random() - 0.5) * 0.4;
      treeGroup.add(m);
    }

    // A faint cyan point light at the trunk base — hints at magic
    const mossGlow = new THREE.PointLight(0x3aff8a, 0.4, 3.5, 1.6);
    mossGlow.position.set(0, 1.2, 0);  // local to treeGroup
    treeGroup.add(mossGlow);

    // Hotspot: hanging-moss tree (proxy sphere for raycasting; visible mesh = treeGroup)
    const hotspotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 12, 10),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hotspotMesh.position.set(treePos.x, 3.0, treePos.z);
    hotspotMesh.name = 'hotspot_tree';
    this.scene.add(hotspotMesh);
    this.hotspots.push({
      mesh: treeGroup,                 // visible tree group for OutlinePass
      proxy: hotspotMesh,              // reuse as raycast proxy
      name: 'tree',
      position: hotspotMesh.position.clone(),
      radius: 1.8,
      data: {
        kicker: 'THE PROCESS',
        title: 'Slow. Layered. Patient.',
        body:
          '<p>Anura Systems works the way this forest grows — slowly, in layers, with attention to what the eye cannot see at first glance.</p>' +
          '<p>Research, identity, narrative, interface. Built one quiet layer at a time, until the whole thing glows from within.</p>',
        cta: null,
      },
    });
  }

  // ─── Per-frame animation ────────────────────────────────────────────────
  update(elapsed) {
    // Animate swamp water ripple + caustics
    if (this.swampWaterMat) {
      this.swampWaterMat.uniforms.uTime.value = elapsed;
    }

    // Drift ground fog noise
    if (this.groundFogMat) {
      this.groundFogMat.uniforms.uTime.value = elapsed;
    }

    // Mushroom pulse: emissive 1.0 + sin(t*2) * 0.5
    for (const mat of this.mushroomMaterials) {
      if (mat && mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = 1.0 + Math.sin(elapsed * 2.0) * 0.5;
      }
    }

    // Fire particles: drift upward, recycle when life expires
    if (this.fireParticles && this.fireGeometry) {
      const pos = this.fireGeometry.attributes.position.array;
      const life = this.fireGeometry.attributes.aLife.array;
      const seeds = this.fireGeometry.attributes.aSeed.array;
      const count = life.length;
      for (let i = 0; i < count; i++) {
        // age
        life[i] -= 0.012 + (i % 7) * 0.0015;
        if (life[i] <= 0) {
          // respawn at base
          this.spawnFireParticle(pos, life, seeds, i, false);
          continue;
        }
        // upward drift + slight horizontal sway from seed
        const sway = Math.sin(elapsed * 3.0 + seeds[i] * 12.0) * 0.003;
        pos[i * 3 + 1] += 0.018 + life[i] * 0.01;
        pos[i * 3 + 0] += sway;
        pos[i * 3 + 2] += Math.cos(elapsed * 2.7 + seeds[i] * 9.0) * 0.003;
      }
      this.fireGeometry.attributes.position.needsUpdate = true;
      this.fireGeometry.attributes.aLife.needsUpdate = true;
      this.fireMaterial.uniforms.uTime.value = elapsed;
    }

    // Campfire light flicker
    if (this.campfireLight) {
      this.campfireLight.intensity =
        2.5 + Math.sin(elapsed * 9.0) * 0.25 + Math.sin(elapsed * 17.3) * 0.15;
    }

    // Frog idle bob
    if (this.frog) {
      this.frog.position.y = this.frogBaseY + Math.sin(elapsed * 1.5) * 0.05;
      // Tiny head turn — gives it a "looking around" feel
      this.frog.rotation.y = Math.PI + Math.sin(elapsed * 0.7) * 0.15;
    }
  }

  getHotspots() {
    return this.hotspots;
  }
}

export default World;
