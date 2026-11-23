# ٥. المخطط التقني

هذا الملف للمطوّر ولـ Claude Code. يصف بنية المشروع الجديد، مع ذكر ما يُنقل من «الحمد» وما يُبنى بطريقة أخرى لأنه سبّب أخطاءً هناك.

## ١. المكدس

| الطبقة | الاختيار | ملاحظة |
|---|---|---|
| الواجهة | React 19 + TypeScript بوضع `strict` من أول سطر | في «الحمد» لم تكن أنواع React مثبتة، فلم يُفحص أي مكوّن، وظهرت ٣١١٩ خطأ حين فُعّل `strict` |
| البناء | Vite 6 أو أحدث، وBun | |
| التنسيق | Tailwind v4، **والألوان كلها متغيرات CSS دلالية** معرّفة في `@theme` | لا قيم hex داخل المكوّنات. انظر القسم ٨ |
| الحالة | Zustand مع `persist` (فيه `version` و`migrate` جاهزان) | بدل Context واحد يعيد رسم كل شيء مع كل تغيير (PF-02) |
| التحقق من البيانات | Zod: للمحتوى وقت البناء، وللنسخة الاحتياطية عند الاستيراد | |
| الحركة | `motion` بقدر قليل، مع `useReducedMotion` | |
| الأيقونات | `lucide-react` أو أيقونات الهوية الجديدة | |
| PWA | `vite-plugin-pwa` | تثبيت وعمل بلا إنترنت من أول إصدار |
| الاختبارات | Vitest للمنطق، وPlaywright للتدفقات | لا اختبارات في «الحمد» إطلاقًا |
| النشر | Vercel، موقع ثابت | |

**لا** تبدأ من قالب Google AI Studio ولا من نسخة «الحمد». ابدأ مستودعًا نظيفًا (`bun create vite` بقالب `react-ts`)، ثم انقل الملفات المذكورة في القسم ١٣ فقط.

## ٢. هيكل المستودع

```
.
├── CLAUDE.md                     # من templates/CLAUDE.md
├── docs/
│   ├── handoff/                  # هذه الحقيبة
│   └── reference/                # توثيق الكود، يُحدَّث مع كل تغيير
├── content/
│   ├── duas/                     # بطاقة لكل ملف: dua_0001.json …
│   ├── sources/                  # ملف نص القرآن كما نُزّل، مع ترخيصه
│   └── themes.json               # وسوم الحاجة وأسماؤها
├── scripts/
│   ├── fetch-quran.ts            # يملأ quran.fullText من content/sources بالسورة والآية
│   ├── validate-content.ts       # الفحوص في 03 القسم ٧، ويفشل البناء عند أي خطأ
│   ├── build-content.ts          # يجمع البطاقات المعتمدة في ملف واحد للتطبيق
│   └── check-promises.ts         # يفحص الوعود (انظر القسم ١٠)
├── src/
│   ├── app/                      # الغلاف، والتنقل، وحاجز الأخطاء
│   ├── screens/                  # شاشة لكل مجلد: today/ library/ notebook/ calendar/ settings/ onboarding/
│   ├── features/
│   │   ├── live-dua/             # التجربة الموجّهة
│   │   ├── share/                # بطاقة المشاركة
│   │   └── backup/
│   ├── components/               # مكوّنات مشتركة صغيرة: Dialog، Card، SacredText، Switch…
│   ├── lib/                      # منطق خالص بلا React: dates، daily، hijri، arabic، search، calendarReminder
│   ├── state/                    # المخزن، ومفاتيح التخزين، والترحيل
│   ├── content/                  # أنواع المحتوى والوصول إليه
│   ├── copy/ar.ts                # كل نصوص الواجهة في مكان واحد
│   └── styles/                   # tokens.css وأنماط النص المقدس
├── landing/                      # الصفحة التعريفية (مدخل ثانٍ، تُولَّد ثابتة)
└── tests/                        # e2e
```

قواعد: لا مكوّن فوق ٣٠٠ سطر (في «الحمد» وصل أحدها إلى ١٣٩٨). المنطق الخالص في `lib/` ومختبَر. نصوص الواجهة في `copy/ar.ts` لا داخل المكوّنات (في «الحمد» كان ملف النصوص موجودًا وغير مستخدم، والنصوص الفعلية مبعثرة).

## ٣. الأيام والتواريخ

انسخ `reusable-code/dates.ts` كما هو. القواعد:

