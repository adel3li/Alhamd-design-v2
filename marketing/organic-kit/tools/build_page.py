"""
Builds the review page: the plan, the calendar, the library and the reels.

  python3 tools/build_page.py

Reads plan/plan.json, out/stills/meta.json, out/reels/meta.json and out/package/manifest.json (if packaged).
Writes out/page/index.html, out/page/thumbs-layl.js, out/page/thumbs-nahar.js and out/page/v/*.mp4 (360p previews).
"""
import base64
import io
import json
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "page"

FAMILIES = [
    ("NB", "نعمة اليوم", "بطاقة الصباح لكل نعمةٍ من نِعَم التطبيق الأربعين: للقصص والحالة وقناة واتساب والفيد وبنترست.", "portrait", ""),
    ("NP", "سؤال للتأمّل", "سؤال السجلّ من كل نعمة، لقصة المساء مع ملصق «سؤال».", "square", ""),
    ("ND", "دعاء النعمة", "دعاء كل نعمة كما في التطبيق، لقصة المساء وقناة واتساب.", "square", ""),
    ("PS", "منشورات", "الفكرة، والمزايا بشاشاتٍ حقيقية، والوعد، والأسئلة، والإطلاق، والمواسم. كلٌّ بسبعة مقاسات.", "portrait", "big"),
    ("SV", "آيات الجمعة", "بالرسم العثماني، ومطابَقة مع مصدرين. تُراجَع كلّ بطاقة قبل نشرها.", "square", "big"),
    ("CR", "كاروسيل", "كاروسيلات القيمة والهوية. كل شريحة بمقاس ٤:٥ و٩:١٦ (لصور تيك توك) و١:١.", "portrait", ""),
    ("TR", "جرّبها الآن", "كاروسيل «جرّبها الآن» لاثنتي عشرة نعمة: الوقفات الخمس كما في التطبيق.", "portrait", ""),
    ("ST", "قصص تفاعلية", "استطلاعات واختبارات وأسئلة وقوالب للمتابعين، مع مساحةٍ للملصق.", "story", "big"),
    ("CH", "تحدّي الحمد", "إعلان التحدّي وبطاقات أيامه السبعة.", "portrait", "big"),
    ("CD", "العدّ التنازلي", "من سبعة أيام إلى يوم الإطلاق.", "square", "big"),
    ("BR", "الهوية", "صورة الحساب، وأغلفة القصص المميزة، وأغلفة X وفيسبوك ويوتيوب ولينكدإن (قبل الإطلاق وبعده)، وصورة الرابط.", "avatar", "wide"),
    ("GP", "Google Play", "الصورة الرئيسية وست لقطات للمتجر، بالثيمين لتجربة أيّهما أفضل.", "gpshot", "big"),
    ("WP", "خلفيات", "للهاتف (آيفون وأندرويد) والكمبيوتر — هديةٌ للمتابعين.", "wphone", "big"),
    ("SK", "ملصقات واتساب", "٥١٢×٥١٢ بخلفيةٍ شفافة، وأيقونة الحزمة.", "sticker", ""),
]
BRAND = {"BR", "GP", "WP", "SK"}
PREFER = ["portrait", "square", "story", "avatar", "hl", "link", "gpshot", "gpfeat", "wphone", "sticker", "xhead", "fbcover", "ytban", "licover", "wide"]


def data_uri(path: Path, width: int, q: int = 70) -> str:
    im = Image.open(path)
    im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=q, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def formats_from_kit() -> list:
    js = (ROOT / "kit" / "kit.js").read_text(encoding="utf-8")
    out = []
    for m in re.finditer(r"^\s+(\w+): \{ w: (\d+), h: (\d+),.*?label: '([^']+)', use: '([^']+)' \}", js, re.M):
        out.append({"key": m.group(1), "w": m.group(2), "h": m.group(3), "label": m.group(4), "use": m.group(5)})
    return out


