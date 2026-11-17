# Content and data

All content ships inside the JavaScript bundle. There is no CMS and no remote fetch; changing a text means changing a file in `src/data/` or `src/constants/` and redeploying.

| File | Lines | What it holds | Consumed by |
|---|---:|---|---|
| `src/data/blessings_ar.json` | 2,806 | 40 blessings, the core content | `data/loader.ts` |
| `src/data/loader.ts` | 17 | Access functions and the review gate | store, charts, journey |
| `src/data/journey_content.json` | 725 | 4 journey stages × 7 stations | `lib/journeyStore.ts` |
| `src/data/hisnAlMuslim.ts` | 358 | 6 categories, 23 adhkar, 7 daily tips | `HisnScreen`, `HomeScreen`, `App` |
| `src/data/inspirations.ts` | 48 | 8 verses and hadith for "verse of the day" | `lib/dailyLogic.ts` |
| `src/data/dhikr.ts` | 16 | 9 short adhkar with their virtue | `TasbihModal`, `lib/dailyLogic.ts` |
| `src/constants/strings.ts` | 101 | A partial string table | nav bars, `ComposeBlessingModal` |
| `src/constants/categories.ts` | 28 | The 8 blessing categories and a legacy mapper | journal, compose, charts, store |

## 1. Blessings (`src/data/blessings_ar.json`)

### 1.1 File shape (`BlessingsData`, `src/types.ts:56`)

```jsonc
{
  "schemaVersion": 2,
  "contentNote": "جميع النصوص الشرعية (قرآن/حديث/أقوال) بحالة pending_review — …",
  "blessings": [ Blessing, … ]   // 40 items
}
```

The `contentNote` states that every sacred text is `pending_review`, that Qur'anic spelling must be matched against a trusted source and hadith must be sourced before `reviewStatus` changes to `approved`, and that all scholar quotes are paraphrases.

### 1.2 `Blessing` (`src/types.ts:34`)

| Field | Type | Notes |
|---|---|---|
| `id` | string | `islam` for the first, then `blessing_002` … `blessing_040` |
| `order` | number | 1–40; the daily rotation sorts on it |
| `category` | string | `din`, `nafs`, `rizq`, `aql`, `nasl`, `mal`, `amn`, `afiyah` |
| `categoryLabel` | string | Arabic label, e.g. «نعم الدين» |
| `title` / `shortTitle` | string | «نعمة الإسلام» / «الإسلام» |
| `openingLine` | string | One-sentence hook shown under the title |
| `quran` | `{ textUthmani, surahName, surahNumber, ayahNumber, verified }` | `verified` is `false` on all 40 |
| `hadith` | `{ text, source, number, grade, gradeVerified }` | grade is «صحيح» on 37 and «حسن» on 3; `gradeVerified` is `false` on all 40 |
| `scholarQuote` | `{ text, scholar, work, attributionType, verifiedVerbatim }` | `attributionType` is `paraphrase` and `verifiedVerbatim` is `false` on all 40 |
| `istisharSteps` | `IstisharStep[]` | Always 5 steps, see 1.3 |
| `tadabbur` | string | Longer reflection paragraph |
| `duaa` | string | Supplication shown at the end |
| `journalPrompt` | string | Question for the private journal |
| `relatedPodcastEpisode` | string | Set on 17 blessings (e.g. `ep_islam`), empty on 23. No component reads it |
| `reviewStatus` | string | `pending_review` on all 40 |
| `reviewedBy`, `reviewDate` | string, string \| null | Empty / `null` on all 40 |
| `contentVersion` | number | `1` on all 40 |

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

### 1.4 The 40 blessings

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

By category: din 13, nafs 6, nasl 6, rizq 4, afiyah 4, aql 3, amn 3, mal 1.

`legacy/src/data/blessings_ar.json` is byte-identical to this file.

### 1.5 Loader (`src/data/loader.ts`)

| Export | Behaviour |
|---|---|
| `CONTENT_REVIEW_GATE` | Hard-coded `false`. When true, `getAllBlessings()` returns only `approved` blessings; today that would return an empty list |
| `getAllBlessings()` | The 40 blessings, subject to the gate |
| `getBlessingById(id)` | Lookup over all blessings, **not** subject to the gate |

### 1.6 What the review fields do at run time

They are data only. No component reads `quran.verified`, `hadith.gradeVerified`, `scholarQuote.verifiedVerbatim` or a blessing's `reviewStatus`. Unreviewed verses and hadith are displayed exactly like reviewed ones would be. `ContentReviewModal` tells the user the number of approved blessings is 40 while the data says 0; see [07-screens-core.md](07-screens-core.md).

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

All 28 `journalPrompt` and `dailyAction` texts are `pending_review`. 14 stations carry a `sacredPlaceholder` (10 with `[[AYAH_TOKEN]]`, 4 with `[[HADITH_TOKEN]]`) and 14 carry a `dhikrPlaceholder` (`[[HADITH_TOKEN]]`); all have `verifiedVerbatim: false`. The tokens are stand-ins for sacred text that has not been written into the file. The only review field read at run time is `dailyAction.reviewStatus` (`src/components/journey/JourneyStationFlow.tsx:460`).

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

`CATEGORIES` is the list of 8 `{ key, label }` pairs used for journal filters, the compose form and the charts:

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

The first key is `deen` here and `din` in `blessings_ar.json` and in the journey themes. Components match on the Arabic `label`, so nothing breaks today, but the keys cannot be joined.

`mapOldCategoryToCanonical(old?)` maps a v1 category label to one of the eight labels by substring («الدين», «النفس» or «الحياة», «النسل» or «الأهل», «المال», «العقل», «العافية», «الأمن», «الرزق»). Missing input maps to «نعم الدين»; unrecognised input maps to «نعم الحياة والنفس». It is used by the backup importer and by `ReflectionCategoryCharts`.

## 7. Content review status at a glance

| Content | Items | Approved | Has review fields |
|---|---:|---:|---|
| Blessings | 40 | 0 | yes |
| Journey stage intentions | 4 | 0 | yes |
| Journey station prompts and actions | 56 | 0 | yes |
| Journey sacred and dhikr placeholders | 28 | 0 | yes (text not yet written) |
| Hisn Al-Muslim adhkar | 23 | n/a | no |
| Hisn daily tips | 7 | n/a | no |
| Inspirations | 8 | n/a | no |
| Tasbih dhikr | 9 | n/a | no |