- كل مفتاح «أي يوم هو» يأتي من `toLocalDateString()`. **لا** `toISOString().slice(0, 10)` أبدًا: هذا يوم UTC، وهو ما زال «أمس» حتى الثالثة فجرًا بتوقيت الرياض.
- قراءة `"YYYY-MM-DD"` بـ `parseLocalDateString()`، لا بـ `new Date(str)` (يقرؤها UTC فيعطي اليوم السابق غرب غرينتش).
- `useLocalDay()` في المخزن، ليتغيّر دعاء اليوم عند منتصف الليل دون إعادة تحميل.
- الطوابع الزمنية الكاملة (`completedAt`، `exportedAt`) تبقى ISO عادي.

## ٤. أنواع المحتوى

```ts
// src/content/types.ts
export type DuaKind = 'quran' | 'sunnah' | 'athar';
export type StepType = 'presence' | 'scene' | 'meaning' | 'need' | 'supplicate';
export const STEP_ORDER: StepType[] = ['presence', 'scene', 'meaning', 'need', 'supplicate'];

export interface Citation {
  work: string;          // «تفسير ابن كثير»
  location?: string;     // «الأنبياء: ٨٧» أو «ج٢ ص٣٠١»
  url?: string;
}

export interface QuranSource {
  surah: number;
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
  fullText: string;      // مجلوب آليًا، لا يُحرَّر
  edition: string;       // "tanzil-uthmani-1.1" مثلًا
}

export interface HadithSource {
  collection: string;    // «صحيح مسلم»
  number: string;        // "2705"
  numbering: string;     // «ترقيم محمد فؤاد عبد الباقي»
  narrator: string;
  fullNarration: string; // يُلصق من المصدر
  grade: 'صحيح' | 'حسن';
  gradeNote: string;     // «متفق عليه» / «صححه الألباني في صحيح سنن أبي داود»
  sourceUrl: string;
  alsoIn?: string[];
}

export interface GuidedStep {
  type: StepType;
  text: string;
  durationSec: number;   // 8–30
}

export interface ReviewChecks {
  textMatchesSource: boolean;
  referenceCorrect: boolean;
  gradeConfirmed: boolean;      // للسنة؛ true تلقائيًا للقرآن
  excerptApproved: boolean;     // للقرآن إن كان الدعاء جزءًا من آية
  contextFaithful: boolean;
  meaningSourced: boolean;
  quotedFragmentsMatch: boolean;
  authoredReviewed: boolean;
}

export interface Review {
  status: 'draft' | 'pending_verification' | 'verified' | 'approved' | 'needs_changes';
  checks: ReviewChecks;
  /** المرحلة الأولى: التحقق من المصادر (Claude). */
  verification: { by: string; at: string | null; report: string };
  /** المرحلة الثانية: المراجع الشرعي المسمّى. */
  approval: { reviewer: string; at: string | null };
  notes: string;
}

export interface Dua {
  id: string;                    // "dua_0001"، ثابت إلى الأبد
  order: number;
  kind: DuaKind;
  title: string;
  shortTitle: string;
  hook: string;
  speaker: string;
  sceneLine: string;
  text: string;                  // نص الدعاء حرفيًا
  quran?: QuranSource;           // kind === 'quran'
  hadith?: HadithSource;         // kind === 'sunnah'
  context: { retelling: string; basis: Citation[] };
  meaning: { glossary: { term: string; meaning: string }[]; summary: string; basis: Citation[] };
  reflections: string[];
  steps: GuidedStep[];           // خمس، بترتيب STEP_ORDER
  whenToSay?: { text: string; note?: string };
  repeatCount?: number;
  journalPrompt: string;
  themes: string[];
  review: Review;
  contentVersion: number;
}
```

وتُكتب مخططات Zod نفسها في `src/content/schema.ts`، ويستعملها سكريبت الفحص والتطبيق معًا.

### بوابة المراجعة

`scripts/build-content.ts` يكتب `src/content/generated/duas.json`:

- في الإنتاج: البطاقات التي بلغت `CONTENT_MIN_LEVEL` فقط (`approved` افتراضيًا، أو `verified` لإطلاق تجريبي؛ انظر `03` §٨). إن قلّ عددها عن حد أدنى (مثلًا ٣٠) يفشل البناء.
- يُحمل مستوى كل بطاقة إلى التطبيق، فتعرض «عن المحتوى» عدد ما بلغ كل مستوى.
- في المعاينة (`CONTENT_PREVIEW=1`): كل البطاقات، والمسودات تظهر بشارة «مسودة» واضحة، والأماكن الفارغة `<<…>>` تظهر بلون تحذيري.

