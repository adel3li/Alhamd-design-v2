# Core screens

> **Changed since this was written** (commit `d3dfd92`, 17 November 2026): Home formats a verse of the day as a verse (the code now tests for `'quran'`); new users start with empty history; day keys are local; dialogs opened from these screens are positioned against the viewport; `ContentReviewModal` has no status badge and reads its count from the data; the links to it read «عن المحتوى والتوثيق»; `ReflectionModal` splits text without a regex lookbehind; finishing the welcome reflection starts the daily rotation the next day. In `403f633` the consistency screen lost its statistics card (total, consecutive days, seven-day chart) and the month percentage; the Hijri calendar and the reminder remain. In `b7b2e94` onboarding says 80 seconds. In `755170f` `ReflectionModal` records three consent-gated events.

State of the code at commit `68e723a`. Line references are `path:line` against that commit. Inside a file's own section, a bare `:NN` points into that file.

This document covers the nine files in `src/components/screens/` that make up the Home, Journal and Consistency tabs, the first-run onboarding, the reflection flow and the three information dialogs.

| File | Lines | Role |
|---|---|---|
| `src/components/screens/HomeScreen.tsx` | 347 | Home tab: greeting, daily inspiration card, blessing-of-the-day card, entry point to the reflection flow |
| `src/components/screens/ReflectionModal.tsx` | 599 | Full-screen guided reflection («استشعار»): five paced steps, optional timer, journal step, completion overlay |
| `src/components/screens/OnboardingScreen.tsx` | 238 | First-run introduction: four slides, reminder and analytics switches |
| `src/components/screens/ComposeBlessingModal.tsx` | 199 | Form that creates a personal blessing |
| `src/components/screens/JournalScreen.tsx` | 486 | Journal tab: journal entries («سجل الحمد») and personal blessings («نِعَمي») |
| `src/components/screens/ConsistencyScreen.tsx` | 532 | Consistency tab: totals, 7-day chart, Hijri calendar, reminder setting |
| `src/components/screens/AboutModal.tsx` | 111 | "About" dialog |
| `src/components/screens/ContentReviewModal.tsx` | 68 | Content sourcing and review-status dialog |
| `src/components/screens/PrivacyPolicyModal.tsx` | 63 | Privacy policy dialog |

Statements marked **observed** were checked at run time, not only read in the source. The check loaded the production build already present in `dist/` in headless Chrome 153 with a clean profile, at 390 × 844 px unless another size is given, system time zone UTC, on 17 November 2026. No repository file was changed for it.

Facts that hold for all nine files, so they are not repeated in every section:

1. **Shape.** Each file exports one named `React.FC`. There are no default exports, no refs, no direct `localStorage` or `sessionStorage` access, no window events and no network calls in any of the nine. Only `ReflectionModal` has `useEffect`.
2. **Colours.** Markup is written with the dark-theme hex values as Tailwind arbitrary classes (`bg-[#15152A]`, `text-[#EDEDF5]`, `border-[#2E2E4A]` and so on), plus a few CSS custom properties through inline `style`. Light, night-reading and high-contrast modes work by remapping those exact class names in `src/index.css:79`–`226`, `:300`–`378` and `:433`–`545`. A class that has no remap rule, typically one with an unusual opacity suffix, keeps its dark value in every mode. Each section lists the ones found.
3. **`animate-fade-in` confines fixed overlays.** The keyframes end at `transform: translateY(0)` and the class uses `animation-fill-mode: forwards` (`src/index.css:261`–`273`). The element therefore keeps a transform after the animation, and an element with a transform is the containing block for `position: fixed` descendants. The roots of `HomeScreen`, `JournalScreen` and `ConsistencyScreen` carry the class and render `fixed inset-0` overlays inside themselves, so those overlays cover the screen's own box and scroll with the page instead of covering the viewport. **Observed** in each affected section. Overlays rendered by `App.tsx` directly are not affected.
4. **No dialog semantics.** None of the overlays sets `role="dialog"` or `aria-modal`, moves or traps focus, closes on Escape or on a backdrop click, or locks background scrolling.
5. **No reduced-motion handling.** Neither these files nor `src/index.css` contain a `prefers-reduced-motion` query; the only one in `src/` is in `src/landing/landing.css:118`.
6. **Breakpoints.** `src/index.css` has no `@theme` block, so Tailwind defaults apply: `sm` 640 px, `md` 768 px, `lg` 1024 px. The three tab screens share the same column: `max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto` with `pb-28` to clear the bottom tab bar.
7. **Text scaling.** Sizes are rem-based and follow the root font size set by the store (`src/lib/store.tsx:375`–`385`). `text-[10px]` and `text-[11px]` are converted to rem in `src/index.css:234`–`242`.
8. **Types are not checked.** `@types/react` and `@types/react-dom` are not declared (`package.json:13`–`35`) and are absent from `node_modules/@types`. `React.FC<Props>` therefore resolves to `any`, and `tsc --noEmit` exits 0 without checking props or JSX; with `--strict` added, the first error is `TS7016` on the `react` import at `src/App.tsx:1`. Two mismatches in this slice are a direct result: the `'ayah'` comparison in `HomeScreen` and the `boolean | null` value passed to `OnboardingScreen`.
9. **Rendering of user text.** All user-entered text is rendered as React text nodes. No file uses `dangerouslySetInnerHTML`.

Related documents: [01-overview-and-architecture.md](01-overview-and-architecture.md) for `App.tsx`, [02-state-and-persistence.md](02-state-and-persistence.md) for the store, [03-domain-logic.md](03-domain-logic.md) for dates and the Hijri calendar.

---

## HomeScreen.tsx

**Purpose.** The Home tab. It shows a greeting with today's Hijri date, a collapsible card with the daily inspiration (a verse or a hadith), and the blessing-of-the-day card with its verse, collapsible reflection notes, copy and share actions, and the button that opens the reflection flow.

**Mounted from.** `src/App.tsx:139`–`156`, when `activeTab === 'home'`.

**Exports.** `HomeScreen` (named, `React.FC<HomeScreenProps>`, `:20`). `HomeScreenProps` is not exported.

**Props.**

| Name | Type | Required | What it does |
|---|---|---|---|
| `blessing` | `Blessing` | yes | Content of the main card; also passed to `ShareCardModal`. `App` passes `todayBlessing` (`src/App.tsx:141`) |
| `inspiration` | `InspirationItem` | yes | Content of the inspiration card. `App` passes `todayInspiration` (`src/App.tsx:142`) |
| `isCompletedToday` | `boolean` | yes | Chooses between the start button and the "done" banner (`:311`) |
| `onStartReflection` | `() => void` | yes | Called by the start button (`:328`) and by «أعد الاستشعار» (`:318`). `App` sets `isReflecting` to true (`src/App.tsx:145`) |
| `tasbihCount` | `number` | yes (declared) | **Unused.** Declared at `:14`, not destructured at `:20`–`25`. `App` passes it (`src/App.tsx:144`) |
| `onOpenTasbih` | `() => void` | yes (declared) | **Unused.** Declared at `:16`. `App` passes a handler (`src/App.tsx:146`–`149`) |
| `onOpenHisn` | `(category?: HisnCategoryId) => void` | no | **Unused.** Declared at `:17`. `App` passes a handler (`src/App.tsx:150`–`154`) |

**Store / persistence.** No `useStore()` call, no storage keys, no window events. `ShareCardModal`, which this file renders, calls `useStore()` itself (`src/components/common/ShareCardModal.tsx:18`). Three DOM ids are looked up by the spotlight tour: `card-daily-inspiration` (`:71`), `card-today-blessing` (`:171`) and `btn-start-reflection` (`:327`), see `src/components/common/SpotlightTour.tsx:21`, `26`, `31`.

**Local state, refs, memos.**

| State | Initial | Drives |
|---|---|---|
| `showTadabbur` (`:26`) | `false` | The «تدبّر النعمة» section |
| `showInspiration` (`:27`) | `false` | Expanded or collapsed inspiration card, and its padding (`:73`) |
| `copiedBlessing` (`:28`) | `false` | Copy icon becomes a check mark for 2.2 s |
| `copiedInspiration` (`:29`) | `false` | Same, for the inspiration card |
| `shareModalData` (`:30`) | `{ open: false, type: 'ayah' }` | Whether `ShareCardModal` is shown and its starting content mode |

Computed on every render, not memoised: `hijriToday = getFormattedHijriDate()` (`:35`), and `showScholarName` (`:38`–`39`), which is true when `blessing.scholarQuote.scholar` is non-empty and does not start with «مستفاد», «مأثور» or «إشارة». In the shipped content 19 of 40 blessings have such a generic attribution, so their name line is hidden.

**Effects, timers, browser APIs.**

- No `useEffect`.
- `navigator.clipboard.writeText` in `handleCopyBlessingText` (`:44`) and `handleCopyInspirationText` (`:53`). Both are wrapped in `try { … } catch {}`, so a failure produces no feedback.
- `setTimeout(…, 2200)` resets the "copied" flag (`:46`, `:55`). The timers are not cleared on unmount.
- `Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura')` through `getFormattedHijriDate` (`src/lib/hijri.ts:14`).
- No external URLs.

Text placed on the clipboard for the blessing (`:42`):

```
«{title}»
{openingLine}

﴿{quran.textUthmani}﴾ [سورة {surahName} : {ayahNumber, Arabic-Indic digits}]

— تطبيق «الحمد»
```

and for the inspiration (`:51`):

```
«{text}»
({source})
— تطبيق «الحمد»
```

The source code would use `﴿{text}﴾` when `inspiration.type === 'ayah'`, but that value never occurs (see Notes).

**UI structure and behaviour.** Top to bottom:

1. **Greeting** (`:62`–`67`). «السلام عليكم» and an `h2` with the Hijri date, for example «٧ جمادى الآخرة ١٤٤٨ هـ» (observed).
2. **Inspiration card**, `GlassCard` with id `card-daily-inspiration` (`:70`–`148`).
   - The header row (`:75`–`132`) is a `div` with `role="button"`, `tabIndex={0}` and `aria-expanded`. A click, Enter or Space toggles `showInspiration`.
   - It shows a glowing gold dot, the label «حديث اليوم» when `type === 'hadith'` and «آية اليوم» otherwise (`:91`), and, while collapsed, a one-line truncated preview of the text (`:93`–`97`).
   - Three controls sit at the end of the row: a copy button (`title` «نسخ النص», `aria-label` «نسخ نص حديث اليوم», `:101`–`112`), a share button (`title` «مشاركة كبطاقة», `aria-label` «مشاركة حديث اليوم», `:113`–`124`), and a decorative chevron (`aria-hidden`, `:125`–`130`). Both buttons call `stopPropagation` so a mouse click does not toggle the card.
   - Expanded (`:135`–`147`): the text, centred, then `inspiration.source` as printed in the data.
