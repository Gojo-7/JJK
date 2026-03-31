// ─── void.js — UNLIMITED VOID (Gojo) ─────────────────────
// Black hole vortex: dense particles spiralling into a void
// with white ink-splash bursts and blue-white accents

function triggerUnlimitedVoid() {
  clearScene();
  currentEffect = 'unlimited_void';
  threeRenderer.setClearColor(0x000008, 1);

  const N = 12000;
  const pos   = new Float32Array(N * 3);
  const col   = new Float32Array(N * 3);
  const meta  = new Float32Array(N * 4); // angle, radius, speed, layer

  for (let i = 0; i < N; i++) {
    const layer  = Math.floor(Math.random() * 3); // 0=core vortex, 1=mid ring, 2=outer splash
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

  // Black hole centre — dense accretion disc
  const CN = 2000;
  const cpos = new Float32Array(CN * 3);
  const ccol = new Float32Array(CN * 3);
  for (let i = 0; i < CN; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.15 + Math.random() * 0.35;
    cpos[i * 3]     = Math.cos(a) * r;
    cpos[i * 3 + 1] = Math.sin(a) * r * 0.3;
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
      const layer = meta[i * 4 + 3];
      const speed = meta[i * 4 + 2];
      meta[i * 4] += (0.008 * speed) * (layer === 0 ? 2.5 : 1);
      const ang = meta[i * 4];
      let rad = meta[i * 4 + 1];

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