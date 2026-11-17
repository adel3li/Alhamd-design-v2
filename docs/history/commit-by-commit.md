# Commit-by-commit history

This appendix walks through every commit on `main` in order and records what each one added, changed and removed. It is based only on what the diffs show (`git show`, `git diff`, `git log --follow --numstat`). Where a commit message and its diff disagree, the diff wins and the difference is called out.

Conventions used below:

- "v2 app" means the code under `src/` at the repository root. "Legacy" means the earlier complete version kept under `legacy/`.
- Line counts are newline counts (`wc -l`) of the file as stored in git.
- "Layl" (ليل, night) and "Nahar" (نهار, day) are the names the project's own design sheets use for the dark and light themes.
- The history has 16 commits: 13 ordinary commits and 3 merge commits.

## Summary of all commits

| # | Commit | Date | Author | Type | Subject | Files | + / − |
|---|---|---|---|---|---|---|---|
| 1 | `3aaa222` | 2026-09-10 | adel3li | initial | Initial commit | 1 | +11 / −0 |
| 2 | `a47edd1` | 2026-09-10 | adel3li | feat | initialize project structure | 85 | +19,286 / −11 |
| 3 | `5ebc2dc` | 2026-10-20 | adel3li | feat | implement dynamic theme system and font settings | 40 | +3,221 / −585 |
| 4 | `3a7e4e4` | 2026-10-20 | adel3li | feat | add completion celebration particles | 5 | +185 / −12 |
| 5 | `4b31e3b` | 2026-10-20 | adel3li | feat | integrate Hisn Al-Muslim and update calendar | 12 | +1,870 / −130 |
| 6 | `e341c65` | 2026-10-28 | adel3li | feat | add journey feature and accessibility support | 31 | +7,606 / −397 |
| 7 | `28d36cb` | 2026-11-07 | adel3li | feat | add haptic feedback throughout the app | 8 | +211 / −90 |
| 8 | `1340209` | 2026-11-08 | Claude | docs | add README with screenshots, architecture and live demo link | 7 | +115 / −0 |
| 9 | `55ccf2e` | 2026-11-10 | Claude | feat | add Alhamd landing page | 7 | +867 / −0 |
| 10 | `70602c1` | 2026-11-11 | Claude | feat | serve landing on alhamd.app and app on app.alhamd.app | 2 | +29 / −1 |
| 11 | `e7dfbbe` | 2026-11-11 | Claude | fix | let host rewrites decide what / serves | 2 | +7 / −13 |
| 12 | `1d7eb66` | 2026-11-15 | adel3li | merge | Merge pull request #1 (`claude/brave-archimedes-mmnpem`) | 9 | +890 / −1 |
| 13 | `793f8be` | 2026-11-16 | Claude | docs | link the alhamd.app landing page in the README | 1 | +1 / −1 |
| 14 | `bca55ba` | 2026-11-16 | adel3li | merge | Merge pull request #2 (`claude/project-resume-presentation-kg85tf`) | 7 | +115 / −0 |
| 15 | `c28abe4` | 2026-11-16 | Claude | docs | point the README live app link at app.alhamd.app | 1 | +1 / −1 |
| 16 | `68e723a` | 2026-11-16 | adel3li | merge | Merge pull request #3 (`claude/project-resume-presentation-kg85tf`) | 1 | +1 / −1 |

Binary files (PNG) count as files but contribute no lines. For merge commits the figures are the diff against the first parent, that is, what the merge brought into `main`.