3. **Divider** with the pill «نعمة اليوم» (`:151`–`159`).
4. **Blessing card**, `GlassCard` with id `card-today-blessing` and `borderAccent` (`:170`–`334`), over a blurred backdrop (`:164`–`168`).
   - Top row (`:176`–`208`): category pill (`blessing.categoryLabel`), a copy button (`aria-label` «نسخ نص النعمة») and a share button (`aria-label` «مشاركة النعمة») that opens `ShareCardModal` with `type: 'ayah'`.
   - `h1` with `blessing.title` (`:211`), then `blessing.openingLine` (`:216`).
   - Verse block (`:221`–`239`): `﴿{textUthmani}﴾` in the Quran font, then «سورة {surahName} : {ayahNumber}».
   - «تدبّر النعمة» toggle (`:243`–`252`). When open (`:254`–`307`) it shows, each only if present: «الحديث الشريف:» with `«{hadith.text}»` and `{hadith.source} ({hadith.grade})`; «وقفات في أثر النعمة:» with `blessing.tadabbur`; the scholar quote in straight double quotes and italics, followed by `— {scholar} ({work})` when `showScholarName`; and a «مشاركة» button that opens `ShareCardModal` with `type: 'tadabbur'`.
   - Call to action (`:311`–`333`). Not completed: button «استشعر النعمة» with id `btn-start-reflection`. Completed: a banner «حمدتَ اللهَ اليوم على هذه النعمة» with a check icon and a text button «أعد الاستشعار», which reopens the same flow.
5. **`ShareCardModal`** (`:338`–`344`) while `shareModalData.open`. Closing resets the state to `{ open: false, type: 'ayah' }`.

**Helpers / sub-components defined in the file.** `handleCopyBlessingText` (`:41`) and `handleCopyInspirationText` (`:50`). No sub-components.

**Styling.**

- Root: `w-full pb-28 pt-2 px-4 sm:px-6 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-6 animate-fade-in` (`:60`).
- Classes from `src/index.css`: `animate-fade-in` (`:60`, `:136`, `:255`), `font-ibm` (`:64`), `font-serif`, `font-quran` and `ayah-text` (`:137`, `:229`).
- Custom properties: `--border-hairline` (`:154`), `--bg-deepest` (`:166`), `--accent-stroke`, `--accent-text`, `--bg-raised` (`:180`–`182`), `--bg-sunken`, `--ayah-border` (`:224`–`225`), `--ayah-color` (`:230`). `GlassCard` adds `--bg-glass`, `--card-shadow` and the border colour (`src/components/common/GlassCard.tsx:27`–`29`).
- Hard-coded colours: `#AEAECB`, `#EDEDF5`, `#C7C4D8`, `#E4C368`, `#C8A951`, `#15152A`, `#1E1E38`, `#25232E`, `#2E2E4A`, `#6C63FF`, `#594DFF`, `black/20`, and the glow `rgba(228,195,104,0.8)` (`:89`).
- Animations are CSS only: `animate-fade-in`, colour transitions, `active:scale-95` and `active:scale-[0.98]`. The file does not import `motion`.
- Classes without a light-theme remap: `bg-[#15152A]/60` on the chevron (`:126`; observed as `rgba(21, 21, 42, 0.6)` in light mode) and `border-[#2E2E4A]/60` (`:136`, `:255`).
- The blessing card passes `pt-7 pb-7 px-6` in `className` (`:172`) while `GlassCard` also applies its default `p-5 sm:p-6` (`src/components/common/GlassCard.tsx:19`). Which wins at `sm` and above was not verified.

**Accessibility.**

- Present: `aria-expanded` on the inspiration header; `aria-label` on the four icon buttons; `aria-hidden` on decorative elements (`:127`, `:167`).
- The inspiration header nests two `<button>` elements inside an element with `role="button"`. Its `onKeyDown` (`:79`–`84`) does not check the event target and calls `preventDefault`. **Observed:** with focus on the nested share button, Enter and Space toggled the card (`aria-expanded` became `true`) and the share dialog did not open. The nested copy button is affected the same way, so both are mouse-only.
- The two `aria-label`s on the inspiration card always say «حديث اليوم», including on days when the card shows a verse (`:109`, `:121`; observed on a verse day).
- The «تدبّر النعمة» toggle has no `aria-expanded` (`:243`; observed `null`).
- Heading order: the date is an `h2` (`:64`) that precedes the page's `h1` (`:211`).
- The icon buttons in the inspiration header are 32 px (`w-8 h-8`).

**Notes and quirks.**

- **Verse styling is unreachable.** `InspirationItem.type` is `'quran' | 'hadith'` (`src/types.ts:89`, data in `src/data/inspirations.ts:2`). This file tests for `'ayah'` at `:51`, `:95`, `:137` and `:138`. The label at `:91` works because it tests for `'hadith'`. **Observed** on a verse day: label «آية اليوم», text wrapped in `«…»`, classes `font-serif text-[#EDEDF5]` instead of `font-quran ayah-text text-[#E4C368]`. The copied text has the same problem.
- **The inspiration share button shares the blessing.** It opens `ShareCardModal` with `blessing` and `type: 'ayah'` (`:117`); the modal has no inspiration input (`src/components/common/ShareCardModal.tsx:7`–`11`). **Observed:** the dialog opened from the inspiration card showed «نعمة الإسلام» and its verse.
- **Share dialog is confined to the Home column** (intro item 3). **Observed:** opened at scroll position 0, the overlay box was `y = 65, height = 970` in an 844 px viewport, below the top bar and under the bottom tab bar; opened after scrolling 167 px, the dialog's top edge was 14 px above the viewport.
- The three unused props mean Home has no shortcut to the Tasbih counter or Hisn Al-Muslim, although `App` wires handlers for both (`src/App.tsx:146`–`154`).
- `inspiration.source` is printed as stored, with Western digits for verses («النحل : 53», `src/data/inspirations.ts:41`), while the blessing's verse reference is converted to Arabic-Indic digits (`:236`).
- The scholar text is shown inside quotation marks (`:283`), but every `scholarQuote` in the content is a paraphrase (`attributionType: "paraphrase"` on 40 of 40 blessings in `src/data/blessings_ar.json`). The hadith grade is printed as stored (`:264`) although `gradeVerified` is `false` on all 40.
- `showScholarName` reads `blessing.scholarQuote.scholar` without a guard (`:38`), while the JSX guards `blessing.scholarQuote` (`:280`). If the object were missing, the component would throw before reaching the guard.
- After today's reflection is completed the element `btn-start-reflection` no longer exists, so a replayed tour has no target for its second step; the tour then clears its highlight rectangle (`src/components/common/SpotlightTour.tsx:44`–`54`).
- `App` always passes the `islam` blessing in the current code, because `welcomeSeen` never becomes true; see [02-state-and-persistence.md](02-state-and-persistence.md), section 1.5. The comment at `:37` refers to a rule "A4" in a specification that is not in the repository.

---

## ReflectionModal.tsx

**Purpose.** The guided reflection on one blessing. It walks through the blessing's `istisharSteps` one at a time, revealing each step's text sentence by sentence, then offers a journal field and a tap counter, then shows a short completion screen and reports completion to `App`. An optional countdown timer and a share button are available throughout.

**Mounted from.** `src/App.tsx:221`–`228`, while `isReflecting` is true. It is a sibling of `<main>`, so it is not inside any element with `animate-fade-in` and covers the viewport (observed: overlay box `0, 0, 390 × 844`).

**Exports.** `ReflectionModal` (named, `React.FC<ReflectionModalProps>`, `:24`). The module constant `TIMER_PRESETS` (`:18`) is not exported.

**Props.** All four are used.

| Name | Type | Required | What it does |
|---|---|---|---|
| `blessing` | `Blessing` | yes | Supplies `istisharSteps`, `duaa`, `journalPrompt`; passed to `ShareCardModal`. `App` passes `todayBlessing` |
| `onClose` | `() => void` | yes | Called by the X button (`:254`). `App` sets `isReflecting` to false |
| `onComplete` | `(journalText?: string) => void` | yes | Called 2.2 s after either finish button (`:171`–`173`). `App` runs `handleReflectionComplete` (`src/App.tsx:92`) |
| `triggerHaptic` | `(type?: 'light' \| 'medium' \| 'heavy' \| 'success') => void` | yes | Vibration feedback. `App` passes the store's function, which has a stable identity (`src/lib/store.tsx:257`) |

**Store / persistence.** None directly. Nothing is written until `onComplete` runs in `App`, which calls `markTodayCompleted()` and, when text was returned, `addJournalEntry(text)` (`src/App.tsx:94`–`97`). The tap counter and the timer are never persisted.

**Local state, refs, memos.**

| State | Initial | Drives |
|---|---|---|
| `currentStepIdx` (`:31`) | `0` | Which step is shown. `0 … steps.length − 1` are reflection steps; `steps.length` is the journal step |
| `sentenceIdx` (`:32`) | `0` | Index of the last revealed sentence of the current step |
| `canAdvance` (`:33`) | `false` | Enables the «التالي» button |
| `journalText` (`:34`) | `''` | Journal textarea |
| `dhikrCount` (`:35`) | `0` | Tap counter on the journal step |
| `showAcceptedOverlay` (`:36`) | `false` | Completion screen |
| `showTimerPanel` (`:39`) | `false` | Timer panel open |
| `timerDuration` (`:40`) | `60` | Selected preset, seconds |
| `timerRemaining` (`:41`) | `60` | Seconds left |
| `isTimerRunning` (`:42`) | `false` | Starts and stops the countdown effect |
| `timerCompleted` (`:43`) | `false` | "Finished" texts in the panel |
| `showShareModal` (`:44`) | `false` | `ShareCardModal` |

