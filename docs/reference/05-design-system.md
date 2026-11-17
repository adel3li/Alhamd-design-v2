# Design system

> **Changed since this was written** (commit `d3dfd92`, 17 November 2026): `.animate-fade-in` and `.animate-scale-up` no longer keep their end state (no `forwards`), so they leave no transform on the element and dialogs inside a screen are positioned against the viewport. The rest of this file is unchanged.

State of the code at commit `68e723a` (`main`, 2026-11-16). Line references are `path:line` against that commit.

Sources read in full for this file: `src/index.css` (548 lines), `src/constants/tokens.ts` (50 lines), `index.html` (21 lines), the two design sheets in `public/assets/aistudio/` (342 and 338 lines) and `app-icon-palette_a8ddd79f.png`. `src/App.tsx` and `src/lib/store.tsx` were read for the parts that drive theming. Statements marked "verified at run time" were observed in headless Chrome 153 against a production build (`vite build`); the sandbox could not fetch Google Fonts, so run-time measurements used fallback fonts.

The landing page has its own stylesheet (`src/landing/landing.css`) and is described in [10-landing-page.md](10-landing-page.md). Nothing in this file applies to it unless stated.

## 1. At a glance

- Two themes: dark, called «ليل» (Layl), which is the default; and light, called «نهار» (Nahar). Two modifiers: high contrast (works with either theme) and night reading (dark only).
- Colour is applied by **two mechanisms that coexist**:
  1. CSS custom properties (`--bg-ground`, `--text-primary`, ...) declared in `src/index.css` and read through inline `style` attributes.
  2. Hard-coded dark-theme hex utilities (`bg-[#15152A]`, `text-[#EDEDF5]`, ...) written in components, which `src/index.css` re-colours per mode with `!important` rules keyed on the escaped class name.
- Mechanism 2 carries most of the UI: 1,574 six-digit hex literals in `src/components`, against 146 `var(--…)` reads in `src/` outside the landing page.
- There is no `tailwind.config`, and `src/index.css` contains no `@theme`, `@utility` or `@custom-variant`. Tailwind runs on its defaults.
- `src/constants/tokens.ts` is imported by nothing. Its light palette is a different (cool blue-grey) palette from the one in use.
- The main app has no `prefers-reduced-motion` handling.

## 2. How theming works end to end

### 2.1 What is set, where, and who reads it

| Signal | Set by | Read by |
|---|---|---|
| `<html lang="ar" dir="rtl" class="dark theme-dark">` | Static markup, `index.html:2` | See the next four rows |
| `dark theme-dark` or `light theme-light` on `<html>` | Store effect, `src/lib/store.tsx:335-345` | Only `theme-light` is read: variables (`src/index.css:31`), remap rules (`:79-226`), high-contrast selectors (`:284`, `:324`). No selector in `src/index.css` mentions `.dark`, `.light` or `.theme-dark` |
| `high-contrast` on `<html>` | Store effect, `src/lib/store.tsx:347-351` | `src/index.css:284-378` |
| `night-reading` on `<html>` | Store effect, `src/lib/store.tsx:353-357` | `src/index.css:395-546` |
| `text-size-normal` / `text-size-large` / `text-size-xlarge` on `<html>` | Store effect, `src/lib/store.tsx:381-383` | Nothing. No CSS or script reads these classes |
| `--font-sans` as an inline style on `<html>` | Store effect, `src/lib/store.tsx:362-369` | `body` (`src/index.css:55`), `.font-sans` and `.font-ibm` (`:70`), Tailwind's `font-sans` utility and its preflight default font (the build emits `--default-font-family: var(--font-sans)`) |
| `data-font-family="ibm\|noto-naskh\|amiri\|tajawal"` on `<html>` | Store effect, `src/lib/store.tsx:370` | `src/index.css:381-388` |
| `--app-font-size` as an inline style on `<html>`, plus inline `font-size` | Store effect, `src/lib/store.tsx:377-378` | `html { font-size: var(--app-font-size, 16px) }`, `src/index.css:229-231` |
| `theme-light bg-[#F4EDE3] text-[#2A1F19]` or `theme-dark bg-[#15152A] text-[#EDEDF5]` on the app root `<div>` | `src/App.tsx:111-113`; same pair on the onboarding wrapper, `:80` | `.theme-light` re-declares every light variable on that `<div>` (`src/index.css:31`). This has a side effect described in 2.4 |
| `text-scale-normal` / `text-scale-large` / `text-scale-xlarge` on the app root `<div>` | `src/App.tsx:105-109` from the store's `textSize` | `src/index.css:245-249`, which gives all three the same declaration |
| `font-sans`, `selection:bg-[#C8A951]/30` on the app root `<div>` | `src/App.tsx:116` | Tailwind |
| `bg-[#15152A] text-[#EDEDF5] antialiased selection:bg-[#6C63FF]/30 selection:text-[#E4C368]` on `<body>` | Static markup, `index.html:16` | Tailwind, and the remap rules (`<body>` is a descendant of `html.theme-light`) |

`ThemeMode` also allows `'auto'` (`src/types.ts:99`), but the store accepts only `'light'` or `'dark'` and treats everything else as dark (`src/lib/store.tsx:133`, `:337`). `ShareCardModal` does the same (`src/components/common/ShareCardModal.tsx:20`). There is no `prefers-color-scheme` detection in the app.

### 2.2 The two colouring mechanisms

**Mechanism 1: custom properties.** `:root` declares the dark values, `.theme-light` the light ones, and `html.high-contrast…` / `html.night-reading` override them (section 3). Components read them with inline styles, for example `style={{ backgroundColor: 'var(--bg-glass)' }}` (`src/components/common/GlassCard.tsx:27`). Only `body` reads a colour variable from CSS itself (`src/index.css:57-58`).

Consumers per variable, counted in `src/**/*.ts(x)` outside `src/landing`:

| Variable | Reads | Files |
|---|---:|---|
| `--border-hairline` | 36 | GlassCard, ReflectionCategoryCharts, ThreadProgress, ConsistencyScreen, HomeScreen, ReflectionModal, SettingsScreen, TasbihAudioPlayer, HisnScreen, TasbihModal |
| `--accent-stroke` | 23 | GlassCard, CompletionParticles, BrandMark, ThreadProgress, JourneyPathScreen, ConsistencyScreen, HomeScreen, ReflectionModal, HisnScreen, TasbihModal |
| `--bg-sunken` | 17 | ReflectionCategoryCharts, JourneyPathScreen, ConsistencyScreen, HomeScreen, SettingsScreen, TasbihAudioPlayer, HisnScreen, TasbihModal |
| `--text-primary` | 15 (+1 in CSS) | StarLattice, ReflectionCategoryCharts, BrandMark, ConsistencyScreen, ReflectionModal, HisnScreen, TasbihModal |
| `--bg-raised` | 12 | GlassCard, ReflectionCategoryCharts, JourneyPathScreen, ConsistencyScreen, HomeScreen, ReflectionModal, TasbihAudioPlayer, HisnScreen, TasbihModal |
| `--text-muted` | 10 | ReflectionCategoryCharts, ConsistencyScreen |
| `--accent-text` | 9 | JourneyPathScreen, ConsistencyScreen, HomeScreen, ReflectionModal, HisnScreen, TasbihModal |
| `--ayah-border` | 7 | CompletionParticles, JourneyPathScreen, HomeScreen, ReflectionModal, HisnScreen |
| `--cta-bg` | 6 | CompletionParticles, ConsistencyScreen, ReflectionModal, HisnScreen |
| `--ayah-color` | 4 | JourneyPathScreen, HomeScreen, SettingsScreen, HisnScreen |
| `--raised-shadow` | 3 | GlassCard, ReflectionModal, TasbihModal |
| `--bg-glass`, `--card-shadow` | 1 each | GlassCard |
| `--bg-deepest`, `--text-secondary` | 1 each | HomeScreen; HisnScreen |
| `--bg-ground` | 0 (+1 in CSS, `body`) | — |
| `--bg-deep`, `--cta-pressed`, `--danger` | 0 | Declared, never read |

**Mechanism 2: hex utilities plus remap rules.** Components are written in dark-theme colours as Tailwind arbitrary values. For each mode, `src/index.css` contains rules such as:

```css
.theme-light .bg-\[\#15152A\] { background-color: #F4EDE3 !important; }   /* src/index.css:79 */
```

The selector matches the literal class name, so each opacity suffix and each variant prefix (`hover:`, `focus:`, `sm:` ...) is a separate class that needs its own rule. Section 5.6 lists every rule. Coverage, counted over `src/**/*.tsx` outside `src/landing` plus `index.html`:

| | Distinct hex utility classes | Uses |
|---|---:|---:|
| Written in the code | 132 | 1,495 |
| Re-coloured in the light theme | 53 | 1,338 |
| Not re-coloured in the light theme | 79 | 157 |
| Re-coloured in night reading | 40 | 1,211 |
| Not re-coloured in night reading | 92 | 284 |

Section 16.4 names the unmapped classes.

Three consequences of the `!important` remap rules:

- **They beat inline styles.** An element that carries both a remapped class and an inline `var(--…)` style gets the remap value in light, high-contrast-light and night modes, and the inline value in plain dark. Example: `ReflectionCategoryCharts` sets `backgroundColor: 'var(--bg-raised)'` inline; its `journey` variant also carries `bg-[#1E1E38]/90`, which is remapped, and its default variant carries `bg-[#1E1E38]/85`, which is not (`src/components/common/ReflectionCategoryCharts.tsx:212-224`). In the light theme the two variants therefore render `#FBF8F3` and `#FFFFFF`.
- **They suppress unmapped hover states.** `hover:bg-[#27274A]` has no light rule; the base class on the same element (`bg-[#1E1E38]`) is forced to `#FBF8F3 !important`, so the hover colour never shows in the light theme (`src/components/common/ShareCardModal.tsx:696`).
- **Some rules set two properties.** `.theme-light .bg-\[\#6C63FF\]` and the gold fills also force `color: #FFFFFF !important` (`src/index.css:167-170`, `:191-195`); the night rule forces `#FAF0E4` (`:501-504`). A child with its own remapped text class keeps that class's colour: the `text-[#E4C368]` check icon inside the violet save button becomes `#9E4A30` on `#B9573B` in the light theme (`src/components/common/ShareCardModal.tsx:682`), a contrast of about 1.3:1.

### 2.3 Cascade layers

`src/index.css` puts only `:root`, `.theme-light` and `body` inside `@layer base` (`:3-64`). Every other rule in the file is unlayered, so it outranks all Tailwind utilities regardless of specificity. Between the unlayered remap rules, specificity decides: `html.theme-light.high-contrast .x` beats `.theme-light .x`, and `html.night-reading .x` beats `.theme-light .x`.

### 2.4 Mode combinations

The store setters keep the modes consistent (`src/lib/store.tsx:426-446`): choosing the light theme turns night reading off; enabling high contrast turns night reading off; enabling night reading forces the dark theme and turns high contrast off. The reachable combinations are:

| Combination | `<html>` classes | What applies |
|---|---|---|
| Dark | `dark theme-dark` | `:root` variables; no remap rules |
| Dark + high contrast | `dark theme-dark high-contrast` | `src/index.css:284-321`. Verified at run time: `--text-primary` resolves to `#fff` and `--border-hairline` to `#525282` inside the app |
| Dark + night reading | `dark theme-dark night-reading` | `src/index.css:395-546`. Verified at run time: `--text-primary` `#e8dac8`, `--cta-bg` `#b87333`, `body::after` overlay present |
| Light | `light theme-light` | `.theme-light` variables and remap rules |
| Light + high contrast | `light theme-light high-contrast` | Remap rules at `src/index.css:343-378` apply. **The variable overrides at `:324-341` do not reach the app** (see below) |

**Defect: light high-contrast variables are shadowed.** `html.theme-light.high-contrast` sets the high-contrast values on `<html>`, but the app root `<div>` also has the class `theme-light` (`src/App.tsx:112`), and `.theme-light` re-declares the ordinary light values on that `<div>`. Custom properties inherit, so everything inside the app sees the ordinary light values. Verified at run time with the light theme and high contrast on:

| Variable | On `<html>` and `<body>` | On the app root `<div>` |
|---|---|---|
| `--text-primary` | `#0d0805` | `#2a1f19` |
| `--border-hairline` | `#8c7762` | `#dccfbe` |
| `--bg-glass` | `#fff` | `#fbf8f3` |
| `--bg-ground` | `#faf7f2` | `#f4ede3` |

The today-card (`GlassCard`) rendered `rgb(251, 248, 243)` instead of white, the brand mark rendered `rgb(42, 31, 25)` instead of `#0D0805`, and the root `<div>`'s own `bg-[#F4EDE3]` covered the `<body>` background `rgb(250, 247, 242)`. In this combination only the class-keyed remap rules take effect.

Night reading does not have this problem because it only runs in the dark theme, and no rule matches `.theme-dark`.

### 2.5 First paint

`index.html` is static and always starts as dark (`index.html:2`, `:16`). The store applies the saved theme in a `useEffect` after the first render (`src/lib/store.tsx:335`). There is no inline script that reads `localStorage` before paint, no `color-scheme` declaration and no `<meta name="theme-color">` in `index.html`. A light-theme user therefore gets a dark `<body>` until React has mounted. The app root `<div>` carries its own theme class from the first render, which limits the effect to the area outside that `<div>`.

## 3. CSS custom properties

Declared in `src/index.css`. "—" means the mode does not override the variable, so the value of the underlying theme applies. Read the high-contrast-light column together with the defect in 2.4.

| Variable | Dark `:root` (`:4-29`) | Light `.theme-light` (`:31-52`) | High contrast, dark (`:284-298`) | High contrast, light (`:324-341`) | Night reading (`:395-415`) |
|---|---|---|---|---|---|
| `--font-serif` | `'Amiri', serif` | — | — | — | — |
| `--font-sans` | `'IBM Plex Sans Arabic', sans-serif` (replaced at run time by the store) | — | — | — | — |
| `--font-quran` | `'Amiri Quran', 'Amiri', serif` | — | — | — | — |
| `--bg-ground` | `#15152A` | `#F4EDE3` | `#0B0B18` | `#FAF7F2` | `#0B0806` |
| `--bg-deep` | `#111126` | `#EDE3D4` | `#070712` | `#F3EDE2` | `#080604` |
| `--bg-deepest` | `#0C0C1C` | `#E6DAC8` | `#04040B` | `#EAE1D3` | `#050403` |
| `--bg-glass` | `#1E1E38` | `#FBF8F3` | `#14142B` | `#FFFFFF` | `#140F0B` |
| `--bg-raised` | `#25232E` | `#FFFFFF` | `#1C1C38` | `#FFFFFF` | `#1C1510` |
| `--bg-sunken` | `#1B1B33` | `#EFE6D9` | `#0E0E20` | `#F2ECE1` | `#0E0B08` |
| `--border-hairline` | `#2E2E4A` | `#DCCFBE` | `#525282` | `#8C7762` | `#2B2017` |
| `--text-primary` | `#EDEDF5` | `#2A1F19` | `#FFFFFF` | `#0D0805` | `#E8DAC8` |
| `--text-secondary` | `#C7C4D8` | `#4A3B32` | `#F2F2FC` | `#1C130D` | `#C6B49D` |
| `--text-muted` | `#AEAECB` | `#6B5A4E` | `#DADAEE` | `#33251B` | `#988670` |
| `--accent-text` | `#E4C368` | `#9E4A30` | `#FFE484` | `#6E240E` | `#D89A4E` |
| `--accent-stroke` | `#C8A951` | `#B9573B` | `#F0CA50` | `#8A3217` | `#C4853B` |
| `--cta-bg` | `#6C63FF` | `#B9573B` | — | `#8F3418` | `#B87333` |
| `--cta-pressed` | `#594DFF` | `#8F4229` | — | `#6E240E` | `#9E5F24` |
| `--danger` | `#E5837A` | `#A63D30` | — | — | `#D47264` |
| `--ayah-color` | `#E4C368` | `#2A1F19` | `#FFE484` | `#0D0805` | `#E2AE63` |
| `--ayah-border` | `rgba(185, 87, 59, 0.14)` | `rgba(185, 87, 59, 0.35)` | — | `rgba(138, 50, 23, 0.55)` | `rgba(216, 154, 78, 0.22)` |
| `--card-shadow` | `0 12px 32px rgba(0, 0, 0, 0.35)` | `0 12px 32px rgba(42, 31, 25, 0.08)` | — | — | `0 12px 32px rgba(0, 0, 0, 0.65)` |
| `--raised-shadow` | `0 16px 40px rgba(0, 0, 0, 0.45)` | `0 16px 40px rgba(42, 31, 25, 0.12)` | — | — | `0 16px 40px rgba(0, 0, 0, 0.75)` |
| `--app-font-size` | Not declared in CSS. Written inline by the store (12–24 px). `src/index.css:230` falls back to `16px` | | | | |

Notes:

- The dark `--ayah-border` is terracotta (`185, 87, 59` is `#B9573B`) at 14 % although terracotta is otherwise the light theme's accent. The dark design sheet uses the same value for the verse block, so the code matches the sheet.
- `--bg-glass` and `--bg-raised` are opaque. `GlassCard` still applies `backdrop-blur-xl` (`src/components/common/GlassCard.tsx:32`), which has nothing to blur through.

## 4. Tailwind v4 configuration

| Item | State |
|---|---|
| Entry | `@import "tailwindcss";` (`src/index.css:1`), compiled by `@tailwindcss/vite` (`vite.config.ts:8`) |
| `@theme` | None in `src/index.css`. The only `@theme` block in the repository is `@theme inline` in `src/landing/landing.css:91`, which belongs to the landing page |
| `@utility`, `@custom-variant`, `@source`, `@plugin`, `@config`, `@apply` | None |
| `@layer` | One: `@layer base` (`src/index.css:3-64`) holding `:root`, `.theme-light` and `body` |
| `@keyframes` | `fadeIn` (`:261`), `scaleUp` (`:266`) |
| `@media` | None |

Effects of running on defaults:

- **`dark:` is a media-query variant.** With no `@custom-variant dark`, Tailwind compiles `dark:` to `@media (prefers-color-scheme: dark)` (confirmed in the build output). The `dark` class the store puts on `<html>` does not drive it. The app uses `dark:` twice, each time repeating the base value: `bg-[#15152A]/92 dark:bg-[#15152A]/92` (`src/components/layout/BottomTabBar.tsx:59`) and `bg-[#15152A]/90 dark:bg-[#15152A]/90` (`src/components/layout/DesktopNavBar.tsx:27`). Both are no-ops.
- **`font-sans` and `font-serif` exist twice.** Tailwind's own utilities read `--font-sans` / `--font-serif`, which `:root` overrides in the base layer; `src/index.css:66-72` then defines unlayered classes of the same name with the same result.
- **Source detection covers the whole repository.** `src/index.css` does not restrict scanning (the landing stylesheet does, with `source("./")`). The built app stylesheet contains utilities that occur only under `legacy/`, for example `dark:bg-[#0B0C10]` from `legacy/src/components/PrivacyPolicyView.tsx`. Markdown is scanned as well, verified by building before and after this documentation was written: the app stylesheet grew from 87,888 to 90,348 bytes and gained utilities such as `bg-[#15152A]/95`, a class name that appears in these files but in no component. Paths excluded by `.gitignore` are skipped, which includes `public/assets/aistudio/` because that folder contains a `.gitignore` with `*`.
- **Breakpoints, spacing and the colour palette are Tailwind's defaults** (section 12).

`body` (`src/index.css:54-63`) sets `font-family: var(--font-sans)`, `direction: rtl`, `background-color: var(--bg-ground)`, `color: var(--text-primary)`, font smoothing, `overflow-x: hidden` and a 0.25 s transition on background and text colour.

## 5. Classes defined in `src/index.css`

### 5.1 Font classes

