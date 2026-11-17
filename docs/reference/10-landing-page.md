# Landing page

> **Changed since this was written** (commits `d3dfd92` to `b8db9cc`, 17 November 2026): the «نصوصٌ موثّقة» card now reads «الآيات بنصّها مع اسم السورة ورقم الآية، والأحاديث بمصدرها ودرجتها.»; the page says 80 seconds wherever it stated a duration («ثمانين ثانية», «ثمانون ثانية، وخمس وقفات», and both meta descriptions). «رحلتي» is now free, so «مجّانًا» holds for the whole app.

State of the code at commit `68e723a` (`main`, 2026-11-16). Line references are `path:line` against that commit.

The landing page is a single static marketing page in Arabic (RTL) for the Alhamd app. It is a second Vite entry that lives beside the app in the same repository and is served at the root of `alhamd.app`. It was added in commit `55ccf2e` (2026-11-10); commit `70602c1` (2026-11-11) changed one line of it (the app URL) and added the host routing.

File names written without a directory (`LandingPage.tsx`, `PhoneMockups.tsx`, `icons.tsx`, `landing.css`, `main.tsx`) are in `src/landing/`.

Statements marked **(measured)** were checked on 2026-11-17 by running `vite build` (Vite 6.4.4) into a scratch directory and loading the output in headless Chromium through Playwright, with requests to Google Fonts blocked. Font rendering was therefore not checked.

## 1. Files

| Path | Lines | Role |
|---|---|---|
| `landing/index.html` | 23 | HTML entry: `lang="ar" dir="rtl"`, meta tags, Google Fonts link, empty `#root`, module script `/src/landing/main.tsx` |
| `src/landing/main.tsx` | 10 | Mounts `<LandingPage />` in `StrictMode`; imports `landing.css` |
| `src/landing/LandingPage.tsx` | 368 | The whole page: constants, copy arrays, small presentational components, the privacy dialog, and the default-exported `LandingPage` |
| `src/landing/PhoneMockups.tsx` | 195 | `StarPattern`, `PhoneFrame`, and two hand-built app screens (`PhoneHomeScreen`, `PhoneReflectScreen`) |
| `src/landing/icons.tsx` | 119 | 13 hand-written stroke icons sharing one `Svg` wrapper |
| `src/landing/landing.css` | 144 | Tailwind import scoped to this folder, design tokens for two themes, Tailwind theme mapping, base rules |

## 2. Build and serving

### 2.1 Entry and bundle

- `vite.config.ts:14-21` declares two Rollup inputs: `main` (`index.html`) and `landing` (`landing/index.html`).
- `landing/index.html:21` loads `/src/landing/main.tsx`, which renders `LandingPage` into `#root` (`src/landing/main.tsx:6-10`).
- The landing code imports nothing from the app. Its only imports are `react`, `react-dom/client`, and the three sibling files (`src/landing/main.tsx:1-4`, `src/landing/LandingPage.tsx:1-3`, `src/landing/PhoneMockups.tsx:1-15`, `src/landing/icons.tsx:1`). It does not import `src/index.css`, `lucide-react`, `motion`, the store, or any constant from `src/constants`.
- Nothing in the app imports from `src/landing` (grep for `landing` in `src/` outside `src/landing` returns nothing).
- `src/landing/landing.css:1` is `@import "tailwindcss" source("./");`. The `source("./")` argument limits Tailwind's class scanning to `src/landing/`, so the landing stylesheet contains only utilities used by these files.

Build output **(measured)**:

| File | Size | gzip | Notes |
|---|---|---|---|
| `dist/landing/index.html` | 1.72 kB | 0.83 kB | Vite injects the script, a `modulepreload` for the shared chunk and the stylesheet link into `<head>` |
| `dist/assets/landing-<hash>.js` | 26.29 kB | 7.40 kB | Landing code; its first statement imports from `./client-<hash>.js` |
| `dist/assets/landing-<hash>.css` | 20.26 kB | 5.25 kB | Contains no app selectors (no `.theme-light`, no `--bg-ground`) |
| `dist/assets/client-<hash>.js` | 224.37 kB | 69.71 kB | React and React DOM client, shared with the app entry |

The app's own `main-<hash>.js` (1,031.60 kB) and `main-<hash>.css` (87.89 kB) are not referenced by the landing HTML. The only coupling between the two bundles is the shared React chunk.

### 2.2 Routing

- `package.json:8` builds with `vite build && mv dist/index.html dist/app.html`. After the rename there is no `dist/index.html`; `/` is decided by `vercel.json`.
- `vercel.json:12-16` rewrites `/` to `/landing/index.html` when the host is `alhamd.app`.
- `vercel.json:17-20` rewrites `/` to `/app.html` on every other host.
- `vercel.json:4-9` permanently redirects `www.alhamd.app/*` to `https://alhamd.app/*`.
- `dist/landing/index.html` is an ordinary static file, so it is also addressable as `/landing/index.html` on any host that serves the deployment. This was not checked against the live deployment.
- In development (`package.json:7`, `vite --port=3000 --host=0.0.0.0`) the page is at `http://localhost:3000/landing/` (standard Vite multi-page behaviour; not run here).

### 2.3 Outbound link target

`src/landing/LandingPage.tsx:6` hard-codes `APP_URL = 'https://app.alhamd.app'`. All three "open the app" links use it. There is no environment variable; a preview deployment of the landing page links to the production app.

## 3. Theming

### 3.1 Mechanism

The page has two themes, named in the CSS comment at `src/landing/landing.css:3-7`: **Layl** (dark, the default) and **Nahar** (light).