Derived on each render: `steps = blessing.istisharSteps || []` (`:46`), `currentStep` (`:47`), `isJournalStep = currentStepIdx === steps.length` (`:48`), `sentences` (`:51`–`56`), `timerProgress`, `circleRadius = 42`, `circleCircumference`, `strokeDashoffset` (`:188`–`191`).

`sentences` is `currentStep.text.split(/(?<=[.،؟!…])\s+/)`, trimmed, empty parts removed (`:53`). The split points are whitespace after a full stop, an Arabic comma, an Arabic question mark, an exclamation mark or an ellipsis, so clauses separated by «،» count as separate "sentences".

**Effects, timers, browser APIs.**

1. **Countdown** (`:68`–`84`), dependencies `[isTimerRunning, triggerHaptic]`. While running, a `setInterval` of 1,000 ms decrements `timerRemaining`. When the value reaches 1 or less it sets `isTimerRunning` false, `timerCompleted` true, fires the `success` haptic and stores 0. These side effects are inside the `setTimerRemaining` updater (`:72`–`80`). The interval is cleared on cleanup.
2. **Pacing** (`:113`–`141`), dependencies `[currentStepIdx, isJournalStep, showAcceptedOverlay, sentences.length, currentStep?.durationSec]`. It does nothing on the journal step or once the completion screen shows. Otherwise it resets `sentenceIdx` to 0 and `canAdvance` to false, then:
   - a `setInterval` of 2,800 ms reveals one more sentence per tick; on the tick after the last sentence it sets `canAdvance` true and clears itself;
   - a `setTimeout` of `(currentStep.durationSec || 12) × 1000` ms sets `canAdvance` true and reveals every sentence.
   Both are cleared on cleanup.
3. `setTimeout(…, 2200)` in `handleFinishJournal` (`:171`), not cleared on unmount.

Other APIs: vibration through `triggerHaptic` only. No audio, speech, canvas or clipboard here; sharing is delegated to `ShareCardModal`. No external URLs.

Haptic calls: `light` on next (`:158`), on share (`:279`), on opening the timer panel (`:293`), on a preset (`:87`), on play/pause (`:95`), on reset (`:106`) and on each counter tap; `heavy` on every 100th tap (`:179`–`183`); `success` when the timer ends (`:76`) and when the flow is finished (`:169`).

**UI structure and behaviour.**

*Frame* (`:243`–`246`). `fixed inset-0 z-50`, a column with `justify-between`, `overflow-y-auto`, background per step with a 700 ms colour transition. A `StarLattice` sits behind the content (`:248`).

*Header* (`:251`–`317`), three items in one row:

- X button, `aria-label` «إغلاق الاستشعار» (`:253`–`259`). It calls `onClose` at any point, including on the journal step, without confirmation.
- Centre: `ThreadProgress` with `currentStep = currentStepIdx + 1` and `totalSteps = steps.length`, width 130 (`:263`–`267`); on the journal step, a pill «خاتمة الاستشعار» instead (`:269`–`271`).
- «مشاركة» button (`aria-label` «مشاركة النعمة», `:276`–`288`) opening `ShareCardModal` with `type="tadabbur"` (`:589`–`595`), and the timer button (`aria-label` «مؤقت خلوة التدبر الاختياري», `:290`–`315`). The timer button shows «مؤقت التدبر» at `sm` and above; once the timer runs or has been partly used it shows the remaining time at every width.

*Timer panel* (`:320`–`442`), shown and hidden with `AnimatePresence`:

- Title «خلوة تدبر واسترخاء (اختياري)» and a status line: «اختر مدة للتأمل الهادئ» when idle, «تنفّس بعمق واستشعر النعمة...» when running, «اكتمل وقت الخلوة بسلام» when finished (`:338`–`342`).
- Three presets from `TIMER_PRESETS`: «دقيقة واحدة» (60 s), «٣ دقائق» (180 s), «٥ دقائق» (300 s). Choosing one sets duration and remaining time and **starts the countdown immediately** (`:86`–`92`).
- A ring (SVG, radius 42, `:380`–`401`) with the remaining time as `M:SS` in Arabic-Indic digits in the centre, plus «تمّ بحمد الله» when finished (`:409`–`416`).
- Play/pause (`aria-label` «بدء المؤقت» or «إيقاف مؤقت», `:422`–`428`): toggles running; when the remaining time is 0 it restarts from the selected duration (`:94`–`103`). Reset (`aria-label` «إعادة ضبط المؤقت», `:429`–`435`): stops and restores the selected duration.
- The timer is independent of the steps. It keeps running across steps and does not gate anything.

*Reflection steps* (`:447`–`474`), one per entry in `istisharSteps`:

| `step.type` | Chip (`:451`–`455`) | Background (`:144`–`155`) | Lattice opacity (`:248`) |
|---|---|---|---|
| `ground` | «التهيئة والحضور» | `#15152A` | 0.045 |
| `visualize` | «تخيّل الغياب» | `#111126` | 0.045 |
| `deepen` | «إدراك أثر النعمة» | `#0C0C1C` | 0.015 |
| `return` | «العودة بالحمد» | `#15152A` | 0.045 |
| `hamd` | «الحمد والشكر» | `#15152A` | 0.045 |

- Content: the chip, then the text built from `sentences.slice(0, sentenceIdx + 1).join(' ')` in a block with `min-h-[170px]` (`:459`–`463`). On the `hamd` step a card «دعاء اليوم:» with `«{blessing.duaa}»` is added (`:466`–`473`).
- Timing: the first sentence shows at once, and one more appears every 2.8 s. The bottom button is disabled until `canAdvance`. With *n* sentences it becomes enabled after *n* × 2.8 s, or after `durationSec`, whichever comes first.
- Button (`:559`–`569`): «التالي», or «الحمد لله» on the `hamd` step. `handleNext` (`:157`–`165`) moves to the next step, and from the last step to the journal step.
- Shipped content: every one of the 40 blessings has exactly five steps in the order above, with `durationSec` 10, 20, 20, 15, 15 (80 s in total). Because the gate is usually reached through the sentence count, the time before all five buttons are enabled is 33.6 s to 47.6 s depending on the blessing, 40.8 s on average (computed from `src/data/blessings_ar.json`). **Observed** for the `islam` blessing, whose steps have 2, 2, 3, 4 and 1 sentences: the button became enabled 5.3, 5.3, 8.1, 10.9 and 2.5 s after a poll that started about 0.3 s into each step, which matches *n* × 2.8 s.

*Journal step* (`:477`–`552`), shown when `currentStepIdx === steps.length`:

- Heading «سجل الحمد» and `blessing.journalPrompt`, or the fallback «دوّن ما فاض به قلبك من شكرٍ لله على هذه النعمة:» (`:483`).
- A three-row textarea with placeholder «اكتب حمدك...» (`:489`–`495`).
- «تسبيح ختامي»: a round button showing «الحمد لله» and the tap count (`:501`–`550`). A ring fills by one hundredth per tap and is full on each multiple of 100 (`:530`–`532`).
- Buttons (`:572`–`583`): the primary reads «حفظ في سجل الحمد» when the textarea has non-blank text, otherwise «إتمام», and calls `handleFinishJournal(true)`. The secondary reads «لاحقًا» and calls `handleFinishJournal(false)`.
- `handleFinishJournal` (`:167`–`174`) shows the completion screen, fires the `success` haptic and, after 2.2 s, calls `onComplete` with the trimmed text, or with `undefined` when `saveText` is false or the text is blank.

*Completion screen* (`:194`–`240`), a separate early return: `StarLattice`, `CompletionParticles count={36}`, two expanding rings, a check mark, the heading «تقبل الله منكم» and the line «جعل الله هذا اليوم شاهدًا لك بالحمد والشكر.». It has no controls. It is removed when `App` unmounts the modal.

**Observed** end to end: after the five steps, five taps on the counter and «لاحقًا», the completion screen appeared, then Home showed the "done" banner and today's date had been added to `alhamd_completed_reflections`. No journal entry was added, and `alhamd_tasbih_count` was untouched.

**Helpers / sub-components defined in the file.** `formatArabicTime(totalSec)` (`:59`–`65`), a local function that formats seconds as `M:SS` in Arabic-Indic digits. It has the same name as, but different behaviour from, `formatArabicTime` in `src/lib/arabic.ts:12`, which this file does not import. `handleSelectPreset`, `toggleTimerRunning`, `resetRelaxTimer`, `getStepBgClass`, `handleNext`, `handleFinishJournal`, `handleDhikrTap`. No sub-components.

**Styling.**

- Classes from `src/index.css`: `animate-fade-in` (`:196`, `:448`, `:467`, `:477`), `animate-scale-up` (`:217`), `font-serif`.
- Custom properties: `--accent-stroke` (`:207`, `:394`, `:526`), `--cta-bg` (`:214`), `--ayah-border` (`:375`), `--border-hairline` (`:386`, `:517`), `--text-primary` (`:405`, `:546`), `--accent-text` (`:412`, `:540`), `--bg-raised` and `--raised-shadow` (`:505`–`506`).
- Hard-coded colours: `#15152A`, `#111126`, `#0C0C1C`, `#1E1E38`, `#2E2E4A`, `#6C63FF`, `#594DFF`, `#C8A951`, `#E4C368`, `#EDEDF5`, `#AEAECB`, `white/5`, `white/10`, and shadows `rgba(108,99,255,0.4)` (`:217`) and `rgba(200,169,81,0.2)` (`:298`).
- `motion` usage: the two completion rings (scale 0.8 → 2.1 and 0.9 → 1.65, fading out, repeating forever, `:202`–`215`); heading and line fade up with delays 0.15 s and 0.3 s (`:222`–`237`); the timer panel animates opacity, `y` and height over 0.28 s (`:322`–`326`); a "breathing" halo behind the ring while the timer runs (scale 0.92 → 1.12 → 0.92 over 4 s, repeating, `:373`–`378`).
- CSS transitions: 500 ms on the text block, 700 ms linear on the timer ring, 300 ms on the counter ring.
- Breakpoints: `sm` only (padding, font sizes, timer label, panel layout).
- Classes without a light-theme remap: `hover:bg-[#2E2E4A]` on the reset button (`:431`) and `hover:bg-white/10` (`:255`, `:282`).

**Accessibility.**

