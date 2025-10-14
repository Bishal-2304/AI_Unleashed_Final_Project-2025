// src/pages/VoiceManual.jsx
import React from "react";
import "../styles/ModeSelection.css";

export default function VoiceManual() {
  return (
    <div className="mode-selection-container">
      <div className="header">
        <h1 className="main-heading">🎙️ Voice Control Calculator — User Manual</h1>
      </div>

      <div className="glass message-box" style={{ maxWidth: "800px", textAlign: "left" }}>
        <h2>1. Objective</h2>
        <p>
          The Voice Control Calculator allows you to perform arithmetic operations using your voice. 
          It listens to spoken input, converts it into an arithmetic expression, and returns the result using 
          the browser’s Web Speech API.
        </p>

        <h2>2. System Requirements</h2>
        <ul>
          <li>Microphone-enabled device (desktop/laptop preferred)</li>
          <li>Modern browser supporting Web Speech API (Chrome or Edge recommended)</li>
          <li>Stable internet connection</li>
        </ul>

        <h2>3. Working Principle</h2>
        <p>
          The system captures your voice input through the microphone, transcribes it into text, 
          and parses the recognized words into a mathematical expression. 
          It then evaluates the expression and displays the result in real time.
        </p>

        <h2>4. Supported Expressions</h2>
        <ul>
          <li><code>"twelve plus five"</code> → 17</li>
          <li><code>"7 times 8"</code> → 56</li>
          <li><code>"one hundred divided by four"</code> → 25</li>
          <li><code>"nineteen minus three"</code> → 16</li>
          <li><code>"twenty one plus thirty two"</code> → 53</li>
        </ul>
        <p>
          It supports simple two-operand expressions (left operator right) using spoken or numeric inputs.
        </p>

        <h2>5. Operator Words</h2>
        <ul>
          <li><strong>plus / add / added to</strong> → Addition (+)</li>
          <li><strong>minus / subtract / less</strong> → Subtraction (−)</li>
          <li><strong>times / multiply / multiplied by / x</strong> → Multiplication (×)</li>
          <li><strong>divided by / over / divide / by</strong> → Division (÷)</li>
        </ul>

        <h2>6. Usage Tips</h2>
        <ul>
          <li>Speak clearly and at a normal pace.</li>
          <li>Use short phrases like <em>"forty five plus ten"</em>.</li>
          <li>Ensure microphone permission is granted.</li>
          <li>Try again slowly if recognition errors occur.</li>
          <li>Best performance on Chrome or Edge.</li>
        </ul>

        <h2>7. Troubleshooting</h2>
        <ul>
          <li>If “Web Speech API not supported” appears, use a Chromium-based browser.</li>
          <li>Grant microphone permissions if not prompted automatically.</li>
          <li>Reduce background noise for more accurate detection.</li>
        </ul>

        <h2>8. Applications</h2>
        <ul>
          <li>Accessibility support for users with mobility impairments</li>
          <li>Hands-free data input systems</li>
          <li>Voice-based learning tools</li>
        </ul>

        <h2>9. Precautions</h2>
        <ul>
          <li>Ensure a quiet environment for clear input.</li>
          <li>Speak in consistent tone and avoid overlapping voices.</li>
          <li>Check browser compatibility before use.</li>
        </ul>
      </div>
    </div>
  );
}
