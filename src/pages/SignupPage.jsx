import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/SignupPage.css"; // ✅ Reuse same CSS
import backgroundImg from "../styles/download.png";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      // ✅ Entry animation (always pop-in for signup page)
      cardRef.current.classList.add("popin-animate");
      setTimeout(() => {
        cardRef.current.classList.remove("popin-animate");
      }, 1000);

      // ✅ Hover tilt effect with shadow
      const card = cardRef.current;
      card.classList.add("tilt-hover");

      const handleMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * 8;
        const rotateY = ((x - centerX) / centerX) * -8;

        const shadowX = ((x - centerX) / centerX) * 12;
        const shadowY = ((y - centerY) / centerY) * 12;

        const scale = 1.03;

        card.style.setProperty("--rotateX", `${rotateX}deg`);
        card.style.setProperty("--rotateY", `${rotateY}deg`);
        card.style.setProperty("--shadowX", `${shadowX}px`);
        card.style.setProperty("--shadowY", `${shadowY}px`);
        card.style.setProperty("--scale", scale);
      };

      const resetTilt = () => {
        card.style.setProperty("--rotateX", "0deg");
        card.style.setProperty("--rotateY", "0deg");
        card.style.setProperty("--shadowX", "0px");
        card.style.setProperty("--shadowY", "8px");
        card.style.setProperty("--scale", "1");
      };

      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseleave", resetTilt);

      return () => {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseleave", resetTilt);
      };
    }
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("Creating account...");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Signup failed");
      localStorage.setItem("token", data.token);
      setMsg("Account created!");

      if (cardRef.current) {
        cardRef.current.classList.add("success-animate");
      }

      // 🔥 Redirect to login page after success
      setTimeout(() => nav("/login"), 1000);
    } catch (err) {
      setMsg("✖ " + err.message);
    }
  }

  return (
    <div
      className="signup-container"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="overlay"></div>

      <div className="signup-card" ref={cardRef}>
        <div className="signup-logo">✨</div>
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Join us and get started</p>

        <form onSubmit={onSubmit} className="signup-form">
          <label className="signup-label">
            Name
            <input
              className="signup-input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="signup-label">
            Email
            <input
              className="signup-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="signup-label">
            Password
            <input
              className="signup-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="signup-button">
            Create Account
          </button>
        </form>

        <div className="signup-bottom">
          Already have an account?
          <Link to="/login" className="signup-link">
            Log in
          </Link>
        </div>

        {msg && <div className="signup-subtitle">{msg}</div>}
      </div>
    </div>
  );
}