- Present: `aria-label` on the X, share, timer, play/pause and reset buttons; `title` on share and timer; `ThreadProgress` exposes `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` (`src/components/common/ThreadProgress.tsx:25`–`28`); the next button uses the native `disabled` attribute.
- Missing (observed): no `role` or `aria-modal` on the frame; focus stays on `<body>` when the modal opens; Escape does nothing.
- The text that appears sentence by sentence is not in a live region. A screen-reader user is not told when more text appears or when the button becomes available.
- The pacing cannot be skipped. A user who reads faster, or who cannot use the timing, has to wait for the gate on every step.
- The textarea has a placeholder but no label. The counter button's accessible name is its text, «الحمد لله» plus the count.
- Four animations repeat indefinitely with no reduced-motion alternative.

**Notes and quirks.**

- «لاحقًا» does not postpone anything. Both finish buttons end in `onComplete`, and `App` marks the day complete either way; the only difference is whether text is saved.
- The tap counter is local. It is not added to the Tasbih counter and is lost when the modal closes.
- Closing with X on the journal step discards typed text without a prompt.
- If a blessing had no steps, `isJournalStep` would be true from the start and the modal would open on the journal step.
- Latent defect in the pacing effect: the fallback timeout does not clear the sentence interval (`:132`–`135`). If a step had at least `floor(durationSec / 2.8) + 3` sentences, the next interval tick after the fallback would set `sentenceIdx` back to a smaller value and the visible text would shrink. No shipped step meets that condition (the longest is 7 sentences at 15 s).
- The `animate-fade-in` container for reflection steps (`:448`) is the same element across steps, so the fade plays once, not on each step.
- The regular expression uses a lookbehind. The production build emits it as `new RegExp("(?<=[.،؟!…])\\s+")`, so on an engine without lookbehind support the error would be thrown when this component first renders, and the app has no error boundary. Not tested on such an engine.
- `TIMER_PRESETS[].shortLabel` (`:19`–`21`) is never read.
- `triggerHaptic` is called inside state updaters at `:76` and `:179`–`183`. With `StrictMode` on (`src/main.tsx:7`), development builds call updaters twice, so those haptics fire twice in development.
- One finished reflection triggers the `success` haptic up to four times: here (`:169`), in `App` (`src/App.tsx:93`), in `markReflectionCompleted` (`src/lib/store.tsx:556`) and, when text is saved, in `addJournalEntry` (`src/lib/store.tsx:506`).
- The comment at `:30` numbers the steps 0–4, 5 and 6; the completion screen is a boolean, not a step index.

---

## OnboardingScreen.tsx

**Purpose.** The first-run introduction. Four slides explain the idea of the app; the last one adds two switches (daily reminder, anonymous statistics). Finishing or skipping calls `onComplete`.

**Mounted from.** `src/App.tsx:81`–`87`, as the only rendered content while `onboardingCompleted` is false (`src/App.tsx:78`). It is wrapped in a `div` that carries the theme classes (`src/App.tsx:80`).

**Exports.** `OnboardingScreen` (named, `React.FC<OnboardingScreenProps>`, `:16`).

**Props.** All five are used.

| Name | Type | Required | What it does |
|---|---|---|---|
| `onComplete` | `() => void` | yes | Called by «تخطي» (`:80`) and by the button on the last slide (`:68`). `App` passes `completeOnboarding` |
| `notificationsEnabled` | `boolean` | yes | State of the reminder switch |
| `onToggleNotifications` | `(enabled: boolean) => void` | yes | `App` passes `setNotificationsEnabled` |
| `analyticsConsent` | `boolean` | yes | State of the statistics switch. `App` passes the store value, which is `boolean \| null` and is `null` until the user toggles it (`src/lib/store.tsx:125`–`128`) |
| `onToggleAnalytics` | `(enabled: boolean) => void` | yes | `App` passes `setAnalyticsConsent` |

**Store / persistence.** No direct access. Through the callbacks: `completeOnboarding` writes `alhamd_onboarded = 'true'` and fires the `success` haptic (`src/lib/store.tsx:400`–`404`); `setNotificationsEnabled` writes `alhamd_notif_enabled` and fires the `light` haptic (`src/lib/store.tsx:471`–`475`); `setAnalyticsConsent` writes `alhamd:analytics_consent` (`src/lib/store.tsx:421`–`424`).

**Local state, refs, memos.** `slide` (`:23`), initial `0`, the index of the visible slide. The `slides` array (`:25`–`58`) is rebuilt on each render. Derived: `currentSlide`, `IconComponent`, `isLastSlide` (`:60`–`62`).

**Effects, timers, browser APIs.** None. No `useEffect`, timers, storage or URLs.

**UI structure and behaviour.**

*Frame* (`:73`): `fixed inset-0 z-50 bg-[#15152A]`, a column with `justify-between`, `select-none`, over a `StarLattice` at 4 % opacity (`:75`).

*Header* (`:78`–`92`): «تخطي» (calls `onComplete` from any slide), a `ThreadProgress` with `currentStep = slide + 1` of 4 and width 120, and a small `BrandMark` without its thread.

*Slide body* (`:95`–`164`): an icon tile, the title (`h2`), the body paragraph and a highlight card.

| # | Icon | Title | Body | Highlight |
|---|---|---|---|---|
| 1 | `Sparkles`, gold | «الحمد موقف، لا كلمة» | «كم من نعمةٍ ألِفناها حتى نسينا شكرها؟ الحمد يبدأ حين نرى ما اعتدنا أن نغفل عنه.» | «نعمةٌ واحدة كلَّ يوم — بهدوءٍ وتؤدة.» |
| 2 | `Heart`, violet | «من المعرفة إلى الشعور» | «لا نعدّ النعم، بل نستشعرها: نتخيّل غيابها، لندرك أثرها، فيفيض اللسان بالحمد صادقاً.» | «خمس دقائق هادئة تغيّر نظرتك ليومك.» |
| 3 | `Bell`, gold | «بلا سلاسل، بلا مقارنة» | «لا نقاط، ولا منافسة، ولا رسائل تُشعرك بالذنب. وردٌ هادئ بينك وبين ربك — إن فاتك يوم، فاليوم التالي ينتظرك.» | «القليل الدائم خيرٌ من الكثير المنقطع.» |
| 4 | `ShieldCheck`, emerald | «سجلك، خصوصيتك» | «كل ما تكتبه يبقى على جهازك فقط. لا حسابات، لا خوادم، لا أحد يرى ما بينك وبين الله.» | «بياناتك في أمانٍ تام على هاتفك.» |

*Switches*, only when `slide === 3` (`:119`–`163`):

- «تذكير يومي هادئ (٩:٠٠ م)» with a switch bound to `notificationsEnabled` (`:126`–`139`). **Observed:** on a clean profile it is on (`aria-checked="true"`), because the store default is on.
- «إحصاءات تحسين مجهولة» with a switch bound to `analyticsConsent` (`:147`–`160`). **Observed:** on a clean profile it is off and has no `aria-checked` attribute, because the value is `null`.

*Button* (`:185`–`234`), id `onboarding-cta-btn`: «التالي» on slides 1–3, «ابدأ» with a left arrow on slide 4. `handleNext` (`:64`–`70`) advances the slide or calls `onComplete`. There is no way back to an earlier slide.

After `onComplete`, `App` re-renders into the main layout on the Home tab, where the spotlight tour starts (`src/App.tsx:261`). **Observed** after «تخطي» on slide 2: `alhamd_onboarded` is `'true'`; `alhamd:analytics_consent`, `alhamd_notif_enabled` and `alhamd_notif_time` were never written.

**Helpers / sub-components defined in the file.** `handleNext`. No sub-components.

**Styling.**

- Classes from `src/index.css`: `animate-fade-in` (`:95`), `font-serif`, `font-sans`.
- Hard-coded colours: `#15152A`, `#1E1E38`, `#2E2E4A`, `#EDEDF5`, `#C7C4D8`, `#AEAECB`, `#E4C368`, `#C8A951`, `#6C63FF`, `#5A50FF`, Tailwind `emerald-400` and `emerald-500`, `white/10`, `white/20`. No custom properties are used directly; `StarLattice`, `ThreadProgress` and `BrandMark` use `--text-primary`, `--border-hairline` and `--accent-stroke`.
- `motion` usage: a "breathing" aura behind the button on the last slide (opacity 0.35 → 0.75 → 0.35, scale 0.98 → 1.025 → 0.98, 2.8 s, repeating, `:170`–`182`); the button pulses on the last slide (scale 1 → 1.018 → 1 with a changing box shadow, 2.8 s, repeating, `:189`–`209`), and has `whileHover` (scale 1.025, `y: -2`) and `whileTap` (scale 0.98).
- CSS: a light sheen slides across the button on hover (`:222`–`225`); the arrow shifts on hover (`:231`).
- Breakpoints: `sm` only (padding, icon tile 96 → 112 px, title and body sizes).
- The button gradient `from-[#6C63FF] via-[#5A50FF] to-[#6C63FF]` (`:188`) has no light-theme remap, so it would stay violet in light mode. A first run always starts in dark mode (`src/lib/store.tsx:130`–`134`).

**Accessibility.**

- Present: both switches have `role="switch"` and `aria-checked`; the aura is `aria-hidden`.
- The switches have no accessible name: no `aria-label`, no `aria-labelledby`, and the visible text is a sibling `span` (observed: name `null` on both).
- The statistics switch has no `aria-checked` while consent is `null` (observed).
- The root is `select-none`, so slide text cannot be selected.
- The frame has no scrolling. **Observed** at 360 × 560 px on the last slide: content height 565 px in a 560 px frame, the bottom of the second switch at y = 488 and the top of the button at y = 487. Shorter viewports or a larger text size would overlap or clip.
- «تخطي» measured 47 × 24 px.
- Two animations repeat indefinitely on the last slide.

**Notes and quirks.**

- The condition for the switches is the literal `slide === 3` (`:119`), not `isLastSlide`.
- The reminder label hard-codes «٩:٠٠ م». It matches the store default `'21:00'` (`src/lib/store.tsx:173`), but the component does not receive the stored time.
- Neither switch does more than store a flag. No code schedules a reminder (see [01-overview-and-architecture.md](01-overview-and-architecture.md)); the statistics flag only gates a local event log (`src/lib/analytics.ts:20`–`46`).
- The slide body carries `animate-fade-in` but has no `key`, so the same element is reused. **Observed:** after «التالي» the animation stayed in state `finished`; the fade plays on the first slide only.
- The slide copy lives in this file. `APP_STRINGS.onboarding` (`src/constants/strings.ts:20`–`56`) defines five differently worded slides and is not used here or anywhere else in `src/`.
- The second slide promises «خمس دقائق هادئة». The reflection flow can be finished in well under one minute (see `ReflectionModal`), the tour strings say «٣ دقائق» (`src/constants/strings.ts:68`) and the content declares 80 s per blessing.
- The third slide says «بلا سلاسل»; `ConsistencyScreen` shows a count of consecutive days.
- `Check` is imported and not used (`:3`). The comment at `:94` refers to `ref-02-onboarding.png`, one of the design reference images.