1. `:root` defines every token with its dark value and sets `color-scheme: dark` (`src/landing/landing.css:8-33`).
2. `@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { … } }` overrides every token with its light value and sets `color-scheme: light` (`src/landing/landing.css:35-62`).
3. `:root[data-theme="light"] { … }` repeats the same light values outside the media query (`src/landing/landing.css:64-89`).

Resulting behaviour **(measured)**:

| OS colour scheme | `<html data-theme>` | Theme shown |
|---|---|---|
| dark or no preference | absent | Layl |
| light | absent | Nahar |
| light | `"dark"` | Layl |
| dark | `"light"` | Nahar |

Nothing in the landing code sets `data-theme`. The string appears only in `src/landing/landing.css:6,36,64`. There is no theme toggle and no script that reads a stored preference, so in practice the theme follows the operating system. The attribute is a hook for manual or future use.

`landing/index.html:6` declares `<meta name="color-scheme" content="dark light">`, and `landing/index.html:13-14` set the browser UI colour per scheme: `#0C0C1C` (dark) and `#F4EDE3` (light), equal to `--l-page` in each theme.

The landing theme is independent of the app's theme setting. The app stores its theme in `localStorage` under `alhamd_theme_v2` and switches `theme-light` / `theme-dark` classes on `<html>` (`src/lib/store.tsx:338-344`); the landing page neither reads that key nor uses those classes. The two are also served from different origins (`alhamd.app` and `app.alhamd.app`), which do not share `localStorage`.

### 3.2 Custom properties

All 23 tokens. Dark values are at `src/landing/landing.css:9-31`; light values are at lines 37-59 and again, identically, at lines 65-87.

| Property | Layl (dark) | Nahar (light) | Tailwind alias | Used for |
|---|---|---|---|---|
| `--l-page` | `#0C0C1C` | `#F4EDE3` | `ah-page` | `body` background; hero, story, closing and footer backgrounds; end colour of the hero fold gradient (`LandingPage.tsx:205`) |
| `--l-deep` | `#111126` | `#EDE3D4` | `ah-deep` | Method and Promise section backgrounds; reflect mock screen background |
| `--l-ground` | `#15152A` | `#F4EDE3` | `ah-ground` | "Inside the app" section background; privacy dialog background; home mock screen background |
| `--l-glass` | `#1E1E38` | `#FBF8F3` | `ah-glass` | Card and pill surfaces in the mockups; dialog close button |
| `--l-sunken` | `#1B1B33` | `#EFE6D9` | `ah-sunken` | Ayah box and round buttons inside the mock blessing card |
| `--l-tabbar` | `#1A1A30` | `#FFFFFF` | `ah-tabbar` | Mock tab bar background |
| `--l-frame` | `#15152A` | `#FFFFFF` | `ah-frame` | Phone frame (bezel) background |
| `--l-hairline` | `#2E2E4A` | `#DCCFBE` | `ah-hairline` | Borders and divider lines |
| `--l-text` | `#EDEDF5` | `#2A1F19` | `ah-text` | Headings and primary text |
| `--l-body` | `#C7C4D8` | `#4A3B32` | `ah-body` | Paragraph text |
| `--l-muted` | `#AEAECB` | `#6B5A4E` | `ah-muted` | Secondary text |
| `--l-accent` | `#E4C368` | `#9E4A30` | `ah-accent` | Accent text (gold in Layl, terracotta ink in Nahar); focus outline; selection text colour; last step marker |
| `--l-stroke` | `#C8A951` | `#B9573B` | `ah-stroke` | Thread lines, dots, outlined-button and pill borders |
| `--l-cta` | `#6C63FF` | `#B9573B` | `ah-cta` | Primary button background |
| `--l-cta-hover` | `#594DFF` | `#8F4229` | `ah-cta-hover` | Primary button hover background |
| `--l-ayah` | `#E4C368` | `#2A1F19` | `ah-ayah` | Qur'an verse text in the home mock |
| `--l-pill` | `rgba(17, 17, 38, 0.6)` | `rgba(244, 237, 227, 0.7)` | `ah-pill` | Hero tagline pill; step chip in the reflect mock |
| `--l-halo` | `rgba(200, 169, 81, 0.18)` | `rgba(185, 87, 59, 0.14)` | none | Ring around the last step marker (`LandingPage.tsx:253`); `::selection` background |
| `--l-pattern` | `rgba(237, 237, 245, 0.05)` | `rgba(42, 31, 25, 0.05)` | none | Stroke of the star lattice (`PhoneMockups.tsx:22`) |
| `--l-cone` | `rgba(237, 237, 245, 0.07)` | `rgba(230, 218, 200, 0)` | none | Radial glow behind hero and closing (`LandingPage.tsx:148,332`). Alpha is 0 in Nahar, so the glow layers draw nothing in the light theme |
| `--l-card-glow` | `rgba(237, 237, 245, 0.05)` | `rgba(230, 218, 200, 0.6)` | none | Radial highlight at the top of the mock blessing card (`PhoneMockups.tsx:112`) |
| `--l-card-shadow` | `0 12px 32px rgba(0, 0, 0, 0.35)` | `0 12px 32px rgba(42, 31, 25, 0.08)` | none | Mock blessing card shadow (`PhoneMockups.tsx:109`) |
| `--l-raised-shadow` | `0 16px 40px rgba(0, 0, 0, 0.45)` | `0 16px 40px rgba(42, 31, 25, 0.12)` | none | Phone frame shadow (`PhoneMockups.tsx:41`) |

### 3.3 Tailwind mapping

`@theme inline` at `src/landing/landing.css:91-112` maps 17 colours `--color-ah-*` to the matching `var(--l-*)` (lines 92-108), which produces utilities such as `bg-ah-page`, `text-ah-accent` and `border-ah-hairline`. It also sets three font families (lines 109-111, see section 10). The six tokens without an alias are consumed through `var()` in inline `style` props and arbitrary-value classes.