ملف المحتوى يُحمَّل كقطعة منفصلة (`import()` ديناميكي)، لا داخل الحزمة الرئيسية.

## ٥. اختيار دعاء اليوم

انسخ `reusable-code/daily.ts` (مختبَر). الفكرة كما في «الحمد» بعد إصلاحه:

```ts
dayNumber(localDay)          // رقم متصل لكل يوم تقويمي محلي
pickForDay(localDay, pool)   // pool مرتّب بـ order، بلا دعاء الترحيب: pool[dayNumber mod n]
resolveToday({ today, welcomeDoneOn, all, welcomeId })
  // دعاء الترحيب حتى يُتمّه المستخدم، ويبقى يوم إتمامه، ثم التناوب من الغد
```

- الجميع يرى الدعاء نفسه في التاريخ نفسه، ويتغير عند منتصف الليل المحلي لكل مستخدم.
- **ما رآه المستخدم يُحفظ بمعرّفه** في سجل الإتمام، فتغيّر حجم المجموعة لا يغيّر الماضي.
- إضافة بطاقات تغيّر دعاء الأيام القادمة للجميع مرة واحدة. إن أردت ألا يتغيّر دعاء اليوم لحظة النشر: انشر قبيل منتصف الليل، أو اجعل `pool` يتغيّر من تاريخ محدد (`effectiveFrom` لكل بطاقة جديدة، فتدخل المجموعة من ذلك التاريخ). الخيار الثاني مدعوم في `daily.ts`.

## ٦. التخزين

### قواعد

- اسم واحد بنمط واحد لكل مفتاح: `qareeb:اسم:v1`. في «الحمد» نمطان (`alhamd_snake` و`alhamd:colon:v1`) وثلاثة مفاتيح بلا مالك.
- كل المفاتيح في ملف واحد `src/state/keys.ts`، وكلها موثقة في `docs/reference/storage.md`. **المفتاح لا يُعاد تسميته والشكل لا يتغير بلا ترحيل.**
- الترحيل عبر `version` و`migrate` في Zustand `persist`، مع اختبار لكل ترحيل.
- لا يُكتب أي شيء في التخزين في أول تشغيل إلا ما فعله المستخدم. (في «الحمد» بدأ كل مستخدم جديد بثلاثة أيام «مكتملة» ومدخلتين في الدفتر لم يكتبهما، P-01.)
- لا مفاتيح يومية تتراكم (في «الحمد» مفتاح جديد كل يوم لعدّادات حصن المسلم، لا يُحذف أبدًا).

### المفاتيح

| المفتاح | الشكل |
|---|---|
| `qareeb:settings:v1` | `{ theme: 'system' \| 'light' \| 'dark', fontScale: number, fontFamily: string, showMyDuasInFlow: boolean }` |
| `qareeb:onboarding:v1` | `{ completedAt: string \| null }` |
| `qareeb:welcome:v1` | `{ doneOn: "YYYY-MM-DD" \| null }` |
| `qareeb:completions:v1` | `Array<{ date: "YYYY-MM-DD", duaId: string, completedAt: string, intention?: 'sujood' \| 'after_prayer' \| 'before_sleep' \| 'now' }>` (مدخلة واحدة لكل يوم) |
| `qareeb:notebook:v1` | `Array<{ id, date, duaId?, text, createdAt, updatedAt }>` |
| `qareeb:my-duas:v1` | `Array<{ id, text, note?, createdAt, answeredAt?: string, answerNote?: string }>` |
| `qareeb:favorites:v1` | `string[]` (معرّفات الأدعية) |
| `qareeb:drafts:v1` | `{ [duaId: string]: { notebookText?: string, updatedAt: string } }`، تُحذف عند الحفظ |

### النسخة الاحتياطية

```jsonc
{
  "app": "qareeb",
  "backupVersion": 1,
  "exportedAt": "2026-11-23T18:00:00.000Z",
  "data": { "settings": {…}, "completions": […], "notebook": […], "myDuas": […], "favorites": […] }
}
```

- التصدير والاستيراد متماثلان: كل ما يُصدَّر يُستورد (في «الحمد» كانت ثلاثة إعدادات تُصدَّر ولا تُستورد، وأشياء أخرى لا تُصدَّر أصلًا).
- الاستيراد: تحقق Zod لكل سجل، وحدود للحجم، ورفض القيم غير المعروفة، ثم ملخص («١٢٠ يومًا، ٤٥ مدخلة، ١٨ دعوة») وتأكيد، ثم الاستبدال. الفشل رسالة خطأ لا علامة نجاح.
- النص في الخصوصية يقول بدقة إن الملف نص عادي غير مشفّر (في «الحمد» قالت السياسة إنه مشفّر وهو ليس كذلك).
- «امسح كل بياناتي» يحذف كل مفاتيح `qareeb:` بعد تأكيد.

