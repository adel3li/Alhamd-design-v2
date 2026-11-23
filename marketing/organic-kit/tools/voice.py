"""
Voice for a blessing package: the guided pause («وقفة») and a podcast episode.

  python3 tools/voice.py 5            # «نعمة الصلاة»

Writes, under out/audio/<nn>/:
  waqfa.mp3            the five pauses read aloud on the app's own clock (10, 20, 20, 15, 15 s), over quiet
                       natural sound, no music (about 90 s): for WhatsApp, Spotify, YouTube Shorts
  waqfa_voice.wav      the voice alone on the same clock; the voiced reel (VV-<nn>) mixes it with its own sound
  podcast.mp3          the episode from data/scripts/podcast_<nn>.json, or else the shared data/scripts/podcast.json
  podcast_script.md    the episode as read, with timecodes, for review
and kit/voice.js (window.VOICE): when each line starts and each word is spoken, for the voiced reel.

The voice is a placeholder: Microsoft's neural Arabic voice through edge-tts, until a person records it.
The Quran is never synthesised. The verse is a recording by a reciter (quran.com audio); its use in
published audio needs permission. Every other sacred or quoted text is read verbatim from kit/content.js.
"""
import asyncio
import hashlib
import json
import re
import ssl
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parent / "promo-video" / "tools"))
import sfx  # noqa: E402

SR = sfx.SR
CA = "/root/.ccr/ca-bundle.crt"
VOICE = "ar-SA-HamedNeural"
CACHE = ROOT / "out" / "audio" / "_cache"


# ---------- sources ----------

def content() -> dict:
    s = (ROOT / "kit" / "content.js").read_text(encoding="utf-8")
    return json.loads(s[s.index("=") + 1:].strip().rstrip(";"))


def tts(text: str, voice: str = VOICE, rate: str = "-10%") -> tuple[np.ndarray, list]:
    """Synthesise one line (cached). Returns mono samples at SR and the words with their start times."""
    import edge_tts
    import edge_tts.communicate as cm
    if Path(CA).exists():  # the session's TLS proxy; harmless elsewhere
        cm._SSL_CTX = ssl.create_default_context(cafile=CA)
    CACHE.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha1(f"{voice}|{rate}|{text}".encode()).hexdigest()[:16]
    mp3, words_f = CACHE / f"{key}.mp3", CACHE / f"{key}.json"
    if not mp3.exists():
        async def go():
            c = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
            audio, words = bytearray(), []
            async for ch in c.stream():
                if ch["type"] == "audio":
                    audio.extend(ch["data"])
                elif ch["type"] == "WordBoundary":
                    words.append([round(ch["offset"] / 1e7, 3), ch["text"]])
            return bytes(audio), words
        for attempt in range(4):
            try:
                audio, words = asyncio.run(go())
                break
            except Exception:  # noqa: BLE001 — retry on network errors
                if attempt == 3:
                    raise
        mp3.write_bytes(audio)
        words_f.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    return decode(mp3), json.loads(words_f.read_text(encoding="utf-8"))


MARKS = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF\u0640]")


def skeleton(t: str) -> str:
    """Letters only, as tools/fetch_verses.py compares two copies of a verse."""
    t = MARKS.sub("", t)
    for a, b in (("ٱ", "ا"), ("أ", "ا"), ("إ", "ا"), ("آ", "ا"), ("ى", "ي"), ("ة", "ه")):
        t = t.replace(a, b)
    return re.sub(r"[^ء-ي]", "", t)


