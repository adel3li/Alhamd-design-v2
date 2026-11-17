"""
Procedural sound effects for the film: natural sounds only, no music.

  python3 tools/sfx.py out/timings.json out/sfx.wav
  python3 tools/sfx.py out/final-timings.json out/sfx.wav --mix out/voice-track.wav out/mix.wav

Each effect is placed relative to the start of its scene, so it follows the timing file
(temp voice or real voice). Levels sit well under the voice.
"""
import json
import math
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
FADE = 0.4  # motion.js cross-fade: a scene is fully visible this long after its slot starts


def db(x: float) -> float:
    return 10 ** (x / 20)


def biquad(x: np.ndarray, kind: str, f0, q: float = 0.707, passes: int = 1) -> np.ndarray:
    """RBJ biquad. f0 may be an array (one cutoff per sample) for sweeps; coefficients update every 32 samples.
    passes > 1 cascades the filter for steeper skirts."""
    if passes > 1:
        return biquad(biquad(x, kind, f0, q, passes - 1), kind, f0, q)
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    f = np.broadcast_to(np.asarray(f0, dtype=float), x.shape)
    b0 = b1 = b2 = a1 = a2 = 0.0
    for i in range(len(x)):
        if i % 32 == 0:
            w = 2 * math.pi * min(f[i], SR * 0.45) / SR
            cw, sw = math.cos(w), math.sin(w)
            al = sw / (2 * q)
            if kind == "lp":
                b0, b1, b2 = (1 - cw) / 2, 1 - cw, (1 - cw) / 2
            elif kind == "hp":
                b0, b1, b2 = (1 + cw) / 2, -(1 + cw), (1 + cw) / 2
            else:  # band-pass, constant peak gain
                b0, b1, b2 = al, 0.0, -al
            a0 = 1 + al
            a1, a2 = -2 * cw / a0, (1 - al) / a0
            b0, b1, b2 = b0 / a0, b1 / a0, b2 / a0
        xi = x[i]
        yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, xi, y1, yi
        y[i] = yi
    return y


def t_axis(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def norm(x: np.ndarray, peak_db: float) -> np.ndarray:
    m = np.max(np.abs(x)) or 1.0
    return x / m * db(peak_db)


def fades(x: np.ndarray, a: float = 0.003, r: float = 0.01) -> np.ndarray:
    n = len(x)
    ai, ri = max(1, int(a * SR)), max(1, int(r * SR))
    x[:ai] *= np.linspace(0, 1, ai)
    x[-ri:] *= np.linspace(1, 0, ri)
    return x


def noise(dur: float, seed: int) -> np.ndarray:
    return np.random.default_rng(seed).standard_normal(int(dur * SR))


# ---------- the sounds ----------

def drop(seed: int = 1) -> np.ndarray:
    """A water drop: a short rising 'plip', a smaller second bubble, a soft splash."""
    t = t_axis(0.35)
    f = 520 + 1100 * (1 - np.exp(-t / 0.028))
    ph = 2 * np.pi * np.cumsum(f) / SR
    plip = np.sin(ph) * np.exp(-t / 0.045)
    t2 = np.clip(t - 0.035, 0, None)
    f2 = 900 + 900 * (1 - np.exp(-t2 / 0.02))
    bub = np.sin(2 * np.pi * np.cumsum(f2) / SR) * np.exp(-t2 / 0.03) * (t >= 0.035) * 0.35
    spl = biquad(noise(0.35, seed), "bp", 3000, 1.0, passes=2) * np.exp(-t / 0.07) * 0.35
    return fades(plip + bub + spl)


def whoosh(dur: float = 1.4, start_hz: float = 2600, end_hz: float = 500, seed: int = 2) -> np.ndarray:
    """Air passing: band-passed noise with a falling centre, slow rise and long fall."""
    t = t_axis(dur)
    f = start_hz * (end_hz / start_hz) ** (t / dur)
    x = biquad(noise(dur, seed), "bp", f, 1.1, passes=2)
    e = np.minimum(1, t / (0.3 * dur)) * np.exp(-np.clip(t - 0.3 * dur, 0, None) / (0.35 * dur))
    return fades(x * e, 0.01, 0.05)


def vibrate() -> np.ndarray:
    """A phone vibrating on a table: two short buzzes."""
    t = t_axis(1.0)
    hum = np.sin(2 * np.pi * 165 * t) + 0.35 * np.sin(2 * np.pi * 495 * t) + 0.15 * np.sin(2 * np.pi * 825 * t)
    am = 0.75 + 0.25 * np.sin(2 * np.pi * 28 * t)
    gate = ((t > 0.0) & (t < 0.38)) | ((t > 0.58) & (t < 0.96))
    g = biquad(gate.astype(float), "lp", 60)
    return fades(biquad(hum * am * g, "lp", 1200, passes=2), 0.005, 0.03)


def step(seed: int) -> np.ndarray:
    """One soft footstep: a low thud and a light scuff."""
    t = t_axis(0.22)
    thud = biquad(noise(0.22, seed), "lp", 320, passes=3) * np.exp(-t / 0.035) + 0.6 * np.sin(2 * np.pi * 85 * t) * np.exp(-t / 0.03)
    scuff = biquad(noise(0.22, seed + 50), "bp", 2400, 0.9, passes=2) * np.exp(-np.clip(t - 0.01, 0, None) / 0.025) * 0.15
    return fades(thud + scuff, 0.002, 0.02)


def breath(dur: float = 1.1, seed: int = 4) -> np.ndarray:
    """A calm in-breath."""
    t = t_axis(dur)
    x = biquad(noise(dur, seed), "bp", 900 + 500 * t / dur, 0.8, passes=2)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    return fades(x * e, 0.02, 0.05)


def tap() -> np.ndarray:
    """A finger on glass."""
    t = t_axis(0.08)
    click = biquad(noise(0.08, 9), "hp", 2500) * np.exp(-t / 0.004)
    body = np.sin(2 * np.pi * 1150 * t) * np.exp(-t / 0.012) * 0.5
    return fades(click + body, 0.0005, 0.01)


def pop() -> np.ndarray:
    """A small UI pop for chips."""
    t = t_axis(0.09)
    f = 700 + 600 * (1 - np.exp(-t / 0.015))
    return fades(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.025), 0.002, 0.01)


