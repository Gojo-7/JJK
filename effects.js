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

// ════════════════════════════════════════════════════════════
// 3. CHIMERA SHADOW GARDEN — Megumi
//    Black tendrils rising + dark green shadow wisps
// ════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════
// 4. TIME STRIKE — Nanami
//    Golden ratio grid lines + clock-hand slashes
// ════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
// Public API — called from index.html
// ════════════════════════════════════════════════════════════
function triggerDomainExpansion(gestureName) {
  switch (gestureName) {
    case 'malevolent_shrine': if (typeof triggerMalevolentShrine === 'function') triggerMalevolentShrine(); break;
    case 'unlimited_void':    if (typeof triggerUnlimitedVoid === 'function') triggerUnlimitedVoid();    break;
    case 'chimera_shadow':    if (typeof triggerChimeraShadow === 'function') triggerChimeraShadow();    break;
    case 'time_strike':       if (typeof triggerTimeStrike === 'function') triggerTimeStrike();       break;
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
