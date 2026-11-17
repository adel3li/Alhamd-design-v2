"""
Sound + encoding for one rendered reel (called by render-reels.cjs with the frames folder).

Sound: the scene cues through promo-video/tools/sfx.py — effects peak at -12 dBFS over a -42 dBFS
room tone, no music, no voice. Picture: H.264 (CRF 20; a touch of grain on «ليل» against banding in the dark gradients), plus a
360p preview for the review page and a poster frame. The frames folder is removed afterwards.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parent / "promo-video" / "tools"))
import sfx  # noqa: E402


def main(frames: Path) -> None:
    job = json.loads((frames / "job.json").read_text(encoding="utf-8"))
    out = Path(job["out"])
    wav = frames / "sfx.wav"
    total = sfx.build_cues(job["slots"], job["cues"], wav, bed_db=-42.0, peak_db=-12.0)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "30", "-i", str(frames / "%05d.jpg"), "-i", str(wav),
                    "-map", "0:v", "-map", "1:a", "-vf", ("noise=alls=2:allf=t," if "_layl_" in job["key"] else "") + "format=yuv420p",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-profile:v", "high",
                    "-c:a", "aac", "-b:a", "160k", "-t", f"{total:.3f}", "-movflags", "+faststart", str(out)], check=True)
    w, h = job["w"], job["h"]
    pw = 360 if w <= h else 640
    ph = round(pw * h / w / 2) * 2
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(out), "-vf", f"scale={pw}:{ph}:flags=lanczos",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "27", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
                    str(out.with_name(out.stem + "_preview.mp4"))], check=True)
    poster_at = job.get("poster", total * 0.55)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{poster_at:.2f}", "-i", str(out), "-frames:v", "1",
                    "-vf", f"scale={pw * 2}:-2:flags=lanczos", "-q:v", "3", str(out.with_suffix(".jpg"))], check=True)
    shutil.rmtree(frames)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
