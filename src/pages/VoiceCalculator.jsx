// src/pages/VoiceCalculator.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/VoiceCalculator.css";

/* number words & parsing functions (unchanged logic) */
const numberWords = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000
};

function wordsToNumber(words) {
  if (words == null) return null;
  const s = String(words).trim().toLowerCase().replace(/[,\s]+/g, " ");
  if (!s) return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s.includes(" point ")) {
    const [intPart, fracPart] = s.split(" point ").map(p => p.trim());
    const intNum = wordsToNumber(intPart);
    const fracDigits = fracPart.split(/\s+/).map(tok => {
      if (/^\d$/.test(tok)) return tok;
      if (numberWords[tok] != null && numberWords[tok] <= 9) return String(numberWords[tok]);
      return null;
    });
    if (intNum == null || fracDigits.some(d => d == null)) return null;
    return Number(`${intNum}.${fracDigits.join("")}`);
  }
  const parts = s.split(/\s+/).filter(Boolean);
  let total = 0;
  let current = 0;
  for (const token of parts) {
    if (!isNaN(Number(token))) {
      current += Number(token);
    } else if (numberWords[token] != null) {
      const val = numberWords[token];
      if (val === 100 || val === 1000) {
        if (current === 0) current = 1;
        current *= val;
      } else {
        current += val;
      }
    } else if (token === "and") {
      continue;
    } else {
      return null;
    }
  }
  total += current;
  return total;
}

function parseExpression(text) {
  if (!text || typeof text !== "string") return null;
  const raw = text.trim().toLowerCase();
  const cleanedEnd = raw.replace(/[.?!]+$/g, "").trim();

  const symMatch = cleanedEnd.match(/(-?\d+(?:\.\d+)?)\s*([×\u00D7\*x\/])\s*(-?\d+(?:\.\d+)?)/i);
  if (symMatch) {
    const left = Number(symMatch[1]);
    const rawOp = symMatch[2].toLowerCase();
    const right = Number(symMatch[3]);
    let op = null;
    if (rawOp === "*" || rawOp === "×" || rawOp === "\u00D7" || rawOp === "x") op = "*";
    if (rawOp === "/") op = "/";
    if (op == null) return null;
    return { left, right, op };
  }

  let t = cleanedEnd
    .replace(/×/g, " times ")
    .replace(/\u00D7/g, " times ")
    .replace(/\*/g, " times ")
    .replace(/\//g, " divided by ")
    .replace(/\b(\d+)\s*x\s+(\d+)\b/g, "$1 times $2");

  t = t.replace(/[^a-z0-9\s\.\-]/g, " ").replace(/\s+/g, " ").trim();

  const ops = [
    { words: ["plus", "add", "added to"], op: "+" },
    { words: ["minus", "subtract", "less"], op: "-" },
    { words: ["times", "multiply", "multiplied by", "x"], op: "*" },
    { words: ["into"], op: "*" },
    { words: ["divided by", "over", "divide", "by"], op: "/" },
  ];

  for (const { words, op } of ops) {
    const sorted = [...words].sort((a, b) => b.length - a.length);
    for (const w of sorted) {
      const pattern = new RegExp(`\\b${w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`);
      const m = t.match(pattern);
      if (m) {
        const parts = t.split(pattern);
        const leftRaw = parts[0].trim();
        const rightRaw = parts.slice(1).join(" ").trim();
        const leftNum = wordsToNumber(leftRaw);
        const rightNum = wordsToNumber(rightRaw);
        if (leftNum == null || rightNum == null) return null;
        return { left: leftNum, right: rightNum, op };
      }
    }
  }

  const tokens = t.split(/\s+/).filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (["plus", "+", "add", "minus", "-", "subtract", "times", "*", "x", "multiplied", "divided", "/", "over", "by"].includes(tok)) {
      const left = tokens.slice(0, i).join(" ");
      const right = tokens.slice(i + 1).join(" ");
      const leftNum = wordsToNumber(left);
      const rightNum = wordsToNumber(right);
      if (leftNum == null || rightNum == null) return null;
      let op = "+";
      if (["plus", "+", "add"].includes(tok)) op = "+";
      if (["minus", "-", "subtract"].includes(tok)) op = "-";
      if (["times", "*", "x", "multiplied"].includes(tok)) op = "*";
      if (["divided", "/", "over", "by"].includes(tok)) op = "/";
      return { left: leftNum, right: rightNum, op };
    }
  }
  return null;
}

