// src/utils/tracking.js
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { FaceMesh } from "@mediapipe/face_mesh";


export function initializeTracking(videoElement, canvasElement, mode = "hand", onMove) {
  if (!videoElement || !canvasElement) return;

  const canvas = canvasElement;
  const ctx = canvas.getContext("2d");

  // ---------- HAND TRACKING ----------
  if (mode === "hand") {
    const hands = new Hands({
      locateFile: (file) => https,//cdn.jsdelivr.net/npm/@mediapipe/hands/${file},
    });



    hands.setOptions({
      maxNumHands: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!results.image) return;
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks?.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        drawConnectors(ctx, landmarks, Hands.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 4 });
        drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 2 });

        const tip = landmarks[8]; // Index fingertip
        if (onMove) onMove({ x: tip.x, y: tip.y });
      }
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => await hands.send({ image: videoElement }),
      width: 640,
      height: 480,
    });
    camera.start();
  }
  // ---------- EYE TRACKING ----------
  if (mode === "eye") {
    const faceMesh = new FaceMesh({
      locateFile: (file) => `node_modules/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // iris landmarks
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    faceMesh.onResults((results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!results.image) return;
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks?.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        // Left iris: landmarks 474-477, Right iris: 469-472
        const leftIris = landmarks[474];
        const rightIris = landmarks[469];

        // Average iris position for gaze
        const gazeX = (leftIris.x + rightIris.x) / 2;
        const gazeY = (leftIris.y + rightIris.y) / 2;

        if (onMove) onMove({ x: gazeX, y: gazeY });

        // Draw iris points
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(leftIris.x * canvas.width, leftIris.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(rightIris.x * canvas.width, rightIris.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => await faceMesh.send({ image: videoElement }),
      width: 640,
      height: 480,
    });
    camera.start();
  }

}