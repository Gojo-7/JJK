// ─── effects.js ───────────────────────────────────────────
// Three.js domain expansion scenes for each JJK gesture
// Variables prefixed with "three" to avoid conflicts with MediaPipe

let threeScene, threeCamera, threeRenderer, currentEffect = null;
let animationId = null;

// ── Bootstrap Three.js ──────────────────────────────────────
function initThree() {
  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

// ── Clear current scene ──────────────────────────────────────
function clearScene() {
  cancelAnimationFrame(animationId);
  while (threeScene.children.length > 0) {
    const obj = threeScene.children[0];
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
    threeScene.remove(obj);
  }
  threeRenderer.setClearColor(0x000000, 0);
  currentEffect = null;
}

// ════════════════════════════════════════════════════════════
// 1. MALEVOLENT SHRINE — Sukuna
//    Red/black storming particles + bone spike pillars rising
// ════════════════════════════════════════════════════════════
function triggerMalevolentShrine() {
  clearScene();
  currentEffect = 'malevolent_shrine';
  threeRenderer.setClearColor(0x0a0000, 1);

  threeScene.fog = new THREE.FogExp2(0x1a0000, 0.08);

  // ── Particle storm ──
  const particleCount = 4000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    const r = 0.7 + Math.random() * 0.3;
    const g = Math.random() * 0.1;
    colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = 0;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.85 });
  const particles = new THREE.Points(pGeo, pMat);
  threeScene.add(particles);

  // ── Bone spikes ──
  const spikes = [];
  for (let i = 0; i < 12; i++) {
    const h = 1.5 + Math.random() * 4;
    const geo = new THREE.ConeGeometry(0.08 + Math.random() * 0.12, h, 5);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xd4c4a8,
      emissive: 0x3a2a1a,
      shininess: 80
    });
    const spike = new THREE.Mesh(geo, mat);
    spike.position.x = (Math.random() - 0.5) * 14;
    spike.position.y = -8;
    spike.position.z = -2 + Math.random() * 4;
    spike.rotation.z = (Math.random() - 0.5) * 0.3;
    spike._targetY = -2 + Math.random() * 2;
    spike._speed = 0.04 + Math.random() * 0.04;
    spikes.push(spike);
    threeScene.add(spike);
  }

  // ── Lighting ──
  const redLight = new THREE.PointLight(0xff2200, 3, 20);
  redLight.position.set(0, 3, 3);
  threeScene.add(redLight);
  threeScene.add(new THREE.AmbientLight(0x220000, 1));

  // ── Cursed energy rings ──
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const rGeo = new THREE.TorusGeometry(1.5 + i * 1.2, 0.02, 8, 80);
    const rMat = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.6 - i * 0.15 });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = Math.PI / 2;
    ring._phase = i * Math.PI * 0.66;
    rings.push(ring);
    threeScene.add(ring);
  }

  let t = 0;
  function animate() {
    if (currentEffect !== 'malevolent_shrine') return;
    animationId = requestAnimationFrame(animate);
    t += 0.016;

    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] -= 0.03 + Math.random() * 0.01;
      pos[i * 3]     += Math.sin(t + i * 0.1) * 0.005;
      if (pos[i * 3 + 1] < -10) pos[i * 3 + 1] = 10;
    }
    pGeo.attributes.position.needsUpdate = true;

    spikes.forEach(s => {
      if (s.position.y < s._targetY) s.position.y += s._speed;
    });

    redLight.intensity = 2.5 + Math.sin(t * 3) * 1.5;

    rings.forEach((r, i) => {
      r.rotation.z = t * (0.3 + i * 0.1);
      r.scale.setScalar(1 + Math.sin(t * 2 + r._phase) * 0.05);
    });

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