| Class | Declaration | Line | Uses in `src/**/*.tsx` outside `src/landing` |
|---|---|---|---|
| `.font-serif` | `font-family: var(--font-serif)` (Amiri) | `:66` | 52 in 21 files |
| `.font-sans` | `font-family: var(--font-sans)` (the user's chosen family) | `:70` | 4 in 4 files: `App.tsx:116`, `ShareCardModal.tsx:665`, `JournalScreen.tsx:362`, `OnboardingScreen.tsx:107` |
| `.font-ibm` | Same rule as `.font-sans`. Despite the name it follows the user's choice | `:70` | 1: `src/components/screens/HomeScreen.tsx:64` |
| `.font-quran` | `font-family: var(--font-quran)` (Amiri Quran, then Amiri) | `:74` | 7 in 6 files (section 7.4) |

### 5.2 Helper classes

| Class | What it does | Line | Uses |
|---|---|---|---|
| `.no-scrollbar` | Hides scrollbars (`::-webkit-scrollbar`, `-ms-overflow-style`, `scrollbar-width`) while keeping scrolling | `:252-258` | 6: `JourneyPathScreen.tsx:689`, `:1050`; `JournalScreen.tsx:212`; `TasbihAudioPlayer.tsx:674`; `HisnScreen.tsx:643`; `TasbihModal.tsx:76` |
| `.animate-fade-in` | Runs `fadeIn` once: 0.3 s, `cubic-bezier(0.16, 1, 0.3, 1)`, `forwards` | `:271-273` | 36 in 19 files (screen roots, modals, the tour card, the share modal) |
| `.animate-scale-up` | Runs `scaleUp` once with the same timing | `:275-277` | 1: `src/components/screens/ReflectionModal.tsx:217` |
| `.text-scale-normal`, `.text-scale-large`, `.text-scale-xlarge` | All three: `font-size: 1rem` | `:245-249` | `src/App.tsx:105-109` |
| `.ayah-text` | No base rule. Target of two overrides: `#2A1F19` in the light theme (`:162`), `#E2AE63` in night reading (`:534`), both `!important` | | 6 (section 7.4) |

### 5.3 Pixel-size overrides

Two Tailwind arbitrary-size classes are redefined, unlayered and with `!important`, so that they follow the root font size (`src/index.css:233-242`):

| Class | Tailwind's rule | Override | At a 16 px root |
|---|---|---|---|
| `.text-[10px]` | `font-size: 10px` | `font-size: 0.6875rem; line-height: 1.6` | 11 px |
| `.text-[11px]` | `font-size: 11px` | `font-size: 0.75rem; line-height: 1.65` | 12 px |

`text-[11px]` is used 105 times and `text-[10px]` 20 times. Verified at run time: an element with `text-[11px]` computes to 12 px / 19.8 px at the default size and to 15 px / 24.75 px with the root at 20 px. The class names no longer state the rendered size. Other arbitrary pixel sizes (`text-[13px]` ×5, `text-[15px]` ×4, `text-[17px]` ×3, `text-[30px]` ×3 and others) are not overridden and do not scale.

### 5.4 Font-family adjustments

| Selector | Declaration | Line |
|---|---|---|
| `html[data-font-family="noto-naskh"] body`, `html[data-font-family="amiri"] body` | `line-height: 1.9` | `:381-384` |
| `html[data-font-family="tajawal"] body` | `letter-spacing: 0.01em` | `:386-388` |

The line height only reaches text that does not set its own; Tailwind's `text-*` size utilities each set a line height. Verified at run time: with Amiri selected and a 20 px root, `body` computes to `line-height: 38px`.

### 5.5 Night-reading overlay

`html.night-reading body::after` (`src/index.css:418-430`) is a fixed, full-viewport, non-interactive layer at `z-index: 9999` with a radial gradient from `rgba(216, 142, 56, 0.055)` to `rgba(180, 100, 28, 0.085)` and `mix-blend-mode: screen`. It sits above every modal in the app (the highest app layer is `z-[60]`).

### 5.6 Every remap rule

One row per class that a mode re-colours. "Uses" counts the class in `src/**/*.tsx` outside `src/landing` plus `index.html`. `(:n)` is the line where the rule starts. All declarations are `!important` except the `opacity` and `font-weight` additions. "—" means no rule; for the high-contrast-light column the light-theme rule still applies in that case.

| Class | Uses | Nahar (`.theme-light`) | Night reading | High contrast, dark | High contrast, light |
|---|---:|---|---|---|---|
| `bg-[#15152A]` | 59 | bg #F4EDE3 (`:79`) | bg #0B0806 (`:433`) | — | bg #FAF7F2 (`:343`) |
| `bg-[#15152A]/95` | 0 | — | bg rgba(11, 8, 6, 0.94) (`:434`) | — | — |
| `bg-[#15152A]/92` | 1 | bg rgba(244, 237, 227, 0.94) (`:80`) | bg rgba(11, 8, 6, 0.94) (`:434`) | — | — |
| `bg-[#15152A]/90` | 10 | bg rgba(244, 237, 227, 0.92) (`:81`) | bg rgba(11, 8, 6, 0.94) (`:434`) | — | — |
| `bg-[#15152A]/85` | 4 | bg rgba(244, 237, 227, 0.88) (`:82`) | bg rgba(14, 11, 8, 0.88) (`:437`) | — | — |
| `bg-[#15152A]/80` | 28 | bg #EFE6D9, opaque (`:83`) | bg rgba(14, 11, 8, 0.88) (`:437`) | — | — |
| `bg-[#15152A]/70` | 0 | — | bg rgba(14, 11, 8, 0.88) (`:437`) | — | — |
| `bg-[#15152A]/60` | 1 | — | bg rgba(14, 11, 8, 0.88) (`:437`) | — | — |
| `bg-[#111126]` | 3 | bg #EDE3D4 (`:85`) | bg #080604 (`:442`) | — | — |
| `bg-[#0C0C1C]` | 2 | bg #E6DAC8 (`:86`) | bg #050403 (`:443`) | — | — |
| `bg-[#1E1E38]` | 64 | bg #FBF8F3 (`:88`) | bg #140F0B (`:445`) | — | bg #FFFFFF (`:346`) |
| `bg-[#1E1E38]/95` | 0 | — | bg #140F0B (`:445`) | — | — |
| `bg-[#1E1E38]/90` | 13 | bg #FBF8F3 (`:88`) | bg #140F0B (`:445`) | — | bg #FFFFFF (`:346`) |
| `bg-[#1E1E38]/80` | 14 | bg #FBF8F3 (`:88`) | bg #140F0B (`:445`) | — | bg #FFFFFF (`:346`) |
| `bg-[#1E1E38]/70` | 1 | — | bg #140F0B (`:445`) | — | — |
| `bg-[#25232E]` | 3 | bg #FFFFFF (`:94`) | bg #1C1510 (`:453`) | — | — |
| `bg-[#25232E]/85` | 0 | bg #FFFFFF (`:94`) | bg #1C1510 (`:453`) | — | — |
| `hover:bg-[#25232E]` | 42 | bg #EFE6D9 (`:124`) | bg #221A14 (`:458`) | — | — |
| `bg-[#1B1B33]` | 0 | bg #EFE6D9 (`:119`) | bg #0E0B08 (`:462`) | — | — |
| `bg-[#2E2E4A]` | 10 | bg #DCCFBE (`:128`) | bg #2B2017 (`:466`) | — | — |
| `bg-white/5` | 6 | bg #FBF8F3 (`:110`) | — | — | — |
| `bg-white/10` | 0 | bg #FBF8F3 (`:110`) | — | — | — |
| `border-white/10` | 4 | border #DCCFBE (`:115`) | — | — | — |
| `bg-black/20` | 5 | bg #EFE6D9 (`:119`) | — | — | — |
| `from-[#1E1E38]` | 0 | gradient from #FFFFFF, to transparent white (`:99`) | gradient from #140F0B, to transparent (`:470`) | — | — |
| `to-[#25232E]` | 0 | gradient to #EFE6D9 (`:105`) | gradient to #0B0806 (`:476`) | — | — |
| `to-[#17172E]` | 0 | gradient to #EFE6D9 (`:105`) | gradient to #0B0806 (`:476`) | — | — |
| `to-[#15152A]` | 0 | — | gradient to #0B0806 (`:476`) | — | — |
| `text-[#EDEDF5]` | 171 | text #2A1F19 (`:133`) | text #E8DAC8 (`:483`) | text #FFFFFF (`:300`) | text #0D0805, weight 600 (`:351`) |
| `hover:text-[#EDEDF5]` | 50 | text #2A1F19 (`:134`) | — | — | — |
| `text-white` | 53 | — | text #E8DAC8 (`:483`) | — | — |
| `hover:text-white` | 32 | text #2A1F19 (`:134`) | — | — | — |
| `group-hover:text-white` (under `.group:hover`) | 2 | text #2A1F19 (`:134`) | — | — | — |
| `text-[#C7C4D8]` | 44 | text #4A3B32 (`:140`) | text #C6B49D (`:488`) | text #F2F2FC (`:303`) | text #1C130D, weight 500 (`:355`) |
| `text-[#AEAECB]` | 223 | text #6B5A4E (`:141`) | text #988670 (`:492`) | text #DADAEE (`:306`) | text #33251B, weight 500 (`:359`) |
| `text-[#AEAECB]/80` | 3 | text rgba(107, 90, 78, 0.85) (`:142`) | text #988670 (`:492`) | text #DADAEE (`:306`) | text #33251B, weight 500 (`:359`) |
| `text-[#AEAECB]/70` | 2 | — | text #988670 (`:492`) | text #DADAEE (`:306`) | text #33251B, weight 500 (`:359`) |
| `text-[#AEAECB]/65` | 2 | — | — | text #DADAEE (`:306`) | text #33251B, weight 500 (`:359`) |
| `text-[#AEAECB]/60` | 6 | text rgba(107, 90, 78, 0.75) (`:143`) | text #988670 (`:492`) | text #DADAEE (`:306`) | text #33251B, weight 500 (`:359`) |
| `text-[#AEAECB]/50` | 4 | text rgba(107, 90, 78, 0.65) (`:144`) | text #988670 (`:492`) | — | — |
| `placeholder-[#AEAECB]/40` | 7 | placeholder #6B5A4E, opacity 0.75 (`:145`) | — | — | — |
| `placeholder-[#AEAECB]/50` | 5 | placeholder #6B5A4E, opacity 0.75 (`:145`) | — | — | — |
| `text-[#E4C368]` | 104 | text #9E4A30 (`:152`) | text #D89A4E (`:529`) | text #FFE484 (`:313`) | text #6E240E, weight 700 (`:367`) |
| `text-[#C8A951]` | 25 | text #9E4A30 (`:152`) | text #D89A4E (`:529`) | text #FFE484 (`:313`) | text #6E240E, weight 700 (`:367`) |
| `hover:text-[#E4C368]` | 5 | text #B9573B (`:157`) | — | — | — |
| `ayah-text` | 6 | text #2A1F19 (`:162`) | text #E2AE63 (`:534`) | — | — |
| `bg-[#6C63FF]` | 61 | bg #B9573B, text #FFFFFF (`:167`) | bg #B87333, text #FAF0E4 (`:501`) | — | — |
| `hover:bg-[#594DFF]` | 23 | bg #8F4229 (`:171`) | bg #9E5F24 (`:506`) | — | — |
| `text-[#6C63FF]` | 28 | text #9E4A30 (`:174`) | text #D89A4E (`:517`) | — | text #6E240E, weight 700 (`:367`) |
| `border-[#6C63FF]` | 20 | border #B9573B (`:177`) | border rgba(216, 154, 78, 0.45) (`:521`) | — | — |
| `border-[#6C63FF]/30` | 2 | border rgba(185, 87, 59, 0.4) (`:180`) | border rgba(216, 154, 78, 0.45) (`:521`) | — | — |
| `border-[#6C63FF]/40` | 11 | border rgba(185, 87, 59, 0.4) (`:180`) | border rgba(216, 154, 78, 0.45) (`:521`) | — | — |
| `border-[#6C63FF]/50` | 6 | border rgba(185, 87, 59, 0.4) (`:180`) | border rgba(216, 154, 78, 0.45) (`:521`) | — | — |
| `bg-[#6C63FF]/10` | 0 | — | bg rgba(184, 115, 51, 0.16) (`:510`) | — | — |
| `bg-[#6C63FF]/15` | 8 | bg rgba(185, 87, 59, 0.14) (`:185`) | bg rgba(184, 115, 51, 0.16) (`:510`) | — | — |
| `bg-[#6C63FF]/20` | 13 | bg rgba(185, 87, 59, 0.14) (`:185`) | bg rgba(184, 115, 51, 0.16) (`:510`) | — | — |
| `bg-[#6C63FF]/25` | 2 | — | bg rgba(184, 115, 51, 0.16) (`:510`) | — | — |
| `bg-[#E4C368]` | 12 | bg #B9573B, text #FFFFFF (`:191`) | — | — | — |
| `bg-[#C8A951]` | 2 | bg #B9573B, text #FFFFFF (`:191`) | — | — | — |
| `bg-[#C8A951]/5` | 1 | bg rgba(185, 87, 59, 0.08) (`:203`) | — | — | — |
| `bg-[#C8A951]/10` | 3 | bg rgba(185, 87, 59, 0.14) (`:196`) | — | — | — |
| `bg-[#C8A951]/15` | 10 | bg rgba(185, 87, 59, 0.14) (`:196`) | — | — | — |
| `bg-[#E4C368]/10` | 1 | bg rgba(185, 87, 59, 0.14) (`:196`) | — | — | — |
| `bg-[#E4C368]/15` | 5 | bg rgba(185, 87, 59, 0.14) (`:196`) | — | — | — |
| `bg-[#E4C368]/20` | 1 | bg rgba(185, 87, 59, 0.14) (`:196`) | — | — | — |
| `border-[#2E2E4A]` | 167 | border #DCCFBE (`:208`) | border #2B2017 (`:539`) | border #525282 (`:317`) | border #8C7762 (`:373`) |
| `border-[#2E2E4A]/90` | 1 | — | border #2B2017 (`:539`) | — | — |
| `border-[#2E2E4A]/80` | 15 | border #DCCFBE (`:208`) | border #2B2017 (`:539`) | border #525282 (`:317`) | border #8C7762 (`:373`) |
| `border-[#2E2E4A]/70` | 7 | — | border #2B2017 (`:539`) | border #525282 (`:317`) | border #8C7762 (`:373`) |
| `border-[#2E2E4A]/60` | 5 | — | border #2B2017 (`:539`) | — | border #8C7762 (`:373`) |
| `border-[#2E2E4A]/50` | 5 | border #DCCFBE (`:208`) | border #2B2017 (`:539`) | — | — |
| `border-[#2E2E4A]/40` | 2 | border #DCCFBE (`:208`) | — | — | — |
| `border-[#C8A951]` | 6 | border #B9573B (`:214`) | — | — | — |
| `border-[#E4C368]` | 2 | border #B9573B (`:214`) | — | — | — |
| `border-[#C8A951]/30` | 13 | border rgba(185, 87, 59, 0.4) (`:218`) | — | — | — |
| `border-[#C8A951]/40` | 7 | border rgba(185, 87, 59, 0.4) (`:218`) | — | — | — |
| `border-[#C8A951]/50` | 2 | border rgba(185, 87, 59, 0.4) (`:218`) | — | — | — |
| `border-[#E4C368]/30` | 2 | border rgba(185, 87, 59, 0.4) (`:218`) | — | — | — |
| `focus:border-[#C8A951]` | 10 | border #B9573B (`:224`) | — | — | — |

Rules whose class no component uses (dead rules): `bg-[#1B1B33]`, `bg-[#25232E]/85`, `bg-white/10`, `from-[#1E1E38]`, `to-[#25232E]`, `to-[#17172E]`, `to-[#15152A]`, `bg-[#15152A]/95`, `bg-[#15152A]/70`, `bg-[#1E1E38]/95`, `bg-[#6C63FF]/10`.

## 6. Keyframes and animation

| Name | Definition | Line |
|---|---|---|
| `fadeIn` | From `opacity: 0; translateY(6px)` to `opacity: 1; translateY(0)` | `src/index.css:261-264` |
| `scaleUp` | From `opacity: 0; scale(0.92)` to `opacity: 1; scale(1)` | `src/index.css:266-269` |

Other animation sources in the app:

- Tailwind built-ins: `animate-pulse` and `animate-spin`, one use each.
- `motion/react` is imported by five files: `CompletionParticles.tsx`, `JourneyPathScreen.tsx`, `HisnScreen.tsx`, `OnboardingScreen.tsx`, `ReflectionModal.tsx`.
- Tailwind `transition-*` / `duration-*` utilities on individual elements, and the 0.25 s colour transition on `body`.

The design sheets specify micro 150 ms, standard 250 ms and sentence reveal 400 ms. `MOTION` in `tokens.ts` holds 0.2 / 0.35 / 0.5 s. The CSS animations use 0.3 s. None of the three sets matches another, and nothing imports `MOTION`.

## 7. Fonts

### 7.1 Loading

One stylesheet request to Google Fonts with `display=swap`, preceded by `preconnect` hints to `fonts.googleapis.com` and `fonts.gstatic.com` (`index.html:12-14`):

| Family | Weights and styles requested |
|---|---|
| Amiri Quran | Regular |
| Amiri | 400, 700, 400 italic, 700 italic |
| IBM Plex Sans Arabic | 300, 400, 500, 600, 700 |
| Noto Naskh Arabic | 400, 500, 600, 700 |
| Tajawal | 400, 500, 700 |

No font is self-hosted. Tajawal has no 600, so `font-semibold` text is rendered with the nearest available weight when Tajawal is selected.

### 7.2 Stacks

| Role | Variable | Stack |
|---|---|---|
| Headings, hadith, duʿāʾ, the brand mark | `--font-serif` | `'Amiri', serif` |
| Qur'an verses | `--font-quran` | `'Amiri Quran', 'Amiri', serif` |
| Interface text | `--font-sans` | One of the four below, default `ibm` |

The four user-selectable stacks, written to `--font-sans` by the store (`src/lib/store.tsx:362-367`):

| Id | Stack |
|---|---|
| `ibm` | `'IBM Plex Sans Arabic', sans-serif` |
| `noto-naskh` | `'Noto Naskh Arabic', 'Amiri', serif` |
| `amiri` | `'Amiri', serif` |
| `tajawal` | `'Tajawal', 'IBM Plex Sans Arabic', sans-serif` |

The choice changes interface text only. `.font-serif` and `.font-quran` are not affected. Verified at run time: with `amiri` selected `body` computes to `font-family: Amiri, serif`.

### 7.3 Where each family is used

| Family | Applied through | Used for |
|---|---|---|
| User's choice (`--font-sans`) | `body`, Tailwind preflight, `.font-sans`, `.font-ibm` | All text without another font class |
| Amiri | `.font-serif` (52 uses) | Screen and card titles, hadith and duʿāʾ text, the «الحمد» wordmark (`BrandMark.tsx:26`), the «ح» buttons (`TopBar.tsx:27`, `DesktopNavBar.tsx:77`), tour and share-modal headings |
| Amiri Quran | `.font-quran` | Verses (7.4) |
| IBM Plex Sans Arabic, Amiri, Amiri Quran by name | Canvas `ctx.font` strings in `ShareCardModal.tsx:205-297` | The exported share image. It ignores the user's font choice |

### 7.4 Qur'an text

Every place a verse is rendered:

| Place | Font | Brackets | Colour |
|---|---|---|---|
| Today's blessing, `HomeScreen.tsx:229` | `font-quran ayah-text` | ﴿ ﴾ | inline `var(--ayah-color)` |
| Journey station popup, `JourneyPathScreen.tsx:1190` | `font-quran ayah-text` | ﴿ ﴾ | inline `var(--ayah-color)` |
| Journey station flow, `JourneyStationFlow.tsx:387` | `font-quran ayah-text` | ﴿ ﴾ | `text-[#E4C368]` |
| Hisn items flagged `isQuran`, `HisnScreen.tsx:802` | `font-quran ayah-text` | as stored | inline `var(--ayah-color)` |
| Settings preview, `SettingsScreen.tsx:485` | `font-quran ayah-text` | as written | inline `var(--ayah-color)` |
| Share-card preview, `ShareCardModal.tsx:599` | `font-quran` | ﴿ ﴾ | inline hex per card theme |
| Share-card image, `ShareCardModal.tsx:227` | `44px "Amiri Quran", "Amiri", serif` | ﴿ ﴾ with spaces | `#E4C368`, or `#2A1F19` on the light card |
| Daily inspiration of type verse, `HomeScreen.tsx:137-138` | Intended: `font-quran ayah-text` and ﴿ ﴾ | | |

The last row does not work as written. The condition is `inspiration.type === 'ayah'`, but the type and the data use `'quran'` (`src/types.ts:89`, `src/data/inspirations.ts:2`). The comparison is never true, so verse inspirations render in Amiri (`font-serif`) inside «» quotation marks, like a hadith. `tsc` does not report it because React's type declarations are not installed (`@types/react` is absent from `package.json`), which leaves component props untyped.

In the light theme a verse is ink `#2A1F19` (as in a printed muṣḥaf, per the sheet); in the dark theme it is gold `#E4C368`; in night reading `#E2AE63`. Two routes produce this: `--ayah-color`, and the `.ayah-text` overrides in 5.2.

### 7.5 Letter-spacing on Arabic

`tracking-tight` is applied to the wordmark (`BrandMark.tsx:26`; computes to −0.5 px at 20 px), `tracking-wide` to tab labels (`BottomTabBar.tsx:90`), and Tajawal gets `letter-spacing: 0.01em` on `body`. In all, `src/components` uses `tracking-tight` 4 times, `tracking-wide` 3 times and `tracking-wider` 8 times. Arabic is a joining script; the visual effect of letter-spacing on it was not checked in a browser with the real fonts.

## 8. Text size and text scale

| Mechanism | Where | Effect |
|---|---|---|
| Root font size | The store writes `--app-font-size` and inline `font-size` on `<html>` (`src/lib/store.tsx:377-378`); `src/index.css:229-231` reads the variable | Everything sized in `rem` scales: Tailwind text sizes, spacing, widths, heights. Range 12–24 px in 0.5 px steps (`src/lib/store.tsx:453`), default 16 |
| `text-size-*` on `<html>` | `src/lib/store.tsx:381-383`. `xlarge` at 20 px and above, `large` at 18 px and above, otherwise `normal` | None. Nothing reads the class |
| `text-scale-*` on the app root | `src/App.tsx:105-109` | None. All three classes are `font-size: 1rem` (`src/index.css:245-249`) |
| `text-[10px]`, `text-[11px]` overrides | `src/index.css:233-242` | Makes the two most common small labels follow the root size |

What does not scale: other `text-[Npx]` classes, `BrandMark`'s pixel `size`, `ThreadProgress`'s pixel dimensions, lucide icon sizes, Recharts tick font sizes (10 and 11 px), and the share-image canvas. Media-query breakpoints do not move either, because `rem` in a media query refers to the browser's initial font size.

Verified at run time with the size set to 20: `<html>` gets `--app-font-size: 20px; font-size: 20px` and `text-size-xlarge`; the root `<div>` computes to 20 px.

The design sheets ask for something different: three steps (×1.0, ×1.125, ×1.25) as «سلّم حقيقي يشمل كل المقاسات، لا تكبير جذر فحسب» ("a real scale covering all sizes, not just root enlargement"). The implementation is root enlargement over a continuous 0.75×–1.5× range.

`index.html:5` sets `maximum-scale=1.0, user-scalable=no`, which asks browsers to disable pinch zoom.

## 9. High-contrast mode

Toggled by the `high-contrast` class on `<html>`. Section comment: «وضع التباين العالي والإضاءة الساطعة» (`src/index.css:280`).

- **Dark** (`html.high-contrast:not(.theme-light)`, `:284-321`): overrides 13 variables (backgrounds darker, text and gold brighter, hairline `#525282`), and remaps text classes and `border-[#2E2E4A]` (plain, `/80`, `/70`). Background hex classes are not remapped, so a card built with `bg-[#1E1E38]` stays `#1E1E38` while a `GlassCard` (variable-driven) becomes `#14142B`. Verified at run time: the today-card renders `rgb(20, 20, 43)` with a `rgb(240, 202, 80)` accent border.
- **Light** (`html.theme-light.high-contrast`, `:324-378`): overrides 16 variables and remaps `bg-[#15152A]`, the `bg-[#1E1E38]` family, text classes (adding `font-weight` 500–700) and `border-[#2E2E4A]` (plain, `/80`, `/70`, `/60`). The variable overrides do not reach the app (2.4).
- `--danger` and the two shadows are not overridden in either variant. `--cta-bg` and `--cta-pressed` are not overridden in the dark variant.

## 10. Night-reading mode

Toggled by the `night-reading` class on `<html>`; the store only allows it with the dark theme. Section comment: «وضع القراءة الليلية — تقليل الضوء الأزرق قبل النوم» (`src/index.css:391`).

- Overrides all 19 colour and shadow variables with warm near-black backgrounds, parchment text and amber accents (`:395-415`).
- Adds the amber `body::after` overlay (5.5).
- Remaps backgrounds, gradients, text (including `text-white`), violet fills, borders and text to amber, gold text to `#D89A4E`, and hairlines to `#2B2017` (`:433-546`).
- Not remapped, so still gold or violet in this mode: gold fills and borders (`bg-[#E4C368]`, `bg-[#C8A951]/15`, `border-[#C8A951]/30` ...), `hover:text-[#EDEDF5]` (50 uses, cool white on hover), `shadow-[#6C63FF]/25` (10 uses), `border-[#6C63FF]/45` and `/35`, `focus:border-[#6C63FF]`, and every colour passed as an SVG or inline attribute (for example the radar chart's `#6C63FF` fill, `ReflectionCategoryCharts.tsx:486`). The comment at `:500` says the mode eliminates blue and violet light; these cases are exceptions to it.

## 11. Reduced motion

A repository-wide search for `prefers-reduced-motion`, `useReducedMotion` and `MotionConfig` finds one match, in `src/landing/landing.css:118`. In the app itself:

- `src/index.css` has no `@media` rule at all.
- No component reads the media query, and no `motion/react` call site is wrapped in a reduced-motion setting.

The design sheets specify reduced-motion behaviour (reflection atmosphere change in 800 ms instead of 2,500 ms; «لا نبض ولا تنفّس إطلاقًا», "no pulse and no breathing at all"), and `README.md:45` lists "reduced-motion support". Neither is implemented in the app.

## 12. Breakpoints

Tailwind's defaults apply: `sm` 40rem (640 px), `md` 48rem (768 px), `lg` 64rem (1024 px). The build output contains `min-width: 40rem`, `48rem`, `64rem`, `80rem` and `96rem` queries.

| Prefix | Uses in `src/components` and `src/App.tsx` | Typical use |
|---|---|---|
| `sm:` | 204 in 21 files | Larger padding and type on wider phones and up |
| `md:` | 19 in 12 files | The navigation switch; `md:max-w-2xl` on screen containers |
| `lg:` | 8 in 8 files | `lg:max-w-3xl` on the eight screen containers |
| `xl:`, `2xl:` | 0 | |

- The shell switches at `md`: `DesktopNavBar` is inside `hidden md:block`, `TopBar` and `BottomTabBar` inside `block md:hidden` (`src/App.tsx:120`, `:129`, `:201`). The comments beside them say "≥900px" and "<900px"; the actual threshold is 768 px. Verified at run time: at a 760 px viewport the mobile bars show, at 768 px the desktop bar shows.
- Screen containers share the pattern `max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 pb-28` (for example `HomeScreen.tsx:60`).
- No script reads the viewport width (`innerWidth`, `matchMedia` and `ResizeObserver` do not occur in the app).

## 13. `src/constants/tokens.ts`

The file exports three constants. A search of `src/` and `landing/` finds no import of the file or of any of the three names. It is dead code. `README.md:53` and `:78` describe "design tokens" as part of the styling layer.

**`THEME_TOKENS`** (`:1-36`), two palettes with the same 15 keys:

| Key | `dark` | Matches `src/index.css` dark? | `light` | Matches `src/index.css` light? |
|---|---|---|---|---|
| `ground` | `#15152A` | Yes | `#F6F9FA` | No (`#F4EDE3`) |
| `groundDeep` | `#111126` | Yes | `#EBF3F8` | No (`#EDE3D4`) |
| `groundDeepen` | `#0C0C1C` | Yes | `#E2ECF3` | No (`#E6DAC8`) |
| `glassCard` | `rgba(30, 30, 56, 0.75)` | Same RGB as `#1E1E38`, but 75 % alpha; CSS is opaque | `rgba(255, 255, 255, 0.82)` | No (`#FBF8F3`) |
| `glassRaised` | `rgba(37, 35, 46, 0.88)` | Same RGB as `#25232E`, but 88 % alpha; CSS is opaque | `rgba(255, 255, 255, 0.94)` | Near (`#FFFFFF`) |
| `hairline` | `#2E2E4A` | Yes | `rgba(215, 225, 235, 0.85)` | No (`#DCCFBE`) |
| `text` | `#EDEDF5` | Yes | `#14213D` | No (`#2A1F19`) |
| `textBody` | `#C7C4D8` | Yes | `#334155` | No (`#4A3B32`) |
| `textMuted` | `#AEAECB` | Yes | `#6B7A90` | No (`#6B5A4E`) |
| `goldBright` | `#E4C368` | Yes | `#9A7A1E` | No (`#9E4A30`) |
| `goldDeep` | `#C8A951` | Yes | `#8A6814` | No (`#B9573B`) |
| `violet` | `#6C63FF` | Yes | `#544EE6` | No (`#B9573B`) |
| `violetPressed` | `#594DFF` | Yes | `#433DCC` | No (`#8F4229`) |
| `danger` | `#EF4444` | No (`#E5837A`) | `#DC2626` | No (`#A63D30`) |
| `border` | `#2E2E4A` | Yes | `rgba(215, 225, 235, 0.9)` | No (`#DCCFBE`) |

The `light` object is a cool blue-grey palette with a darker gold and violet. It predates the cream-and-terracotta Nahar palette and was not updated. There is no key for the sunken surface, the verse colours or the shadows.

**`RADIUS`** (`:38-42`): `card: '24px'`, `button: '16px'`, `pill: '9999px'`. These agree with the design sheets (24 cards, 16 buttons, 999 pills). The sheets also give 12 for fields, which has no key.

**`MOTION`** (`:44-50`): `durationShort: 0.2`, `durationMedium: 0.35`, `durationLong: 0.5`, `dwellGround: 10`, `dwellDeepen: 15`. No units are stated; the first three read as seconds.

## 14. Design reference sheets

Two static HTML files in `public/assets/aistudio/`:

| File | Title | Lines | Size |
|---|---|---:|---:|
| `design-sheet-layl-dark_f2b4cff4.html` | «الحمد — نظام التصميم «ليل»» | 342 | 43,918 B |
| `design-sheet-nahar-light_5cbc4393.html` | «الحمد — نظام التصميم «نهار»» | 338 | 43,730 B |

Common facts:

- Self-contained pages: inline styles only, no script, `lang="ar" dir="rtl"`, max width 1128 px. They load Amiri (400, 700), Amiri Quran and IBM Plex Sans Arabic (300–700) from Google Fonts. Noto Naskh Arabic and Tajawal do not appear in the sheets.
- No file in `src/`, `index.html` or `landing/` links to them. Because they are under `public/`, `vite build` copies them to `assets/aistudio/` in the output together with the ten PNGs in the folder (740 KB in total), so they are deployed with the app.
- The Layl intro describes the sheet as step one, measured from six reference screens and corrected where contrast failed, for approval before the screens are designed: «الخطوة الأولى: الرموز والسطوح والخطوط والمكوّنات، مقاسةً من الشاشات المرجعية الست ومصحّحةً حيث أخفق التباين. للاعتماد قبل تصميم الشاشات.»
- Header chips: «عربي بالكامل · RTL», «داكن افتراضيًا» (Layl) or «فاتح — من لوحة الأيقونة» (Nahar), «لا سلاسل، لا ضغط».

The two sheets have the same seven sections plus a closing box. The Nahar sheet swaps the first two.

### 14.1 Section 1: colours

Layl swatches (`design-sheet-layl-dark…html:40-53`). Contrast figures are quoted from the sheet (on ground / on glass). Five were recomputed with the WCAG formula and agree: muted on ground 8.29, white on violet 4.32, light muted on cream 5.65, `#9E4A30` on cream 5.20, `#B9573B` on cream 4.03.

| Swatch | Value | Sheet note | Contrast stated |
|---|---|---|---|
| الأرضية (ground) | `#15152A` | | |
| أرضية عميقة (deep ground) | `#111126` | for onboarding and reflection | |
| الأعمق (deepest) | `#0C0C1C` | the "deepen" step only | |
| بطاقة زجاجية (glass card) | `#1E1E38` | white 6 % + blur 20 | |
| زجاج مرتفع (raised glass) | `#25232E` | sheets and dialogs | |
| الخيط الفاصل (hairline) | `#2E2E4A` | 1 px borders | |
| نص أساسي (primary text) | `#EDEDF5` | | 15.4 / 13.9 |
| نص ثانوي (secondary text) | `#C7C4D8` | | 10.5 / 9.5 |
| نص خافت (muted text) | `#AEAECB` | passes as is | 8.3 / 7.5 |
| ذهبي ساطع (bright gold) | `#E4C368` | verses, active tab | 10.5 / 9.5 |
| ذهبي عميق (deep gold) | `#C8A951` | badges, calendar dots | 7.9 |
| بنفسجي (violet) | `#6C63FF` | buttons, today ring | white on it 4.3 (large text only) |
| بنفسجي مضغوط (pressed violet) | `#594DFF` | | 5.3 |
| خطر (danger) | `#E5837A` | delete only | 6.1 on glass |

Rule stated under the swatches: violet is never running text, only button and ring fill, with white button text at weight 600 and size 18 or more; bright gold is the only highlight text colour.

Nahar swatches (`design-sheet-nahar-light…html:40-52`): ground `#F4EDE3` («كريمي الأيقونة», the icon's cream), deep `#EDE3D4`, deepest `#E6DAC8`, glass `#FBF8F3` (white 60 % + blur 24), raised `#FFFFFF`, sunken `#EFE6D9`, hairline `#DCCFBE`, ink `#2A1F19` (13.8), secondary `#4A3B32` (9.2), muted `#6B5A4E` (5.6), ink terracotta `#9E4A30` (5.2; highlight text and active tab), pressed terracotta `#8F4229` (white on it 7.0), danger `#A63D30` (5.4). Rules stated: terracotta takes the role of both gold and violet; `#9E4A30` is the only highlight text colour; the verse returns to ink «كما في المصحف»; `#B9573B` must not be used for text below 24 px (4.0 on ground).

Section 2 of each sheet is a preview card of the other theme with a short legend. The Nahar sheet states the principle (`:78`): «الدور واحد والقيمة تتبدّل» ("one role, changing value") — gold ↔ ink terracotta for highlight text, deep gold ↔ terracotta for thread and badges, violet ↔ terracotta for buttons.

### 14.2 Section 3: type

Heading note: «لا خط لاتيني في الواجهة» ("no Latin typeface in the interface").

| Role | Family and weight | Size / line height |
|---|---|---|
| Blessing title | Amiri 700 | 34 / 1.5 |
| Screen title | Amiri 700 | 30 / 1.5 |
| Verse | Amiri Quran | 24 / 2.1 |
| Hadith and duʿāʾ | Amiri | 20 / 1.9 |
| Body | IBM Plex Sans Arabic 400 | 16 / 1.8 |
| Secondary text | (Plex) | 14 / 1.8 |
| Label and tab | (Plex) | 12 / 1.6 |

Also stated: Amiri Quran is for verses only, inside ﴿ ﴾, gold in Layl and ink in Nahar; user sizes normal ×1.0, large ×1.125, larger ×1.25; digits are Arabic-Indic through a single formatter.

### 14.3 Section 4: surfaces and ornament

- Glass card: white 6 % over the ground, blur 20, 1 px hairline, radius 24, soft shadow `0 12px 32px rgba(0,0,0,0.35)`.
- Raised glass: sheets, dialogs and the tab bar; blur 24; shadow `0 16px 40px rgba(0,0,0,0.45)`.
- Sunken glass `#1B1B33`: the verse block and fields; no shadow.
- Star lattice: an eight-point star made of two squares at 45°, one 140 px tile, at 3–5 % opacity, «للتهيئة والاستشعار فقط» (onboarding and reflection only).
- "Light cone" behind today's blessing: optional, at most 6 %. In Nahar it is replaced by two soft blobs of `#E6DAC8` at 60 %.

### 14.4 Section 5: mark and thread

- The wordmark «الحمد» in Amiri 700 with a thread under it. At font size S: thread thickness 0.02·S, dot diameter 0.075·S at the right end, gap 0.20·S. Below about 120 px width the word stands alone, which is why the top bar shows it without a thread. The icon is «ح» alone.
- Thread progress replaces dot indicators in onboarding and reflection: a 7 px dot at the right, a 2 px track, the fill growing leftward from the dot. Examples for 1 of 5, 3 of 5, 5 of 5.

### 14.5 Section 6: components and states

| Component | Specification |
|---|---|
| Buttons | Height 56, radius 16, text 18 or larger at weight 600. States: primary, pressed, disabled (`#2E2E4A` fill, muted text), quiet (outlined). A gold text button for «أعد الاستشعار» |
| Badges | Outlined, tinted (`rgba(200,169,81,0.18)`), neutral (raised fill) |
| Fields | Sunken fill, hairline border, radius 12 |
| Reminder row and switches | Violet track when on; hairline track with a muted thumb when off |
| Navigation | Top bar: «ح» button, wordmark, a calendar icon. Bottom bar with **four** tabs: «الرئيسية», «سجل الحمد», «المداومة», «الإعدادات». Active tab gold with a 22×3 px bar above. Notes: «ح» opens About (no accounts); the calendar icon opens Consistency; the tasbih is reached from a card on Home, not from the bar; icons are Lucide at stroke 1.5 |
| Sacred text blocks | Shown as they are, with no editing or truncation: «تُعرض كما هي، بلا تحرير أو اقتطاع». The scholar's name is hidden when the attribution starts with «مستفاد / مأثور / إشارة» |
| Numbered question card | From the "new blessing" reference; each question optional; three answers stored as separate fields |
| Calendar cells | Normal, completed (gold dot), today (violet ring). «لا عدّادات تتابُع، لا شارات، لا تمييز لِما فات» (no streak counters, no badges, no marking of missed days) |
| Dialog, toast, empty state | Consent dialog «تحسين مسار التطبيق», toast «حُفظ في سجل الحمد», empty journal «سجلّك ما زال فارغًا... ابدأ بنعمة اليوم» |
| Share cards | 1080×1350 and 1080×1920, the mark at the bottom left |

### 14.6 Section 7: metrics, motion, haptics

- Grid 4 pt; page margin 20; card padding 20–24; card gap 12; section gap 28. Radii: 24 cards, 16 buttons, 12 fields, 999 badges. Touch targets at least 44. Icons 22 (24 in the bar) at stroke 1.5.
- Motion: micro 150 ms, standard 250 ms, sentence reveal 400 ms; reflection atmosphere change 2,500 ms (800 ms with reduced motion); the «الحمد» glow pulses once; with reduced motion no pulse and no breathing.
- Haptics: light for step advance, dhikr tap and switch; heavy every 33 tasbih counts; success on completing a reflection; «لا لمسة كل ساعة — أُلغيت» (the hourly haptic was cancelled).

The closing box lists what was improved over the reference screens (tab labels on every screen, verses in ﴿ ﴾ rather than «», thread progress instead of dots, «ح» opens About, the button phrase «استشعر النعمة», the light cone capped at 6 %, the three-question form taken as is) and two decisions left open: whether «حديث اليوم» sits above or below today's blessing, and whether the tasbih keeps a session counter only or a lasting total.

### 14.7 Inconsistencies inside the sheets

- The Nahar sheet's glass-card caption in section 4 still carries the dark values («أبيض ٦٪ فوق الأرضية · ضباب ٢٠», `:117`) while its own swatch says white 60 % and blur 24 (`:43`).
- The Nahar sheet keeps dark-theme wording next to terracotta samples: «زر نصّي ذهبي» (`:180`), «النشط ذهبي بشرطة علوية» (`:205`), «مُتمّ (نقطة ذهبية) · اليوم (حلقة بنفسجية)» (`:257`).
- The Nahar closing box calls `#6B5A4E` the dark muted colour and says the light muted colour was raised to `#566478` (`:331`). `#566478` appears nowhere else in the repository; it is a cool grey in the family of the stale `tokens.ts` light palette. The Layl sheet states the same sentence with the current values (`:335`).
- The Nahar preview inside the Layl sheet uses a card shadow of `0 8px 24px` (`:62`); the Nahar sheet and the CSS use `0 12px 32px`.

### 14.8 Sheet versus code

| Topic | Sheet | Code |
|---|---|---|
| Palette values | As in 14.1 | `src/index.css` matches both sheets for every listed colour, both shadows and the verse border |
| Bottom navigation | Four tabs, settings in the bar, tasbih not in the bar | Five tabs: home, journey, journal, consistency, tasbih. Settings is an icon in the top bar (`BottomTabBar.tsx:49-55`, `TopBar.tsx:40`) |
| Top bar left item | Calendar icon opening Consistency | Settings icon (`TopBar.tsx:51`) |
| Icon stroke | 1.5 | 1.6–2.2 (`TopBar.tsx:51`, `BottomTabBar.tsx:83`, `DesktopNavBar.tsx:51`) |
| Touch targets | At least 44 | Top-bar buttons are `w-9 h-9`, 36 px at the default size (`TopBar.tsx:27`, `:43`) |
| Thread thickness | 0.02·S | 0.025·S (`BrandMark.tsx:18`; the comment above it says 0.02) |
| Thread-progress dot | At the right, where the fill starts | Rendered at the left end (see [06](06-layout-and-shared-components.md), ThreadProgress) |
| Share cards | Mark at the bottom left | Centred sign-off «الحمد · لتأمل النعم» with a centred line (`ShareCardModal.tsx:291-308`) |
| Sacred text | No truncation | The share image wraps the verse to at most four lines and ends an overflow with `...` (`ShareCardModal.tsx:229`) |
| Text sizes | Three steps, a real scale | Root font size, 12–24 px (section 8) |
| Violet text | Never running text; white on violet only at 18 px and above | White 11–12 px labels on `#6C63FF` in segmented controls (for example `ShareCardModal.tsx:460`, `ReflectionCategoryCharts.tsx:256`); `text-[#6C63FF]` is used 28 times |
| Reduced motion | Specified | Not implemented (section 11) |
| Glass | Translucent with backdrop blur | Opaque fills with a blur that has no effect |
| Star lattice | Onboarding and reflection only | Used in onboarding, the reflection modal and the journey station flow |

## 15. App icon palette image

`public/assets/aistudio/app-icon-palette_a8ddd79f.png`, 2094×1348 px, RGBA, 229,735 bytes. It is a specification sheet for the app icon, in English, on a white page.

- **Left tile (light icon).** A cream square containing the «الحمد» wordmark in a heavy calligraphic hand, in dark brown. Under it runs a terracotta thread with a round dot at its right end. A thin dashed terracotta circle marks the safe area. Swatches below: `#F4EDE3`, `#2A1F19`, `#B9573B`.
- **Right tile (dark icon).** The same composition inverted: dark brown square, cream wordmark, a lighter terracotta thread and dot. Swatches: `#2A1F19`, `#F4EDE3`, `#D4704F`.
- **Text block.** "Wordmark and thread are one measured unit: the thread spans the wordmark's real ink width, the dot's right edge sits flush with the alef, and the whole ink box is centred at (512, 512)."
- **Measurements.** thread 0.02 · S = 9.6 px; dot 0.075 · S = 36 px; gap 0.20 · S = 96 px below baseline; ink width 584.6 px (measured); ink box 584.6 × 475.4, ⌀ 753.5; safe circle ⌀ 820 px, dashed above. These imply S = 480 px on a 1024 px canvas.

Relation to the code: the three light swatches are the Nahar ground, ink and terracotta in `src/index.css`. `#D4704F` (the dark icon's thread) is not used anywhere in `src/`. The app's dark theme is indigo, not the icon's dark brown. The proportions 0.02 / 0.075 / 0.20 are the ones quoted by the sheets and by the comment in `BrandMark.tsx:14-17`. The repository contains no icon file, favicon or web manifest generated from this sheet; `index.html` declares none.

The other nine PNGs in the folder (eight `Screenshot_…png` and `image_1c2c59f3.png`) are reference captures; they are catalogued in [history/commit-by-commit.md](../history/commit-by-commit.md) under "Design reference images".

## 16. Token mismatches and hard-coded colour hot-spots

### 16.1 Do the sources agree?

| Colour role | `src/index.css` | `tokens.ts` | `index.html` | `src/App.tsx` | Sheets | Icon PNG |
|---|---|---|---|---|---|---|
| Dark ground | `#15152A` | `#15152A` | `bg-[#15152A]` (`:16`) | `bg-[#15152A]` (`:80`, `:113`) | `#15152A` | — (icon dark is `#2A1F19`) |
| Dark text | `#EDEDF5` | `#EDEDF5` | `text-[#EDEDF5]` | `text-[#EDEDF5]` | `#EDEDF5` | — |
| Light ground | `#F4EDE3` | **`#F6F9FA`** | — | `bg-[#F4EDE3]` | `#F4EDE3` | `#F4EDE3` |
| Light text | `#2A1F19` | **`#14213D`** | — | `text-[#2A1F19]` | `#2A1F19` | `#2A1F19` |
| Light accent | `#B9573B` / `#9E4A30` | **`#8A6814` / `#9A7A1E`** (gold) and **`#544EE6`** (violet) | — | — | `#B9573B` / `#9E4A30` | `#B9573B` |
| Dark danger | `#E5837A` | **`#EF4444`** | — | — | `#E5837A` | — |
| Light danger | `#A63D30` | **`#DC2626`** | — | — | `#A63D30` | — |
| Text selection | — | — | `#6C63FF` at 30 % with `#E4C368` text | `#C8A951` at 30 % | — | — |

`src/index.css`, `index.html`, `src/App.tsx` and both sheets agree with each other. `tokens.ts` disagrees on the whole light palette and on danger in both themes.

### 16.2 Mismatch list

1. **Light ground:** `tokens.ts:20` says `#F6F9FA`; `src/index.css:33`, `src/App.tsx:80` and `:112`, both sheets and the icon say `#F4EDE3`.
2. **Entire light palette in `tokens.ts`** (`:19-35`): 14 of 15 values differ from `.theme-light` (table in section 13).
3. **Danger:** `tokens.ts:16` `#EF4444` and `:33` `#DC2626` against `src/index.css:24` `#E5837A` and `:47` `#A63D30`. Components use neither: `--danger` is never read, and destructive UI uses Tailwind's palette instead (`text-red-400` ×3, `bg-red-500/10`, `border-red-500/30`).
4. **Glass alpha:** `tokens.ts:6-7` and the sheets describe translucent glass; `src/index.css:13-14` is opaque.
5. **Selection colour:** two different selection backgrounds, on `<body>` and on the app root; neither is remapped for the light theme, so selected text in Nahar is highlighted in violet or gold with gold text.
6. **Thread thickness:** code 0.025·S, comment and sheets 0.02·S (`BrandMark.tsx:15`, `:18`).
7. **`StarLattice` default opacity:** code 0.045, comment 0.04 (`StarLattice.tsx:4`, `:9`).
8. **Motion durations:** three unrelated sets (section 6).
9. **Icon dark thread `#D4704F`:** exists only in the PNG.
10. **`#566478`:** exists only in the Nahar sheet's closing box.
11. **Share-card verse box:** dark fill `#16162C` (`ShareCardModal.tsx:160`, `:594`) where the sunken token is `#1B1B33`.

### 16.3 Hard-coded colour counts

Six-digit hex literals in `src/components` (33 files): **1,574 occurrences, 39 distinct values**. There are no three- or eight-digit hex literals. `rgb()`/`rgba()` literals: 40.

Most frequent values:

| Value | Count | Role |
|---|---:|---|
| `#AEAECB` | 263 | Dark muted text |
| `#2E2E4A` | 221 | Dark hairline |
| `#EDEDF5` | 220 | Dark primary text |
| `#6C63FF` | 202 | Violet |
| `#E4C368` | 162 | Bright gold |
| `#15152A` | 118 | Dark ground |
| `#1E1E38` | 107 | Dark glass |
| `#C8A951` | 97 | Deep gold |
| `#C7C4D8` | 47 | Dark secondary text |
| `#25232E` | 45 | Dark raised |
| `#594DFF` | 24 | Pressed violet |

Files with the most occurrences: `SettingsScreen.tsx` 162, `journey/JourneyPathScreen.tsx` 161, `HisnScreen.tsx` 139, `ShareCardModal.tsx` 131, `JourneyStationFlow.tsx` 98, `JournalScreen.tsx` 87, `ConsistencyScreen.tsx` 83, `JourneyOnboarding.tsx` 83, `HomeScreen.tsx` 72, `PremiumPaywallScreen.tsx` 69, `ReflectionModal.tsx` 66. Five shared components contain none and are fully variable-driven: `BrandMark`, `GlassCard`, `StarLattice`, `ThreadProgress`, `CompletionParticles`.

Values that occur in components but in no token source:

| Value | Where | Purpose |
|---|---|---|
| `#252547` (7), `#232342` (4), `#27274A` (3), `#252545` (1), `#2C2C52` (1) | Hover and alternate surfaces in several screens and `ShareCardModal.tsx:696`, `:716` | Five near-identical indigo shades |
| `#5A50FF` | `OnboardingScreen.tsx` | A gradient stop near `#594DFF` |
| `#0F1026`, `#171836`, `#12132B` | `ShareCardModal.tsx:148-160` | The "royal" share-card theme |
| `#16162C` | `ShareCardModal.tsx:160`, `:594` | Share-card verse box (dark) |
| `#9D97FF`, `#4DB6AC`, `#F4A261`, `#56CFE1`, `#80ED99`, `#E76F51` | `ReflectionCategoryCharts.tsx:56-65` (and `#9D97FF` in `JourneyPathScreen.tsx`) | Category chart colours |

### 16.4 Classes that the light theme leaves dark

79 distinct hex utility classes (157 uses) have no `.theme-light` rule. The most used:

| Class | Uses | Note |
|---|---:|---|
| `shadow-[#6C63FF]/25` | 10 | Violet glow under terracotta buttons |
| `text-[#15152A]` | 9 | Dark text meant for gold fills; the gold fill rule forces white on the same element, but not on children |
| `border-[#2E2E4A]/70` | 7 | Mapped in both high-contrast variants and night reading, not in plain light |
| `hover:bg-[#252547]` | 6 | Suppressed by the base-class remap |
| `border-[#2E2E4A]/60` | 5 | Mapped in high-contrast light and night reading only |
| `border-[#6C63FF]/45`, `border-[#6C63FF]/35`, `hover:border-[#6C63FF]/40` | 4 each | Violet borders remain |
| `bg-[#1E1E38]/85` | 4 | Dark translucent panel unless an inline style overrides it |
| `bg-[#1E1E38]/45`, `/50`, `/60`, `/75`, `/70` | 3, 3, 2, 1, 1 | Same |
| `focus:border-[#6C63FF]` | 3 | Violet focus border |
| `bg-[#C8A951]/20`, `text-[#C8A951]/60`, `border-[#C8A951]/35` | 3, 3, 2 | Gold remains |
| `text-[#AEAECB]/70`, `/65`, `/40`, `/35`, `/30`, `/45` | 2, 2, 2, 2, 2, 1 | Pale lavender text on cream |

`text-white` (53 uses) has no light rule either; it is correct on terracotta fills and wrong anywhere else. In the shared and layout components the unmapped classes are: `ReflectionCategoryCharts.tsx:215` (`bg-[#1E1E38]/85`), `:230` (`border-[#C8A951]/35`); `ShareCardModal.tsx:678` (`shadow-[#6C63FF]/20`), `:696` (`hover:bg-[#27274A]`, `border-[#6C63FF]/45`), `:716` (`hover:bg-[#252545]`), `:723` (`border-[#2E2E4A]/70`); `SpotlightTour.tsx:93` (`hover:bg-white/10`); `DesktopNavBar.tsx:48` (`hover:bg-white/5`). `TopBar` and `BottomTabBar` are fully covered.

### 16.5 What this means for a change

- A new colour or a new opacity step written as a hex class works in the dark theme only, until matching rules are added for the light theme and for night reading.
- A component that reads variables through inline styles works in dark, light, night reading and dark high contrast without CSS changes, but not in light high contrast until the defect in 2.4 is fixed.
- Colours passed as props or attributes (Recharts `stroke`/`fill`, canvas drawing, `CATEGORY_COLORS`) are outside both mechanisms and stay the same in every mode.
