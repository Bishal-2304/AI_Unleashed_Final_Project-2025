import os
import sys
import signal
import subprocess
import threading
import sqlite3
import datetime as dt
from pathlib import Path
from functools import wraps

from flask import Flask, jsonify, request, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

app = Flask(__name__)
CORS(app)

# ====== CONFIG ======
ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "app.db"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
TOKEN_MAX_AGE = 60 * 60 * 24 * 7  # 7 days
ts = URLSafeTimedSerializer(SECRET_KEY)

# Absolute paths or defaults next to app.py
EYE_SCRIPT = Path(os.getenv("EYE_SCRIPT", ROOT / "Eye_Mouse.py"))
HAND_SCRIPT = Path(os.getenv("HAND_SCRIPT", ROOT / "Hand_Mouse.py"))

# ====== DB helpers ======
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    db.commit()

with app.app_context():
    init_db()

# ====== Auth helpers ======
def create_token(user_id, email):
    payload = {"uid": user_id, "email": email}
    return ts.dumps(payload)

def verify_token(token):
    try:
        data = ts.loads(token, max_age=TOKEN_MAX_AGE)
        return data
    except SignatureExpired:
        return None
    except BadSignature:
        return None

def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"ok": False, "error": "Missing token"}), 401
        token = auth.split(" ", 1)[1]
        data = verify_token(token)
        if not data:
            return jsonify({"ok": False, "error": "Invalid or expired token"}), 401
        g.user = data
        return fn(*args, **kwargs)
    return wrapper

# ====== Auth routes ======
@app.route("/api/auth/signup", methods=["POST"])
def api_signup():
    body = request.get_json(force=True, silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    name = (body.get("name") or "").strip()

    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required"}), 400

    pw_hash = generate_password_hash(password)
    try:
        db = get_db()
        cur = db.execute(
            "INSERT INTO users(email, name, password_hash, created_at) VALUES(?,?,?,?)",
            (email, name, pw_hash, dt.datetime.utcnow().isoformat())
        )
        db.commit()
        user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({"ok": False, "error": "Email already in use"}), 409

    token = create_token(user_id, email)
    return jsonify({"ok": True, "token": token, "user": {"id": user_id, "email": email, "name": name}})

@app.route("/api/auth/login", methods=["POST"])
def api_login():
    body = request.get_json(force=True, silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    db = get_db()
    row = db.execute("SELECT id, email, name, password_hash FROM users WHERE email = ?", (email,)).fetchone()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"ok": False, "error": "Invalid credentials"}), 401

    token = create_token(row["id"], row["email"])
    return jsonify({"ok": True, "token": token, "user": {"id": row["id"], "email": row["email"], "name": row["name"]}})

@app.route("/api/auth/me", methods=["GET"])
@auth_required
def api_me():
    db = get_db()
    row = db.execute("SELECT id, email, name FROM users WHERE id = ?", (g.user["uid"],)).fetchone()
    if not row:
        return jsonify({"ok": False, "error": "User not found"}), 404
    return jsonify({"ok": True, "user": {"id": row["id"], "email": row["email"], "name": row["name"]}})

# ====== Process management for Eye/Hand tracking ======
state_lock = threading.Lock()
processes = {"eye": None, "hand": None}

def is_running(mode: str) -> bool:
    proc = processes.get(mode)
    return proc is not None and proc.poll() is None

def stop_mode(mode: str):
    with state_lock:
        proc = processes.get(mode)
        if proc and proc.poll() is None:
            try:
                if os.name == "nt":
                    proc.terminate()
                else:
                    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            except Exception:
                pass
            try:
                proc.wait(timeout=5)
            except Exception:
                pass
        processes[mode] = None

def start_mode(mode: str):
    script = EYE_SCRIPT if mode == "eye" else HAND_SCRIPT
    script = Path(script)
    if not script.exists():
        raise FileNotFoundError(f"{script} not found")

    other = "hand" if mode == "eye" else "eye"
    stop_mode(other)

    with state_lock:
        if is_running(mode):
            return processes[mode]

        creationflags = 0
        preexec_fn = None
        if os.name != "nt":
            preexec_fn = os.setsid

        proc = subprocess.Popen(
            [sys.executable, str(script)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            creationflags=creationflags,
            preexec_fn=preexec_fn,
        )
        processes[mode] = proc
        return proc

def status_payload():
    return {
        "eye": {"running": is_running("eye"), "pid": processes["eye"].pid if processes["eye"] else None},
        "hand": {"running": is_running("hand"), "pid": processes["hand"].pid if processes["hand"] else None},
    }

@app.route("/api/eye-mouse/start", methods=["POST"])
@auth_required
def api_eye_start():
    try:
        start_mode("eye")
        return jsonify({"ok": True, "mode": "eye", "status": status_payload()})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/eye-mouse/stop", methods=["POST"])
@auth_required
def api_eye_stop():
    stop_mode("eye")
    return jsonify({"ok": True, "mode": "eye", "status": status_payload()})

@app.route("/api/eye-mouse/status", methods=["GET"])
@auth_required
def api_eye_status():
    return jsonify({"ok": True, "mode": "eye", "status": status_payload()})

@app.route("/api/hand-mouse/start", methods=["POST"])
@auth_required
def api_hand_start():
    try:
        start_mode("hand")
        return jsonify({"ok": True, "mode": "hand", "status": status_payload()})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/hand-mouse/stop", methods=["POST"])
@auth_required
def api_hand_stop():
    stop_mode("hand")
    return jsonify({"ok": True, "mode": "hand", "status": status_payload()})

@app.route("/api/hand-mouse/status", methods=["GET"])
@auth_required
def api_hand_status():
    return jsonify({"ok": True, "mode": "hand", "status": status_payload()})

@app.route("/api/kill-all", methods=["POST"])
@auth_required
def api_kill_all():
    stop_mode("eye")
    stop_mode("hand")
    return jsonify({"ok": True, "status": status_payload()})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