## ٧. التنقل والروابط

- حالة التبويب في الرابط عبر hash بسيط (`#/today`، `#/library`، `#/notebook`، `#/calendar`، `#/settings`، `#/dua/:id`)، بموجّه صغير مكتوب يدويًا أو مكتبة خفيفة.
- كل شاشة تُحمَّل كسولة (`React.lazy`). في «الحمد» كان التطبيق كله قطعة واحدة ١ ميغابايت.

## ٨. التصميم والثيمات

- `src/styles/tokens.css`: متغيرات دلالية فقط (`--surface`، `--surface-raised`، `--text`، `--text-muted`، `--accent`، `--cta`، `--sacred-quran`، `--hairline`…) بقيم الثيم الداكن والفاتح.
- الثيم: `prefers-color-scheme` افتراضيًا، و`data-theme` على `<html>` عند اختيار المستخدم، **في مكان واحد فقط**. (في «الحمد» وُضع صنف الثيم على عنصرين، فتعطّل التباين العالي في الوضع الفاتح، D-03.)
- `@theme` في Tailwind يربط المتغيرات بأسماء أدوات (`bg-surface`، `text-muted`…). هكذا بُنيت الصفحة التعريفية لـ«الحمد» (`src/landing/landing.css`) وكانت سليمة، بخلاف التطبيق الذي كتب ألوان hex في المكوّنات ثم أعاد تلوينها في الوضع الفاتح بنحو ٢٠٠ سطر من `!important`، فبقي ٧٩ لونًا بلا مقابل فاتح.
- فحص في CI: أي لون hex أو `rgb(` داخل `src/` خارج `tokens.css` يفشل الفحص.
- Tailwind يفحص `src/` فقط (`@import "tailwindcss" source("../")` من داخل `src/styles`)، لا المستودع كله.
- الخطوط مستضافة ذاتيًا، ومقتطعة للحروف العربية: خط للنص، وخط للمصحف. لا طلب إلى Google Fonts (يكشف عنوان IP للمستخدم، ويناقض وعد الخصوصية، ويؤخر العرض).
- مكوّن `<SacredText kind="quran|hadith">` واحد يطبّق العلامات (﴿ ﴾ أو « »)، والخط، والاتجاه، ويمنع القطع. لا يُعرض نص مقدس بغيره. (في «الحمد» كان نوع النص يُقارن بقيمة خاطئة، `'ayah'` بدل `'quran'`، فظهرت الآية بعلامات الحديث وخطه، B-04.)
- `index.html`: `lang="ar" dir="rtl"`، وviewport بلا منع للتكبير.

## ٩. المكوّنات الحساسة

### النوافذ

- مكوّن `<Dialog>` واحد: يُرسم في `document.body` عبر `createPortal`، ويستعمل `reusable-code/useDialog.ts` (التركيز، وEscape، وقفل التمرير، وإرجاع التركيز).
- **لا** `transform` ولا `filter` ولا `animation-fill-mode: forwards` على جذر أي شاشة: أي تحويل على عنصر أب يجعل `position: fixed` داخله يتموضع بالنسبة له لا للشاشة. هذا ما جعل نوافذ «الحمد» تفتح خارج الشاشة (U-01). الـ portal يحل المشكلة من أصلها.

### التجربة الموجّهة

- آلة حالات صغيرة صريحة: `step(0..4) → intention → notebook → closing`، في reducer مختبَر.
- مؤقت واحد لكل خطوة يُنظَّف عند التغيير والإغلاق. «أظهر النص كاملًا» يوقف المؤقت.
- تقسيم الجمل بدالة بلا lookbehind (`splitSentences` في `reusable-code/arabicSearch.ts`).
- المسودة تُحفظ في `drafts` مع كل تغيير (بتأخير ٥٠٠ مللي ثانية) وتُحذف عند الحفظ.

### بطاقة المشاركة