### 3.4 Relation to the app's palette

The hex values are copies of the app's palette, not references to it. For example `--l-ground #15152A`, `--l-deep #111126`, `--l-page #0C0C1C`, `--l-glass #1E1E38`, `--l-hairline #2E2E4A`, `--l-accent #E4C368`, `--l-stroke #C8A951`, `--l-cta #6C63FF` and `--l-cta-hover #594DFF` equal the dark tokens at `src/index.css:10-25`, and the light values `#F4EDE3`, `#EDE3D4`, `#FBF8F3`, `#9E4A30`, `#B9573B` equal those at `src/index.css:33-45`. A palette change in the app has to be repeated here by hand, in three blocks.

### 3.5 Other base rules

| Rule | Lines | Effect |
|---|---|---|
| `html { scroll-behavior: smooth }` | `landing.css:114-116` | Animated scrolling for the in-page anchors |
| `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }` | `landing.css:118-122` | Turns that off for users who ask for reduced motion |
| `body` | `landing.css:124-132` | No margin, page background and text colour, sans font, font smoothing, `overflow-x: hidden` |
| `::selection` | `landing.css:134-137` | Halo background, accent text |
| `a:focus-visible, button:focus-visible` | `landing.css:139-143` | 2px accent outline with 3px offset |

## 4. Page sections, in order

The root element is `<div dir="rtl" lang="ar" class="bg-ah-page font-sans text-ah-text">` (`LandingPage.tsx:141`). It contains six `<section>` elements, a `<footer>`, and the privacy `<dialog>`.

### 4.1 Hero — `<section id="top">` (`LandingPage.tsx:143-208`)

- Background: star lattice (`StarPattern id="heroStar"`) and a radial glow using `--l-cone` (lines 144-149).
- `<header>` (lines 151-172): the small wordmark «الحمد» linking to `#top` with `aria-label="الحمد — أعلى الصفحة"`, then `<nav aria-label="أقسام الصفحة">` with four anchor links and an outlined button (table below). The four anchor links have `hidden md:inline` (line 160), so below 768px only the wordmark and «جرّب التطبيق» are shown.
- Tagline pill: «نعمةٌ كلَّ يوم» (lines 175-177).
- `<h1>` (lines 178-182): «النعمة لا تُرى…» then, on a second line in the accent colour, «حتى تغيب.»
- Lead paragraph (lines 183-186): ««الحمد» يضع بين يديك كلَّ يومٍ نعمةً واحدة، ثم يأخذك في دقيقتين من التأمّل: تتخيّل يومك لو غابت، ثم تعود إليها فتحمد الله عليها.»
- Call to action row (lines 187-192): the primary button «ابدأ بنعمة اليوم» (links to `APP_URL`) and plain text «قريبًا على متجر «جوجل بلاي»». The Google Play text is a `<span>`, not a link.
- Hero phone (lines 196-207): `PhoneFrame` containing `PhoneHomeScreen`, in a container of fixed height (540px, 635px from `sm`) with `overflow-hidden`. A gradient from transparent (at 55%) to `--l-page` fades the lower part, so the phone looks cut by the fold. The frame's label is «شاشة «نعمة اليوم» في تطبيق الحمد: نعمة الإسلام مع آيتها من سورة المائدة» (line 198).

Header navigation:

| Label | Target | Source |
|---|---|---|
| الفكرة | `#story` | `LandingPage.tsx:11` |
| التأمّل | `#method` | `LandingPage.tsx:12` |
| في التطبيق | `#inside` | `LandingPage.tsx:13` |
| خصوصيّتك | `#promise` | `LandingPage.tsx:14` |
| جرّب التطبيق | `APP_URL` | `LandingPage.tsx:165-170` |

### 4.2 Story — `<section id="story">` (`LandingPage.tsx:211-227`)

- Eyebrow: «الفكرة».
- Five serif lines beside a vertical thread (a right border in `--l-stroke` with a dot at the top):
  1. «تستيقظ كلَّ صباحٍ فترى النور.»
  2. «تشرب ماءً باردًا، وتسمع صوتًا تحبّه، وتمشي على قدميك إلى حيث تشاء.»
  3. «ولا تلتفت.» (muted)
  4. «فالنعمة إذا دامت صارت عادة، والعادة لا تُشكر.» (muted)
  5. «و«الحمد» يعيد إليك النظر.» (bold, accent)
- Closing paragraph (lines 222-225): «الطريقة قديمة قِدَم الشكر نفسه: استشعار القيمة. لا تعرف قدر الشيء حتى تتخيّل فقده. فإذا تخيّلت، ثم عدت إليه فوجدته بين يديك، خرج الحمد من قلبك قبل لسانك.» The words «استشعار القيمة» are emphasised.
- This section has no heading element; «الفكرة» is a `<span>`.

### 4.3 Method — `<section id="method">` (`LandingPage.tsx:230-279`)

- Eyebrow «التأمّل»; `<h2>` «دقيقتان، وخمس وقفات»; paragraph «جملةٌ بعد جملة، على خلفيةٍ ساكنة. لا شيء يستعجلك، ولا شيء يشغلك عن النعمة.»
- An ordered list of five steps from the `steps` array (`LandingPage.tsx:17-23`). Each item has an `<h3>` title, a duration and a sentence. The first four have a thread and a small dot; the last has no thread, a larger accent dot with a halo ring, and an accent-coloured title (lines 242-266).

