# Content and data

All content ships inside the JavaScript bundle. There is no CMS and no remote fetch; changing a text means changing a file in `src/data/` or `src/constants/` and redeploying.

| File | Lines | What it holds | Consumed by |
|---|---:|---|---|
| `src/data/blessings_ar.json` | 23,433 | 325 blessings, the core content (added in batches of 25 since 101; see 1.4) | `data/loader.ts` |
| `src/data/loader.ts` | 17 | Access functions and the review gate | store, charts, journey |
| `src/data/journey_content.json` | 725 | 4 journey stages × 7 stations | `lib/journeyStore.ts` |
| `src/data/hisnAlMuslim.ts` | 358 | 6 categories, 23 adhkar, 7 daily tips | `HisnScreen`, `HomeScreen`, `App` |
| `src/data/inspirations.ts` | 48 | 8 verses and hadith for "verse of the day" | `lib/dailyLogic.ts` |
| `src/data/dhikr.ts` | 16 | 9 short adhkar with their virtue | `TasbihModal`, `lib/dailyLogic.ts` |
| `src/constants/strings.ts` | 101 | A partial string table | nav bars, `ComposeBlessingModal` |
| `src/constants/categories.ts` | 32 | The 10 blessing categories and a legacy mapper | journal, compose, charts, store |

## 1. Blessings (`src/data/blessings_ar.json`)

### 1.1 File shape (`BlessingsData`, `src/types.ts:56`)

```jsonc
{
  "schemaVersion": 2,
  "contentNote": "جميع النصوص الشرعية (قرآن/حديث/أقوال) بحالة pending_review — …",
  "blessings": [ Blessing, … ]   // 100 items
}
```

The `contentNote` states that every sacred text is `pending_review`, that Qur'anic spelling must be matched against a trusted source and hadith must be sourced before `reviewStatus` changes to `approved`, and that all scholar quotes are paraphrases.

### 1.2 `Blessing` (`src/types.ts:34`)

| Field | Type | Notes |
|---|---|---|
| `id` | string | `islam` for the first, then `blessing_002` … `blessing_100` |
| `order` | number | 1–100; the daily rotation sorts on it |
| `category` | string | `din`, `nafs`, `rizq`, `aql`, `nasl`, `mal`, `amn`, `afiyah`, `kawn`, `wijdan` |
| `categoryLabel` | string | Arabic label, e.g. «نعم الدين» |
| `title` / `shortTitle` | string | «نعمة الإسلام» / «الإسلام» |
| `openingLine` | string | One-sentence hook shown under the title |
| `quran` | `{ textUthmani, surahName, surahNumber, ayahNumber, verified }` | `verified` is `false` on all 100. Despite the field name the text is Tanzil's Simple text, not the Uthmani one; see 1.7 |
| `hadith` | `{ text, source, number, grade, gradeVerified }` | Filled on blessings 1–40: grade is «صحيح» on 37 and «حسن» on 3. Since the hadith import, 77 of blessings 41–125 carry a hadith from Sahih al-Bukhari or Sahih Muslim, grade «صحيح»; the other 8 (92, 96, 97, 99, 116, 122, 123, 124) have empty strings and the screens show no hadith block. `gradeVerified` is `false` on all. See 1.8 |
| `scholarQuote` | `{ text, scholar, work, attributionType, verifiedVerbatim }` | `attributionType` is `paraphrase` on 1–100 and `verbatim` on 101–125, which quote Tafsir al-Sa'di (24) or al-Tafsir al-Muyassar (1) word for word (see 1.8); `verifiedVerbatim` is `false` on all. On 75 the `scholar` begins with «مستفاد», «مأثور» or «إشارة», and the screens then show the text with no name |
| `istisharSteps` | `IstisharStep[]` | Always 5 steps, see 1.3 |
| `tadabbur` | string | Longer reflection paragraph |
| `duaa` | string | Short supplication in the app's own words, shown on the last reflection step. On 1–100 written by the owner; on 101–125 drafted in development for the owner's review |
| `duaaSourced` | `{ text, source, reference } \| null` | A supplication quoted verbatim from the Qur'an (`source` «القرآن الكريم», `reference` surah and ayah) or from Bukhari or Muslim (`reference` the hadith number), shown beneath `duaa` on the last reflection step (`components/common/SourcedDuaa.tsx`). Set on 27 blessings (10 from the Qur'an), `null` on the rest. See 1.8 |
| `journalPrompt` | string | Question for the private journal |
| `relatedPodcastEpisode` | string \| null | Set on 17 of the first 40 (e.g. `ep_islam`), empty on the other 23, `null` on blessings 41–100. No component reads it |
| `reviewStatus` | string | `pending_review` on all 100 |
| `reviewedBy`, `reviewDate` | string, string \| null | Empty / `null` on all 100 |
| `contentVersion` | number | `1` on all 100 |

### 1.3 The five-step reflection script

Every blessing has the same sequence of step types and durations (`IstisharStep`, `src/types.ts:27`):

| Step | `type` | `durationSec` | Role |
|---:|---|---:|---|
| 1 | `ground` | 10 | Settle and breathe |
| 2 | `visualize` | 20 | Imagine life without the blessing |
| 3 | `deepen` | 20 | Stay with the absence |
| 4 | `return` | 15 | Come back to having it |
| 5 | `hamd` | 15 | Praise |

Total: 80 seconds. UI copy elsewhere says three minutes (`src/constants/strings.ts:68`), five minutes (onboarding) and two minutes (landing page).

### 1.4 The blessings

Blessings 1–40 are the original set. Blessings 41–100 were written by the owner and imported in November 2026 from a file that held their titles, reflections and verse references but no verse text; section 1.7 says where the verse text came from.

Blessings 101–200 were added in four batches (101–125, 126–150, 151–175, 176–200) of a second hundred (101–200). The owner approved a list of 100 titles and, for this batch, each verse reference; the verse text was taken from Tanzil by reference as for 41–100; the opening line, the five reflection steps, `tadabbur` and `journalPrompt` are drafts written for the owner to review. Their hadith, scholar quote and sourced supplication were then added from published sources (1.8); their short `duaa` is a draft. Section 1.7 has the details of the verses.

