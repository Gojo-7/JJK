// ─── effects.js ───────────────────────────────────────────
// Pure particle-based domain expansion effects — no solid meshes

let threeScene, threeCamera, threeRenderer, currentEffect = null;
let animationId = null;

function initThree() {
  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  threeCamera.position.z = 5;

  threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeRenderer.setPixelRatio(window.devicePixelRatio);
  threeRenderer.domElement.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: -1; pointer-events: none;
  `;
  document.body.appendChild(threeRenderer.domElement);

  window.addEventListener('resize', () => {
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function clearScene() {
  cancelAnimationFrame(animationId);
  if (!threeScene) return;
  while (threeScene.children.length > 0) {
    const obj = threeScene.children[0];
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
    threeScene.remove(obj);
  }
  threeScene.fog = null;
  threeRenderer.setClearColor(0x000000, 0);
  currentEffect = null;
}

// ════════════════════════════════════════════════════════════
// 1. UNLIMITED VOID — Gojo
//    Black hole vortex: dense particles spiralling into a void
//    with white ink-splash bursts and blue-white accents
// ════════════════════════════════════════════════════════════
function triggerUnlimitedVoid() {
  clearScene();
  currentEffect = 'unlimited_void';
  threeRenderer.setClearColor(0x000008, 1);

  const N = 12000;
  const pos   = new Float32Array(N * 3);
  const col   = new Float32Array(N * 3);
  const meta  = new Float32Array(N * 4); // angle, radius, speed, layer

  for (let i = 0; i < N; i++) {
    const layer  = Math.floor(Math.random() * 3);       // 0=core vortex, 1=mid ring, 2=outer splash
    const angle  = Math.random() * Math.PI * 2;
    let   radius;
    if (layer === 0) radius = 0.05 + Math.random() * 1.2;
    else if (layer === 1) radius = 1.2 + Math.random() * 2.5;
    else radius = 3.0 + Math.random() * 4.0;

    const speed = (0.3 + Math.random() * 0.7) * (layer === 0 ? 3 : layer === 1 ? 1.5 : 0.5);
    meta[i * 4]     = angle;
    meta[i * 4 + 1] = radius;
    meta[i * 4 + 2] = speed;
    meta[i * 4 + 3] = layer;

    pos[i * 3]     = Math.cos(angle) * radius;
    pos[i * 3 + 1] = Math.sin(angle) * radius;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

    // Core = deep blue-black, mid = cyan-white, outer = white ink splash
    if (layer === 0) {
      col[i * 3] = 0.0; col[i * 3 + 1] = 0.05 + Math.random() * 0.2; col[i * 3 + 2] = 0.3 + Math.random() * 0.5;
    } else if (layer === 1) {
      const t = Math.random();
      col[i * 3] = t * 0.6; col[i * 3 + 1] = 0.7 + t * 0.3; col[i * 3 + 2] = 1.0;
    } else {
      const b = 0.7 + Math.random() * 0.3;
      col[i * 3] = b; col[i * 3 + 1] = b; col[i * 3 + 2] = b;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.9 });
  threeScene.add(new THREE.Points(geo, mat));

  // Black hole centre — dense dark ring particles
  const CN = 2000;
  const cpos = new Float32Array(CN * 3);
  const ccol = new Float32Array(CN * 3);
  for (let i = 0; i < CN; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.15 + Math.random() * 0.35;
    cpos[i * 3]     = Math.cos(a) * r;
    cpos[i * 3 + 1] = Math.sin(a) * r * 0.3; // squash into disc
    cpos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    ccol[i * 3] = 0.0; ccol[i * 3 + 1] = 0.3 + Math.random() * 0.4; ccol[i * 3 + 2] = 0.8 + Math.random() * 0.2;
  }
  const cgeo = new THREE.BufferGeometry();
  cgeo.setAttribute('position', new THREE.BufferAttribute(cpos, 3));
  cgeo.setAttribute('color',    new THREE.BufferAttribute(ccol, 3));
  threeScene.add(new THREE.Points(cgeo, new THREE.PointsMaterial({ size: 0.02, vertexColors: true, transparent: true, opacity: 0.8 })));

  let t = 0;
  function animate() {
    if (currentEffect !== 'unlimited_void') return;
    animationId = requestAnimationFrame(animate);
    t += 0.012;

    const p = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      const layer  = meta[i * 4 + 3];
      const speed  = meta[i * 4 + 2];
      meta[i * 4] += (0.008 * speed) * (layer === 0 ? 2.5 : 1);
      const ang = meta[i * 4];
      let   rad = meta[i * 4 + 1];

      // Spiral inward for core + mid
      if (layer < 2) {
        rad -= 0.001 * speed;
        if (rad < 0.05) {
          rad = layer === 0 ? 0.8 + Math.random() * 0.6 : 1.5 + Math.random() * 2;
          meta[i * 4] = Math.random() * Math.PI * 2;
        }
        meta[i * 4 + 1] = rad;
      }

      p[i * 3]     = Math.cos(ang) * rad;
      p[i * 3 + 1] = Math.sin(ang) * rad;
      p[i * 3 + 2] += Math.sin(t + i * 0.01) * 0.001;
    }
    geo.attributes.position.needsUpdate = true;

    // Slowly rotate accretion disc
    const cp = cgeo.attributes.position.array;
    for (let i = 0; i < CN; i++) {
      const a = Math.atan2(cp[i * 3 + 1] / 0.3, cp[i * 3]) + 0.025;
      const r = Math.sqrt(cp[i * 3] ** 2 + (cp[i * 3 + 1] / 0.3) ** 2);
      cp[i * 3]     = Math.cos(a) * r;
      cp[i * 3 + 1] = Math.sin(a) * r * 0.3;
    }
    cgeo.attributes.position.needsUpdate = true;

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

// ════════════════════════════════════════════════════════════
// 2. MALEVOLENT SHRINE — Sukuna
//    Red temple silhouette built from particles: curved rooftop
//    arcs, skull-pile base, demonic horns — all particles
// ════════════════════════════════════════════════════════════
function triggerMalevolentShrine() {
  clearScene();
  currentEffect = 'malevolent_shrine';
  threeRenderer.setClearColor(0x050000, 1);
  threeScene.fog = new THREE.FogExp2(0x0a0000, 0.06);

  const allPos = [];
  const allCol = [];

  function addParticles(xFn, yFn, zFn, count, r, g, b, scatter = 0.04) {
    for (let i = 0; i < count; i++) {
      const u = i / count;
      allPos.push(xFn(u) + (Math.random() - 0.5) * scatter,
                  yFn(u) + (Math.random() - 0.5) * scatter,
                  zFn(u) + (Math.random() - 0.5) * scatter * 2);
      const v = 0.7 + Math.random() * 0.3;
      allPos.push(xFn(u) + (Math.random() - 0.5) * scatter * 3,
                  yFn(u) + (Math.random() - 0.5) * scatter * 3,
                  zFn(u) + (Math.random() - 0.5) * scatter * 4);
      allCol.push(r * v, g * v, b * v, r * v * 0.5, g * v * 0.3, b * v * 0.3);
    }
  }

  // ── Curved roof arcs (pagoda layers) ──
  const roofLayers = [
    { y: 1.0, w: 2.2, curve: 0.5 },
    { y: 1.6, w: 1.5, curve: 0.4 },
    { y: 2.1, w: 1.0, curve: 0.3 },
    { y: 2.5, w: 0.6, curve: 0.2 },
  ];
  roofLayers.forEach(({ y, w, curve }) => {
    // Main beam
    addParticles(u => (u - 0.5) * w * 2, () => y, () => 0, 300, 1, 0.05, 0.02);
    // Left curve
    addParticles(
      u => -w + u * w * 0.6,
      u => y - curve * Math.pow(u, 2) * 4,
      () => 0, 200, 1, 0.05, 0.02
    );
    // Right curve
    addParticles(
      u => w - u * w * 0.6,
      u => y - curve * Math.pow(u, 2) * 4,
      () => 0, 200, 1, 0.05, 0.02
    );
    // Horn tips at ends
    addParticles(u => -w - u * 0.3, u => y + u * 0.4, () => 0, 80, 1, 0.1, 0.0);
    addParticles(u =>  w + u * 0.3, u => y + u * 0.4, () => 0, 80, 1, 0.1, 0.0);
  });

  // ── Vertical pillars ──
  [-1.8, -0.8, 0.8, 1.8].forEach(x => {
    addParticles(() => x, u => -0.5 + u * 1.6, () => 0, 200, 0.9, 0.04, 0.01, 0.02);
  });

  // ── Skull pile base (random blob clusters) ──
  for (let i = 0; i < 1200; i++) {
    const x = (Math.random() - 0.5) * 5;
    const y = -0.5 - Math.random() * 0.6 + Math.sin(x * 1.5) * 0.15;
    allPos.push(x, y, (Math.random() - 0.5) * 1.5);
    const v = 0.4 + Math.random() * 0.4;
    allCol.push(v * 0.8, v * 0.04, v * 0.01);
  }

  // ── Demonic horns at top ──
  addParticles(u => -0.15 - u * 0.3, u => 2.5 + u * 1.0, () => 0, 150, 1, 0.0, 0.0, 0.015);
  addParticles(u =>  0.15 + u * 0.3, u => 2.5 + u * 1.0, () => 0, 150, 1, 0.0, 0.0, 0.015);

  // ── Background atmosphere particles ──
  for (let i = 0; i < 3000; i++) {
    allPos.push((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, -2 - Math.random() * 6);
    const v = Math.random() * 0.3;
    allCol.push(v, 0, 0);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(allPos), 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(allCol), 3));
  const mat = new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.95 });
  threeScene.add(new THREE.Points(geo, mat));

  // ── Floating embers ──
  const EN = 2500;
  const epos = new Float32Array(EN * 3);
  const ecol = new Float32Array(EN * 3);
  const evel = new Float32Array(EN);
  for (let i = 0; i < EN; i++) {
    epos[i * 3]     = (Math.random() - 0.5) * 10;
    epos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    epos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    evel[i] = 0.005 + Math.random() * 0.015;
    const hot = Math.random();
    ecol[i * 3] = 1; ecol[i * 3 + 1] = hot * 0.4; ecol[i * 3 + 2] = 0;
  }
  const egeo = new THREE.BufferGeometry();
  egeo.setAttribute('position', new THREE.BufferAttribute(epos, 3));
  egeo.setAttribute('color',    new THREE.BufferAttribute(ecol, 3));
  threeScene.add(new THREE.Points(egeo, new THREE.PointsMaterial({ size: 0.025, vertexColors: true, transparent: true, opacity: 0.8 })));

  let t = 0;
  function animate() {
    if (currentEffect !== 'malevolent_shrine') return;
    animationId = requestAnimationFrame(animate);
    t += 0.016;

    // Embers drift up + sway
    const ep = egeo.attributes.position.array;
    for (let i = 0; i < EN; i++) {
      ep[i * 3 + 1] += evel[i];
      ep[i * 3]     += Math.sin(t * 0.8 + i * 0.3) * 0.002;
      if (ep[i * 3 + 1] > 5) ep[i * 3 + 1] = -4;
    }
    egeo.attributes.position.needsUpdate = true;

    // Temple particles breathe slightly
    const p = geo.attributes.position.array;
    // Just shimmer z slightly
    for (let i = 0; i < Math.min(allPos.length / 3, 500); i++) {
      p[i * 3 + 2] += Math.sin(t * 2 + i) * 0.0005;
    }
    geo.attributes.position.needsUpdate = true;

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

// ════════════════════════════════════════════════════════════
// 3. CHIMERA SHADOW GARDEN — Megumi
//    Sea of black/white shadow wings — constantly undulating
//    particle feathers sweeping in all directions
// ════════════════════════════════════════════════════════════
function triggerChimeraShadow() {
  clearScene();
  currentEffect = 'chimera_shadow';
  threeRenderer.setClearColor(0x000000, 1);

  const N = 15000;
  const pos  = new Float32Array(N * 3);
  const col  = new Float32Array(N * 3);
  const data = new Float32Array(N * 3); // phase, radius, arm

  for (let i = 0; i < N; i++) {
    const arm    = Math.floor(Math.random() * 8);  // 8 wing arms
    const t      = Math.random();
    const phase  = Math.random() * Math.PI * 2;
    const r      = 0.3 + t * 3.5;
    const baseAngle = (arm / 8) * Math.PI * 2;
    const sweep  = baseAngle + t * 0.9 + Math.sin(t * Math.PI) * 0.5;

    pos[i * 3]     = Math.cos(sweep) * r;
    pos[i * 3 + 1] = Math.sin(sweep) * r * 0.7;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
    data[i * 3]    = phase;
    data[i * 3 + 1] = r;
    data[i * 3 + 2] = arm;

    // Black-white-purple colour per wing edge distance
    const edge = t; // 0=base, 1=tip
    const brightness = 0.15 + edge * 0.7;
    const purpleTint = arm % 2 === 0 ? 0.3 : 0;
    col[i * 3]     = brightness * 0.8 + purpleTint * 0.3;
    col[i * 3 + 1] = brightness * 0.7;
    col[i * 3 + 2] = brightness + purpleTint * 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  threeScene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.9 })));

  // Central energy burst — bright purple-white core
  const CN = 3000;
  const cpos = new Float32Array(CN * 3);
  const ccol = new Float32Array(CN * 3);
  for (let i = 0; i < CN; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 2) * 0.8;
    cpos[i * 3]     = Math.cos(a) * r;
    cpos[i * 3 + 1] = Math.sin(a) * r;
    cpos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    const hot = 1 - r;
    ccol[i * 3] = hot * 0.9 + 0.4; ccol[i * 3 + 1] = hot * 0.6; ccol[i * 3 + 2] = 1.0;
  }
  const cgeo = new THREE.BufferGeometry();
  cgeo.setAttribute('position', new THREE.BufferAttribute(cpos, 3));
  cgeo.setAttribute('color',    new THREE.BufferAttribute(ccol, 3));
  threeScene.add(new THREE.Points(cgeo, new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.95 })));

  let globalT = 0;
  function animate() {
    if (currentEffect !== 'chimera_shadow') return;
    animationId = requestAnimationFrame(animate);
    globalT += 0.01;

    const p = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      const phase = data[i * 3];
      const r     = data[i * 3 + 1];
      const arm   = data[i * 3 + 2];
      const baseAngle = (arm / 8) * Math.PI * 2;
      // Wings undulate like feathers beating
      const wave = Math.sin(globalT * 1.5 + phase + r * 0.5) * 0.15;
      const sweep = baseAngle + (r / 3.5) * 0.9 + Math.sin((r / 3.5) * Math.PI) * 0.5 + wave;
      p[i * 3]     = Math.cos(sweep) * r;
      p[i * 3 + 1] = Math.sin(sweep) * r * 0.7 + Math.sin(globalT * 2 + phase) * 0.05;
      p[i * 3 + 2] += Math.sin(globalT + phase) * 0.001;
    }
    geo.attributes.position.needsUpdate = true;

    // Core pulse
    const cp = cgeo.attributes.position.array;
    const pulse = 1 + Math.sin(globalT * 4) * 0.15;
    for (let i = 0; i < CN; i++) {
      const a = Math.atan2(cp[i * 3 + 1], cp[i * 3]);
      const r = Math.sqrt(cp[i * 3] ** 2 + cp[i * 3 + 1] ** 2) * pulse;
      cp[i * 3]     = Math.cos(a + 0.02) * r;
      cp[i * 3 + 1] = Math.sin(a + 0.02) * r;
    }
    cgeo.attributes.position.needsUpdate = true;

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

// ════════════════════════════════════════════════════════════
// 4. TIME STRIKE — Prison Realm / Womb
//    Fleshy pink-red organic womb with a massive central eye:
//    iris ring particles, pupil void, pulsing veins
// ════════════════════════════════════════════════════════════
function triggerTimeStrike() {
  clearScene();
  currentEffect = 'time_strike';
  threeRenderer.setClearColor(0x080002, 1);
  threeScene.fog = new THREE.FogExp2(0x0a0003, 0.07);

  const allPos = [];
  const allCol = [];

  function flesh(r, g, b) {
    const v = 0.7 + Math.random() * 0.3;
    return [r * v, g * v, b * v];
  }

  // ── Womb walls — organic blob of particles ──
  for (let i = 0; i < 8000; i++) {
    // Superellipse-ish womb shape
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI;
    const rx = 4.5 + Math.sin(theta * 3) * 0.3 + Math.random() * 0.4;
    const ry = 3.2 + Math.cos(theta * 2) * 0.4 + Math.random() * 0.4;
    const rz = 1.5 + Math.random() * 0.5;
    const x = Math.cos(theta) * Math.sin(phi) * rx;
    const y = Math.sin(theta) * Math.sin(phi) * ry - 0.3;
    const z = Math.cos(phi) * rz;
    allPos.push(x, y, z);
    const [r, g, b] = flesh(0.55 + Math.random() * 0.2, 0.05 + Math.random() * 0.1, 0.08 + Math.random() * 0.05);
    allCol.push(r, g, b);
  }

  // ── Veins — curved particle trails across the womb ──
  for (let v = 0; v < 18; v++) {
    const startAngle = Math.random() * Math.PI * 2;
    const len = 80 + Math.floor(Math.random() * 60);
    let cx = Math.cos(startAngle) * 2, cy = Math.sin(startAngle) * 1.5;
    const dx = (Math.random() - 0.5) * 0.08, dy = (Math.random() - 0.5) * 0.06;
    for (let j = 0; j < len; j++) {
      cx += dx + Math.sin(j * 0.3) * 0.03;
      cy += dy + Math.cos(j * 0.2) * 0.02;
      allPos.push(cx, cy, 1.0 + Math.random() * 0.3);
      const bright = 0.6 + Math.random() * 0.3;
      allCol.push(bright * 0.7, 0.02, 0.04);
    }
  }

  // ── The eye — iris particles in concentric rings ──
  const irisRings = 12;
  for (let ring = 0; ring < irisRings; ring++) {
    const r      = 0.18 + ring * 0.1;
    const count  = Math.floor(40 + ring * 20);
    for (let j = 0; j < count; j++) {
      const a = (j / count) * Math.PI * 2;
      const jitter = 0.015;
      allPos.push(
        Math.cos(a) * r + (Math.random() - 0.5) * jitter,
        Math.sin(a) * r + (Math.random() - 0.5) * jitter,
        1.6 + Math.random() * 0.05
      );
      // Iris gradient: centre = orange-gold, outer = dark olive-brown
      const t = ring / irisRings;
      const cr = 0.9 - t * 0.5, cg = 0.55 - t * 0.45, cb = 0.0;
      allCol.push(cr, cg, cb);
    }
  }

  // ── Pupil — deep void of dark particles ──
  for (let i = 0; i < 500; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.16;
    allPos.push(Math.cos(a) * r, Math.sin(a) * r, 1.65);
    allCol.push(0.01, 0.0, 0.0);
  }

  // ── Eyelid particle arcs (top and bottom) ──
  for (let j = 0; j < 400; j++) {
    const t  = j / 400;
    const a  = (t - 0.5) * Math.PI * 1.1;
    const rx = Math.cos(a) * 1.35;
    // Top lid
    const ty = Math.sin(Math.abs(a)) * 0.5 + 0.55;
    allPos.push(rx + (Math.random() - 0.5) * 0.03, ty + (Math.random() - 0.5) * 0.03, 1.62);
    allCol.push(0.25, 0.02, 0.03);
    // Bottom lid
    const by = -(Math.sin(Math.abs(a)) * 0.35 + 0.45);
    allPos.push(rx + (Math.random() - 0.5) * 0.03, by + (Math.random() - 0.5) * 0.03, 1.62);
    allCol.push(0.25, 0.02, 0.03);
  }

  // ── Sclera (white of eye) ──
  for (let i = 0; i < 1200; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.16 + Math.random() * 1.1;
    if (r > 1.28) continue; // clip to eye shape
    allPos.push(Math.cos(a) * r * 1.35, Math.sin(a) * r * 0.9, 1.55);
    const w = 0.85 + Math.random() * 0.15;
    allCol.push(w, w * 0.88, w * 0.85); // slightly bloodshot white
  }

  // ── Blood vessels across sclera ──
  for (let v = 0; v < 12; v++) {
    const startA = Math.random() * Math.PI * 2;
    const len = 30 + Math.floor(Math.random() * 30);
    let bx = Math.cos(startA) * 0.8, by = Math.sin(startA) * 0.6;
    for (let j = 0; j < len; j++) {
      bx += (Math.cos(startA) * -0.03) + (Math.random() - 0.5) * 0.02;
      by += (Math.sin(startA) * -0.03) + (Math.random() - 0.5) * 0.02;
      allPos.push(bx, by, 1.58);
      allCol.push(0.7 + Math.random() * 0.3, 0.0, 0.0);
    }
  }

  // ── Background fleshy atmosphere ──
  for (let i = 0; i < 2000; i++) {
    allPos.push((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, -1 - Math.random() * 3);
    allCol.push(0.2 + Math.random() * 0.2, 0.01, 0.02);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(allPos), 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(allCol), 3));
  threeScene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.028, vertexColors: true, transparent: true, opacity: 0.95 })));

  let t = 0;
  const basePos = new Float32Array(allPos);
  function animate() {
    if (currentEffect !== 'time_strike') return;
    animationId = requestAnimationFrame(animate);
    t += 0.012;

    const p = geo.attributes.position.array;
    const total = p.length / 3;

    for (let i = 0; i < total; i++) {
      const bx = basePos[i * 3], by = basePos[i * 3 + 1], bz = basePos[i * 3 + 2];
      const dist = Math.sqrt(bx * bx + by * by);

      // Womb wall breathes (pulse outward)
      if (bz < 1.0) {
        const pulse = 1 + Math.sin(t * 1.2 + dist * 0.5) * 0.025;
        p[i * 3]     = bx * pulse;
        p[i * 3 + 1] = by * pulse;
        p[i * 3 + 2] = bz + Math.sin(t * 0.8 + i * 0.01) * 0.03;
      }
      // Iris slowly rotates
      if (bz > 1.55 && bz < 1.65 && dist > 0.15 && dist < 1.35) {
        const a   = Math.atan2(by, bx) + 0.004;
        const r   = dist;
        p[i * 3]     = Math.cos(a) * r;
        p[i * 3 + 1] = Math.sin(a) * r;
      }
      // Pupil dilate
      if (bz >= 1.65 && dist < 0.18) {
        const dilate = 1 + Math.sin(t * 2) * 0.08;
        p[i * 3]     = bx * dilate;
        p[i * 3 + 1] = by * dilate;
      }
    }
    geo.attributes.position.needsUpdate = true;

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

// ════════════════════════════════════════════════════════════
// Public API
// ════════════════════════════════════════════════════════════
function triggerDomainExpansion(gestureName) {
  switch (gestureName) {
    case 'malevolent_shrine': triggerMalevolentShrine(); break;
    case 'unlimited_void':    triggerUnlimitedVoid();    break;
    case 'chimera_shadow':    triggerChimeraShadow();    break;
    case 'time_strike':       triggerTimeStrike();       break;
  }
}

function dismissEffect() {
  clearScene();
}

document.addEventListener('DOMContentLoaded', initThree);