def speak(text: str, b: dict, voice: str = VOICE, rate: str = "-10%") -> tuple[np.ndarray, list, bool]:
    """A line from the app, read aloud. Words between ﴿ ﴾ are Quran: they are never synthesised. When they are the
    blessing's own verse the reciter's recording takes their place; otherwise a short silence does (and is reported).
    Returns samples, word timings (only for a line without Quran) and whether a verse was replaced."""
    parts = re.split(r"(﴿[^﴾]*﴾)", text)
    if len(parts) == 1:
        x, words = tts(text, voice=voice, rate=rate)
        return x, words, False
    out = []
    for part in parts:
        if part.startswith("﴿"):
            v = b["verse"]
            same = skeleton(part) == skeleton(v["full"])
            x = peak(recitation(v["surah"], v["ayah"]), -3) if same else silence(1.2)
            if not same:
                print(f"  note: a verse inside a line is not the blessing's verse, left silent: {part}")
            out += [silence(0.3), x, silence(0.3)]
        elif re.search(r"[ء-ي]", part):
            x, _ = tts(part.strip(" —-:،"), voice=voice, rate=rate)
            out.append(peak(x, -3))
    return np.concatenate(out), [], True


def decode(path: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    # trim the synthesiser's leading and trailing silence
    nz = np.nonzero(np.abs(x) > 0.004)[0]
    return x[max(0, nz[0] - int(0.03 * SR)): nz[-1] + int(0.12 * SR)] if len(nz) else x


def recitation(surah: int, ayah: int, reciter: int = 7) -> np.ndarray:
    """A recorded recitation of one verse (quran.com; 7 = Mishary Rashid Alafasy)."""
    CACHE.mkdir(parents=True, exist_ok=True)
    mp3 = CACHE / f"recitation_{reciter}_{surah:03d}{ayah:03d}.mp3"
    if not mp3.exists():
        ctx = ssl.create_default_context(cafile=CA) if Path(CA).exists() else None
        get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "alhamd-kit"}), context=ctx, timeout=60).read()  # noqa: E731
        meta = json.loads(get(f"https://api.quran.com/api/v4/recitations/{reciter}/by_ayah/{surah}:{ayah}"))
        mp3.write_bytes(get(f"https://verses.quran.com/{meta['audio_files'][0]['url']}"))
    return decode(mp3)


# ---------- assembly ----------

def peak(x: np.ndarray, db: float) -> np.ndarray:
    return sfx.norm(x, db)


def silence(sec: float) -> np.ndarray:
    return np.zeros(int(sec * SR))


def place(buf: np.ndarray, x: np.ndarray, at: float) -> np.ndarray:
    i = int(at * SR)
    if i + len(x) > len(buf):
        buf = np.concatenate([buf, np.zeros(i + len(x) - len(buf))])
    buf[i:i + len(x)] += x
    return buf


def export(buf: np.ndarray, out: Path, lufs: float = -16.0) -> None:
    wav = out.with_suffix(".tmp.wav")
    sfx.write_wav(np.clip(buf, -1, 1), wav)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(wav), "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11",
                    "-ar", "48000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "128k", str(out)], check=True)
    wav.unlink()


STEP_SOUND = {  # quiet natural sound under each pause, as in the reels
    "ground": [(0.0, "breath", -30, {"dur": 1.6})],
    "visualize": [(0.0, "wind", -31, {"dur": 5.0})],
    "deepen": [(0.4, "heartbeat", -31, {})],
    "return": [(0.0, "birds", -33, {"dur": 2.4}), (0.2, "glint", -33, {})],
    "hamd": [(0.0, "glint", -33, {})],
}


def steps_timeline(b: dict, rate: str, tail: float = 2.5) -> tuple[np.ndarray, np.ndarray, list]:
    """The five pauses on the app's clock: each line starts its pause; the pause lasts the app's
    durationSec, or the line plus a breath if the line is longer. Returns voice, effects, segments."""
    voice, fx, segs, t = np.zeros(0), np.zeros(0), [], 0.0
    for k, (line, kind, secs) in enumerate(zip(b["steps"], b["stepTypes"], b["stepSecs"])):
        x, words, _ = speak(line, b, rate=rate)
        x = peak(x, -3)
        length = max(float(secs), len(x) / SR + tail)
        voice = place(voice, x, t)
        for at, name, pk, params in STEP_SOUND.get(kind, []):
            fx = place(fx, peak(sfx.SOUNDS[name](params), pk), t + at)
        segs.append({"k": f"step{k + 1}", "type": kind, "start": round(t, 3), "len": round(length, 3),
                     "voice": round(len(x) / SR, 3), "text": line, "words": words})
        t += length
    n = int(t * SR)
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    fx = np.pad(fx, (0, max(0, n - len(fx))))[:n]
    return voice, fx, segs