---

## ComposeBlessingModal.tsx

**Purpose.** A form for adding a personal blessing: a name, three optional reflective answers and a category.

**Mounted from.** `src/components/screens/JournalScreen.tsx:478`–`483`, while `isComposeOpen` is true.

**Exports.** `ComposeBlessingModal` (named, `React.FC<ComposeBlessingModalProps>`, `:20`).

**Props.** Both are used.

| Name | Type | Required | What it does |
|---|---|---|---|
| `onClose` | `() => void` | yes | Called by «رجوع» (`:55`) and after a successful save (`:46`) |
| `onSave` | `(data: { title; prompt1; prompt2; prompt3; category: string }) => void` | yes | Receives the trimmed values. `JournalScreen` passes `onAddUserBlessing`, which is the store's `addUserBlessing` |

**Store / persistence.** `useStore()` for `triggerHaptic` only (`:24`). Saving goes through `onSave`; `addUserBlessing` prepends the record, which is persisted under `alhamd:userBlessings:v1` (`src/lib/store.tsx:515`–`533`, `:392`–`394`).

**Local state, refs, memos.**

| State | Initial | Drives |
|---|---|---|
| `title` (`:25`) | `''` | «ما النعمة؟» input |
| `prompt1`, `prompt2`, `prompt3` (`:26`–`28`) | `''` | The three textareas |
| `category` (`:29`) | `CATEGORIES[0].label`, «نعم الدين» | Selected category pill. The stored value is the Arabic label, not the key |
| `error` (`:30`) | `''` | Validation message |

**Effects, timers, browser APIs.** None.

**UI structure and behaviour.**

- Frame (`:50`): `fixed inset-0 z-50 bg-[#15152A] overflow-y-auto animate-fade-in`.
- Sticky header (`:52`–`74`): «رجوع» with a right chevron, the title `APP_STRINGS.composeTitle` («نعمة جديدة»), and a text button «حفظ».
- Intro (`:79`–`84`): «نِعَمي» and «دوّن نعمةً خاصةً بك، واستشعر قيمتها.».
- Error box (`:86`–`90`), shown when `error` is set.
- Card 1 (`:93`–`107`): label «ما النعمة؟», text input with placeholder «مثال: صوت المطر على نافذتي». Typing clears the error.
- Cards 2–4 (`:110`–`164`): a numbered badge (١, ٢, ٣), a label and a three-row textarea with placeholder «اكتب تأملك هنا...». The labels are «متى شعرتَ بهذه النعمة آخر مرة؟», «تخيَّل أسبوعًا كاملًا بلا هذه النعمة… ماذا يتغيّر؟» and «بكلماتك أنت: علامَ تحمد الله الآن؟» (`src/constants/strings.ts:93`–`95`).
- Category (`:167`–`187`): label «التصنيف (اختياري):» and one pill for each of the eight `CATEGORIES`.
- Bottom button «حفظ النعمة» (`:190`–`195`).

Save flow (`handleSave`, `:32`–`47`), used by both save buttons:

1. If the trimmed title is empty: `medium` haptic, error «يرجى كتابة اسم النعمة أولًا», stop.
2. Otherwise: `success` haptic, `onSave` with trimmed values and the category label, then `onClose`.

The new blessing appears at the top of the «نِعَمي» list.

**Helpers / sub-components defined in the file.** `handleSave`. No sub-components.

**Styling.**

- Classes from `src/index.css`: `animate-fade-in` (`:50`), `font-serif`.
- Hard-coded colours: `#15152A`, `#1E1E38`, `#2E2E4A`, `#EDEDF5`, `#AEAECB`, `#C8A951`, `#6C63FF`, `#594DFF`, Tailwind `red-400` and `red-500` for the error box. Cards are `GlassCard`s.
- Breakpoints: `sm` only. Content column `max-w-lg` with `pb-28`.
- No `motion` usage; `active:scale-[0.98]` on the bottom button.

**Accessibility.**

- The five `<label>` elements have no `htmlFor` and the fields have no `id`, so labels are not associated with their fields (observed: 5 labels, 0 with `for`).
- The error box has no `role="alert"` or live region (observed), and focus is not moved to the field.
- The category pills do not expose their selected state (`aria-pressed` or radio semantics).
- No dialog semantics, focus handling or Escape (intro item 4).

**Notes and quirks.**

- **The modal does not cover the screen** (intro item 3): it is rendered inside the Journal root, which has `animate-fade-in` (`src/components/screens/JournalScreen.tsx:123`). **Observed** at 390 × 844 px: the box was `y = 65, height = 584`, exactly the Journal root; the top bar stayed visible above it, the bottom tab bar below it, and the form scrolled inside the 584 px box. At 1280 × 800 px the box was the 768 px content column (`x = 256`), 548 px tall, with a native scrollbar on its left edge.
- The label says the category is optional, but one is always selected and cannot be cleared.
- «رجوع» closes without asking, discarding anything typed.
- There are no length limits on any field.
- The `success` haptic fires twice on save, here (`:38`) and in `addUserBlessing` (`src/lib/store.tsx:531`).
- The intro text is written inline although `APP_STRINGS.composeSubtitle` holds the same sentence (`src/constants/strings.ts:89`).
- Cards 2–4 are three copies of the same markup.
- A saved blessing cannot be edited later: nothing calls the store's `updateUserBlessing`.
- The comment at `:51` refers to `ref-05-compose.png`, one of the design reference images.

---

## JournalScreen.tsx

**Purpose.** The Journal tab. One segment lists journal entries grouped by day, with search, category filter and a quick-entry form. The other lists the user's personal blessings and opens the compose form.

**Mounted from.** `src/App.tsx:162`–`171`, when `activeTab === 'journal'`.

**Exports.** `JournalScreen` (named, `React.FC<JournalScreenProps>`, `:37`).

**Props.** All six are used.

| Name | Type | Required | What it does |
|---|---|---|---|
| `entries` | `JournalEntry[]` | yes | Journal entries, newest first as stored |
| `userBlessings` | `UserBlessing[]` | yes | Personal blessings |
| `onDeleteEntry` | `(id: string) => void` | yes | Store `deleteJournalEntry` |
| `onAddUserBlessing` | `(data) => void` | yes | Store `addUserBlessing`; forwarded to `ComposeBlessingModal` |
| `onDeleteUserBlessing` | `(id: string) => void` | yes | Store `deleteUserBlessing` |
| `onToggleFavoriteBlessing` | `(id: string) => void` | yes | Store `toggleFavoriteUserBlessing` |

**Store / persistence.** In addition to the props, the component reads `addJournalEntry`, `triggerHaptic` and `todayBlessing` from `useStore()` (`:45`). Data flow is therefore mixed: deleting goes through props, adding a journal entry goes straight to the store. Persistence is done by the store under `alhamd_journal` and `alhamd:userBlessings:v1`. Browser API: `window.confirm` before both kinds of deletion (`:349`, `:431`).

**Local state, refs, memos.**

| State | Initial | Drives |
|---|---|---|
| `segment` (`:46`) | `'journal'` | Which list is shown, and the page title and subtitle |
| `searchQuery` (`:47`) | `''` | Text filter |
| `selectedCategory` (`:48`) | `'الكل'` | Category filter |
| `monthOffset` (`:49`) | `0` | Month label only |
| `isComposeOpen` (`:50`) | `false` | `ComposeBlessingModal` |
| `isQuickJournalOpen` (`:51`) | `false` | Quick-entry form |
| `quickJournalTitle`, `quickJournalText` (`:52`–`53`) | `''` | Quick-entry fields |
| `quickJournalCategory` (`:54`) | `CATEGORIES[0].label` | Quick-entry category |

| Memo | Depends on | Result |
|---|---|---|
| `targetDate` (`:74`–`78`) | `monthOffset` | Today moved by `monthOffset` Gregorian months with `setMonth` |
| `monthInfo` (`:80`) | `targetDate` | `getHijriMonthAndYear(targetDate)`; only `.full` is used |
| `filteredJournalEntries` (`:83`–`94`) | `entries`, `searchQuery`, `selectedCategory` | Entries whose `text` or `shortTitle` contains the query (after `toLowerCase`) and whose `categoryLabel` equals the selected category |
| `groupedEntries` (`:97`–`105`) | `filteredJournalEntries` | Object keyed by the entry's `displayDate`, else its `date`, else the literal «اليوم», in first-seen order |
| `filteredUserBlessings` (`:108`–`120`) | `userBlessings`, `searchQuery`, `selectedCategory` | Blessings whose `title`, `prompt3` or `body` contains the query and whose `category` matches |

**Effects, timers, browser APIs.** No `useEffect` or timers. `window.confirm`; `Intl.DateTimeFormat` through `getHijriMonthAndYear` (`src/lib/hijri.ts:58`); `Date` through `formatTimestampArabicTime` (`src/lib/arabic.ts:31`). No URLs.

**UI structure and behaviour.**

1. **Title block** (`:125`–`135`). Journal segment: «سجل الحمد» and «كل ما حمدتَ اللهَ عليه… في مكانٍ واحد.». Personal segment: «نِعَمي» and «نعمٌ خاصة بحياتك دوّنتها بنفسك لتستشعر قيمتها.».
2. **Segment switcher** (`:138`–`165`): «سجل الحمد» and «نِعَمي ({count})», where the count is the unfiltered `userBlessings.length`. Each press fires a `light` haptic.
3. **Journal tools**, journal segment only (`:168`–`309`):
   - Month row (`:171`–`197`): a right-pointing chevron with `aria-label` «الشهر القادم» that adds 1 to `monthOffset`, the label `monthInfo.full` (for example «جمادى الآخرة ١٤٤٨»), and a left-pointing chevron with `aria-label` «الشهر السابق» that subtracts 1.
   - Search input, placeholder «ابحث في تأملاتك...» (`:200`–`209`).
   - Category pills in a horizontally scrolling row: «الكل» and the eight categories (`:212`–`242`).
   - Quick entry (`:245`–`307`). Collapsed: a button «دوّن تأملاً جديداً في سجل الحمد». Expanded: a card titled «تدوين تأمل جديد» with «إلغاء», a title input (placeholder «عنوان النعمة (افتراضي: {todayBlessing.shortTitle})»), a textarea (placeholder «اكتب ما استشعرته من حمدٍ وامتنان...»), a category `<select>` and a submit button «حفظ التأمل».
