import React, { useState, useEffect, useRef } from 'react';

const TrackingSession = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);

  // eye-mouse status
  const [eyeMouseRunning, setEyeMouseRunning] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    // start polling status when component mounts
    startStatusPolling();
    return () => stopStatusPolling();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const createSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `Session ${sessions.length + 1}` }),
      });
      const newSession = await response.json();
      setSessions([...sessions, newSession]);
      setCurrentSession(newSession);
    } catch (error) {
      console.error('Error creating session:', error);
    }
    setLoading(false);
  };

  const sendTrackingData = async (trackingData) => {
    if (!currentSession) return;
    try {
      await fetch(`/api/sessions/${currentSession.id}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData),
      });
    } catch (error) {
      console.error('Error sending tracking data:', error);
    }
  };

  const analyzeData = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSession?.id }),
      });
      const result = await response.json();
      console.log('Analysis result:', result);
      // Handle analysis result UI here
    } catch (error) {
      console.error('Error analyzing data:', error);
    }
  };

  // ===== Eye Mouse controls & status polling =====
  const startEyeMouse = async () => {
    try {
      await fetch('/api/eye-mouse/start', { method: 'POST' });
      // optimistic update; polling will correct if needed
      setEyeMouseRunning(true);
    } catch (e) {
      console.error('Failed to start eye mouse:', e);
    }
  };

  const stopEyeMouse = async () => {
    try {
      await fetch('/api/eye-mouse/stop', { method: 'POST' });
      setEyeMouseRunning(false);
    } catch (e) {
      console.error('Failed to stop eye mouse:', e);
    }
  };

  const pollStatusOnce = async () => {
    try {
      const res = await fetch('/api/eye-mouse/status');
      const data = await res.json();
      setEyeMouseRunning(Boolean(data.running));
    } catch {
      // if status fails, assume not running
      setEyeMouseRunning(false);
    }
  };

  const startStatusPolling = () => {
    if (pollRef.current) return;
    pollStatusOnce();
    pollRef.current = setInterval(pollStatusOnce, 1500); // poll every 1.5s
  };

  const stopStatusPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Tracking Sessions</h2>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button onClick={createSession} disabled={loading}>
          {loading ? 'Creating...' : 'New Session'}
        </button>

        {/* Eye Mouse controls */}
        <button onClick={startEyeMouse} disabled={eyeMouseRunning}>
          Start Eye Mouse
        </button>
        <button onClick={stopEyeMouse} disabled={!eyeMouseRunning}>
          Stop Eye Mouse
        </button>

        {/* Live status pill */}
        <span
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            background: eyeMouseRunning ? '#16a34a22' : '#ef444422',
            border: `1px solid ${eyeMouseRunning ? '#16a34a' : '#ef4444'}`,
            fontWeight: 600,
          }}
          title="Eye-controlled mouse status"
        >
          {eyeMouseRunning ? 'Eye Mouse: RUNNING' : 'Eye Mouse: STOPPED'}
        </span>
      </div>

      <div>
        <h3>Existing Sessions:</h3>
        <ul>
          {sessions.map((session) => (
            <li key={session.id} style={{ marginBottom: 8 }}>
              {session.name} — {new Date(session.created_at).toLocaleString()}
              <button style={{ marginLeft: 8 }} onClick={() => setCurrentSession(session)}>
                Select
              </button>
            </li>
          ))}
        </ul>
      </div>

      {currentSession && (
        <div style={{ marginTop: 16 }}>
          <h3>Current Session: {currentSession.name}</h3>
          <p>Data points: {currentSession.data_points?.length || 0}</p>
          <button onClick={analyzeData}>Analyze Data</button>
        </div>
      )}
    </div>
  );
};

export default TrackingSession;