| # | Title | Duration shown | Text |
|---|---|---|---|
| 1 | التهيئة والحضور | ١٠ ثوانٍ | خذ نفسًا عميقًا… وأحضر قلبك معي لحظة. |
| 2 | تخيّل الغياب | ٢٠ ثانية | تتخيّل يومك وقد غابت النعمة عنه، لحظةً بلحظة. |
| 3 | التعمّق | ٢٠ ثانية | تمضي أبعد: ما الذي كان سيتغيّر في قلبك وفي من حولك؟ |
| 4 | العودة | ١٥ ثانية | تفتح عينيك، فتجدها ما زالت بين يديك. |
| 5 | الحمد | ١٥ ثانية | تحمد الله عليها بقلبٍ حاضر، لا بلسانٍ معتاد. |

- Beside the list: `PhoneFrame` containing `PhoneReflectScreen`, labelled «شاشة التأمّل «تخيّل الغياب»: جملةٌ واحدة على خلفيةٍ ساكنة، وزرّ «التالي»» (line 273).
- Layout is `flex flex-wrap` with the text column at `flex: 1 1 480px` (lines 231-232); the phone wraps under the text when the row is too narrow.

### 4.4 Inside the app — `<section id="inside">` (`LandingPage.tsx:282-306`)

- Eyebrow «في التطبيق»; `<h2>` «خمسة أبواب، وغايةٌ واحدة»; side note «كلّ ما في التطبيق يعينك على الشكر، ولا شيء فيه يشغلك عنه.»
- A list of six items from the `features` array (`LandingPage.tsx:25-36`), in an auto-fit grid with a minimum column width of `min(320px, 100%)` (line 294). Each item has a 26px icon, an `<h3>` and a paragraph.

| Icon | Title | Text |
|---|---|---|
| `HomeIcon` | نعمة اليوم | نعمةٌ واحدة يتأمّلها الجميع في اليوم نفسه، معها آيتها وحديث اليوم. |
| `CompassIcon` | رحلتي | مسارك أنت مع النعم، تمضي فيه نعمةً بعد نعمة. |
| `BookIcon` | سجل الحمد | دفترك الخاص، تكتب فيه ما وجدته في نفسك. يبقى على جهازك وحده. |
| `CalendarIcon` | المداومة | أيّامك مع النعم في تقويمٍ هجري، بلا عدّاد ولا أيّامٍ «فائتة». |
| `BeadsIcon` | المسبحة | تسبيحٌ بلمسة، واهتزازٌ خفيف عند كلّ ثلاثٍ وثلاثين. |
| `ShieldIcon` | نصوصٌ موثّقة | الآيات بالرسم العثماني، والأحاديث بدرجتها، وكلّ نصٍّ يمرّ على أهل العلم قبل نشره. |

### 4.5 Promise — `<section id="promise">` (`LandingPage.tsx:309-324`)

- Eyebrow «خصوصيّتك ونيّتك»; `<h2>` «الشكر عبادة قلب، فلا نزاحمه بشيء».
- Three columns from the `promises` array (`LandingPage.tsx:38-42`), auto-fit grid with minimum `min(260px, 100%)`:

| `<h3>` | Text |
|---|---|
| بلا حساب. | تفتح التطبيق فتبدأ. لا تسجيل، ولا بريد، ولا كلمة مرور. |
| بلا أرقامٍ تلاحقك. | لا نقاط ولا شارات ولا سلاسل أيّام. المداومة عندنا محاسبةٌ للنفس، لا سباق. |
| سجلّك لك. | نصّ سجلّك لا يغادر جهازك. والإحصاءات بإذنك، ولا تتضمّن حرفًا ممّا كتبت. |

### 4.6 Closing — `<section>` without an id (`LandingPage.tsx:327-340`)

- Background: `StarPattern id="endStar"` and a radial glow.
- The large wordmark (`<Wordmark large />`), the line «كم نعمةً مرّت بك اليوم؟ ابدأ بواحدة.», the primary button «ابدأ بنعمة اليوم» again, and the small line «مجّانًا · بالعربية الفصحى · بلا حساب».
- No heading element.

### 4.7 Footer (`LandingPage.tsx:342-363`)

- Text: «الحمد · نعمةٌ كلَّ يوم · ١٤٤٨ هـ». The Hijri year is a literal.
- `<nav aria-label="روابط التذييل">` with a `<button>` «سياسة الخصوصية» that opens the privacy dialog (line 348), and a `mailto:` link «تواصل معنا» that renders only when `SUPPORT_EMAIL` is non-empty (lines 353-360). `SUPPORT_EMAIL` is `''` (`LandingPage.tsx:8`), so the link is currently never rendered.

### 4.8 Privacy dialog (`LandingPage.tsx:83-135`, mounted at line 365)

A native `<dialog>` titled «سياسة الخصوصية» with a close button (`aria-label="إغلاق"`). Body copy:

- Lead, in the accent colour: «بياناتك بينك وبين الله، لا تغادر جهازك.»
- «نحن نحترم خصوصيتك التامة ونلتزم بحمايتها. صُمم تطبيق «الحمد» ليكون مساحة عبادة وتفكّر آمنة، دون أي حسابات أو خوادم تجمع بياناتك الشخصية.»
- «١. تخزين محلي على جهازك» — «جميع ما تكتبه في «سجل الحمد» وفي «نِعَمي»، وسجل أيام المداومة، يُخزّن محلياً على ذاكرة جهازك وحدك. لا نملك أي وسيلة للاطلاع على ما تدونه.»
- «٢. النسخ الاحتياطي والاستعادة» — «النسخ الاحتياطي يتم يدوياً عن طريق تصدير ملف تحتفظ به بنفسك أينما أردت، ويمكنك استرجاعه في أي وقت بضغطة زر.»
- «٣. الإحصاءات التحسينية (اختيارية)» — «في حال موافقتك، تُجمع بيانات استخدام تقنية مجهولة الهوية تماماً (مثل فتح التطبيق أو إتمام جولة الاستشعار) بهدف تحسين استقرار التطبيق فقط، دون جمع أي نصوص أو معلومات شخصية إطلاقاً.»

