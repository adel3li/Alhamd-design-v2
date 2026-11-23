"""Copies the source text of every reference in the seed catalogue into a
Markdown file, verbatim, for the researcher and the reviewer.

Nothing here is typed: the Qur'an text is read from Tanzil's Uthmani file and
each hadith from the open hadith-api dataset, by reference, and written out
unchanged. A character the source itself has corrupted (U+FFFD) is flagged,
never repaired by hand.

Usage: python3 -I build_catalogue_texts.py DOWNLOADS_DIR > ../04c-catalogue-texts.md
Only al-Bukhari and Muslim are copied (the current scope); pass --all for every collection.
DOWNLOADS_DIR needs quran/uthmani.txt (Tanzil, txt-2, Uthmani) and
hadith/<collection>.json (hadith-api editions/ara-<collection>.min.json).
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from catalogue_refs import Q, S  # noqa: E402

D = sys.argv[1]
quran, notice = {}, []
for line in open(f'{D}/quran/uthmani.txt', encoding='utf-8'):
    parts = line.rstrip('\n').split('|')
    if len(parts) == 3 and parts[0].isdigit():
        quran[(int(parts[0]), int(parts[1]))] = parts[2]
    elif line.startswith('#'):
        notice.append(line.rstrip('\n'))

H = {c: json.load(open(f'{D}/hadith/{c}.json'))['hadiths']
     for c in ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']}
CN = {'bukhari': 'صحيح البخاري', 'muslim': 'صحيح مسلم', 'abudawud': 'سنن أبي داود', 'tirmidhi': 'جامع الترمذي',
      'nasai': 'سنن النسائي', 'ibnmajah': 'سنن ابن ماجه'}

def find(coll, num):
    if coll == 'muslim':
        return [h for h in H[coll] if str(h.get('arabicnumber', '')).split('.')[0] == str(num)]
    return [h for h in H[coll] if h.get('hadithnumber') == num]

out = []
w = out.append
w('# ٤ج. نصوص القائمة المرشّحة من مصادرها\n')
w('هذا الملف **مولَّد بالسكريبت** [tools/build_catalogue_texts.py](tools/build_catalogue_texts.py): كل نص فيه منسوخ حرفيًا من مصدره بالمرجع، ولم يُكتب منه حرف يدويًا. لا يُعدَّل هذا الملف باليد؛ يُعاد توليده.\n')
w('| | المصدر | الحالة |\n|---|---|---|')
w('| القرآن | Tanzil، النص العثماني (Uthmani 1.1)، الآيات كاملة | نص موثّق من مصدره. **المقطع الذي هو الدعاء** داخل الآية يحدده المراجع عند بناء البطاقة |')
w('| السنة | مجموعة البيانات المفتوحة `fawazahmed0/hadith-api` (مأخوذة من sunnah.com)، الحديث كاملًا بإسناده | **مصدر واحد، للمراجعة لا للنشر.** يُطابَق على مصدر ثانٍ (الدرر السنية أو الطبعة المطبوعة) قبل أن يُنقل إلى بطاقة |\n')
w('المراجع وأرقام الصفوف كما في [04-seed-catalogue.md](04-seed-catalogue.md). **من السنة: البخاري ومسلم فقط**، وهو النطاق الحالي بقرار صاحب المشروع؛ أحاديث الكتب الأخرى مؤجلة ولا تُنسخ هنا.\n')

w('## أ. القرآن\n')
for row, s, a, b in Q:
    ref = f'{s}:{a}' + (f'–{b}' if b != a else '')
    w(f'### {row} · {ref}\n')
    for i in range(a, b + 1):
        w(f'> {quran[(s, i)]} ({s}:{i})\n')

w('## ب. السنة\n')
ALL = '--all' in sys.argv[2:]
for row, refs in S:
    for coll, num in refs:
        if num is None or (not ALL and coll not in ('bukhari', 'muslim')):
            continue
        for h in find(coll, num):
            n = h.get('arabicnumber') if coll == 'muslim' else h.get('hadithnumber')
            w(f'### {row} · {CN[coll]} {n}\n')
            text = h['text']
            if '�' in text:
                w('> ⚠ **في هذا النص حرف تالف في المصدر نفسه (يظهر كرمز غير مقروء). لا يُصلَح باليد: يُنقل من مصدر ثانٍ.**\n')
            w(f'> {text}\n')

w('## ترخيص نص القرآن\n')
w('```')
w('\n'.join(l.lstrip('#').rstrip() for l in notice if l.strip('#').strip() and 'PLEASE DO NOT' not in l and not set(l.strip('#').strip()) <= set('=')))
w('```')
print('\n'.join(out))
