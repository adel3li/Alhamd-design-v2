# Overview and architecture

State of the code at commit `68e723a` (`main`, 2026-11-16). Line references are `path:line` against that commit.

## 1. What the product is

Alhamd (الحمد, "all praise") is an Arabic-only, right-to-left, mobile-first web app for daily gratitude in an Islamic context. Its tagline is «نعمةٌ كلَّ يوم» ("a blessing every day").

The product makes four promises, repeated in onboarding, the landing page and the README:

| Promise | Where it is stated | How the code is meant to honour it |
|---|---|---|
| One blessing per day, the same for everyone | `src/constants/strings.ts:63`, landing page | `src/lib/dailyLogic.ts` picks a blessing from the calendar date |
| No streaks, points or comparison («لا نِقاط، ولا سلاسل») | `src/constants/strings.ts:43` | Journey never locks or resets progress (`src/lib/journeyStore.ts:219`) |
| No account, nothing leaves the device | `src/constants/strings.ts:54` | No network calls for user data; everything is in `localStorage` |
| Sacred text is reviewed before it is trusted | `src/data/blessings_ar.json` `contentNote` | `reviewStatus` fields on every blessing and journey text |

[FINDINGS.md](../FINDINGS.md) lists where the current code does not match these promises.

## 2. Stack

| Layer | Choice | Version resolved by `bun.lock` |
|---|---|---|
| UI | React, React DOM | 19.3.1 (`^19.0.1` in `package.json`) |
| Language | TypeScript | ~5.8.2 |
| Build | Vite | 6.4.4 (`^6.2.3`) |
| Package manager | Bun (`bun.lock`); npm also works | Bun 1.x |
| Styling | Tailwind CSS v4 through `@tailwindcss/vite`, configured in CSS (no `tailwind.config`) | ^4.1.14 |
| Animation | `motion` (Framer Motion) | ^12.23.24 |
| Charts | `recharts` | 3.10.1 |
| Icons | `lucide-react` | ^0.546.0 |
| Fonts | Google Fonts: IBM Plex Sans Arabic, Noto Naskh Arabic, Amiri, Amiri Quran, Tajawal | loaded in `index.html:14` |
| Hosting | Vercel, static output | `vercel.json` |

Declared in `package.json` but imported by nothing in `src/` or `vite.config.ts`: `@google/genai`, `express`, `dotenv`, `@types/express`, `autoprefixer`, `esbuild`, `tsx`. They are leftovers of the Google AI Studio project template (see `metadata.json`, `.env.example`).

There is no test runner, no linter other than `tsc --noEmit`, no formatter config and no CI workflow in the repository. Since `d3dfd92` the React type packages are installed and `strict` is on, so that check covers component props and JSX; before, it did not (see [11](11-build-and-deployment.md), section 2).

## 3. Repository map

| Path | What it is |
|---|---|
| `index.html` | App entry document. `lang="ar" dir="rtl"`, classes `dark theme-dark`, viewport with `user-scalable=no`, Google Fonts link, mounts `/src/main.tsx` |
| `landing/index.html` | Landing-page entry document, mounts `/src/landing/main.tsx` |
| `src/` | All current application code (see section 4) |
| `public/assets/aistudio/` | 10 design-reference images and 2 static HTML design sheets. Everything here is copied into the production build |
| `.aistudio/` | Google AI Studio working files: 10 PNGs that are byte-for-byte copies of images in `public/assets/aistudio/` |
| `legacy/` | The previous version of the app (v1), kept for reference. Not built, not imported, excluded in `tsconfig.json:27`. See [12-legacy-v1.md](12-legacy-v1.md) |
| `docs/` | README screenshots, this documentation, the history report |
| `package.json`, `bun.lock` | Dependencies and scripts (`dev`, `build`, `preview`, `clean`, `lint`) |
| `vite.config.ts` | Two HTML entries, React and Tailwind plugins, `@` alias to the repo root, AI Studio HMR switch |
| `tsconfig.json` | ES2022, `moduleResolution: bundler`, `jsx: react-jsx`, `noEmit`; `strict` is **not** enabled |
| `vercel.json` | Host-based routing between landing page and app |
| `metadata.json`, `.env.example` | AI Studio applet metadata and template env file; neither is read by the app |
| `README.md` | Public project README |

