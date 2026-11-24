"""
The review gallery of the «الرحلة كاملة» carousels (JR-nn): one page per hundred blessings, one carousel per blessing.

  python3 tools/build_gallery.py 1          # out/gallery/1/: blessings 1–100 (whatever has been rendered so far)
  python3 tools/build_gallery.py 2          # out/gallery/2/: blessings 101–200 …

Reads out/stills/JR-nn-k/*_portrait.png (node tools/render-stills.cjs --ids JR-01-,… --formats portrait) and writes
index.html (from tools/gallery-template.html) and img/: one strip JPEG per carousel per theme, the slides side by side,
so a hundred blessings stay under the page's file limit (511 files). The page shows a slide with CSS background
positions. A slide that prints a verse, hadith or scholar's words is marked «يُراجَع قبل النشر»; a tadabbur that
quotes one («…» or ﴿…﴾) is marked too. Notes for the owner, per blessing, are in data/scripts/jr_notes.json.
"""
import html
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_plan import CTA_LIVE  # noqa: E402

AR = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")
ar = lambda n: str(n).translate(AR)  # noqa: E731
esc = html.escape
TAGS = "#نعمة_اليوم #الحمد_لله #تطبيق_الحمد"
W = 540  # one slide in the strip, px (shown at most 300 css px wide)
TAIL = ["visualize", "deepen", "return", "hamd", "journal"]
KIND = {"cover": "الغلاف", "verse": "الآية", "hadith": "الحديث", "tadabbur": "التدبّر", "quote": "قول العالم",
        "visualize": "تخيّل الغياب", "deepen": "إدراك الأثر", "return": "العودة", "hamd": "الحمد والدعاء", "journal": "سجلّ الحمد"}


def content() -> dict:
    s = (ROOT / "kit" / "content.js").read_text(encoding="utf-8")
    return json.loads(s[s.index("=") + 1:].strip().rstrip(";"))


def slides(pk: dict) -> tuple[list, dict]:
    """The JR slides in kit/bundle.js order, and why each flagged slide needs review."""
    kinds = ["cover", "verse"] + (["hadith"] if pk.get("hadith") else []) + ["tadabbur"] + (["quote"] if pk.get("quote") else [])
    kinds = (kinds + [t for t in pk["stepTypes"] if t != "ground"] + ["journal"])[:10]
    t = pk["tadabbur"]
    review = {k + 1: KIND[s] for k, s in enumerate(kinds) if s in ("verse", "hadith", "quote") or (s == "tadabbur" and ("﴿" in t or "«" in t))}
    return kinds, review


def strip(out: Path, nn: str, count: int, th: str) -> str | None:
    dst = out / "img" / f"JR-{nn}_{th}.jpg"
    srcs = [ROOT / "out" / "stills" / f"JR-{nn}-{k}" / f"JR-{nn}-{k}_{th}_portrait.png" for k in range(1, count + 1)]
    if not all(x.exists() for x in srcs):
        return None
    if not dst.exists() or dst.stat().st_mtime < max(x.stat().st_mtime for x in srcs):
        ims = [Image.open(x).convert("RGB") for x in srcs]
        h = round(ims[0].height * W / ims[0].width)
        im = Image.new("RGB", (W * count, h))
        for k, s in enumerate(ims):
            im.paste(s.resize((W, h), Image.LANCZOS), (k * W, 0))
        im.save(dst, quality=80, optimize=True, progressive=True)
    return f"img/{dst.name}"