# ---------- placement: (scene, seconds after the scene is fully visible, sound, peak dBFS) ----------

def cues() -> list:
    c = [
        ("F01", 0.05, drop(1), -21),
        ("F02", -0.1, whoosh(1.5, 2800, 600, 2), -25),
        ("F04", 0.55, drop(3), -18),
        ("F05", 0.0, vibrate(), -25),
        ("F09", 0.1, whoosh(1.6, 1500, 250, 5), -30),
        ("F11", -0.3, breath(1.1, 4), -24),
        ("F16", 0.6, tap(), -22),
        ("F19", 0.4, pop(), -30),
        ("F21", 0.35, pop(), -30),
    ]
    for k in range(8):  # the footprints appear every 0.2 s from 0.4 s into the scene
        c.append(("F06", 0.0 + k * 0.2, step(20 + k), -29 + (k % 2)))
    return c


def build(timing_path: Path, out_path: Path) -> float:
    timing = json.loads(timing_path.read_text(encoding="utf-8"))
    slots = {s["id"]: s for s in timing["slots"]}
    last = timing["slots"][-1]
    total = last["start"] + last["len"] + FADE
    buf = np.zeros(int(total * SR) + SR)
    for sid, offset, snd, peak in cues():
        if sid not in slots:
            continue
        at = slots[sid]["start"] + FADE + offset
        i = max(0, int(at * SR))
        x = norm(snd, peak)
        buf[i:i + len(x)] += x[: max(0, len(buf) - i)]
    buf = buf[: int(total * SR)]
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(out_path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return total


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    total = build(Path(sys.argv[1]), Path(sys.argv[2]))
    print(f"{sys.argv[2]}: {total:.1f} s of effects")
    if "--mix" in sys.argv:
        voice, out = sys.argv[sys.argv.index("--mix") + 1: sys.argv.index("--mix") + 3]
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-i", voice, "-i", sys.argv[2],
            "-filter_complex", "[1:a]aresample=48000,pan=stereo|c0=c0|c1=c0[s];[0:a][s]amix=inputs=2:normalize=0,alimiter=limit=0.89[o]",
            "-map", "[o]", "-ar", "48000", out,
        ], check=True)
        print(f"{out}: voice + effects")


if __name__ == "__main__":
    main()
