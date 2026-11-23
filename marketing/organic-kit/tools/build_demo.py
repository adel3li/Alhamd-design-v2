"""
The demo page of the blessing packages: every format for each packaged blessing, with captions and review flags.

  python3 tools/build_demo.py 5 37        # one page; a switch at the top moves between the blessings

Reads what the renderers wrote (out/stills, out/reels, out/audio/<nn>) and the per-blessing copy in
data/scripts/package_<nn>.json, and writes out/demo/: index.html (from tools/demo-template.html) and its assets:
images at 720 px (JPEG), reels at 720×1280, the audio as is. Full-size files stay in out/stills and out/reels.
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
OUT = ROOT / "out" / "demo"


def content() -> dict:
    s = (ROOT / "kit" / "content.js").read_text(encoding="utf-8")
    return json.loads(s[s.index("=") + 1:].strip().rstrip(";"))


class Assets:
    def __init__(self):
        if OUT.exists():
            shutil.rmtree(OUT)
        for d in ("img", "vid", "aud"):
            (OUT / d).mkdir(parents=True)
        self.files = 0

    def img(self, cid: str, th: str, f: str, w: int = 720) -> str | None:
        src = ROOT / "out" / "stills" / cid / f"{cid}_{th}_{f}.png"
        if not src.exists():
            return None
        dst = OUT / "img" / f"{cid}_{th}_{f}.jpg"
        im = Image.open(src).convert("RGB")
        im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(dst, quality=84, optimize=True, progressive=True)
        self.files += 1
        return f"img/{dst.name}"

    def vid(self, rid: str, th: str) -> tuple[str, str] | None:
        src = ROOT / "out" / "reels" / rid / f"{rid}_{th}_story.mp4"
        if not src.exists():
            return None
        dst = OUT / "vid" / f"{rid}_{th}.mp4"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vf", "scale=720:1280:flags=lanczos", "-c:v", "libx264", "-preset", "slow",
                        "-crf", "25", "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(dst)], check=True)
        poster = OUT / "vid" / f"{rid}_{th}.jpg"
        shutil.copy(src.with_suffix(".jpg"), poster)
        self.files += 2
        return f"vid/{dst.name}", f"vid/{poster.name}"

    def aud(self, nn: str, name: str) -> str | None:
        src = ROOT / "out" / "audio" / nn / name
        if not src.exists():
            return None
        shutil.copy(src, OUT / "aud" / f"{nn}_{name}")
        self.files += 1
        return f"aud/{nn}_{name}"


def duration(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def mmss(s: float) -> str:
    return ar(f"{int(s // 60)}:{int(round(s % 60)):02d}")


# ---------- building blocks ----------

def pair(a: Assets, cid: str, f: str, alt: str) -> str:
    """One creative in both themes; CSS shows the theme picked in the page's «ليل / نهار» switch."""
    out = []
    for th in ("layl", "nahar"):
        src = a.img(cid, th, f)
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


def carousel(a: Assets, cid: str, count: int, review: set, cap: str) -> str:
    slides = []
    for k in range(1, count + 1):
        badge = '<span class="slide-flag">يُراجَع قبل النشر</span>' if k in review else ""
        slides.append(f'<li class="slide" aria-label="شريحة {ar(k)} من {ar(count)}">{pair(a, f"{cid}-{k}", "portrait", "")}{badge}</li>')
    return (f'<div class="car" data-car><div class="car-bar"><span class="car-count" aria-live="polite">{ar(1)} / {ar(count)}</span>'
            f'<div class="car-btns"><button type="button" class="nav" data-dir="prev" aria-label="الشريحة السابقة">→</button>'
            f'<button type="button" class="nav" data-dir="next" aria-label="الشريحة التالية">←</button></div></div>'
            f'<ol class="strip" tabindex="0" aria-label="شرائح الكاروسيل">{"".join(slides)}</ol></div>' + caption(cap, cid))


