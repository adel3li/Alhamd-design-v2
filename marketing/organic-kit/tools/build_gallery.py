"""
The review gallery of a blessing's four carousels: one page per hundred blessings, four tabs per blessing:
«الرحلة كاملة» (JR), «غابت… ثم عادت» (GH), «جرّبها الآن» (TR), «من الشاشة الرئيسية» (HS).

  python3 tools/build_gallery.py 1                    # out/gallery/1/: blessings 1–100 (whatever has been rendered so far)
  python3 tools/build_gallery.py 2                    # out/gallery/2/: blessings 101–200 …
  python3 tools/build_gallery.py 1 --local --out DIR  # the copy on the owner's computer, with 4K / Full HD download buttons
                                                      # that link downloads/<nn>/*.zip beside it (tools/export_package.py)

Reads out/stills/<id>-nn-k/*_portrait.png (node tools/render-stills.cjs --ids JR-01-,GH-01-,TR-01-,HS-01-,… --formats
portrait) and writes index.html (from tools/gallery-template.html) and img/: one strip JPEG per blessing per theme,
every slide of its carousels side by side, so a hundred blessings stay under the page's file limit (511 files). The
page shows a slide with CSS background positions; a blessing shows the carousels that have been rendered, JR first. A slide that prints a verse, hadith or scholar's words is marked «يُراجَع قبل النشر»; a tadabbur that
quotes one («…» or ﴿…﴾) is marked too. Notes for the owner, per blessing, are in data/scripts/jr_notes.json (1–100)
and jr_notes_<k>.json (hundred k).
"""
import html
import json
import re
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


KIND.update({"app": "شاشة التطبيق", "gh-gone": "غابت", "gh-back": "ثم عادت", "tr-open": "البداية", "tr-cta": "الختام",
             "ground": "التهيئة", "tr-hamd": "الحمد"})
REVIEWED = ("verse", "hadith", "quote")
# the four carousels of a blessing, in the order the page shows them (id prefix, tab label)
CAROUSELS = [("JR", "الرحلة كاملة"), ("GH", "غابت… ثم عادت"), ("TR", "جرّبها الآن"), ("HS", "من الشاشة الرئيسية")]


def kinds_of(cid: str, pk: dict) -> list:
    """The slides of one carousel, in the order kit/bundle.js and kit/stills.js draw them."""
    card = ["cover", "verse"] + (["hadith"] if pk.get("hadith") else []) + ["tadabbur"] + (["quote"] if pk.get("quote") else [])
    if cid == "JR":
        return (card + [t for t in pk["stepTypes"] if t != "ground"] + ["journal"])[:10]
    if cid == "HS":
        return card + ["app"]
    if cid == "GH":
        return ["gh-gone", "gh-back"]
    return ["tr-open"] + ["ground", "visualize", "deepen", "return", "tr-hamd"][:len(pk["steps"])] + ["tr-cta"]


def review_of(kinds: list, pk: dict) -> dict:
    """Slide number → why it needs review: a verse, hadith or scholar's words, or a tadabbur that quotes one."""
    t = pk["tadabbur"]
    return {k + 1: KIND[s] for k, s in enumerate(kinds) if s in REVIEWED or (s == "tadabbur" and ("﴿" in t or "«" in t))}


def files(cid: str, nn: str, count: int, th: str) -> list:
    return [ROOT / "out" / "stills" / f"{cid}-{nn}-{k}" / f"{cid}-{nn}-{k}_{th}_portrait.png" for k in range(1, count + 1)]


def strip(out: Path, nn: str, parts: list, th: str) -> str:
    """Every slide of the blessing's carousels side by side in one JPEG (one file per theme keeps a hundred under the page's limit)."""
    dst = out / "img" / f"B-{nn}_{th}.jpg"
    srcs = [f for cid, kinds in parts for f in files(cid, nn, len(kinds), th)]
    if not dst.exists() or dst.stat().st_mtime < max(x.stat().st_mtime for x in srcs) or Image.open(dst).width != W * len(srcs):
        ims = [Image.open(x).convert("RGB") for x in srcs]
        h = round(ims[0].height * W / ims[0].width)
        im = Image.new("RGB", (W * len(ims), h))
        for k, x in enumerate(ims):
            im.paste(x.resize((W, h), Image.LANCZOS), (k * W, 0))
        im.save(dst, quality=80, optimize=True, progressive=True)
    return f"img/{dst.name}"


