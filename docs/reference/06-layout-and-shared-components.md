# Layout and shared components

> **Changed since this was written** (commits `d3dfd92` to `b8db9cc`, 17 November 2026): dialogs rendered inside a screen are now positioned against the viewport. The five tabs are unchanged; the journey tab now opens the journey for everyone.

State of the code at commit `68e723a` (`main`, 2026-11-16). Line references are `path:line` against that commit.

This file covers the eight components in `src/components/common/` and the three in `src/components/layout/`. Every line of the eleven files was read. "Verified at run time" means the behaviour was observed in headless Chrome 153 against a production build; web fonts could not be fetched there, so pixel measurements were taken with fallback fonts. Colours, variables and the remapping of hex classes are explained in [05-design-system.md](05-design-system.md).

## Files

| Path | Lines | Role | Imported by |
|---|---:|---|---|
| `src/components/layout/TopBar.tsx` | 55 | Mobile header: About button, wordmark, Settings button | `src/App.tsx:3` |
| `src/components/layout/BottomTabBar.tsx` | 102 | Mobile tab bar; also exports the `TabId` type and `TasbihIcon` | `src/App.tsx:4` (`BottomTabBar`, `TabId`); `src/components/layout/DesktopNavBar.tsx:3` (`TabId`, `TasbihIcon`); `src/components/screens/TasbihModal.tsx:8` (`TasbihIcon`) |
| `src/components/layout/DesktopNavBar.tsx` | 86 | Header with tabs for viewports of 768 px and wider | `src/App.tsx:5` |
| `src/components/common/BrandMark.tsx` | 56 | The «الحمد» wordmark with optional thread and dot | `TopBar.tsx:3`, `DesktopNavBar.tsx:4`, `screens/AboutModal.tsx:3`, `screens/OnboardingScreen.tsx:6` |
| `src/components/common/GlassCard.tsx` | 41 | Card surface | 11 files, 34 call sites: `journey/JourneyPathScreen.tsx:37`; `screens/` `AboutModal.tsx:4`, `ComposeBlessingModal.tsx:3`, `ConsistencyScreen.tsx:12`, `ContentReviewModal.tsx:3`, `HisnScreen.tsx:19`, `HomeScreen.tsx:4`, `JournalScreen.tsx:15`, `PrivacyPolicyModal.tsx:3`, `SettingsScreen.tsx:23`, `TasbihModal.tsx:3` |
| `src/components/common/StarLattice.tsx` | 31 | Background pattern of eight-point stars | `journey/JourneyStationFlow.tsx:6`, `screens/OnboardingScreen.tsx:4`, `screens/ReflectionModal.tsx:6` |
| `src/components/common/ThreadProgress.tsx` | 55 | Step progress drawn as a growing thread | `journey/JourneyStationFlow.tsx:5`, `screens/OnboardingScreen.tsx:5`, `screens/ReflectionModal.tsx:5` |
| `src/components/common/SpotlightTour.tsx` | 128 | Four-step first-run tour over the Home screen | `src/App.tsx:18` |
| `src/components/common/CompletionParticles.tsx` | 132 | Celebration overlay of rising particles | `src/App.tsx:19`, `screens/ReflectionModal.tsx:7` |
| `src/components/common/ShareCardModal.tsx` | 761 | Share dialog: copies formatted text, renders a PNG on a canvas, shares | `journey/JourneyPathScreen.tsx:38`, `journey/JourneyStationFlow.tsx:7`, `screens/HomeScreen.tsx:7`, `screens/ReflectionModal.tsx:8` |
| `src/components/common/ReflectionCategoryCharts.tsx` | 627 | Category analytics with three Recharts views | `journey/JourneyPathScreen.tsx:44`, `screens/ConsistencyScreen.tsx:13` |

Every component is imported at least once. Exports and props that nothing uses:

| Item | Where | Status |
|---|---|---|
| `ReflectionCategoryChartsProps` (exported interface) | `ReflectionCategoryCharts.tsx:34` | Imported nowhere |
| `GlassCard` prop `raised` | `GlassCard.tsx:7` | Passed by none of the 34 call sites |
| Prop `className` on `BrandMark`, `StarLattice`, `ThreadProgress`, `CompletionParticles`, `TopBar`, `BottomTabBar` | each props interface | Never passed |
| `Check` icon import | `SpotlightTour.tsx:2` | Imported, not used |
| `cardRef` | `ShareCardModal.tsx:28`, `:547` | Attached to a `<div>`, never read |
| `generatedPreviewUrl` | `ShareCardModal.tsx:27`, `:319`, `:652` | Holds the PNG data URL; only its truthiness is used |

Type checking gives little protection here: `@types/react` is not installed, so `React.FC<Props>` resolves to `any` and `tsc --noEmit` passes without checking props or JSX (3,116 errors appear when `--noImplicitAny` is added).

## How the shell is assembled

`src/App.tsx` renders, in this order: `CompletionParticles` when a reflection has just been completed (`:117`); `DesktopNavBar` inside `hidden md:block` (`:120-126`); `TopBar` inside `block md:hidden` (`:129-135`); the active screen in `<main>`; `BottomTabBar` inside `block md:hidden` (`:201-206`); the modals; and `SpotlightTour` when `!tourCompleted && activeTab === 'home'` (`:261-263`).

`md` is Tailwind's default 48rem, 768 px. The comments at `App.tsx:119` and `:128` say 900 px. Verified at run time: at a 760 px viewport `TopBar` and `BottomTabBar` are visible; at 768 px only `DesktopNavBar` is.

Navigation is the `activeTab` state (`App.tsx:55`). `handleTabChange` (`App.tsx:66-75`) opens the paywall instead of the journey tab when `getDeveloperPremiumSync()` is false, and resets the tasbih sub-view to the counter when the tasbih tab is chosen. Both nav bars call it. `TopBar`'s Settings button does not go through it; it calls `setActiveTab('settings')` directly (`App.tsx:131`).

### Tab list (both bars)

| Order | `TabId` | Label (`APP_STRINGS.tabs`, `src/constants/strings.ts:9-17`) | Icon |
|---:|---|---|---|
| 1 | `home` | «الرئيسية» | lucide `Home` |
| 2 | `journey` | «رحلتي» | lucide `Compass` |
| 3 | `journal` | «سجل الحمد» | lucide `BookOpen` |
| 4 | `consistency` | «المداومة» | lucide `Calendar` |
| 5 | `tasbih` | «المسبحة» | `TasbihIcon` (custom SVG) |

The document is RTL, so the first tab is at the right. `TabId` also includes `settings`, which is not in either tab list; it is reached from the Settings icon. The two arrays are written out separately in `BottomTabBar.tsx:49-55` and `DesktopNavBar.tsx:18-24`. `APP_STRINGS.tabs.hisn` («حصن المسلم») and `.settings` («الإعدادات») are not used by the bars; the Settings buttons hard-code their label.

Stacking order across the shell: `TopBar` and `BottomTabBar` `z-30`; `DesktopNavBar` `z-40`; full-screen modals, the tour and the particles `z-50`; `ShareCardModal` `z-[60]`; the night-reading overlay 9999 (non-interactive).

---

## TopBar

**Purpose.** Sticky header for viewports under 768 px. **Used by** `src/App.tsx:130`.

**Exports.** `TopBar` (named).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `onOpenSettings` | `() => void` | Yes | Called by the Settings button |
| `isSettingsActive` | `boolean` | No, default `false` | Styles the Settings button as active |
| `onOpenAbout` | `() => void` | Yes | Called by the «ح» button |
| `className` | `string` | No | Appended to the header classes. Not passed by the caller |

**Store / persistence.** None.

**Local state, refs, memos.** None.

**Effects, timers, browser APIs.** None.

