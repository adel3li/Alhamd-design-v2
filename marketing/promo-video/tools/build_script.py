"""
Writes the voice-over script from storyboard.json.

  python3 tools/build_script.py

Outputs (committed, small text files):
  script.md                  the script to read: direction, numbered lines, delivery notes
  script/voiceover.txt       the 19 lines, one per line, for Google AI Studio / Gemini speech
  script/voiceover.ssml      the same with pauses, for Google Cloud Text-to-Speech
  script/hooks.txt           the six optional lines of the alternative hooks
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AR = "٠١٢٣٤٥٦٧٨٩"


def ar(n: int) -> str:
    return "".join(AR[int(d)] for d in f"{n:02d}")


def ssml_line(text: str) -> str:
    t = text.replace("«", "").replace("»", "").strip().rstrip("…").strip()
    t = re.sub(r"\s*…\s*", '<break time="450ms"/> ', t).strip()
    return t


def main() -> None:
    sb = json.loads((ROOT / "storyboard.json").read_text(encoding="utf-8"))
    sc = sb["script"]
    order = [f for a in sb["acts"] for f in a["frames"]]
    num = {fid: i + 1 for i, fid in enumerate(order)}
    lines = [c for c in sc["cues"] if c.get("n")]

    out = ROOT / "script"
    out.mkdir(exist_ok=True)

    # plain text for AI Studio / Gemini speech: one line per cue, a blank line between cues
    (out / "voiceover.txt").write_text("\n\n".join(c["text"] for c in lines) + "\n", encoding="utf-8")

    # SSML for Cloud TTS: short pause at «…», one second between lines so the file splits cleanly
    body = []
    for c in lines:
        line = ssml_line(c["text"])
        if c["frames"][0] == "F13":
            line = f'<prosody rate="80%">{line}</prosody>'
        body.append(f"  {line}\n  <break time=\"1000ms\"/>")
    ssml = '<speak>\n<prosody rate="92%">\n' + "\n".join(body) + "\n</prosody>\n</speak>\n"
    (out / "voiceover.ssml").write_text(ssml, encoding="utf-8")

    hooks = []
    for h in sb["hooks"]:
        hooks.append(f"# {h['name']}")
        hooks.extend(h["vo"])
        hooks.append("")
    (out / "hooks.txt").write_text("\n".join(hooks), encoding="utf-8")

    md = [
        f"# سكريبت فيديو «الحمد»: {sb['title']}",
        "",
        f"{sc['status']} · {sc['duration']} · فصحى · {ar(len(lines))} جملة",
        "",
        "## طريقة الأداء",
        "",
        *[f"- {d}" for d in sc["direction"]],
        "",
        "## النص",
        "",
        "| # | المشهد | الجملة | الأداء |",
        "|---|---|---|---|",
    ]
    for c in sc["cues"]:
        scenes = "، ".join(ar(num[f]) for f in c["frames"])
        if c.get("silence"):
            md.append(f"| — | {scenes} | *صمت* | {c['note']} |")
        else:
            md.append(f"| {ar(c['n'])} | {scenes} | {c['text']} | {c['note']} |")
    md += [
        "",
        "## لو هتطلّع الصوت من جوجل",
        "",
        "**Google AI Studio (توليد الكلام):** حط ده في تعليمات الأسلوب (style instructions)،",
        "وحط محتوى [`script/voiceover.txt`](script/voiceover.txt) في النص.",
        "",
        f"> {sc['gemini_style']}",
        "",
        "**Google Cloud Text-to-Speech:** استخدم [`script/voiceover.ssml`](script/voiceover.ssml) مع صوت عربي (ar-XA).",
        "فيه وقفة قصيرة عند «…» وثانية بين كل جملة.",
        "",
        "## تسليم ملف الصوت",
        "",
        *[f"- {d}" for d in sc["delivery"]],
        "",
        "## البدايات البديلة (اختياري)",
        "",
    ]
    for h in sb["hooks"]:
        md.append(f"**{h['name']}:** " + " / ".join(h["vo"]))
        md.append("")
    md += ["## اللي مشيت عليه", "", *[f"- {a}" for a in sc["assumptions"]], ""]
    (ROOT / "script.md").write_text("\n".join(md), encoding="utf-8")
    words = sum(len(c["text"].replace("…", " ").split()) for c in lines)
    print(f"script.md + script/: {len(lines)} lines, {words} words")


if __name__ == "__main__":
    main()
