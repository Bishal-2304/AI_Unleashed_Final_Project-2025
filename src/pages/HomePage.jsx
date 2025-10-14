import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import logo from "../styles/file_00000000567061f5b5e86efde13cd177.png";
import backgroundImage from "../styles/HomePage-Background.jpg";
import "../styles/HomePage.css";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");

  // === Shooting Stars Effect ===
  useEffect(() => {
    const canvas = document.getElementById("shootingStars");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class ShootingStar {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.len = Math.random() * 0 + 0;
        this.speed = Math.random() * 0 + 0;
        this.size = Math.random() * 0;
      }
      draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.len, this.y + this.len);
        ctx.strokeStyle = "white";
        ctx.lineWidth = this.size;
        ctx.stroke();
      }
      update() {
        this.x += this.speed;
        this.y += this.speed;
        if (this.y > canvas.height) this.reset();
      }
    }

    const stars = Array(8).fill().map(() => new ShootingStar());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.update();
        s.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }, []);

  // === GSAP Animations for Hero ===
  useEffect(() => {
    gsap.from(".logo-left", { duration: 1.5, scale: 0, ease: "back.out(1.7)" });
    gsap.from(".nav-links li", { duration: 1, y: -30, opacity: 0, stagger: 0.2, delay: 0.5 });
    gsap.from(".title", { duration: 1.2, y: 50, opacity: 0, delay: 1 });
    gsap.from(".sub-heading", { duration: 1.2, y: 50, opacity: 0, delay: 1.3 });
    gsap.from(".tagline", { duration: 1.2, y: 50, opacity: 0, delay: 1.6 });
    gsap.from(".btn-group", { duration: 1.2, scale: 0.8, opacity: 0, delay: 2, ease: "elastic.out(1, 0.5)" });
  }, []);

  return (
    <>
      <div
        className="page-background"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* === Navbar === */}
        <header className="navbar">
          <img src={logo} alt="Logo" className="logo-left" />
          <nav>
            <ul className="nav-links">
              <li><a href="#home" onClick={() => setActiveSection("home")}>Home</a></li>
              <li><a href="#about" onClick={() => setActiveSection("about")}>About us</a></li>
              <li><a href="#service" onClick={() => setActiveSection("service")}>Service</a></li>
              <li><a href="#contact" onClick={() => setActiveSection("contact")}>Contact</a></li>
            </ul>
          </nav>
        </header>

        {/* === Shooting Stars Canvas === */}
        <canvas id="shootingStars"></canvas>
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>

        {/* === Hero Section === */}
        {activeSection === "home" && (
          <main className="hero">
            <div className="hero-content">
              <h1 className="title">EYE-HAND-TRACKER</h1>
              <p className="mini-text">✨ Hands-free navigation with eye & blink</p>
              <h2 className="sub-heading">Welcome to our page</h2>
              <p className="tagline">No need for a mouse—just a blink and it’s done!</p>

              <div className="btn-group">
                <a
                  href="/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  🔑 Login
                </a>
                <a
                  href="/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline inline-flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  ➕ Sign Up
                </a>
              </div>
            </div>
          </main>
        )}

        {/* === About Section === */}
        {activeSection === "about" && (
          <section id="about" className="about-section">
            <div className="about-card">
              <h2 className="about-title">About Us</h2>
              <p className="about-text">
                We create technology that makes digital interaction effortless. Our
                Eye-Hand Tracker lets you control your device using just your gaze
                and fingertip gestures — no mouse or touchpad needed. We aim to make
                computing faster, smarter, and more accessible for everyone.
              </p>
              <p className="about-contact">
                For more information, contact us at:{" "}
                <span className="contact-item">📧 
                  <a href="mailto:technofivestar5@gmail.com"> technofivestar5@gmail.com</a>
                </span> | 
                <span className="contact-item">📞 
                  <a href="tel:9382984337"> +91 9382984337</a>
                </span>
              </p>
            </div>
          </section>
        )}

        {/* === Service Section === */}
        {activeSection === "service" && (
          <section id="service" className="service-section">
            <div className="service-card">
              <h2 className="service-title">Our Services</h2>
              <p className="service-text">
                Our services are designed to make technology more accessible and easy to use.  
                With eye tracking for seamless navigation, hand gestures for quick control,  
                and a voice calculator for instant calculations,  
                we focus on creating simple, practical tools that improve your digital experience.
              </p>
              <div className="service-list">
                <div className="service-item">
                  <h3>👁️ Eye Tracking</h3>
                  <p>Seamless navigation using just your gaze.</p>
                </div>
                <div className="service-item">
                  <h3>🖐️ Hand Gestures</h3>
                  <p>Control devices with simple finger gestures.</p>
                </div>
                <div className="service-item">
                  <h3>🎙️ Voice Calculator</h3>
                  <p>Perform quick calculations using voice commands.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* === Contact Section === */}
        {activeSection === "contact" && (
          <section id="contact" className="contact-section">
            <div className="contact-card">
              <h2 className="contact-title">Get in Touch</h2>
              <p className="contact-text">
                Have questions or need support? We’d love to hear from you.
              </p>
              <form className="contact-form">
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Your Email" required />
                <textarea placeholder="Your Message" rows="4" required></textarea>
                <button type="submit" className="btn btn-primary">📩 Send Message</button>
              </form>
              <p className="contact-info">
                Or reach us directly:
                <span className="contact-item">📧 
                  <a href="mailto:technofivestar5@gmail.com"> technofivestar5@gmail.com</a>
                </span> | 
                <span className="contact-item">📞 
                  <a href="tel:+919382984337"> +91 9382984337</a>
                </span>
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