def build_waqfa(b: dict, out: Path) -> dict:
    """The guided pause: the title, the five pauses, a last breath."""
    rate = "-14%"
    intro, intro_w = tts(f"{b['title']}… وقفةٌ من تطبيق «الحمد».", rate=rate)
    intro = peak(intro, -3)
    lead, intro_len = 0.9, max(4.2, len(intro) / SR + 2.0)
    v_steps, fx_steps, segs = steps_timeline(b, rate)
    end_len = 3.2
    total = lead + intro_len + len(v_steps) / SR + end_len
    voice = place(np.zeros(int(total * SR)), intro, lead)
    voice = place(voice, v_steps, lead + intro_len)
    fx = place(np.zeros(int(total * SR)), peak(sfx.breath(1.4), -32), 0.1)
    fx = place(fx, fx_steps, lead + intro_len)
    fx = place(fx, peak(sfx.drop(), -30), total - end_len + 0.4)
    bed = peak(sfx.air(total), -44)[: len(voice)]
    export(voice + fx[: len(voice)] + bed, out / "waqfa.mp3")
    sfx.write_wav(np.clip(voice, -1, 1), out / "waqfa_voice.wav")
    for s in segs:
        s["start"] = round(s["start"] + lead + intro_len, 3)
    return {"audio": f"../out/audio/{out.name}/waqfa_voice.wav", "total": round(total, 3),
            "intro": {"start": lead, "len": round(intro_len, 3), "text": f"{b['title']}… وقفةٌ من تطبيق «الحمد».", "words": intro_w},
            "steps": segs, "end": {"start": round(total - end_len, 3), "len": end_len}}


HADITH_SOURCE = {"متفق عليه": "متفقٌ عليه.", "صحيح البخاري": "رواه البخاري.", "صحيح مسلم": "رواه مسلم."}


def fill(text: str, b: dict) -> str:
    """The shared script's slots, filled from the blessing: {title} {surah} {hadithSource} {quoteIntro}."""
    q = b.get("quote") or {}
    if q.get("scholar"):
        intro = f"ومن كلام {q['scholar']} رحمه الله" + (f" في «{q['work']}»" if q.get("work") else "") + ("، بمعناه:" if q.get("paraphrase") else ":")
    elif "شرح الحديث" in (q.get("note") or ""):
        intro = "ومما يُستفاد من شرح هذا الحديث:"
    else:
        intro = "ومن كلام أهل العلم، بمعناه:"
    h = b.get("hadith") or {}
    return (text.replace("{title}", b["title"]).replace("{surah}", b["verse"]["surahName"])
            .replace("{hadithSource}", HADITH_SOURCE.get(h.get("source", ""), f"{h.get('source', '')}."))
            .replace("{quoteIntro}", intro))


