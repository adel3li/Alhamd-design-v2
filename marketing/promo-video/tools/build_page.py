"""
Builds the storyboard review page.

  python3 tools/build_page.py

Reads storyboard.json, out/timings.json and out/frames/*.png.
Writes out/page/index.html and out/page/frames/*.webp (720 px wide).
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
PAGE = OUT / "page"


def main() -> None:
    sb = json.loads((ROOT / "storyboard.json").read_text(encoding="utf-8"))
    tm = json.loads((OUT / "timings.json").read_text(encoding="utf-8"))

    frames_dir = PAGE / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for png in sorted((OUT / "frames").glob("*.png")):
        if png.stem.endswith("_guides"):
            continue
        im = Image.open(png).convert("RGB")
        w, h = im.size
        im = im.resize((720, round(h * 720 / w)), Image.LANCZOS)
        im.save(frames_dir / f"{png.stem}.webp", "WEBP", quality=84, method=6)

    data = {
        "storyboard": sb,
        "timings": {
            "total": tm["total"],
            "slots": [{"id": s["id"], "start": s["start"], "len": s["len"]} for s in tm["slots"]],
        },
    }
    template = (ROOT / "tools" / "page-template.html").read_text(encoding="utf-8")
    html = template.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False))
    (PAGE / "index.html").write_text(html, encoding="utf-8")
    size = sum(p.stat().st_size for p in frames_dir.glob("*.webp"))
    print(f"page: {len(html) // 1024} KB html, {len(list(frames_dir.glob('*.webp')))} images, {size // 1024} KB")


if __name__ == "__main__":
    main()
