"""
Contact sheet for checking renders.

  python3 tools/sheet.py out/sheet.png out/stills/NB-15/*.png [--h 520] [--cols 7]
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

args = sys.argv[1:]
H = 520
cols = 7
if "--h" in args:
    i = args.index("--h"); H = int(args[i + 1]); del args[i:i + 2]
if "--cols" in args:
    i = args.index("--cols"); cols = int(args[i + 1]); del args[i:i + 2]
out, files = args[0], args[1:]
thumbs = []
for f in files:
    im = Image.open(f).convert("RGB")
    w = round(im.width * H / im.height)
    if w > H * 2.2:
        w = round(H * 2.2); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    else:
        im = im.resize((w, H), Image.LANCZOS)
    thumbs.append((Path(f).stem, im))
rows = [thumbs[i:i + cols] for i in range(0, len(thumbs), cols)]
pad, lab = 16, 26
W = max(sum(t.width for _, t in r) + pad * (len(r) + 1) for r in rows)
Ht = sum(max(t.height for _, t in r) + lab + pad for r in rows) + pad
sheet = Image.new("RGB", (W, Ht), (40, 40, 48))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
except OSError:
    font = ImageFont.load_default()
y = pad
for r in rows:
    x = pad
    for name, t in r:
        sheet.paste(t, (x, y + lab))
        d.text((x, y + 4), name, fill=(220, 220, 230), font=font)
        x += t.width + pad
    y += max(t.height for _, t in r) + lab + pad
sheet.save(out)
print(out, sheet.size)