// ════════════════════════════════════════════════════════════
// 2. UNLIMITED VOID — Gojo
//    Deep space starfield + infinite blue/purple portal rings
// ════════════════════════════════════════════════════════════
function triggerUnlimitedVoid() {
  clearScene();
  currentEffect = 'unlimited_void';
  threeRenderer.setClearColor(0x000510, 1);

  // ── Star field ──
  const starCount = 6000;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3]     = (Math.random() - 0.5) * 100;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 100;
    starPos[i * 3 + 2] = -5 - Math.random() * 80;
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const sMat = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0.9 });
  threeScene.add(new THREE.Points(sGeo, sMat));

  // ── Infinity portal rings ──
  const rings = [];
  for (let i = 0; i < 18; i++) {
    const radius = 0.3 + i * 0.45;
    const geo = new THREE.TorusGeometry(radius, 0.012, 8, 100);
    const hue = 0.55 + i * 0.015;
    const color = new THREE.Color().setHSL(hue, 1, 0.6);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: Math.max(0.1, 0.85 - i * 0.04) });
    const ring = new THREE.Mesh(geo, mat);
    ring._index = i;
    rings.push(ring);
    threeScene.add(ring);
  }

  // ── Central glow ──
  const glowGeo = new THREE.SphereGeometry(0.15, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.9 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  threeScene.add(glow);

  threeScene.add(new THREE.AmbientLight(0x001133, 2));
  const blueLight = new THREE.PointLight(0x4499ff, 4, 15);
  blueLight.position.set(0, 0, 2);
  threeScene.add(blueLight);

  let t = 0;
  function animate() {
    if (currentEffect !== 'unlimited_void') return;
    animationId = requestAnimationFrame(animate);
    t += 0.012;

    rings.forEach((r, i) => {
      r.rotation.x = t * (0.1 + i * 0.008);
      r.rotation.y = t * (0.08 + i * 0.006);
      r.rotation.z = t * 0.05;
      const scale = 1 + Math.sin(t * 1.5 + i * 0.3) * 0.03;
      r.scale.setScalar(scale);
    });

    const sp = sGeo.attributes.position.array;
    for (let i = 0; i < starCount; i++) {
      sp[i * 3 + 2] += 0.06;
      if (sp[i * 3 + 2] > 5) sp[i * 3 + 2] = -80;
    }
    sGeo.attributes.position.needsUpdate = true;

    glow.scale.setScalar(1 + Math.sin(t * 4) * 0.2);
    blueLight.intensity = 3 + Math.sin(t * 2) * 1.5;

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

// ════════════════════════════════════════════════════════════
// 3. CHIMERA SHADOW GARDEN — Megumi
//    Black tendrils rising + dark green shadow wisps
// ════════════════════════════════════════════════════════════
function triggerChimeraShadow() {
  clearScene();
  currentEffect = 'chimera_shadow';
  threeRenderer.setClearColor(0x000a05, 1);
  threeScene.fog = new THREE.FogExp2(0x000a05, 0.12);

  // ── Shadow particle wisps ──
  const wispCount = 3000;
  const wPos = new Float32Array(wispCount * 3);
  const wCol = new Float32Array(wispCount * 3);
  for (let i = 0; i < wispCount; i++) {
    wPos[i * 3]     = (Math.random() - 0.5) * 20;
    wPos[i * 3 + 1] = -5 + Math.random() * 12;
    wPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    wCol[i * 3]     = 0;
    wCol[i * 3 + 1] = 0.3 + Math.random() * 0.4;
    wCol[i * 3 + 2] = 0.1 + Math.random() * 0.2;
  }
  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
  wGeo.setAttribute('color', new THREE.BufferAttribute(wCol, 3));
  const wMat = new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.75 });
  threeScene.add(new THREE.Points(wGeo, wMat));

  // ── Dark tendrils ──
  const tendrils = [];
  for (let i = 0; i < 20; i++) {
    const h = 2 + Math.random() * 5;
    const geo = new THREE.ConeGeometry(0.03 + Math.random() * 0.05, h, 4);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x001a0a,
      emissive: 0x00ff44,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.7
    });
    const td = new THREE.Mesh(geo, mat);
    td.position.x = (Math.random() - 0.5) * 16;
    td.position.y = -8;
    td.position.z = -3 + Math.random() * 6;
    td.rotation.z = (Math.random() - 0.5) * 0.6;
    td._targetY = -1.5 + Math.random() * 3;
    td._speed = 0.025 + Math.random() * 0.03;
    td._wobble = Math.random() * Math.PI * 2;
    tendrils.push(td);
    threeScene.add(td);
  }

  // ── Pentagram shadow floor ──
  const penGeo = new THREE.TorusGeometry(2.5, 0.03, 4, 5);
  const penMat = new THREE.MeshBasicMaterial({ color: 0x00cc44, transparent: true, opacity: 0.25 });
  const pentagram = new THREE.Mesh(penGeo, penMat);
  pentagram.rotation.x = Math.PI / 2;
  pentagram.position.y = -2.5;
  threeScene.add(pentagram);

  threeScene.add(new THREE.AmbientLight(0x001a0a, 2));
  const shadowLight = new THREE.PointLight(0x00ff44, 2, 12);
  shadowLight.position.set(0, 0, 3);
  threeScene.add(shadowLight);

  let time = 0;
  function animate() {
    if (currentEffect !== 'chimera_shadow') return;
    animationId = requestAnimationFrame(animate);
    time += 0.014;

    const wp = wGeo.attributes.position.array;
    for (let i = 0; i < wispCount; i++) {
      wp[i * 3 + 1] += 0.015 + Math.random() * 0.01;
      wp[i * 3]     += Math.sin(time + i) * 0.003;
      if (wp[i * 3 + 1] > 8) wp[i * 3 + 1] = -5;
    }
    wGeo.attributes.position.needsUpdate = true;

    tendrils.forEach(td => {
      if (td.position.y < td._targetY) td.position.y += td._speed;
      td.rotation.z = Math.sin(time * 0.8 + td._wobble) * 0.08;
    });

    pentagram.rotation.z = time * 0.15;
    shadowLight.intensity = 1.5 + Math.sin(time * 2.5) * 1;

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

// ════════════════════════════════════════════════════════════
// 4. TIME STRIKE — Nanami
//    Golden ratio grid lines + clock-hand slashes
// ════════════════════════════════════════════════════════════
function triggerTimeStrike() {
  clearScene();
  currentEffect = 'time_strike';
  threeRenderer.setClearColor(0x0a0800, 1);

  // ── Grid of ratio lines ──
  const lineMat = new THREE.LineBasicMaterial({ color: 0xd4a800, transparent: true, opacity: 0.35 });
  for (let i = -8; i <= 8; i++) {
    const vGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i * 0.9, -6, 0),
      new THREE.Vector3(i * 0.9, 6, 0)
    ]);
    threeScene.add(new THREE.Line(vGeo, lineMat));

    const hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-8, i * 0.7, 0),
      new THREE.Vector3(8, i * 0.7, 0)
    ]);
    threeScene.add(new THREE.Line(hGeo, lineMat));
  }

  // ── 7:3 ratio divider ──
  const ratioDivMat = new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.8 });
  const ratioLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-10, 0, 0.1),
      new THREE.Vector3(10, 0, 0.1)
    ]),
    ratioDivMat
  );
  threeScene.add(ratioLine);

  // ── Slash marks ──
  const slashes = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const len = 3 + Math.random() * 2;
    const slashMat = new THREE.LineBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0 });
    const slashGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(Math.cos(angle) * len, Math.sin(angle) * len, 0.2),
      new THREE.Vector3(Math.cos(angle + 0.3) * (len * 0.2), Math.sin(angle + 0.3) * (len * 0.2), 0.2)
    ]);
    const slash = new THREE.Line(slashGeo, slashMat);
    slash._delay = i * 0.4;
    slash._mat = slashMat;
    slashes.push(slash);
    threeScene.add(slash);
  }

  // ── Gold particles ──
  const gCount = 2000;
  const gPos = new Float32Array(gCount * 3);
  for (let i = 0; i < gCount; i++) {
    gPos[i * 3]     = (Math.random() - 0.5) * 20;
    gPos[i * 3 + 1] = (Math.random() - 0.5) * 15;
    gPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  const gMat = new THREE.PointsMaterial({ size: 0.04, color: 0xffaa00, transparent: true, opacity: 0.6 });
  threeScene.add(new THREE.Points(gGeo, gMat));

  threeScene.add(new THREE.AmbientLight(0x1a1000, 2));
  const goldLight = new THREE.PointLight(0xffaa00, 3, 15);
  goldLight.position.set(0, 0, 3);
  threeScene.add(goldLight);

  let time = 0;
  function animate() {
    if (currentEffect !== 'time_strike') return;
    animationId = requestAnimationFrame(animate);
    time += 0.016;

    slashes.forEach(s => {
      const age = time - s._delay;
      if (age > 0) s._mat.opacity = Math.max(0, 0.9 - age * 0.4);
    });

    ratioLine.scale.x = 1 + Math.sin(time * 1.5) * 0.02;

    const gp = gGeo.attributes.position.array;
    for (let i = 0; i < gCount; i++) {
      gp[i * 3 + 1] += 0.008;
      if (gp[i * 3 + 1] > 8) gp[i * 3 + 1] = -8;
    }
    gGeo.attributes.position.needsUpdate = true;

    goldLight.intensity = 2.5 + Math.sin(time * 3) * 1;

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

// ════════════════════════════════════════════════════════════
// Public API — called from index.html
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
  threeRenderer.setClearColor(0x000000, 0);
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', initThree);