import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.css";
import backgroundImg from "../styles/download.png";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPwd, setShowPwd] = useState(false); // <-- password visibility state
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      const card = cardRef.current;

      // ✅ First-time vs logout entry animations
      if (!sessionStorage.getItem("visited")) {
        card.classList.add("popin-animate");
        sessionStorage.setItem("visited", "true");
      } else {
        card.classList.add("reverse-animate");
      }

      // ✅ Remove animation class after it ends
      const handleAnimationEnd = () => {
        card.classList.remove("popin-animate", "reverse-animate", "success-animate");
      };
      card.addEventListener("animationend", handleAnimationEnd);

      return () => {
        card.removeEventListener("animationend", handleAnimationEnd);
      };
    }
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("Signing in...");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      setMsg("Welcome!");

      if (cardRef.current) {
        cardRef.current.classList.add("success-animate");
      }

      setTimeout(() => nav("/mode"), 1000);
    } catch (err) {
      setMsg("✖ " + err.message);
    }
  }

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="overlay"></div>

      <div className="login-card" ref={cardRef}>
        <div className="login-logo">🔒</div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Please log in to continue</p>

        <form onSubmit={onSubmit} className="login-form">
          <label className="login-label">
            Email
            <input
              className="login-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => cardRef.current?.classList.add("pause-spin")}
              onBlur={() => cardRef.current?.classList.remove("pause-spin")}
              required
            />
          </label>

          <label className="login-label" style={{ position: "relative" }}>
            Password
            <input
              className="login-input"
              type={showPwd ? "text" : "password"} // <-- toggle here
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => cardRef.current?.classList.add("pause-spin")}
              onBlur={() => cardRef.current?.classList.remove("pause-spin")}
              required
              style={{ paddingRight: "3rem" }} // space for the toggle button
            />
            {/* Toggle button (simple, no extra libs) */}
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Hide password" : "Show password"}
              title={showPwd ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                padding: 0,
                color: "#333",
              }}
            >
              {showPwd ? ":)" : "👁️"}
            </button>
          </label>

          <button type="submit" className="login-button">
            Log in
          </button>
        </form>

        <div className="login-bottom">
          No account?
          <Link to="/signup" className="login-link">
            Sign up
          </Link>
        </div>

        {msg && <div className="login-subtitle">{msg}</div>}
      </div>
    </div>
  );
}
