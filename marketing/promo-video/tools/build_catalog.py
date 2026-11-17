"""
Builds the content catalogue page (everything that needs no voice-over).

  python3 tools/build_catalog.py

Reads catalog.json, videos.json, out/social/*.png (+ meta.json) and out/videos/*.{webp,jpg}.
Writes out/catalog/index.html, out/catalog/img/*.webp and out/catalog/vid/*.
"""
import json
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "catalog"


def main() -> None:
    catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
    videos = json.loads((ROOT / "videos.json").read_text(encoding="utf-8"))["videos"]
    meta = json.loads((ROOT / "out" / "social" / "meta.json").read_text(encoding="utf-8"))

    (OUT / "img").mkdir(parents=True, exist_ok=True)
    (OUT / "vid").mkdir(parents=True, exist_ok=True)
    for did, m in meta.items():
        im = Image.open(ROOT / "out" / "social" / f"{did}.png").convert("RGB")
        w, h = im.size
        # portrait and square at 600 px wide, banners at 1000 px wide
        target = 1000 if w / h > 1.4 else 600
        im = im.resize((target, round(h * target / w)), Image.LANCZOS)
        im.save(OUT / "img" / f"{did}.webp", "WEBP", quality=82, method=6)
        m["pw"], m["ph"] = im.size

    vids = []
    for v in videos:
        for ext in ("webp", "jpg"):
            src = ROOT / "out" / "videos" / f"{v['id']}.{ext}"
            if src.exists():
                shutil.copyfile(src, OUT / "vid" / f"{v['id']}.{ext}")
            else:
                print(f"missing {src.name} (not rendered yet)")
        vids.append({"id": v["id"], "name": v["name"], "idea": v["idea"], "total": sum(s[1] for s in v["scenes"]) + 0.4})

    data = {"catalog": catalog, "designs": meta, "videos": vids}
    template = (ROOT / "tools" / "catalog-template.html").read_text(encoding="utf-8")
    html = template.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False))
    (OUT / "index.html").write_text(html, encoding="utf-8")
    size = sum(p.stat().st_size for p in OUT.rglob("*") if p.is_file())
    print(f"catalog: {len(meta)} designs, {len(vids)} videos, {size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