4. **Journal list**, journal segment only (`:312`–`377`):
   - Empty: a card with «سجلّك ما زال فارغًا...» and «ابدأ بنعمة اليوم واستشعر أثرها ودوّن حمدك ليحفظ هنا.». It is shown whenever the filtered list is empty.
   - Otherwise one group per date key: an `h3` with the key, then one card per entry (id `journal-card-{entry.id}`) with a gold-outlined chip (`نعمة {shortTitle}`, or the category label when there is no short title), a delete button (`aria-label` «حذف التأمل»), the text, and the time of `createdAt` in 12-hour Arabic form.
5. **Personal list**, personal segment only (`:380`–`475`):
   - Button «دوّن نعمة جديدة», which opens the compose form.
   - Empty: «لم تدوّن نِعَمًا شخصية بعد» and «اضغط على الزر أعلاه لتدوين نعمة خاصة بك والإجابة عن أسئلة الاستشعار الثلاثة.». It is shown whenever the filtered list is empty.
   - Otherwise one card per blessing: category pill, title, a star button (`title` «تفضيل» or «إلغاء التفضيل») and a delete button (`title` «حذف»); then each non-empty answer under a fixed caption: «متى شعرتَ بها آخر مرة؟», «لو غابت هذه النعمة... ماذا يتغيّر؟», «علامَ تحمد الله الآن؟»; then «أضيفت في {time}».
6. **`ComposeBlessingModal`** (`:478`–`483`).

Flows:

- **Quick entry** (`handleSaveQuickJournal`, `:56`–`71`). Blank text: `medium` haptic and nothing else (observed: the form stays open and no message appears). Otherwise: `success` haptic, then `addJournalEntry({ shortTitle: title or todayBlessing.shortTitle, categoryLabel, text })`; the title and text fields are cleared and the form closes. The store fills in `blessingId` with today's blessing id and builds `displayDate` from the weekday and Hijri day and month (`src/lib/store.tsx:477`–`508`). **Observed:** a new group «الثلاثاء ٧ جمادى الآخرة» appeared at the top with the chip «نعمة الإسلام».
- **Delete entry.** `window.confirm('هل تود حذف هذا التأمل من سجلك؟')`, then `onDeleteEntry(id)`.
- **Delete personal blessing.** `window.confirm('هل تود حذف هذه النعمة؟')`, then `onDeleteUserBlessing(id)`.
- **Favourite.** Toggles `isFavorite`; the star is filled gold when set. Favourites are not sorted or filterable.

**Helpers / sub-components defined in the file.** `handleSaveQuickJournal`. No sub-components.

**Styling.**

- Classes from `src/index.css`: `animate-fade-in` (`:123`, `:258`), `no-scrollbar` (`:212`), `font-serif`, `font-sans`.
- Hard-coded colours: `#EDEDF5`, `#AEAECB`, `#C7C4D8`, `#C8A951`, `#E4C368`, `#6C63FF`, `#594DFF`, `#1E1E38`, `#15152A`, `#25232E`, `#252547`, `#2E2E4A`, `black/20`, Tailwind `red-400`. No custom properties directly; cards are `GlassCard`s.
- Breakpoints: `sm`, `md`, `lg` for the column width; `sm` for sizes.
- No `motion` usage. `active:scale-98` on the add button (`:385`).
- Classes without a light-theme remap: `text-[#AEAECB]/70` on the «أضيفت في» line (`:468`; observed as `rgba(174, 174, 203, 0.7)` on the cream light background), `hover:bg-[#252547]` and `border-[#6C63FF]/45` on the quick-entry button (`:252`), `text-[#C8A951]/60` on the empty-state icons (`:316`, `:393`).

**Accessibility.**

- Present: `aria-label` on the two month buttons and on the journal delete button; `title` on the star and both delete buttons.
- The journal delete button is `opacity-0` until the card is hovered (`:353`). **Observed** at 390 px: computed opacity `0`. On touch devices and for keyboard focus it is invisible, though still operable.
- The star and the personal-blessing delete button have a `title` but no `aria-label`; the star does not expose its state.
- The search input, the two quick-entry fields and the `<select>` have no label, only placeholders.
- The segment switcher and the category pills do not expose which option is selected.
- Heading order goes from `h1` (`:126`) to `h3` (`:328`).
- Small targets: month buttons 32 px (`:177`), delete icon 16 px with 4 px padding (`:353`).

**Notes and quirks.**

- **The month row does not filter anything.** `monthOffset` feeds only the label (`:74`–`80`, `:184`); `filteredJournalEntries` does not use it. **Observed:** after six presses of «الشهر السابق» both entries were still listed.
- The label is computed by moving the Gregorian month and formatting the result as Hijri, so it can skip or repeat Hijri months. **Observed:** six presses back from «جمادى الآخرة ١٤٤٨» showed «ذو القعدة ١٤٤٧», which is seven Hijri months earlier.
- The arrows have the opposite meaning to the ones in `ConsistencyScreen`: here the right-pointing chevron is "next month", there it is "previous month" (`src/components/screens/ConsistencyScreen.tsx:311`–`321`).
- **Hidden filters apply to «نِعَمي».** The search box and pills are rendered only on the journal segment, but `searchQuery` and `selectedCategory` also filter the personal list. **Observed:** with a search that matches nothing, the personal segment showed the tab label «نِعَمي (١)» together with «لم تدوّن نِعَمًا شخصية بعد», with no visible control to clear the filter.
- The journal empty state says the journal is empty even when entries exist and the filter simply matches none (observed).
- Search is a plain substring test. Arabic diacritics are not normalised, so «اتصلت» does not find the seeded text «اتصلتُ بها اليوم…».
- A custom quick-entry title is still prefixed with «نعمة» in the chip (`:343`), and the entry is linked to today's blessing id whatever the title says.
- `quickJournalCategory` is not reset after saving.
- «أضيفت في» shows a time of day only, with no date (`:469`).
- The captions on personal-blessing cards (`:447`, `:454`, `:461`) are shorter rewordings of the questions asked in the compose form (`src/constants/strings.ts:93`–`95`).
- A fresh profile is not empty: the store seeds two journal entries with fixed display dates and one personal blessing (see [02-state-and-persistence.md](02-state-and-persistence.md), section 1.4). **Observed** group headings on a clean profile: «الأحد ٢٥ ذو الحجة» and «السبت ٢٤ ذو الحجة», on 7 Jumada II 1448.
- The `success` haptic fires twice on a quick-entry save (`:62` and `src/lib/store.tsx:506`).
- The cast at `:333` is unnecessary. Comments at `:124`, `:311` and `:477` refer to the design reference images `ref-03-journal.png` and `ref-05-compose.png`.

---

## ConsistencyScreen.tsx

**Purpose.** The Consistency tab («المداومة»). It summarises completed reflection days as two totals and a 7-day chart, embeds the category charts, shows a Hijri month calendar with completed days marked, and holds the daily-reminder switch and time.

**Mounted from.** `src/App.tsx:173`–`181`, when `activeTab === 'consistency'`.

**Exports.** `ConsistencyScreen` (named, `React.FC<ConsistencyScreenProps>`, `:27`). The module constant `ARABIC_WEEKDAYS_SHORT` (`:25`) is not exported.

**Props.** All five are used.

| Name | Type | Required | What it does |
|---|---|---|---|
| `completedDays` | `string[]` (`YYYY-MM-DD`) | yes | Dates on which a reflection was completed. Store `completedDays` |
| `notificationsEnabled` | `boolean` | yes | Reminder switch state |
| `notificationTime` | `string` (`HH:mm`) | yes | Reminder time shown and edited |
| `onToggleNotifications` | `(enabled: boolean) => void` | yes | Store `setNotificationsEnabled` |
| `onChangeNotificationTime` | `(time: string) => void` | yes | Store `setNotificationTime` |

**Store / persistence.** No `useStore()` call. The callbacks write `alhamd_notif_enabled` and `alhamd_notif_time` (`src/lib/store.tsx:466`–`475`). The embedded `ReflectionCategoryCharts` reads the store itself.

**Local state, refs, memos.**

| State | Initial | Drives |
|---|---|---|
| `monthOffset` (`:34`) | `0` | Which Hijri month the calendar shows |
| `selectedDay` (`:35`) | `null` | Day shown in the detail box. Reset to `null` on every month change |
| `isTimePickerOpen` (`:36`) | `false` | Time dialog |

| Memo | Depends on | Result |
|---|---|---|
| `calendarData` (`:39`–`41`) | `monthOffset` | `generateMonthCalendar(new Date(), monthOffset)`: `monthTitle`, `monthName`, `year`, `days`, `startPadding` |
| `completedInThisMonthCount` (`:44`–`46`) | `calendarData.days`, `completedDays` | Number of days of the shown month present in `completedDays` |
| `monthCompletionPercentage` (`:48`–`51`) | the count and the month length | Rounded percentage, capped at 100 |
| `reflectionStats` (`:54`–`104`) | `completedDays` | `totalBlessings`, `currentStreak`, `chartData` |
| `activeDayToReview` (`:110`–`115`) | `selectedDay`, `calendarData.days` | The selected day if it belongs to the shown month; otherwise today's cell; otherwise the first day |

How `reflectionStats` is computed:

- `totalBlessings` is the number of distinct dates in `completedDays`.
- `toIso(d)` is `d.toISOString().split('T')[0]`, the **UTC** date (`:58`).
- `getStreakAtDate(date)` counts back one day at a time while the date is in the set (`:60`–`68`).
- `currentStreak` starts from today when today is completed, otherwise from yesterday when yesterday is completed, otherwise it is 0 (`:75`–`79`). A streak therefore survives until a whole day has been missed.
- `chartData` has seven points, from six days ago to today (`:85`–`97`). `name` is «اليوم» for today and otherwise the full Arabic weekday name from `d.getDay()` (local time); `total` is the cumulative count of completed dates up to that day; `streak` is the streak ending on that day, or 0 when that day is not completed.

