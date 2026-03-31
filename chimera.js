// ─── chimera.js — CHIMERA SHADOW GARDEN (Megumi) ─────────
// Sea of black/white shadow wings — constantly undulating
// particle feathers sweeping in all directions

function triggerChimeraShadow() {
  clearScene();
  currentEffect = 'chimera_shadow';
  threeRenderer.setClearColor(0x000000, 1);

  const N = 15000;
  const pos  = new Float32Array(N * 3);
  const col  = new Float32Array(N * 3);
  const data = new Float32Array(N * 3); // phase, radius, arm

  for (let i = 0; i < N; i++) {
    const arm   = Math.floor(Math.random() * 8);
    const t     = Math.random();
    const phase = Math.random() * Math.PI * 2;
    const r     = 0.3 + t * 3.5;
    const baseAngle = (arm / 8) * Math.PI * 2;
    const sweep = baseAngle + t * 0.9 + Math.sin(t * Math.PI) * 0.5;

    pos[i * 3]     = Math.cos(sweep) * r;
    pos[i * 3 + 1] = Math.sin(sweep) * r * 0.7;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
    data[i * 3]     = phase;
    data[i * 3 + 1] = r;
    data[i * 3 + 2] = arm;

    const edge = t;
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
      const wave  = Math.sin(globalT * 1.5 + phase + r * 0.5) * 0.15;
      const sweep = baseAngle + (r / 3.5) * 0.9 + Math.sin((r / 3.5) * Math.PI) * 0.5 + wave;
      p[i * 3]     = Math.cos(sweep) * r;
      p[i * 3 + 1] = Math.sin(sweep) * r * 0.7 + Math.sin(globalT * 2 + phase) * 0.05;
      p[i * 3 + 2] += Math.sin(globalT + phase) * 0.001;
    }
    geo.attributes.position.needsUpdate = true;

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