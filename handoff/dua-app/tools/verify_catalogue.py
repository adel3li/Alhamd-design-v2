"""Reference check for handoff/dua-app/04-seed-catalogue.md.

Checks that every Qur'anic reference exists in Tanzil's text and that every
hadith number exists in the open hadith-api dataset (sunnah.com numbering;
Muslim by Abd al-Baqi number = the integer part of `arabicnumber`), and lists
the gradings recorded there, and applies the current scope (al-Bukhari and Muslim only;
pass --rule-b to see option B instead). Prints a Markdown report.

This script contains no Qur'an or hadith text and must not: it never types a
verse or a hadith. Whether the dua is really at a reference is checked when a
card is built, by comparing the card's text (pasted or fetched from the
source) with the source itself.

Usage: python3 -I verify_catalogue.py DOWNLOADS_DIR, where DOWNLOADS_DIR has
quran/simple.txt (Tanzil, txt-2 format) and hadith/<collection>.json
(hadith-api editions/ara-<collection>.min.json).
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

D = sys.argv[1]
SCOPE = 'ruleB' if '--rule-b' in sys.argv[2:] else 'sahihayn'

quran = set()
for line in open(f'{D}/quran/simple.txt', encoding='utf-8'):
    parts = line.rstrip('\n').split('|')
    if len(parts) == 3 and parts[0].isdigit():
        quran.add((int(parts[0]), int(parts[1])))

from catalogue_refs import Q, S  # noqa: E402

H = {c: json.load(open(f'{D}/hadith/{c}.json'))['hadiths']
     for c in ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']}

def find(coll, num):
    if coll == 'muslim':
        return [h for h in H[coll] if str(h.get('arabicnumber', '')).split('.')[0] == str(num)]
    return [h for h in H[coll] if h.get('hadithnumber') == num]

CN = {'bukhari': 'البخاري', 'muslim': 'مسلم', 'abudawud': 'أبو داود', 'tirmidhi': 'الترمذي', 'nasai': 'النسائي', 'ibnmajah': 'ابن ماجه'}
GRADERS = {'Al-Albani': 'الألباني', 'Muhammad Muhyi Al-Din Abdul Hamid': 'محمد محيي الدين عبد الحميد',
           'Shuaib Al Arnaut': 'شعيب الأرنؤوط', 'Zubair Ali Zai': 'زبير علي زئي', 'Ahmad Muhammad Shakir': 'أحمد شاكر',
           'Bashar Awad Maarouf': 'بشار عواد معروف', 'Abu Ghuddah': 'أبو غدة', 'Muhammad Fouad Abd al-Baqi': 'محمد فؤاد عبد الباقي'}
GRADES = {'Isnaad Sahih': 'إسناده صحيح', 'Isnaad Hasan': 'إسناده حسن', 'Hasan Isnaad': 'إسناده حسن',
          'Hasan Sahih': 'حسن صحيح', 'Sahih': 'صحيح', 'Hasan': 'حسن', 'Daif': 'ضعيف'}


# Option B of 00-decisions.md §5, mirrored from reusable-code/hadithGrade.ts.
import re
WEAK = re.compile(r'\b(daif|da\'if|mawdu|maudu|munkar|shadh|batil)\b', re.I)
NOT_MARFU = re.compile(r'\b(muquf|mauquf|mawquf|maqtu|mursal)\b', re.I)
ACCEPTED = re.compile(r'\b(sahih|hasan)\b', re.I)
DISSENT = ['Shuaib Al Arnaut', 'Ahmad Muhammad Shakir', 'Bashar Awad Maarouf']

def classify(grade):
    if WEAK.search(grade): return 'weak'
    if NOT_MARFU.search(grade): return 'not_marfu'
    if ACCEPTED.search(grade): return 'accepted'
    return 'unknown'

def rule_b(coll, gradings):
    if coll in ('bukhari', 'muslim'): return 'يدخل', 'في الصحيحين'
    if SCOPE == 'sahihayn': return 'مؤجل', 'خارج الصحيحين'
    primary = next((g for g in gradings if g['name'] == 'Al-Albani'), None)
    if not primary: return 'للمراجع', 'لا حكم للألباني في المصدر'
    c = classify(primary['grade'])
    if c == 'weak': return 'لا يدخل', 'ضعّفه الألباني'
    if c != 'accepted': return 'للمراجع', 'حكم الألباني يحتاج نظرًا'
    dissent = [GRADERS.get(g['name'], g['name']) for g in gradings if g['name'] in DISSENT and classify(g['grade']) == 'weak']
    if dissent: return 'للمراجع', 'صححه الألباني وضعّفه ' + '، '.join(dissent)
    if any(g['name'] in DISSENT and classify(g['grade']) == 'not_marfu' for g in gradings): return 'للمراجع', 'جعله أحد المحققين موقوفًا أو مقطوعًا'
    return 'يدخل', 'صححه أو حسّنه الألباني ولم يضعّفه محقق من القاعدة'

print('## أ. القرآن\n\n| # | الموضع | الآيات موجودة |\n|---|---|---|')
q_bad = 0
for row, s, a, b in Q:
    ok = all((s, i) in quran for i in range(a, b + 1))
    q_bad += not ok
    print(f'| {row} | {s}:{a}' + (f'–{b}' if b != a else '') + f' | {"✓" if ok else "✗"} |')
print(f'\n{len(Q)} موضعًا، {len(Q) - q_bad} موجودة.\n')

print('## ب. السنة\n\n| # | المرجع | الرقم موجود | الأحكام المسجّلة في المصدر | القرار الآن | السبب |\n|---|---|---|---|---|---|')
for row, refs in S:
    for coll, num in refs:
        if num is None:
            print(f'| {row} | {coll} | — | ليس في المصدر المفتوح | مؤجل | خارج الصحيحين |')
            continue
        hs = find(coll, num)
        grades = '، '.join(f"{GRADERS.get(g['name'], g['name'])}: {GRADES.get(g['grade'], g['grade'])}"
                          for g in (hs[0].get('grades', []) if hs else []))
        if not grades and coll in ('bukhari', 'muslim'):
            grades = 'في الصحيح'
        decision, why = rule_b(coll, hs[0].get('grades', []) if hs else [])
        if any('\ufffd' in h['text'] for h in hs):
            why += '؛ وفي نص المصدر حرف تالف، فيُنقل من مصدر ثانٍ'
        print(f'| {row} | {CN[coll]} {num} | {"✓" if hs else "✗"} | {grades} | {decision} | {why} |')