- رسم على `canvas` بعد `await document.fonts.ready` وتحميل الخطين صراحة (`document.fonts.load`).
- لفّ الأسطر العربية بقياس الكلمات (`measureText`)، و`ctx.direction = 'rtl'`.
- النص المقدس لا يُقطع: الخط يصغر خطوة خطوة حتى يتسع، فإن لم يتسع عند حد أدنى تطول البطاقة (في مقاس القصة).
- مشاركة الصورة بـ `navigator.share({ files })` حيث يدعمه المتصفح، وإلا تنزيل.
- يُنقل منطق اللف والرسم من `src/components/common/ShareCardModal.tsx` في «الحمد».

### الاهتزاز

`navigator.vibrate` لا يعمل على iOS إطلاقًا. استعمله زينةً فقط، ومرة واحدة لكل فعل (في «الحمد» كان إتمام واحد يُطلق اهتزاز النجاح أربع مرات).

## ١٠. الوعود كفحوص آلية

`scripts/check-promises.ts` يعمل في CI ويفشل إن:

- وُجدت في `src/` أسماء مثل `streak` أو `consecutive` أو `badge` أو `points`. ونصوص الواجهة التي تذكر «متتالية» أو «سلاسل» تُفحص مقابل قائمة استثناء صريحة، لأن بعضها يَعِد بغيابها («بلا سلاسل»، «ولا أيام متتالية»).
- وُجد `fetch(` أو `XMLHttpRequest` أو `sendBeacon` أو `WebSocket` في `src/`، إلا في قائمة سماح مكتوبة (فارغة في الإصدار الأول).
- وُجد `<link>` إلى نطاق خارجي في `index.html`.
- وُجد `user-scalable=no` أو `maximum-scale`.
- وُجد `toISOString().slice(0, 10)` أو `toISOString().split('T')[0]`.

(في «الحمد» كتب فرع غير مدموج سكريبتًا مماثلًا، `scripts/check-promises.mjs` في الفرع `claude/trusting-rubin-9ue5hh`.)

## ١١. التذكير

- لا يظهر في الواجهة مفتاح تذكير لا يعمل (درس P-04).
- الإصدار الأول: «أضف إلى تقويمك» عبر ملف `.ics` بحدث يومي متكرر (`reusable-code/calendarReminder.ts`). لا خادم، ولا إذن إشعارات، ويعمل حتى إن لم يُفتح التطبيق.
- لاحقًا إن لزم: تطبيق أصلي بـ Capacitor مع Local Notifications (الإصدار الأول من «الحمد»، في `legacy/`، استعمل Capacitor). Web Push يحتاج خادمًا يعرف اشتراك المستخدم، فيُدرس أثره على وعد الخصوصية قبل أي قرار.

## ١٢. النشر والأمان

- **النطاق يُحسم قبل الإطلاق ولا يتغير**: التخزين المحلي مربوط بالمصدر (origin)، فنقل التطبيق من نطاق إلى آخر يُفقد المستخدمين بياناتهم.
- إن كانت الصفحة التعريفية على النطاق الرئيسي والتطبيق على نطاق فرعي (كما في «الحمد»): Vercel يقدّم `index.html` الموجود قبل تطبيق قواعد إعادة الكتابة، فإما أن يُسمّى ملف التطبيق `app.html` في البناء (حل «الحمد»: `vite build && mv dist/index.html dist/app.html`) وإما أن يكون لكلٍّ منهما مشروع Vercel منفصل. المشروعان المنفصلان أبسط وأوضح.
- ولا يجيب التطبيق إلا على نطاقه (إعادة توجيه من أي مسار آخر)، حتى لا تتوزع بيانات المستخدم على مصدرين (في «الحمد» كان `alhamd.app/app.html` يفتح التطبيق بتخزين منفصل).
- ترويسات الأمان في `vercel.json`: `Content-Security-Policy` (`default-src 'self'` مع ما يلزم فقط)، و`frame-ancestors 'none'`، و`X-Content-Type-Options: nosniff`، و`Referrer-Policy: strict-origin-when-cross-origin`، و`Permissions-Policy`.
- لا شيء داخلي في `public/` (في «الحمد» نُشرت أوراق التصميم ولقطات العمل علنًا).
- لا أدوات مطوّر في الإنتاج. ما يلزم للتطوير خلف `import.meta.env.DEV`.

## ١٣. ما يُنقل من «الحمد»

