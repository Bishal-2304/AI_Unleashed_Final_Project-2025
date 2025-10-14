import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { initializeTracking } from "../utils/tracking";
import { util } from "@tensorflow/tfjs";


export default function CameraFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const [mode, setMode] = useState("hand");
  const [searchParams] = useSearchParams();
  const cursorPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const selectedMode = searchParams.get("mode") || "hand";
    setMode(selectedMode);

    if (!videoRef.current) return;

    initializeTracking(videoRef.current, canvasRef.current, selectedMode, ({ x, y }) => {
      const targetX = x * window.innerWidth;
      const targetY = y * window.innerHeight;

      // Smooth cursor movement
      cursorPos.current.x += (targetX - cursorPos.current.x) * 0.25;
      cursorPos.current.y += (targetY - cursorPos.current.y) * 0.25;

      if (cursorRef.current) {
        cursorRef.current.style.left = `${cursorPos.current.x}px`;
        cursorRef.current.style.top = `${cursorPos.current.y}px`;
      }
    });
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* Camera overlay in corner */}
      <div className="fixed bottom-4 right-4 w-72 h-48 z-50 border-2 border-white rounded-lg overflow-hidden bg-black">
        <video ref={videoRef} autoPlay muted className="absolute w-full h-full object-cover" />
        <canvas ref={canvasRef} width={288} height={192} className="absolute w-full h-full" />
      </div>

      {/* Cursor */}
      <div
        ref={cursorRef}
        className={`absolute w-6 h-6 rounded-full pointer-events-none z-50 ${
          mode === "hand" ? "bg-green-500" : "bg-red-500"
        }`}
      />

      {/* Mode label */}
      <div className="absolute top-4 left-4 text-white text-lg bg-black bg-opacity-50 p-2 rounded">
        Mode: {mode === "hand" ? "Hand Tracking" : "Eye Tracking"}
      </div>
    </div>
  );
}
