
import os
import sys
import signal
import time
from collections import deque

import cv2
import mediapipe as mp
import pyautogui

# ========= Settings (tweak here) =========
CAM_INDEX = int(os.getenv("CAM_INDEX", "0"))
SHOW_WINDOW = os.getenv("SHOW_WINDOW", "1") == "1"
DRAW_DEBUG = True

# Cursor smoothing (0..1)
SMOOTHING = float(os.getenv("SMOOTHING", "0.25"))

# --- Dwell Click ---
DWELL_ENABLED = os.getenv("DWELL_ENABLED", "1") == "1"
DWELL_TIME_S = float(os.getenv("DWELL_TIME_S", "1.0"))     # seconds to click
DWELL_RADIUS_PX = int(os.getenv("DWELL_RADIUS_PX", "30"))  # how steady you must be

# --- Blink detection ---
BLINK_GAP_THRESH = float(os.getenv("BLINK_GAP_THRESH", "0.004"))
BLINK_CONSEC_FRAMES = int(os.getenv("BLINK_CONSEC_FRAMES", "2"))
DOUBLE_BLINK_WINDOW_S = float(os.getenv("DOUBLE_BLINK_WINDOW_S", "0.8"))  # two blinks within -> double click
CLICK_COOLDOWN = float(os.getenv("CLICK_COOLDOWN", "0.25"))

# --- Edge scroll ---
EDGE_SCROLL_ENABLED = os.getenv("EDGE_SCROLL_ENABLED", "1") == "1"
EDGE_MARGIN = float(os.getenv("EDGE_MARGIN", "0.08"))      # top/bottom 8% of screen
SCROLL_SPEED = int(os.getenv("SCROLL_SPEED", "80"))        # pyautogui.scroll units per tick
SCROLL_EVERY_MS = int(os.getenv("SCROLL_EVERY_MS", "60"))

# Misc
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

running = True

def handle_signal(signum, frame):
    global running
    running = False

signal.signal(signal.SIGINT, handle_signal)
if hasattr(signal, "SIGTERM"):
    signal.signal(signal.SIGTERM, handle_signal)

def lerp(a, b, t): return a + (b - a) * t

def main():
    global running

    cap = cv2.VideoCapture(CAM_INDEX, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("ERROR: Could not open camera.", file=sys.stderr, flush=True)
        return 1

    face_mesh = mp.solutions.face_mesh.FaceMesh(refine_landmarks=True)
    screen_w, screen_h = pyautogui.size()

    cur_x, cur_y = pyautogui.position()
    last_click_time = 0.0

    # Blink detection
    blink_history = deque(maxlen=5)
    last_blink_time = 0.0  # for double-blink

    # Dwell state
    dwell_anchor = None
    dwell_start = None

    # Scroll pacing
    last_scroll_ms = 0

    print("Eye mouse started.", flush=True)

    try:
        while running:
            ok, frame = cap.read()
            if not ok:
                continue

            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            out = face_mesh.process(rgb)
            lm_points = out.multi_face_landmarks

            frame_h, frame_w = frame.shape[:2]

            target_x, target_y = None, None
            if lm_points:
                lms = lm_points[0].landmark

                # Use iris landmark slice 474..477; take idx==1 (landmark 476) for pointing
                for idx, lm in enumerate(lms[474:478]):
                    x = int(lm.x * frame_w)
                    y = int(lm.y * frame_h)
                    if DRAW_DEBUG and SHOW_WINDOW:
                        cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)
                    if idx == 1:
                        target_x = lm.x * screen_w
                        target_y = lm.y * screen_h

                if target_x is not None:
                    cur_x = lerp(cur_x, target_x, SMOOTHING)
                    cur_y = lerp(cur_y, target_y, SMOOTHING)
                    pyautogui.moveTo(cur_x, cur_y)

                # Blink from eyelid gap (145 upper, 159 lower)
                left = [lms[145], lms[159]]
                if DRAW_DEBUG and SHOW_WINDOW:
                    for lm in left:
                        cv2.circle(frame, (int(lm.x*frame_w), int(lm.y*frame_h)), 3, (0, 255, 255), -1)

                eye_gap = left[0].y - left[1].y
                blink_history.append(eye_gap)
                is_blink = sum(1 for g in blink_history if g < BLINK_GAP_THRESH) >= BLINK_CONSEC_FRAMES

                now = time.time()
                if is_blink and (now - last_click_time) > CLICK_COOLDOWN:
                    # Double-blink detection
                    if (now - last_blink_time) <= DOUBLE_BLINK_WINDOW_S:
                        pyautogui.doubleClick()
                        last_click_time = now
                        last_blink_time = 0.0
                    else:
                        pyautogui.click()
                        last_click_time = now
                        last_blink_time = now

            # ----- Dwell Click -----
            if DWELL_ENABLED and target_x is not None:
                pos = (cur_x, cur_y)
                t = time.time()
                if dwell_anchor is None:
                    dwell_anchor = pos
                    dwell_start = t
                else:
                    dx = pos[0] - dwell_anchor[0]
                    dy = pos[1] - dwell_anchor[1]
                    if (dx*dx + dy*dy) ** 0.5 <= DWELL_RADIUS_PX:
                        if t - dwell_start >= DWELL_TIME_S and (t - last_click_time) > CLICK_COOLDOWN:
                            pyautogui.click()
                            last_click_time = t
                            dwell_start = t  # restart dwell timer
                    else:
                        dwell_anchor = pos
                        dwell_start = t

            # ----- Edge Scroll -----
            if EDGE_SCROLL_ENABLED and target_y is not None:
                y_norm = target_y / screen_h
                now_ms = int(time.time() * 1000)
                if now_ms - last_scroll_ms >= SCROLL_EVERY_MS:
                    if y_norm < EDGE_MARGIN:
                        pyautogui.scroll(SCROLL_SPEED)
                        last_scroll_ms = now_ms
                    elif y_norm > 1.0 - EDGE_MARGIN:
                        pyautogui.scroll(-SCROLL_SPEED)
                        last_scroll_ms = now_ms

            # ----- UI window -----
            if SHOW_WINDOW:
                cv2.putText(frame, "Blink: click | Double blink: double-click | Dwell: auto-click",
                            (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2, cv2.LINE_AA)
                cv2.putText(frame, "Edge gaze scroll",
                            (8, 46), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2, cv2.LINE_AA)

                cv2.imshow("Eye Controlled Mouse", frame)
                k = cv2.waitKey(1) & 0xFF
                if k == 27:  # ESC
                    break
            else:
                cv2.waitKey(1)

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr, flush=True)
    finally:
        running = False
        cap.release()
        if SHOW_WINDOW:
            try: cv2.destroyAllWindows()
            except Exception: pass
        print("Eye mouse stopped.", flush=True)

    return 0

if __name__ == "__main__":
    sys.exit(main())
