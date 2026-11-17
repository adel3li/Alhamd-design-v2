"""
Packages the rendered kit for delivery.

  python3 tools/package.py

Stills become high-quality JPEG (q92, full colour resolution so thin gold strokes stay crisp);
stickers stay transparent PNG. Some carousels also become PDFs for LinkedIn document posts.
Writes out/package/*.zip, out/package/manifest.json and copies the calendar workbook next to them.
"""
import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STILLS = ROOT / "out" / "stills"
REELS = ROOT / "out" / "reels"
OUT = ROOT / "out" / "package"
STAGE = ROOT / "out" / "deliver"

FOLDERS = {
    "NB": "01-daily/NB-blessing-cards", "NP": "01-daily/NP-reflection-questions", "ND": "01-daily/ND-duaa",
    "PS": "02-posts/PS-single-posts", "SV": "02-posts/SV-friday-verses", "CH": "02-posts/CH-challenge", "CD": "02-posts/CD-countdown",
    "CR": "03-carousels/CR-carousels", "TR": "03-carousels/TR-try-it",
    "ST": "04-stories/ST-interactive",
    "BR": "05-brand/BR-profile-covers", "GP": "05-brand/GP-google-play", "WP": "05-brand/WP-wallpapers", "SK": "05-brand/SK-whatsapp-stickers",
}
ZIPS = [
    ("alhamd-1-daily-cards.zip", ["01-daily"], "بطاقات «نعمة اليوم» وسؤال التأمّل والدعاء للنِّعَم الأربعين (NB · NP · ND)"),
    ("alhamd-2-posts.zip", ["02-posts"], "المنشورات وآيات الجمعة والتحدّي والعدّ التنازلي (PS · SV · CH · CD)"),
    ("alhamd-3-carousels.zip", ["03-carousels"], "الكاروسيلات و«جرّبها الآن» + ملفات PDF للينكدإن (CR · TR)"),
    ("alhamd-4-stories.zip", ["04-stories"], "القصص التفاعلية (ST)"),
    ("alhamd-5-brand-store-wallpapers-stickers.zip", ["05-brand"], "صور الحسابات والأغلفة وصور Google Play والخلفيات وملصقات واتساب (BR · GP · WP · SK)"),
    ("alhamd-6-reels-layl.zip", ["06-reels/layl"], "كل الريلز بثيم «ليل» — ١٠٨٠×١٩٢٠ (+ ١:١ للريلز الرئيسية)"),
    ("alhamd-7-reels-nahar.zip", ["06-reels/nahar"], "كل الريلز بثيم «نهار» — ١٠٨٠×١٩٢٠ (+ ١:١ للريلز الرئيسية)"),
]
LINKEDIN = ["CR-01", "CR-04", "CR-06", "CR-07", "CR-12", "CR-13"]


def human(n: int) -> str:
    return f"{n / 1e6:.0f} MB" if n > 1e6 else f"{n / 1e3:.0f} KB"


def main() -> None:
    meta = json.loads((STILLS / "meta.json").read_text(encoding="utf-8"))
    # stills are converted once (the stage keeps them); reels and zips are rebuilt every run
    shutil.rmtree(STAGE / "06-reels", ignore_errors=True)
    for key, m in meta.items():
        src = STILLS / m["id"] / f"{key}.png"
        if not src.exists():
            continue
        fam = m["id"].split("-")[0]
        folder = STAGE / FOLDERS.get(fam, "99-other") / (m["group"] if fam in ("CR", "TR") else m["id"])
        folder.mkdir(parents=True, exist_ok=True)
        target = folder / f"{key}.{'png' if fam == 'SK' else 'jpg'}"
        if target.exists() and target.stat().st_mtime >= src.stat().st_mtime:
            continue
        im = Image.open(src)
        if fam == "SK":
            im.save(folder / f"{key}.png", optimize=True)
            if m["format"] == "sticker":  # WhatsApp also takes WebP stickers (under 100 KB)
                im.save(folder / f"{key}.webp", "WEBP", quality=90, method=6)
        else:
            im.convert("RGB").save(folder / f"{key}.jpg", "JPEG", quality=92, subsampling=0, optimize=True, progressive=True)

    # LinkedIn document posts: carousels as PDF (4:5 slides)
    pdf_dir = STAGE / "03-carousels" / "linkedin-pdf"
    pdf_dir.mkdir(parents=True, exist_ok=True)
    for cid in LINKEDIN:
        for th in ("layl", "nahar"):
            slides = sorted((STAGE / FOLDERS["CR"] / cid).glob(f"*_{th}_portrait.jpg"), key=lambda p: int(p.name.split("_")[0].rsplit("-", 1)[1]))
            if slides:
                ims = [Image.open(p).convert("RGB") for p in slides]
                ims[0].save(pdf_dir / f"{cid}_{th}.pdf", "PDF", save_all=True, append_images=ims[1:], resolution=150)

    # reels
    for mp4 in REELS.glob("*/*.mp4"):
        if mp4.name.endswith("_preview.mp4"):
            continue
        th = "layl" if "_layl_" in mp4.name else "nahar"
        folder = STAGE / "06-reels" / th / mp4.parent.name
        folder.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(mp4, folder / mp4.name)
        jpg = mp4.with_suffix(".jpg")
        if jpg.exists():
            shutil.copyfile(jpg, folder / f"{mp4.stem}_cover.jpg")

    # calendar + readme in every zip's root
    xlsx = ROOT / "out" / "plan" / "alhamd-content-calendar.xlsx"
    readme = ("Alhamd organic content kit\n"
              "Files: <ID>_<theme>_<format>.jpg — theme: layl (night) / nahar (day).\n"
              "Formats: story 1080x1920 · portrait 1080x1350 · grid 1080x1440 · square 1080x1080 · pin 1000x1500 · wide 1920x1080 · link 1200x630.\n"
              "The calendar (alhamd-content-calendar.xlsx) says what to post each day, where, in which theme, with the caption.\n")
    OUT.mkdir(parents=True, exist_ok=True)
    for z in OUT.glob("*.zip"):
        z.unlink()
    manifest = []
    for name, roots, what in ZIPS:
        path = OUT / name
        n = 0
        with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_STORED) as zf:  # JPEG/MP4 are already compressed
            zf.writestr("Alhamd/README.txt", readme)
            for r in roots:
                for f in sorted((STAGE / r).rglob("*")):
                    if f.is_file():
                        zf.write(f, "Alhamd/" + str(f.relative_to(STAGE)))
                        n += 1
        manifest.append({"name": name, "size": human(path.stat().st_size), "bytes": path.stat().st_size, "files": n, "what": what})
        print(f"{name}: {n} files, {human(path.stat().st_size)}")
    if xlsx.exists():
        shutil.copyfile(xlsx, OUT / xlsx.name)
        manifest.insert(0, {"name": xlsx.name, "size": human(xlsx.stat().st_size), "bytes": xlsx.stat().st_size, "files": 1, "what": "التقويم: ٨٤ يومًا بالمنشورات والكابشن والهاشتاجات والقصص وقناة واتساب، مع عمود الحالة، وبنك المحتوى بالنص البديل"})
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(m["bytes"] for m in manifest)
    print(f"total {human(total)}")


if __name__ == "__main__":
    main()