**UI structure and behaviour** (`TopBar.tsx:19-53`)

1. `<header dir="rtl">`, `sticky top-0 z-30`, `px-5 py-3.5`, three children spaced with `justify-between`.
2. Right: a 36 px round button with the letter «ح» in Amiri, gold outline, id `btn-topbar-about`, `title` and `aria-label` «عن التطبيق».
3. Centre: `<BrandMark size={24} showThread={false} />`. The comment cites the design sheet: under about 120 px the word stands alone.
4. Left: a 36 px round button with lucide `Settings` at 22 px, id `btn-topbar-settings`, `title` and `aria-label` «الإعدادات». When `isSettingsActive` it gets a gold tint, a gold border and stroke width 2.1; otherwise stroke 1.6 and a gold hover colour.

Both buttons scale to 95 % while pressed (`active:scale-95`).

**Helpers / sub-components / constants.** None.

**Styling.** `backdrop-blur-md bg-[#15152A]/85 border-b border-[#2E2E4A]/50`. All of its hex classes have light-theme rules. In night reading the gold border and tint stay gold.

**Accessibility.** Both buttons have accessible names. The active state of Settings is visual only (no `aria-current` or `aria-pressed`). The buttons are `w-9 h-9`, 36 px at the default text size, under the 44 px minimum stated in the design sheet.

**Notes and quirks.** The design sheet puts a calendar icon on the left that opens Consistency; the code puts Settings there.

---

## BottomTabBar

**Purpose.** Fixed bottom navigation for viewports under 768 px. **Used by** `src/App.tsx:202`.

**Exports.** `TabId` (type, `:5`), `TasbihIcon` (`:7`), `BottomTabBar` (`:44`).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `activeTab` | `TabId` | Yes | Which tab is highlighted |
| `onChangeTab` | `(tab: TabId) => void` | Yes | Called with the tab id on click |
| `className` | `string` | No | Appended to the `<nav>` classes. Not passed by the caller |

`TasbihIcon` props: `size` (default 22), `strokeWidth` (default 1.7), `className` (default empty). All optional.

**Store / persistence.** None.

**Local state, refs, memos.** None. The `tabs` array is rebuilt on every render.

**Effects, timers, browser APIs.** None.

**UI structure and behaviour** (`BottomTabBar.tsx:57-101`)

1. `<nav dir="rtl" aria-label="شريط التنقل السفلي">`, `fixed bottom-0 inset-x-0 z-30`, `px-2 py-1.5`, with a top hairline.
2. Inside, a `max-w-md` row with `justify-around`.
3. One `<button>` per tab, id `tab-btn-{id}`, `flex-1`, `min-h-[52px]`. Verified at run time: at a 390 px viewport each button is 75 × 58 px.
4. The active tab shows a gold bar above the icon (`w-8 h-[2.5px]`, with a gold glow), the icon at stroke 2.2 and gold icon and label. Inactive tabs use stroke 1.7 and muted colour that turns white on hover.
5. Icon size 22. Label `text-[11px] font-medium tracking-wide` (12 px at the default size, see 05 §5.3).

When `activeTab` is `settings`, no tab is highlighted.

**Helpers / sub-components / constants**

- `TasbihIcon` (`:7-36`): a 24 × 24 stroke icon that takes its colour from `currentColor`. A short vertical line at the top (the tassel), one filled bead below it, and eight outlined beads arranged in a ring.
- `TabId` (`:5`): `'home' | 'journey' | 'journal' | 'consistency' | 'tasbih' | 'settings'`. The app-wide navigation type lives in this layout file.

**Styling.** `bg-[#15152A]/92 dark:bg-[#15152A]/92 backdrop-blur-xl border-t border-[#2E2E4A]`. The `dark:` class repeats the base value and is tied to the operating-system colour scheme, not the app theme; it has no effect. In the light theme the bar becomes `rgba(244, 237, 227, 0.94)` (verified at run time) and the gold becomes terracotta; the active bar's glow is an arbitrary `shadow-[…rgba(228,195,104,0.7)]` and stays gold.

**Accessibility.** The `<nav>` is labelled. Each button carries `aria-selected` (`:74`), which is only defined for roles such as `tab` or `option`; a plain button with it does not announce the current page. There is no `aria-current`. The buttons have visible text labels.

**Notes and quirks.**

- The tour's fourth step targets `tab-btn-tasbih` (see SpotlightTour).
- The bar is about 70 px high; most screens leave `pb-28` beneath their content to clear it, on desktop as well.
- The design sheet specifies four tabs with Settings in the bar and the tasbih reached from a Home card.

---

## DesktopNavBar

**Purpose.** Sticky header with brand, tabs, Settings and About for viewports of 768 px and wider. **Used by** `src/App.tsx:121`.

**Exports.** `DesktopNavBar` (named).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `activeTab` | `TabId` | Yes | Highlights a tab, or the Settings button when it is `settings` |
| `onChangeTab` | `(tab: TabId) => void` | Yes | Called for tab clicks and for Settings (`'settings'`) |
| `onOpenAbout` | `() => void` | Yes | Called by the «ح» button |

**Store / persistence.** None. **Local state, refs, memos.** None. **Effects, timers, browser APIs.** None.

**UI structure and behaviour** (`DesktopNavBar.tsx:26-85`)

1. `<header dir="rtl">`, `sticky top-0 z-40`, `py-3.5 px-8`; content in a `max-w-5xl` row with `justify-between`.
2. Right: `<BrandMark size={32} showThread={true} />`.
3. Centre: a `<nav>` styled as a pill group (`p-1.5 rounded-2xl`, hairline border). One button per tab, id `desktop-tab-{id}`, `px-5 py-2 text-sm`, icon 17 px beside the label. Active: raised fill `bg-[#25232E]`, gold text, gold border at 30 %, semibold, stroke 2.2. Inactive: muted text, stroke 1.8, white text and a faint white fill on hover.
4. Left: a 40 px round Settings button, id `desktop-btn-settings`, `title` and `aria-label` «الإعدادات», which calls `onChangeTab('settings')` and takes the active style when `activeTab === 'settings'`; then a 40 px round «ح» button, id `desktop-btn-about`, `title` «عن التطبيق».

**Helpers / sub-components / constants.** None; it imports `TabId` and `TasbihIcon` from `BottomTabBar`.

**Styling.** `bg-[#15152A]/90 dark:bg-[#15152A]/90 backdrop-blur-xl border-b border-[#2E2E4A]/80` (the `dark:` class is a no-op, as above). `hover:bg-white/5` has no light-theme rule.

**Accessibility.** The `<nav>` has no label. The active tab is not exposed (no `aria-current`). The About button has a `title` but no `aria-label`, so its accessible name is the letter «ح» (verified at run time: `aria-label` is null). The Settings button is labelled.

**Notes and quirks.**

- Verified at run time, with fallback fonts: at 768 px and 800 px viewports the «سجل الحمد» tab wraps onto two lines (that button is 56 px high, the others 36–38 px) and the header grows from 81 px to 99 px. At 860 px and 900 px everything fits on one line. The tab group needs about 588 px.
- The tab list is duplicated from `BottomTabBar`.

---

## BrandMark

**Purpose.** The product wordmark «الحمد», optionally underlined by a thread that starts in a dot at the right end. **Used by** `TopBar.tsx:36` (24, no thread), `DesktopNavBar.tsx:31` (32, thread), `screens/AboutModal.tsx:35` (40, thread), `screens/OnboardingScreen.tsx:90` (20, no thread).

**Exports.** `BrandMark` (named).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `size` | `number` | No, default `28` | Font size of the word in px |
| `showThread` | `boolean` | No, default `true` | Renders the dot and line under the word |
| `className` | `string` | No | Appended to the wrapper. Never passed |