def build_podcast(b: dict, script: dict, out: Path) -> list:
    rate = script.get("rate", "-8%")
    buf, t, rows = np.zeros(0), 0.0, []
    fx = np.zeros(0)

    def say(text, label, kind="voice"):
        nonlocal buf, t
        x, _, verse = speak(text, b, voice=script.get("voice", VOICE), rate=rate)
        if verse:
            label += " — الآية فيه بصوت القارئ"
        buf = place(buf, peak(x, -3), t)
        rows.append((t, label, kind, text))
        t += len(x) / SR

    for blk in script["blocks"]:
        k = blk["kind"]
        if k == "pause":
            t += blk["sec"]
        elif k == "sfx":
            fx = place(fx, peak(sfx.SOUNDS[blk["name"]]({}), -30), t)
            t += blk.get("sec", 1.0)
        elif k == "voice":
            say(fill(blk["text"], b), blk.get("label", ""))
        elif k == "opening":
            say(b["opening"], "مطلع النعمة (من التطبيق)", "app")
        elif k == "tadabbur":
            say(b["tadabbur"], "وقفات في أثر النعمة (من التطبيق)", "app")
        elif k == "hadith":
            if not b.get("hadith"):
                continue
            say(b["hadith"]["text"], f"الحديث (من التطبيق، {b['hadith']['source']}) — قيد المراجعة", "sacred")
        elif k == "quote":
            if not b.get("quote"):
                continue
            say(b["quote"]["text"], f"قول {b['quote']['scholar'] or 'العالم'} (من التطبيق، بمعناه) — قيد المراجعة", "review")
        elif k == "duaa":
            say(b["duaa"], "دعاء اليوم (من التطبيق)", "app")
        elif k == "prompt":
            say(re.sub(r"^اكتب:\s*", "", b["prompt"]), "سؤال السجلّ (من التطبيق)", "app")
        elif k == "verse":
            v = b["verse"]
            x = recitation(v["surah"], v["ayah"])
            buf = place(buf, peak(x, -2), t)
            rows.append((t, f"تلاوة: {v['surahName']} {v['ayah']} (مشاري العفاسي، من quran.com)", "quran", v["full"]))
            t += len(x) / SR
        elif k == "steps":
            v_steps, fx_steps, segs = steps_timeline(b, rate="-12%")
            buf = place(buf, v_steps, t)
            fx = place(fx, fx_steps, t)
            for s in segs:
                rows.append((t + s["start"], f"الوقفة {s['k'][-1]} (من التطبيق)", "app", s["text"]))
            t += len(v_steps) / SR
    n = int(t * SR)
    buf = np.pad(buf, (0, max(0, n - len(buf))))[:n]
    fx = np.pad(fx, (0, max(0, n - len(fx))))[:n]
    export(buf + fx + peak(sfx.air(t), -46)[:n], out / "podcast.mp3")
    return rows, t


def script_md(b: dict, script: dict, rows: list, total: float) -> str:
    mmss = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"  # noqa: E731
    tag = {"voice": "نصّ الحلقة (مسوّدة)", "app": "من التطبيق", "sacred": "نصّ شرعي — قيد المراجعة", "review": "قيد المراجعة", "quran": "تلاوة مسجّلة"}
    out = [f"# {script['show']}: {fill(script['episode'], b)}", "",
           f"المدة: {mmss(total)} · الصوت مؤقّت (صوت آلي) إلى أن يُسجَّل بصوت بشري · التلاوة مسجّلة لقارئ ولا تُولَّد آليًّا.", "",
           "| الوقت | المقطع | النوع | النص |", "|---|---|---|---|"]
    for t, label, kind, text in rows:
        out.append(f"| {mmss(t)} | {label} | {tag.get(kind, kind)} | {text} |")
    return "\n".join(out) + "\n"


def main() -> None:
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    C = content()
    b = C["bundle"][str(n)]
    full = next(x for x in C["blessings"] if x["n"] == n)
    b = {**b, "steps": full["steps"], "duaa": full["duaa"], "prompt": full["prompt"]}
    out = ROOT / "out" / "audio" / f"{n:02d}"
    out.mkdir(parents=True, exist_ok=True)
    timing = build_waqfa(b, out)
    print(f"waqfa: {timing['total']:.1f} s")
    script_path = ROOT / "data" / "scripts" / f"podcast_{n:02d}.json"
    if not script_path.exists():
        script_path = ROOT / "data" / "scripts" / "podcast.json"
    if script_path.exists():
        script = json.loads(script_path.read_text(encoding="utf-8"))
        rows, total = build_podcast(b, script, out)
        (out / "podcast_script.md").write_text(script_md(b, script, rows, total), encoding="utf-8")
        print(f"podcast: {total / 60:.1f} min")
    vf = ROOT / "kit" / "voice.js"
    allv = {}
    if vf.exists():
        s = vf.read_text(encoding="utf-8")
        allv = json.loads(s[s.index("=") + 1:].strip().rstrip(";"))
    allv[str(n)] = {"waqfa": timing}
    vf.write_text("/* generated by tools/voice.py — do not edit */\nwindow.VOICE = " + json.dumps(allv, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"{vf.relative_to(ROOT)} written")


if __name__ == "__main__":
    main()