The dialog has no "last updated" date, no contact address and no URL of its own.

## 5. Every link and control

| Element | Label | `href` / action | Lines |
|---|---|---|---|
| `<a>` | الحمد (wordmark) | `#top` | `LandingPage.tsx:152-154` |
| `<a>` ×4 | الفكرة / التأمّل / في التطبيق / خصوصيّتك | `#story` / `#method` / `#inside` / `#promise` | `LandingPage.tsx:156-164` |
| `<a>` | جرّب التطبيق | `https://app.alhamd.app` | `LandingPage.tsx:165-170` |
| `<a>` ×2 | ابدأ بنعمة اليوم (`PrimaryCta`) | `https://app.alhamd.app` | `LandingPage.tsx:44-51`, used at 188 and 337 |
| `<button>` | سياسة الخصوصية | `privacyRef.current?.showModal()` | `LandingPage.tsx:346-352` |
| `<a>` (not rendered) | تواصل معنا | `mailto:${SUPPORT_EMAIL}` | `LandingPage.tsx:353-360` |
| `<button>` | إغلاق (icon) | `dialogRef.current?.close()` | `LandingPage.tsx:97-104` |

No link has `target` or `rel`; the app opens in the same tab. The rendered page has exactly 8 anchors and 2 buttons **(measured)**. External requests made by the page itself are limited to Google Fonts (`landing/index.html:15-17`). There is no analytics script, no form and no cookie use.

## 6. Components in `LandingPage.tsx`

| Component | Props | What it renders | Lines |
|---|---|---|---|
| `PrimaryCta` | none | A 56px-high filled link to `APP_URL` with the label «ابدأ بنعمة اليوم» | 44-51 |
| `Wordmark` | `large?: boolean` | «الحمد» in the serif font and accent colour over a thin horizontal line with a dot at the right-hand (starting) end. Small: 30px text. Large: 88px, 128px from `sm`. The line and dot are `aria-hidden` | 54-68 |
| `Eyebrow` | `children` | Small accent-coloured label (`<span>`) above a section title | 70-72 |
| `SectionTitle` | `children` | `<h2>` in the serif font, 2.2rem, `text-5xl` from `sm` | 74-76 |
| `PhoneFit` | `children` | Wrapper that applies CSS `zoom: 0.85` below 400px and `zoom: 0.75` below 340px | 79-81 |
| `PrivacyDialog` | `dialogRef: React.RefObject<HTMLDialogElement \| null>` | The privacy `<dialog>` (section 4.8) | 83-135 |
| `LandingPage` (default export) | none | The page. Holds one `useRef<HTMLDialogElement>` | 137-368 |

Module constants: `APP_URL` (line 6), `SUPPORT_EMAIL` (line 8), `navLinks` (10-15), `steps` (17-23), `features` (25-36), `promises` (38-42).

## 7. Phone mockups (`PhoneMockups.tsx`)

The two "screenshots" are not images. They are DOM built from `<div>` and `<span>` elements with the landing tokens, so they follow the page theme. None of their parts is interactive.

### `StarPattern` (`PhoneMockups.tsx:18-30`)

- Props: `id: string` (the SVG pattern id; must be unique on the page), `className?: string`.
- An `aria-hidden` `<svg>` that fills its box with a repeating 140×140 tile: two 60×60 squares, one rotated 45° about the tile centre, forming an eight-point star outline. Stroke is `var(--l-pattern)`, width 1, no fill.
- Used three times with ids `heroStar` (`LandingPage.tsx:144`), `endStar` (`LandingPage.tsx:328`) and `reflectStar` (`PhoneMockups.tsx:165`).

### `PhoneFrame` (`PhoneMockups.tsx:37-49`)

- Props: `label: string`, `children`.
- Outer box: `role="img"` with `aria-label={label}`, 352×755px, 52px corner radius, 1px hairline border, 10px padding, frame background, raised shadow.
- Clip box: 332×735px, 42px radius, `overflow-hidden`.
- Scaler: `aria-hidden`, 390×844px, `transform-origin: top right`, `scale(0.8513)`. A 390×844 screen is drawn at full size and scaled to 332×718.5px **(measured)**.
- The comment at lines 32-36 states the intent: the screens are decorative, hidden from assistive technology, and described by `label`.

### `RoundIconButton` (`PhoneMockups.tsx:51-62`, not exported)

- Props: `size: number`, `children`, `className?: string`.
- A circular bordered `<span>` of the given pixel size that centres an icon. It is a drawing of a button, not a `<button>`.

### `PhoneHomeScreen` (`PhoneMockups.tsx:73-160`)

No props. Draws the app's home tab, top to bottom:

1. Top bar (lines 75-81): a circle with the letter «ح», the wordmark «الحمد», and a gear icon.
2. Greeting (lines 83-86): «السلام عليكم» and the date «٣٠ جمادى الأولى ١٤٤٨ هـ».
3. "Hadith of the day" strip (lines 88-99): a dot, «حديث اليوم», the truncated text «— «اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ.»», and three 30px round icons (copy, share, chevron).
4. Divider with the pill «نعمة اليوم» (lines 101-106).
5. Blessing card (lines 108-145): category pill «نعم الدين»; copy and share icons; title «نعمة الإسلام»; opening line «أعظمُ نعمةٍ أنعمَ اللهُ بها عليك: أن هداكَ للإسلام، ولو شاء لتركك في الظلمات.»; a verse box in the `font-quran` family with «﴿ٱلْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِى وَرَضِيتُ لَكُمُ ٱلْإِسْلَٰمَ دِينًۭا﴾» and «سورة المائدة : ٣»; a row «تدبّر النعمة» with a sparkle icon and a chevron; and the filled button shape «استشعر النعمة».
6. Tab bar (lines 147-158) from the `tabs` array (lines 64-70): «الرئيسية» (active, with an accent bar above it), «رحلتي», «سجل الحمد», «المداومة», «المسبحة».

