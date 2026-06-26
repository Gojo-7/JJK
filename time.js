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
