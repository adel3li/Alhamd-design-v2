"""
The demo page of a blessing package: every format for one blessing on one page, with captions and review flags.

  python3 tools/build_demo.py 5

Reads what the renderers wrote (out/stills, out/reels, out/audio/<nn>) and writes out/demo/<nn>/:
index.html (built from tools/demo-template.html) and its assets: images at 720 px (JPEG), reels at 720×1280,
the audio as is. Full-size files stay in out/stills and out/reels.
"""
import html
import json
import re
import shutil
import subprocess
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


def content() -> dict:
    s = (ROOT / "kit" / "content.js").read_text(encoding="utf-8")
    return json.loads(s[s.index("=") + 1:].strip().rstrip(";"))


class Page:
    def __init__(self, n: int):
        self.n, self.nn = n, f"{n:02d}"
        self.out = ROOT / "out" / "demo" / self.nn
        if self.out.exists():
            shutil.rmtree(self.out)
        for d in ("img", "vid", "aud"):
            (self.out / d).mkdir(parents=True)
        self.files = 0

    def img(self, cid: str, th: str, f: str, w: int = 720) -> str | None:
        src = ROOT / "out" / "stills" / cid / f"{cid}_{th}_{f}.png"
        if not src.exists():
            return None
        dst = self.out / "img" / f"{cid}_{th}_{f}.jpg"
        im = Image.open(src).convert("RGB")
        im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(dst, quality=84, optimize=True, progressive=True)
        self.files += 1
        return f"img/{dst.name}"

    def vid(self, rid: str, th: str) -> tuple[str, str] | None:
        src = ROOT / "out" / "reels" / rid / f"{rid}_{th}_story.mp4"
        if not src.exists():
            return None
        dst = self.out / "vid" / f"{rid}_{th}.mp4"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vf", "scale=720:1280:flags=lanczos", "-c:v", "libx264", "-preset", "slow",
                        "-crf", "25", "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(dst)], check=True)
        poster = self.out / "vid" / f"{rid}_{th}.jpg"
        shutil.copy(src.with_suffix(".jpg"), poster)
        self.files += 2
        return f"vid/{dst.name}", f"vid/{poster.name}"

    def aud(self, name: str) -> str | None:
        src = ROOT / "out" / "audio" / self.nn / name
        if not src.exists():
            return None
        shutil.copy(src, self.out / "aud" / name)
        self.files += 1
        return f"aud/{name}"


