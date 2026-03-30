// ─── gesture.js ───────────────────────────────────────────
// Detects JJK hand signs from MediaPipe landmark data

// Finger tip and base landmark IDs
const TIPS  = [4, 8, 12, 16, 20];  // thumb, index, middle, ring, pinky tips
const BASES = [2, 5,  9, 13, 17];  // corresponding base joints

// Returns true if a finger is extended (tip is above its base)
function isFingerUp(landmarks, tip, base) {
  return landmarks[tip].y < landmarks[base].y;
}

// Returns [thumb, index, middle, ring, pinky] as 1 (up) or 0 (down)
function getFingerState(landmarks) {
  return TIPS.map((tip, i) => isFingerUp(landmarks, tip, BASES[i]) ? 1 : 0);
}

// Euclidean distance between two landmarks
function dist(a, b) {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

// ─── Gesture definitions ────────────────────────────────────
// Each function returns true if the landmarks match that sign

// SUKUNA — Malevolent Shrine
// Both index fingers form a triangle/roof pointing up (the finger gun prayer pose)
// Approximated as: both index tips close together, raised high, thumbs out
function isMalevolentShrine(landmarks) {
  const fingers = getFingerState(landmarks);
  const indexUp  = fingers[1] === 1;
  const middleUp = fingers[2] === 1;
  const ringDown  = fingers[3] === 0;
  const pinkyDown = fingers[4] === 0;
  // Index and middle up together, ring and pinky curled
  return indexUp && middleUp && ringDown && pinkyDown;
}

// GOJO — Unlimited Void
// Open palm facing camera, all five fingers spread wide
function isUnlimitedVoid(landmarks) {
  const fingers = getFingerState(landmarks);
  // All fingers extended
  return fingers.every(f => f === 1);
}

// MEGUMI — Chimera Shadow Garden
// Only index finger pointing up (summoning gesture)
function isChimeraShadow(landmarks) {
  const fingers = getFingerState(landmarks);
  return fingers[1] === 1 &&
         fingers[2] === 0 &&
         fingers[3] === 0 &&
         fingers[4] === 0;
}

// NANAMI — Time Strike
// Fist — all fingers curled down
function isTimeStrike(landmarks) {
  const fingers = getFingerState(landmarks);
  // Only check index, middle, ring, pinky — ignore thumb (fingers[0])
  return fingers[1] === 0 &&
         fingers[2] === 0 &&
         fingers[3] === 0 &&
         fingers[4] === 0;
}

// ─── Main classifier ────────────────────────────────────────
// Call this every frame with the landmarks from MediaPipe
// Returns the domain name or null

function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length === 0) return null;

  if (isMalevolentShrine(landmarks)) return 'malevolent_shrine';
  if (isUnlimitedVoid(landmarks))    return 'unlimited_void';
  if (isChimeraShadow(landmarks))    return 'chimera_shadow';
  if (isTimeStrike(landmarks))       return 'time_strike';

  return null;
}

// ─── Debounce helper ────────────────────────────────────────
// Prevents flickering — gesture must hold for 600ms to trigger
let gestureTimer = null;
let lastGesture  = null;

function classifyWithDebounce(landmarks, onDetected) {
  const gesture = classifyGesture(landmarks);

  if (gesture && gesture !== lastGesture) {
    if (!gestureTimer) {
      gestureTimer = setTimeout(() => {
        lastGesture = gesture;
        onDetected(gesture);
        gestureTimer = null;
      }, 600);
    }
  } else if (!gesture) {
    clearTimeout(gestureTimer);
    gestureTimer = null;
  }
}