## 4. Source map

54 TypeScript files, 14,393 lines of TS/TSX, 692 lines of CSS, 3,531 lines of JSON content.

| Folder | Files | Lines | Contents | Documented in |
|---|---:|---:|---|---|
| `src/App.tsx`, `src/main.tsx` | 2 | 284 | Shell, tab switching, modal flags | this file |
| `src/types.ts` | 1 | 230 | All shared types | [02](02-state-and-persistence.md) |
| `src/lib/` | 7 | 1,817 | Store, journey logic, daily logic, Hijri, Arabic formatting, entitlements, analytics | [02](02-state-and-persistence.md), [03](03-domain-logic.md) |
| `src/constants/` | 3 | 179 | Strings, categories, tokens | [04](04-content-and-data.md), [05](05-design-system.md) |
| `src/data/` | 6 | 439 + JSON | Blessings, journey content, adhkar, inspirations, dhikr, loader | [04](04-content-and-data.md) |
| `src/index.css` | 1 | 548 | Tailwind import, themes, utilities | [05](05-design-system.md) |
| `src/components/layout/` | 3 | 243 | Top bar, bottom tab bar, desktop nav | [06](06-layout-and-shared-components.md) |
| `src/components/common/` | 8 | 1,831 | Share card, charts, particles, tour, brand mark, cards | [06](06-layout-and-shared-components.md) |
| `src/components/screens/` | 15 | 5,841 | Home, reflection, onboarding, journal, consistency, tasbih, Hisn, settings, paywall, info modals | [07](07-screens-core.md), [08](08-screens-worship-settings-paywall.md) |
| `src/components/journey/` | 7 | 2,837 | Premium journey | [09](09-journey.md) |
| `src/landing/` | 5 | 836 | Marketing page | [10](10-landing-page.md) |

## 5. Runtime architecture

```
index.html
  └─ src/main.tsx            createRoot(#root) inside <StrictMode>
       └─ App                src/App.tsx:268
            └─ StoreProvider src/lib/store.tsx:111   one React Context, all state, persisted to localStorage
                 └─ MainAppContent  src/App.tsx:23
                      ├─ OnboardingScreen            when onboardingCompleted is false
                      └─ shell
                           ├─ DesktopNavBar (md and up) / TopBar (below md)
                           ├─ <main>: exactly one of HomeScreen, JourneyPathScreen, JournalScreen,
                           │          ConsistencyScreen, TasbihModal (inline), SettingsScreen
                           ├─ BottomTabBar (below md)
                           └─ overlays: PremiumPaywallScreen, ReflectionModal, TasbihModal,
                                        AboutModal, ContentReviewModal, PrivacyPolicyModal,
                                        SpotlightTour, CompletionParticles
```

There is no router, no URL state and no code splitting. The whole app is one JavaScript chunk (see [11-build-and-deployment.md](11-build-and-deployment.md)). Reloading the page always returns to the Home tab.

### 5.1 `App.tsx` in detail

`MainAppContent` (`src/App.tsx:23`) reads 28 values from `useStore()` and owns ten pieces of local UI state:

| State | Type | Initial | Purpose |
|---|---|---|---|
| `activeTab` | `TabId` | `'home'` | Which screen `<main>` renders |
| `tasbihSubView` | `'counter' \| 'hisn'` (`TasbihSubView`) | `'counter'` | Which half of the Tasbih tab opens |
| `hisnCategory` | `HisnCategoryId \| undefined` | `undefined` | Category to open Hisn Al-Muslim on |
| `isReflecting` | boolean | false | Shows `ReflectionModal` |
| `showCelebrationParticles` | boolean | false | Shows `CompletionParticles` for 3.2 s |
| `isTasbihOpen` | boolean | false | Shows `TasbihModal` as an overlay. Nothing ever sets it to true (`src/App.tsx:60`), so that branch (`src/App.tsx:231`) is dead |
| `isAboutOpen`, `isReviewOpen`, `isPrivacyOpen` | boolean | false | The three information modals |
| `showJourneyPaywall` | boolean | false | Shows `PremiumPaywallScreen` |

