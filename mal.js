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