| Order | Id | Category | Short title | Title | Verse |
|---:|---|---|---|---|---|
| 1 | `islam` | din | الإسلام | نعمة الإسلام | المائدة 5:3 |
| 2 | `blessing_002` | din | معرفة الله | نعمة وجود الله ومعرفته | ق 50:16 |
| 3 | `blessing_003` | din | القرآن | نعمة القرآن | الإسراء 17:9 |
| 4 | `blessing_004` | din | النبي ﷺ | نعمة النبي محمد ﷺ | آل عمران 3:164 |
| 5 | `blessing_005` | din | الصلاة | نعمة الصلاة | العنكبوت 29:45 |
| 6 | `blessing_006` | din | الدعاء | نعمة الدعاء | البقرة 2:186 |
| 7 | `blessing_007` | din | التوبة | نعمة التوبة | الزمر 39:53 |
| 8 | `blessing_008` | din | الثبات | نعمة الثبات على الدين | إبراهيم 14:27 |
| 9 | `blessing_009` | din | الذكر | نعمة ذكر الله | الرعد 13:28 |
| 10 | `blessing_010` | din | الستر | نعمة الستر | الأعراف 7:26 |
| 11 | `blessing_011` | din | الفطرة | نعمة الفطرة | الروم 30:30 |
| 12 | `blessing_012` | din | رمضان | نعمة رمضان | البقرة 2:185 |
| 13 | `blessing_013` | nafs | الحياة | نعمة الحياة | الملك 67:2 |
| 14 | `blessing_014` | nafs | النوم | نعمة النوم | النبأ 78:9 |
| 15 | `blessing_015` | nafs | الماء | نعمة الماء | الملك 67:30 |
| 16 | `blessing_016` | rizq | الطعام | نعمة الطعام | عبس 80:24 |
| 17 | `blessing_017` | nafs | النَّفَس | نعمة النَّفَس | النحل 16:53 |
| 18 | `blessing_018` | nafs | الليل والنهار | نعمة الليل والنهار | القصص 28:73 |
| 19 | `blessing_019` | aql | العقل | نعمة العقل | آل عمران 3:190 |
| 20 | `blessing_020` | aql | العلم | نعمة العلم | المجادلة 58:11 |
| 21 | `blessing_021` | aql | البيان | نعمة البيان والنطق | الرحمن 55:1 |
| 22 | `blessing_022` | nasl | الأم | نعمة الأم | لقمان 31:14 |
| 23 | `blessing_023` | nasl | الأب | نعمة الأب | الإسراء 17:23 |
| 24 | `blessing_024` | nasl | السكن الزوجي | نعمة الزوج والسكن | الروم 30:21 |
| 25 | `blessing_025` | nasl | الأولاد | نعمة الأولاد | الكهف 18:46 |
| 26 | `blessing_026` | nasl | صلة الرحم | نعمة الأرحام | النساء 4:1 |
| 27 | `blessing_027` | nasl | الصحبة الصالحة | نعمة الصحبة الصالحة | الزخرف 43:67 |
| 28 | `blessing_028` | rizq | الرزق | نعمة الرزق | هود 11:6 |
| 29 | `blessing_029` | mal | المال | نعمة المال | سبأ 34:39 |
| 30 | `blessing_030` | rizq | العمل | نعمة العمل والكسب | الملك 67:15 |
| 31 | `blessing_031` | rizq | القناعة | نعمة القناعة | طه 20:131 |
| 32 | `blessing_032` | amn | الأمن | نعمة الأمن | قريش 106:3 |
| 33 | `blessing_033` | amn | البيت | نعمة البيت والمأوى | النحل 16:80 |
| 34 | `blessing_034` | amn | حفظ الله | نعمة حفظ الله | الرعد 13:11 |
| 35 | `blessing_035` | afiyah | العافية | نعمة العافية في البدن | الشعراء 26:80 |
| 36 | `blessing_036` | afiyah | السمع | نعمة السمع | النحل 16:78 |
| 37 | `blessing_037` | afiyah | البصر | نعمة البصر | البلد 90:8 |
| 38 | `blessing_038` | afiyah | الحركة | نعمة اليدين والقدمين | الإسراء 17:70 |
| 39 | `blessing_039` | nafs | الوقت | نعمة الوقت والفراغ | العصر 103:1 |
| 40 | `blessing_040` | din | الجنة | نعمة الجنة الموعودة | السجدة 32:17 |
| 41 | `blessing_041` | din | الهداية | نعمة الهداية | الأنعام 6:125 |
| 42 | `blessing_042` | din | السنّة | نعمة السنّة | الحشر 59:7 |
| 43 | `blessing_043` | din | المساجد | نعمة المساجد | التوبة 9:18 |
| 44 | `blessing_044` | din | الأخوّة الإيمانية | نعمة الأخوّة الإيمانية | الحجرات 49:10 |
| 45 | `blessing_045` | din | أسماء الله الحسنى | نعمة أسماء الله الحسنى | الأعراف 7:180 |
| 46 | `blessing_046` | din | محبة الله | نعمة محبة الله | المائدة 5:54 |
| 47 | `blessing_047` | din | الصبر | نعمة الصبر | الزمر 39:10 |
| 48 | `blessing_048` | din | الشكر | نعمة الشكر | إبراهيم 14:7 |
| 49 | `blessing_049` | din | التوكل | نعمة التوكل | الطلاق 65:3 |
| 50 | `blessing_050` | din | الإخلاص | نعمة الإخلاص | البيّنة 98:5 |
| 51 | `blessing_051` | din | الجمعة | نعمة الجمعة | الجمعة 62:9 |
| 52 | `blessing_052` | din | البيت الحرام | نعمة البيت الحرام | آل عمران 3:96 |
| 53 | `blessing_053` | din | ليلة القدر | نعمة ليلة القدر | القدر 97:3 |
| 54 | `blessing_054` | din | يُسر الدين | نعمة يُسر الدين | الحج 22:78 |
| 55 | `blessing_055` | afiyah | القلب | نعمة القلب | الحج 22:46 |
| 56 | `blessing_056` | afiyah | الذوق | نعمة الذوق | النحل 16:114 |
| 57 | `blessing_057` | afiyah | حُسن التقويم | نعمة حُسن التقويم | التين 95:4 |
| 58 | `blessing_058` | kawn | الشمس | نعمة الشمس | الشمس 91:1 |
| 59 | `blessing_059` | kawn | القمر | نعمة القمر | الشمس 91:2 |
| 60 | `blessing_060` | kawn | الرياح | نعمة الرياح | الروم 30:46 |
| 61 | `blessing_061` | kawn | الغيث | نعمة الغيث | الشورى 42:28 |
| 62 | `blessing_062` | kawn | الأرض الممهّدة | نعمة الأرض الممهّدة | النبأ 78:6 |
| 63 | `blessing_063` | kawn | الجبال | نعمة الجبال | النبأ 78:7 |
| 64 | `blessing_064` | kawn | البحر | نعمة البحر | النحل 16:14 |
| 65 | `blessing_065` | kawn | النبات | نعمة النبات | الأنعام 6:99 |
| 66 | `blessing_066` | kawn | الأنعام | نعمة الأنعام | النحل 16:5 |
| 67 | `blessing_067` | kawn | الطير | نعمة الطير | الملك 67:19 |
| 68 | `blessing_068` | kawn | النجوم | نعمة النجوم | النحل 16:16 |
| 69 | `blessing_069` | kawn | الظل | نعمة الظل | النحل 16:81 |
| 70 | `blessing_070` | kawn | النار | نعمة النار | الواقعة 56:73 |
| 71 | `blessing_071` | kawn | اللبن | نعمة اللبن | النحل 16:66 |
| 72 | `blessing_072` | kawn | العسل | نعمة العسل | النحل 16:69 |
| 73 | `blessing_073` | kawn | إتقان الكون | نعمة إتقان الكون | الملك 67:3 |
| 74 | `blessing_074` | kawn | إمساك السماوات والأرض | نعمة إمساك السماوات والأرض | فاطر 35:41 |
| 75 | `blessing_075` | kawn | تسخير الكون | نعمة تسخير الكون | الجاثية 45:13 |
| 76 | `blessing_076` | rizq | البركة | نعمة البركة | الأعراف 7:96 |
| 77 | `blessing_077` | rizq | اليُسر بعد العسر | نعمة اليُسر بعد العسر | الشرح 94:6 |
| 78 | `blessing_078` | mal | الغنى والكفاية | نعمة الغنى والكفاية | الضحى 93:8 |
| 79 | `blessing_079` | nasl | الجار | نعمة الجار | النساء 4:36 |
| 80 | `blessing_080` | nasl | المعلّم | نعمة المعلّم | الكهف 18:66 |
| 81 | `blessing_081` | nasl | العفو بين الناس | نعمة العفو بين الناس | الشورى 42:40 |
| 82 | `blessing_082` | nasl | التعاون | نعمة التعاون | المائدة 5:2 |
| 83 | `blessing_083` | nasl | من يدعو لك بظهر الغيب | نعمة من يدعو لك بظهر الغيب | الحشر 59:10 |
| 84 | `blessing_084` | wijdan | السكينة | نعمة السكينة | الفتح 48:4 |
| 85 | `blessing_085` | wijdan | الفرح المباح | نعمة الفرح المباح | يونس 10:58 |
| 86 | `blessing_086` | wijdan | الأمل | نعمة الأمل | يوسف 12:87 |
| 87 | `blessing_087` | wijdan | الرضا | نعمة الرضا | الفجر 89:28 |
| 88 | `blessing_088` | wijdan | الأنس بالله | نعمة الأنس بالله | الضحى 93:3 |
| 89 | `blessing_089` | wijdan | الضحك والبكاء | نعمة الضحك والبكاء | النجم 53:43 |
| 90 | `blessing_090` | wijdan | النِّعَم الباطنة | نعمة النِّعَم الباطنة | لقمان 31:20 |
| 91 | `blessing_091` | wijdan | حلاوة الإيمان | نعمة حلاوة الإيمان | الحجرات 49:7 |
| 92 | `blessing_092` | wijdan | انشراح الصدر | نعمة انشراح الصدر | الشرح 94:1 |
| 93 | `blessing_093` | din | حِلم الله وإمهاله | نعمة حِلم الله وإمهاله | فاطر 35:45 |
| 94 | `blessing_094` | aql | القلم والكتابة | نعمة القلم والكتابة | العلق 96:4 |
| 95 | `blessing_095` | aql | الذاكرة | نعمة الذاكرة | العلق 96:5 |
| 96 | `blessing_096` | kawn | الفلك والسفن | نعمة الفلك والسفن | يس 36:41 |
| 97 | `blessing_097` | kawn | الركوب والتنقّل | نعمة الركوب والتنقّل | الزخرف 43:13 |
| 98 | `blessing_098` | kawn | الثمار | نعمة الثمار | عبس 80:31 |
| 99 | `blessing_099` | kawn | زينة البحر | نعمة زينة البحر | الرحمن 55:22 |
| 100 | `blessing_100` | kawn | الحديد والمعادن | نعمة الحديد والمعادن | الحديد 57:25 |
| 101 | `blessing_101` | din | الطهارة | نعمة الطهارة والوضوء | المائدة 5:6 |
| 102 | `blessing_102` | din | الأذان | نعمة الأذان | فصلت 41:33 |
| 103 | `blessing_103` | din | الصيام | نعمة الصيام | البقرة 2:183 |
| 104 | `blessing_104` | din | الصدقة | نعمة الصدقة | البقرة 2:261 |
| 105 | `blessing_105` | din | قيام الليل | نعمة قيام الليل | السجدة 32:16 |
| 106 | `blessing_106` | din | الاستغفار | نعمة الاستغفار | نوح 71:10 |
| 107 | `blessing_107` | din | الصلاة على النبي ﷺ | نعمة الصلاة على النبي ﷺ | الأحزاب 33:56 |
| 108 | `blessing_108` | din | العيد | نعمة العيد | الحج 22:37 |
| 109 | `blessing_109` | din | الحياء | نعمة الحياء | القصص 28:25 |
| 110 | `blessing_110` | din | الخشوع | نعمة الخشوع | المؤمنون 23:1–2 |
| 111 | `blessing_111` | din | سعة الرحمة | نعمة سعة رحمة الله | الأعراف 7:156 |
| 112 | `blessing_112` | din | مضاعفة الحسنات | نعمة مضاعفة الحسنات | الأنعام 6:160 |
| 113 | `blessing_113` | din | العشر | نعمة العشر من ذي الحجة | الفجر 89:1–2 |
| 114 | `blessing_114` | din | النصيحة | نعمة النصيحة | آل عمران 3:104 |
| 115 | `blessing_115` | din | الرسل | نعمة إرسال الرسل | النساء 4:165 |
| 116 | `blessing_116` | kawn | السماء | نعمة السماء المحفوظة | الأنبياء 21:32 |
| 117 | `blessing_117` | kawn | الأنهار | نعمة الأنهار والعيون | النمل 27:61 |
| 118 | `blessing_118` | kawn | السحاب | نعمة السحاب | الروم 30:48 |
| 119 | `blessing_119` | kawn | الصباح | نعمة الفجر والصباح | الأنعام 6:96 |
| 120 | `blessing_120` | kawn | الفصول | نعمة تعاقب الفصول | قريش 106:2 |
| 121 | `blessing_121` | kawn | النخل | نعمة النخل | ق 50:10 |
| 122 | `blessing_122` | kawn | الزيتون | نعمة الزيتون | المؤمنون 23:20 |
| 123 | `blessing_123` | kawn | الألوان | نعمة اختلاف الألوان | فاطر 35:27 |
| 124 | `blessing_124` | kawn | الزوجية | نعمة الزوجية في الخلق | الذاريات 51:49 |
| 125 | `blessing_125` | kawn | الماء العذب | نعمة الماء العذب | الفرقان 25:53 |
| 126 | `blessing_126` | kawn | الشجر | نعمة الشجر الأخضر | يس 36:80 |
| 127 | `blessing_127` | kawn | البرق والرعد | نعمة البرق والرعد | الرعد 13:12 |
| 128 | `blessing_128` | nasl | الإخوة | نعمة الإخوة والأخوات | طه 20:29–31 |
| 129 | `blessing_129` | nasl | الأجداد | نعمة الأجداد | البقرة 2:133 |
| 130 | `blessing_130` | nasl | الأحفاد | نعمة الأحفاد | النحل 16:72 |
| 131 | `blessing_131` | nasl | الضيافة | نعمة الضيف والضيافة | الذاريات 51:24 |
| 132 | `blessing_132` | nasl | الهدية | نعمة الهدية | الإنسان 76:8 |
| 133 | `blessing_133` | nasl | السلام | نعمة إفشاء السلام | النساء 4:86 |
| 134 | `blessing_134` | nasl | الكلمة الطيبة | نعمة الكلمة الطيبة | إبراهيم 14:24 |
| 135 | `blessing_135` | nasl | حسن الخلق | نعمة حسن الخلق | القلم 68:4 |
| 136 | `blessing_136` | nasl | الجماعة | نعمة المجتمع والجماعة | آل عمران 3:103 |
| 137 | `blessing_137` | nasl | المواساة | نعمة من يواسيك في الشدة | التوبة 9:40 |
| 138 | `blessing_138` | nasl | القدوة | نعمة القدوة الصالحة | الأحزاب 33:21 |
| 139 | `blessing_139` | nasl | المعروف | نعمة المعروف من الناس | الرحمن 55:60 |
| 140 | `blessing_140` | wijdan | الرحمة | نعمة الرحمة في القلب | آل عمران 3:159 |
| 141 | `blessing_141` | wijdan | المحبة | نعمة المحبة | مريم 19:96 |
| 142 | `blessing_142` | wijdan | التواضع | نعمة التواضع | الفرقان 25:63 |
| 143 | `blessing_143` | wijdan | الحلم | نعمة الحلم والأناة | فصلت 41:34 |
| 144 | `blessing_144` | wijdan | الشجاعة | نعمة الشجاعة | آل عمران 3:173 |
| 145 | `blessing_145` | wijdan | حب الخير | نعمة حب الخير للناس | الحشر 59:9 |
| 146 | `blessing_146` | wijdan | الإنجاز | نعمة لذة الإنجاز | الشرح 94:7–8 |
| 147 | `blessing_147` | wijdan | الحزن | نعمة الحزن الذي يرقّق القلب | يوسف 12:86 |
| 148 | `blessing_148` | wijdan | سلامة الصدر | نعمة سلامة الصدر | الشعراء 26:88–89 |
| 149 | `blessing_149` | wijdan | التأمل | نعمة الدهشة والتأمل | الغاشية 88:17–20 |
| 150 | `blessing_150` | wijdan | الصدق | نعمة الصدق | التوبة 9:119 |
| 151 | `blessing_151` | wijdan | الوفاء | نعمة الوفاء | المؤمنون 23:8 |
| 152 | `blessing_152` | afiyah | الشفاء | نعمة الشفاء | الأنبياء 21:83 |
| 153 | `blessing_153` | afiyah | الدواء | نعمة الدواء والطب | الشعراء 26:80 |
| 154 | `blessing_154` | afiyah | اللمس | نعمة اللمس والإحساس | الملك 67:23 |
| 155 | `blessing_155` | afiyah | الشمّ | نعمة الشمّ | يوسف 12:94 |
| 156 | `blessing_156` | afiyah | الأسنان | نعمة الأسنان والمضغ | البقرة 2:172 |
| 157 | `blessing_157` | afiyah | العظام | نعمة العظام | المؤمنون 23:14 |
| 158 | `blessing_158` | afiyah | الدم | نعمة جريان الدم | ق 50:16 |
| 159 | `blessing_159` | afiyah | الهضم | نعمة الهضم | الأعراف 7:31 |
| 160 | `blessing_160` | afiyah | المناعة | نعمة المناعة | يوسف 12:64 |
| 161 | `blessing_161` | afiyah | الجلد | نعمة الجلد | الزمر 39:23 |
| 162 | `blessing_162` | afiyah | الصوت | نعمة الصوت | لقمان 31:19 |
| 163 | `blessing_163` | afiyah | التوازن | نعمة التوازن | الانفطار 82:7 |
| 164 | `blessing_164` | nafs | الطفولة | نعمة الطفولة | غافر 40:67 |
| 165 | `blessing_165` | nafs | الشباب | نعمة الشباب | الروم 30:54 |
| 166 | `blessing_166` | nafs | طول العمر | نعمة طول العمر | فاطر 35:11 |
| 167 | `blessing_167` | nafs | اللباس | نعمة اللباس | الأعراف 7:26 |
| 168 | `blessing_168` | nafs | الاستيقاظ | نعمة الاستيقاظ ليوم جديد | الزمر 39:42 |
| 169 | `blessing_169` | nafs | الراحة | نعمة الراحة | الفرقان 25:47 |
| 170 | `blessing_170` | nafs | الإرادة | نعمة الإرادة والاختيار | الإنسان 76:3 |
| 171 | `blessing_171` | nafs | البدايات | نعمة البدايات الجديدة | الضحى 93:4–5 |
| 172 | `blessing_172` | nafs | الدفء | نعمة الدفء | النحل 16:5 |
| 173 | `blessing_173` | nafs | الزينة | نعمة الزينة والجمال | الأعراف 7:32 |
| 174 | `blessing_174` | rizq | الخبز | نعمة الخبز والحبوب | يس 36:33 |
| 175 | `blessing_175` | rizq | التمر | نعمة التمر | مريم 19:25 |
| 176 | `blessing_176` | rizq | الخضروات | نعمة الخضروات | عبس 80:27–28 |
| 177 | `blessing_177` | rizq | الملح | نعمة الملح | فاطر 35:12 |
| 178 | `blessing_178` | rizq | الاجتماع على الطعام | نعمة الاجتماع على الطعام | الإنسان 76:9 |
| 179 | `blessing_179` | rizq | الرزق غير المحتسب | نعمة الرزق من حيث لا تحتسب | الطلاق 65:3 |
| 180 | `blessing_180` | rizq | الحلال الطيب | نعمة الحلال الطيب | البقرة 2:168 |
| 181 | `blessing_181` | rizq | الشبع | نعمة الشبع | طه 20:118 |
| 182 | `blessing_182` | aql | العربية | نعمة اللغة العربية | يوسف 12:2 |
| 183 | `blessing_183` | aql | القراءة | نعمة القراءة | العلق 96:1 |
| 184 | `blessing_184` | aql | التفكّر | نعمة التفكّر | آل عمران 3:191 |
| 185 | `blessing_185` | aql | الحكمة | نعمة الحكمة | البقرة 2:269 |
| 186 | `blessing_186` | aql | الفهم | نعمة الفهم | الأنبياء 21:79 |
| 187 | `blessing_187` | aql | الخيال | نعمة الخيال | الحشر 59:21 |
| 188 | `blessing_188` | aql | التمييز | نعمة التمييز بين الحق والباطل | الأنفال 8:29 |
| 189 | `blessing_189` | aql | التعلّم من الخطأ | نعمة التعلّم من الخطأ | آل عمران 3:135 |
| 190 | `blessing_190` | amn | الوطن | نعمة الوطن | إبراهيم 14:35 |
| 191 | `blessing_191` | amn | السِّلم | نعمة السِّلم وغياب الحرب | الأنفال 8:61 |
| 192 | `blessing_192` | amn | العدل | نعمة العدل | النحل 16:90 |
| 193 | `blessing_193` | amn | السفر | نعمة السلامة في السفر | الإسراء 17:66 |
| 194 | `blessing_194` | amn | النجاة | نعمة النجاة من المصائب | الأنبياء 21:88 |
| 195 | `blessing_195` | amn | الطمأنينة | نعمة الطمأنينة بعد الخوف | الأنفال 8:11 |
| 196 | `blessing_196` | mal | الإنفاق | نعمة الإنفاق في الخير | البقرة 2:274 |
| 197 | `blessing_197` | mal | سداد الدَّين | نعمة سداد الدَّين | البقرة 2:280 |
| 198 | `blessing_198` | mal | التجارة | نعمة التجارة والبيع | الجمعة 62:10 |
| 199 | `blessing_199` | mal | الأمانة | نعمة الأمانة في المال | النساء 4:58 |
| 200 | `blessing_200` | mal | الميراث | نعمة الميراث | النساء 4:7 |
| 201 | `blessing_201` | din | الوحي | نعمة الوحي | الشورى 42:52 |
| 202 | `blessing_202` | din | الملائكة | نعمة الملائكة | فاطر 35:1 |
| 203 | `blessing_203` | din | الإيمان بالغيب | نعمة الإيمان بالغيب | البقرة 2:3 |
| 204 | `blessing_204` | din | اليقين | نعمة اليقين | الذاريات 51:20 |
| 205 | `blessing_205` | din | الخوف من الله | نعمة الخوف من الله | الرحمن 55:46 |
| 206 | `blessing_206` | din | الرجاء | نعمة الرجاء | البقرة 2:218 |
| 207 | `blessing_207` | din | الحج | نعمة الحج | الحج 22:27 |
| 208 | `blessing_208` | din | العمرة | نعمة العمرة | البقرة 2:158 |
| 209 | `blessing_209` | din | صلاة الفجر | نعمة صلاة الفجر | الإسراء 17:78 |
| 210 | `blessing_210` | din | السجود | نعمة السجود | العلق 96:19 |
| 211 | `blessing_211` | din | التلاوة | نعمة تلاوة القرآن | فاطر 35:29 |
| 212 | `blessing_212` | din | حفظ القرآن | نعمة حفظ القرآن | القمر 54:17 |
| 213 | `blessing_213` | din | الصحابة | نعمة الصحابة | التوبة 9:100 |
| 214 | `blessing_214` | din | العلماء | نعمة العلماء الربانيين | فاطر 35:28 |
| 215 | `blessing_215` | din | الشفاعة | نعمة الشفاعة | طه 20:109 |
| 216 | `blessing_216` | din | عفو الله | نعمة عفو الله | الشورى 42:25 |
| 217 | `blessing_217` | din | قبول الأعمال | نعمة قبول الأعمال | الكهف 18:30 |
| 218 | `blessing_218` | din | الحسنات الماحية | نعمة الحسنات الماحية | هود 11:114 |
| 219 | `blessing_219` | din | الصدقة الجارية | نعمة الصدقة الجارية | يس 36:12 |
| 220 | `blessing_220` | din | النية | نعمة النية الصالحة | الأنعام 6:162 |
| 221 | `blessing_221` | din | الأضحية | نعمة الأضحية | الكوثر 108:1 |
| 222 | `blessing_222` | din | يوم عرفة | نعمة يوم عرفة | البقرة 2:198 |
| 223 | `blessing_223` | din | الاعتكاف | نعمة الاعتكاف | البقرة 2:125 |
| 224 | `blessing_224` | din | الورع | نعمة الورع | النازعات 79:40 |
| 225 | `blessing_225` | din | التسبيح | نعمة التسبيح | الإسراء 17:44 |
| 226 | `blessing_226` | din | الحمد | نعمة الحمد | الفاتحة 1:2 |
| 227 | `blessing_227` | din | الإيمان بالقدر | نعمة الإيمان بالقدر | القمر 54:49 |
| 228 | `blessing_228` | din | رؤية الله | نعمة رؤية الله في الآخرة | القيامة 75:22 |
| 229 | `blessing_229` | din | كلمة التوحيد | نعمة كلمة التوحيد | محمد 47:19 |
| 230 | `blessing_230` | din | المحاسبة | نعمة محاسبة النفس | الحشر 59:18 |
| 231 | `blessing_231` | kawn | الهواء | نعمة الهواء | الحجر 15:22 |
| 232 | `blessing_232` | kawn | التراب | نعمة التراب | طه 20:55 |
| 233 | `blessing_233` | kawn | الحجارة | نعمة الحجارة | البقرة 2:74 |
| 234 | `blessing_234` | kawn | الصحراء | نعمة الصحراء | النمل 27:63 |
| 235 | `blessing_235` | kawn | الوديان | نعمة الوديان | الرعد 13:17 |
| 236 | `blessing_236` | kawn | الثلج | نعمة الثلج والبَرَد | النور 24:43 |
| 237 | `blessing_237` | kawn | الندى | نعمة الندى | البقرة 2:265 |
| 238 | `blessing_238` | kawn | الضحى | نعمة الضحى | الضحى 93:1 |
| 239 | `blessing_239` | kawn | الغروب | نعمة الغروب | ق 50:39 |
| 240 | `blessing_240` | kawn | النحل | نعمة النحل | النحل 16:68 |
| 241 | `blessing_241` | kawn | النمل | نعمة النمل | النمل 27:18 |
| 242 | `blessing_242` | kawn | الخيل | نعمة الخيل | النحل 16:8 |
| 243 | `blessing_243` | kawn | الإبل | نعمة الإبل | يس 36:71 |
| 244 | `blessing_244` | kawn | الأسماك | نعمة الأسماك | المائدة 5:96 |
| 245 | `blessing_245` | kawn | الأزهار | نعمة الأزهار | النمل 27:60 |
| 246 | `blessing_246` | kawn | العنب | نعمة العنب | المؤمنون 23:19 |
| 247 | `blessing_247` | kawn | الرمان | نعمة الرمان | الرحمن 55:68 |
| 248 | `blessing_248` | kawn | التين | نعمة التين | التين 95:1 |
| 249 | `blessing_249` | kawn | السنابل | نعمة السنابل | يوسف 12:47 |
| 250 | `blessing_250` | kawn | البساتين | نعمة البساتين | سبأ 34:15 |
| 251 | `blessing_251` | kawn | المراعي | نعمة المراعي | الأعلى 87:4 |
| 252 | `blessing_252` | kawn | سعة الكون | نعمة سعة الكون | الذاريات 51:47 |
| 253 | `blessing_253` | kawn | الدواب | نعمة الدواب | النور 24:45 |
| 254 | `blessing_254` | kawn | الماء الجوفي | نعمة الماء الجوفي | المؤمنون 23:18 |
| 255 | `blessing_255` | kawn | الأرض الخصبة | نعمة الأرض الخصبة | الأعراف 7:58 |
| 256 | `blessing_256` | nasl | الأعمام والأخوال | نعمة الأعمام والأخوال | الأنفال 8:75 |
| 257 | `blessing_257` | nasl | الأصهار | نعمة الأصهار | الفرقان 25:54 |
| 258 | `blessing_258` | nasl | رفقة السفر | نعمة رفقة السفر | الكهف 18:60 |
| 259 | `blessing_259` | nasl | الصديق القديم | نعمة الصديق القديم | الزخرف 43:67 |
| 260 | `blessing_260` | nasl | البنات | نعمة البنات | الشورى 42:49 |
| 261 | `blessing_261` | nasl | بر الأبناء | نعمة بر الأبناء | مريم 19:14 |
| 262 | `blessing_262` | nasl | اليتيم | نعمة كفالة اليتيم | الضحى 93:6 |
| 263 | `blessing_263` | nasl | كبار السن | نعمة كبار السن | الإسراء 17:23 |
| 264 | `blessing_264` | nasl | الزملاء | نعمة زملاء العمل | القصص 28:26 |
| 265 | `blessing_265` | nasl | التلاميذ | نعمة التلاميذ | آل عمران 3:79 |
| 266 | `blessing_266` | nasl | الإمام | نعمة الإمام والخطيب | السجدة 32:24 |
| 267 | `blessing_267` | nasl | من يخدمك | نعمة من يخدمك | الزخرف 43:32 |
| 268 | `blessing_268` | nasl | الاعتذار | نعمة الاعتذار | يوسف 12:91 |
| 269 | `blessing_269` | nasl | الصلح | نعمة الصلح بين المتخاصمين | النساء 4:114 |
| 270 | `blessing_270` | nasl | الزيارة | نعمة الزيارة | النور 24:27 |
| 271 | `blessing_271` | nasl | عيادة المريض | نعمة عيادة المريض | الشعراء 26:80 |
| 272 | `blessing_272` | nasl | التعزية | نعمة التعزية | البقرة 2:155 |
| 273 | `blessing_273` | nasl | الابتسامة | نعمة الابتسامة | النمل 27:19 |
| 274 | `blessing_274` | nasl | المشورة | نعمة المشورة | الشورى 42:38 |
| 275 | `blessing_275` | nasl | اجتماع العائلة | نعمة اجتماع العائلة | يوسف 12:99 |
| 276 | `blessing_276` | nasl | ذكرى الراحلين | نعمة ذكرى الراحلين | إبراهيم 14:41 |
| 277 | `blessing_277` | nasl | شكر الناس | نعمة شكر الناس | لقمان 31:14 |
| 278 | `blessing_278` | wijdan | الحنين | نعمة الحنين | القصص 28:13 |
| 279 | `blessing_279` | wijdan | الشوق | نعمة الشوق إلى الله | العنكبوت 29:5 |
| 280 | `blessing_280` | wijdan | الهدوء | نعمة الهدوء | طه 20:108 |
| 281 | `blessing_281` | wijdan | حسن الظن | نعمة حسن الظن بالله | الطلاق 65:7 |
| 282 | `blessing_282` | wijdan | الكرم | نعمة الكرم | آل عمران 3:92 |
| 283 | `blessing_283` | wijdan | الإحسان | نعمة الإحسان | البقرة 2:195 |
| 284 | `blessing_284` | wijdan | الصمود | نعمة الصمود | آل عمران 3:139 |
| 285 | `blessing_285` | wijdan | العزة | نعمة العزة | المنافقون 63:8 |
| 286 | `blessing_286` | wijdan | الكرامة | نعمة الكرامة | الإسراء 17:70 |
| 287 | `blessing_287` | wijdan | الاستغناء | نعمة الاستغناء عن الناس | البقرة 2:273 |
| 288 | `blessing_288` | wijdan | البشاشة | نعمة البشاشة | عبس 80:38 |
| 289 | `blessing_289` | wijdan | الرقة | نعمة الرقة | المائدة 5:83 |
| 290 | `blessing_290` | wijdan | الغيرة | نعمة الغيرة المحمودة | النور 24:30 |
| 291 | `blessing_291` | wijdan | الإنصاف | نعمة الإنصاف | المائدة 5:8 |
| 292 | `blessing_292` | wijdan | الامتنان | نعمة الامتنان | إبراهيم 14:34 |
| 293 | `blessing_293` | wijdan | الحماس | نعمة الحماس | المطففين 83:26 |
| 294 | `blessing_294` | wijdan | الهمة | نعمة الهمة العالية | آل عمران 3:133 |
| 295 | `blessing_295` | wijdan | التفاؤل | نعمة التفاؤل | الشرح 94:5 |
| 296 | `blessing_296` | wijdan | الصفاء | نعمة الصفاء | الحجر 15:47 |
| 297 | `blessing_297` | wijdan | الأنس بالناس | نعمة الأنس بالناس | الحجرات 49:13 |
| 298 | `blessing_298` | wijdan | الانتماء | نعمة الانتماء | الأنبياء 21:92 |
| 299 | `blessing_299` | wijdan | الندم | نعمة الندم الصادق | القصص 28:16 |
| 300 | `blessing_300` | afiyah | الرئتان | نعمة الرئتين | التكوير 81:18 |
| 301 | `blessing_301` | afiyah | الكبد | نعمة الكبد | الذاريات 51:21 |
| 302 | `blessing_302` | afiyah | الكليتان | نعمة الكليتين | الانفطار 82:8 |
| 303 | `blessing_303` | afiyah | الدماغ | نعمة الدماغ | الإسراء 17:36 |
| 304 | `blessing_304` | afiyah | الأعصاب | نعمة الأعصاب | السجدة 32:9 |
| 305 | `blessing_305` | afiyah | العضلات | نعمة العضلات | البقرة 2:247 |
| 306 | `blessing_306` | afiyah | المفاصل | نعمة المفاصل | الإنسان 76:28 |
| 307 | `blessing_307` | afiyah | الأصابع | نعمة الأصابع | القيامة 75:4 |
| 308 | `blessing_308` | afiyah | البصمة | نعمة البصمة | الروم 30:22 |
| 309 | `blessing_309` | afiyah | الجفون | نعمة الجفون والرموش | البلد 90:8 |
| 310 | `blessing_310` | afiyah | الدموع | نعمة الدموع | الإسراء 17:109 |
| 311 | `blessing_311` | afiyah | العرق | نعمة العرق | البلد 90:4 |
| 312 | `blessing_312` | afiyah | اللعاب | نعمة اللعاب | طه 20:27 |
| 313 | `blessing_313` | afiyah | الشهية | نعمة الشهية | الطور 52:22 |
| 314 | `blessing_314` | afiyah | التئام الجروح | نعمة التئام الجروح | الإسراء 17:82 |
| 315 | `blessing_315` | afiyah | الحمل والولادة | نعمة الحمل والولادة | الزمر 39:6 |
| 316 | `blessing_316` | afiyah | النمو | نعمة النمو | نوح 71:17 |
| 317 | `blessing_317` | afiyah | النشاط | نعمة النشاط والحيوية | النبأ 78:11 |
| 318 | `blessing_318` | afiyah | الصحة النفسية | نعمة الصحة النفسية | يونس 10:57 |
| 319 | `blessing_319` | afiyah | الشعر والأظافر | نعمة الشعر والأظافر | التغابن 64:3 |
| 320 | `blessing_320` | nafs | الاسم الحسن | نعمة الاسم الحسن | مريم 19:7 |
| 321 | `blessing_321` | nafs | الخصوصية | نعمة الخصوصية | الحجرات 49:12 |
| 322 | `blessing_322` | nafs | الحرية | نعمة الحرية | البقرة 2:256 |
| 323 | `blessing_323` | nafs | السكون | نعمة السكون | الأنعام 6:13 |
| 324 | `blessing_324` | nafs | النظافة | نعمة النظافة | المدثر 74:4 |
| 325 | `blessing_325` | nafs | الماء الدافئ | نعمة الماء الدافئ | ص 38:42 |

