"""
Fetches the Quran verses the kit prints, in Uthmani script, and checks them.

  python3 tools/fetch_verses.py           # writes data/verses.json
  python3 tools/fetch_verses.py --words   # also prints every verse word by word (to choose portions)

Text: quran.com API v4 (text_uthmani, word by word), so a portion is always whole words of the verse.
Check: the same verse from api.alquran.cloud (Tanzil Uthmani) must have the same letters once
diacritics and marks are removed. A mismatch stops the script.

Every verse card still says «راجِع قبل النشر» in the plan: the app promises that each text is
reviewed by people of knowledge before it is published, and that promise covers marketing too.
"""
import json
import unicodedata
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# id, surah, ayah, surah name, first word, last word (1-based, inclusive; None = whole verse), use
VERSES = [
    ("SV-01", 1, 2, "الفاتحة", None, None, "الجمعة الأولى: اسم التطبيق نفسه"),
    ("SV-02", 14, 7, "إبراهيم", 4, 6, "وعد الزيادة"),
    ("SV-03", 16, 18, "النحل", None, None, "نِعَمٌ لا تُحصى"),
    ("SV-04", 93, 11, "الضحى", None, None, "التحدّث بالنعمة"),
    ("SV-05", 2, 152, "البقرة", None, None, "الذكر والشكر"),
    ("SV-06", 34, 13, "سبأ", 12, 19, "قليلٌ من عبادي الشكور"),
    ("SV-07", 55, 13, "الرحمن", None, None, "فبأيّ آلاء ربكما"),
    ("SV-08", 16, 53, "النحل", 1, 6, "كلّ نعمةٍ من الله"),
    ("SV-09", 27, 19, "النمل", 6, 15, "دعاء الشكر"),
    ("SV-10", 31, 20, "لقمان", 13, 17, "نِعَمٌ ظاهرة وباطنة"),
    ("SV-11", 10, 10, "يونس", 8, 14, "آخر دعواهم"),
    ("SV-12", 7, 43, "الأعراف", 12, 23, "الحمد لله الذي هدانا"),
    ("SV-13", 2, 185, "البقرة", 38, 44, "آية شهر رمضان تُختم بالشكر"),
    ("SV-14", 39, 66, "الزمر", None, None, "وكن من الشاكرين"),
    ("SV-15", 35, 34, "فاطر", None, None, "أذهب عنّا الحزن"),
    # blessing packages (kit/bundle.js): the verse the app shows on the blessing card, same portion
    ("BV-05", 29, 45, "العنكبوت", 7, 17, "نعمة الصلاة: آية النعمة كما تظهر في التطبيق"),
    ("BV-37", 90, 8, "البلد", None, None, "نعمة البصر: آية النعمة كما تظهر في التطبيق"),
    ("BV-15", 67, 30, "الملك", None, None, "نعمة الماء: آية النعمة كما تظهر في التطبيق"),
    ("BV-19", 3, 190, "آل عمران", None, None, "نعمة العقل: آية النعمة كما تظهر في التطبيق"),
    ("BV-22", 31, 14, "لقمان", 1, 15, "نعمة الأم: آية النعمة كما تظهر في التطبيق (حتى «ولوالديك»)"),
]

MARKS = re.compile(r"[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿـ]")


def skeleton(s: str) -> str:
    # the same hamza is written as a mark on a tatweel in one source and as a letter in the other («لَـَٔايَـٰتٍ» / «لَءَايَٰتٍ»)
    s = unicodedata.normalize("NFC", s).replace("\u0654", "ء")
    s = MARKS.sub("", s)
    s = s.replace("ٱ", "ا").replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ى", "ي").replace("ة", "ه")
    return re.sub(r"[^ء-ي]", "", s)


def get(url: str) -> dict:
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "alhamd-kit"}), timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception:  # noqa: BLE001 — retry on any network error
            time.sleep(2 ** attempt)
    raise RuntimeError(f"failed: {url}")


