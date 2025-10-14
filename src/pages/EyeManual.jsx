// src/pages/EyeManual.jsx
import React from "react";
import "../styles/ModeSelection.css";

export default function EyeManual() {
  return (
    <div className="mode-selection-container">
      <div className="header">
        <h1 className="main-heading">📘 Eye Tracker — User Manual</h1>
      </div>

      <div className="glass message-box" style={{ maxWidth: "800px", textAlign: "left" }}>
        <h2>1. Objective</h2>
        <p>The Eye Tracker detects and tracks eye movements in real time. It determines where the user is looking using a camera and AI-based gaze estimation.</p>

        <h2>2. System Requirements</h2>
        <ul>
          <li>Webcam or built-in laptop camera</li>
          <li>Python 3.8+</li>
          <li>Libraries: OpenCV, MediaPipe</li>
        </ul>

        <h2>3. Working Principle</h2>
        <p>The camera captures video frames. The program detects facial and eye landmarks using AI (MediaPipe FaceMesh or OpenCV) and calculates gaze direction to identify eye movement.</p>

        <h2>4. How to Use</h2>
        <ol>
          <li>Run the Eye Tracker program.</li>
          <li>Sit around 50–70 cm from the camera.</li>
          <li>Look at different points on your screen.</li>
          <li>Observe real-time detection feedback.</li>
        </ol>

        <h2>5. Applications</h2>
        <ul>
          <li>Eye-controlled interfaces</li>
          <li>Medical and neurological research</li>
          <li>Gaming and VR control</li>
        </ul>

        <h2>6. Precautions</h2>
        <ul>
          <li>Ensure proper lighting.</li>
          <li>Avoid reflective glasses.</li>
          <li>Keep your face visible to the camera.</li>
        </ul>
      </div>
    </div>
  );
}