By category: din 73, kawn 60, nasl 45, wijdan 43, afiyah 39, nafs 22, rizq 14, aql 13, amn 9, mal 7. `kawn` («نعم الكون») and `wijdan` («نعم الوجدان») do not occur in blessings 1–40.

`legacy/src/data/blessings_ar.json` holds the first 40 as they were before the import. Two lines of those 40 were corrected in this file at the import: the opening line of blessing 19 («هذه الكلمات» for «هذه كلمات»), and in the reflection of blessing 31 a phrase of the hadith that had been set in the Qur'an brackets ﴿ ﴾ is now in « ».

### 1.5 Loader (`src/data/loader.ts`)

| Export | Behaviour |
|---|---|
| `CONTENT_REVIEW_GATE` | Hard-coded `false`. When true, `getAllBlessings()` returns only `approved` blessings; today that would return an empty list |
| `getAllBlessings()` | All blessings, subject to the gate |
| `getBlessingById(id)` | Lookup over all blessings, **not** subject to the gate |

### 1.6 What the review fields do at run time

They are data only. No component reads `quran.verified`, `hadith.gradeVerified`, `scholarQuote.verifiedVerbatim` or a blessing's `reviewStatus`. Unreviewed verses and hadith are displayed exactly like reviewed ones would be. Until `d3dfd92`, `ContentReviewModal` showed an "under review" badge and also stated that 40 blessings were approved while the data says 0. By the owner's decision the badge was removed; the sheet now shows the number of blessings, read from the data, with no statement about review. See [07-screens-core.md](07-screens-core.md).

