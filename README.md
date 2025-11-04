# Eye-Hand-Tracker

AI-Based Multi-Mode Human Computer Interaction System

### 🧩 Overview

This project is an AI-driven Human-Computer Interaction (HCI) system that allows users to interact with their computer using Eye Movement, Hand Gestures, and Voice Commands.  

It provides three distinct control modes:

1. Eye Tracking Mode — Move and control the Windows cursor using your eye gaze.  

2. Hand Tracking Mode — Control cursor movement with hand gestures and perform actions like click or drag.  

3. Voice Control Calculator Mode — Perform arithmetic calculations through voice commands such as “seven plus three”.

This project aims to provide touchless control for accessibility, innovation, and smarter human-computer interfaces.

---

### ✨ Features

👁 Eye Tracking Mode - Tracks the user’s eye gaze using webcam feed and moves the cursor accordingly. Supports blink detection for click actions. 

✋ Hand Tracking Mode - Detects hand movements and gestures using MediaPipe and OpenCV. Enables pointer movement, click (pinch), and drag operations. 

🎙 Voice Control Calculator Mode - Accepts voice input through the browser microphone, recognizes spoken arithmetic expressions, and performs real-time calculations. 

🔒 Secure Authentication - JWT-based user authentication with protected routes. 

💻 Web-Based Interface - Clean, modern React UI for switching between different modes seamlessly. 

📖 Manual Pages - Step-by-step guides for each mode with troubleshooting tips and example commands. 

---

 ### 🛠 Technologies Used
 
 Frontend - React.js, React Router, HTML5, CSS3 
 
 Backend - Flask (Python) 
 
 AI / CV Libraries - OpenCV, MediaPipe, dlib 
 
 Voice Recognition - Web Speech API
 
 Authentication - JWT (JSON Web Token), Flask-CORS 
 
 Utilities - dotenv, Numpy 
 
 Design Tools - Tailwind / Custom CSS, Modern minimalist UI 

---

## ⚙ Installation

### 🔧 Prerequisites

Before running the project, ensure you have:

- Python 3.9

- Node.js 18 and npm

- Webcam and Microphone access enabled

- Modern browser (Google Chrome / Microsoft Edge recommended)

---

## 🧱 Setup Instructions

### 1. Clone the Repository:
'''bash  
git clone https://github.com/Bishal-2304/AI_Unleashed_Final_Project-2025.git

cd AI_Unleashed_Final_Project-2025

### 2. Setup the Backend (Flask)

cd server

pip install -r requirements.txt

python app.py

### 3. Setup the Frontend (React)

cd client

npm install

npm run dev

### 4. Environment Variables

Create a .env file in the server directory and include:

SECRET_KEY=your_secret_key

---

## 🖱 Usage

Launch both frontend and backend servers.

Open the app in your browser and log in.

Navigate to the Mode Selection page.

Choose your preferred mode:

👁 Eye Tracking

✋ Hand Tracking

🎙 Voice Control Calculator

### Follow the on-screen manual for each mode.

🖐 Gesture Definitions (Hand Tracking Mode)

Gesture	Action

✋ Open Hand	Move the mouse cursor

🤏 Pinch (Thumb + Index)	Left Click

✊ Fist	Hold / Drag

✌ Two Fingers Up	Right Click

🖖 Five Fingers	Exit or Stop Tracking

All gestures are tracked in real-time using MediaPipe Hands and mapped to system cursor control using PyAutoGUI.

---

## 📂 Folder Structure

📦 project-root

├── server/

│   ├── app.py

│   ├── requirements.txt

│   ├── .env

│   └── ... (API endpoints for Eye and Hand tracking)

│

├── client/

│   ├── src/

│   │   ├── pages/

│   │   │   ├── ModeSelection.jsx

│   │   │   ├── VoiceCalculator.jsx

│   │   │   ├── VoiceManual.jsx

│   │   │   ├── EyeManual.jsx

│   │   │   ├── HandManual.jsx

│   │   │   └── CameraFeed.jsx

│   │   ├── App.jsx

│   │   ├── main.jsx

│   │   └── lib/

│   │       └── authFetch.js

│   ├── styles/

│   │   ├── App.css

│   │   ├── index.css

│   │   └── Voice-bg.jpg

│   └── package.json

│

└── README.md


---

## 🤝 Contributing

Contributions are welcome!

If you’d like to enhance features, improve accuracy, or extend functionality:

Fork the repositor

Create a new branch

git checkout -b feature/your-feature-name

Commit your changes

git commit -m "Add: new feature"

Push to your fork

git push origin feature/your-feature-name

Submit a Pull Request 🚀

---

## 🙏 Acknowledgments

Special thanks to:

MediaPipe and OpenCV teams for real-time hand & eye tracking models.

Flask and React communities for powerful and flexible frameworks.

Google Web Speech API for enabling seamless voice recognition.

Mentors, peers, and contributors who provided support and feedback throughout development.

---

## 🧠 Future Enhancements

📡 Multi-gesture recognition for scroll and zoom actions

💬 Voice feedback (text-to-speech results)

🧾 Multi-step arithmetic parsing (“five plus six times two”)

⚡ Native desktop version using Electron

🤖 Integration with accessibility tools for differently-abled users

---
