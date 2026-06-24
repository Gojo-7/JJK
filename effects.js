// ════════════════════════════════════════════════════════════════════════════
// EFFECTS.JS - Three.js Scene Management & Domain Expansion Control
// ════════════════════════════════════════════════════════════════════════════
// This file manages:
//   - Three.js scene, camera, renderer initialization
//   - Scene lifecycle (clear/reset)
//   - Public API to trigger domain expansions
// ════════════════════════════════════════════════════════════════════════════

let threeScene, threeCamera, threeRenderer;
let currentEffect = null;
let animationId = null;

// ── Initialize Three.js renderer ──
function initThree() {
  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  threeCamera.position.z = 5;

  threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeRenderer.setPixelRatio(window.devicePixelRatio);
  threeRenderer.domElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  `;
  document.body.appendChild(threeRenderer.domElement);

  // Handle window resize
  window.addEventListener('resize', () => {
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ── Clear scene objects and reset state ──
function clearScene() {
  cancelAnimationFrame(animationId);

  // Dispose all geometries and materials
  while (threeScene.children.length > 0) {
    const obj = threeScene.children[0];
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
    threeScene.remove(obj);
  }

  threeRenderer.setClearColor(0x000000, 0);
  currentEffect = null;
}

// ── Public API: Trigger domain expansion based on gesture ──
function triggerDomainExpansion(gestureName) {
  clearScene();

  switch (gestureName) {
    case 'malevolent_shrine':
      triggerMalevolentShrine();
      break;
    case 'unlimited_void':
      triggerUnlimitedVoid();
      break;
    case 'chimera_shadow':
      triggerChimeraShadow();
      break;
    case 'time_strike':
      triggerTimeStrike();
      break;
  }
}

// ── Dismiss effect and clean up ──
function dismissEffect() {
  clearScene();
  // Remove 2D canvas if it exists (for unlimited void)
  const vCanvas = document.getElementById('unlimited-void-canvas');
  if (vCanvas) vCanvas.remove();
  threeRenderer.setClearColor(0x000000, 0);
}

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', initThree);
