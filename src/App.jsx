// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EyeManual from "./pages/EyeManual";
import HandManual from "./pages/HandManual";
import ModeSelection from "./pages/ModeSelection";
import CameraFeed from "./pages/CameraFeed";
import VoiceCalculator from "./pages/VoiceCalculator";
import VoiceManual from "./pages/VoiceManual"; // optional; see notes below


function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Authentication Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Mode Selection */}
        <Route path="/mode" element={<ModeSelection />} />

        {/* Camera Feed (Hand / Eye Tracking) */}
        <Route path="/camera" element={<CameraFeed />} />

        {/* Home Page */}
        <Route path="/" element={<ModeSelection />} />

        {/* Manuals */}
        <Route path="/hand-manual" element={<HandManual />} />
        <Route path="/eye-manual" element={<EyeManual />} />
        <Route path="/voice-manual" element={<VoiceManual />} />
        <Route path="/voice-calc" element={<VoiceCalculator />} />
      </Routes>
    </Router>

  );
}

export default App;
