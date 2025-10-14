
import os
import sys
import signal
import time

import cv2
import mediapipe as mp
import pyautogui

# ========= Settings =========
CAM_INDEX = int(os.getenv("CAM_INDEX", "0"))
SHOW_WINDOW = os.getenv("SHOW_WINDOW", "1") == "1"
DRAW_DEBUG = True

SMOOTHING = float(os.getenv("SMOOTHING", "0.30"))
CLICK_COOLDOWN = float(os.getenv("CLICK_COOLDOWN", "0.25"))

# Pinch thresholds (normalized to image)
PINCH_CLOSE_THRESH = float(os.getenv("PINCH_CLOSE_THRESH", "0.04"))
PINCH_RELEASE_THRESH = float(os.getenv("PINCH_RELEASE_THRESH", "0.055"))  # hysteresis

# Pinch timing
PINCH_HOLD_RIGHTCLICK_S = float(os.getenv("PINCH_HOLD_RIGHTCLICK_S", "0.9"))  # hold to right-click
PINCH_SHORT_MAX_S = float(os.getenv("PINCH_SHORT_MAX_S", "0.35"))             # quick pinch=left click

# Scroll with pinch + vertical move
SCROLL_ENABLED = os.getenv("SCROLL_ENABLED", "1") == "1"
SCROLL_GAIN = float(os.getenv("SCROLL_GAIN", "1200"))  # larger -> faster scroll
SCROLL_SAMPLE_MS = int(os.getenv("SCROLL_SAMPLE_MS", "40"))

# Drag with spread (index & middle extended)
SPREAD_DRAG_ENABLED = os.getenv("SPREAD_DRAG_ENABLED", "1") == "1"
FINGER_EXT_THRESH = float(os.getenv("FINGER_EXT_THRESH", "0.2"))  # y-distance below wrist (lower y)

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

running = True

def handle_signal(signum, frame):
    global running
    running = False

signal.signal(signal.SIGINT, handle_signal)
if hasattr(signal, "SIGTERM"):
    signal.signal(signal.SIGTERM, handle_signal)

def lerp(a, b, t):
    return a + (b - a) * t

def dist(a, b):
    return ((a[0]-b[0])**2 + (a[1]-b[1])**2) ** 0.5

def main():
    global running

    cap = cv2.VideoCapture(CAM_INDEX, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("ERROR: Cannot open camera", file=sys.stderr)
        return 1

    hands = mp.solutions.hands.Hands(max_num_hands=1, min_detection_confidence=0.7)
    screen_w, screen_h = pyautogui.size()

    cur_x, cur_y = pyautogui.position()
    last_click_time = 0.0

    # Pinch state
    pinch_active = False
    pinch_start_t = 0.0
    last_scroll_ms = 0
    last_cursor_y = None

    # Drag state (spread fingers)
    dragging = False

    print("Hand mouse started.", flush=True)

    try:
        while running:
            ok, frame = cap.read()
            if not ok:
                continue

            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            out = hands.process(rgb)
            frame_h, frame_w = frame.shape[:2]

            if out.multi_hand_landmarks:
                hand = out.multi_hand_landmarks[0]
                lms = hand.landmark

                # Points
                thumb_tip = (lms[4].x, lms[4].y)
                index_tip = (lms[8].x, lms[8].y)
                middle_tip = (lms[12].x, lms[12].y)
                wrist = (lms[0].x, lms[0].y)

                # Cursor follows index finger
                target_x = index_tip[0] * screen_w
                target_y = index_tip[1] * screen_h
                cur_x = lerp(cur_x, target_x, SMOOTHING)
                cur_y = lerp(cur_y, target_y, SMOOTHING)
                pyautogui.moveTo(cur_x, cur_y)

                # Pinch measure
                pinch_d = dist(thumb_tip, index_tip)

                now = time.time()

                # Determine finger extension relative to wrist (y-axis)
                # (In image coords, y grows down, so "extended upward" means lower y than wrist by threshold)
                index_extended = (wrist[1] - index_tip[1]) > FINGER_EXT_THRESH
                middle_extended = (wrist[1] - middle_tip[1]) > FINGER_EXT_THRESH

                # ---- Spread drag (index + middle extended) ----
                want_drag = SPREAD_DRAG_ENABLED and index_extended and middle_extended

                if want_drag and not dragging:
                    pyautogui.mouseDown()
                    dragging = True
                elif dragging and not want_drag:
                    pyautogui.mouseUp()
                    dragging = False

                # ---- Pinch logic ----
                if not pinch_active and pinch_d < PINCH_CLOSE_THRESH:
                    pinch_active = True
                    pinch_start_t = now
                    last_cursor_y = cur_y
                elif pinch_active and pinch_d > PINCH_RELEASE_THRESH:
                    # Pinch released -> classify short vs hold
                    pinch_active = False
                    held = now - pinch_start_t
                    if not dragging and (now - last_click_time) > CLICK_COOLDOWN:
                        if held >= PINCH_HOLD_RIGHTCLICK_S:
                            pyautogui.click(button="right")
                        else:
                            pyautogui.click()
                        last_click_time = now
                    last_cursor_y = None

                # ---- Pinch + vertical move => Scroll ----
                if SCROLL_ENABLED and pinch_active and not dragging:
                    # Sample at intervals
                    ms = int(now * 1000)
                    if last_cursor_y is not None and (ms - last_scroll_ms) >= SCROLL_SAMPLE_MS:
                        dy = cur_y - last_cursor_y  # pixels
                        if abs(dy) > 2:
                            scroll_amount = int(-(dy / screen_h) * SCROLL_GAIN)
                            if scroll_amount != 0:
                                pyautogui.scroll(scroll_amount)
                                last_scroll_ms = ms
                        last_cursor_y = cur_y
                    elif last_cursor_y is None:
                        last_cursor_y = cur_y

                # ---- Debug draw ----
                if DRAW_DEBUG and SHOW_WINDOW:
                    for idx in [4, 8, 12, 0]:
                        cx, cy = int(lms[idx].x * frame_w), int(lms[idx].y * frame_h)
                        cv2.circle(frame, (cx, cy), 6, (0, 255, 0), -1)
                    status = []
                    if dragging: status.append("DRAG")
                    if pinch_active: status.append("PINCH")
                    cv2.putText(frame, " | ".join(status) or "MOVE",
                                (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2, cv2.LINE_AA)

            # Window & keys
            if SHOW_WINDOW:
                cv2.putText(frame, "Pinch: left click | Hold pinch: right click | Pinch+vertical: scroll",
                            (8, frame_h-20), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255,255,255), 2, cv2.LINE_AA)
                cv2.putText(frame, "Spread (index+middle up): drag",
                            (8, frame_h-4), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255,255,255), 2, cv2.LINE_AA)
                cv2.imshow("Hand Controlled Mouse", frame)
                k = cv2.waitKey(1) & 0xFF
                if k == 27:  # ESC
                    break
            else:
                cv2.waitKey(1)

    except Exception as e:
        print("ERROR:", e, file=sys.stderr)
    finally:
        running = False
        cap.release()
        if SHOW_WINDOW:
            try:
                cv2.destroyAllWindows()
            except Exception:
                pass
        print("Hand mouse stopped.", flush=True)

    return 0

if __name__ == "__main__":
    sys.exit(main())