**Store / persistence.** None. **Local state, refs, memos.** None. **Effects, timers, browser APIs.** None.

**UI structure and behaviour** (`BrandMark.tsx:18-55`)

1. Three values derive from `size`: thread height `max(1.5, size × 0.025)`, dot diameter `max(4, size × 0.075)`, gap `max(4, size × 0.2)`.
2. Wrapper `inline-flex flex-col items-center select-none`, `dir="rtl"`.
3. The word is a `<span>` in `font-serif font-bold tracking-tight`, line height 1, colour `var(--text-primary)`. The text «الحمد» is written in the file, not taken from `APP_STRINGS.appName`.
4. With `showThread`, a row as wide as the word: first the dot (which RTL places at the right), then a line filling the rest. Both use `var(--accent-stroke)`.

Verified at run time at size 32: dot 4 × 4 px at the right edge, line 1.5 px high to its left, 6.4 px below the word.

**Helpers / sub-components / constants.** None; the file contains only the props interface and the component.

**Styling.** No hex literals; follows the theme through variables. Sizes are pixels and do not follow the user's text size.

**Accessibility.** Plain text, read as the word. No heading role.

**Notes and quirks.**

- The comment gives the thread as `0.02 × S`; the code uses `0.025` (`:15`, `:18`). The design sheets and the icon sheet say 0.02.
- Because of the minimums, every size used in the app below 60 px gets the same 1.5 px line, and every size below 53 px the same 4 px dot.
- In the dark theme the thread is deep gold `#C8A951`; the dark design sheet draws the mark's thread in bright gold `#E4C368`.
- `tracking-tight` applies negative letter-spacing to Arabic text (−0.5 px at size 20, measured).

---

## GlassCard

**Purpose.** The standard card surface. **Used by** 34 call sites in 11 files (see the files table), for example `screens/HomeScreen.tsx:70` and `:170`.

**Exports.** `GlassCard` (named).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `children` | `ReactNode` | Yes | Content |
| `className` | `string` | No | Appended last. Passed at all 34 sites |
| `onClick` | `() => void` | No | Makes the card clickable: adds `cursor-pointer active:scale-[0.99]`. Passed at 1 site (`screens/HisnScreen.tsx:730`) |
| `raised` | `boolean` | No, default `false` | Uses `--bg-raised` and `--raised-shadow` instead of `--bg-glass` and `--card-shadow`. **Never passed** |
| `borderAccent` | `boolean` | No, default `false` | Border in `--accent-stroke` instead of `--border-hairline`. Passed at 4 sites (`HomeScreen.tsx:173`, `HisnScreen.tsx:374`, `:729`, `journey/JourneyPathScreen.tsx:1057`) |
| `padding` | `string` | No, default `'p-5 sm:p-6'` | Tailwind padding classes. Passed at 31 sites |
| `id` | `string` | No | DOM id. Passed at 3 sites: `card-daily-inspiration`, `card-today-blessing` (both tour targets), and `journal-card-{id}` |

**Store / persistence.** None. **Local state, refs, memos.** None. **Effects, timers, browser APIs.** None.

**UI structure and behaviour.** A single `<div>` (`GlassCard.tsx:23-39`): `relative rounded-[24px] overflow-hidden backdrop-blur-xl transition-all duration-200 border`, plus the padding and the caller's classes. Background, border colour and shadow come from inline styles that read CSS variables.

**Helpers / sub-components / constants.** None; the file contains only the props interface and the component.

**Styling.** Fully variable-driven. Radius 24 px matches the design sheets and `RADIUS.card`. `--bg-glass` and `--bg-raised` are opaque colours, so `backdrop-blur-xl` blurs nothing visible. Because background and border are inline styles, a caller cannot override them with a utility class; callers that add `border border-[#6C63FF]/45` (`screens/JournalScreen.tsx:258`) still get the inline border colour, except in modes where a remap rule with `!important` exists for that class.

**Accessibility.** With `onClick` the card is a clickable `<div>` with no `role`, no `tabIndex` and no key handler, so it cannot be reached or activated from the keyboard. This applies to the dhikr cards in `HisnScreen.tsx:726-730`.

**Notes and quirks.**

- `overflow-hidden` clips anything positioned outside the card, including focus outlines of children at the edge.
- In the light theme with high contrast the card does not receive the high-contrast values (white fill, `#8C7762` border); see 05 §2.4.

---

## StarLattice

**Purpose.** A faint tiling of eight-point stars behind full-screen flows. **Used by** `screens/OnboardingScreen.tsx:75` (opacity 0.04), `screens/ReflectionModal.tsx:197` (0.04) and `:248` (0.015 on the "deepen" step, otherwise 0.045), `journey/JourneyStationFlow.tsx:240` (0.03) and `:316` (0.015 or 0.045).

**Exports.** `StarLattice` (named).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `opacity` | `number` | No, default `0.045` | Opacity of the whole layer |
| `className` | `string` | No | Appended to the wrapper. Never passed |

**Store / persistence.** None. **Local state, refs, memos.** None. **Effects, timers, browser APIs.** None.

**UI structure and behaviour** (`StarLattice.tsx:12-30`). A wrapper `absolute inset-0 pointer-events-none overflow-hidden select-none z-0` with `aria-hidden="true"`, containing an `<svg>` that fills it. The SVG defines a 140 × 140 pattern with id `islamic-star-pattern`: a 70 × 70 square at (35, 35) and the same square rotated 45° about (70, 70), stroke `var(--text-primary)` at width 1.2, no fill. A full-size `<rect>` is filled with the pattern.

**Helpers / sub-components / constants.** None; the file contains only the props interface and the component.

**Styling.** The stroke follows the theme. The geometry matches the tile in the design sheets, which use stroke opacity 0.05 and the default stroke width.

**Accessibility.** Hidden from assistive technology; does not intercept pointer events.

**Notes and quirks.**

- The comment on the prop says the default is 0.04; the default is 0.045 (`:4`, `:9`).
- The pattern id is fixed. Two instances in the document at the same time would share the id; the current call sites render one at a time.
- The parent must be positioned, and content must sit above `z-0`.

---

## ThreadProgress

**Purpose.** Shows progress through a sequence as a thread that lengthens toward the left. **Used by** `screens/OnboardingScreen.tsx:87` (width 120), `screens/ReflectionModal.tsx:263` (width 130), `journey/JourneyStationFlow.tsx:331` (width 130).

**Exports.** `ThreadProgress` (named).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `currentStep` | `number` | Yes | Current step, counted from 1 |
| `totalSteps` | `number` | Yes | Number of steps |
| `className` | `string` | No | Appended to the wrapper. Never passed |
| `width` | `number \| string` | No, default `140` | Track width; a number is treated as px |

**Store / persistence.** None. **Local state, refs, memos.** None. **Effects, timers, browser APIs.** None.

**UI structure and behaviour** (`ThreadProgress.tsx:17-54`)

1. `progressRatio = min(max(currentStep / totalSteps, 0.15), 1)`. The fill is never shorter than 15 %.
2. Wrapper: `relative flex items-center justify-end`, `dir="rtl"`, height 16 px, `role="progressbar"` with `aria-valuenow={currentStep}`, `aria-valuemin={1}`, `aria-valuemax={totalSteps}`.
3. Track: a 2 px line across the full width in `--border-hairline`.
4. Fill: a 2 px line anchored at the right (`right-0`), width `percentage%`, in `--accent-stroke`, with a 500 ms width transition.
5. Origin dot: 7 px, `relative z-10`, in `--accent-stroke`.
6. Leading dot: 5 px, positioned at `right: calc(percentage% − 2.5px)`, with a 500 ms transition.

**Helpers / sub-components / constants.** None; the file contains only the props interface and the component.

