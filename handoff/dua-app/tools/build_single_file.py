"""Packs the whole kit into one Markdown file to hand to Claude in a new session.

Each file is written verbatim between two marker lines, so the new session can
split the pack back into the same files (the header of the pack carries the
split script). Left out: 04c-catalogue-texts.md, which the new session
regenerates from the sources, and the PNG in assets/.

Usage: python3 -I build_single_file.py ../../qareeb-kit.md   (the pack lives next to the kit folder)
Regenerate the pack after any change to the kit.
"""
import pathlib, sys

KIT = pathlib.Path(__file__).resolve().parent.parent
OPEN = '<!-- ' + '===== FILE: {} =====' + ' -->'
CLOSE = '<!-- ' + '===== END FILE =====' + ' -->'

ORDER = [
    'README.md', '00-decisions.md', '01-product-brief.md', '02-ux-and-screens.md', '03-content-model.md',
    '04-seed-catalogue.md', '04b-catalogue-verification.md', '05-technical-blueprint.md',
    '06-lessons-from-alhamd.md', '07-roadmap-and-launch.md', '08-kickoff-prompt.md',
    '09-content-drafting-prompt.md', '10-identity-brief.md',
]
SKIP = {'04c-catalogue-texts.md'}

HEADER = '''# «قريب»: حقيبة البدء في ملف واحد

> **إلى Claude:** هذا الملف يحمل حقيبة بدء مشروع «قريب» كاملة، مولَّدة من المجلد `handoff/dua-app` في المستودع `adel3li/Alhamd-design-v2`. اتبع الخطوات بالترتيب، ولا تعدّل محتوى الملفات وأنت تفكّها.

## الخطوة ١: فكّ الملف إلى ملفاته

كل ملف في هذه الحزمة محصور بين سطرين: سطر يبدأ بـ `<!-- ===== FILE:` ويذكر مسار الملف في المستودع، وسطر `END FILE`. ما بينهما هو الملف حرفيًا.

احفظ هذا الملف في المستودع الجديد باسم `docs/handoff/QAREEB_KIT.md` (إن وصلك مرفقًا فانسخه إلى هذا المسار؛ وإن وصلك نصًا فاكتبه إليه كما هو)، ثم شغّل من جذر المستودع:

```bash
python3 - docs/handoff/QAREEB_KIT.md <<'PY'
import pathlib, re, sys
src = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8')
marker = re.compile(r'^<!-- ===== FILE: (.+?) ===== -->\\n(.*?)^<!-- ===== END FILE ===== -->$', re.S | re.M)
count = 0
for path, body in marker.findall(src):
    target = pathlib.Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(body, encoding='utf-8')
    count += 1
print(count, 'files written')
PY
```

يجب أن يطبع `{count} files written`. الناتج: `CLAUDE.md` في الجذر، والحقيبة في `docs/handoff/`.

## الخطوة ٢: ما ليس في هذه الحزمة

- `docs/handoff/04c-catalogue-texts.md`: نصوص الآيات والأحاديث في القائمة المرشحة، منسوخة من مصادرها. لا تكتبها؛ ولّدها بالسكريبت بعد تنزيل المصادر:

```bash
mkdir -p .sources/quran .sources/hadith
curl -fsS -o .sources/quran/uthmani.txt "https://tanzil.net/pub/download/index.php?marks=true&sajdah=true&rub=true&tatweel=true&quranType=uthmani&outType=txt-2&agree=true"
curl -fsS -o .sources/quran/simple.txt "https://tanzil.net/pub/download/index.php?marks=true&sajdah=true&rub=true&tatweel=true&quranType=simple&outType=txt-2&agree=true"
for c in bukhari muslim abudawud tirmidhi nasai ibnmajah; do curl -fsS -o .sources/hadith/$c.json "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-$c.min.json"; done
python3 -I docs/handoff/tools/build_catalogue_texts.py .sources > docs/handoff/04c-catalogue-texts.md
python3 -I docs/handoff/tools/verify_catalogue.py .sources | grep -c "✓"   # expect 112
echo ".sources/" >> .gitignore
```

- `docs/handoff/assets/script-compare.png`: صورة مقارنة الخطوط. موجودة في المستودع `adel3li/Alhamd-design-v2` تحت `handoff/dua-app/assets/`، وعند صاحب المشروع.

## الخطوة ٣: ابدأ

اقرأ `CLAUDE.md`، ثم `docs/handoff/00-decisions.md` (المحسوم والمفتوح)، ثم افتح `docs/handoff/08-kickoff-prompt.md` ونفّذ البرومبت المكتوب بين الخطين فيه كأنه رسالة صاحب المشروع إليك. خطوات «قبل اللصق» في أوله تمت بفكّ هذه الحزمة.

القاعدة الأولى قبل كل شيء: **النص المقدس يُنسخ من مصدره ولا يُكتب.** لا تكتب نص آية أو حديث من ذاكرتك في أي ملف أو رسالة.

---

'''


def files():
    rel = [KIT / name for name in ORDER]
    for sub in ['templates', 'reusable-code', 'tools']:
        rel += sorted(p for p in (KIT / sub).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
    seen = set()
    for path in rel:
        r = path.relative_to(KIT).as_posix()
        if r in SKIP or r in seen:
            continue
        seen.add(r)
        yield f'docs/handoff/{r}', path
    yield 'CLAUDE.md', KIT / 'templates' / 'CLAUDE.md'


def main(out_path):
    entries = list(files())
    parts = [HEADER.replace('{count}', str(len(entries)))]
    for target, source in entries:
        body = source.read_text(encoding='utf-8')
        for line in body.split('\n'):
            if line.startswith('<!-- ===== '):
                raise SystemExit(f'{source} contains a marker line; the pack would not split cleanly')
        if not body.endswith('\n'):
            raise SystemExit(f'{source} does not end with a newline; the pack would change it')
        parts.append(OPEN.format(target) + '\n' + body + CLOSE + '\n\n')
    pathlib.Path(out_path).write_text(''.join(parts), encoding='utf-8')
    print(len(entries), 'files packed into', out_path)


if __name__ == '__main__':
    main(sys.argv[1])
