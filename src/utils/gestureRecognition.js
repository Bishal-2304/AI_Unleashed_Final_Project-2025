// ==============================
// Helper: Euclidean Distance
// ==============================
function distance(point1, point2) {
  if (!point1 || !point2) return Infinity; // If missing, return large number
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ==============================
// Gesture Detection Functions
// ==============================

// Pinch (Thumb tip close to Index tip)
export function isPinching(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 9) return false;
  return distance(landmarks[4], landmarks[8]) < 0.05; // ~5% of frame width
}

// Open Palm (Thumb tip far from Pinky tip)
export function isOpenPalm(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 21) return false;
  return distance(landmarks[4], landmarks[20]) > 0.25; // ~25% of frame width
}

// Fist (All fingertips close to their respective base joints)
export function isFist(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 21) return false;
  const fingertipIndices = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky tips
  const baseIndices = [5, 9, 13, 17];       // Corresponding base joints
  return fingertipIndices.every((tip, i) => distance(landmarks[tip], landmarks[baseIndices[i]]) < 0.05);
}

// Pointing (Index finger extended, others folded)
export function isPointing(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 21) return false;
  const indexExtended = distance(landmarks[8], landmarks[5]) > 0.07; // Index extended
  const middleFolded = distance(landmarks[12], landmarks[9]) < 0.05;
  const ringFolded = distance(landmarks[16], landmarks[13]) < 0.05;
  const pinkyFolded = distance(landmarks[20], landmarks[17]) < 0.05;
  return indexExtended && middleFolded && ringFolded && pinkyFolded;
}

// Peace Sign (Index & Middle extended, Ring & Pinky folded)
export function isPeaceSign(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 21) return false;
  const indexExtended = distance(landmarks[8], landmarks[5]) > 0.07;
  const middleExtended = distance(landmarks[12], landmarks[9]) > 0.07;
  const ringFolded = distance(landmarks[16], landmarks[13]) < 0.05;
  const pinkyFolded = distance(landmarks[20], landmarks[17]) < 0.05;
  return indexExtended && middleExtended && ringFolded && pinkyFolded;
}