| الملف في «الحمد» | في الحقيبة | الحالة |
|---|---|---|
| `src/lib/dates.ts` | `reusable-code/dates.ts` | كما هو، ومعه `dates.test.ts` |
| `src/lib/arabic.ts` | `reusable-code/arabic.ts` | كما هو |
| `src/lib/hijri.ts` | `reusable-code/hijri.ts` | كما هو. تحسين مقترح لاحقًا (PF-04): إنشاء كائنات `Intl.DateTimeFormat` مرة واحدة بدل إنشائها لكل خلية في التقويم |
| `src/lib/useDialog.ts` | `reusable-code/useDialog.ts` | كما هو |
| `src/lib/dailyLogic.ts` | `reusable-code/daily.ts` | معمّم، ومعه `effectiveFrom`، ومختبَر |
| — | `reusable-code/arabicSearch.ts` | جديد: تطبيع العربية للبحث، وتقسيم الجمل بلا lookbehind، ومختبَر |
| — | `reusable-code/calendarReminder.ts` | جديد: ملف تقويم بحدث يومي، ومختبَر |
| `src/components/common/ShareCardModal.tsx` | لا | يُنقل منطق الرسم واللف منه، مع إعادة كتابة الواجهة |
| `src/landing/landing.css` | لا | مثال لطريقة الثيمات الصحيحة |
| `src/components/screens/ReflectionModal.tsx` | لا | مرجع للإيقاع والسلوك، لا للنسخ: فيه التوقيت المتشابك والألوان الثابتة |

ليصل Claude Code إلى هذه الملفات في الجلسة الجديدة: أضف مستودع «الحمد» إلى الجلسة للقراءة، أو انسخها يدويًا.

## ١٤. الاختبارات وCI

| الهدف | النوع | الحالات |
|---|---|---|
| `dates.ts` | وحدة | الأيام المحلية في UTC−5 وUTC وUTC+3، والساعة ٠١:٣٠ بتوقيت الرياض، وقراءة النص |
| `daily.ts` | وحدة | ثبات الدعاء في اليوم نفسه، والتغيّر عند منتصف الليل، والالتفاف، ودعاء الترحيب، و`effectiveFrom` |
| `arabicSearch.ts` | وحدة | التشكيل، والهمزات، والتاء المربوطة، والتطويل، وتقسيم الجمل |
| `calendarReminder.ts` | وحدة | صيغة الملف، والوقت المحلي، والهروب من الفواصل |
| المخزن والترحيل | وحدة | كل ترحيل، وإتمام اليوم مرة واحدة |
| النسخة الاحتياطية | وحدة | تصدير ثم استيراد يعيد الحالة نفسها، ورفض الملفات التالفة |
| المحتوى | سكريبت | فحوص `03` القسم ٧ |
| أول تشغيل | e2e | تخزين فارغ، التعريف، دعاء الترحيب، الإتمام، ثم الغد يعرض دعاء اليوم |
| الحلقة اليومية | e2e بساعة مضبوطة | التجربة كاملة، والدفتر، و«دعوت اليوم»، ومنتصف الليل والتطبيق مفتوح |
| النوافذ | e2e | كل نافذة تغطي الشاشة من كل شاشة، وبعد التمرير |
| الثيمات | لقطات | كل شاشة في الفاتح والداكن |
| الوصول | axe | بلا أخطاء حرجة |

CI على GitHub Actions: `lint` (tsc strict)، و`test`، و`validate-content`، و`check-promises`، و`build`، ثم e2e على البناء الإنتاجي. أضف المنطقة الزمنية في الاختبارات: `TZ=Asia/Riyadh` و`TZ=America/New_York`.

## ١٥. الإحصاءات

الإصدار الأول: لا شيء. وإن احتجتها لاحقًا: عدّاد زيارات بلا ملفات تعريف ولا معرّف مستخدم، ولا يحمل أي نص من المستخدم، ويُذكر في الخصوصية باسمه. (في «الحمد» كان سجل الأحداث محليًا لا يُرسل لأحد، أي بلا فائدة لصاحب التطبيق، وموافقته لا يمكن سحبها بعد شاشة التعريف.)

## ١٦. الصفحة التعريفية

- تُولَّد HTML ثابتًا وقت البناء (لا React في المتصفح لصفحة ثابتة). في «الحمد» كانت جسمًا فارغًا يملؤه JavaScript، فلا يراها محرك بحث ولا معاينة رابط.
- صورة مشاركة 1200×630، و`og:url`، و`canonical`.
- لقطات حقيقية من التطبيق، لا شاشات مرسومة يدويًا تتقادم.
- المرحلة الثانية: صفحة ثابتة لكل دعاء معتمد (`/dua/yunus-in-the-whale`) فيها النص والموقف والمعنى ورابط «عِشه في التطبيق». باب نمو من البحث، والمحتوى عام أصلًا.