### `PhoneReflectScreen` (`PhoneMockups.tsx:163-195`)

No props. Draws one sentence of the guided reflection on the deep background with the star lattice:

1. Top row (lines 167-180): a close icon, a progress thread filled to 40% from the right with a dot at each end of the filled part, a pill «مشاركة» with a share icon, and a timer icon.
2. Centre (lines 182-189): the chip «تخيّل الغياب» and the sentence «تخيَّل لو أنك وُلدتَ في أرضٍ لا تعرف الله… تعيش وتموت ولم تسجد له سجدةً واحدة.»
3. Bottom (lines 191-193): the filled button shape «التالي».

## 8. Icon set (`icons.tsx`)

All icons are local SVG components. The landing page does not import `lucide-react`.

- `IconProps` (`icons.tsx:3`): `size?: number` (default 24), `className?: string`, `strokeWidth?: number` (default 1.5).
- `Svg` (`icons.tsx:5-25`, not exported): `aria-hidden="true"`, `viewBox="0 0 24 24"`, no fill, `stroke="currentColor"`, round caps and joins.

| Export | Draws | Lines | Used in |
|---|---|---|---|
| `HomeIcon` | House outline with a door | 27-31 | Features list; mock tab bar |
| `CompassIcon` | Circle with a diamond needle | 33-38 | Features list; mock tab bar |
| `BookIcon` | Open book | 40-45 | Features list; mock tab bar |
| `CalendarIcon` | Calendar page with two rings | 47-52 | Features list; mock tab bar |
| `BeadsIcon` | Eight small circles in a ring (prayer beads) | 54-65 | Features list; mock tab bar |
| `ShieldIcon` | Shield outline | 67-71 | Features list |
| `CopyIcon` | Two overlapping rounded squares | 73-78 | Home mock (twice) |
| `ShareIcon` | Three nodes joined by two lines | 80-87 | Home mock (twice); reflect mock |
| `ChevronDownIcon` | Downward chevron | 89-93 | Home mock (twice) |
| `SparkleIcon` | Four-point star | 95-99 | Home mock |
| `CloseIcon` | X | 101-105 | Privacy dialog; reflect mock |
| `TimerIcon` | Stopwatch | 107-112 | Reflect mock |
| `GearIcon` | Gear | 114-119 | Home mock |

## 9. Responsive behaviour

Breakpoints are Tailwind v4 defaults. The compiled stylesheet contains exactly these width queries **(measured)**: `min-width: 40rem` (`sm`, 640px), `min-width: 48rem` (`md`, 768px), `min-width: 64rem` (`lg`, 1024px), and two max-width queries from arbitrary variants (below 400px and below 340px).

| Breakpoint | What changes | Lines (`LandingPage.tsx`) |
|---|---|---|
| below 340px | Phone frames zoomed to 0.75 (264px wide) | 80 |
| below 400px | Phone frames zoomed to 0.85 (299px wide) | 80 |
| `sm` (640px) | Larger type and spacing: `h1` 3rem to 4rem; section titles 2.2rem to `text-5xl`; lead 17px to 19px; story lines 1.65rem to 2.4rem; closing line 1.6rem to 2rem; large wordmark 88px to 128px; vertical section padding from 96–112px to 120–140px; hero phone window 540px to 635px; dialog padding 24px to 32px | 57, 75, 92, 174, 178, 183, 196, 211, 214, 230, 282, 309, 327, 336 |
| `md` (768px) | The four in-page nav links appear | 160 |
| `lg` (1024px) | `h1` grows to 5rem | 178 |

Layout that adapts without a breakpoint: the method row wraps (`flex-wrap`, text column basis 480px, lines 231-232); the features and promises grids use `repeat(auto-fit, minmax(min(…), 1fr))` (lines 294, 315); content widths are capped at 1200px, 900px or 800px; the dialog is `min(560px, 100vw - 32px)` wide and at most 90vh high (line 87).

At 320, 360, 390, 768 and 1280px wide no element outside the phone frames extends past the viewport **(measured)**. `body` also sets `overflow-x: hidden` (`landing.css:131`).

Hover styles are emitted inside `@media (hover: hover)`, so they do not stick on touch devices.

## 10. Fonts

`landing/index.html:15-17` preconnects to `fonts.googleapis.com` and `fonts.gstatic.com` and loads one stylesheet with `display=swap`:

| Family | Weights requested | Tailwind family | Fallback | Used for |
|---|---|---|---|---|
| IBM Plex Sans Arabic | 300, 400, 500, 600, 700 | `font-sans` (`landing.css:110`) | `system-ui, sans-serif` | Body and UI text |
| Amiri | 400, 700 | `font-serif` (`landing.css:109`) | `serif` | Wordmark, headings, story lines, step text |
| Amiri Quran | default | `font-quran` (`landing.css:111`) | `'Amiri', serif` | The verse in the home mock (`PhoneMockups.tsx:130`) |

The landing sources use only regular, `font-semibold` (600) and `font-bold` (700); weights 300 and 500 of IBM Plex Sans Arabic are requested but never applied (class count in `src/landing/*.tsx`: no `font-light`, no `font-medium`). The app's `index.html:14` loads a larger set (adds Noto Naskh Arabic, Tajawal and Amiri italics); the two pages do not share the request.

## 11. SEO and meta tags

Present in `landing/index.html`:

| Tag | Value | Line |
|---|---|---|
| `<html lang dir>` | `ar`, `rtl` | 2 |
| `charset` | `UTF-8` | 4 |
| `viewport` | `width=device-width, initial-scale=1.0` (zoom allowed, unlike the app's `index.html:5`) | 5 |
| `color-scheme` | `dark light` | 6 |
| `<title>` | الحمد — نعمةٌ كلَّ يوم | 7 |
| `description` | «الحمد» يضع بين يديك كلَّ يومٍ نعمةً واحدة، ثم يأخذك في دقيقتين من التأمّل: تتخيّل يومك لو غابت، ثم تعود إليها فتحمد الله عليها. | 8 |
| `og:title` | الحمد — نعمةٌ كلَّ يوم | 9 |
| `og:description` | النعمة لا تُرى… حتى تغيب. نعمةٌ واحدة كلَّ يوم، ودقيقتان من التأمّل. | 10 |
| `og:type` | `website` | 11 |
| `twitter:card` | `summary_large_image` | 12 |
| `theme-color` ×2 | `#0C0C1C` (dark), `#F4EDE3` (light) | 13-14 |

Absent: `og:image` and `twitter:image` (although the card type asks for a large image), `og:url`, `og:locale`, `og:site_name`, `<link rel="canonical">`, favicon and touch icons, web manifest, structured data, `<noscript>` content. `public/` contains only `assets/aistudio/`, so the deployment has no `robots.txt` or `sitemap.xml`.

The HTML body is `<div id="root"></div>` (`landing/index.html:20`). All visible content is produced by JavaScript at run time; there is no prerendering or server rendering step in the build.

The `<title>` and `og:title` are the same strings as the app's (`index.html:6,8`).

## 12. Accessibility

What the code does:

- Language and direction are set on `<html>` (`landing/index.html:2`) and again on the root `<div>` (`LandingPage.tsx:141`).
- One `<h1>`; three section `<h2>`; `<h3>` for each step, feature and promise; the dialog has its own `<h2>` and three `<h3>` **(measured heading list)**.
- Both `<nav>` elements have Arabic `aria-label`s (`LandingPage.tsx:155,345`). The wordmark link has an `aria-label` (line 152).
- Decorative SVG and decorative `<span>`s are `aria-hidden` (`icons.tsx:12`, `PhoneMockups.tsx:19`, `LandingPage.tsx:61,146,203,215,251,256,330`).
- Each phone mockup is one `role="img"` with a descriptive Arabic label; its content is `aria-hidden` (`PhoneMockups.tsx:38-44`).
- The steps are an `<ol>`, the features a `<ul>` (`LandingPage.tsx:241,294`).
- The privacy dialog is a native `<dialog>` opened with `showModal()` and labelled by its title through `aria-labelledby="privacy-title"` (`LandingPage.tsx:84-86,94`). **(measured)**: opening it with the keyboard moves focus to the close button; Escape closes it and returns focus to «سياسة الخصوصية»; a click on the backdrop closes it (handler at lines 88-90); content scrolls inside the dialog when it is taller than 90vh (835px of content in a 574px box at 320×640).
- Focus is visible on links and buttons (`landing.css:139-143`).
- Smooth scrolling is disabled under `prefers-reduced-motion` (`landing.css:118-122`). There are no other animations apart from colour transitions on hover.
- Anchor targets have `scroll-mt-4` (16px scroll margin).
- Pinch zoom is not disabled.

Gaps:

- There is no `<main>` element and no skip link. The rendered landmarks are one `<header>`, two `<nav>`, one `<footer>` and six unnamed `<section>`s **(measured)**.
- The Story and Closing sections have no heading (`LandingPage.tsx:211-227`, `327-340`).
- White text on the dark-theme primary button (`#FFFFFF` on `#6C63FF`) has a contrast ratio of 4.32:1. The label is 18px at weight 600 (`LandingPage.tsx:47`), which WCAG treats as normal-size text needing 4.5:1. The light-theme button (`#FFFFFF` on `#B9573B`) is 4.68:1. All other text pairs computed from the token table are above 4.7:1 (lowest: light accent `#9E4A30` on `#EDE3D4`, 4.76:1).
- Below 768px there is no in-page navigation; the four anchor links are hidden and nothing replaces them (`LandingPage.tsx:160`).

## 13. Interactivity, state and effects

- No `useState`, `useEffect`, context or data fetching anywhere in `src/landing`.
- The only React state-like object is one ref to the dialog (`LandingPage.tsx:138`).
- Behaviours: anchor navigation with CSS smooth scrolling; hover colour transitions; opening and closing the privacy dialog (`showModal()` at line 348, `close()` at lines 89 and 100, plus the browser's Escape handling).
- No storage access, no cookies, no network calls from the landing code.

## 14. Notes and quirks

### Copy that differs from the app or its data

| Landing statement | Where | What the repository shows |
|---|---|---|
| «خمسة أبواب» ("five doors") | `LandingPage.tsx:287` | The list under it has six items (`LandingPage.tsx:25-36`). The first five match the app's five tabs; the sixth, «نصوصٌ موثّقة», is not a tab |
| «دقيقتان» / «في دقيقتين» ("two minutes") | `LandingPage.tsx:184,235`; `landing/index.html:8,10` | The five durations printed next to it add up to 80 seconds (`LandingPage.tsx:18-22`), matching `durationSec` 10/20/20/15/15 in `src/data/blessings_ar.json`. The app's onboarding says «خمس دقائق هادئة» (`src/components/screens/OnboardingScreen.tsx:40`) and `src/constants/strings.ts:68` says «٣ دقائق» |
| Step titles «التعمّق», «العودة», «الحمد» | `LandingPage.tsx:20-22` | The app's chips for those steps read «إدراك أثر النعمة», «العودة بالحمد», «الحمد والشكر» (`src/components/screens/ReflectionModal.tsx:453-455`). The first two titles match (lines 451-452) |
| «بلا عدّاد ولا أيّامٍ «فائتة»» and «لا نقاط ولا شارات ولا سلاسل أيّام» | `LandingPage.tsx:29,40` | The app's consistency screen computes and displays a consecutive-day count labelled «أيام التدبر المتتالية» and charts it (`src/components/screens/ConsistencyScreen.tsx:60-79,178`) |
| «مجّانًا» ("free"), with «رحلتي» listed as a feature | `LandingPage.tsx:27,338` | «رحلتي» has a paywall after `FREE_STATION_LIMIT = 2` stations (`src/lib/entitlements.ts:3`) with placeholder prices «[السعر السنوي]» and «[سعر مدى الحياة]» (`src/components/screens/PremiumPaywallScreen.tsx:191,226`). The paywall itself states that the daily blessing, adhkar and tasbih stay free (line 293) |
| «وكلّ نصٍّ يمرّ على أهل العلم قبل نشره» | `LandingPage.tsx:34` | All 40 blessings have `reviewStatus: "pending_review"`, `quran.verified: false` and `hadith.gradeVerified: false`; the file's own `contentNote` says so. `CONTENT_REVIEW_GATE` is `false` (`src/data/loader.ts:4`), so unreviewed entries are served. The app's content modal says «حالة المحتوى: قيد المراجعة العلمية» (`src/components/screens/ContentReviewModal.tsx:31`) |
| «الآيات بالرسم العثماني» | `LandingPage.tsx:34` | The verse typed into the mockup uses Uthmani orthography (`ٱلْيَوْمَ … نِعْمَتِى … ٱلْإِسْلَٰمَ دِينًۭا`, `PhoneMockups.tsx:131`). The same verse in the data is in simplified spelling (`الْيَوْمَ … نِعْمَتِي … الْإِسْلَامَ دِينًا`), and none of the 40 `quran.textUthmani` values contains the alef wasla character U+0671 |
| «واهتزازٌ خفيف عند كلّ ثلاثٍ وثلاثين» | `LandingPage.tsx:30` | The app vibrates on every tap, with a heavier pulse when the lifetime total is a multiple of 33 (`src/lib/store.tsx:564-575`) and when the session count is a multiple of 100 (`src/components/screens/TasbihModal.tsx:55-65`) |
| «قريبًا على متجر «جوجل بلاي»» | `LandingPage.tsx:189-191` | The repository contains no Android or Capacitor project for v2. `README.md:111` lists native packaging as a roadmap item |
| Privacy text: analytics data «تُجمع» on consent | `LandingPage.tsx:126-130` | The v2 app has no network analytics. Its only tracker writes consented events to a local ring buffer in `localStorage` (`src/lib/analytics.ts:42-46`) |

### Content duplicated from the app

- The privacy dialog text is a hand copy of `src/components/screens/PrivacyPolicyModal.tsx:28-53`. Differences: the landing copy drops the words «مشفّر نصياً» from section 2 (app line 45) and omits the «آخر تحديث: سبتمبر ٢٠٢٦ م • ربيع الأول ١٤٤٨ هـ» line (app line 57).
- The home mockup repeats app content by hand: the Islam blessing's title, category and opening line (identical to the `islam` entry in `src/data/blessings_ar.json`), the hadith from `src/data/inspirations.ts:45`, the tab labels and order (same as `src/components/layout/BottomTabBar.tsx:49-55` with `src/constants/strings.ts:10-14`), and the top bar arrangement (same as `src/components/layout/TopBar.tsx:24-52`).
- The reflect mockup's sentence is the `visualize` step of the Islam blessing verbatim. The first landing step text («خذ نفسًا عميقًا… وأحضر قلبك معي لحظة.») is that blessing's `ground` step verbatim; the other four step texts on the landing page are descriptions written for the page.
- The home mockup shows the Islam blessing under the label «نعمة اليوم». In the app that blessing is the first-launch "welcome" blessing (`src/lib/dailyLogic.ts:47-52`), not part of the daily rotation (`src/lib/dailyLogic.ts:18-20`).

### Hard-coded values

- Mock date «٣٠ جمادى الأولى ١٤٤٨ هـ» (`PhoneMockups.tsx:85`). In the Umm al-Qura calendar (Node 22 ICU) this is 2026-11-10, the date of the commit that added the page.
- Footer year «١٤٤٨ هـ» (`LandingPage.tsx:344`). By the same calendar, 1 Muharram 1449 falls on 2027-06-06.
- `APP_URL` (`LandingPage.tsx:6`) and the empty `SUPPORT_EMAIL` (`LandingPage.tsx:8`).

### Implementation details worth knowing

- Light token values exist twice (`landing.css:37-59` and `65-87`). An edit to one block without the other makes the OS-driven and the forced light themes differ.
- The timeline and wordmark use physical-direction utilities (`border-r`, `pr-*`, `-right-*`, `origin-top-right`: `LandingPage.tsx:62-64,214-215,247-256`, `PhoneMockups.tsx:44,171-173`). They are correct because the page is always RTL; they would not flip in an LTR version.
- `PhoneFrame` arithmetic: with `box-sizing: border-box`, the 352×755 outer box has a 330×733 content box (1px border and 10px padding per side), but the clip box is 332×735. **(measured)**: the clip box sits 9px from the left and bottom outer edges and 11px from the right and top. The scaled screen is 718.5px tall inside the 735px clip box, leaving 16.5px of frame colour below it. In the light theme the frame is white, so the method-section phone shows a bottom bezel of about 25px against 10px at the top. In the hero the bottom of the phone is cropped.
- `PhoneFit` relies on the CSS `zoom` property (`LandingPage.tsx:80`).
- The page pays for the React runtime (the 224 kB shared chunk) although its only interactive part is one dialog.
- `StrictMode` is enabled (`main.tsx:7`); with no effects it has no visible consequence.
