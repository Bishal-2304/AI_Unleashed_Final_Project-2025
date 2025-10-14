// src/pages/HandManual.jsx
import React from "react";
import "../styles/ModeSelection.css";

export default function HandManual() {
  return (
    <div className="mode-selection-container">
      <div className="header">
        <h1 className="main-heading">📗 Hand Tracker — User Manual</h1>
      </div>

      <div className="glass message-box" style={{ maxWidth: "800px", textAlign: "left" }}>
        <h2>1. Objective</h2>
        <p>The Hand Tracker detects and tracks hand gestures and movements in real time using a camera and AI-based recognition.</p>

        <h2>2. System Requirements</h2>
        <ul>
          <li>Webcam or external camera</li>
          <li>Python 3.8+</li>
          <li>Libraries: OpenCV, MediaPipe</li>
        </ul>

        <h2>3. Working Principle</h2>
        <p>The camera captures video input. MediaPipe Hands detects 21 hand landmarks and analyzes finger positions to identify gestures like open hand, fist, point, or pinch.</p>

        <h2>4. How to Use</h2>
        <ol>
          <li>Run the Hand Tracker program.</li>
          <li>Show your hand clearly to the camera.</li>
          <li>Move or gesture naturally.</li>
          <li>Watch detected landmarks and gestures in real time.</li>
        </ol>

        <h2>5. Applications</h2>
        <ul>
          <li>Human–Computer Interaction (HCI)</li>
          <li>Robotics and gesture control</li>
          <li>Virtual/Augmented reality</li>
        </ul>

        <h2>6. Precautions</h2>
        <ul>
          <li>Keep good lighting.</li>
          <li>Avoid cluttered backgrounds.</li>
          <li>Move hands steadily for better detection.</li>
        </ul>
      </div>
    </div>
  );
}
