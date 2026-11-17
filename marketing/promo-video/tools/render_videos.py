"""
Renders the silent videos defined in videos.json (no voice-over; sound design only).

  python3 tools/render_videos.py            # all
  python3 tools/render_videos.py V1 V4      # some
  python3 tools/render_videos.py --audio-only   # new sound on the existing pictures

For each video: out/videos/<ID>.mp4 (1080×1920, 30 fps, effects + room tone),
out/videos/<ID>.webp (animated preview, 270×480) and out/videos/<ID>.jpg (poster).
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sfx  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "videos"
FADE = 0.4


AUDIO_ONLY = "--audio-only" in sys.argv  # rebuild the effects and re-mux, keeping the rendered picture


def main() -> None:
    spec = json.loads((ROOT / "videos.json").read_text(encoding="utf-8"))
    wanted = {a for a in sys.argv[1:] if not a.startswith("--")}
    OUT.mkdir(parents=True, exist_ok=True)
    for v in spec["videos"]:
        if wanted and v["id"] not in wanted:
            continue
        vid = v["id"]
        slots, t = [], 0.0
        for sid, length in v["scenes"]:
            slots.append({"id": sid, "start": round(t, 3), "len": length})
            t += length
        timing = OUT / f"{vid}-timing.json"
        timing.write_text(json.dumps({"slots": slots}, ensure_ascii=False), encoding="utf-8")
        audio = OUT / f"{vid}-sfx.wav"
        # no voice to compete with, so the effects peak at -12 dBFS over a -42 dBFS room tone
        total = sfx.build_cues(slots, v["sfx"], audio, bed_db=-42.0, peak_db=-12.0)
        mp4 = OUT / f"{vid}.mp4"
        if AUDIO_ONLY:
            tmp = OUT / f"{vid}.tmp.mp4"
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp4), "-i", str(audio), "-map", "0:v", "-map", "1:a",
                            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{total:.3f}", "-movflags", "+faststart", str(tmp)], check=True)
            tmp.replace(mp4)
        else:
            subprocess.run(["node", str(ROOT / "tools" / "render-motion.cjs"), "--page", "loops.html",
                            "--timing", str(timing), "--audio", str(audio), "--out", str(mp4),
                            "--frames", str(OUT / f"frames_{vid}")], check=True)
        # animated preview for the catalogue page, and a poster frame
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp4), "-vf", "fps=12,scale=270:480:flags=lanczos",
                        "-loop", "0", "-c:v", "libwebp_anim", "-quality", "62", "-compression_level", "6", str(OUT / f"{vid}.webp")], check=True)
        poster_at = v.get("poster", total * 0.62)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{poster_at:.2f}", "-i", str(mp4), "-frames:v", "1",
                        "-vf", "scale=540:960:flags=lanczos", "-q:v", "3", str(OUT / f"{vid}.jpg")], check=True)
        print(f"{vid} {v['name']}: {total:.1f} s")


if __name__ == "__main__":
    main()