Behaviour:

- **Tab change** (`handleTabChange`, `src/App.tsx:66`). Selecting `journey` while `getDeveloperPremiumSync()` is false opens the paywall instead of changing tab. Selecting `tasbih` resets the sub-view to the counter. Since `b8db9cc` the journey is free: `PAYWALL_ENABLED` in `src/lib/entitlements.ts` is false, so the tab always opens the journey and `App` never renders the paywall.
- **Onboarding gate** (`src/App.tsx:78`). While `onboardingCompleted` is false only `OnboardingScreen` is rendered, wrapped in a div that carries the theme classes.
- **Reflection completion** (`handleReflectionComplete`, `src/App.tsx:92`). Fires the `success` haptic, calls `markTodayCompleted()`, calls `markWelcomeSeen()` when the reflection was the welcome one (since `d3dfd92`), adds a journal entry when the user wrote text, closes the modal and shows particles for 3,200 ms.
- **Root classes** (`src/App.tsx:105`–`116`). `theme-light` or `theme-dark` with hard-coded background and text colours, plus `text-scale-normal|large|xlarge` derived from `textSize`.
- **Home shortcuts** (`src/App.tsx:146`–`154`). `App` passes `onOpenTasbih` (switch to the Tasbih tab on the counter) and `onOpenHisn(category)` (switch to the Tasbih tab on Hisn Al-Muslim with that category), together with `tasbihCount`. `HomeScreen` declares all three props and uses none of them (`src/components/screens/HomeScreen.tsx:14`–`17`), so Home has no shortcut to either, and `hisnCategory` is never set.
- **Paywall unlock** (`src/App.tsx:213`). `onUnlocked` closes the paywall and switches to the Journey tab.
- **Spotlight tour** (`src/App.tsx:261`). Rendered while `tourCompleted` is false and the Home tab is active.

Two things follow from what `App.tsx` does and does not pass down. The store action `updateUserBlessing` is called by no component, so a personal blessing cannot be edited after it is created, only favourited or deleted. `analyticsConsent` and `setAnalyticsConsent` are forwarded to onboarding only.

Eight files call `useStore()` directly: `App.tsx`, `ReflectionCategoryCharts`, `ShareCardModal`, `JourneyMuhasabaScreen`, `JourneyPathScreen`, `ComposeBlessingModal`, `JournalScreen` and `SettingsScreen`. Every other component receives its data and callbacks as props from `App.tsx`.

### 5.2 Navigation

`TabId` is declared in `src/components/layout/BottomTabBar.tsx` and has six values.

| Tab | Arabic label | Screen | Reachable from |
|---|---|---|---|
| `home` | الرئيسية | `HomeScreen` | Bottom bar, desktop nav |
| `journey` | رحلتي | `JourneyPathScreen` (premium) or paywall | Bottom bar, desktop nav |
| `journal` | سجل الحمد | `JournalScreen` | Bottom bar, desktop nav |
| `consistency` | المداومة | `ConsistencyScreen` | Bottom bar, desktop nav |
| `tasbih` | المسبحة | `TasbihModal inline` (counter or Hisn Al-Muslim) | Bottom bar, desktop nav |
| `settings` | الإعدادات | `SettingsScreen` | Gear button in the top bar on mobile (`src/components/layout/TopBar.tsx:41`) and in the desktop nav (`src/components/layout/DesktopNavBar.tsx:61`); it is not in the bottom tab bar |

The mobile/desktop switch uses Tailwind's `md:` variant (`src/App.tsx:120`, `129`, `201`). The comments in the file say "≥900px" but no custom breakpoint is defined, so the switch happens at Tailwind's default 768 px.

## 6. Data flow

```
JSON / TS content (src/data)            user actions
        │                                    │
        ▼                                    ▼
 dailyLogic.ts ──► StoreProvider (useState per field) ──► localStorage (one key per field)
 journeyStore.ts ◄─────────┘        ▲
        │  CustomEvent 'alhamd:journey_updated'
        └───────────────────────────┘
 entitlements.ts ── CustomEvent 'alhamd:entitlement_changed' ──► JourneyPathScreen
 analytics.ts ──► localStorage 'alhamd:analytics_events_log' (never sent anywhere)
```