### 1.7 Where the verse text comes from

**Source.** The Tanzil Project's Qur'an text, type "Simple", version 1.1, downloaded from `tanzil.net` on 17 November 2026 without the optional pause marks, sajdah signs, rub-el-hizb signs and tatweel. This is modern (imla'i) spelling with full vowel marks, not the Uthmani script, although the field is called `textUthmani`.

**Blessings 41–100.** The owner's file gave each blessing a surah and ayah number and no verse text. `quran.textUthmani` is the whole of that ayah, character for character as Tanzil publishes it. Nothing was typed, shortened or joined by hand. Tanzil's file puts the basmala in front of the first ayah of every surah except 1 and 9; it is not part of that ayah and is left out (this affects 91:1 and 94:1). `verified` stays `false` until a named reviewer has read them.

Two independent checks were run on the 60: the letters agree with the text served by `api.quran.com` (v4) for all 60, and the text is identical to the `quran-simple-enhanced` edition of `api.alquran.cloud` once that edition's pause marks are removed.

**Blessings 1–40** were not changed. Compared with the same Tanzil file: 17 are a whole ayah and identical to it, 20 are an exact excerpt of their ayah, and 3 are consecutive ayahs joined by a space (55:1–4, 106:3–4, 103:1–3), identical in letters and vowel marks but with some combining marks stored in a different order. So all 100 verses are Tanzil's Simple text.

**Length.** The longest verse among the first 40 is 18 words, because half of them are excerpts. The 60 are whole ayahs: 24 are longer than 18 words and 10 are longer than 25. Where to cut a verse is a content decision, so none was cut; if the owner wants excerpts, the fragment each reflection itself quotes is the natural candidate:

| Blessing | Ayah | Words | Fragment quoted in its own reflection |
|---|---|---:|---|
| 82 التعاون | المائدة 5:2 | 53 | وتعاونوا على البرّ والتقوى |
| 65 النبات | الأنعام 6:99 | 44 | فأخرجنا به نباتَ كلّ شيء |
| 54 يُسر الدين | الحج 22:78 | 44 | وما جعل عليكم في الدين من حرج |
| 46 محبة الله | المائدة 5:54 | 38 | يحبُّهم ويحبّونه |
| 42 السنّة | الحشر 59:7 | 37 | وما آتاكم الرسولُ فخذوه وما نهاكم عنه فانتهوا |
| 79 الجار | النساء 4:36 | 32 | والجار ذي القربى والجار الجنب |
| 90 النِّعَم الباطنة | لقمان 31:20 | 30 | وأسبغ عليكم نعمه ظاهرةً وباطنة |
| 100 الحديد والمعادن | الحديد 57:25 | 28 | وأنزلنا الحديد فيه بأسٌ شديدٌ ومنافعُ للناس |
| 91 حلاوة الإيمان | الحجرات 49:7 | 28 | ولكنّ الله حبّب إليكم الإيمان وزيّنه في قلوبكم |
| 41 الهداية | الأنعام 6:125 | 28 | فمن يُرِدِ الله أن يهديَه يشرحْ صدره للإسلام |

**Licence.** Tanzil's text is under Creative Commons Attribution 3.0 with these terms: verbatim copies only, the source (Tanzil Project) clearly indicated, and a link to tanzil.net. The app meets the last two in the content sheet (`ContentReviewModal.tsx`), which names the project and links to it. Tanzil's notice, which it asks to be kept with the text:

```
Tanzil Quran Text (Simple, Version 1.1)
Copyright (C) 2007-2026 Tanzil Project
License: Creative Commons Attribution 3.0

This copy of the Quran text is carefully produced, highly verified and
continuously monitored by a group of specialists at Tanzil Project.

TERMS OF USE:
- Permission is granted to copy and distribute verbatim copies of this text,
  but CHANGING IT IS NOT ALLOWED.
- This Quran text can be used in any website or application, provided that its
  source (Tanzil Project) is clearly indicated, and a link is made to tanzil.net
  to enable users to keep track of changes.
- This copyright notice shall be included in all verbatim copies of the text,
  and shall be reproduced appropriately in all files derived from or containing
  substantial portion of this text.

Please check updates at: http://tanzil.net/updates/
```

**Verses quoted inside the reflections are a different thing.** The `tadabbur` paragraphs quote verses in ﴿ ﴾ in the author's own light vowelling; they are not copied from Tanzil. All 139 such fragments across the 100 blessings were compared, letters only, with the Qur'an text. Two did not match, and both were corrected at the import: in blessing 88, «أينما» was written as one word where Al-Hadid 4 has «أَيْنَ مَا»; in blessing 31 the bracketed phrase was not Qur'an at all but words of the hadith (see 1.4).

**For the reviewer, in blessings 41–100.** No hadith is given as a hadith, but five texts lean on one without a source: the `scholarQuote` of blessing 51 (الجمعة) is close to the wording of two hadith and is labelled «مستفاد من كلام أهل العلم»; the `scholarQuote` of 54 (يُسر الدين) and the reflections of 79 (الجار), 83 (من يدعو لك بظهر الغيب) and 91 (حلاوة الإيمان) each report a hadith by meaning. In 30 of the 60 the reflection quotes a verse other than the one in `quran`; those are supporting verses, not mistakes in the reference.

**Blessings 101–125.** Each verse is the whole ayah from the same Tanzil file, processed as above, except two pairs of consecutive ayahs joined by a space, as in three of the first 40: Al-Mu'minun 23:1–2 (blessing 110) and Al-Fajr 89:1–2 (blessing 113); `ayahNumber` holds the first. The processing was checked by reproducing all 60 verses of 41–100 from the downloaded file, character for character, before any new verse was taken. No ayah is used by two blessings. The longest verses are Al-Ma'idah 5:6 (65 words, blessing 101), Al-A'raf 7:156 (34) and Ar-Rum 30:48 (29); the owner kept them whole. The `tadabbur` drafts quote no verse in ﴿ ﴾; they paraphrase the verse, and they contain no hadith, by wording or by meaning. Two state an exegetical view the reviewer should confirm: blessing 113 says that many exegetes take the «ليال عشر» of Al-Fajr 89:2 to be the first ten nights of Dhu al-Hijjah, and blessing 122 says that the tree of Al-Mu'minun 23:20 is the olive. Blessing 102 uses Fussilat 41:33 for the call to prayer, which the verse does not name. Blessing 122's claim is the reading of al-Sa'di, whose words are now its scholar quote.

### 1.8 Where the hadith, the quotes and the sourced supplications come from

Added on 23 November 2026 at the owner's request, so that blessings 41–125 have the same fields as the first 40. Nothing was typed or recalled: each text was located in a published source and copied by script (the start and end of the span are matched with diacritics removed, and the span is taken from the source with its own vowel marks). The only changes are removing the source's quotation marks and right-to-left marks and collapsing spaces.

- **Hadith** (`hadith`, and `duaaSourced` where the source is a hadith collection): the Arabic editions of Sahih al-Bukhari and Sahih Muslim in `fawazahmed0/hadith-api` (version 1, `editions/ara-bukhari` and `ara-muslim`, fetched from jsDelivr). Only the matn is kept, without the isnad; where the Prophet's words sit inside a short exchange (blessings 42, 66, 87, 113, 114, 121) or a narration (56, 71, 72, 94, 125), the whole exchange is kept. Bukhari numbers are the edition's numbers. Muslim numbers are the edition's `arabicnumber` (the Fu'ad 'Abd al-Baqi numbering, without the sub-number); for blessings 84 and 93 the edition gives none and the number between its neighbours is used (2700, 2759). **The reviewer should check two numbers in particular:** blessing 83 is 2732 in the edition, while the Umm al-Darda' narration of this wording is usually cited as 2733; and every Muslim number should be checked against a printed edition. The Bukhari 834 copy of the supplication in blessing 93 has two corrupted characters in this edition, so the same wording at Bukhari 6326 is used.
- **Scholar quotes on 101–125**: Tafsir al-Sa'di (تيسير الكريم الرحمن) and, for blessing 124, al-Tafsir al-Muyassar, from `api.quran.com` v4 (`tafsirs/91` and `tafsirs/16`), each the commentary on the blessing's own verse except 113 (Al-Fajr 1, which covers the ten nights) and 120 (Al-Anbiya' 32, which mentions the seasons). The source's own punctuation is kept, including two ASCII commas in 103, an ASCII semicolon in 124 and a missing space in 116.
- **Sourced supplications from the Qur'an**: Tanzil, as in 1.7. Most are an exact excerpt of an ayah, starting where the supplication starts; Ta-Ha 20:25–26 (blessing 92) joins two ayahs.
- **Licences to confirm**: the hadith-api data is published without restriction; Tanzil's terms are in 1.7; al-Sa'di died in 1956 and al-Muyassar is published by the King Fahd Complex, whose terms the owner should confirm before release.
- **Blessings 126–150** were built with every field at once, on the same rules. At the owner's instruction (23 November) a hadith may repeat one used elsewhere and may come from outside the two Sahihs if it is graded sahih or hasan; Dorar.net, which the owner suggested as a reference, refuses automated requests, so the one such hadith, Tirmidhi 3895 «خيركم خيركم لأهله» on blessing 128 (also cited on blessing 24), was taken from the same hadith-api edition, which records al-Albani's grade «Sahih»; `grade` holds that grade. Blessing 132 keeps Bukhari 2585: the owner's «تهادوا تحابوا» is in al-Adab al-Mufrad, which is not in the edition, so it can be added once its text is supplied with its reference. Blessing 149's hadith contains a verse in braces in the source; the braces are shown as ﴿ ﴾. 126 and 127 have no hadith, and 147's quote is from al-Muyassar.
- **Blessings 151–175** follow the same rules. Hadith outside the two Sahihs: Tirmidhi 2380, 2329 and 2819, Abu Dawud 4985 and al-Nasa'i 3939, each graded sahih, hasan or hasan sahih by al-Albani in the edition; three sourced supplications are from Abu Dawud (3851, 5088, 5074, graded sahih). Abu Dawud 4023, the supplication on wearing a new garment, was not used, because al-Albani's grade in the edition is «Hasan» for a narration whose closing words he is known to have judged weak. Four verses repeat ones already used (Al-Shu'ara' 80, Qaf 16, Al-A'raf 26, Al-Nahl 5), as do three hadith (Bukhari 2989 and 660, Muslim 2664 and 91), which the owner allowed. The Bukhari 3818 text ends mid-sentence in the edition; the span used ends before the break. Blessings 161 and 172 have no hadith; four quotes are from al-Muyassar (153, 155, 161, 174).
- **Blessings 176–200** follow the same rules (hadith outside the Sahihs: Tirmidhi 2344, 3926, 3505, Abu Dawud 3764, 3534; sourced supplication Tirmidhi 3563, graded hasan). Blessing 178 uses Al-Insan 76:9 rather than Al-Nur 61, which was proposed first but is 76 words long. Blessings 177 and 182 have no hadith. Across 41–200, 14 blessings have no hadith (92, 96, 97, 99, 116, 122, 123, 124, 126, 127, 161, 172, 177, 182) and 52 carry a sourced supplication.
- **Blessings 201–225**: first batch of a third hundred (201–400, eight batches of 25), all «نعم الدين». Hadith outside the Sahihs: Tirmidhi 2450, 2910, 1987, 2518 and Abu Dawud 3641, graded sahih or hasan by al-Albani; sourced supplications include Tirmidhi 3502, 3513 and 3585 and Muslim 770. Blessing 204 has no hadith.
- **Blessings 226–250**: second batch of the third hundred: the last five «نعم الدين» and twenty «نعم الكون». Hadith outside the Sahihs: Tirmidhi 3383 and 2417, Ibn Majah 2305 (graded sahih or hasan by al-Albani); sourced supplications include al-Nasa'i 1305 and the istikhara (Bukhari 1166). Ten have no hadith (231, 234, 236, 237, 240, 245–248, 250). The verse filter now also removes the basmala Tanzil writes with a shadda before Al-Tin 1 and Al-Qadr 1 (no earlier blessing used either).
- **Blessings 251–275**: third batch of the third hundred: the last five «نعم الكون» and twenty «نعم الأهل». Hadith outside the Sahihs: Abu Dawud 2548 and 4919, Tirmidhi 1919, 2685, 2499, 1956 and 2369 (al-Albani: sahih or hasan); sourced supplication Abu Dawud 3106. Six have no hadith (252, 254, 255, 257, 264, 275). Three verses repeat earlier ones (Al-Zukhruf 67, Al-Isra' 23, Al-Shu'ara' 80).
- **Blessings 276–300**: fourth batch of the third hundred: the last two «نعم الأهل», all twenty-two «نعم الوجدان» and the first «نعم العافية» (الرئتان). Hadith outside the Sahihs: Abu Dawud 4811, Ibn Majah 4216 and 4252, Tirmidhi 2507 (al-Albani: sahih); sourced supplications Tirmidhi 2035 and Abu Dawud 1522. Blessing 300 has no hadith. The Tirmidhi 2507 text keeps the edition's vowelling «الْمُسْلِمَ», which the reviewer should check.
- **Blessings 301–325**: afiyah 2–20 (organs and body functions) and nafs 1–6 (a good name, privacy, freedom, stillness, cleanliness, warm water). Eight have no hadith where none fit; Muslim 223 is given by its standard number. Al-Muyassar used for 30:22, 17:109, 39:6, 78:11.
- **Fit**: each hadith was chosen for its subject and is not a commentary on the verse. Two are only loosely tied to their blessing: 94 (القلم والكتابة) is Abu Hurayra's remark that 'Abd Allah ibn 'Amr used to write, not words of the Prophet, and 98 (الثمار) is the simile of the citron and the date for readers of the Qur'an. No sahih hadith was chosen for 92, 96, 97, 99, 116, 122, 123 and 124; 92 and 97 still have a sourced supplication.

## 2. Journey content (`src/data/journey_content.json`)

Schema types live in `src/lib/journeyStore.ts:6`–`50` (`JourneyContentFile`, `JourneyStageContent`, `JourneyStationContent`, `AuthoredTextField`, `SacredPlaceholderField`).

- File level: `schemaVersion: 1`, `reviewStatus: 'pending_review'`, empty `reviewedBy`, `reviewDate: null`. The `contentNote` describes two trial stages; the file now has four.
- Each stage: `id`, `theme`, `focusLabel`, `focusDescription`, `title`, review fields, an `intention` (`AuthoredTextField`) and 7 `stations`.
- Each station: `blessingId` (an existing blessing id), `journalPrompt` and `dailyAction` (both `AuthoredTextField`), and optionally `sacredPlaceholder` and `dhikrPlaceholder`.

| Stage id | Theme | Focus label | Title | Station blessings (in order) |
|---|---|---|---|---|
| `stage_ibadah` | `din` | العبادات ومواسمها | منزل نعمة العبادة | islam, 002, 003, 005, 006, 007, 009 |
| `stage_badan` | `afiyah` | البدن والحواس | منزل نعمة البدن | 035, 036, 037, 038, 017, 014, 021 |
| `stage_ahl` | `nasl` | الأهل والمودة | منزل نعمة الأهل | 022, 023, 024, 025, 026, 027, 033 |
| `stage_rizq` | `rizq` | الرزق والسكينة | منزل نعمة الرزق والسكينة | 015, 016, 028, 030, 031, 032, 039 |

All 28 `journalPrompt` and `dailyAction` texts are `pending_review`. 14 stations carry a `sacredPlaceholder` (10 with `[[AYAH_TOKEN]]`, 4 with `[[HADITH_TOKEN]]`) and 14 carry a `dhikrPlaceholder` (`[[HADITH_TOKEN]]`); all have `verifiedVerbatim: false`. The tokens are stand-ins for sacred text that has not been written into the file. At `68e723a` the only review field read at run time was `dailyAction.reviewStatus` (`src/components/journey/JourneyStationFlow.tsx:460`), which showed a label; `d3dfd92` removed it, so no review field is read at run time now.

Twelve blessings are not part of any stage: 004, 008, 010, 011, 012, 013, 018, 019, 020, 029, 034, 040.

Full per-station tables are in [09-journey.md](09-journey.md).

## 3. Hisn Al-Muslim (`src/data/hisnAlMuslim.ts`)

| Export | Contents |
|---|---|
| `HisnCategoryId` | `'morning' \| 'evening' \| 'prayer' \| 'sleep' \| 'home' \| 'dua'` |
| `HisnCategory` | `{ id, title, subtitle, badge }` |
| `HisnDhikrItem` | `{ id, categoryId, title, text, isQuran?, count, source, virtue? }` |
| `HISN_CATEGORIES` | 6 categories: أذكار الصباح, أذكار المساء, أذكار بعد الصلاة, أذكار النوم والاستيقاظ, أذكار المنزل والخروج, أذكار الكرب وجوامع الدعاء |
| `HISN_ADHAKR` | 23 items: morning 6, evening 5, prayer 4, sleep 3, home 2, dua 3 |
| `HisnDailyTip`, `HISN_DAILY_TIPS` | 7 tips, each `{ id, title, content, evidence, source }` |
| `getDailyHisnTip(date?)` | `tips[dayOfYear mod 7]`, using local time |

The adhkar carry no review fields at all, unlike blessings and journey content. The per-item table is in [08-screens-worship-settings-paywall.md](08-screens-worship-settings-paywall.md).

## 4. Inspirations and dhikr

- `src/data/inspirations.ts`: 8 items, 4 Qur'an and 4 hadith, each `{ type, text, source }`. One is shown per day on Home as «آية اليوم» or «حديث اليوم». The file declares its own `Inspiration` interface, identical to `InspirationItem` in `src/types.ts:88`.
- `src/data/dhikr.ts`: 9 items `{ text, virtue? }`. `TasbihModal` always uses the first one (`src/components/screens/TasbihModal.tsx:53`); `getTodayDhikr`, which would rotate them, is imported by nothing.

Neither file has review fields.

## 5. Strings (`src/constants/strings.ts`)

`APP_STRINGS` is one object. Only part of it is used:

| Key | Used by |
|---|---|
| `tabs.home`, `tabs.journey`, `tabs.journal`, `tabs.consistency`, `tabs.tasbih` | `BottomTabBar`, `DesktopNavBar` |
| `composeTitle`, `prompts.what`, `prompts.whatPlaceholder`, `prompts.q1`–`q3`, `prompts.answerPlaceholder` | `ComposeBlessingModal` |
| `appName`, `tagline`, `availableNow`, `startWithFirstAyah`, `blessingAwaiting`, `tabs.hisn`, `tabs.settings`, `onboarding[]`, `tourSteps[]`, `consistencyTitle`, `consistencySubtitle`, `reminderLabel`, `composeSubtitle`, `completionGreeting` | nothing |

The five onboarding screens and four tour steps written here are not the ones the user sees: `OnboardingScreen` and `SpotlightTour` carry their own inline copy. Nearly all other UI text is inline in the components, so there is no single place to review or translate copy.

## 6. Categories (`src/constants/categories.ts`)

`CATEGORIES` is the list of 10 `{ key, label }` pairs used for journal filters, the compose form and the charts. The last two were added with blessings 41–100:

| Key | Label |
|---|---|
| `deen` | نعم الدين |
| `nafs` | نعم الحياة والنفس |
| `nasl` | نعم الأهل |
| `rizq` | نعم الرزق |
| `afiyah` | نعم العافية |
| `aql` | نعم العقل |
| `amn` | نعم الأمن |
| `mal` | نعم المال |
| `kawn` | نعم الكون |
| `wijdan` | نعم الوجدان |

The first key is `deen` here and `din` in `blessings_ar.json` and in the journey themes. Components match on the Arabic `label`, so nothing breaks today, but the keys cannot be joined.

`mapOldCategoryToCanonical(old?)` maps a category label to one of the ten labels by substring, tried in this order: «الدين», «النفس» or «الحياة», «النسل» or «الأهل», «المال», «العقل», «العافية», «الأمن», «الرزق», «الكون», «الوجدان». The last two are needed because journal entries written on a new blessing carry its label, and without them the charts and a restored backup would file those entries under «نعم الحياة والنفس». Missing input maps to «نعم الدين»; unrecognised input maps to «نعم الحياة والنفس». It is used by the backup importer and by `ReflectionCategoryCharts`.

## 7. Content review status at a glance

| Content | Items | Approved | Has review fields |
|---|---:|---:|---|
| Blessings | 100 | 0 | yes |
| Journey stage intentions | 4 | 0 | yes |
| Journey station prompts and actions | 56 | 0 | yes |
| Journey sacred and dhikr placeholders | 28 | 0 | yes (text not yet written) |
| Hisn Al-Muslim adhkar | 23 | n/a | no |
| Hisn daily tips | 7 | n/a | no |
| Inspirations | 8 | n/a | no |
| Tasbih dhikr | 9 | n/a | no |
