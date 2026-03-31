// ─── mal.js — MALEVOLENT SHRINE (Sukuna) ─────────────────
// Red temple silhouette built from particles: curved rooftop
// arcs, skull-pile base, demonic horns — all particles

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
      allPos.push(
        xFn(u) + (Math.random() - 0.5) * scatter,
        yFn(u) + (Math.random() - 0.5) * scatter,
        zFn(u) + (Math.random() - 0.5) * scatter * 2
      );
      const v = 0.7 + Math.random() * 0.3;
      allPos.push(
        xFn(u) + (Math.random() - 0.5) * scatter * 3,
        yFn(u) + (Math.random() - 0.5) * scatter * 3,
        zFn(u) + (Math.random() - 0.5) * scatter * 4
      );
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
    addParticles(u => (u - 0.5) * w * 2, () => y, () => 0, 300, 1, 0.05, 0.02);
    addParticles(u => -w + u * w * 0.6, u => y - curve * Math.pow(u, 2) * 4, () => 0, 200, 1, 0.05, 0.02);
    addParticles(u =>  w - u * w * 0.6, u => y - curve * Math.pow(u, 2) * 4, () => 0, 200, 1, 0.05, 0.02);
    addParticles(u => -w - u * 0.3, u => y + u * 0.4, () => 0, 80, 1, 0.1, 0.0);
    addParticles(u =>  w + u * 0.3, u => y + u * 0.4, () => 0, 80, 1, 0.1, 0.0);
  });

  // ── Vertical pillars ──
  [-1.8, -0.8, 0.8, 1.8].forEach(x => {
    addParticles(() => x, u => -0.5 + u * 1.6, () => 0, 200, 0.9, 0.04, 0.01, 0.02);
  });

  // ── Skull pile base ──
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

  // ── Background atmosphere ──
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

    const ep = egeo.attributes.position.array;
    for (let i = 0; i < EN; i++) {
      ep[i * 3 + 1] += evel[i];
      ep[i * 3]     += Math.sin(t * 0.8 + i * 0.3) * 0.002;
      if (ep[i * 3 + 1] > 5) ep[i * 3 + 1] = -4;
    }
    egeo.attributes.position.needsUpdate = true;

    const p = geo.attributes.position.array;
    for (let i = 0; i < Math.min(allPos.length / 3, 500); i++) {
      p[i * 3 + 2] += Math.sin(t * 2 + i) * 0.0005;
    }
    geo.attributes.position.needsUpdate = true;

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}