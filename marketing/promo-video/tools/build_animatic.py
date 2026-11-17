"""
Builds a timed animatic (moving storyboard) of the main film.

  python3 tools/build_animatic.py            # temp voice from gTTS (Google Translate TTS)
  python3 tools/build_animatic.py --silent   # no voice, default timings

Each frame gets one voice-over line from storyboard.json. The frame stays on screen
for the length of its line plus a small pause, with a slow push-in and a short
cross-fade between frames. The temp voice is only there to feel the pacing; the
final film is cut to the real voice file.

Output: out/animatic.mp4 (720×1280) and out/timings.json.
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from timeline import FADE, VOICE_LEAD, compute_slots  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
FRAMES = OUT / "frames"
TTS = OUT / "tts"
FPS = 30

SILENT = "--silent" in sys.argv


def probe_duration(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(r.stdout.strip())


TEMPO = 1.3  # gTTS reads Arabic slowly; this brings it near a calm human narrator


def tts(fid: str, text: str) -> Path:
    """gTTS line → trimmed, slightly faster WAV (pitch kept)."""
    from gtts import gTTS  # imported lazily so --silent works without it

    TTS.mkdir(parents=True, exist_ok=True)
    mp3 = TTS / f"{fid}.mp3"
    wav = TTS / f"{fid}.wav"
    if not mp3.exists():
        gTTS(text.replace("«", "").replace("»", ""), lang="ar").save(str(mp3))
    if not wav.exists():
        trim = "silenceremove=start_periods=1:start_silence=0.03:start_threshold=-48dB"
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-af",
             f"{trim},areverse,{trim},areverse,atempo={TEMPO}", "-ar", "44100", str(wav)],
            check=True,
        )
    return wav


def main() -> None:
    sb = json.loads((ROOT / "storyboard.json").read_text(encoding="utf-8"))
    order = [f for act in sb["acts"] for f in act["frames"]]

    clips, durations = {}, {}
    if not SILENT:
        for fid in order:
            vo = sb["frames"][fid]["vo"].strip()
            if vo:
                clips[fid] = tts(fid, vo)
                durations[fid] = probe_duration(clips[fid])
    slots = compute_slots(sb, durations)
    for s in slots:
        s["clip"] = str(clips[s["line"]]) if s["line"] else None
        s["vo_dur"] = round(durations.get(s["line"], 0.0), 2) if s["line"] else 0.0
    # slot i is fully visible from start_i + FADE (the cross-fade into it starts at start_i)
    total = slots[-1]["start"] + slots[-1]["len"] + FADE

    cmd = ["ffmpeg", "-y", "-v", "error"]
    for s in slots:
        cmd += ["-loop", "1", "-framerate", str(FPS), "-t", f"{s['len'] + FADE:.3f}", "-i", str(FRAMES / f"{s['id']}.png")]
    clips = [s for s in slots if s["clip"]]
    for s in clips:
        cmd += ["-i", s["clip"]]

    parts = []
    n = len(slots)
    for i, s in enumerate(slots):
        frames = int(round((s["len"] + FADE) * FPS))
        zin = i % 2 == 0  # alternate push-in / gentle pull-out
        z = f"1+0.035*on/{frames}" if zin else f"1.035-0.035*on/{frames}"
        parts.append(
            f"[{i}:v]scale=2160:3840,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps={FPS},"
            f"format=yuv420p,setsar=1[v{i}]"
        )
    prev = "v0"
    for i in range(1, n):
        off = slots[i]["start"]
        parts.append(f"[{prev}][v{i}]xfade=transition=fade:duration={FADE}:offset={off:.3f}[x{i}]")
        prev = f"x{i}"
    parts.append(f"[{prev}]scale=720:1280:flags=lanczos[vout]")

    if clips:
        amix_in = []
        for k, s in enumerate(clips):
            idx = n + k
            delay = int((s["start"] + FADE + VOICE_LEAD) * 1000)
            parts.append(f"[{idx}:a]aresample=44100,adelay={delay}|{delay}[a{k}]")
            amix_in.append(f"[a{k}]")
        parts.append(
            f"{''.join(amix_in)}amix=inputs={len(clips)}:normalize=0,apad,atrim=0:{total:.3f},loudnorm=I=-16:TP=-1.5:LRA=11[aout]"
        )

    cmd += ["-filter_complex", ";".join(parts), "-map", "[vout]"]
    if clips:
        cmd += ["-map", "[aout]", "-c:a", "aac", "-b:a", "128k"]
    out = OUT / ("animatic_silent.mp4" if SILENT else "animatic.mp4")
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            "-t", f"{total:.3f}", str(out)]
    subprocess.run(cmd, check=True)

    (OUT / "timings.json").write_text(
        json.dumps({"fade": FADE, "total": round(total, 2), "slots": slots}, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"{out.name}: {total:.1f}s, {len(slots)} frames")


if __name__ == "__main__":
    main()