**Styling.** Variable-driven, no hex literals. Pixel dimensions do not follow the user's text size.

**Accessibility.** The progress bar has no accessible name (`aria-label` or `aria-labelledby`), and no `aria-valuetext`.

**Notes and quirks.**

- **The origin dot is on the wrong side.** The comment says "Origin dot on the RIGHT" (`:42`), and the design sheets draw the dot at the right with the fill growing leftward from it. The dot is the only in-flow child of a flex row with `justify-end` and `dir="rtl"`; in an RTL row the end of the main axis is the left edge. Verified at run time on the onboarding screen (step 1 of 4, width 120): the track spans x = 136.7–256.7, the fill 226.7–256.7 at the right, and the 7 px dot sits at 136.7–143.7, the far left.
- `totalSteps = 0` is not guarded (the ratio is a division by zero); no caller passes 0.
- Dot and fill use the same colour; the dark design sheet uses bright gold for the dot and deep gold for the fill.

---

## SpotlightTour

**Purpose.** A four-step introduction shown over the Home screen until completed or skipped. **Used by** `src/App.tsx:262`, rendered when `!tourCompleted && activeTab === 'home'`.

**Exports.** `SpotlightTour` (named).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `onComplete` | `() => void` | Yes | Called on skip, on the close button and after the last step. The app passes the store's `completeTour` |

**Store / persistence.** No direct use. Completion is stored by the caller: `completeTour` sets `localStorage['alhamd:tourComplete'] = 'true'` (`src/lib/store.tsx:411-414`). `replayTour` removes the key (`:416-419`) and is called from `screens/SettingsScreen.tsx:620`.

**Local state, refs, memos.** `currentStep` (index, starts at 0) and `targetRect` (`DOMRect | null`). The `steps` array is created inside the component on every render.

**Effects, timers, browser APIs.** One effect, keyed on the step (`SpotlightTour.tsx:44-55`):

1. `document.getElementById(step.targetId)`.
2. If found: `el.scrollIntoView({ behavior: 'smooth', block: 'center' })`, then `setTargetRect(el.getBoundingClientRect())` immediately, and a `resize` listener on `window` that measures again. The listener is removed on cleanup.
3. If not found: `setTargetRect(null)`.

No timers. No scroll listener, `ResizeObserver` or `IntersectionObserver`.

**How targets are located and positioned.** By element id only; there are no data attributes or selectors.

| Step | `targetId` | Element | Title | Description |
|---:|---|---|---|---|
| 1 | `card-today-blessing` | `GlassCard` in `screens/HomeScreen.tsx:171` | «نعمة اليوم» | «نعمة متجددة يومياً بالتزامن مع جميع المستخدمين حول العالم، مصحوبة بآيتها وحديثها وتدبرها.» |
| 2 | `btn-start-reflection` | Primary button in `HomeScreen.tsx:327`, rendered only while today's reflection is not completed | «استشعار النعمة» | «رحلة تفكّر هادئة من ٥ خطوات تنتقل بك من المعرفة إلى الشعور الصادق بالحمد.» |
| 3 | `card-daily-inspiration` | `GlassCard` in `HomeScreen.tsx:71` | «حديث اليوم» | «قبس نبوي شريف يُعينك على التفكر والذكر، مع إمكانية مشاركته كبطاقة أنيقة.» |
| 4 | `tab-btn-tasbih` | Tasbih button in `BottomTabBar.tsx:71` | «المسبحة وسجل الحمد» | «مسبحة إلكترونية هادئة في الشريط السفلي مع تسجيل تأملاتك اليومية المحفوظة بأمان على جهازك وحدك.» |

The highlight is an absolutely positioned box inside the `fixed inset-0` overlay, placed at the measured viewport rectangle expanded by 6 px on each side (`:74-79`). Because the rectangle is in viewport coordinates and the overlay is fixed, the box is correct only while the page does not scroll after the measurement.

**UI structure and behaviour** (`SpotlightTour.tsx:65-127`)

1. Overlay: `fixed inset-0 z-50 select-none pointer-events-auto`, `dir="rtl"`. It blocks pointer input to the page.
2. Backdrop: `bg-black/75 backdrop-blur-[2px]` over the whole viewport.
3. Highlight box (only when a rectangle exists): 2 px gold border, `rounded-3xl`, gold glow, 300 ms transition. It is an outline; the backdrop is not cut out, so the target stays dimmed and blurred like the rest of the page.
4. Explanation card: `absolute bottom-16 inset-x-4 max-w-sm mx-auto`, always at the bottom of the viewport. It holds a badge «خطوة {n} من {total}» in Arabic-Indic digits, a close button (lucide `X`, `aria-label` «تخطي الجولة»), the title, the description, a text button «تخطي الجولة», and a primary button «التالي» with a left chevron, which reads «فهمت» on the last step.
5. «التالي» advances the step; on the last step it calls `onComplete`. Both skip controls call `onComplete` at once.

**Helpers / sub-components / constants.** `TourStep` interface (`:9-13`); `steps` (`:19-40`); `handleNext` (`:57-63`).

**Styling.** Dark-theme hex classes, remapped in the light theme; `bg-black/75` is not remapped and stays dark in every mode. The card enters with `animate-fade-in`.

**Accessibility.** No `role="dialog"`, no `aria-modal`, no focus management and no Escape handler. Pointer input to the page is blocked, but keyboard focus can still move to controls underneath. Step changes are not announced.

**Notes and quirks.** All verified at run time.

- **Stale highlight after scrolling.** The rectangle is read in the same tick that starts a smooth scroll, and never again unless the window is resized. At 390 × 844, step 1's box was at y = 285 while the card had settled at y = 188, and step 3's box (y 46–120) did not overlap its target at all (y 149–211). At 1280 × 800 the two boxes were off by 154 px and 148 px. Steps 2 and 4 were aligned because no scroll happened between them and the previous step.
- **Step 4 on desktop.** `tab-btn-tasbih` is inside the `md:hidden` wrapper at 768 px and wider. The element exists, so the box is drawn, but its rectangle is all zeros: a 12 × 12 px ring at (−6, −6), in the top-left corner. The desktop equivalent, `desktop-tab-tasbih`, is not targeted. The step's text also refers to «الشريط السفلي» (the bottom bar), which does not exist on desktop.
- **The card covers targets.** At 390 × 844 the explanation card occupied y = 567–780; the step 2 button was at y = 643–703, entirely underneath it.
- Step 2's target is missing once today's reflection is completed; the step then shows without a highlight.
- The step texts are defined here. `APP_STRINGS.tourSteps` (`src/constants/strings.ts:59-80`) holds four other texts with different keys (`blessing`, `feel-button`, `share`, `journal`) and is used by nothing.
- Step 2 states «٥ خطوات» as fixed text.

---

## CompletionParticles

**Purpose.** A short, non-interactive celebration: particles drift upward and fade. **Used by** `src/App.tsx:117` (default count 32, mounted for 3,200 ms after a reflection completes, `App.tsx:99-102`) and `screens/ReflectionModal.tsx:198` (count 36, inside the "accepted" overlay).

**Exports.** `CompletionParticles` (named).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `count` | `number` | No, default `32` | Number of particles |
| `className` | `string` | No | Appended to the wrapper. Never passed |

**Store / persistence.** None.

**Local state, refs, memos.** `particles`, a `useMemo` over `count` (`:26-49`).

**Effects, timers, browser APIs.** None of its own. Animation is by `motion/react` (`motion.div` with `initial`, `animate`, `transition`); each animation runs once.

**UI structure and behaviour**