def captions(pk: dict, count: dict) -> dict:
    t, op, q = pk["title"], pk["opening"], re.sub(r"^اكتب:\s*", "", pk["prompt"])
    return {
        "JR": f"رحلةٌ كاملة مع {t}… في {ar(count.get('JR', 10))} صفحات.\n{op}\nمن الآية{' والحديث' if pk.get('hadith') else ''}، إلى أن تتخيّل غيابها، ثم تعود إليها فتحمد الله.\nاقرأها على مهل، واكتب جواب السؤال الأخير في التعليقات.\n{CTA_LIVE}\n{TAGS}",
        "GH": f"تخيَّل لحظة…\n{pk['steps'][1]}\nاسحب ←\n\n{t}: {op}\n{CTA_LIVE}\n{TAGS}",
        "TR": f"جرّبها الآن: دقيقتان مع {t}.\nاقرأ كلَّ صفحةٍ ببطء… ثم اسحب.\nهكذا يأخذك «الحمد» كلَّ يوم إلى نعمةٍ واحدة.\n{CTA_LIVE}\n{TAGS}",
        "HS": f"{t}… كما تصلك في «الحمد».\nآيتها، وحديثها، ووقفاتٌ في أثرها.\nاحفظ المنشور وارجع إليه الليلة.\n{CTA_LIVE}\n{TAGS}",
    }


