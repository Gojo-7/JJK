// ─── time.js — PRISON REALM / TIME STRIKE (Nanami) ──────
// Fleshy pink-red organic womb with a massive central eye:
// iris ring particles, pupil void, pulsing veins

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

  // ── Womb walls ──
  for (let i = 0; i < 8000; i++) {
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

  // ── Veins ──
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

  // ── Iris rings ──
  const irisRings = 12;
  for (let ring = 0; ring < irisRings; ring++) {
    const r     = 0.18 + ring * 0.1;
    const count = Math.floor(40 + ring * 20);
    for (let j = 0; j < count; j++) {
      const a = (j / count) * Math.PI * 2;
      allPos.push(
        Math.cos(a) * r + (Math.random() - 0.5) * 0.015,
        Math.sin(a) * r + (Math.random() - 0.5) * 0.015,
        1.6 + Math.random() * 0.05
      );
      const t = ring / irisRings;
      allCol.push(0.9 - t * 0.5, 0.55 - t * 0.45, 0.0);
    }
  }

  // ── Pupil void ──
  for (let i = 0; i < 500; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.16;
    allPos.push(Math.cos(a) * r, Math.sin(a) * r, 1.65);
    allCol.push(0.01, 0.0, 0.0);
  }

  // ── Eyelids ──
  for (let j = 0; j < 400; j++) {
    const t  = j / 400;
    const a  = (t - 0.5) * Math.PI * 1.1;
    const rx = Math.cos(a) * 1.35;
    const ty = Math.sin(Math.abs(a)) * 0.5 + 0.55;
    allPos.push(rx + (Math.random() - 0.5) * 0.03, ty + (Math.random() - 0.5) * 0.03, 1.62);
    allCol.push(0.25, 0.02, 0.03);
    const by = -(Math.sin(Math.abs(a)) * 0.35 + 0.45);
    allPos.push(rx + (Math.random() - 0.5) * 0.03, by + (Math.random() - 0.5) * 0.03, 1.62);
    allCol.push(0.25, 0.02, 0.03);
  }

  // ── Sclera ──
  for (let i = 0; i < 1200; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.16 + Math.random() * 1.1;
    if (r > 1.28) continue;
    allPos.push(Math.cos(a) * r * 1.35, Math.sin(a) * r * 0.9, 1.55);
    const w = 0.85 + Math.random() * 0.15;
    allCol.push(w, w * 0.88, w * 0.85);
  }

  // ── Blood vessels ──
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

      if (bz < 1.0) {
        const pulse = 1 + Math.sin(t * 1.2 + dist * 0.5) * 0.025;
        p[i * 3]     = bx * pulse;
        p[i * 3 + 1] = by * pulse;
        p[i * 3 + 2] = bz + Math.sin(t * 0.8 + i * 0.01) * 0.03;
      }
      if (bz > 1.55 && bz < 1.65 && dist > 0.15 && dist < 1.35) {
        const a = Math.atan2(by, bx) + 0.004;
        p[i * 3]     = Math.cos(a) * dist;
        p[i * 3 + 1] = Math.sin(a) * dist;
      }
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