1. Wrapper: `pointer-events-none fixed inset-0 z-50 overflow-hidden select-none`, `aria-hidden="true"`.
2. A central glow: a 20rem circle, `blur-3xl`, background `var(--ayah-border)`, animating opacity 0 → 0.35 → 0 and scale 0.8 → 1.15 → 1.3 over 2.6 s (`:57-63`).
3. One `motion.div` per particle, absolutely positioned at `left: x%`, `top: startY%`. It animates opacity 0 → 0.85 → 0.7 → 0, moves up by `travelY`, drifts sideways by `driftX`, scales 0.4 → 1.05 → 0.85 → 0.2, and stars rotate 0 → 45° → 90°. Easing `easeOut`.
4. Shapes: a four-point star as an inline SVG path with a drop shadow; a ring (1 px border with a glow); or an orb (filled circle with a glow).

**Helpers / sub-components / constants.** `ParticleConfig` (`:9-20`). The generator is deterministic; for particle `i`:

| Field | Formula | Range |
|---|---|---|
| seeds | `s1 = ((37i + 13) mod 100) / 100`, `s2 = ((61i + 29) mod 100) / 100`, `s3 = ((83i + 7) mod 100) / 100` | 0–0.99 |
| `shape` | star if `i mod 5 = 0`, else ring if `i mod 7 = 0`, else orb | For 32: 21 orbs, 7 stars, 4 rings. For 36: 24, 8, 4 |
| `x` | `6 + s1 × 88` | 6.9–92.2 % |
| `startY` | `30 + s2 × 62` | 30–90.8 % |
| `travelY` | `−(110 + s3 × 160)` px | −111.6 to −268.4 |
| `driftX` | `(s1 − 0.5) × 48` px | −23.5 to +23 |
| `size` | star `9 + (i mod 4) × 2`; ring `10 + (i mod 3) × 3`; orb `4 + (i mod 4) × 2` | 4–16 px |
| `delay` | `(i mod 10) × 0.12` s | 0–1.08 |
| `duration` | `2.2 + s3 × 1.4` s | 2.21–3.59 |
| `isAccent` | `i mod 3 ≠ 0` | Two thirds use `--accent-stroke`, one third `--cta-bg` |

The interface comments give slightly different ranges (x 5–95, startY 25–95).

**Styling.** Variable-driven: gold and violet in the dark theme, terracotta in the light theme, amber in night reading. The glow colour `--ayah-border` is terracotta at 14 % in the dark theme, so the central glow is barely visible there.

**Accessibility.** Hidden from assistive technology and from pointer input. It does not check `prefers-reduced-motion`.

**Notes and quirks.**

- The longest particle finishes 4.46 s after mount. The app unmounts the layer at 3.2 s, when 21 of the 32 particles have not finished; the reflection modal leaves its overlay after 2.2 s (`ReflectionModal.tsx:171-173`).
- After a daily reflection the effect plays twice in a row: once inside the modal's overlay, then again from `App` when the modal closes.
- Particles stay mounted at opacity 0 after their animation until the parent removes the component.

---

## ShareCardModal

**Purpose.** Lets the user take a blessing out of the app: as formatted Arabic text, as a rendered PNG, through the system share sheet, or through a WhatsApp, Telegram or X link. **Used by** `screens/HomeScreen.tsx:339`, `screens/ReflectionModal.tsx:590`, `journey/JourneyStationFlow.tsx:301` and `:525`, `journey/JourneyPathScreen.tsx:1367`.

**Exports.** `ShareCardModal` (named).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `blessing` | `Blessing` | Yes | The content. Fields read: `title`, `shortTitle`, `id`, `categoryLabel`, `openingLine`, `quran.textUthmani`, `quran.surahName`, `quran.ayahNumber`, `tadabbur`, `hadith.text`, `hadith.source`, `duaa` |
| `type` | `'ayah' \| 'tadabbur'` | No, default `'tadabbur'` | Initial content level |
| `onClose` | `() => void` | Yes | Called by the close button and by a click on the backdrop |

**Store / persistence.** `useStore()` for `theme` (initial card theme) and `triggerHaptic`. No `localStorage`, no window events. Only content from the blessing dataset is shared; the user's journal text is never included.

**Local state, refs, memos** (`ShareCardModal.tsx:19-28`)

| State | Type | Initial | Purpose |
|---|---|---|---|
| `activeTab` | `'image' \| 'text'` | `'image'` | Which preview is shown |
| `cardTheme` | `'dark' \| 'light' \| 'royal'` | `'light'` if the app theme is light, else `'dark'` | Palette of the card |
| `contentMode` | `'ayah' \| 'tadabbur' \| 'full'` | From `type` | How much content is included |
| `aspect` | `'4:5' \| '9:16'` | `'4:5'` | Output format |
| `copied` | boolean | `false` | Copy confirmation, 2.5 s |
| `downloading` | boolean | `false` | Disables the save button while rendering |
| `imageSaved` | boolean | `false` | Save confirmation, 3 s |
| `sharingNative` | boolean | `false` | Disables the share button while preparing |
| `generatedPreviewUrl` | `string \| null` | `null` | The last PNG data URL; used only as a flag |
| `cardRef` | ref | | Unused |

No memoisation: `textToCopy` is rebuilt on every render (`:71`).

**Effects, timers, browser APIs.** No `useEffect`. Two `setTimeout` calls (2,500 ms and 3,000 ms) that are not cleared on unmount.

| API | Where | Use |
|---|---|---|
| `navigator.clipboard.writeText` | `:75` | Copy the formatted text |
| Hidden `<textarea>` + `document.execCommand('copy')` | `:81-93` | Fallback when the Clipboard API throws |
| `document.createElement('canvas')`, 2D context | `:141-145` | Image rendering |
| `ctx.roundRect`, `createRadialGradient`, `measureText`, `fillText`, `ctx.direction = 'rtl'` | `:166-308` | Drawing |
| `canvas.toDataURL('image/png')` + `<a download>` click | `:318-323` | Download |
| `canvas.toBlob`, `File`, `navigator.canShare`, `navigator.share` | `:336-356` | System share |
| `window.location.href` | `:370` | Page URL, for the Telegram link |
| `<a target="_blank" rel="noopener noreferrer">` click | `:381-385` | Open a share URL |
| `navigator.vibrate` through `triggerHaptic` | several | Feedback |

External URLs: `https://wa.me/?text=…`, `https://twitter.com/intent/tweet?text=…`, `https://t.me/share/url?url=…&text=…` (`:373-379`). The Font Loading API (`document.fonts`) is not used.

### What can be shared

Three content levels, chosen with the chips «مع الآية», «مع التدبّر», «شاملة مع الدعاء»:

| Part | `ayah` text | `ayah` image | `tadabbur` text | `tadabbur` image | `full` text | `full` image |
|---|---|---|---|---|---|---|
| Title, category, opening line | Yes | Yes | Yes | Yes | Yes | Yes |
| Verse and reference | Yes | Yes | Yes | Yes | Yes | Yes |
| Tadabbur | No | No | Yes, complete | Yes, 3 lines (4 in 9:16) | Yes, complete | Yes, 3 or 4 lines |
| Hadith and source | No | No | No | No | Yes | **No** |
| Duʿāʾ | No | No | **Yes** | No | Yes | Yes, 2 lines, only if space remains |
| Sign-off | Yes | Yes | Yes | Yes | Yes | Yes |

The text and the image disagree in two cells: in `tadabbur` mode the text includes the duʿāʾ and the image does not; in `full` mode the text includes the hadith and the image never does.

### Formatted text (`buildFormattedBlessingText`, `:34-69`)

Lines joined with `\n`, in this order:

```
✨ ━━━ « {title} » ━━━ ✨
🏷️ المحور: {categoryLabel}

{openingLine}

📖 الآية الكريمة:
﴿ {quran.textUthmani} ﴾
[سورة {surahName} · الآية {ayahNumber in Arabic-Indic digits}]

💭 وقفة تدبّر:                      (tadabbur and full, when tadabbur exists)
{tadabbur}

🌿 من الهدي النبوي:                 (full only, when hadith.text exists)
«{hadith.text}» ({hadith.source})

🤲 دعاء النعمة:                     (tadabbur and full, when duaa exists)
«{duaa}»

━━━━━━━━━━━━━━
— تطبيق «الحمد» لتأمل النعم
```

For the 40 blessings in the dataset the result is roughly 190–320 characters in `ayah` mode and 560–800 in `tadabbur` mode.

### Canvas rendering pipeline (`renderCardCanvas`, `:137-311`)

The function is declared `async` but contains no `await`; it draws synchronously and returns the canvas, or `null` when no 2D context is available.

**Formats**

| Chip | `aspect` | Canvas | Card inside |
|---|---|---|---|
| «بطاقة (٤:٥)» | `'4:5'` | 1080 × 1350 px | x 76, y 90, 928 × 1110 |
| «قصة (٩:١٦)» | `'9:16'` | 1080 × 1920 px | x 76, y 130, 928 × 1600 |

**Themes**

| Role | «ليل» `dark` | «ملكي» `royal` | «نهار» `light` |
|---|---|---|---|
| Ground | `#15152A` | `#0F1026` | `#F4EDE3` |
| Glow (radial, 14 %) | violet `108, 99, 255` | violet | gold `228, 195, 104` |
| Card fill | `#1E1E38` | `#171836` | `#FBF8F3` |
| Card stroke, 3 px | gold at 22 % | gold at 45 % | terracotta at 35 % |
| Inner frame, 1.5 px | gold at 12 % | gold at 12 % | terracotta at 14 % |
| Primary text | `#EDEDF5` | `#EDEDF5` | `#2A1F19` |
| Secondary text | `#C7C4D8` | `#C7C4D8` | `#4A3B32` |
| Muted text | `#AEAECB` | `#AEAECB` | `#6B5A4E` |
| Badge and section heading | `#E4C368` | `#E4C368` | `#9E4A30` |
| Verse text | `#E4C368` | `#E4C368` | `#2A1F19` |
| Verse box fill | `#16162C` | `#12132B` | `#EFE6D9` |
| Sign-off text | `#E4C368` | `#E4C368` | `#2A1F19` |
| Sign-off line | `#E4C368` | `#E4C368` | `#B9573B` |

`royal` differs from `dark` only in the ground, the card fill, the verse box fill and the stroke opacity. The values are literals in the function (`:148-160`), not design tokens.

**Drawing steps.** All text is centred at x = 540 with `textAlign = 'center'` and `direction = 'rtl'`. `cursorY` is the running baseline.

| # | Element | Font | Position and rules |
|---:|---|---|---|
| 1 | Ground | | Fill the whole canvas |
| 2 | Glow | | Radial gradient from (540, 0.35 h, r 60) to (540, 0.45 h, r 756), fading to transparent |
| 3 | Card | | Rounded rectangle, radius 44, filled and stroked |
| 4 | Inner frame | | Inset 20 px, radius 32, stroke only |
| 5 | Category | `600 26px "IBM Plex Sans Arabic"` | `✦ {categoryLabel} ✦` at `cardY + 95` |
| 6 | Title | `bold 58px "Amiri"` | 80 px lower. One `fillText`, **not wrapped** |
| 7 | Opening line | `29px "IBM Plex Sans Arabic"` | 64 px lower; wrapped to 788 px, at most 2 lines, 46 px apart |
| 8 | Verse box | | 20 px lower; x 130, width 820, height `lines × 76 + 96`, radius 28, filled and stroked 2 px |
| 9 | Verse | `44px "Amiri Quran", "Amiri"` | `﴿ {textUthmani} ﴾`, wrapped to 728 px, at most 4 lines; first baseline 68 px into the box, 74 px apart |
| 10 | Reference | `26px "IBM Plex Sans Arabic"` | `سورة {surahName} · الآية {n}`, 8 px below the last verse line |
| 11 | Heading «وقفة تدبّر» | `600 25px "IBM Plex Sans Arabic"` | 58 px below the box; only in `tadabbur` and `full` |
| 12 | Tadabbur | `28px "IBM Plex Sans Arabic"` | 48 px lower; wrapped to 788 px, at most 3 lines (4 in 9:16), 48 px apart |
| 13 | Duʿāʾ | `italic 32px "Amiri"` | `«{duaa}»`; only in `full` and only if `cursorY < cardY + cardH − 110`; 20 px lower, wrapped to 788 px, at most 2 lines, 50 px apart |
| 14 | Sign-off | `bold 42px "Amiri"` | «الحمد · لتأمل النعم» at y = `height − 68` |
| 15 | Sign-off line | | 140 px wide, 2.5 px, centred, 18 px below the sign-off baseline. No dot |

Content is laid out from the top of the card downward. Nothing centres it vertically, so the 9:16 card has a large empty area below the text. In the worst 4:5 case (two-line opening, four-line verse, three-line tadabbur) the last tadabbur line sits about 155 px above the card's bottom edge, and the duʿāʾ is skipped by the space check (the running position is 1091, the limit 1090).

**Arabic word-wrapping (`wrapCanvasText`, `:98-134`).** Signature: `(ctx, text, maxWidth, maxLines = 6) → string[]`. It measures with whatever `ctx.font` is set when it is called, so each caller sets the font first.

1. Trim the text and split it on runs of whitespace into words.
2. Build a line greedily: append the next word if `measureText(line + ' ' + word).width` does not exceed `maxWidth`.
3. When a word does not fit and the current line is not empty, push the line and start a new one with that word.
4. If the pushed lines now number `maxLines − 1`, the new line is the last one allowed. Join all remaining words:
   - if they fit in `maxWidth`, use them as the last line;
   - otherwise add words one at a time while `candidate + '...'` still fits, and end the line with three ASCII full stops.
   Then stop.
5. Push whatever line is in progress.

Properties that follow from the code:

- It breaks only at spaces. A single word wider than `maxWidth` is placed on its own line and overflows. Arabic has no hyphenation, and none is attempted.
- Diacritics and joining are left to the browser's text shaping; the function works on whole words, so it never splits a ligature or separates a mark from its letter.
- The ellipsis is `...` appended in logical order; with `direction = 'rtl'` it appears at the left end.
- When the verse is truncated, the closing ornate bracket `﴾` is dropped with the cut text.
- With `maxLines = 1` it returns two lines. No caller passes 1.
- The title bypasses the function altogether.

For the current dataset the longest verse has 100 letters in 18 words and the longest title 22 letters. Whether any verse reaches the four-line limit at 44 px was not measured with the real font.

**Font loading.** The canvas uses font families by name and relies on the page having already loaded the faces it needs. Nothing calls `document.fonts.load()` or waits for `document.fonts.ready` before drawing. The modal's own preview uses Amiri Quran, Amiri bold and the interface font, which makes those faces likely to be present; faces used only on the canvas at that moment (for example Amiri italic for the duʿāʾ when the preview is not in `full` mode, or IBM Plex Sans Arabic when the user's interface font is a different family) may not be, in which case the browser draws with a fallback font. This was not reproduced in a browser with network access to the fonts.

### Export, share and download paths