def package_verses() -> list:
    """BV-<n> for every packaged blessing not listed above: the app's surah and ayah, and the same words the app shows
    (a portion when the app shows part of the ayah). The app's text is plain spelling, so words are matched by letters."""
    sys.path.insert(0, str(ROOT / "tools"))
    from build_content import BUNDLE  # noqa: E402
    src = {b["order"]: b for b in json.loads((ROOT.parent.parent / "src" / "data" / "blessings_ar.json").read_text(encoding="utf-8"))["blessings"]}
    have = {v[0] for v in VERSES}
    # plain spelling vs the mushaf's: «الحياة» / «ٱلْحَيَوٰةِ» («وٰة» at a word's end reads «اة»)
    # the two spellings differ in alif, ya and hamza («يتوفاكم» / «يَتَوَفَّىٰكُم», «في» / «فِى», «شيئا» / «شَيْـًٔا»), so those are set
    # aside; a doubled letter is one letter with a shadda («الليل» / «ٱلَّيْل»). Whole runs of words are compared, so this stays exact enough.
    loose = lambda t: re.sub(r"(.)\1+", r"\1", re.sub("[ايءئؤ]", "", skeleton(re.sub("و[\u064B-\u0652]*\u0670(?=[\u064B-\u0652]*ة)", "", t))))  # noqa: E731
    out = []
    for n in BUNDLE:
        if f"BV-{n:02d}" in have:
            continue
        q = src[n]["quran"]
        s, a = q["surahNumber"], q["ayahNumber"]
        v = get(f"https://api.quran.com/api/v4/verses/by_key/{s}:{a}?fields=text_uthmani")["verse"]
        words = [t for t in v["text_uthmani"].split() if not re.fullmatch(r"[\u06D6-\u06DC\u06DE]", t)]
        want = loose(q["textUthmani"])
        span = None
        for i in range(len(words)):
            for j in range(i, len(words)):
                got = loose("".join(words[i:j + 1]))
                if got == want:
                    span = (i + 1, j + 1)
                    break
                if len(got) > len(want):
                    break
            if span:
                break
        if not span:
            raise SystemExit(f"blessing {n}: the app's verse {s}:{a} is not a run of whole words of the ayah: {q['textUthmani']}")
        whole = span == (1, len(words))
        out.append((f"BV-{n:02d}", s, a, q["surahName"], None if whole else span[0], None if whole else span[1], f"{src[n]['title']}: آية النعمة كما تظهر في التطبيق"))
    return out


def main() -> None:
    show = "--words" in sys.argv
    out = []
    for vid, s, a, name, w0, w1, use in VERSES + package_verses():
        v = get(f"https://api.quran.com/api/v4/verses/by_key/{s}:{a}?words=true&word_fields=text_uthmani&fields=text_uthmani")["verse"]
        full = v["text_uthmani"]
        # verse-level text is the reference (the word list adds a few recitation marks); pause marks are tokens of their own
        tokens = full.split()
        at = [i for i, t in enumerate(tokens) if not re.fullmatch(r"[\u06D6-\u06DC\u06DE]", t)]  # pause marks and the hizb sign «۞» are not words
        words = [tokens[i] for i in at]
        tanzil = get(f"https://api.alquran.cloud/v1/ayah/{s}:{a}/quran-uthmani")["data"]["text"]
        if s != 1 and tanzil.startswith("بِسْمِ"):
            tanzil = tanzil  # only the first verse of a surah carries the basmala in Tanzil; not used here
        if skeleton(full) != skeleton(tanzil):
            raise SystemExit(f"{vid} {s}:{a} differs between sources:\n{full}\n{tanzil}")
        if show:
            print(f"\n{vid} {name} {a}:", " ".join(f"{i + 1}:{w}" for i, w in enumerate(words)))
        if w0:
            # whole words of the verse; a pause mark left dangling at the cut is dropped
            # pause marks inside the portion stay as they are in the mushaf
            portion = re.sub(r"\s*[ۖ-ۜ]\s*$", "", " ".join(tokens[at[w0 - 1]:at[w1 - 1] + 1]))
            nomark = lambda t: " ".join(re.sub(r"[ۖ-ۜ]", " ", t).split())  # noqa: E731
            if nomark(portion) not in nomark(full):
                raise SystemExit(f"{vid}: portion not found verbatim")
        else:
            portion = full
        out.append({"id": vid, "surah": s, "ayah": a, "surahName": name, "text": portion, "full": full,
                    "portion": bool(w0), "ref": f"{name}: {a}", "use": use,
                    "source": "api.quran.com v4 text_uthmani; letters checked against api.alquran.cloud quran-uthmani"})
        print(f"{vid} {name} {a}{' (portion)' if w0 else ''}: {portion}")
    (ROOT / "data" / "verses.json").write_text(json.dumps({"note": __doc__.strip(), "verses": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"data/verses.json: {len(out)} verses")


if __name__ == "__main__":
    main()
