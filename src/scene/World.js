// Anura Systems — persistent 3D swamp forest scene
// Brand DNA: dark swamp, phosphor green accents, ember amber fire,
// low-poly ~30k tris, no external assets. Three.js r0.160 API.
import * as THREE from 'three';

// ─── Brand palette ──────────────────────────────────────────────────────────
const VOID_BG     = 0x0D0F12; // void-000
const MOSS_DARK   = 0x1F3A1A; // ground
const MOSS_DEEP   = 0x14271A; // ground vertex tint
const TRUNK_DARK  = 0x4a3020; // trunks (was 0x1a0f08 — too dark)
const CANOPY_A    = 0x2a5a2a; // darkest canopy (was 0x0a1a0a — too dark)
const CANOPY_B    = 0x3a6a3a; // mid canopy (was 0x1a2a1a — too dark)
const GROUND_COL  = 0x1a2a1a; // mossy ground
const TRUNK_GROUND = 0x3a3028; // ground-trunk blend
const FROG_BODY   = 0x2a4a1a; // frog
const EMBER_AMBER = 0xd4af37; // fire + amber light
const BIOLUM_CYAN = 0x00F3FF; // mushroom glow
const MOON_BLUE   = 0x6a8aff; // moonlight
const AMBIENT_COLD= 0x111122; // ambient
const STAR_WHITE  = 0xffffff;
const ROCK_GREY   = 0x2a2a26;
const MOSS_HANG   = 0x3a5a2a; // hanging moss on the special tree

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
    this.createForest();
    this.createPathLanterns();  // small warm glow markers along the path
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
    // Soft cold ambient — lets dark materials be faintly visible
    const ambient = new THREE.AmbientLight(0x3a4a5a, 1.6);
    this.scene.add(ambient);

    // Hemisphere — subtle sky/ground gradient, cool blue from above
    const hemi = new THREE.HemisphereLight(0x4a5a7a, 0x1a2a1a, 1.0);
    this.scene.add(hemi);

    // Moonlight directional, cool, low intensity — adds form without flattening
    const moon = new THREE.DirectionalLight(0x8aa0d0, 1.0);
    moon.position.set(-8, 14, 6);
    this.scene.add(moon);

    // Forward fill from camera position — illuminates the path ahead
    const pathFill = new THREE.PointLight(0x7a8a9a, 1.2, 35, 1.4);
    pathFill.position.set(0, 4, 18);  // just behind spawn
    this.scene.add(pathFill);
  }

  setupFog() {
    // Exponential fog in the void color — depth, mystery, hides horizon
    this.scene.fog = new THREE.FogExp2(0x0D0F12, 0.025);
  }

  // ─── Ground: large dark-moss disc with subtle vertex displacement ────────
  createGround() {
    const radius = 80;
    const segments = 64;
    const geometry = new THREE.CircleGeometry(radius, segments);
    geometry.rotateX(-Math.PI / 2);

    // Subtle organic vertex displacement (low-frequency, low-amplitude)
    const rng = mulberry32(0xA1B2C3D4);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Mix two sine fields + tiny noise for non-grid feel
      const h =
        Math.sin(x * 0.12) * 0.18 +
        Math.cos(z * 0.09) * 0.22 +
        Math.sin((x + z) * 0.05) * 0.15 +
        (rng() - 0.5) * 0.08;
      pos.setY(i, h);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    // Vertex-color tint: slightly darker near centre (campfire pit) and along
    // a vague "path" corridor (x in [-3, 3]). Sells the worn-trail feel.
    const colors = new Float32Array(pos.count * 3);
    const cBase = new THREE.Color(MOSS_DARK);
    const cDeep = new THREE.Color(MOSS_DEEP);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const onPath = Math.abs(x) < 3 ? 1 - Math.abs(x) / 3 : 0;
      tmp.copy(cBase).lerp(cDeep, 0.4 + onPath * 0.4);
      colors[i * 3 + 0] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true,
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.receiveShadow = true;
    ground.name = 'ground';
    this.scene.add(ground);

    // A handful of flat rock slabs scattered for visual interest (low poly)
    const rockGeom = new THREE.DodecahedronGeometry(0.6, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: ROCK_GREY,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true,
    });
    const rockRng = mulberry32(0xBEEF1234);
    for (let i = 0; i < 18; i++) {
      const r = 6 + rockRng() * 60;
      const theta = rockRng() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      // avoid the path corridor
      if (Math.abs(x) < 3.5 && z > -55 && z < 5) continue;
      const rock = new THREE.Mesh(rockGeom, rockMat);
      rock.position.set(x, 0.1, z);
      rock.rotation.set(rockRng() * Math.PI, rockRng() * Math.PI, rockRng() * Math.PI);
      const s = 0.5 + rockRng() * 1.4;
      rock.scale.set(s, s * 0.6, s);
      this.scene.add(rock);
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
      emissive: BIOLUM_CYAN,
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
    const glowA = new THREE.PointLight(BIOLUM_CYAN, 0.35, 4, 1.6);
    glowA.position.set(patches[3].x, 0.4, patches[3].z);
    this.scene.add(glowA);
    const glowB = new THREE.PointLight(BIOLUM_CYAN, 0.35, 4, 1.6);
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
