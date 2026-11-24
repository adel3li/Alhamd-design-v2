"""
Builds kit/content.js — everything the templates write on a creative.

  python3 tools/build_content.py

Sources:
  ../../src/data/blessings_ar.json   the app's blessings: the kit's families use the first 40 (title, opening line,
                                     the five pauses, duaa, journal prompt); a blessing package (BUNDLE) takes every field
  ../../src/data/journey_content.json  «رحلتي»: the stage that holds a packaged blessing
  data/copy.json                     the kit's own copy: posts, carousels, stories, reels
  data/verses.json                   Quran verses fetched and checked by tools/fetch_verses.py

Only app-authored lines are taken from the blessings file for the kit's families. Its Quran, hadith and
scholar fields are still pending review in the app (see its contentNote), so none of them is printed there.

A blessing package (kit/bundle.js, the full set of formats for one blessing) mirrors the app's blessing card,
so it also carries the hadith, the tadabbur and the scholar quote, verbatim and with their review flags. Every
creative that prints one of them is marked review: true and must not be posted before the text is reviewed.
The verse is not the app's text: it is the same portion in Uthmani script from data/verses.json (BV-<n>).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent.parent
KIT_BLESSINGS = 100  # the kit's daily families (NB, NP, ND, NR, TR…): the first hundred (the 12-week plan keeps to the first 40)
PACKAGES = [5, 37, 15, 22, 19, 28, 29, 34, 36, 14]  # full packages (every format, the demo page): ten blessings, seven categories
JR_UPTO = 40  # the «الرحلة كاملة» carousel (JR-nn) for every blessing up to this order, made in batches of ten
BUNDLE = PACKAGES + [n for n in range(1, JR_UPTO + 1) if n not in PACKAGES]  # every blessing kit/bundle.js builds


def package(b: dict, verses: list, journey: dict) -> dict:
    """Every field the app shows for one blessing, verbatim, with the flags a reviewer needs."""
    n = b["order"]
    verse = next((v for v in verses if v["id"] == f"BV-{n:02d}"), None)
    if verse is None:
        raise SystemExit(f"blessing {n}: add BV-{n:02d} to tools/fetch_verses.py and run it first")
    stage = next((s for s in journey["stages"] if any(st["blessingId"] == b["id"] for st in s["stations"])), None)
    h, q = b["hadith"], b["scholarQuote"]
    showName = bool(q["scholar"]) and not any(q["scholar"].startswith(p) for p in ("مستفاد", "مأثور", "إشارة"))
    return {
        "n": n, "id": b["id"], "title": b["title"], "short": b["shortTitle"], "catLabel": b["categoryLabel"],
        "opening": b["openingLine"],
        "stepTypes": [s["type"] for s in sorted(b["istisharSteps"], key=lambda s: s["step"])],
        "stepSecs": [s["durationSec"] for s in sorted(b["istisharSteps"], key=lambda s: s["step"])],
        "verse": {"text": verse["text"], "full": verse["full"], "surah": verse["surah"], "ayah": verse["ayah"], "ayahEnd": verse.get("ayahEnd"),
                  "surahName": verse["surahName"], "portion": verse["portion"], "source": verse["source"],
                  "appText": b["quran"]["textUthmani"]},
        "hadith": {"text": h["text"], "source": h["source"], "number": h["number"], "grade": h["grade"],
                   "gradeVerified": h["gradeVerified"]} if h and h.get("text") else None,
        "tadabbur": b["tadabbur"],
        # the app hides a «scholar» that only says where the meaning comes from (مستفاد / مأثور / إشارة); we print it as a note
        "quote": {"text": q["text"], "scholar": q["scholar"] if showName else "", "work": q["work"] if showName else "",
                  "note": "" if showName else q["scholar"],
                  "paraphrase": q["attributionType"] == "paraphrase", "verified": q["verifiedVerbatim"]} if q and q.get("text") else None,
        "duaaSourced": b.get("duaaSourced"),
        "reviewStatus": b["reviewStatus"],
        "stage": {"id": stage["id"], "title": stage["title"], "focus": stage["focusLabel"], "intention": stage["intention"]["text"],
                  "stations": [{"id": st["blessingId"], "action": st["dailyAction"]["text"]} for st in stage["stations"]]} if stage else None,
    }


def main() -> None:
    src = json.loads((REPO / "src" / "data" / "blessings_ar.json").read_text(encoding="utf-8"))
    journey = json.loads((REPO / "src" / "data" / "journey_content.json").read_text(encoding="utf-8"))
    blessings = []
    for b in sorted(src["blessings"], key=lambda b: b["order"])[:KIT_BLESSINGS]:
        blessings.append({
            "id": b["id"],
            "n": b["order"],
            "title": b["title"],
            "short": b["shortTitle"],
            "cat": b["category"],
            "catLabel": b["categoryLabel"],
            "opening": b["openingLine"],
            "steps": [s["text"] for s in sorted(b["istisharSteps"], key=lambda s: s["step"])],
            "duaa": b["duaa"],
            "prompt": b["journalPrompt"],
        })
    copy_path = ROOT / "data" / "copy.json"
    verses_path = ROOT / "data" / "verses.json"
    verses = json.loads(verses_path.read_text(encoding="utf-8"))["verses"] if verses_path.exists() else []
    by_order = {b["order"]: b for b in src["blessings"]}
    data = {
        "blessings": blessings,
        "copy": json.loads(copy_path.read_text(encoding="utf-8")) if copy_path.exists() else {},
        "verses": verses,
        "bundle": {str(n): package(by_order[n], verses, journey) for n in BUNDLE},
    }
    out = ROOT / "kit" / "content.js"
    out.write_text("/* generated by tools/build_content.py — do not edit */\nwindow.CONTENT = "
                   + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"{out.relative_to(ROOT)}: {len(blessings)} blessings, {len(data['verses'])} verses, "
          f"{len(data['copy'])} copy groups, packages for {BUNDLE}")


if __name__ == "__main__":
    main()
