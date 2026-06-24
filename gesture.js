// ════════════════════════════════════════════════════════════════════════════
// GESTURE.JS - Hand Gesture Detection & Classification
// ════════════════════════════════════════════════════════════════════════════
// This file handles:
//   - Analyzing MediaPipe hand landmarks
//   - Classifying hand poses into JJK gestures
//   - Debouncing gesture changes to prevent flickering
// ════════════════════════════════════════════════════════════════════════════

let lastDetectedGesture = null;
let gestureDebounceTimer = null;

// ── Classify hand pose into a gesture ──
function classifyGesture(landmarks) {
  // Extract key hand landmarks
  const wrist = landmarks[0];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];

  // Calculate distance from each finger tip to wrist
  const getDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  const indexCurl = getDistance(index, wrist);
  const middleCurl = getDistance(middle, wrist);
  const ringCurl = getDistance(ring, wrist);
  const pinkyCurl = getDistance(pinky, wrist);

  // Threshold for extended vs curled finger
  const EXTENDED_THRESHOLD = 0.12;

  const indexExtended = indexCurl > EXTENDED_THRESHOLD;
  const middleExtended = middleCurl > EXTENDED_THRESHOLD;
  const ringExtended = ringCurl > EXTENDED_THRESHOLD;
  const pinkyExtended = pinkyCurl > EXTENDED_THRESHOLD;

  // Classify based on finger configuration
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return 'unlimited_void'; // Peace sign - Gojo
  }
  if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
    return 'chimera_shadow'; // Three fingers - Megumi
  }
  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return 'time_strike'; // All extended - Nanami
  }
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'malevolent_shrine'; // Fist - Sukuna
  }

  return null; // Unrecognized pose
}

// ── Debounced gesture detection ──
function classifyWithDebounce(landmarks, onGestureDetected, onGestureLost) {
  const gesture = classifyGesture(landmarks);

  if (gesture && gesture !== lastDetectedGesture) {
    // New gesture detected
    lastDetectedGesture = gesture;
    clearTimeout(gestureDebounceTimer);
    onGestureDetected(gesture);
  } else if (!gesture && lastDetectedGesture) {
    // Gesture lost - wait 300ms to confirm before triggering loss
    gestureDebounceTimer = setTimeout(() => {
      lastDetectedGesture = null;
      onGestureLost();
    }, 300);
  }
}
