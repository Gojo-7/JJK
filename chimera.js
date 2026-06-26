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