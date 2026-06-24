// ── effects.js ───────────────────────────────────────────
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
// 1. MALEVOLENT SHRINE — Sukuna (Advanced 3D)
//    Full environment with portal, floating teeth, and water
// ════════════════════════════════════════════════════════════
function triggerMalevolentShrine() {
  clearScene();
  currentEffect = 'malevolent_shrine';

  // Update renderer/scene for the new complex style
  threeRenderer.setClearColor(0x000000, 1);
  threeScene.fog = new THREE.FogExp2(0x220000, 0.025);

  // ── Environment: Sky, Water (Optimized) ──
  const skyGeo = new THREE.SphereGeometry(300, 32, 32);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec3 vPos; void main(){ vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform float time; varying vec3 vPos; void main(){ vec2 uv=normalize(vPos).xy; float a=atan(uv.y,uv.x); float r=length(uv); float swirl=sin(a*18.0-r*20.0+time*3.0); vec3 col=mix(vec3(0.08,0.0,0.0), vec3(1.0,0.0,0.0), swirl*0.5+0.5); gl_FragColor=vec4(col,1.0); }`
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  threeScene.add(sky);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x440000 })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -5;
  threeScene.add(water);

  // ── Shrine Structure ──
  const shrine = new THREE.Group();
  const shrineRed = new THREE.MeshBasicMaterial({ color: 0xaa0000 });
  const roofMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

  // Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 7), shrineRed);
  base.position.y = -2;
  shrine.add(base);

  // Pillars
  [-3.5, -1.2, 1.2, 3.5].forEach(x => {
    [2.4, -2.4].forEach(z => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6, 0.6), shrineRed);
      pillar.position.set(x, 1, z);
      shrine.add(pillar);
    });
  });

  // Beams
  [-2.4, 2.4].forEach(z => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.5, 0.5), shrineRed);
    beam.position.set(0, 3.7, z);
    shrine.add(beam);
  });

  // Roof Tiers
  const createRoof = (scale, y) => {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.BoxGeometry(12, 0.7, 8), roofMat));
    const horn = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.15, 16, 32, Math.PI), roofMat);
    horn.rotation.set(0, 0, Math.PI / 2);
    horn.position.set(-6, 0.6, 0);
    group.add(horn);
    const h2 = horn.clone();
    h2.position.x = 6;
    group.add(h2);
    group.scale.setScalar(scale);
    group.position.y = y;
    return group;
  };
  shrine.add(createRoof(1, 5));
  shrine.add(createRoof(0.65, 8.3));

  // Spikes & Skulls
  for (let i = 0; i < 5; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2, 12), roofMat);
    spike.position.set((i - 2) * 0.9, 10.3, 0);
    shrine.add(spike);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xdddddd }));
    skull.position.set(-2 + i, 6.5, 2.2);
    shrine.add(skull);
  }

  // Demon Mouth Gate
  const mouthGroup = new THREE.Group();
  mouthGroup.add(new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.45, 24, 64), shrineRed).rotateX(Math.PI / 2));
  mouthGroup.add(new THREE.Mesh(new THREE.CircleGeometry(2.15, 64), new THREE.MeshBasicMaterial({ color: 0x000022 })).rotateX(Math.PI / 2).position.set(0, 0, 0.15));

  for (let i = 0; i < 14; i++) {
    const toothT = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    toothT.rotation.z = Math.PI;
    toothT.position.set(-1.8 + i * 0.28, 1.1, 0.2);
    mouthGroup.add(toothT);
    const toothB = toothT.clone();
    toothB.rotation.z = 0;
    toothB.position.set(-1.8 + i * 0.28, -1.1, 0.2);
    mouthGroup.add(toothB);
  }

  [-1, 1].forEach(s => {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.5, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    fang.rotation.z = s > 0 ? Math.PI / 2 : -Math.PI / 2;
    fang.position.set(s * 2.7, 0, 0.2);
    mouthGroup.add(fang);
  });

  mouthGroup.position.y = 0.5;
  shrine.add(mouthGroup);
  threeScene.add(shrine);

  // ── Lights ──
  threeScene.add(new THREE.AmbientLight(0xff0000, 1.5));
  const light = new THREE.PointLight(0xff0000, 80, 100);
  light.position.set(0, 8, 5);
  threeScene.add(light);

  let t = 0;
  function animate() {
    if (currentEffect !== 'malevolent_shrine') return;
    animationId = requestAnimationFrame(animate);
    t += 0.01;
    skyMat.uniforms.time.value = t;

    // Gentle mouth movement
    mouthGroup.rotation.z += 0.02;
    mouthGroup.scale.setScalar(1 + Math.sin(t * 4) * 0.05);

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

// ════════════════════════════════════════════════════════════
// 2. UNLIMITED VOID — Canvas/2D Version
//    Cosmic void, black hole, ink splashes, cyan accretion
// ════════════════════════════════════════════════════════════
function triggerUnlimitedVoid() {
  clearScene();
  currentEffect = 'unlimited_void';

  // Use a 2D canvas for the ink effect
  const canvas = document.createElement('canvas');
  canvas.id = 'unlimited-void-canvas';
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: -1;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const particles = [];
  const blackBlobs = [];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      const angle = Math.random() * Math.PI * 2;
      const radius = 200 + Math.random() * 200;
      this.x = centerX + Math.cos(angle) * radius;
      this.y = centerY + Math.sin(angle) * radius;
      this.size = Math.random() * 3 + 1;
      this.speed = Math.random() * 2 + 1;
      this.alpha = Math.random();
    }
    update() {
      const dx = centerX - this.x;
      const dy = centerY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = 1000 / (dist * dist + 100);
      this.x += (dx / dist) * force * this.speed;
      this.y += (dy / dist) * force * this.speed;
      if (dist < 50) this.reset();
    }
    draw() {
      ctx.fillStyle = `rgba(200, 255, 255, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class InkBlob {
    constructor() {
      this.angle = Math.random() * Math.PI * 2;
      this.radius = 120 + Math.random() * 60;
      this.size = 10 + Math.random() * 15;
      this.speed = 0.002 + Math.random() * 0.003;
    }
    update() { this.angle += this.speed; }
    draw() {
      const x = centerX + Math.cos(this.angle) * this.radius;
      const y = centerY + Math.sin(this.angle) * this.radius;
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Increased particle count and animation speed
  for (let i = 0; i < 1000; i++) particles.push(new Particle());
  // ... removed blackBlobs ...

  // Pre-create disk gradients for performance
  const diskGradients = [];
  for (let i = 0; i < 7; i++) {
    const radius = 120 + i * 28;
    const g = ctx.createRadialGradient(0, 0, radius - 30, 0, 0, radius + 35);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.35, "rgba(180,220,255,0.12)");
    g.addColorStop(0.55, "rgba(200,240,255,0.95)");
    g.addColorStop(0.8, "rgba(150,210,255,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    diskGradients.push({ g, radius, width: 18 + i * 2 });
  }

  function drawDisk(rotation) {
    for (let i = 0; i < diskGradients.length; i++) {
      const { g, radius, width } = diskGradients[i];
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation * (1 + i * 0.15));
      ctx.strokeStyle = g;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.92, Math.sin(rotation + i) * 0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawBlackHole() {
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 350);
    glow.addColorStop(0, "rgba(0,0,0,1)");
    glow.addColorStop(0.18, "rgba(0,0,0,1)");
    glow.addColorStop(0.24, "rgba(120,180,255,0.95)");
    glow.addColorStop(0.4, "rgba(90,140,255,0.25)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(centerX, centerY, 350, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(centerX, centerY, 85, 0, Math.PI * 2); ctx.fill();
  }

  let rot = 0;
  function animate() {
    if (currentEffect !== 'unlimited_void') return;
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0, 4, 10, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawDisk(rot);
    for (const p of particles) { p.update(); p.draw(); }
    drawBlackHole();
    rot += 0.03;
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
  // Remove 2D canvas if it exists
  const vCanvas = document.getElementById('unlimited-void-canvas');
  if (vCanvas) vCanvas.remove();
  threeRenderer.setClearColor(0x000000, 0);
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', initThree);
