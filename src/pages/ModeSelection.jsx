// src/pages/ModeSelection.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../lib/authFetch";
import "../styles/ModeSelection.css";

// 👇 Import card background images (add voice-bg image file below)
import handBg from "../styles/Hand-bg.jpg";
import eyeBg from "../styles/Eye-bg.jpg";
import voiceBg from "../styles/Speed Recognition.jpg";

export default function ModeSelection() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [eyeRunning, setEyeRunning] = useState(false);
  const [handRunning, setHandRunning] = useState(false);
  const [voiceRunning, setVoiceRunning] = useState(false); // local state
  const [loading, setLoading] = useState(false);

  const readStatus = useCallback(async () => {
    try {
      const [eyeRes, handRes] = await Promise.all([
        authFetch("/api/eye-mouse/status"),
        authFetch("/api/hand-mouse/status"),
      ]);
      const eye = await eyeRes.json();
      const hand = await handRes.json();
      if (eye.ok && eye.status?.eye) setEyeRunning(Boolean(eye.status.eye.running));
      if (hand.ok && hand.status?.hand) setHandRunning(Boolean(hand.status.hand.running));
    } catch {
      // ignore 401 redirect
    }
  }, []);

  useEffect(() => {
    readStatus();
    const id = setInterval(readStatus, 1500);
    return () => clearInterval(id);
  }, [readStatus]);

  async function startMode(mode) {
    setLoading(true);
    setMsg(`Starting ${mode}…`);
    try {
      if (mode === "voice") {
        // Voice mode is client-side and does not need a server call.
        setVoiceRunning(true);
        setMsg("✔ Voice control calculator ready.");
        // navigate to voice page so user can use the calculator UI
        navigate("/voice-calc");
        setLoading(false);
        return;
      }

      const url = mode === "eye" ? "/api/eye-mouse/start" : "/api/hand-mouse/start";
      const res = await authFetch(url, { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to start");
      setMsg(`✔ ${mode === "eye" ? "Eye" : "Hand"} tracking started.`);
      await readStatus();
    } catch (e) {
      setMsg(`✖ Failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function stopMode(mode) {
    setLoading(true);
    setMsg(`Stopping ${mode}…`);
    try {
      if (mode === "voice") {
        setVoiceRunning(false);
        setMsg("■ Voice control stopped.");
        setLoading(false);
        return;
      }

      const url = mode === "eye" ? "/api/eye-mouse/stop" : "/api/hand-mouse/stop";
      const res = await authFetch(url, { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to stop");
      setMsg(`■ ${mode === "eye" ? "Eye" : "Hand"} tracking stopped.`);
      await readStatus();
    } catch (e) {
      setMsg(`✖ Failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="mode-selection-container">
      {/* Header */}
      <div className="header">
        <h1 className="main-heading">Choose Your Control Mode</h1>
      </div>

      {/* Mode Cards */}
      <div className="mode-card-container">
        {/* Hand Tracking */}
        <div
          className="mode-card hand-card glass"
          style={{ backgroundImage: `url(${handBg})` }}
        >
          <div className="card-tint"></div>
          <div className="card-content">
            <h2>Hand Tracking</h2>
            <span className={handRunning ? "status running" : "status stopped"}>
              {handRunning ? "Running" : "Stopped"}
            </span>
            <p>Move your cursor using your fingertips (pinch to click).</p>
            <div className="button-group">
              <button onClick={() => startMode("hand")} disabled={loading}>
                Start
              </button>
              <button onClick={() => stopMode("hand")} disabled={loading}>
                Stop
              </button>
              <button onClick={() => navigate("/hand-manual")}>
                Hand-Manual
              </button>
            </div>
          </div>
        </div>

        {/* Eye Tracking */}
        <div
          className="mode-card eye-card glass"
          style={{ backgroundImage: `url(${eyeBg})` }}
        >
          <div className="card-tint"></div>
          <div className="card-content">
            <h2>Eye Tracking</h2>
            <span className={eyeRunning ? "status running" : "status stopped"}>
              {eyeRunning ? "Running" : "Stopped"}
            </span>
            <p>Move your cursor with your gaze (blink to click).</p>
            <div className="button-group">
              <button onClick={() => startMode("eye")} disabled={loading}>
                Start
              </button>
              <button onClick={() => stopMode("eye")} disabled={loading}>
                Stop
              </button>
              <button onClick={() => navigate("/eye-manual")}>
                Eye-Manual
              </button>
            </div>
          </div>
        </div>

        {/* Voice Control Calculator */}
        <div
          className="mode-card voice-card glass"
          style={{ backgroundImage: `url(${voiceBg})` }}
        >
          <div className="card-tint"></div>
          <div className="card-content">
            <h2>Voice Control Calculator</h2>
            <span className={voiceRunning ? "status running" : "status stopped"}>
              {voiceRunning ? "Running" : "Stopped"}
            </span>
            <p>Speak simple arithmetic </p>
            <div className="button-group">
              <button onClick={() => startMode("voice")} disabled={loading}>
                Start
              </button>
              <button onClick={() => stopMode("voice")} disabled={loading}>
                Stop
              </button>
              <button onClick={() => navigate("/voice-manual")}>
                Voice-Manual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message area */}
      {msg && <div className="glass message-box">{msg}</div>}

      {/* Sign Out button at bottom center */}
      <div className="footer">
        <button onClick={signOut} className="signout-btn glass">
          Log out
        </button>
      </div>
    </div>
  );
}