Shape of the graph: commits 1 to 7 are a straight line by the owner. Two side branches then start from `28d36cb`: the landing-page branch (`55ccf2e`, `70602c1`, `e7dfbbe`, merged as PR #1) and the README branch (`1340209`, `793f8be`, merged as PR #2, then `c28abe4`, merged as PR #3). The README branch was started first (8 Nov) but merged second (16 Nov).

---

## `3aaa222` — Initial commit

**2026-09-10 22:59 +0300 · adel3li · 1 file, +11**

The repository starts with a single `README.md`: the stock Google AI Studio banner. It contains a banner image (`GHBanner`, hosted on GitHub user attachments), the heading "Built with AI Studio", the line "The fastest path from prompt to production with Gemini." and a "Start building" link to `https://aistudio.google.com/apps`. There is no project-specific text and no code.

---

## `a47edd1` — feat: initialize project structure

**2026-09-10 23:21 +0300 · adel3li · 85 files, +19,286 / −11**

This is the baseline. Twenty-two minutes after the initial commit, the whole project arrives at once: the v2 app in `src/` (35 files) and, next to it, a complete earlier version of the app in `legacy/` (42 files). The commit also **deletes the AI Studio `README.md`**; the repository then has no README until `1340209` is merged two months later. The commit message describes it as a framework set-up, but the diff is a working application.

### Files

**Root configuration (new)**

- `package.json` — package name `react-example`, version `0.0.0`. Scripts: `dev` (`vite --port=3000 --host=0.0.0.0`), `build` (`vite build`), `preview`, `clean` (`rm -rf dist server.js`), `lint` (`tsc --noEmit`). Dependencies: `@google/genai`, `@tailwindcss/vite`, `@vitejs/plugin-react`, `lucide-react`, `react`, `react-dom`, `vite`, `express`, `dotenv`, `motion`. Dev dependencies: `@types/node`, `autoprefixer`, `esbuild`, `tailwindcss`, `tsx`, `typescript`, `vite`, `@types/express`. No lockfile at the root.
- `index.html` — `<html lang="ar" dir="rtl">`, viewport with `maximum-scale=1.0, user-scalable=no`, Arabic title and description, Google Fonts link for Amiri Quran, Amiri and IBM Plex Sans Arabic, and a body with hard-coded classes `bg-[#15152A] text-[#EDEDF5]`.
- `vite.config.ts` — React and Tailwind plugins, `@` alias, and the AI Studio `DISABLE_HMR` handling.
- `tsconfig.json` — includes `src`, excludes `legacy`.
- `metadata.json` — AI Studio app metadata (name `الحمد`, capability `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`).
- `.env.example` — `GEMINI_API_KEY` and `APP_URL` placeholders. `.gitignore` — standard ignores.

Nothing in `src/` imports `@google/genai`, `express` or `dotenv`, in this commit or at any later point.

**`legacy/` (new, 42 files, never touched again)**

A complete earlier version of the same app: `legacy/src/App.tsx` (382 lines), a `StoreContext`, 13 components, services for analytics, haptics, notifications and storage, its own `package.json` and a 4,411-line `package-lock.json`. What the diff shows about it:

- Six bottom tabs: الرئيسية (home), مسبحة (tasbih), نِعَمي (my blessings), سجل الحمد (journal), المداومة (consistency), الإعدادات (settings).
- Extra dependencies the v2 app does not have: Capacitor (`@capacitor/core`, `haptics`, `local-notifications`, `preferences`), `posthog-js`, `html-to-image`.
- A different palette, defined as Tailwind `@theme` tokens in `legacy/src/index.css`: light background `#f8fafc`, primary `#4f46e5`, accent `#f59e0b`, text `#0f172a`; dark background `#0f172a`, surface `#1e293b`, primary `#6366f1`, accent `#fbbf24`. Fonts: Inter, IBM Plex Sans Arabic, Amiri.
- Two one-off codemod scripts, `legacy/replace.js` and `legacy/replace-analytics.cjs`. The first replaces hard-coded `#15152A` / `#C8A951` / `#AEAECB` classes with brand tokens, which shows the navy-and-gold hex values already existed in the legacy code.
- `legacy/src/data/blessings_ar.json` is byte-identical to `src/data/blessings_ar.json` (same git blob).
- Storage keys reused by v2: `alhamd_onboarded`, `alhamd:tourComplete`, `alhamd:userBlessings:v1`, `alhamd:analytics_consent`.

**`src/` — the v2 app as first committed (35 files; 4,542 lines of TS/TSX/CSS)**

- `src/App.tsx` (206 lines) — `StoreProvider` plus one content component. `TabId` is `'home' | 'journal' | 'consistency' | 'settings'`. Renders onboarding until completed, then a desktop nav bar, a mobile top bar, one of four screens, the bottom tab bar, and five overlays: reflection, tasbih, about, content review, privacy. The spotlight tour shows on the home tab until completed.
- `src/components/layout/BottomTabBar.tsx` (70) — four tabs in this order: الرئيسية, سجل الحمد, المداومة, الإعدادات. Active tab has a gold bar above the icon.
- `src/components/layout/DesktopNavBar.tsx` (71) — brand mark, the same four tabs as pills, and a «ح» avatar button that opens About.
- `src/components/layout/TopBar.tsx` (49) — «ح» avatar (About) on the right, brand mark with thread in the centre, a **calendar** button on the left that switches to the consistency tab.
- `src/components/screens/HomeScreen.tsx` (261) — greeting and Hijri date; a "حديث اليوم / آية اليوم" card, always expanded, with one share button; a "نعمة اليوم" divider; the blessing card (category pill, title, opening line, ayah block, collapsible "تدبّر النعمة" with hadith, reflection text and scholar quote, a text "مشاركة التدبّر" link, and the violet "استشعر النعمة" button); and a small **tasbih card** at the bottom that opens the tasbih modal and shows the lifetime count.
- `src/components/screens/ReflectionModal.tsx` (273) — full-screen guided flow: the blessing's five `istisharSteps` shown sentence by sentence (a new sentence every 2.8 s), then a journal step with a textarea and a tap-to-count "الحمد لله" circle (strong haptic every 33 taps), then a 1.6 s "تقبل الله منكم" overlay.
- `src/components/screens/TasbihModal.tsx` (159) — a **modal** with seven dhikr presets, a large tap circle, session and lifetime counters, and a "فضل الذكر" card. Strong haptic every 33 taps.
- `src/components/screens/JournalScreen.tsx` (381) — two segments, "سجل الحمد" and "نِعَمي"; Hijri month navigator, search, category pills, entry cards grouped by day, personal-blessing cards with favourite and delete.
- `src/components/screens/ComposeBlessingModal.tsx` (195) — full-screen form for a personal blessing: title, three prompts, category.
- `src/components/screens/ConsistencyScreen.tsx` (195) — title, a month calendar (Saturday-first weekday letters, gold dot under completed days, violet ring on today), a one-line "أتممتَ N يومًا" summary, and a daily-reminder toggle with a time picker.
- `src/components/screens/SettingsScreen.tsx` (368) — theme buttons "داكن (ليل)" and "فاتح (فجر)"; three text-size buttons (عادي / كبير / أكبر); reminder toggle and time; JSON backup export and import; links to content review, About, privacy, replay tour, share app.
- `src/components/screens/OnboardingScreen.tsx` (238) — four slides, with notification and anonymous-analytics toggles. `AboutModal.tsx` (111), `ContentReviewModal.tsx` (68), `PrivacyPolicyModal.tsx` (63). None of these four files is ever modified again.
- `src/components/common/` — `GlassCard` (44), `BrandMark` (49; wordmark with a gradient thread and a glowing dot), `StarLattice` (55; an 80 px tile with a star, octagram lines, an octagon and corner strokes), `ThreadProgress` (49), `SpotlightTour` (128; four steps), `ShareCardModal` (273; draws a 1080×1350 or 1080×1920 PNG on a canvas, dark only, with "save image" and "copy text").
- `src/lib/store.tsx` (486) — see "Data model / storage" below.
- `src/lib/dailyLogic.ts` (65), `src/lib/hijri.ts` (132), `src/lib/arabic.ts` (42).
- `src/data/blessings_ar.json` (2,806 lines; 40 blessings in 8 categories, all marked `pending_review`), `src/data/inspirations.ts` (8 items), `src/data/dhikr.ts` (9 items), `src/data/loader.ts`.
- `src/constants/strings.ts` (98), `src/constants/categories.ts` (28; 8 categories), `src/constants/tokens.ts` (50; `THEME_TOKENS`, `RADIUS`, `MOTION`). `tokens.ts` is not imported by any file, here or later.
- `src/index.css` (80), `src/types.ts` (164), `src/main.tsx` (10).

### Design at this commit

- **One palette, written as literal hex values in Tailwind classes.** Ground `#15152A`, deeper `#111126` and `#0C0C1C`, card `#1E1E38`, raised `#25232E`, hairline `#2E2E4A`, text `#EDEDF5` / `#C7C4D8` / `#AEAECB`, gold `#E4C368` / `#C8A951`, violet `#6C63FF` (pressed `#594DFF`).
- **`src/index.css` has no colour variables.** It defines three font variables (`--font-serif` Amiri, `--font-sans` IBM Plex Sans Arabic, `--font-quran` Amiri Quran), sets the body to `#15152A` / `#EDEDF5`, three `.text-scale-*` classes (1rem, 1.125rem, 1.25rem, with larger `h1` sizes), a scrollbar hider and two keyframe animations (`fadeIn`, `scaleUp`).
- **The light theme is a stub.** Choosing "light" swaps the root wrapper to `bg-[#F4F5FA] text-[#1E1E38]` and puts a `light` class on `<html>`, but components keep their hard-coded dark hex classes. `tokens.ts` holds a separate, unused cool blue-grey light palette (ground `#F6F9FA`, text `#14213D`, gold `#9A7A1E`, violet `#544EE6`).

### Data model / storage at this commit

`src/types.ts` defines the content types (`Blessing`, `IstisharStep`, `QuranReference`, `HadithReference`, `ScholarQuote`), `JournalEntry`, `UserBlessing`, `ThemeMode` (`'dark' | 'light' | 'auto'`), `TextSize` (`'normal' | 'large' | 'xlarge'`), `AppState`, `StoreContextType` and `BackupPayloadV2`.

`src/lib/store.tsx` is a React context that reads and writes `localStorage` directly:

| Key | Holds |
|---|---|
| `alhamd_onboarded` | onboarding finished |
| `alhamd_welcome_seen` | welcome blessing seen |
| `alhamd:tourComplete` | spotlight tour finished |
| `alhamd:analytics_consent` | analytics consent |
| `alhamd_theme` | `dark` or `light` |
| `alhamd_text_size` | `normal`, `large` or `xlarge` |
| `alhamd_notif_enabled`, `alhamd_notif_time` | reminder toggle and time (default `21:00`) |
| `alhamd_completed_reflections` | array of ISO dates |
| `alhamd_journal` | journal entries |
| `alhamd:userBlessings:v1` | personal blessings |
| `alhamd_tasbih_count` | lifetime tasbih count |

A key `alhamd_state` is declared in `STORAGE_KEYS` but never read or written.

Other behaviour introduced here that is still present today: a first run is seeded with two sample journal entries, one sample personal blessing and three "completed" days; `triggerHaptic(type)` wraps `navigator.vibrate` with four patterns (`light` 8 ms, `medium` 20 ms, `heavy` 35 ms, `success` `[15, 30, 25]`); backup export writes a version-2 JSON payload and import also accepts the legacy v1 shape.

### Not there yet, compared with today

No CSS custom properties for colour, no working light theme, no numeric font size or font-family choice, no high-contrast or night-reading mode, no tasbih tab (tasbih is a modal), no Hisn Al-Muslim, no journey, paywall or entitlements, no charts, no audio player, no completion particles, no reflection timer, no social sharing, no landing page, no `vercel.json`, no README and no root lockfile.

---

## `5ebc2dc` — feat: implement dynamic theme system and font settings

**2026-10-20 17:31 +0300 · adel3li · 40 files, +3,221 / −585**

Forty days after the baseline, this commit turns the single dark look into a two-theme design system. It introduces CSS custom properties, makes the light theme real with a completely new warm palette, replaces the three text-size buttons with a numeric font size, and reworks navigation so that tasbih becomes a tab. It also brings in the design reference material: two HTML design sheets and seven images. The commit message does not mention the navigation change, the reflection timer, the statistics chart or the share-card rewrite, all of which are in the diff.

### Files

**Tooling and assets**

- `package.json` (+5 / −4) — adds `recharts ^3.10.1`; the dependency list is re-sorted alphabetically (`dotenv`, `express`, `motion` move, nothing is removed).
- `bun.lock` (new, 765 lines) — first lockfile at the root. The legacy app used npm (`legacy/package-lock.json`); the v2 app is locked with Bun.
- `public/assets/aistudio/` (new) — `.gitignore` containing `*`, two design sheets (`design-sheet-layl-dark_f2b4cff4.html`, 342 lines; `design-sheet-nahar-light_5cbc4393.html`, 338 lines) and seven PNGs. Despite the ignore rule, every file is tracked.
- `.aistudio/artifacts/brain/9e9ad89d-…/.tempmediaStorage/` (new) — seven PNGs that are byte-identical copies of the seven in `public/assets/aistudio/`. See "Design reference images".

**Styles and state**

- `src/index.css` (80 → 278 lines) — see "Design changes".
- `src/lib/store.tsx` (+39 / −9) — new `fontSize` state and `setFontSize`; the theme effect now also toggles `theme-dark` / `theme-light` classes on `<html>`; the font effect sets `--app-font-size` and the root `font-size` inline. `setTextSize` is kept and now maps to 16 / 18 / 20 px. `fontSize` is added to backup export and import.
- `src/types.ts` (+3) — `fontSize: number` on `AppState`, `setFontSize` on the context type, optional `fontSize` in `BackupPayloadV2.settings`. The type comment says "default 15"; the store's default is 16.
- `src/lib/hijri.ts` (+8 / −2) — `getFormattedHijriDate` now strips any trailing "هـ" before appending one. This fixes the doubled suffix visible in one of the screenshots added in this commit.
- `src/constants/strings.ts` (+1) — `tabs.tasbih: 'المسبحة'`.

**Navigation**

- `src/components/layout/BottomTabBar.tsx` — `TabId` gains `'tasbih'`. The fourth tab changes from **الإعدادات (settings) to المسبحة (tasbih)**, using a new hand-drawn `TasbihIcon` (a ring of prayer beads). Settings stays a valid `TabId` but leaves the tab bar.
- `src/components/layout/TopBar.tsx` — the calendar button is replaced by a **settings gear** (`onOpenCalendar` prop removed; `onOpenSettings` and `isSettingsActive` added). The «ح» avatar becomes a gold-outlined circle. The centre brand mark loses its thread (`size={24} showThread={false}`).
- `src/components/layout/DesktopNavBar.tsx` — same tab swap, plus a new settings gear button next to the avatar.
- `src/App.tsx` (+26 / −11) — renders `TasbihModal` inline for the `tasbih` tab; the home "open tasbih" action now switches tab; onboarding is wrapped in a themed `<div>`; the light wrapper classes change from `bg-[#F4F5FA] text-[#1E1E38]` to `theme-light bg-[#F4EDE3] text-[#2A1F19]`.
- `src/components/common/SpotlightTour.tsx` — the fourth tour step now points at `tab-btn-tasbih` instead of the removed home tasbih card.

**Shared components**

- `GlassCard.tsx` — background, border and shadow now come from `--bg-glass` / `--bg-raised`, `--border-hairline` / `--accent-stroke`, `--card-shadow` / `--raised-shadow`. The conflicting `bg-white/80`, `dark:` and `border-slate-200` classes are removed.
- `BrandMark.tsx` — proportions retuned (dot 0.075 × size, gap 0.2 × size, thread 0.025 × size); the gradient thread and glowing dot become flat `--accent-stroke`; the dot is placed first so it sits on the right in RTL.
- `StarLattice.tsx` (55 → 31) — the 80 px tile is replaced by a 140 px tile of two overlapping squares (one rotated 45°), stroked with `--text-primary`.
- `ThreadProgress.tsx` — gradient and glow replaced by flat `--accent-stroke` on a `--border-hairline` track.
- `ShareCardModal.tsx` (273 → 513, +428 / −188) — largely rewritten. New: a card-theme switch (ليل / نهار) independent of the app theme, a content switch (with ayah / with reflection), native share of the PNG through `navigator.share`, quick text sharing to WhatsApp, X and Telegram, and haptics. The brand sign-off moves from bottom-centre to bottom-left.

**Screens**

- `HomeScreen.tsx` (+123 / −75) — copy-to-clipboard buttons on the inspiration card and the blessing card; share and copy become round icon buttons at the top of the blessing card; the ayah block uses the Amiri Quran font on a sunken surface; text inside "تدبّر النعمة" is enlarged; the "مشاركة التدبّر" text link becomes an icon button. **The home tasbih card is removed.** The inspiration text now branches on `inspiration.type === 'ayah'`, but the data type only allows `'quran' | 'hadith'`, so the ayah branch never matches. That is still the case at `HEAD`.
- `ReflectionModal.tsx` (273 → 538) — adds an optional **reflection timer**: a header button opens a panel with 1, 3 and 5 minute presets, a circular countdown, play / pause / reset and a "breathing" halo. The closing dhikr circle is redrawn with an SVG progress ring that fills over **100** taps (the strong haptic moves from every 33rd to every 100th tap). Step text and du'a are enlarged.
- `TasbihModal.tsx` (159 → 228) — new `inline` prop so the same component can render as a full tab; `onClose` becomes optional. The tap circle gets the same 100-count SVG ring and a themed raised surface; the strong haptic moves from 33 to 100.
- `ConsistencyScreen.tsx` (195 → 404) — new "إحصائيات التدبر" card above the calendar: total reflected days, current streak in days, and a Recharts area chart of the last seven days (cumulative total and streak).
- `SettingsScreen.tsx` (+107 / −39) — the three text-size buttons are replaced by a numeric control from 12 to 24 px (minus / plus steppers, a slider in 0.5 steps, a number input, a "default (16)" reset) with a live ayah preview. The light theme label changes from "فاتح (فجر)" to "فاتح (نهار)". The unused analytics-consent bindings are dropped.
- `JournalScreen.tsx` (+27 / −27) — spacing and type sizes only.

### Design changes

**CSS custom properties arrive.** `:root` in `src/index.css` now defines the dark ("Layl") tokens, and a `.theme-light` block redefines them for light ("Nahar"):

| Token | Layl (dark) | Nahar (light) |
|---|---|---|
| `--bg-ground` | `#15152A` | `#F4EDE3` |
| `--bg-deep` | `#111126` | `#EDE3D4` |
| `--bg-deepest` | `#0C0C1C` | `#E6DAC8` |
| `--bg-glass` | `#1E1E38` | `#FBF8F3` |
| `--bg-raised` | `#25232E` | `#FFFFFF` |
| `--bg-sunken` | `#1B1B33` | `#EFE6D9` |
| `--border-hairline` | `#2E2E4A` | `#DCCFBE` |
| `--text-primary` | `#EDEDF5` | `#2A1F19` |
| `--text-secondary` | `#C7C4D8` | `#4A3B32` |
| `--text-muted` | `#AEAECB` | `#6B5A4E` |
| `--accent-text` | `#E4C368` | `#9E4A30` |
| `--accent-stroke` | `#C8A951` | `#B9573B` |
| `--cta-bg` | `#6C63FF` | `#B9573B` |
| `--cta-pressed` | `#594DFF` | `#8F4229` |
| `--danger` | `#E5837A` | `#A63D30` |
| `--ayah-color` | `#E4C368` | `#2A1F19` |
| `--ayah-border` | `rgba(185, 87, 59, 0.14)` | `rgba(185, 87, 59, 0.35)` |
| `--card-shadow` | `0 12px 32px rgba(0,0,0,0.35)` | `0 12px 32px rgba(42,31,25,0.08)` |
| `--raised-shadow` | `0 16px 40px rgba(0,0,0,0.45)` | `0 16px 40px rgba(42,31,25,0.12)` |

- **The dark palette does not change.** The hex values are the same as the baseline; they are simply named. `--bg-sunken` (`#1B1B33`) and `--danger` (`#E5837A`) are new values.
- **The light palette is replaced outright.** Before: a cool wrapper of `#F4F5FA` with `#1E1E38` text. After: warm cream `#F4EDE3`, ink `#2A1F19` and terracotta `#B9573B` / `#9E4A30`. The CSS comment says these come "from App Icon Palette"; `app-icon-palette_a8ddd79f.png`, added in this commit, shows exactly `#F4EDE3`, `#2A1F19` and `#B9573B`.
- **In light mode the accent roles merge.** Gold text and violet buttons both become terracotta, and Qur'anic text turns from gold to ink.
- **Light mode works by remapping, not by rewriting components.** About 150 lines of `.theme-light .bg-\[\#15152A\] { … !important }` rules re-colour the existing hard-coded classes. Only a few components (`GlassCard`, `BrandMark`, `StarLattice`, `ThreadProgress`, and parts of the screens) read the variables directly.
- **Font scaling moves to the root.** `html { font-size: var(--app-font-size, 16px) }`; the three `.text-scale-*` classes all become `1rem`; `.text-[10px]` and `.text-[11px]` are redefined in rem so that small labels scale too.
- `body` gains a 0.25 s colour transition.
- `src/constants/tokens.ts` is **not** updated; its light palette stays the old blue-grey one.

**Layout.** Mobile tabs change from home / journal / consistency / settings to home / journal / consistency / **tasbih**; settings moves to a gear in the top bar. The tasbih entry point on the home screen is removed.

**New visual effects.** SVG progress rings on both dhikr circles, the timer's breathing halo, and the area chart with gradient fills.

### Data model / storage changes

- New key **`alhamd_font_size_v2`** (number, 12 to 24, steps of 0.5, default 16).
- `alhamd_text_size` is kept but is now derived from the number (≥ 20 → `xlarge`, ≥ 18 → `large`, else `normal`).
- Backup payload gains `settings.fontSize`.

### Dependencies / tooling

- Added: `recharts`. Added: `bun.lock`.

---

## `3a7e4e4` — feat: add completion celebration particles

**2026-10-20 17:36 +0300 · adel3li · 5 files, +185 / −12**

Five minutes after the theme commit: a particle effect for the moment a reflection is finished, plus a storage-key migration for the theme.

### Files

- `src/components/common/CompletionParticles.tsx` (new, 132 lines) — a fixed, non-interactive overlay. A soft central glow plus `count` particles (default 32) that drift upward and fade. Shapes are orbs, four-point stars (every 5th) and rings (every 7th). Positions come from a deterministic formula, not `Math.random`. Colours come from `--accent-stroke` and `--cta-bg`, so the effect follows the theme. Not modified since.
- `src/components/screens/ReflectionModal.tsx` (+42 / −9) — the completion overlay now shows the star lattice, 36 particles, two expanding ripple rings around the check mark, and staggered text. Its duration goes from 1.6 s to 2.2 s.
- `src/App.tsx` (+6) — imports `CompletionParticles`, adds a `showCelebrationParticles` flag and sets it for 3.2 s after a reflection completes. **The component is not rendered here**: the flag is set but nothing reads it. The missing `<CompletionParticles />` line is added in the next commit.
- `src/lib/store.tsx` (+4 / −2) — theme key migration, below.
- `index.html` — `<html>` gains `class="dark theme-dark"` so the dark tokens apply before React mounts.

### Data model / storage changes

- The theme key is renamed from **`alhamd_theme` to `alhamd_theme_v2`**. On start-up the store deletes `alhamd_theme` and reads only the new key, accepting `light` or `dark` and falling back to `dark`. The old value is not carried over, so anyone who had saved a theme under the old key starts again in dark.

---

## `4b31e3b` — feat: integrate Hisn Al-Muslim and update calendar

**2026-10-20 21:05 +0300 · adel3li · 12 files, +1,870 / −130**

The third commit of the same day adds a second content area, the Hisn Al-Muslim adhkar, inside the tasbih tab, and rebuilds the Hijri calendar so that it follows real Hijri months.

### Files

- `src/data/hisnAlMuslim.ts` (new, 358 lines) — six categories (`morning`, `evening`, `prayer`, `sleep`, `home`, `dua`), **23 adhkar** (6 morning, 5 evening, 4 after prayer, 3 sleep, 2 home, 3 distress / du'a), each with text, repetition count, source and optional virtue; seven daily tips; `getDailyHisnTip()` picks a tip by day of year.
- `src/components/screens/HisnScreen.tsx` (new, 1,021 lines) — picks a starting category from the time of day; a daily tip card; three "wird" cards (morning, evening, after prayer) with circular progress rings and an overall progress bar; search; category pills; a card per dhikr with a tap counter, reset, pin and copy; and a slide-over index drawer. Not modified since.
- `src/components/screens/TasbihModal.tsx` (228 → 305) — exports `TasbihSubView = 'counter' | 'hisn'`. In tab mode the heading becomes "المسبحة وحصن المسلم" and a two-button switcher (عداد التسبيح / حصن المسلم) chooses between the counter and an embedded `HisnScreen`. New props `initialSubView` and `initialHisnCategory`.
- `src/App.tsx` (+29 / −4) — new state `tasbihSubView` and `hisnCategory`; opening the tasbih tab resets the sub-view to the counter; passes `onOpenHisn` to the home screen. **Adds the `{showCelebrationParticles && <CompletionParticles />}` line** that the previous commit left out.
- `src/components/screens/HomeScreen.tsx` (+57 / −21) — the inspiration card becomes **collapsible**: collapsed by default, showing a one-line preview with copy, share and a chevron. `onOpenHisn` is added to the props interface, and `tasbihCount` / `onOpenTasbih` are dropped from the destructuring; the component does not call `onOpenHisn`, so the home screen has no visible Hisn entry point and `hisnCategory` is never set in practice.
- `src/lib/hijri.ts` (138 → 236) — `generateMonthCalendar` is rewritten. Before, it laid out 30 cells around the current Gregorian date, numbered 1 to 30. Now it walks to day 1 of the actual Hijri month using `Intl.DateTimeFormat` parts, steps month by month for navigation, and stops at 29 or 30 days. Each day gains `gregorianLabel`, `hijriFullLabel` and `isFuture`; the result gains `monthName` and `year`, and the month title gains a "هـ" suffix.
- `src/components/screens/ConsistencyScreen.tsx` (404 → 528) — the calendar card gets a header ("التقويم الهجري للتدبر"), a "current month" reset button, tappable day cells, gold-tinted circles for completed days, dimmed future days, a legend, a selected-day detail row (weekday, Hijri and Gregorian dates, status) and a monthly progress bar with a percentage, replacing the one-line summary. The arrow directions are swapped: the right-hand arrow now goes to the previous month.
- `src/constants/strings.ts` (+1) — `tabs.hisn: 'حصن المسلم'`.
- Two more reference images in `public/assets/aistudio/` and their duplicates under `.aistudio/`.

### Design changes

- The tasbih tab becomes a two-part area with a gold segmented switcher.
- The home inspiration card shrinks to a single line by default, giving the blessing card more room.
- The calendar goes from a passive grid to an interactive one with a detail panel.

### Data model / storage changes

- New keys written directly by `HisnScreen.tsx`, outside the store: **`alhamd_hisn_counts_<YYYY-MM-DD>`** (per-day repetition counts, one key per day) and **`alhamd_hisn_favorites`** (pinned dhikr ids). Neither is included in the backup export.
- No change to `src/types.ts` or `src/lib/store.tsx`. The commit message's "Add 'Hisn Al-Muslim' category to strings and state" corresponds to one string and two pieces of component state in `App.tsx`.

---

## `e341c65` — feat: add journey feature and accessibility support

**2026-10-28 04:48 +0300 · adel3li · 31 files, +7,606 / −397**

The largest commit after the baseline. It nearly doubles the TypeScript code (7,366 → 13,580 lines). Its headline is «رحلتي» (My Journey), a paid guided programme with a paywall, but it also adds display-font choice, a high-contrast mode, a night-reading mode, an audio recitation player, reflection category charts and a rewritten share card. The audio player, the charts, the night-reading mode and the share-card rewrite are not mentioned in the commit message.

### Files

**Journey (new)**

- `src/data/journey_content.json` (725 lines) — four stages of seven stations each (28 stations): منزل نعمة العبادة (`din`), منزل نعمة البدن (`afiyah`), منزل نعمة الأهل (`nasl`), منزل نعمة الرزق والسكينة (`rizq`). Each station references an existing blessing id and carries a journal prompt and a daily action. Every authored text is `pending_review`, and sacred text is held as placeholder tokens (`[[AYAH_TOKEN]]`, `[[HADITH_TOKEN]]`). The file's own note still describes "two trial stages".
- `src/lib/journeyStore.ts` (575 lines) — builds stages from the chosen themes, sanitises state, loads and saves it, records station completion and the daily unlock count, stores station journals and end-of-stage answers, and offers two developer resets.
- `src/lib/entitlements.ts` (96 lines) — the only premium check. `isPremium()` reads a local developer flag; comments mark where RevenueCat would be called. `FREE_STATION_LIMIT = 2`.
- `src/lib/analytics.ts` (50 lines) — `trackJourneyEvent`: only when consent is `true`, only five allow-listed metadata keys, appended to a 50-entry log in `localStorage`. Nothing is sent over the network.
- `src/components/journey/JourneyPathScreen.tsx` (1,397 lines) — the journey tab: path and statistics sub-tabs, a winding path of station nodes with curved connectors, a station detail popup, the free-limit check, daily pacing, and launching of the station flow, the end-of-stage review and the paywall.
- `src/components/journey/JourneyOnboarding.tsx` (377) — choose focus themes, pace (1 or 2 stations a day) and an optional reminder time.
- `src/components/journey/JourneyStationFlow.tsx` (533) — four phases per station: guided reflection, write, act, close.
- `src/components/journey/JourneyMuhasabaScreen.tsx` (167) — a two-question self-review after the seventh station of a stage.
- `src/components/journey/JourneyWeeklyProgressChart.tsx` (347) — weekly progress chart (Recharts).
- `src/components/screens/PremiumPaywallScreen.tsx` (299) — three benefits, annual and lifetime plans with **placeholder prices** (`[السعر السنوي]`, `[سعر مدى الحياة]`), restore purchases, and a developer unlock button. The subscribe button only shows a notice that the payment gateway is not connected.
- Three re-export shims: `src/components/journey/JourneyPaywall.tsx` (7), `src/components/journey/PremiumPaywallScreen.tsx` (5), `src/components/screens/JourneyPathScreen.tsx` (1).

**Other new components**

- `src/components/screens/TasbihAudioPlayer.tsx` (770 lines) — eight dhikr tracks, each tied to a Qur'anic verse, and five reciters (العفاسي, الحصري, المعيقلي, المنشاوي, عبد الباسط). Audio is streamed from `everyayah.com`, with `cdn.islamic.network` as the second source and a generated chime plus browser speech synthesis as the last resort. Volume, mute, gentle repeat, previous / next, and an optional synthesised ambient pad. This is the first code in the app that loads content from a third-party host at runtime, apart from Google Fonts.
- `src/components/common/ReflectionCategoryCharts.tsx` (627 lines) — "بصيرة التدبر والوعي الذاتي": bar, radar and donut views of which blessing categories the user has reflected on most. Used on the consistency screen and in the journey statistics tab.

**Modified**

- `src/App.tsx` (+33 / −12) — `journey` tab rendering; a single `handleTabChange`; **the journey tab is gated**: without the developer premium flag, tapping it opens the paywall and the tab does not open.
- `src/components/layout/BottomTabBar.tsx`, `DesktopNavBar.tsx` — `TabId` gains `'journey'`; a new second tab, **رحلتي**, with a compass icon. Mobile now has five tabs: home, journey, journal, consistency, tasbih.
- `src/lib/store.tsx` (518 → 748) and `src/types.ts` (167 → 230) — see "Data model".
- `src/index.css` (278 → 548) — see "Design changes".
- `index.html` — the Google Fonts link adds Noto Naskh Arabic (400 to 700) and Tajawal (400, 500, 700).
- `src/components/screens/SettingsScreen.tsx` (436 → 790) — the appearance card gains a **night-reading** switch, a **high-contrast** switch and a one-tap "bright light" preset (light theme plus high contrast). A **display font** picker offers IBM Plex Sans Arabic, Noto Naskh Arabic, Amiri and Tajawal. The preview box gains a paragraph of body text and a status line. A **developer mode** block adds the premium toggle and test tools (skip today's pacing limit, reset the journey, preview the paywall). Two `alert()` calls are replaced by the in-page status banner.
- `src/components/common/ShareCardModal.tsx` (513 → 761, +487 / −239) — second rewrite. Now has image and text tabs, a third card theme "ملكي" (royal), a third content mode "full" (adds hadith and du'a), decorated copy text with emoji section markers, an `execCommand` clipboard fallback, a radial glow and an inner ornamental frame on the canvas, and a shared word-wrap helper with line limits. The default `type` changes from `ayah` to `tadabbur`.
- `src/components/screens/ReflectionModal.tsx` (+54 / −26) — a "مشاركة" button in the header opens the share card.
- `src/components/screens/TasbihModal.tsx` (+10) — embeds `TasbihAudioPlayer` above the counter.
- `src/components/screens/ConsistencyScreen.tsx` (+4) — embeds `ReflectionCategoryCharts`.
- `src/components/screens/HomeScreen.tsx` (+6 / −4) — the reflection share button gets its text label back ("مشاركة").
- `src/constants/strings.ts` (+1) — `tabs.journey: 'رحلتي'`.
- One more reference image and its duplicate.

### Design changes

- **Navigation:** a fifth mobile tab, رحلتي, in second position.
- **Fonts:** two new families loaded (Noto Naskh Arabic, Tajawal). The chosen family is applied by overwriting `--font-sans` on `<html>` and setting `data-font-family`. Naskh and Amiri get `line-height: 1.9`; Tajawal gets `letter-spacing: 0.01em`.
- **High contrast, dark** (`html.high-contrast:not(.theme-light)`): ground `#15152A` → `#0B0B18`, glass `#1E1E38` → `#14142B`, hairline `#2E2E4A` → `#525282`, primary text `#EDEDF5` → `#FFFFFF`, muted `#AEAECB` → `#DADAEE`, accent text `#E4C368` → `#FFE484`, accent stroke `#C8A951` → `#F0CA50`.
- **High contrast, light** (`html.theme-light.high-contrast`): ground `#F4EDE3` → `#FAF7F2`, glass `#FBF8F3` → `#FFFFFF`, hairline `#DCCFBE` → `#8C7762`, primary text `#2A1F19` → `#0D0805`, muted `#6B5A4E` → `#33251B`, accent text `#9E4A30` → `#6E240E`, button `#B9573B` → `#8F3418`; text weights are raised to 500 to 700.
- **Night reading** (`html.night-reading`): a third, warm palette. Ground `#0B0806`, glass `#140F0B`, raised `#1C1510`, hairline `#2B2017`, text `#E8DAC8` / `#C6B49D` / `#988670`, accent `#D89A4E` / `#C4853B`, button `#B87333` (pressed `#9E5F24`), ayah `#E2AE63`, plus a full-viewport amber overlay (`body::after`, `mix-blend-mode: screen`). Violet buttons, text and borders are remapped to amber in this mode.
- **Share card "royal" theme:** ground `#0F1026`, card `#171836`, ayah box `#12132B`, with a stronger gold border.
- **Category chart colours:** `#E4C368`, `#6C63FF`, `#4DB6AC`, `#9D97FF`, `#F4A261`, `#56CFE1`, `#80ED99`, `#E76F51`, one per blessing category.
- **Journey visuals:** dashed "upcoming" station cards along a winding path, a violet-highlighted current station, and the paywall sheet.

### Data model / storage changes

`src/types.ts`:

- New `DisplayFontFamily = 'ibm' | 'noto-naskh' | 'amiri' | 'tajawal'`.
- New `JourneyStation`, `JourneyStage` and `JourneyState` (`schemaVersion: 1`, `focusThemes`, `pace: 1 | 2`, `reminderTime`, `stages`, `stations`, `completed`, `unlockedTodayCount`, `lastUnlockDate`, `journal`, `muhasaba`).
- `AppState` gains `journeyState`, `highContrast`, `nightReadingMode`, `fontFamily`.
- `StoreContextType` gains `setHighContrast`, `setNightReadingMode`, `setFontFamily`, `updateJourneyState`, `completeJourneyOnboardingState`, `completeJourneyStationState`, `saveJourneyStationJournal`, `saveJourneyStageMuhasaba`, `resetJourneyState`.
- `BackupPayloadV2` gains optional `settings.highContrast`, `settings.nightReadingMode`, `settings.fontFamily` and a top-level `journeyState`.

`src/lib/store.tsx` also declares and exports its own `JourneyStation`, `JourneyStage` and `JourneyState` interfaces, so these shapes are defined twice.

The three display modes are made mutually consistent in the setters: turning night reading on forces the dark theme and turns high contrast off; turning high contrast on turns night reading off; choosing the light theme turns night reading off.

New `localStorage` keys:

| Key | Written by | Holds |
|---|---|---|
| `alhamd_high_contrast` | store | high-contrast switch |
| `alhamd_night_reading` | store | night-reading switch |
| `alhamd_font_family` | store | display font id |
| `alhamd:journey_state:v1` | store and `journeyStore.ts` | whole journey state, including private journal text |
| `alhamd:journey_onboarded:v1` | `journeyStore.ts` | journey set-up finished |
| `alhamd:dev_premium` | `entitlements.ts` | developer premium flag |
| `alhamd:analytics_events_log` | `analytics.ts` | last 50 journey events (metadata only) |
| `alhamd_tasbih_reciter_v1`, `alhamd_tasbih_volume_v1` | `TasbihAudioPlayer.tsx` | reciter and volume |

Two window events are introduced: `alhamd:journey_updated` and `alhamd:entitlement_changed`.

### Things worth knowing about this commit

- The journey code contains a "free taste" of two stations (`FREE_STATION_LIMIT`), and the settings screen describes the free mode as "first two stations only". But `App.tsx`, in the same commit, refuses to open the journey tab unless the developer premium flag is set and shows the paywall instead. As committed, the two free stations cannot be reached through the tab bar without that flag.
- No payment provider is integrated. "Premium" is a local flag, and the only way to set it is a developer switch (in settings or on the paywall notice).

---

## `28d36cb` — feat: add haptic feedback throughout the app

**2026-11-07 18:14 +0200 · adel3li · 8 files, +211 / −90**

The last commit by the owner before the pull-request phase. The message says it implements "a centralized haptic feedback system". The diff shows something narrower: `triggerHaptic` has been in the store since the baseline, and this commit moves it and calls it in more places. Two unrelated changes ride along: a quick journal composer and a compact paywall layout.

### Files

- `src/lib/store.tsx` (+22 / −17) — the existing `triggerHaptic` definition is moved earlier in the file, unchanged, so the journey callbacks can use it. The four journey save callbacks now call `triggerHaptic('success')`, and `resetJourneyState` calls `triggerHaptic('medium')`. No new haptic patterns and no new module.
- `src/App.tsx` (+1) — `triggerHaptic('success')` when a reflection completes.
- `src/components/journey/JourneyPathScreen.tsx` (+3 / −2) — two `light` haptics become `success` (journey set-up, end-of-stage review) and one `success` is added on station completion.
- `src/components/journey/JourneyStationFlow.tsx` (+3 / −3) — `success` instead of `light` when advancing from the action step and when finishing; after the writing step, `success` only if something was written.
- `src/components/journey/JourneyMuhasabaScreen.tsx` (+3) — `success` on submit.
- `src/components/screens/ComposeBlessingModal.tsx` (+5 / −1) — `medium` on a validation error, `success` on save; an unused icon import is removed.
- `src/components/screens/JournalScreen.tsx` (381 → 486, +119 / −14) — `light` haptics on the segment switch, month arrows and category pills. **New feature, not in the commit message:** a quick journal composer ("دوّن تأملاً جديداً في سجل الحمد") with an optional title, a text area and a category selector, saving through `addJournalEntry`. Until now journal entries were created only when a daily reflection or a journey station was completed. The unused `expandedEntryId` state and `Heart` import are removed.
- `src/components/screens/PremiumPaywallScreen.tsx` (+55 / −53) — layout only, no haptics. The sheet is compacted to fit one screen without scrolling (smaller padding, type and icons; `overflow-hidden`; `max-h-[calc(100vh-1.5rem)]`). The privacy reassurance is hidden while the developer notice is showing, and the notice becomes a single row with a shorter button label.

### Data model / storage changes

None. No new keys, no type changes.

---

## `1340209` — docs: add README with screenshots, architecture and live demo link

**2026-11-08 19:00 UTC · Claude · 7 files, +115**

The first commit not authored by the owner, on branch `claude/project-resume-presentation-kg85tf`, branching from `28d36cb`. It gives the repository a README again and adds six screenshots.

### Files

- `README.md` (new, 115 lines) — English. Title, one-line pitch, a "Live demo" link to `https://alhamd-wheat.vercel.app`, technology badges, overview, a six-image screenshot table, features, tech stack, an architecture tree of `src/`, four design decisions, "By the numbers", getting started with Bun, a roadmap (RevenueCat, code-splitting, Capacitor packaging) and an author line.
- `docs/screenshots/` (new) — `home.png`, `journey.png`, `tasbih.png`, `journal.png`, `consistency.png`, `paywall.png`. See "Design reference images".

### Notes

- The README's figures are close to the code at `28d36cb`. It says "~13,700 lines of TypeScript/TSX across 52 source files"; the tree has 13,701 lines of TS/TSX in 50 files (53 files under `src/` when the stylesheet and the two JSON files are counted). The content counts check out: 40 blessings, 23 adhkar, 4 stages / 28 stations, 5 reciters.
- Two feature claims are not backed by the code at this point: "dark, light, and auto themes" (`'auto'` exists only as a member of the `ThemeMode` type; the store accepts only `light` or `dark` and settings offers two buttons) and "reduced-motion support" (no `prefers-reduced-motion` rule or equivalent exists in the app; one appears later, in the landing page's stylesheet only).

---

## `55ccf2e` — feat: add Alhamd landing page

**2026-11-10 23:33 UTC · Claude · 7 files, +867**

On a second branch from `28d36cb` (`claude/brave-archimedes-mmnpem`): a static marketing page, built as a second Vite entry point and sharing nothing with the app except fonts and colour values.

### Files

- `landing/index.html` (new, 23 lines) — its own HTML shell with `color-scheme` and per-scheme `theme-color` metas (`#0C0C1C` dark, `#F4EDE3` light); loads Amiri, Amiri Quran and IBM Plex Sans Arabic.
- `src/landing/LandingPage.tsx` (new, 368 lines) — sections: hero with a phone mockup, story (`#story`), the five-step method (`#method`), what is inside the app (`#inside`), the privacy promise (`#promise`), a closing call to action, and a footer with a privacy dialog. `APP_URL` is `https://alhamd.ai.studio`; `SUPPORT_EMAIL` is empty, which hides the contact link.
- `src/landing/PhoneMockups.tsx` (new, 195) — `PhoneFrame`, `PhoneHomeScreen`, `PhoneReflectScreen` and a `StarPattern`: hand-built replicas of two app screens, not the real components.
- `src/landing/icons.tsx` (new, 119) — 13 inline SVG icons, so the landing bundle does not need `lucide-react`.
- `src/landing/landing.css` (new, 144) — its own token set, below.
- `src/landing/main.tsx` (new, 10) — mounts `LandingPage`.
- `vite.config.ts` (+8) — `build.rollupOptions.input` now lists two entries, `index.html` and `landing/index.html`.

### Design changes

- The landing page re-declares the Layl and Nahar palettes under its own `--l-*` names with the same hex values as the app, plus a few of its own (page `#0C0C1C`, tab bar `#1A1A30`). They are exposed to Tailwind as `ah-*` colours through `@theme inline`.
- **Theme selection differs from the app.** The landing page is dark by default and follows the system with `@media (prefers-color-scheme: light)`; either theme can be forced with `<html data-theme="dark|light">`. The app uses a stored setting and `.theme-light` / `.theme-dark` classes and ignores the system preference.
- The only `prefers-reduced-motion` rule in the repository is here (it turns off smooth scrolling).
- The landing page loads three font families; the app loads five.

---

## `70602c1` — feat: serve landing on alhamd.app and app on app.alhamd.app

**2026-11-11 14:31 UTC · Claude · 2 files, +29 / −1**

Host-based routing so that one Vercel project serves both the landing page and the app. The message begins "Merge the landing page branch", but this is an ordinary single-parent commit on top of `55ccf2e`.

### Files

- `vercel.json` (new, 28 lines) — a permanent redirect from `www.alhamd.app/*` to `https://alhamd.app/*`, and a rewrite of `/` to `/landing/index.html` when the host is `alhamd.app`.
- `src/landing/LandingPage.tsx` (+1 / −1) — `APP_URL` changes from `https://alhamd.ai.studio` to `https://app.alhamd.app`.

---

## `e7dfbbe` — fix: let host rewrites decide what / serves

**2026-11-11 14:48 UTC · Claude · 2 files, +7 / −13**

Seventeen minutes later, a fix for the previous commit. As the message explains, Vercel serves a real file before it applies rewrites, so `dist/index.html` always won and `alhamd.app` showed the app instead of the landing page.

### Files

- `package.json` — the `build` script changes from `vite build` to `vite build && mv dist/index.html dist/app.html`, so there is no `index.html` at the root of the output.
- `vercel.json` — a second rewrite, `/` → `/app.html`, is added after the `alhamd.app` rule, so every other host gets the app. The `has` blocks are reformatted onto one line.

### Dependencies / tooling

- The build now depends on a shell `mv`, and its output no longer contains an `index.html` at the root of `dist/` (the app page is `dist/app.html`, the landing page `dist/landing/index.html`).

---

## `1d7eb66` — Merge pull request #1

**2026-11-15 18:49 +0200 · adel3li · merges `claude/brave-archimedes-mmnpem` into `main`**

PR title: "Serve the landing page on alhamd.app and the app on app.alhamd.app". Brings in `55ccf2e`, `70602c1` and `e7dfbbe`: nine files, +890 / −1 (the landing page, `vercel.json`, and the `package.json` and `vite.config.ts` changes). No conflict resolution is visible; `main` had not moved since `28d36cb`.

---

## `793f8be` — docs: link the alhamd.app landing page in the README

**2026-11-16 20:10 UTC · Claude · 1 file, +1 / −1**

On the README branch, on top of `1340209`. The link row changes from a single "Live demo" link to two: "Website" (`https://alhamd.app`) and "Live app" (still `https://alhamd-wheat.vercel.app`).

---

## `bca55ba` — Merge pull request #2

**2026-11-16 22:13 +0200 · adel3li · merges `claude/project-resume-presentation-kg85tf` into `main`**

PR title: "docs: add project README with screenshots and live links". Brings in `1340209` and `793f8be`: `README.md` and the six screenshots (7 files, +115). From this point `main` has a README again.

---

## `c28abe4` — docs: point the README live app link at app.alhamd.app

**2026-11-16 20:16 UTC · Claude · 1 file, +1 / −1**

The "Live app" link changes from `https://alhamd-wheat.vercel.app` to `https://app.alhamd.app`, matching the landing page's `APP_URL`.

---

## `68e723a` — Merge pull request #3

**2026-11-16 22:16 +0200 · adel3li · merges `claude/project-resume-presentation-kg85tf` into `main`**

PR title: "docs: point the README live app link at app.alhamd.app". Brings in `c28abe4` (1 file, +1 / −1). This is the current tip of `main`.

---

## Design reference images

### `public/assets/aistudio/` (13 files: 10 PNG, 2 HTML, 1 `.gitignore`)

Each PNG's filename ends in the first eight hex digits of its SHA-256. The time in each screenshot's name falls on the day of the commit that added it.

| File | Added in | Size | What it shows |
|---|---|---|---|
| `Screenshot_2026-10-20_at_10.59.22_AM_71b3c400.png` | `5ebc2dc` | 582×134, 20,463 B | Dark. Crop of the home header: "السلام عليكم" and the date "٩ جمادى الأولى ١٤٤٨ هـ هـ", with the "هـ" suffix printed twice. A bug report; the same commit adds the suffix clean-up in `src/lib/hijri.ts`. |
| `app-icon-palette_a8ddd79f.png` | `5ebc2dc` | 2094×1348, 229,735 B | The app-icon specification. The «الحمد» wordmark over a thread ending in a dot, inside a dashed safe circle, in two versions: light (`#F4EDE3` ground, `#2A1F19` ink, `#B9573B` thread) and dark (`#2A1F19` ground, `#F4EDE3` ink, `#D4704F` thread). Below are measurements: thread 0.02 × S, dot 0.075 × S, gap 0.20 × S, safe circle ⌀ 820 px. This is the source of the Nahar palette and of the `BrandMark` proportions set in the same commit. |
| `image_1c2c59f3.png` | `5ebc2dc` | 592×966, 115,152 B | Light. The expanded "تدبّر النعمة" panel: hadith, "وقفات في أثر النعمة" text, a scholar quote attributed to Ibn al-Qayyim, and a "مشاركة التدبّر" text link. Appears to be a reference for this panel in the new light theme; the commit enlarges its text and turns the link into an icon button. |
| `Screenshot_2026-10-20_at_11.31.22_AM_c839fb27.png` | `5ebc2dc` | 380×354, 50,276 B | Light. The "تسبيح ختامي" closing dhikr circle drawn as a dark navy disc on the cream page, the count barely readable. Appears to be a bug report: the control had not followed the light theme. |
| `Screenshot_2026-10-20_at_11.42.14_AM_b211da50.png` | `5ebc2dc` | 306×300, 39,113 B | Light. The same control eleven minutes later: a white disc with a terracotta progress arc and the count ١٠٤. Shows the themed surface and the 100-count ring introduced in this commit. |
| `Screenshot_2026-10-20_at_4.03.44_PM_86ab5907.png` | `5ebc2dc` | 366×152, 15,419 B | Light. Two labelled pill buttons, "نسخ" (copy) and "بطاقة مشاركة" (share card). Neither label appears in the committed code, which uses icon-only round buttons, so this shows an intermediate state. |
| `Screenshot_2026-10-20_at_4.04.39_PM_eed5faf1.png` | `5ebc2dc` | 652×188, 20,353 B | Light. A grid of font-size presets: 12, 14 (selected), 15, 16, 18, 20, 22, 24. The committed settings screen has a stepper, slider and number input instead, so this preset grid is another intermediate state. |
| `Screenshot_2026-10-20_at_8.59.08_PM_059a7fe0.png` | `4b31e3b` | 688×118, 20,396 B | Dark. Three shortcut chips: "أذكار الصباح", "أذكار المساء" and "حصن المسلم" (highlighted in gold). No such row exists in the committed code; the unused `onOpenHisn(category)` prop on the home screen is the only trace of it. |
| `Screenshot_2026-10-20_at_9.00.25_PM_151951b4.png` | `4b31e3b` | 722×654, 86,165 B | Dark. The "حديث اليوم" card fully expanded, with copy and share buttons and no chevron: its appearance before this commit made it collapsible. |
| `Screenshot_2026-10-28_at_4.22.15_AM_6d0d82ca.png` | `e341c65` | 852×352, 43,911 B | Dark. A journey card headed "النعمة المرتبطة بالمحطة · نعم الدين" with the title "نعمة الإسلام" and its opening line. That heading text does not occur anywhere in `src/`, so the image shows a state of the station popup that was changed before the commit. |
| `design-sheet-layl-dark_f2b4cff4.html` | `5ebc2dc` | 342 lines, 43,918 B | A self-contained design-system page, "نظام التصميم — «ليل»". Sections: 1 colours (dark), 2 the light version "Nahar", 3 fonts, 4 surfaces and ornament, 5 the mark and the thread, 6 components and states, 7 sizes, motion and touch, and a closing "better than the reference" list. |
| `design-sheet-nahar-light_5cbc4393.html` | `5ebc2dc` | 338 lines, 43,730 B | The same sheet rendered in the light palette, "نظام التصميم — «نهار»", with sections 1 and 2 swapped. |
| `.gitignore` | `5ebc2dc` | 2 B | Contains `*`. All the files above are tracked regardless. |

Because these files are under `public/`, Vite copies them unchanged into the production build.

### Duplicates under `.aistudio/`

All ten PNGs under `.aistudio/artifacts/brain/9e9ad89d-252a-4dbf-9371-5f59847c6e20/.tempmediaStorage/` are byte-identical to a file in `public/assets/aistudio/` (same git blob id and same SHA-256). Each pair was added in the same commit.

| `.aistudio/…/.tempmediaStorage/` | Identical to `public/assets/aistudio/` | Commit |
|---|---|---|
| `media_1792483190847_f125a795.png` | `Screenshot_2026-10-20_at_10.59.22_AM_71b3c400.png` | `5ebc2dc` |
| `media_1792483315785_f8ac5727.png` | `app-icon-palette_a8ddd79f.png` | `5ebc2dc` |
| `media_1792484268249_58dfb3e8.png` | `image_1c2c59f3.png` | `5ebc2dc` |
| `media_1792485269967_4749c6fa.png` | `Screenshot_2026-10-20_at_11.31.22_AM_c839fb27.png` | `5ebc2dc` |
| `media_1792501600048_8560d591.png` | `Screenshot_2026-10-20_at_11.42.14_AM_b211da50.png` | `5ebc2dc` |
| `media_1792501600460_eff211de.png` | `Screenshot_2026-10-20_at_4.03.44_PM_86ab5907.png` | `5ebc2dc` |
| `media_1792501602639_1ad0b2f1.png` | `Screenshot_2026-10-20_at_4.04.39_PM_eed5faf1.png` | `5ebc2dc` |
| `media_1792519209528_0adba12a.png` | `Screenshot_2026-10-20_at_8.59.08_PM_059a7fe0.png` | `4b31e3b` |
| `media_1792519308661_1631fbbf.png` | `Screenshot_2026-10-20_at_9.00.25_PM_151951b4.png` | `4b31e3b` |
| `media_1793150771090_c1bc1134.png` | `Screenshot_2026-10-28_at_4.22.15_AM_6d0d82ca.png` | `e341c65` |

The two HTML design sheets have no copy under `.aistudio/`.

### `docs/screenshots/` (6 PNG, all added in `1340209`)

All six are 780×1688, dark theme, and show the app as of `28d36cb`.

| File | Size | What it shows |
|---|---|---|
| `home.png` | 162,326 B | Home. Top bar (gold-ringed «ح», wordmark, settings gear), greeting and Hijri date, the collapsed "حديث اليوم" card, the "نعمة اليوم" divider, and the blessing card for "نعمة الإسلام" with its gold ayah. Five-tab bar with الرئيسية active. |
| `journey.png` | 137,308 B | Journey path for "منزل نعمة العبادة", 0 of 7 complete. Seven station cards on a winding path, station 1 (الإسلام) highlighted as current, the others dashed and marked as previews, with the end-of-stage review at the top. Path / statistics tabs and a "تخصيص" button. |
| `tasbih.png` | 150,061 B | Tasbih tab headed "المسبحة وحصن المسلم", with the counter / Hisn switcher, dhikr chips, and the audio player: play controls, the verse, reciter chips, an 80% volume slider, and the repeat and ambient toggles. |
| `journal.png` | 127,123 B | Journal with the two segments, month navigator, search, category pills, the "دوّن تأملاً جديداً" quick-composer button from `28d36cb`, and the two seeded sample entries. |
| `consistency.png` | 148,717 B | Consistency screen: the statistics card (3 total, 2-day streak) with its two-series area chart, and the top of the category-insight card with its three chart-type tabs. |
| `paywall.png` | 223,125 B | The paywall in its compact `28d36cb` layout: three benefits, annual plan selected, lifetime plan beside it, both showing bracketed placeholder prices, the privacy note and the "always free" footer line. |

---

## Per-file lifetime

Files under `src/` that changed in more than one commit. Numbers are line counts after each commit.

| File | Trail |
|---|---|
| `src/App.tsx` | created `a47edd1` (206) → `5ebc2dc` tasbih tab, themed wrapper (221) → `3a7e4e4` particle flag (227) → `4b31e3b` Hisn sub-view, particles rendered (252) → `e341c65` journey tab and paywall gate (273) → `28d36cb` one haptic (274) |
| `src/lib/store.tsx` | created `a47edd1` (486) → `5ebc2dc` numeric font size (516) → `3a7e4e4` theme key v2 (518) → `e341c65` journey, contrast, night mode, font family (748) → `28d36cb` haptics in journey callbacks (753) |
| `src/types.ts` | created `a47edd1` (164) → `5ebc2dc` `fontSize` (167) → `e341c65` journey and display types (230) |
| `src/index.css` | created `a47edd1` (80) → `5ebc2dc` colour tokens and light remapping (278) → `e341c65` high contrast and night reading (548) |
| `src/lib/hijri.ts` | created `a47edd1` (132) → `5ebc2dc` suffix fix (138) → `4b31e3b` real Hijri month calendar (236) |
| `src/constants/strings.ts` | created `a47edd1` (98) → one tab label added in each of `5ebc2dc`, `4b31e3b`, `e341c65` (101) |
| `src/components/common/ShareCardModal.tsx` | created `a47edd1` (273) → rewritten `5ebc2dc` (+428 / −188, 513) → rewritten `e341c65` (+487 / −239, 761) |
| `src/components/common/BrandMark.tsx` | created `a47edd1` (49) → `5ebc2dc` token colours, new proportions (56) |
| `src/components/common/GlassCard.tsx` | created `a47edd1` (44) → `5ebc2dc` token-based surface (41) |
| `src/components/common/StarLattice.tsx` | created `a47edd1` (55) → `5ebc2dc` simpler two-square tile (31) |
| `src/components/common/ThreadProgress.tsx` | created `a47edd1` (49) → `5ebc2dc` token colours (55) |
| `src/components/common/SpotlightTour.tsx` | created `a47edd1` (128) → `5ebc2dc` last step retargeted (128) |
| `src/components/layout/BottomTabBar.tsx` | created `a47edd1` (70) → `5ebc2dc` tasbih replaces settings, `TasbihIcon` (101) → `e341c65` journey tab (102) |
| `src/components/layout/DesktopNavBar.tsx` | created `a47edd1` (71) → `5ebc2dc` tasbih tab, settings gear (85) → `e341c65` journey tab (86) |
| `src/components/layout/TopBar.tsx` | created `a47edd1` (49) → `5ebc2dc` settings gear replaces calendar (55) |
| `src/components/screens/HomeScreen.tsx` | created `a47edd1` (261) → `5ebc2dc` copy buttons, tasbih card removed (309) → `4b31e3b` collapsible inspiration card (345) → `e341c65` share label (347) |
| `src/components/screens/ReflectionModal.tsx` | created `a47edd1` (273) → `5ebc2dc` timer, progress ring (538) → `3a7e4e4` particle overlay (571) → `e341c65` share button (599) |
| `src/components/screens/TasbihModal.tsx` | created `a47edd1` (159) → `5ebc2dc` inline mode, ring (228) → `4b31e3b` Hisn sub-view (305) → `e341c65` audio player (315) |
| `src/components/screens/ConsistencyScreen.tsx` | created `a47edd1` (195) → `5ebc2dc` statistics chart (404) → `4b31e3b` interactive Hijri calendar (528) → `e341c65` category charts (532) |
| `src/components/screens/SettingsScreen.tsx` | created `a47edd1` (368) → `5ebc2dc` numeric font size (436) → `e341c65` night mode, contrast, fonts, developer tools (790) |
| `src/components/screens/JournalScreen.tsx` | created `a47edd1` (381) → `5ebc2dc` sizing only (381) → `28d36cb` haptics, quick composer (486) |
| `src/components/screens/ComposeBlessingModal.tsx` | created `a47edd1` (195) → `28d36cb` haptics (199) |
| `src/components/screens/PremiumPaywallScreen.tsx` | created `e341c65` (299) → `28d36cb` compact layout (301) |
| `src/components/journey/JourneyPathScreen.tsx` | created `e341c65` (1,397) → `28d36cb` haptics (1,398) |
| `src/components/journey/JourneyStationFlow.tsx` | created `e341c65` (533) → `28d36cb` haptics (533) |
| `src/components/journey/JourneyMuhasabaScreen.tsx` | created `e341c65` (167) → `28d36cb` haptics (170) |
| `src/landing/LandingPage.tsx` | created `55ccf2e` (368) → `70602c1` app URL (368) |

Files under `src/` created once and never modified:

- From `a47edd1`: `main.tsx`, `constants/categories.ts`, `constants/tokens.ts`, `data/blessings_ar.json`, `data/dhikr.ts`, `data/inspirations.ts`, `data/loader.ts`, `lib/arabic.ts`, `lib/dailyLogic.ts`, `screens/AboutModal.tsx`, `screens/ContentReviewModal.tsx`, `screens/OnboardingScreen.tsx`, `screens/PrivacyPolicyModal.tsx`.
- From `3a7e4e4`: `common/CompletionParticles.tsx`.
- From `4b31e3b`: `screens/HisnScreen.tsx`, `data/hisnAlMuslim.ts`.
- From `e341c65`: `common/ReflectionCategoryCharts.tsx`, `journey/JourneyOnboarding.tsx`, `journey/JourneyWeeklyProgressChart.tsx`, `journey/JourneyPaywall.tsx`, `journey/PremiumPaywallScreen.tsx`, `screens/JourneyPathScreen.tsx`, `screens/TasbihAudioPlayer.tsx`, `data/journey_content.json`, `lib/analytics.ts`, `lib/entitlements.ts`, `lib/journeyStore.ts`.
- From `55ccf2e`: `landing/PhoneMockups.tsx`, `landing/icons.tsx`, `landing/landing.css`, `landing/main.tsx`.

Files outside `src/` that changed more than once:

| File | Trail |
|---|---|
| `README.md` | AI Studio banner `3aaa222` → deleted `a47edd1` → new project README `1340209` → link row edited `793f8be`, `c28abe4` |
| `package.json` | created `a47edd1` → `5ebc2dc` adds `recharts`, sorts dependencies → `e7dfbbe` build script renames `dist/index.html` to `app.html` |
| `index.html` | created `a47edd1` → `3a7e4e4` `dark theme-dark` class on `<html>` → `e341c65` two more font families |
| `vite.config.ts` | created `a47edd1` → `55ccf2e` second build entry for the landing page |
| `vercel.json` | created `70602c1` → `e7dfbbe` second rewrite to `/app.html` |

Nothing under `legacy/` has changed since `a47edd1`.

---

## Codebase size over time

Tracked `.ts`, `.tsx` and `.css` files under `src/`, and their total line count, at each feature commit.

| Commit | Date | Files (ts / tsx / css) | Lines | Change | Of which TS/TSX | Of which CSS |
|---|---|---|---|---|---|---|
| `a47edd1` | 2026-09-10 | 34 | 4,542 | — | 4,462 | 80 |
| `5ebc2dc` | 2026-10-20 | 34 | 5,731 | +1,189 | 5,453 | 278 |
| `3a7e4e4` | 2026-10-20 | 35 | 5,904 | +173 | 5,626 | 278 |
| `4b31e3b` | 2026-10-20 | 37 | 7,644 | +1,740 | 7,366 | 278 |
| `e341c65` | 2026-10-28 | 51 | 14,128 | +6,484 | 13,580 | 548 |
| `28d36cb` | 2026-11-07 | 51 | 14,249 | +121 | 13,701 | 548 |
| `HEAD` (`68e723a`) | 2026-11-16 | 56 | 15,085 | +836 | 14,393 | 692 |

- The app itself has not changed since `28d36cb`. The whole increase at `HEAD` is the landing page (`src/landing/`: 5 files, 836 lines); excluding it, `HEAD` is 51 files and 14,249 lines.
- JSON content under `src/` is counted separately: 2,806 lines (`blessings_ar.json`) from `a47edd1`, rising to 3,531 lines at `e341c65` with `journey_content.json`.
- The code tripled in size between 20 October and 28 October 2026: from 4,542 lines before the theme commit to 14,128 after the journey commit.
- For comparison, `legacy/src/` holds 30 `.ts` / `.tsx` / `.css` files totalling 4,410 lines, about the size of the v2 baseline.

---

## Evolution at a glance

**Mobile tabs**

| Version | Tabs, in order | Where settings lives |
|---|---|---|
| Legacy | home, tasbih, my blessings, journal, consistency, settings (6) | a tab |
| `a47edd1` | home, journal, consistency, settings (4) | a tab |
| `5ebc2dc` | home, journal, consistency, tasbih (4) | gear in the top bar |
| `e341c65` | home, journey, journal, consistency, tasbih (5) | gear in the top bar |

**Colour system**

| Version | Dark | Light |
|---|---|---|
| Legacy | slate `#0f172a`, indigo `#6366f1`, amber `#fbbf24` | `#f8fafc`, indigo `#4f46e5`, amber `#f59e0b` |
| `a47edd1` | navy `#15152A`, gold `#E4C368` / `#C8A951`, violet `#6C63FF`, as literal hex classes | stub: wrapper `#F4F5FA` / `#1E1E38` only |
| `5ebc2dc` | same values, named as CSS variables ("Layl") | new: cream `#F4EDE3`, ink `#2A1F19`, terracotta `#B9573B` ("Nahar") |
| `e341c65` | adds high-contrast dark and warm night-reading palettes | adds high-contrast light |
| `55ccf2e` | landing page repeats Layl under `--l-*` names | landing page repeats Nahar, chosen by system preference |

**Fonts**

| Version | Families loaded |
|---|---|
| Legacy | Inter, IBM Plex Sans Arabic, Amiri |
| `a47edd1` | Amiri Quran, Amiri, IBM Plex Sans Arabic |
| `e341c65` | adds Noto Naskh Arabic and Tajawal; body font becomes user-selectable |

**Storage keys, in order of appearance**

| Commit | Keys introduced | Keys retired |
|---|---|---|
| `a47edd1` | `alhamd_onboarded`, `alhamd_welcome_seen`, `alhamd:tourComplete`, `alhamd:analytics_consent`, `alhamd_theme`, `alhamd_text_size`, `alhamd_notif_enabled`, `alhamd_notif_time`, `alhamd_completed_reflections`, `alhamd_journal`, `alhamd:userBlessings:v1`, `alhamd_tasbih_count` | — |
| `5ebc2dc` | `alhamd_font_size_v2` | — |
| `3a7e4e4` | `alhamd_theme_v2` | `alhamd_theme` (deleted on start-up) |
| `4b31e3b` | `alhamd_hisn_counts_<date>`, `alhamd_hisn_favorites` | — |
| `e341c65` | `alhamd_high_contrast`, `alhamd_night_reading`, `alhamd_font_family`, `alhamd:journey_state:v1`, `alhamd:journey_onboarded:v1`, `alhamd:dev_premium`, `alhamd:analytics_events_log`, `alhamd_tasbih_reciter_v1`, `alhamd_tasbih_volume_v1` | — |

No commit after `e341c65` adds or removes a storage key.