def card(out: Path, C: dict, n: int, notes: dict) -> str | None:
    pk = C["bundle"].get(str(n))
    if not pk:
        return None
    nn = f"{n:02d}"
    kinds, review = slides(pk)
    count = len(kinds)
    sheets = {th: strip(out, nn, count, th) for th in ("layl", "nahar")}
    if not all(sheets.values()):
        return None
    lis = []
    for k in range(1, count + 1):
        pos = f"{(k - 1) / (count - 1) * 100:.4f}% 0"
        faces = "".join(f'<div class="art art-{th} sl" data-bg="{src}" style="background-size:{count * 100}% 100%;background-position:{pos}"></div>'
                        for th, src in sheets.items())
        badge = f'<span class="slide-flag" title="{esc(review[k])}">يُراجَع قبل النشر</span>' if k in review else ""
        lis.append(f'<li class="slide" role="img" aria-label="شريحة {ar(k)} من {ar(count)}: {KIND[kinds[k - 1]]}">{faces}{badge}</li>')
    cap = (f"رحلةٌ كاملة مع {pk['title']}… في {ar(count)} صفحات.\n{pk['opening']}\n"
           f"من الآية{' والحديث' if pk.get('hadith') else ''}، إلى أن تتخيّل غيابها، ثم تعود إليها فتحمد الله.\n"
           f"اقرأها على مهل، واكتب جواب السؤال الأخير في التعليقات.\n{CTA_LIVE}\n{TAGS}")
    flagged = "، ".join(dict.fromkeys(review.values()))
    note = notes.get(str(n))
    meta = [f"{ar(count)} شرائح", esc(pk["catLabel"]), f"[{esc(pk['verse']['surahName'])}: {ar(pk['verse']['ayah'])}{'–' + ar(pk['verse']['ayahEnd']) if pk['verse'].get('ayahEnd') else ''}]"]
    if not pk.get("hadith"):
        meta.append("بلا حديث")
    return (f'<article class="bl" id="n{n}" aria-labelledby="n{n}-h"><header class="bl-head">'
            f'<span class="num">{ar(n)}</span><div class="bl-t"><h2 id="n{n}-h">{esc(pk["title"])}</h2>'
            f'<p class="op">{esc(pk["opening"])}</p><p class="meta">{" · ".join(meta)}</p></div></header>'
            + (f'<p class="note"><b>يحتاج قرارك:</b> {esc(note)}</p>' if note else "")
            + f'<div class="car" data-car><div class="car-bar"><span class="car-count" aria-live="polite">{ar(1)} / {ar(count)}</span>'
            f'<span class="rv">يُراجَع: {esc(flagged)}</span>'
            f'<div class="car-btns"><button type="button" class="nav" data-dir="prev" aria-label="الشريحة السابقة">→</button>'
            f'<button type="button" class="nav" data-dir="next" aria-label="الشريحة التالية">←</button></div></div>'
            f'<ol class="strip" tabindex="0" aria-label="شرائح {esc(pk["title"])}">{"".join(lis)}</ol></div>'
            f'<details class="cap"><summary>نصّ المنشور</summary><p id="cap-{nn}">{esc(cap).replace(chr(10), "<br>")}</p>'
            f'<button type="button" class="copy" data-copy="{nn}">نسخ</button></details></article>')


def main() -> None:
    page = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    lo, hi = (page - 1) * 100 + 1, page * 100
    out = ROOT / "out" / "gallery" / str(page)
    (out / "img").mkdir(parents=True, exist_ok=True)
    C = content()
    notes_path = ROOT / "data" / "scripts" / "jr_notes.json"
    notes = json.loads(notes_path.read_text(encoding="utf-8")) if notes_path.exists() else {}
    cards, done = [], []
    for n in range(lo, hi + 1):
        c = card(out, C, n, notes)
        if c:
            cards.append(c)
            done.append(n)
    titles = {b["n"]: b["short"] for b in C["blessings"]}
    grid = "".join(f'<a class="cell on" href="#n{n}" title="{esc(titles.get(n, ""))}">{ar(n)}</a>' if n in done
                   else f'<span class="cell" aria-hidden="true">{ar(n)}</span>' for n in range(lo, hi + 1))
    tpl = (ROOT / "tools" / "gallery-template.html").read_text(encoding="utf-8")
    html_out = (tpl.replace("{{RANGE}}", f"{ar(lo)}–{ar(hi)}").replace("{{DONE}}", ar(len(done)))
                .replace("{{GRID}}", grid).replace("{{CARDS}}", "".join(cards)))
    (out / "index.html").write_text(html_out, encoding="utf-8")
    used = {f"JR-{n:02d}_{th}.jpg" for n in done for th in ("layl", "nahar")}
    for f in (out / "img").iterdir():
        if f.name not in used:
            f.unlink()
    size = sum(f.stat().st_size for f in out.rglob("*") if f.is_file())
    print(f"{out.relative_to(ROOT)}/index.html: {len(done)} carousels ({done[0] if done else '-'}…{done[-1] if done else '-'}), "
          f"{len(used)} strips, {size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