- State is one Context value rebuilt on every render of `StoreProvider` (`src/lib/store.tsx:683`), so any state change re-renders every consumer of `useStore()`.
- Each field is persisted separately, some in the setter and some in a `useEffect`. The full key registry is in [02-state-and-persistence.md](02-state-and-persistence.md).
- Journey state has two writers: the store and the helper functions in `journeyStore.ts`, kept in step by a window event.
- Some components keep their own keys outside the store (Hisn Al-Muslim counters and favourites, tasbih reciter and volume).

## 7. Cross-cutting behaviour

| Concern | How it works today |
|---|---|
| Language | Arabic only. Strings are written inline in components; `src/constants/strings.ts` holds a small subset and most of it is unused (see [04](04-content-and-data.md)) |
| Direction | `dir="rtl"` on `<html>` and again on the app root div (`src/App.tsx:116`) |
| Dates | Hijri (Umm al-Qura) through `Intl.DateTimeFormat`; no date library ([03](03-domain-logic.md)) |
| Numerals | Arabic-Indic digits through `toArabicNumerals` (`src/lib/arabic.ts:4`) |
| Theme | Dark by default; light, high-contrast and night-reading modes toggled by classes on `<html>` ([05](05-design-system.md)) |
| Haptics | `navigator.vibrate` patterns in `triggerHaptic` (`src/lib/store.tsx:257`); no effect on iOS Safari, which does not implement the API |
| Reminders | A time and an on/off flag are stored and shown in the UI. No code schedules or sends a notification |
| Payments | None. Premium is a `localStorage` flag ([02](02-state-and-persistence.md)) |
| Analytics | Opt-in; events are appended to a local log and never transmitted |
| Network | On load the app requests only Google Fonts. Audio is fetched from `everyayah.com` and `cdn.islamic.network` when the user plays a recitation. Share links open WhatsApp, X and Telegram |
| Offline | No service worker and no web app manifest; the app is not installable and does not work offline after a cold start |

## 8. Feature inventory

| Feature | Entry point | Main files |
|---|---|---|
| Onboarding | first launch | `screens/OnboardingScreen.tsx` |
| Spotlight tour | Home, first visit | `common/SpotlightTour.tsx` |
| Blessing of the day | Home tab | `screens/HomeScreen.tsx`, `lib/dailyLogic.ts`, `data/blessings_ar.json` |
| Five-step reflection (استشعار) | Home → «استشعر النعمة» | `screens/ReflectionModal.tsx`, `common/ThreadProgress.tsx`, `common/CompletionParticles.tsx` |
| Share cards | Home, reflection, journal | `common/ShareCardModal.tsx` |
| Journal (سجل الحمد) and personal blessings (نِعَمي) | Journal tab | `screens/JournalScreen.tsx`, `screens/ComposeBlessingModal.tsx`, `common/ReflectionCategoryCharts.tsx` |
| Consistency and Hijri calendar | Consistency tab | `screens/ConsistencyScreen.tsx`, `lib/hijri.ts` |
| Tasbih counter and recitation player | Tasbih tab | `screens/TasbihModal.tsx`, `screens/TasbihAudioPlayer.tsx` |
| Hisn Al-Muslim adhkar | Tasbih tab → «حصن المسلم» | `screens/HisnScreen.tsx`, `data/hisnAlMuslim.ts` |
| Settings, backup, appearance | Settings tab | `screens/SettingsScreen.tsx` |
| My Journey (premium) | Journey tab | `components/journey/*`, `lib/journeyStore.ts`, `data/journey_content.json` |
| Paywall | Journey tab when not premium | `screens/PremiumPaywallScreen.tsx`, `lib/entitlements.ts` |
| About, content review, privacy policy | Top bar / desktop nav | `screens/AboutModal.tsx`, `screens/ContentReviewModal.tsx`, `screens/PrivacyPolicyModal.tsx` |
| Landing page | `alhamd.app` | `src/landing/*`, `landing/index.html` |