| Action | Handler | Steps |
|---|---|---|
| «إنشاء صورة مخصصة وحفظها» | `handleGenerateAndDownloadImage`, `:313-330` | Render the canvas; `toDataURL('image/png')`; create an `<a>` with `download = alhamd-{shortTitle or id}-{card or story}.png`; click it; success haptic; show «تم حفظ الصورة المخصصة» for 3 s. Wrapped in `try … finally` with no `catch` |
| «نسخ نص النعمة بتنسيق جميل» | `handleCopyText`, `:73-95` | Clipboard API, then the `<textarea>` fallback; success haptic; show «تم نسخ النص بالتنسيق الجميل» for 2.5 s. If both fail, nothing is shown |
| «مشاركة مباشرة عبر التطبيقات» | `handleNativeSocialShare`, `:332-365` | If a canvas was produced and `navigator.share` exists: make a PNG `File` named `alhamd-{shortTitle or id}.png`; if `navigator.canShare({ files })`, share title «نعمة: {title}», the formatted text and the file; otherwise share title and text only. If `navigator.share` does not exist, copy the text instead. Every error is caught and ignored as a cancelled share |
| «واتساب», «تيليجرام», «منصة X» | `handlePlatformShare`, `:367-386` | Light haptic; open the platform URL in a new tab with the URL-encoded formatted text. Only the Telegram link also carries the page URL |

The file name uses `shortTitle`, which is Arabic, for example `alhamd-الإسلام-card.png`.

### UI structure and behaviour (`:388-760`)

1. Backdrop: `fixed inset-0 z-[60] bg-black/80 backdrop-blur-md animate-fade-in`, `dir="rtl"`. A click on it closes the modal.
2. Panel: `max-w-lg`, `max-h-[94vh]`, scrollable; clicks inside do not propagate.
3. Header: title «مشاركة النعمة والاحتفاظ بها», subtitle «انسخ نص النعمة بتنسيق جميل أو أنشئ صورة مخصصة للاحتفاظ بها», a round close button with `aria-label` «إغلاق نافذة المشاركة».
4. Mode switch, two buttons: «إنشاء صورة مخصصة» and «نسخ النص المنسّق». Each gives a light haptic.
5. Controls: the three content chips (always); on the image tab also the aspect chips «بطاقة (٤:٥)» / «قصة (٩:١٦)» and the theme chips «ليل» / «ملكي» / «نهار».
6. Preview:
   - Image tab: an HTML card built to resemble the output (`:546-650`), coloured with the same palette through inline styles. Below it, after a save: «تم إنشاء الصورة المخصصة وتنزيلها على جهازك للاحتفاظ بها».
   - Text tab: labels «معاينة النص المنسّق الجاهز للنسخ:» and «تنسيق عربي مزخرف», then the text in a `<pre>` (`whitespace-pre-wrap`, `select-all`, at most 280 px high).
7. Actions, shown on both tabs: the save button, the copy button, the system share button, and a row «إرسال سريع للنص المنسّق:» with the three platform buttons (`title` «مشاركة عبر واتساب», «مشاركة عبر تيليجرام», «مشاركة عبر منصة X»).

**Helpers / sub-components / constants.** `buildFormattedBlessingText`, `handleCopyText`, `wrapCanvasText`, `renderCardCanvas`, `handleGenerateAndDownloadImage`, `handleNativeSocialShare`, `handlePlatformShare`. All are closures inside the component; none is exported.

**Styling.** The dialog chrome uses dark hex classes, remapped per mode. The preview card and the canvas use fixed palettes that follow the selected card theme, not the app mode. Classes without a light-theme rule: `shadow-[#6C63FF]/20` (`:678`), `hover:bg-[#27274A]` and `border-[#6C63FF]/45` (`:696`), `hover:bg-[#252545]` (`:716`), `border-[#2E2E4A]/70` (`:723`). In the light theme the check icon inside the save button becomes `#9E4A30` on `#B9573B` (`:682`).

**Accessibility.**

- No `role="dialog"`, `aria-modal` or label on the panel; no focus trap, no return of focus, no Escape handler. The page behind remains scrollable and focusable.
- The switches and chips are plain buttons with no `aria-pressed` or tab roles; the selection is conveyed by colour only.
- Chip labels are white `text-[11px]` on `#6C63FF`; the design sheet gives white on violet as 4.3:1, for large text only.
- The chips are about 28 px high.
- Confirmations are visual; there is no live region.

**Notes and quirks.**

- The preview is a separate piece of markup, not the canvas output. It shows the verse without the inner spaces and unwrapped, clamps the tadabbur with CSS, uses `min-h-[340px]` / `min-h-[410px]` rather than the real proportions, and its border opacities differ from the canvas (for example 16 % against 22 % on the dark card). The exported image is never displayed in the modal.
- The image-only controls disappear on the text tab, but the save button still renders an image with the last chosen aspect and theme.
- The comment at `:277` says the duʿāʾ may be drawn "if space permits in 9:16"; the code draws it only in `full` mode.
- The design sheet places the mark at the bottom left of share cards; the code centres a sign-off.
- `ctx.roundRect` is called without a feature check. Where it is missing, the save path rejects without a message and the share path silently does nothing.
- The whole formatted text is sent to X; in `tadabbur` and `full` modes it is longer than a post allows.
- The PNG data URL stays in component state until the modal closes.
- The "saving" label («جارِ إنشاء الصورة...») is set immediately before synchronous drawing; whether it is ever painted was not checked.

---

## ReflectionCategoryCharts