def duration(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def mmss(s: float) -> str:
    return ar(f"{int(s // 60)}:{int(round(s % 60)):02d}")


# ---------- building blocks ----------

def pair(p: Page, cid: str, f: str, alt: str) -> str:
    """One creative in both themes; CSS shows the theme picked in the page's «ليل / نهار» switch."""
    out = []
    for th in ("layl", "nahar"):
        src = p.img(cid, th, f)
        if src:
            out.append(f'<img class="art art-{th}" src="{src}" alt="{esc(alt)}" loading="lazy" decoding="async">')
    return "".join(out)


def caption(text: str, cid: str) -> str:
    return (f'<div class="cap"><div class="cap-head"><span>نصّ المنشور</span>'
            f'<button type="button" class="copy" data-copy="{esc(cid)}" aria-label="نسخ نص المنشور">نسخ</button></div>'
            f'<p id="cap-{esc(cid)}">{esc(text).replace(chr(10), "<br>")}</p></div>')


def flag(kind: str) -> str:
    return {"review": '<span class="tag tag-review">يُراجَع قبل النشر</span>',
            "voice": '<span class="tag tag-voice">صوت مؤقّت</span>',
            "ready": '<span class="tag tag-ready">جاهز</span>'}[kind]


def section(num: int, sid: str, title: str, lead: str, body: str, meta: str = "", flags: str = "") -> str:
    return (f'<section class="sec" id="{sid}" aria-labelledby="{sid}-h"><header class="sec-head">'
            f'<span class="step" aria-hidden="true">{ar(num)}</span><div class="sec-titles"><h2 id="{sid}-h">{title}</h2>'
            f'<p class="lead">{lead}</p>{f"<p class=meta>{meta}</p>" if meta else ""}</div>'
            f'<div class="flags">{flags}</div></header>{body}</section>')


def carousel(p: Page, cid: str, count: int, alts: list, review: set, cap: str) -> str:
    slides = []
    for k in range(1, count + 1):
        sid = f"{cid}-{k}"
        badge = '<span class="slide-flag">يُراجَع قبل النشر</span>' if k in review else ""
        slides.append(f'<li class="slide" aria-label="شريحة {ar(k)} من {ar(count)}">{pair(p, sid, "portrait", alts[k - 1] if k - 1 < len(alts) else "")}{badge}</li>')
    return (f'<div class="car" data-car><div class="car-bar"><span class="car-count" aria-live="polite">{ar(1)} / {ar(count)}</span>'
            f'<div class="car-btns"><button type="button" class="nav" data-dir="prev" aria-label="الشريحة السابقة">→</button>'
            f'<button type="button" class="nav" data-dir="next" aria-label="الشريحة التالية">←</button></div></div>'
            f'<ol class="strip" tabindex="0" aria-label="شرائح الكاروسيل">{"".join(slides)}</ol></div>' + caption(cap, cid))


def main() -> None:
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    C = content()
    pk = C["bundle"][str(n)]
    base = next(b for b in C["blessings"] if b["n"] == n)
    b = {**pk, "steps": base["steps"], "duaa": base["duaa"], "prompt": base["prompt"]}
    p = Page(n)
    nn = p.nn
    v = b["verse"]
    ref = f"[{v['surahName']}: {ar(v['ayah'])}]"
    q = re.sub(r"^اكتب:\s*", "", b["prompt"])
    has_h, has_q = bool(b.get("hadith")), bool(b.get("quote"))
    secs = []

    # 1 — single designs
    singles = [
        ("NB-" + nn, "story", "نعمة اليوم", "ستوري ٩:١٦ · حالة واتساب", f"نعمة اليوم: {b['title']}. {b['opening']}"),
        ("NB-" + nn, "portrait", "نعمة اليوم", "منشور ٤:٥ · إنستجرام وفيسبوك", ""),
        ("NB-" + nn, "square", "نعمة اليوم", "مربّع ١:١ · قناة واتساب وتيليجرام", ""),
        ("AY-" + nn, "portrait", "آية النعمة", "منشور ٤:٥ · الجمعة", f"﴿{v['text']}﴾ {ref}"),
        ("ND-" + nn, "portrait", "دعاء اليوم", "منشور ٤:٥", b["duaa"]),
        ("NP-" + nn, "portrait", "سؤال للتأمّل", "منشور ٤:٥ · للتعليقات", q),
        ("SQ-" + nn, "story", "ستوري سؤال", "ستوري ٩:١٦ · مع ملصق «سؤال»", q),
    ]
    cards = []
    for cid, f, name, use, alt in singles:
        rv = cid.startswith("AY-")
        cards.append(f'<figure class="single single-{f}">{pair(p, cid, f, alt or name)}<figcaption><b>{name}</b><span>{use}</span>{flag("review") if rv else ""}</figcaption></figure>')
    single_caps = (caption(f"{b['title']}.\n{b['opening']}\nفي «الحمد» نعمةٌ كلَّ يوم، ودقيقتان من التأمّل معها.\n{CTA_LIVE}\n{TAGS}", f"NB-{nn}") +
                   caption(f"﴿{v['text']}﴾ {ref}\nجمعةٌ مباركة… واجعل صلاتك اليوم موعدًا لا عادة.\n#جمعة_مباركة #الحمد_لله #تطبيق_الحمد", f"AY-{nn}") +
                   caption(f"سؤال الليلة من «{b['title']}»:\n{q}\nاكتبها في التعليقات… أو في دفترك.\n{TAGS}", f"NP-{nn}"))
    secs.append(section(1, "single", "تصميمٌ واحد", "أبسط شكل: صورة واحدة تُقرأ في ثانيتين. نعمة اليوم، آيتها، دعاؤها، وسؤالها.",
                        f'<div class="singles">{"".join(cards)}</div><div class="caps">{single_caps}</div>',
                        "ستّ تصاميم من نصوص التطبيق، بثيمَي «ليل» و«نهار»، وبكل المقاسات (المعروض هنا بعضها).", flag("ready")))

    # 2 — two-slide carousel
    secs.append(section(2, "gh", "كاروسيل صغير: «غابت… ثم عادت»", "فكرة التطبيق كلّها في سحبة واحدة: الشريحة الأولى تُغيّب النعمة، والثانية تُعيدها.",
                        carousel(p, f"GH-{nn}", 2, [b["steps"][1], b["steps"][3]], set(),
                                 f"تخيَّل لحظة…\n{b['steps'][1]}\nاسحب ←\n\n{b['title']}: {b['opening']}\n{CTA_LIVE}\n{TAGS}"),
                        "شريحتان ٤:٥ · إنستجرام وفيسبوك ولينكدإن", flag("ready")))

    # 3 — try it now (existing TR)
    secs.append(section(3, "tr", "كاروسيل «جرّبها الآن»", "الوقفات الخمس كما في التطبيق، صفحةً صفحة: يقرأها المتابع ببطء ثم يسحب.",
                        carousel(p, f"TR-{nn}", 7, [], set(), f"جرّبها الآن: دقيقتان مع {b['title']}.\nاقرأ كلَّ صفحةٍ ببطء… ثم اسحب.\nهكذا يأخذك «الحمد» كلَّ يوم إلى نعمةٍ واحدة.\n{CTA_LIVE}\n{TAGS}"),
                        "٧ شرائح ٤:٥ · من الحزمة السابقة", flag("ready")))

    # 4 — home screen carousel
    hs = ["cover", "verse"] + (["hadith"] if has_h else []) + ["tadabbur"] + (["quote"] if has_q else []) + ["app"]
    hs_review = {k + 1 for k, s in enumerate(hs) if s in ("verse", "hadith", "quote")}
    secs.append(section(4, "hs", "كاروسيل «من الشاشة الرئيسية»", "بطاقة النعمة كما تظهر في التطبيق: الآية، ثم الحديث، ثم «وقفات في أثر النعمة»، ثم قول العالم، وأخيرًا الشاشة الحقيقية.",
                        carousel(p, f"HS-{nn}", len(hs), [], hs_review,
                                 f"{b['title']}… كما تصلك في «الحمد» اليوم.\nآيتها، وحديثها، ووقفاتٌ في أثرها.\nاحفظ المنشور وارجع إليه قبل صلاتك القادمة.\n{CTA_LIVE}\n{TAGS}"),
                        f"{ar(len(hs))} شرائح ٤:٥", flag("review")))

    # 5 — the whole journey
    jr = ["cover", "verse"] + (["hadith"] if has_h else []) + ["tadabbur"] + (["quote"] if has_q else []) + ["visualize", "deepen", "return", "hamd", "journal"]
    jr = jr[:10]
    jr_review = {k + 1 for k, s in enumerate(jr) if s in ("verse", "hadith", "quote")}
    secs.append(section(5, "jr", "كاروسيل «الرحلة كاملة»", "ما يعيشه المستخدم مع النعمة في التطبيق، من البطاقة إلى سجلّ الحمد، في عشر شرائح (الحدّ الأقصى).",
                        carousel(p, f"JR-{nn}", len(jr), [], jr_review,
                                 f"رحلةٌ كاملة مع {b['title']}… في عشر صفحات.\nمن الآية والحديث، إلى أن تتخيّل غيابها، ثم تعود إليها فتحمد الله.\nاقرأها على مهل، واكتب جواب السؤال الأخير في التعليقات.\n{CTA_LIVE}\n{TAGS}"),
                        "١٠ شرائح ٤:٥", flag("review")))

    # 6 — «رحلتي» stage
    st = b.get("stage")
    if st:
        jid = f"JM-{st['id']}"
        secs.append(section(6, "jm", f"كاروسيل «رحلتي»: {esc(st['title'])}", f"المنزل الذي فيه {b['title']} في «رحلتي»: سبع محطّات، لكلٍّ منها «عمل اليوم».",
                            carousel(p, jid, 2 + len(st["stations"]), [], set(),
                                     f"{st['title']}: سبع نِعَم… وسبعة أعمالٍ صغيرة.\nمحطّةٌ كلَّ يوم في «رحلتي»، بالسرعة التي تناسبك.\nأيّ محطّةٍ تبدأ بها؟\n{CTA_LIVE}\n#رحلتي #الحمد_لله #تطبيق_الحمد"),
                            f"{ar(2 + len(st['stations']))} شرائح ٤:٥ · نصوص «رحلتي» نفسها ما زالت قيد المراجعة في التطبيق", flag("ready")))

    # 7 — reels
    reels = []
    for rid, th, name, use, cap in [
        (f"NR-{nn}", "layl", "ريل نصّي قصير", "بلا تعليق صوتي · يُفهم والصوت مغلق", f"{b['title']}… تخيّلها غائبةً لحظة، ثم عُد إليها.\n{b['opening']}\nفي «الحمد» دقيقتان معها كلَّ يوم.\n{CTA_LIVE}\n{TAGS}"),
        (f"AN-{nn}", "layl", "ريل أنيميشن", "رسمٌ بخطٍّ واحد يتحرّك مع الفكرة: مواعيد اليوم الخمسة، ثم بابٌ يُغلق… ويُفتح", f"{b['opening']}\nتخيَّل أن الباب أُغلق…\nثم عُد. الباب مفتوح.\n{CTA_LIVE}\n{TAGS}"),
        (f"AN-{nn}", "nahar", "ريل أنيميشن («نهار»)", "النسخة نفسها بثيم «نهار»", ""),
        (f"VV-{nn}", "layl", "وقفة صوتية (فيديو)", "الوقفات الخمس بصوتٍ هادئ وعلى توقيت التطبيق · ريلز ويوتيوب شورتس", f"دقيقةٌ ونصف مع {b['title']}.\nضع السمّاعة، وأغمض عينيك إن استطعت.\n{CTA_LIVE}\n{TAGS}"),
    ]:
        r = p.vid(rid, th)
        if not r:
            continue
        secs_len = duration(ROOT / "out" / "reels" / rid / f"{rid}_{th}_story.mp4")
        fl = flag("voice") if rid.startswith("VV") else ""
        reels.append(f'<figure class="reel"><div class="phone"><video controls playsinline preload="none" poster="{r[1]}" src="{r[0]}" aria-label="{esc(name)}"></video></div>'
                     f'<figcaption><b>{name}</b><span>{use}</span><span class="dur">{mmss(secs_len)} · ٩:١٦</span>{fl}</figcaption>{caption(cap, rid + "-" + th) if cap else ""}</figure>')
    secs.append(section(7, "reels", "ريلز", "ثلاثة أشكال من الفيديو القصير: نصٌّ متحرّك، وأنيميشن، ونسخةٌ مسموعة من الوقفات.",
                        f'<div class="reels">{"".join(reels)}</div>', "١٠٨٠×١٩٢٠ · ٣٠ إطارًا في الثانية · بلا موسيقى", flag("ready") + flag("voice")))

    # 8 — audio
    wq, pc = p.aud("waqfa.mp3"), p.aud("podcast.mp3")
    cover = pair(p, f"PC-{nn}", "square", f"غلاف حلقة {b['title']}")
    script_md = (ROOT / "out" / "audio" / nn / "podcast_script.md")
    rows = []
    if script_md.exists():
        for line in script_md.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\| ([٠-٩\d]+:\d\d|\d+:\d\d) \| (.*?) \| (.*?) \| (.*) \|$", line)
            if m and m.group(1) != "الوقت":
                kind = m.group(3)
                cls = "r-sacred" if "شرعي" in kind or "قيد" in kind else "r-quran" if "تلاوة" in kind else "r-draft" if "مسوّدة" in kind else "r-app"
                rows.append(f'<tr class="{cls}"><td class="tc">{ar(m.group(1))}</td><td>{esc(m.group(2))}</td><td>{esc(m.group(4))}</td></tr>')
    wq_len = duration(ROOT / "out" / "audio" / nn / "waqfa.mp3")
    pc_len = duration(ROOT / "out" / "audio" / nn / "podcast.mp3")
    audio = (f'<div class="audio-grid"><div class="aud-card"><h3>وقفة صوتية</h3><p>الوقفات الخمس مقروءةً على توقيت التطبيق (١٠ ثم ٢٠ ثم ٢٠ ثم ١٥ ثم ١٥ ثانية)، مع أصواتٍ طبيعية خافتة. لقناة واتساب وSpotify، أو مع صورةٍ ثابتة على يوتيوب.</p>'
             f'<audio controls preload="none" src="{wq}"></audio><p class="meta">{mmss(wq_len)} · MP3</p>{flag("voice")}</div>'
             f'<div class="aud-card pod"><div class="pod-cover">{cover}</div><div><h3>بودكاست: «وقفات في أثر النعمة»</h3><p>حلقة {b["title"]}: المطلع، ثم الآية بصوت قارئ، ثم الحديث، والتدبّر، وقول ابن القيم، ثم الوقفات الخمس معًا، فالدعاء، وسؤالٌ للسجلّ.</p>'
             f'<audio controls preload="none" src="{pc}"></audio><p class="meta">{mmss(pc_len)} · MP3</p>{flag("voice")}{flag("review")}</div></div></div>'
             f'<details class="script"><summary>نصّ الحلقة بالتوقيت</summary><div class="tbl"><table><thead><tr><th>الوقت</th><th>المقطع</th><th>النص</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div>'
             f'<p class="meta">الأبيض من التطبيق، والمائل مسوّدة لنصّ الحلقة تحتاج موافقتك، والمعلَّم بالبرتقالي نصٌّ قيد المراجعة.</p></details>')
    secs.append(section(8, "audio", "صوت: وقفة وبودكاست", "النعمة مسموعة: مقطعٌ قصير للاستماع اليومي، وحلقةٌ أطول تجمع البطاقة كلّها والوقفات.", audio, "", flag("voice")))

    h = b.get("hadith") or {}
    review = [
        ("الحديث", f"النصّ في التطبيق «{h.get('source', '')}» بلا رقم، وفيه ردّ الصحابة مختصرٌ إلى «قالوا: لا». في صحيح مسلم (٦٦٧) الردّ «قالوا: لا يبقى من دَرَنه شيء». يُطابَق النصّ والرقم قبل النشر، ولم نغيّر شيئًا في التطبيق.") if has_h else None,
        ("قول ابن القيم", "مسجَّلٌ في التطبيق «بتصرّف» لا بنصّه، فكتبنا تحته «بتصرّف». الأفضل أن يُستبدل بنصّه من «أسرار الصلاة» بعد التحقّق، أو يُكتفى بالمعنى دون نسبةٍ حرفية.") if has_q else None,
        ("الآية", f"{ref} بالرسم العثماني من quran.com، وطابقنا حروفها مع Tanzil، وهي المقطع نفسه الذي يعرضه التطبيق مع علامات الوقف. تُراجَع كلّ بطاقة آية قبل نشرها."),
        ("التلاوة في البودكاست", "تسجيل الشيخ مشاري العفاسي من quran.com، لغرض العرض فقط. قبل النشر: إذنٌ صريح أو مصدرٌ مرخّص، أو قارئٌ تختارونه."),
        ("الصوت", "صوتٌ آليّ مؤقّت (Microsoft) ليُسمَع الشكل. النسخة النهائية بصوتٍ بشري، ويُراجَع نطق الحديث والدعاء فيها. القرآن لا يُقرأ بصوتٍ آليّ أبدًا."),
        ("نصّ البودكاست", "جمل الربط بين المقاطع (الترحيب، التمهيد، الختام) مسوّدةٌ كتبناها، وما سواها منقولٌ حرفيًا من التطبيق."),
    ]
    review_html = "".join(f"<li><b>{esc(t)}</b><span>{esc(d)}</span></li>" for t, d in [r for r in review if r])

    # the index: the ladder from smallest to largest
    ladder = [("single", "تصميم واحد", "٦"), ("gh", "كاروسيل صغير", "٢"), ("tr", "جرّبها الآن", "٧"), ("hs", "الشاشة الرئيسية", ar(len(hs))),
              ("jr", "الرحلة كاملة", ar(len(jr))), ("jm", "رحلتي", ar(2 + len(st["stations"])) if st else ""), ("reels", "ريلز", "٣"), ("audio", "صوت", "٢")]
    toc = "".join(f'<li><a href="#{a}"><span class="toc-n">{ar(k + 1)}</span><span class="toc-t">{t}</span><span class="toc-c">{c}</span></a></li>' for k, (a, t, c) in enumerate(ladder))

    tpl = (ROOT / "tools" / "demo-template.html").read_text(encoding="utf-8")
    page = (tpl.replace("{{TITLE}}", esc(b["title"])).replace("{{OPENING}}", esc(b["opening"])).replace("{{CAT}}", esc(b["catLabel"]))
            .replace("{{TOC}}", toc).replace("{{SECTIONS}}", "".join(secs)).replace("{{REVIEW}}", review_html))
    (p.out / "index.html").write_text(page, encoding="utf-8")
    size = sum(f.stat().st_size for f in p.out.rglob("*") if f.is_file())
    print(f"out/demo/{nn}/index.html: {p.files} assets, {size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