def card(out: Path, C: dict, n: int, notes: dict, local: bool) -> str | None:
    pk = C["bundle"].get(str(n))
    if not pk:
        return None
    nn = f"{n:02d}"
    parts = [(cid, kinds_of(cid, pk)) for cid, _ in CAROUSELS]
    parts = [(cid, kinds) for cid, kinds in parts if all(f.exists() for th in ("layl", "nahar") for f in files(cid, nn, len(kinds), th))]
    if not any(cid == "JR" for cid, _ in parts):
        return None
    sheets = {th: strip(out, nn, parts, th) for th in ("layl", "nahar")}
    total = sum(len(k) for _, k in parts)
    count = {cid: len(k) for cid, k in parts}
    caps = captions(pk, count)
    label = dict(CAROUSELS)
    tabs, cars, at = [], [], 0
    for j, (cid, kinds) in enumerate(parts):
        review = review_of(kinds, pk)
        lis = []
        for k in range(1, len(kinds) + 1):
            pos = f"{at / (total - 1) * 100:.4f}% 0"
            at += 1
            faces = "".join(f'<div class="art art-{th} sl" data-bg="{src}" style="background-size:{total * 100}% 100%;background-position:{pos}"></div>' for th, src in sheets.items())
            badge = f'<span class="slide-flag" title="{esc(review[k])}">يُراجَع قبل النشر</span>' if k in review else ""
            lis.append(f'<li class="slide" role="img" aria-label="شريحة {ar(k)} من {ar(len(kinds))}: {KIND[kinds[k - 1]]}">{faces}{badge}</li>')
        flagged = "، ".join(dict.fromkeys(review.values()))
        tid = f"n{n}-{cid.lower()}"
        tabs.append(f'<button type="button" role="tab" id="{tid}-t" aria-controls="{tid}" aria-selected="{str(j == 0).lower()}" tabindex="{0 if j == 0 else -1}">'
                    f'{label[cid]}<span class="cnt">{ar(len(kinds))}</span></button>')
        cars.append(f'<div class="car" data-car role="tabpanel" id="{tid}" aria-labelledby="{tid}-t"{"" if j == 0 else " hidden"}>'
                    f'<div class="car-bar"><span class="car-count" aria-live="polite">{ar(1)} / {ar(len(kinds))}</span>'
                    f'<span class="rv">{("يُراجَع: " + esc(flagged)) if flagged else "نصوص التطبيق كما هي"}</span>'
                    f'<div class="car-btns"><button type="button" class="nav" data-dir="prev" aria-label="الشريحة السابقة">→</button>'
                    f'<button type="button" class="nav" data-dir="next" aria-label="الشريحة التالية">←</button></div></div>'
                    f'<ol class="strip" tabindex="0" aria-label="{label[cid]}: {esc(pk["title"])}">{"".join(lis)}</ol>'
                    f'<details class="cap"><summary>نصّ المنشور</summary><p id="cap-{nn}-{cid}">{esc(caps[cid]).replace(chr(10), "<br>")}</p>'
                    f'<button type="button" class="copy" data-copy="{nn}-{cid}">نسخ</button></details></div>')
    note = notes.get(str(n))
    v = pk["verse"]
    meta = [f"{ar(len(parts))} كاروسيلات · {ar(total)} شريحة", esc(pk["catLabel"]), f"[{esc(v['surahName'])}: {ar(v['ayah'])}{'–' + ar(v['ayahEnd']) if v.get('ayahEnd') else ''}]"]
    if not pk.get("hadith"):
        meta.append("بلا حديث")
    dl = ""
    if local and (out / "downloads" / nn / f"alhamd_{nn}_4k.zip").exists():  # the copy on the owner's computer links the ZIPs beside it
        dl = (f'<div class="dl"><a class="dl-b" href="downloads/{nn}/alhamd_{nn}_4k.zip" download>تحميل 4K<small>٢١٦٠×٢٧٠٠</small></a>'
              f'<a class="dl-b" href="downloads/{nn}/alhamd_{nn}_fullhd.zip" download>تحميل Full HD<small>١٠٨٠×١٣٥٠</small></a></div>')
    return (f'<article class="bl" id="n{n}" aria-labelledby="n{n}-h"><header class="bl-head">'
            f'<span class="num">{ar(n)}</span><div class="bl-t"><h2 id="n{n}-h">{esc(pk["title"])}</h2>'
            f'<p class="op">{esc(pk["opening"])}</p><p class="meta">{" · ".join(meta)}</p></div></header>{dl}'
            + (f'<p class="note"><b>يحتاج قرارك:</b> {esc(note)}</p>' if note else "")
            + f'<div class="tabs" role="tablist" aria-label="كاروسيلات {esc(pk["title"])}">{"".join(tabs)}</div>{"".join(cars)}</article>')


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    page = int(args[0]) if args else 1
    lo, hi = (page - 1) * 100 + 1, page * 100
    local = "--local" in sys.argv
    out = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else ROOT / "out" / "gallery" / (f"{page}-local" if local else str(page))
    (out / "img").mkdir(parents=True, exist_ok=True)
    C = content()
    # notes for the owner: data/scripts/jr_notes.json (1–100) and jr_notes_<k>.json (hundred k), one file per hundred
    notes = {k: v for f in sorted((ROOT / "data" / "scripts").glob("jr_notes*.json")) for k, v in json.loads(f.read_text(encoding="utf-8")).items()}
    cards, done = [], []
    for n in range(lo, hi + 1):
        c = card(out, C, n, notes, local)
        if c:
            cards.append(c)
            done.append(n)
    titles = {b["n"]: b["short"] for b in C["blessings"]}
    grid = "".join(f'<a class="cell on" href="#n{n}" title="{esc(titles.get(n, ""))}">{ar(n)}</a>' if n in done
                   else f'<span class="cell" aria-hidden="true">{ar(n)}</span>' for n in range(lo, hi + 1))
    tpl = (ROOT / "tools" / "gallery-template.html").read_text(encoding="utf-8")
    html_out = (tpl.replace("{{RANGE}}", f"{ar(lo)}–{ar(hi)}").replace("{{DONE}}", ar(len(done)))
                .replace("{{GRID}}", grid)
                .replace("{{DRAFT}}", '<p class="note">نصوص النِّعَم بعد المئة الأولى مسوّدةٌ في التطبيق تنتظر مراجعتك، فالكاروسيل يتبعها كما هي الآن.</p>' if page > 1 else "").replace("{{LOCAL}}", "local" if local else "online").replace("{{CARDS}}", "".join(cards)))
    (out / "index.html").write_text(html_out, encoding="utf-8")
    used = {f"B-{n:02d}_{th}.jpg" for n in done for th in ("layl", "nahar")}
    for f in (out / "img").iterdir():
        if f.name not in used:
            f.unlink()
    size = sum(f.stat().st_size for f in out.rglob("*") if f.is_file())
    print(f"{out.relative_to(ROOT)}/index.html: {len(done)} carousels ({done[0] if done else '-'}…{done[-1] if done else '-'}), "
          f"{len(used)} strips, {size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