def main() -> None:
    plan = json.loads((ROOT / "plan" / "plan.json").read_text(encoding="utf-8"))
    stills = json.loads((ROOT / "out" / "stills" / "meta.json").read_text(encoding="utf-8"))
    reels_meta = json.loads((ROOT / "out" / "reels" / "meta.json").read_text(encoding="utf-8")) if (ROOT / "out" / "reels" / "meta.json").exists() else {}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "v").mkdir(exist_ok=True)

    # library entries
    lib = {}
    for key, m in stills.items():
        e = lib.setdefault(m["id"], {"id": m["id"], "name": m["name"], "group": m["group"], "family": m.get("family", ""), "kind": "still", "formats": [], "themes": [], "alt": m.get("alt", ""), "review": bool(m.get("review"))})
        if m["format"] not in e["formats"]:
            e["formats"].append(m["format"])
        if m["theme"] not in e["themes"]:
            e["themes"].append(m["theme"])
    planned = {}
    for d in plan["days"]:
        for slot in ("feed", "tiktok", "story_am", "story_mid", "story_pm", "whatsapp", "extra"):
            s = d.get(slot)
            if s:
                planned.setdefault(s["id"], s.get("theme", "layl"))
    # unplanned designs preview in the theme their family is mostly planned in
    from collections import Counter
    fam_th = {}
    for i, th in planned.items():
        fam_th.setdefault(i.split("-")[0], Counter())[th] += 1
    for e in lib.values():
        fam = e["id"].split("-")[0]
        default = fam_th[fam].most_common(1)[0][0] if fam in fam_th else "layl"
        e["prefer"] = planned.get(e["id"], default if default in e["themes"] else e["themes"][0])
        short = e["name"].split(": ", 1)
        e["short"] = short[1] if len(short) > 1 and e["group"] in ("NB", "NP", "ND") else e["name"]

    # thumbnails: one per creative and theme, at the family's primary format
    thumbs = {"layl": {}, "nahar": {}}
    fam_fmt = {k: f for k, _, _, f, _ in FAMILIES}
    for e in lib.values():
        want = fam_fmt.get(e["id"].split("-")[0], "portrait")
        fmt = want if want in e["formats"] else next((f for f in PREFER if f in e["formats"]), e["formats"][0])
        for th in e["themes"]:
            src = ROOT / "out" / "stills" / e["id"] / f"{e['id']}_{th}_{fmt}.png"
            if src.exists():
                w = 520 if fmt in ("xhead", "fbcover", "ytban", "licover", "link", "gpfeat", "wide", "wdesk") else 300
                thumbs[th][e["id"]] = data_uri(src, w)

    # reels: previews and posters
    reels = {}
    nvid = 0
    for key, m in reels_meta.items():
        nvid += 1
        r = reels.setdefault(m["id"], {"id": m["id"], "name": m["name"], "group": m["group"], "seconds": m["seconds"], "files": {}, "square": False, "review": bool(m.get("review")), "alt": m.get("alt", "")})
        if m["format"] == "square":
            r["square"] = True
            continue
        prev = ROOT / "out" / "reels" / m["id"] / f"{key}_preview.mp4"
        if prev.exists():
            dst = OUT / "v" / f"{m['id']}_{m['theme']}.mp4"
            shutil.copyfile(prev, dst)
            r["files"][m["theme"]] = f"v/{dst.name}"
        poster = ROOT / "out" / "reels" / m["id"] / f"{key}.jpg"
        if poster.exists():
            thumbs[m["theme"]]["R:" + m["id"]] = data_uri(poster, 270, 66)
    for r in reels.values():
        r["prefer"] = planned.get(r["id"], "layl")
    reel_list = sorted(reels.values(), key=lambda r: r["id"])

    # families
    fams = []
    for key, title, sub, _, size in FAMILIES:
        ids = sorted(i for i in lib if i.split("-")[0] == key)
        f = {"key": key, "title": title, "sub": sub, "ids": ids, "count": len(ids), "size": size, "brand": key in BRAND}
        if key in ("CR", "TR"):
            groups = {}
            for i in ids:
                groups.setdefault(lib[i]["group"], []).append(i)
            f["carousel"] = True
            f["groups"] = [{"id": g, "name": lib[v[0]]["name"], "ids": sorted(v, key=lambda x: int(x.rsplit("-", 1)[1]))} for g, v in sorted(groups.items())]
            f["count"] = len(groups)
        fams.append(f)

    manifest = ROOT / "out" / "package" / "manifest.json"
    files = json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else []
    data = {"plan": plan, "lib": lib, "families": fams, "reels": reel_list, "formats": formats_from_kit(),
            "counts": {"files": len(stills), "videos": nvid}, "files": files}
    for th, var in (("layl", "TH_L"), ("nahar", "TH_N")):
        (OUT / f"thumbs-{th}.js").write_text(f"window.{var} = " + json.dumps(thumbs[th], separators=(",", ":")) + ";\n", encoding="utf-8")
    html = (ROOT / "tools" / "page.html").read_text(encoding="utf-8").replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    (OUT / "index.html").write_text(html, encoding="utf-8")
    size = sum(p.stat().st_size for p in OUT.rglob("*") if p.is_file())
    print(f"page: {len(lib)} creatives, {len(reel_list)} reels, {sum(len(v) for v in thumbs.values())} thumbs, "
          f"{len(list((OUT / 'v').glob('*.mp4')))} previews, {size / 1e6:.1f} MB "
          f"(index {(OUT / 'index.html').stat().st_size / 1e6:.2f} MB, thumbs {(OUT / 'thumbs-layl.js').stat().st_size / 1e6:.1f}+{(OUT / 'thumbs-nahar.js').stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
