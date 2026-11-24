"""
Download packages: for each blessing, its four carousels (JR, GH, TR, HS) in both themes, in two ZIPs, 4K and Full HD.

  node tools/render-stills.cjs --ids JR-01-,GH-01-,TR-01-,HS-01-,… --formats portrait                       # Full HD
  node tools/render-stills.cjs --ids JR-01-,GH-01-,TR-01-,HS-01-,… --formats portrait --scale 2 --out out/stills-4k
  python3 tools/export_package.py --from 1 --to 10 --dest "/Users/…/alhamd-carousels/1-100"
  python3 tools/build_gallery.py 1 --local --out "/Users/…/alhamd-carousels/1-100"                         # the page with the buttons

Writes <dest>/downloads/<nn>/alhamd_<nn>_4k.zip (2160×2700) and alhamd_<nn>_fullhd.zip (1080×1350). Inside a ZIP:
<nn> <title>/<ليل|نهار>/<n> <carousel>/<k>.jpg, slides in posting order, and «نصوص المنشورات.txt» with each
carousel's caption and the slides that print a verse, hadith or scholar's words (review before posting).
Slides are JPEG at quality 95: a PNG at 4K is about 4 MB, which would make the 400 blessings near 90 GB.
A blessing is skipped (and named) if any of its slides is missing at either size.
"""
import io
import json
import sys
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_gallery import CAROUSELS, captions, content, kinds_of, review_of, ar  # noqa: E402

THEMES = [("layl", "ليل"), ("nahar", "نهار")]
SIZES = [("4k", ROOT / "out" / "stills-4k", (2160, 2700)), ("fullhd", ROOT / "out" / "stills", (1080, 1350))]


def arg(name: str, default=None):
    return sys.argv[sys.argv.index(f"--{name}") + 1] if f"--{name}" in sys.argv else default


def slide_files(base: Path, cid: str, nn: str, count: int, th: str) -> list:
    return [base / f"{cid}-{nn}-{k}" / f"{cid}-{nn}-{k}_{th}_portrait.png" for k in range(1, count + 1)]


def main() -> None:
    lo, hi, dest = int(arg("from", 1)), int(arg("to", 10)), Path(arg("dest"))
    C = content()
    done, missing = [], []
    for n in range(lo, hi + 1):
        pk = C["bundle"].get(str(n))
        if not pk:
            missing.append(f"{n} (not in BUNDLE)")
            continue
        nn = f"{n:02d}"
        parts = [(cid, label, kinds_of(cid, pk)) for cid, label in CAROUSELS]
        lacking = [str(f) for size, base, _ in SIZES for cid, _, kinds in parts for th, _ in THEMES
                   for f in slide_files(base, cid, nn, len(kinds), th) if not f.exists()]
        if lacking:
            missing.append(f"{n} ({len(lacking)} slides, e.g. {Path(lacking[0]).name})")
            continue
        folder = f"{nn} {pk['title']}"
        caps = captions(pk, {cid: len(k) for cid, _, k in parts})
        notes = [f"{pk['title']} — نصوص المنشورات\n"]
        for j, (cid, label, kinds) in enumerate(parts, 1):
            flagged = review_of(kinds, pk)
            notes.append(f"\n{j}. {label} ({ar(len(kinds))} شرائح)\n{caps[cid]}\n")
            if flagged:
                notes.append("يُراجَع قبل النشر: " + "، ".join(f"الشريحة {ar(k)} ({why})" for k, why in flagged.items()) + "\n")
        out = dest / "downloads" / nn
        out.mkdir(parents=True, exist_ok=True)
        for size, base, (w, h) in SIZES:
            target = out / f"alhamd_{nn}_{size}.zip"
            tmp = target.with_suffix(".tmp")
            with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_STORED) as z:  # JPEGs do not compress further
                z.writestr(f"{folder}/نصوص المنشورات.txt", "".join(notes))
                for th, th_ar in THEMES:
                    for j, (cid, label, kinds) in enumerate(parts, 1):
                        for k, f in enumerate(slide_files(base, cid, nn, len(kinds), th), 1):
                            im = Image.open(f).convert("RGB")
                            if im.size != (w, h):
                                raise SystemExit(f"{f}: {im.size}, expected {(w, h)}")
                            buf = io.BytesIO()
                            im.save(buf, "JPEG", quality=95, subsampling=0, optimize=True)
                            z.writestr(f"{folder}/{th_ar}/{j} {label}/{k:02d}.jpg", buf.getvalue())
            tmp.replace(target)
        done.append(n)
        print(f"{nn} {pk['title']}: " + ", ".join(f"{s} {(out / f'alhamd_{nn}_{s}.zip').stat().st_size / 1e6:.0f} MB" for s, _, _ in SIZES), flush=True)
    print(f"{len(done)} packages in {dest / 'downloads'}" + (f"; skipped: {'; '.join(missing)}" if missing else ""))
    (dest / "downloads" / "manifest.json").write_text(json.dumps(sorted(set(done) | set(
        json.loads((dest / "downloads" / "manifest.json").read_text()) if (dest / "downloads" / "manifest.json").exists() else []))), encoding="utf-8")


if __name__ == "__main__":
    main()
