"""
Times the film to the real voice recording.

  python3 tools/align_voice.py path/to/voice.wav        # one file, the 19 lines in order with ~1 s pauses
  python3 tools/align_voice.py path/to/folder/          # or one file per line, sorted by name (01, 02, …)

Writes:
  out/voice/line_XX.wav     each line, trimmed
  out/final-timings.json    scene starts and lengths for render-motion.cjs
  out/voice-track.wav       the voice placed on the film's timeline, loudness-normalised for social (-14 LUFS)

Then:
  node tools/render-motion.cjs --timing out/final-timings.json --audio out/voice-track.wav --out out/alhamd-promo.mp4
"""
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from timeline import FADE, compute_slots, scene_order, voice_at  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
VOICE = OUT / "voice"
SR = 48000


def run(cmd: list) -> str:
    return subprocess.run(cmd, capture_output=True, text=True, check=True).stderr


def duration(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def speech_segments(wav: Path, noise_db: float, min_gap: float) -> list:
    log = run(["ffmpeg", "-v", "info", "-i", str(wav), "-af", f"silencedetect=noise={noise_db}dB:d={min_gap}", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    total = duration(wav)
    segs, cur = [], 0.0
    for s, e in zip(starts, ends + [total] * (len(starts) - len(ends))):
        if s - cur > 0.15:
            segs.append((cur, s))
        cur = e
    if total - cur > 0.15:
        segs.append((cur, total))
    return segs


def split_single(src: Path, want: int) -> list:
    wav = VOICE / "source.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-ac", "1", "-ar", str(SR), str(wav)], check=True)
    for noise in (-40, -35, -45, -30, -50):
        for gap in (0.7, 0.6, 0.5, 0.8, 0.45, 0.9):
            segs = speech_segments(wav, noise, gap)
            if len(segs) == want:
                print(f"split at {noise} dB, gaps ≥ {gap} s")
                return [(wav, a, b) for a, b in segs]
    raise SystemExit(
        f"Could not find {want} lines in {src.name}. Leave about one second of silence between lines, "
        f"or send one file per line."
    )


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    src = Path(sys.argv[1]).expanduser().resolve()
    sb = json.loads((ROOT / "storyboard.json").read_text(encoding="utf-8"))
    order = scene_order(sb)
    line_frames = [f for f in order if sb["frames"][f]["vo"].strip()]
    VOICE.mkdir(parents=True, exist_ok=True)

    if src.is_dir():
        files = sorted(p for p in src.iterdir() if p.suffix.lower() in {".wav", ".mp3", ".m4a", ".aac", ".ogg", ".flac"})
        if len(files) != len(line_frames):
            raise SystemExit(f"Found {len(files)} audio files, need {len(line_frames)}.")
        parts = [(f, None, None) for f in files]
    else:
        parts = split_single(src, len(line_frames))

    durations, clips = {}, {}
    trim = "silenceremove=start_periods=1:start_silence=0.02:start_threshold=-50dB"
    for k, (fid, (path, a, b)) in enumerate(zip(line_frames, parts), start=1):
        out = VOICE / f"line_{k:02d}.wav"
        cut = ["-ss", f"{max(0.0, a - 0.05):.3f}", "-to", f"{b + 0.08:.3f}"] if a is not None else []
        subprocess.run(["ffmpeg", "-y", "-v", "error", *cut, "-i", str(path), "-af",
                        f"{trim},areverse,{trim},areverse", "-ac", "1", "-ar", str(SR), str(out)], check=True)
        durations[fid] = duration(out)
        clips[fid] = out
        print(f"{k:02d} {fid} {durations[fid]:.2f}s  {sb['frames'][fid]['vo']}")

    # a wrong split shows up as a line far too long or short for its word count
    rate = {f: durations[f] / max(1, len(sb["frames"][f]["vo"].replace("…", " ").split())) for f in line_frames}
    mid = sorted(rate.values())[len(rate) // 2]
    odd = [f for f, r in rate.items() if r > 2.2 * mid or r < mid / 2.2]
    if odd:
        print("check these lines, their length does not fit their words:", ", ".join(odd))

    slots = compute_slots(sb, durations)
    last = slots[-1]
    total = last["start"] + last["len"] + 0.4

    cmd = ["ffmpeg", "-y", "-v", "error"]
    placed = [s for s in slots if s["line"]]
    for s in placed:
        cmd += ["-i", str(clips[s["line"]])]
    chains, labels = [], []
    for i, s in enumerate(placed):
        ms = int(voice_at(s) * 1000)
        chains.append(f"[{i}:a]adelay={ms}|{ms}[a{i}]")
        labels.append(f"[a{i}]")
    chains.append(f"{''.join(labels)}amix=inputs={len(placed)}:normalize=0,apad,atrim=0:{total:.3f},"
                  f"loudnorm=I=-14:TP=-1.5:LRA=11,aresample={SR}[out]")
    cmd += ["-filter_complex", ";".join(chains), "-map", "[out]", "-ac", "2", str(OUT / "voice-track.wav")]
    subprocess.run(cmd, check=True)

    (OUT / "final-timings.json").write_text(json.dumps(
        {"fade": FADE, "total": round(total, 2), "slots": slots}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"final-timings.json + voice-track.wav: {total:.1f} s, {len(placed)} lines")


if __name__ == "__main__":
    main()