export default function VoiceCalculator() {
  const navigate = useNavigate();
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  // Set/unset a class on the root element to trigger listening styles (pulse)
  useEffect(() => {
    const root = document.querySelector(".voice-calc-page");
    if (!root) return;
    if (listening) root.classList.add("listening");
    else root.classList.remove("listening");
  }, [listening]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript;
      setTranscript(text);
      setError("");
      const parsed = parseExpression(text);
      if (!parsed) {
        setResult(null);
        setError("Could not parse arithmetic expression. Try: 'twelve plus five' or '7 times 3'.");
      } else {
        let res = null;
        try {
          switch (parsed.op) {
            case "+": res = parsed.left + parsed.right; break;
            case "-": res = parsed.left - parsed.right; break;
            case "*": res = parsed.left * parsed.right; break;
            case "/": res = parsed.right === 0 ? "Division by zero" : parsed.left / parsed.right; break;
            default: res = "Unknown op";
          }
        } catch (e) {
          res = "Error computing";
        }
        setResult(res);
      }
    };

    rec.onerror = (ev) => {
      setError("Speech recognition error: " + ev.error);
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
    };

    recognitionRef.current = rec;
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  function startListening() {
    setError("");
    setTranscript("");
    setResult(null);
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (e) {
      setError("Failed to start speech recognition: " + e.message);
    }
  }

  function stopListening() {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // ignore
    }
    setListening(false);
  }

  return (
    <div className="voice-calc-page">
      {/* Full-page particles layer */}
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{ ['--i']: i }} /* CSS custom property used for variety */
          />
        ))}
      </div>

      <div className="calc-wrapper">
        <div className="header-row">
          <h1>Voice Control Calculator</h1>
          <button className="btn-back" onClick={() => navigate("/mode")}>← Back to Modes</button>
        </div>

        {!supported && (
          <div className="panel"><strong style={{ color: "#ff9b9b" }}>Browser unsupported:</strong> Your browser does not support the Web Speech API. Try Chrome or Edge.</div>
        )}

        <div className="panel">
          <p>Say an arithmetic phrase like: <em style={{ color: "#f0e6c5" }}>"twelve plus five"</em> or <em style={{ color: "#f0e6c5" }}>"7 times 8"</em>.</p>

          <div className="controls">
            {!listening ? (
              <button className="btn-listen" onClick={startListening} disabled={!supported} aria-pressed="false">
                {/* microphone SVG */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 11v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Start Listening
              </button>
            ) : (
              <button className="btn-listen" onClick={stopListening} aria-pressed="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 11v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Listening...
              </button>
            )}

            <button className="btn-clear" onClick={() => { setTranscript(""); setResult(null); setError(""); }}>
              Clear
            </button>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ color: "#f5e9ba", marginBottom: 8 }}><strong>Transcript:</strong></div>
            <div className="data-box" aria-live="polite">
              {transcript || <em style={{ color: "#cfc9b3" }}>— waiting for input —</em>}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ color: "#f5e9ba", marginBottom: 8 }}><strong>Result:</strong></div>
            <div className="data-box" aria-live="polite">
              {error ? <span className="error">{error}</span> :
                result == null ? <em style={{ color: "#cfc9b3" }}>— no result —</em> : <span style={{ color: "#fff" }}>{String(result)}</span>}
            </div>
          </div>
        </div>

        <div className="panel tips">
          <div style={{ color: "#efe6cc", fontWeight: 600 }}>Tips:</div>
          <ul>
            <li>Speak clearly. Try phrases like "twenty one divided by three" or "one hundred minus fifty".</li>
            <li>This demo handles simple two-operand expressions (binary ops).</li>
            <li>Works best in Chrome/Edge on desktop.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