Constants: `weekdayLetters` «س ح ن ث ر خ ج», Saturday first (`:107`), and `weekdayFullNames`, Saturday first (`:108`), indexed by `HijriCalendarDay.weekdayIndex` (`src/lib/hijri.ts:88`).

**Effects, timers, browser APIs.** No `useEffect` or timers. `Intl.DateTimeFormat` through `generateMonthCalendar` (`src/lib/hijri.ts:98`, `:124`). `recharts` renders SVG. A native `<input type="time">`. No URLs.

**UI structure and behaviour.**

1. **Title** (`:120`–`127`): «المداومة» and «وردٌ هادئ تحاسب به نفسك — لا سباق، ولا مقارنة بأحد.».
2. **Statistics card** (`:130`–`272`): heading «إحصائيات التدبر» with the note «آخر ٧ أيام».
   - Two tiles (`:142`–`181`): «إجمالي النعم المتدبَّرة» with `totalBlessings`, and «أيام التدبر المتتالية» with `currentStreak`, a flame icon and the unit «يوم» for 1 and «أيام» for every other number. Both are all-time figures; only the chart is limited to seven days.
   - Area chart (`:184`–`271`) in a 176 px high box with `dir="ltr"`, so time runs left to right. Two series: `total` («إجمالي النعم») and `streak` («الأيام المتتالية»). The Y axis shows whole numbers in Arabic-Indic digits. A custom tooltip shows the day name, «إجمالي النعم:» and «الأيام المتتالية:».
   - **Observed** on a clean profile: total «٣» and streak «٢ أيام», produced by the three seeded days.
3. **`<ReflectionCategoryCharts />`** with no props (`:275`).
4. **Calendar card** (`:278`–`467`):
   - Header: «التقويم الهجري للتدبر» and «مراجعة الإنجاز الشهري وأيام التدبر المميزة». When `monthOffset !== 0`, a button «الشهر الحالي» resets the offset and the selection (`:293`–`306`).
   - Month row (`:310`–`340`): a right-pointing chevron (`aria-label` «الشهر الهجري السابق», offset − 1), the title `calendarData.monthTitle` (for example «جمادى الآخرة ١٤٤٨ هـ»), a left-pointing chevron (`aria-label` «الشهر الهجري القادم», offset + 1). There is no limit in either direction.
   - Weekday header and a seven-column grid: `startPadding` empty cells, then one button per day (`:359`–`400`). Pressing a day selects it, including future days.
   - Day appearance, in priority order (`:378`–`384`): today, violet ring; completed, gold tint; future, faded number; otherwise plain. Below the number: a glowing gold dot when completed, a small violet dot when it is today and not completed (`:391`–`397`). The selected cell has a darker background and a gold ring (`:369`–`371`).
   - Legend (`:404`–`413`): «يوم تم فيه التدبر» and «اليوم الحالي».
   - Detail box (`:416`–`466`): the weekday and `hijriFullLabel`, «الموافق {gregorianLabel}», and a status chip: «تم التدبر», «يوم قادم» or «لم يُسجَّل تدبر». Then «إنجاز شهر {monthName}:» with «{n} من {days} يومًا ({percent}٪)» and a progress bar.
5. **Reminder card** (`:470`–`506`): a switch (`aria-label` «تبديل التذكير اليومي») and a clickable block with «التذكير اليومي», the time from `formatArabicTime(notificationTime)` and a bell icon. Clicking the block opens the time dialog.
6. **Time dialog** (`:509`–`529`): heading «وقت التذكير اليومي», an uncontrolled `<input type="time">` with `defaultValue={notificationTime}` whose every change calls `onChangeNotificationTime` at once, and a button «تم» that closes the dialog. There is no cancel.

**Helpers / sub-components defined in the file.** `toIso` and `getStreakAtDate` inside the `reflectionStats` memo; the inline tooltip renderer (`:220`–`249`). No sub-components.

**Styling.**

- Classes from `src/index.css`: `animate-fade-in` (`:118`, `:510`), `font-serif`.
- Custom properties: `--bg-sunken` and `--border-hairline` on tiles and the detail box (`:146`–`147`, `:164`–`165`, `:419`–`420`); in the chart, `--accent-stroke`, `--cta-bg`, `--border-hairline`, `--text-muted`, `--bg-raised`, `--text-primary`, `--accent-text` (`:192`–`264`).
- SVG gradient ids `totalBlessingsGrad` and `streakDaysGrad` (`:191`, `:195`) are document-global.
- Hard-coded colours: `#EDEDF5`, `#AEAECB`, `#C8A951`, `#E4C368`, `#6C63FF`, `#594DFF`, `#15152A`, `#1E1E38`, `#25232E`, `#252547`, `#2E2E4A`, `black/70`, and glows `rgba(228,195,104,0.95)` and `rgba(228,195,104,0.9)`.
- Breakpoints: `sm`, `md`, `lg` for the column; `sm` for sizes.
- No `motion` usage. CSS transitions on the switch (200 ms) and the progress bar (500 ms).
- Classes without a light-theme remap: `bg-[#252547]/90` on the selected day (`:370`), `text-[#AEAECB]/45` on future days (`:383`), `border-[#2E2E4A]/70` (`:280`, `:459`), `hover:bg-[#15152A]/60` (`:371`), `border-[#C8A951]/35` (`:436`). **Observed** in light mode: the selected cell, which is today by default, had background `rgba(37, 37, 71, 0.9)` behind a digit coloured `rgb(42, 31, 25)`, dark on dark; future-day digits were `rgba(174, 174, 203, 0.45)` on a cream page.

**Accessibility.**

- Present: `role="switch"`, `aria-checked` and `aria-label` on the reminder switch; `aria-label` on the month buttons; each day button has `aria-label` «{hijriFullLabel} - تم التدبر» or «… - لم يتم التدبر».
- Day buttons do not expose which day is selected or which is today.
- The block that opens the time dialog is a `div` with `onClick` (`:489`–`492`): not focusable, no role, no keyboard handler. Keyboard users cannot open the time dialog.
- The time input has no label; the heading above it is not associated with it.
- The weekday header is single letters with no expanded names.
- The chart has no text alternative besides the two tiles.
- Dialog semantics are missing (intro item 4); a backdrop click does not close the dialog.

**Notes and quirks.**

- **The time dialog opens off screen** (intro item 3). The overlay is rendered inside the root, which has `animate-fade-in` (`:118`), so it covers the whole page column and centres the dialog in it. **Observed:** with the reminder card scrolled into view (scroll position 1,768 px in a 2,612 px page) the overlay box was `y = −1703, height = 2571` and the dialog was at `y = −515`, entirely above the viewport. The user sees only the dimmed, blurred page and has to scroll up to find the dialog.
- **Local and UTC dates are mixed.** Calendar cells are keyed by the local date (`src/lib/hijri.ts:203`–`206`); completions are stored under the UTC date (`src/lib/store.tsx:551`); `isToday` compares a local cell with the UTC date (`src/lib/hijri.ts:191`); this file's `toIso` is UTC while its weekday labels are local (`:58`, `:93`). East of UTC the marks land on the previous day's cell between local midnight and the UTC offset. See [03-domain-logic.md](03-domain-logic.md).
- Clearing the time field stores an empty string. **Observed:** `alhamd_notif_time` became `""` and the label under «التذكير اليومي» went blank; the store falls back to `21:00` on the next load (`src/lib/store.tsx:173`).
- The switch and the time are stored and displayed only. No code schedules or sends a reminder.
- The screen shows a streak with a flame icon, while the onboarding and the About dialog describe the app as «بلا سلاسل».
- The unit after the streak is «أيام» for every value except 1, which gives forms such as «٢ أيام» and «١١ أيام».
- `calendarData` is memoised on `monthOffset` only, so a session left open past midnight keeps the old "today".
- `recharts` is imported statically (`:3`–`11`) and ends up in the single main bundle.
- Comments at `:471` and `:488` call the switch the "left side" and the label the "right side". In the RTL layout the switch, as first child, renders on the right (observed in the screenshot).
- `ARABIC_WEEKDAYS_SHORT` holds full weekday names despite its name.

---

## AboutModal.tsx

**Purpose.** A static "about" dialog: wordmark, tagline, three short statements of principle, links to the two other information dialogs, and a version line.

**Mounted from.**

- `src/App.tsx:242`–`248`, while `isAboutOpen` is true. Opened from the top bar (`src/App.tsx:133`) and the desktop navigation bar (`src/App.tsx:124`).
- `src/components/screens/SettingsScreen.tsx:763`–`769`, while that screen's `modalType === 'about'`.

**Exports.** `AboutModal` (named, `React.FC<AboutModalProps>`, `:12`).

**Props.** All three are used.

| Name | Type | Required | What it does |
|---|---|---|---|
| `onClose` | `() => void` | yes | X button (`:23`) |
| `onOpenContentReview` | `() => void` | yes | «عن المحتوى والمراجعة العلمية» (`:86`). In `App` it sets `isReviewOpen` without closing this dialog (`src/App.tsx:245`); in Settings it replaces this dialog (`src/components/screens/SettingsScreen.tsx:766`) |
| `onOpenPrivacyPolicy` | `() => void` | yes | «سياسة الخصوصية» (`:94`). Same two behaviours |

**Store / persistence.** None.

**Local state, refs, memos.** None.

**Effects, timers, browser APIs.** None.

**UI structure and behaviour.**

- Backdrop (`:18`): `fixed inset-0 z-50`, `bg-black/75`, blurred. Panel (`:19`): `max-w-md`, `max-h-[92vh]`, scrolls internally.
- Header (`:21`–`31`): X button (`aria-label` «إغلاق») and the caption «عن التطبيق».
- Identity (`:34`–`42`): `BrandMark` at size 40 with its thread, «نعمةٌ كلَّ يوم», and «من المعرفة إلى الشعور» in guillemets.
- Three cards (`:45`–`81`):
  - «الحمد موقف لا كلمة»: «لا نعدّ النعم فحسب، بل نستشعر قيمتها عبر تخيّل غيابها ليصدق الحمد في القلب قبل اللسان.»
  - «هادئ بلا سلاسل»: «لا نقاط، ولا منافسة، ولا رسائل ذنب. ورد هادئ تحاسب به نفسك، والقليل الدائم خير من الكثير المنقطع.»
  - «خصوصية تامة على جهازك»: «بلا تسجيل دخول ولا خوادم. تأملاتك وسجلك محفوظ بأمان على هاتفك وحدك.»