**Purpose.** Summarises which of the eight blessing categories and which topics the user has engaged with, as summary cards, one of three charts, a legend and a topic list. **Used by** `screens/ConsistencyScreen.tsx:275` (default variant) and `journey/JourneyPathScreen.tsx:918` (`variant="journey"`, on the journey's statistics tab).

**Exports.** `ReflectionCategoryCharts` (named), `ReflectionCategoryChartsProps` (interface; imported nowhere).

**Props**

| Name | Type | Required | What it does |
|---|---|---|---|
| `variant` | `'default' \| 'journey'` | No, default `'default'` | Chooses the container classes only: `journey` is `p-4 sm:p-5 … bg-[#1E1E38]/90`, default is `p-5 sm:p-6 … bg-[#1E1E38]/85 shadow-lg` (`:212-215`) |

**Store / persistence.** `useStore()` for `completedDays`, `entries`, `userBlessings`, `journeyState` (`:92`). Read-only. No `localStorage`, no events.

**Local state, refs, memos.** `chartType`: `'bars' | 'radar' | 'donut'`, initial `'bars'` (`:93`); it resets whenever the component remounts. `analytics`: a `useMemo` over the four store values (`:95-210`).

**Effects, timers, browser APIs.** None directly. Recharts' `ResponsiveContainer` sizes each chart to its parent.

### Data derivation (`analytics`)

Every counted item goes through `recordReflection(rawCategory, topicTitle)` (`:106-126`). It maps the category with `mapOldCategoryToCanonical` (`src/constants/categories.ts:17-28`: a missing value becomes «نعم الدين», an unrecognised one «نعم الحياة والنفس»), adds one to that category, and, when a non-empty title is given, records the title in the category's topic set and adds one to a per-title counter.

| # | Source | What is counted | Category and topic taken from |
|---:|---|---|---|
| 1 | `completedDays` (ISO dates) | Each completed day | `blessingForDate(date, allBlessings)`: its `categoryLabel` and `shortTitle` or `title` |
| 2 | `entries` (journal) | Each entry | The entry's `categoryLabel` and `shortTitle` |
| 3 | `userBlessings` | Each personal blessing | Its `category` and `title` |
| 4 | `journeyState.completed` (keys `stageId__index`) | Each completed station whose key splits into exactly two parts and resolves through `stage.stationBlessingIds[index]` and `getBlessingById` | The blessing's `categoryLabel` and `shortTitle` or `title` |

Derived values:

| Value | Definition |
|---|---|
| `totalReflections` | Sum of all category counts |
| `categoryStats` | One item per entry of `CATEGORIES`, in that order (الدين, الحياة والنفس, الأهل, الرزق, العافية, العقل, الأمن, المال): `key`, `label`, `shortLabel`, `count`, `percentage = round(count / total × 100)` (0 when the total is 0), `color`, `topTopics` |
| `topTopics` | The first three titles recorded for the category, in insertion order, not by frequency |
| `sortedByCount` | `categoryStats` sorted by count, descending. The sort is stable, so ties keep the `CATEGORIES` order |
| `activeCategories` | Items of `sortedByCount` with a count above 0 |
| `topCategory` | First of `sortedByCount` |
| `leastExploredCategory` | First of `categoryStats` sorted ascending. With ties, the earliest in `CATEGORIES` |
| `topTopicsList` | The six most frequent titles, each with its category label and colour |

Consequences of these definitions:

- A daily reflection finished with a journal note is counted twice: `App.handleReflectionComplete` records the day and adds a journal entry (`src/App.tsx:94-97`), and both sources are counted.
- A new installation is seeded with three completed days, two sample journal entries and one sample personal blessing (`src/lib/store.tsx:71-107`, `:181-190`), so the component reports six «وقفة تدبر» before the user has done anything.
- The header's total is labelled «وقفة تدبر» although it includes journal entries and personal blessings.
- Percentages are rounded independently and need not add up to 100.
- Topics are keyed by title alone; the same title in two categories is merged under the first category seen.
- When every category has the same non-zero count, the "most present" and "suggested" cards name the same category.

### The three charts

All sit in a 15rem-high box with `dir="ltr"` (`:356`), chosen with the switch «الفئات», «ميزان الوعي», «النِّسَب».

| Chart | Recharts elements | Data | Details |
|---|---|---|---|
| «الفئات» (bars) | `BarChart layout="vertical"`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Bar`, `Cell` | `sortedByCount`, all eight categories | Horizontal bars growing left to right. Numeric axis in Arabic-Indic digits, integers only. Category axis shows `shortLabel`, 82 px wide. Bars 16 px, right corners rounded 8. Bar colour is the category colour, or `rgba(174, 174, 203, 0.2)` at count 0. Dashed vertical grid lines. Tooltip: label, percentage, «عدد مرات التدبر:» with the count, and «من النعم المتدبَّرة:» with the topics |
| «ميزان الوعي» (radar) | `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Tooltip`, `Radar` | `categoryStats`, fixed category order | Outer radius 72 %. One series «وقفات التدبر» on `count`: stroke `#E4C368` 2.2 px, fill `#6C63FF` at 38 %. Tooltip: label, «وقفات التدبر:» count and percentage |
| «النِّسَب» (donut) | `PieChart`, `Pie`, `Cell`, `Tooltip` | `activeCategories`, or all of `categoryStats` when none is active | Inner radius 52, outer 84, 3° gap, no stroke, no labels. Tooltip: label, «النسبة:» percentage and count. With every count at 0 nothing is drawn |

Tick fonts are 11 px (10 px on the radar's radius axis) and tick colours read `--text-primary` and `--text-muted`. Tooltips are custom `<div dir="rtl">` blocks using `--bg-raised`, `--border-hairline` and `--text-primary`.

### UI structure and behaviour (`:217-626`)

1. `<section dir="rtl" aria-label="بصيرة التدبر وتوزيع فئات النعم">`, background `var(--bg-raised)`, border `var(--border-hairline)`.
2. Header: a compass tile; title «بصيرة التدبر والوعي الذاتي»; subtitle «أكثر المواضيع وفئات النعم حضوراً في تأملاتك ({total} وقفة تدبر)»; the three-way chart switch.
3. Two summary cards:
   - «أكثر الفئات حضوراً في قلبك», only when the top category has a count above 0: a pill «{percentage}٪ من تدبرك» tinted with the category colour, the label with its count, and «أبرز النعم: …».
   - «أفق مقترح لتوسيع الوعي»: the least explored category, «لم يُستكشف بعد» or «{n} وقفة», and that category's hint text.
4. The chart area.
5. A legend grid (two columns, four from `sm`): all eight categories in `sortedByCount` order, each with a colour dot (grey at 0), the short label and the count.
6. When any topic exists: «أكثر المواضيع والنعم حضوراً في تدبرك», «حسب تكرار التأمل والتدوين», and up to six chips with a colour dot, the title, the category in parentheses and `×n` when the count is above 1.

**Helpers / sub-components / constants**

`CATEGORY_COLORS` (`:56-65`), `SHORT_CATEGORY_LABELS` (`:67-76`) and `CATEGORY_SELF_AWARENESS_HINTS` (`:78-87`), keyed by the full category label:

| Category | Colour | Short label | Hint |
|---|---|---|---|
| «نعم الدين» | `#E4C368` | «الدين» | «تأمل نعمة الهداية، تيسير الذكر، وانشراح الصدر للطاعة.» |
| «نعم الحياة والنفس» | `#6C63FF` | «الحياة والنفس» | «تأمل نعمة الأنفاس المتجددة، الحواس، والقدرة على السعي كل صباح.» |
| «نعم الأهل» | `#4DB6AC` | «الأهل» | «تأمل دفء القرب، دعوات الوالدين، ومودة من يؤنس وحشتك.» |
| «نعم العافية» | `#9D97FF` | «العافية» | «تأمل سكون الألم، عافية الجوارح، ونوم الليل في طمأنينة.» |
| «نعم الرزق» | `#F4A261` | «الرزق» | «تأمل الرزق الذي يسوقه الله إليك من حيث تحتسب ومن حيث لا تحتسب.» |
| «نعم العقل» | `#56CFE1` | «العقل» | «تأمل نعمة الفهم، التمييز، التدبر، وحفظ الذكريات الجميلة.» |
| «نعم الأمن» | `#80ED99` | «الأمن» | «تأمل نعمة الأمان في المسكن والوطن وطمأنينة القلب عند المساء.» |
| «نعم المال» | `#E76F51` | «المال» | «تأمل نعمة الكفاية، الاستغناء عن الخلق، والقدرة على البذل والعطاء.» |

A category without an entry falls back to `#E4C368` (`:170`, `:198`). Interfaces `CategoryStatItem` (`:39-47`) and `TopicStatItem` (`:49-54`) are local.

**Styling.** A mix: surfaces, borders and chart ticks read variables; headings and labels use dark hex classes; chart series and category colours are fixed hex values that do not change with the theme. The container's hex background class is overridden by the inline variable in the dark theme, but in the light theme and in night reading the `journey` variant's `bg-[#1E1E38]/90` is forced by a remap rule while the default variant's `/85` is not, so the two variants get different surfaces there (05 §2.2).

**Accessibility.**

- The section is labelled. The switch buttons have text labels but no `aria-pressed`.
- The charts themselves have no text alternative; the legend grid gives every category's count as text, which covers the bar and donut data.
- Category colours are used as text colours: the percentage pill (`:305-313`), tooltip values (`:406`, `:468`, `:532`) and the `×n` chips (`:610-616`). Computed against the light sunken surface `#EFE6D9`, all eight are below 4.5:1, from 1.17:1 (`#80ED99`) and 1.38:1 (`#E4C368`) to 3.49:1 (`#6C63FF`). In the dark theme `#6C63FF` on `#1B1B33` is 3.89:1.
- The chart area is left-to-right inside a right-to-left page: bars start at the left, with category names on the left.

**Notes and quirks.**

- The radar's violet fill and the violet and blue category colours are unchanged in night reading.
- `journeyState.stages.find` (`:153`) is not guarded, unlike `journeyState?.completed` (`:147`).
- The analytics logic is inside the component and cannot be called from a test without rendering it.
- Recharts is part of the 1.03 MB main application chunk. Its importers are this component, `journey/JourneyWeeklyProgressChart.tsx` and `screens/ConsistencyScreen.tsx`.
