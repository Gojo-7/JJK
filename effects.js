// ─── effects.js — SHARED ENGINE ───────────────────────────
// Initialises Three.js and provides clearScene().
// The 4 domain files (void.js, mal.js, chimera.js, time.js)
// each define their own trigger function and read these globals.

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

// ── Router — called from index.html ───────────────────────
function triggerDomainExpansion(gestureName) {
  switch (gestureName) {
    case 'unlimited_void':    triggerUnlimitedVoid();    break;  // void.js
    case 'malevolent_shrine': triggerMalevolentShrine(); break;  // mal.js
    case 'chimera_shadow':    triggerChimeraShadow();    break;  // chimera.js
    case 'time_strike':       triggerTimeStrike();       break;  // time.js
  }
}

function dismissEffect() { clearScene(); }

document.addEventListener('DOMContentLoaded', initThree);