def card_slides(b: dict, tail: list) -> tuple[list, set]:
    """The slides of the card carousels, in bundle.js order, and the ones that print text under review."""
    kinds = ["cover", "verse"] + (["hadith"] if b.get("hadith") else []) + ["tadabbur"] + (["quote"] if b.get("quote") else []) + tail
    kinds = kinds[:10]
    review = {k + 1 for k, s in enumerate(kinds) if s in ("verse", "hadith", "quote") or (s == "tadabbur" and "﴿" in b["tadabbur"])}
    return kinds, review


def package(a: Assets, C: dict, n: int) -> tuple[str, str]:
    pk = C["bundle"][str(n)]
    base = next(x for x in C["blessings"] if x["n"] == n)
    b = {**pk, "steps": base["steps"], "duaa": base["duaa"], "prompt": base["prompt"]}
    nn = f"{n:02d}"
    copy_path = ROOT / "data" / "scripts" / f"package_{nn}.json"
    cp = json.loads(copy_path.read_text(encoding="utf-8")) if copy_path.exists() else {}
    v = b["verse"]
    ref = f"[{v['surahName']}: {ar(v['ayah'])}]"
    q = re.sub(r"^اكتب:\s*", "", b["prompt"])
    P = f"b{nn}-"  # ids are unique per blessing on the shared page
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
    cards = [f'<figure class="single single-{f}">{pair(a, cid, f, alt or name)}<figcaption><b>{name}</b><span>{use}</span>{flag("review") if cid.startswith("AY-") else ""}</figcaption></figure>'
             for cid, f, name, use, alt in singles]
    caps = (caption(f"{b['title']}.\n{b['opening']}\nفي «الحمد» نعمةٌ كلَّ يوم، ودقيقتان من التأمّل معها.\n{CTA_LIVE}\n{TAGS}", f"NB-{nn}") +
            caption(f"﴿{v['text']}﴾ {ref}\n{cp.get('verseCaption', '')}\n#جمعة_مباركة #الحمد_لله #تطبيق_الحمد", f"AY-{nn}") +
            caption(f"سؤال الليلة من «{b['title']}»:\n{q}\nاكتبها في التعليقات… أو في دفترك.\n{TAGS}", f"NP-{nn}"))
    secs.append(section(1, P + "single", "تصميمٌ واحد", "أبسط شكل: صورة واحدة تُقرأ في ثانيتين. نعمة اليوم، آيتها، دعاؤها، وسؤالها.",
                        f'<div class="singles">{"".join(cards)}</div><div class="caps">{caps}</div>',
                        "ستّ تصاميم من نصوص التطبيق، بثيمَي «ليل» و«نهار»، وبكل المقاسات (المعروض هنا بعضها).", flag("ready")))

    # 2 — two slides
    secs.append(section(2, P + "gh", "كاروسيل صغير: «غابت… ثم عادت»", "فكرة التطبيق كلّها في سحبة واحدة: الشريحة الأولى تُغيّب النعمة، والثانية تُعيدها.",
                        carousel(a, f"GH-{nn}", 2, set(), f"تخيَّل لحظة…\n{b['steps'][1]}\nاسحب ←\n\n{b['title']}: {b['opening']}\n{CTA_LIVE}\n{TAGS}"),
                        "شريحتان ٤:٥ · إنستجرام وفيسبوك ولينكدإن", flag("ready")))

    # 3 — try it now
    secs.append(section(3, P + "tr", "كاروسيل «جرّبها الآن»", "الوقفات الخمس كما في التطبيق، صفحةً صفحة: يقرأها المتابع ببطء ثم يسحب.",
                        carousel(a, f"TR-{nn}", 7, set(), f"جرّبها الآن: دقيقتان مع {b['title']}.\nاقرأ كلَّ صفحةٍ ببطء… ثم اسحب.\nهكذا يأخذك «الحمد» كلَّ يوم إلى نعمةٍ واحدة.\n{CTA_LIVE}\n{TAGS}"),
                        "٧ شرائح ٤:٥ · من الحزمة السابقة", flag("ready")))

    # 4 — the home screen
    hs, hs_review = card_slides(b, ["app"])
    secs.append(section(4, P + "hs", "كاروسيل «من الشاشة الرئيسية»", "بطاقة النعمة كما تظهر في التطبيق: الآية، ثم الحديث، ثم «وقفات في أثر النعمة»، ثم قول العالم، وأخيرًا الشاشة الحقيقية.",
                        carousel(a, f"HS-{nn}", len(hs), hs_review, f"{b['title']}… كما تصلك في «الحمد».\nآيتها، وحديثها، ووقفاتٌ في أثرها.\nاحفظ المنشور وارجع إليه الليلة.\n{CTA_LIVE}\n{TAGS}"),
                        f"{ar(len(hs))} شرائح ٤:٥", flag("review")))

    # 5 — the whole journey
    jr, jr_review = card_slides(b, ["visualize", "deepen", "return", "hamd", "journal"])
    secs.append(section(5, P + "jr", "كاروسيل «الرحلة كاملة»", "ما يعيشه المستخدم مع النعمة في التطبيق، من البطاقة إلى سجلّ الحمد، في عشر شرائح (الحدّ الأقصى).",
                        carousel(a, f"JR-{nn}", len(jr), jr_review, f"رحلةٌ كاملة مع {b['title']}… في عشر صفحات.\nمن الآية والحديث، إلى أن تتخيّل غيابها، ثم تعود إليها فتحمد الله.\nاقرأها على مهل، واكتب جواب السؤال الأخير في التعليقات.\n{CTA_LIVE}\n{TAGS}"),
                        "١٠ شرائح ٤:٥", flag("review")))

    # 6 — «رحلتي»
    st = b.get("stage")
    if st:
        secs.append(section(6, P + "jm", f"كاروسيل «رحلتي»: {esc(st['title'])}", f"المنزل الذي فيه {b['title']} في «رحلتي»: سبع محطّات، لكلٍّ منها «عمل اليوم».",
                            carousel(a, f"JM-{st['id']}", 2 + len(st["stations"]), set(), f"{st['title']}: سبع نِعَم… وسبعة أعمالٍ صغيرة.\nمحطّةٌ كلَّ يوم في «رحلتي»، بالسرعة التي تناسبك.\nأيّ محطّةٍ تبدأ بها؟\n{CTA_LIVE}\n#رحلتي #الحمد_لله #تطبيق_الحمد"),
                            f"{ar(2 + len(st['stations']))} شرائح ٤:٥ · نصوص «رحلتي» نفسها ما زالت قيد المراجعة في التطبيق", flag("ready")))

    # 7 — reels
    anim = cp.get("anim", {})
    reels = []
    for rid, th, name, use, cap in [
        (f"NR-{nn}", "layl", "ريل نصّي قصير", "بلا تعليق صوتي · يُفهم والصوت مغلق", f"{b['title']}… تخيّلها غائبةً لحظة، ثم عُد إليها.\n{b['opening']}\nفي «الحمد» دقيقتان معها كلَّ يوم.\n{CTA_LIVE}\n{TAGS}"),
        (f"AN-{nn}", "layl", "ريل أنيميشن", anim.get("use", "رسمٌ بخطٍّ واحد يتحرّك مع الفكرة"), f"{anim.get('caption', b['opening'])}\n{CTA_LIVE}\n{TAGS}"),
        (f"AN-{nn}", "nahar", "ريل أنيميشن («نهار»)", "النسخة نفسها بثيم «نهار»", ""),
        (f"VV-{nn}", "layl", "وقفة صوتية (فيديو)", "الوقفات الخمس بصوتٍ هادئ وعلى توقيت التطبيق · ريلز ويوتيوب شورتس", f"دقيقةٌ ونصف مع {b['title']}.\nضع السمّاعة، وأغمض عينيك إن استطعت.\n{CTA_LIVE}\n{TAGS}"),
    ]:
        r = a.vid(rid, th)
        if not r:
            continue
        secs_len = duration(ROOT / "out" / "reels" / rid / f"{rid}_{th}_story.mp4")
        reels.append(f'<figure class="reel"><div class="phone"><video controls playsinline preload="none" poster="{r[1]}" src="{r[0]}" aria-label="{esc(name)}"></video></div>'
                     f'<figcaption><b>{name}</b><span>{use}</span><span class="dur">{mmss(secs_len)} · ٩:١٦</span>{flag("voice") if rid.startswith("VV") else ""}</figcaption>'
                     f'{caption(cap, rid + "-" + th) if cap else ""}</figure>')
    secs.append(section(7, P + "reels", "ريلز", "ثلاثة أشكال من الفيديو القصير: نصٌّ متحرّك، وأنيميشن مرسومٌ لهذه النعمة، ونسخةٌ مسموعة من الوقفات.",
                        f'<div class="reels">{"".join(reels)}</div>', "١٠٨٠×١٩٢٠ · ٣٠ إطارًا في الثانية · بلا موسيقى", flag("ready") + flag("voice")))

    # 8 — audio
    wq, pc = a.aud(nn, "waqfa.mp3"), a.aud(nn, "podcast.mp3")
    cover = pair(a, f"PC-{nn}", "square", f"غلاف حلقة {b['title']}")
    rows = []
    script_md = ROOT / "out" / "audio" / nn / "podcast_script.md"
    if script_md.exists():
        for line in script_md.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\| (\d+:\d\d) \| (.*?) \| (.*?) \| (.*) \|$", line)
            if m:
                kind = m.group(3)
                cls = "r-sacred" if "شرعي" in kind or "قيد" in kind else "r-quran" if "تلاوة" in kind else "r-draft" if "مسوّدة" in kind else "r-app"
                rows.append(f'<tr class="{cls}"><td class="tc">{ar(m.group(1))}</td><td>{esc(m.group(2))}</td><td>{esc(m.group(4))}</td></tr>')
    wq_len = duration(ROOT / "out" / "audio" / nn / "waqfa.mp3")
    pc_len = duration(ROOT / "out" / "audio" / nn / "podcast.mp3")
    who = (b.get("quote") or {}).get("scholar") or "أهل العلم"
    audio = (f'<div class="audio-grid"><div class="aud-card"><h3>وقفة صوتية</h3><p>الوقفات الخمس مقروءةً على توقيت التطبيق (١٠ ثم ٢٠ ثم ٢٠ ثم ١٥ ثم ١٥ ثانية)، مع أصواتٍ طبيعية خافتة. لقناة واتساب وSpotify، أو مع صورةٍ ثابتة على يوتيوب.</p>'
             f'<audio controls preload="none" src="{wq}"></audio><p class="meta">{mmss(wq_len)} · MP3</p>{flag("voice")}</div>'
             f'<div class="aud-card pod"><div class="pod-cover">{cover}</div><div><h3>بودكاست: «وقفات في أثر النعمة»</h3><p>حلقة {b["title"]}: المطلع، ثم الآية بصوت قارئ، ثم الحديث، والتدبّر، وكلام {esc(who)}، ثم الوقفات الخمس معًا، فالدعاء، وسؤالٌ للسجلّ.</p>'
             f'<audio controls preload="none" src="{pc}"></audio><p class="meta">{mmss(pc_len)} · MP3</p>{flag("voice")}{flag("review")}</div></div></div>'
             f'<details class="script"><summary>نصّ الحلقة بالتوقيت</summary><div class="tbl"><table><thead><tr><th>الوقت</th><th>المقطع</th><th>النص</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div>'
             f'<p class="meta">الأبيض من التطبيق، والمائل مسوّدة لنصّ الحلقة تحتاج موافقتك، والمعلَّم بالبرتقالي نصٌّ قيد المراجعة.</p></details>')
    secs.append(section(8, P + "audio", "صوت: وقفة وبودكاست", "النعمة مسموعة: مقطعٌ قصير للاستماع اليومي، وحلقةٌ أطول تجمع البطاقة كلّها والوقفات.", audio, "", flag("voice")))

    review = [(r["title"], r["text"]) for r in cp.get("review", [])] + [
        ("الآية", f"{ref} بالرسم العثماني من quran.com، وطابقنا حروفها مع Tanzil، وهي المقطع نفسه الذي يعرضه التطبيق مع علامات الوقف. تُراجَع كلّ بطاقة آية قبل نشرها."),
        ("التلاوة في البودكاست", "تسجيل الشيخ مشاري العفاسي من quran.com، لغرض العرض فقط. قبل النشر: إذنٌ صريح أو مصدرٌ مرخّص، أو قارئٌ تختارونه."),
        ("الصوت", "صوتٌ آليّ مؤقّت (Microsoft) ليُسمَع الشكل. النسخة النهائية بصوتٍ بشري، ويُراجَع نطق الحديث والدعاء فيها. القرآن لا يُقرأ بصوتٍ آليّ أبدًا."),
        ("نصّ البودكاست", "جمل الربط بين المقاطع (الترحيب، التمهيد، الختام) مسوّدةٌ كتبناها، وما سواها منقولٌ حرفيًا من التطبيق."),
    ]
    review_html = "".join(f"<li><b>{esc(t)}</b><span>{esc(d)}</span></li>" for t, d in review)
    ladder = [("single", "تصميم واحد", "٦"), ("gh", "كاروسيل صغير", "٢"), ("tr", "جرّبها الآن", "٧"), ("hs", "الشاشة الرئيسية", ar(len(hs))),
              ("jr", "الرحلة كاملة", ar(len(jr))), ("jm", "رحلتي", ar(2 + len(st["stations"])) if st else ""), ("reels", "ريلز", "٣"), ("audio", "صوت", "٢")]
    toc = "".join(f'<li><a href="#{P}{x}"><span class="toc-n">{ar(k + 1)}</span><span class="toc-t">{t}</span><span class="toc-c">{c}</span></a></li>' for k, (x, t, c) in enumerate(ladder))

    body = (f'<div class="pkg" id="b{nn}" data-pkg="b{nn}">'
            f'<header class="wrap head"><span class="eyebrow">عرضٌ تجريبي · نعمةٌ واحدة بكلّ أشكال المحتوى</span><h1>{esc(b["title"])}</h1>'
            f'<p class="opening">{esc(b["opening"])}</p><p class="intro">من {esc(b["catLabel"])}. كلّ ما هنا مصنوعٌ من نصوص التطبيق نفسها لهذه النعمة، ومرتّبٌ من الأصغر إلى الأكبر: من تصميمٍ واحد إلى حلقة بودكاست. بدّل «ليل / نهار» من الشريط العلوي لترى التصاميم بالثيم الآخر.</p>'
            f'<ol class="toc">{toc}</ol>'
            '<div class="legend"><span><span class="tag tag-ready">جاهز</span>نصوص التطبيق كما هي</span><span><span class="tag tag-review">يُراجَع قبل النشر</span>آية أو حديث أو قول عالم</span><span><span class="tag tag-voice">صوت مؤقّت</span>صوت آليّ للعرض فقط</span></div></header>'
            f'<main class="wrap"><div class="thread">{"".join(secs)}</div>'
            f'<section class="review" aria-labelledby="{P}rv-h"><h2 id="{P}rv-h">قبل النشر</h2><p class="lead">ما يحتاج مراجعةً أو قرارًا منك قبل أن يخرج أيّ شيءٍ من باقة {esc(b["title"])}.</p><ul>{review_html}</ul></section></main></div>')
    return b["short"], body


def main() -> None:
    ns = [int(x) for x in sys.argv[1:]] or [5]
    C = content()
    a = Assets()
    tabs, bodies = [], []
    for n in ns:
        short, body = package(a, C, n)
        tabs.append(f'<a class="pk-tab" href="#b{n:02d}" data-pkg="b{n:02d}">{esc(short)}</a>')
        bodies.append(body)
    tpl = (ROOT / "tools" / "demo-template.html").read_text(encoding="utf-8")
    page = tpl.replace("{{TABS}}", "".join(tabs)).replace("{{PACKAGES}}", "".join(bodies))
    (OUT / "index.html").write_text(page, encoding="utf-8")
    size = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
    print(f"out/demo/index.html: {len(ns)} packages, {a.files} assets, {size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