- Links (`:84`–`100`): «عن المحتوى والمراجعة العلمية», and «سياسة الخصوصية» with the note «محلية بالكامل».
- Version line (`:103`–`107`): «الإصدار ١.٠.٠ • متاح الآن».

Opened from `App`, the content-review or privacy dialog stacks on top of this one (same `z-50`, later in the DOM), and closing it returns to this dialog (observed). Opened from Settings, the dialogs replace each other and closing returns to Settings.

**Helpers / sub-components defined in the file.** None.

**Styling.** `animate-fade-in` on the backdrop; `font-serif`; `BrandMark` uses `--text-primary` and `--accent-stroke`; cards are `GlassCard`s. Hard-coded colours: `#15152A`, `#1E1E38`, `#25232E`, `#2E2E4A`, `#EDEDF5`, `#AEAECB`, `#E4C368`, `#C8A951`, `#6C63FF`, Tailwind `emerald-400` and `emerald-500`. Breakpoint `sm` for panel padding. No `motion` usage.

**Accessibility.** The X button has `aria-label` «إغلاق». The dialog title is a `span`, and the cards use `h4` with no higher heading. No dialog semantics, focus handling, Escape or backdrop close (intro item 4; observed `role` `null`).

**Notes and quirks.**

- The version text is hard-coded and does not match `package.json:4`, which says `0.0.0`.
- The tagline repeats `APP_STRINGS.tagline` as a literal (`:37`, `src/constants/strings.ts:3`).
- The link text «عن المحتوى والمراجعة العلمية» opens a dialog titled «عن المحتوى والتوثيق».
- Mounted from `App` the dialog covers the viewport (observed: `0, 0, 390 × 844`). Mounted from Settings it is inside a root with `animate-fade-in` (`src/components/screens/SettingsScreen.tsx:160`). **Observed** when opened from the link near the bottom of Settings (scroll position 1,506 px): the overlay was the 2,446 px Settings column and the dialog sat at `y = −596 … 160`, mostly above the viewport. `ContentReviewModal` and `PrivacyPolicyModal` are mounted the same way there.
- The second card repeats the "no streaks" statement that `ConsistencyScreen` does not follow.
- The third card says «ولا خوادم». User data is indeed not sent anywhere by the code, but the page itself loads its fonts from Google's servers (`index.html:12`–`14`).

---

## ContentReviewModal.tsx

**Purpose.** A static dialog that states the review status of the religious content and how verses, hadiths and scholars' sayings are sourced.

**Mounted from.** `src/App.tsx:251`–`253`, while `isReviewOpen`; `src/components/screens/SettingsScreen.tsx:771`–`773`, while `modalType === 'review'`.

**Exports.** `ContentReviewModal` (named, `React.FC<ContentReviewModalProps>`, `:10`).

**Props.**

| Name | Type | Required | What it does |
|---|---|---|---|
| `onClose` | `() => void` | yes | X button (`:16`) |

**Store / persistence.** None. It does not read the content data.

**Local state, refs, memos.** None.

**Effects, timers, browser APIs.** None.

**UI structure and behaviour.**

- Backdrop (`:12`) and panel (`:13`) as in `AboutModal`, with `bg-black/80`.
- Header (`:14`–`24`): X button (`aria-label` «إغلاق») and `h2` «عن المحتوى والتوثيق».
- Status box (`:28`–`36`), amber, with a clock icon: «حالة المحتوى: قيد المراجعة العلمية» and «تخضع نصوص النعم والأحاديث للمراجعة والتدقيق الشرعي لضمان أعلى درجات التثبت.».
- Three cards (`:38`–`57`):
  - «الآيات القرآنية»: «جميع الآيات منقولة بالنص العثماني المعتمد من مجمع الملك فهد لطباعة المصحف الشريف، مع ذكر رقم الآية واسم السورة بدقة.»
  - «الأحاديث النبوية»: «نقتصر على الأحاديث الصحيحة والحسنة المخرجة في كتب السنة المعتمدة كصحيحي البخاري ومسلم، مع عزو كل حديث إلى مصدره.»
  - «أقوال العلماء والتدبر»: «كُتبت وقفات التدبّر بعناية لتقريب معاني النعم، ونُقلت أقوال أهل العلم كابن القيم وابن الجوزي وغيرهم مع ذكر المصدر أو التصريح بما هو مستفاد.»
- Footer (`:60`–`64`): «إجمالي النعم المعتمدة في التطبيق: ٤٠ نعمة».

**Helpers / sub-components defined in the file.** None.

**Styling.** `animate-fade-in` on the backdrop; `GlassCard`s. Hard-coded colours: `#15152A`, `#1E1E38`, `#2E2E4A`, `#EDEDF5`, `#AEAECB`, `#C7C4D8`, `#E4C368`, Tailwind `amber-200`, `amber-300`, `amber-400`, `amber-500`. No breakpoints, no `motion`.

**Accessibility.** X button with `aria-label` «إغلاق»; the title is an `h2`, the cards use `h4`. The status box is not announced in any special way. No dialog semantics (intro item 4).

**Notes and quirks.**

- Every statement is hard-coded. The status badge is not derived from `reviewStatus`, and the number 40 is the literal `toArabicNumerals(40)` (`:62`). It currently equals the number of blessings in `src/data/blessings_ar.json`.
- The text is stronger than the data supports. In `src/data/blessings_ar.json` all 40 blessings have `reviewStatus: "pending_review"`, `quran.verified: false`, `hadith.gradeVerified: false`, and `scholarQuote.attributionType: "paraphrase"` with `verifiedVerbatim: false`. The file's own `contentNote` says the Quranic script still has to be matched against a trusted source and the hadiths still have to be traced. The first card nevertheless says all verses are taken from the King Fahd Complex text, and the footer calls the 40 blessings «المعتمدة» (approved) directly under a badge that says they are under review.
- `CheckCircle2` is imported and not used (`:2`).
- In Settings it is mounted the same way as `AboutModal`, inside the animated root, so the same placement problem applies. That case was not observed separately.

---

## PrivacyPolicyModal.tsx

**Purpose.** A static dialog with the privacy policy: local storage, manual backup, optional statistics.

**Mounted from.** `src/App.tsx:256`–`258`, while `isPrivacyOpen`; `src/components/screens/SettingsScreen.tsx:775`–`777`, while `modalType === 'privacy'`.

**Exports.** `PrivacyPolicyModal` (named, `React.FC<PrivacyPolicyModalProps>`, `:9`).

**Props.**

| Name | Type | Required | What it does |
|---|---|---|---|
| `onClose` | `() => void` | yes | X button (`:15`) |

**Store / persistence.** None.

**Local state, refs, memos.** None.

**Effects, timers, browser APIs.** None.

**UI structure and behaviour.**

- Backdrop (`:11`) and panel (`:12`), `max-w-lg`, as in the other two dialogs.
- Header (`:13`–`23`): X button (`aria-label` «إغلاق») and `h2` «سياسة الخصوصية».
- Headline with a shield icon (`:26`–`29`): «بياناتك بينك وبين الله، لا تغادر جهازك».
- Introduction (`:31`–`33`): «نحن نحترم خصوصيتك التامة ونلتزم بحمايتها. صُمم تطبيق «الحمد» ليكون مساحة عبادة وتفكّر آمنة، دون أي حسابات أو خوادم تجمع بياناتك الشخصية.»
- Three cards (`:35`–`54`):
  - «١. تخزين محلي على جهازك»: «جميع ما تكتبه في «سجل الحمد» وفي «نِعَمي»، وسجل أيام المداومة، يُخزّن محلياً على ذاكرة جهازك وحدك. لا نملك أي وسيلة للاطلاع على ما تدونه.»
  - «٢. النسخ الاحتياطي والاستعادة»: «النسخ الاحتياطي يتم يدوياً عن طريق تصدير ملف مشفّر نصياً تحتفظ به بنفسك أينما أردت، ويمكنك استرجاعه في أي وقت بضغطة زر.»
  - «٣. الإحصاءات التحسينية (اختيارية)»: «في حال موافقتك، تُجمع بيانات استخدام تقنية مجهولة الهوية تماماً (مثل فتح التطبيق أو إتمام جولة الاستشعار) بهدف تحسين استقرار التطبيق فقط، دون جمع أي نصوص أو معلومات شخصية إطلاقاً.»
- Last line (`:56`–`58`): «آخر تحديث: سبتمبر ٢٠٢٦ م • ربيع الأول ١٤٤٨ هـ».

**Helpers / sub-components defined in the file.** None.

**Styling.** `animate-fade-in` on the backdrop; `GlassCard`s. Hard-coded colours: `#15152A`, `#1E1E38`, `#2E2E4A`, `#EDEDF5`, `#AEAECB`, `#C7C4D8`, Tailwind `emerald-400`. Breakpoint `sm` for panel padding. No `motion`.

**Accessibility.** X button with `aria-label` «إغلاق»; `h2` title, `h4` card headings. No dialog semantics (intro item 4).

**Notes and quirks.** How each statement compares with the code:

- **Local storage.** Matches. Journal, personal blessings and completed days are kept in `localStorage` only, and `src/` contains no `fetch`, `XMLHttpRequest` or `sendBeacon` call.
- **Backup.** The text describes the exported file as «مشفّر نصياً». The export is `JSON.stringify(payload, null, 2)` (`src/lib/store.tsx:604`) saved as a `.json` file (`src/components/screens/SettingsScreen.tsx:108`–`113`): readable text, not encrypted, and it contains the journal.
- **Statistics.** The only analytics code is `trackJourneyEvent` (`src/lib/analytics.ts:15`). It records five `journey_*` event types, keeps the last 50 in `localStorage` under `alhamd:analytics_events_log` and sends nothing. There is no "app opened" or "reflection completed" event, which are the two examples the policy gives.
- **"No servers".** The app document requests fonts from `fonts.googleapis.com` and `fonts.gstatic.com` on every load (`index.html:12`–`14`). The policy does not mention it.
- The "last updated" line is a hard-coded string.
- In Settings it is mounted the same way as `AboutModal`, inside the animated root, so the same placement problem applies. That case was not observed separately.
