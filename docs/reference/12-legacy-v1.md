# Legacy v1 (legacy/)

State of the code at commit `68e723a` (`main`, 2026-11-16). Line references are `path:line` against that commit.

Paths written without a leading `legacy/` or `src/` (for example `App.tsx`, `services/storage.ts`, `SettingsView.tsx`) are relative to `legacy/src/` or `legacy/src/components/`. Paths into v2 always start with `src/`.

## 1. What it is and its status

`legacy/` is a complete, self-contained earlier version of the Alhamd app: its own `package.json`, lockfile, Vite and TypeScript config, `index.html` and `src/` tree. It has the same product idea as v2 (one blessing per day, a five-step guided reflection, a private journal) with a different screen set, a different visual palette, and native-app plumbing (Capacitor, PostHog) that v2 does not have.

Status, each point checked:

| Claim | Evidence |
|---|---|
| Committed once, never changed | `git log -- legacy` lists one commit: `a47edd1` (2026-09-10, "feat: initialize project structure"), the second commit in the repository |
| Not built | Root `vite.config.ts:16-19` has two inputs, `index.html` and `landing/index.html`. Root `package.json:6-12` has no script that touches `legacy/`. A production build of the root project contains no `capacitor`, `posthog` or `html-to-image` strings in its JavaScript |
| Not type-checked | Root `tsconfig.json:26-27` includes `src` and excludes `legacy` |
| Not imported | `grep -rnE "(from\|import\|require)…legacy" src landing index.html vite.config.ts package.json vercel.json` returns nothing. The word "legacy" appears in `src/` only in three comments (`src/lib/store.tsx:374`, `src/types.ts:79-80`) |
| Not installed | There is no `legacy/node_modules` in this checkout. The packages only v1 uses (`@capacitor/*`, `posthog-js`, `html-to-image`) are absent from the root `bun.lock` |
| Does not pass its own lint script | `tsc --noEmit -p legacy/tsconfig.json` reports three errors that installing dependencies would not fix: `legacy/src/components/SettingsView.tsx:117` (`'text_size_changed'` is not in `AnalyticsEvent`), `legacy/src/services/analytics.ts:64` (`import.meta.env` is untyped; nothing references `vite/client`), and `legacy/src/lib/dailyLogic.test.ts:1` (`vitest` is not a dependency) |
| No native project | There is no `capacitor.config.*`, `android/` or `ios/` under `legacy/`. Only the JavaScript side of Capacitor is present |

`legacy/` holds 42 tracked files and about 644 KB on disk. Two files account for roughly 305 KB of that:

- `legacy/package-lock.json`: 4,411 lines, 153,730 bytes (npm lockfile v3, 324 package entries). Not documented further.
- `legacy/src/data/blessings_ar.json`: 2,806 lines, 151,047 bytes. It is **byte-identical** to `src/data/blessings_ar.json` (`cmp` reports no difference; both have SHA-256 `c4693a1c…d3b0f0`).

## 2. Files

| Path | Lines | Role |
|---|---|---|
| `legacy/index.html` | 13 | HTML shell: `lang="ar" dir="rtl" class="dark"`, title «الحمد», `#root`, script `/src/main.tsx`. No meta description, no font links |
| `legacy/metadata.json` | 6 | Google AI Studio applet metadata. `name` and `description` are empty strings; `majorCapabilities` is `["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]` |
| `legacy/package.json` | 41 | Package `react-example`, private, ESM. Scripts: `dev`, `build`, `preview`, `clean`, `lint` |
| `legacy/package-lock.json` | 4,411 | npm lockfile (size only, see above) |
| `legacy/.env.example` | 13 | Three variables: `GEMINI_API_KEY` and `APP_URL` with placeholder values, `VITE_POSTHOG_KEY` empty. No real secret |
| `legacy/.gitignore` | 8 | Ignores `node_modules/`, `build/`, `dist/`, `coverage/`, `.DS_Store`, `*.log`, `.env*` except `.env.example` |
| `legacy/tsconfig.json` | 26 | Same compiler options as the root file, without `include` / `exclude` |
| `legacy/vite.config.ts` | 22 | React and Tailwind plugins, `@` alias to the package root, HMR switch on `DISABLE_HMR`. No multi-page input |
| `legacy/replace.js` | 25 | One-off script: swaps hard-coded hex colour classes for theme classes in one file (section 8) |
| `legacy/replace-analytics.cjs` | 27 | One-off script: migrates six files from a `track()` helper and `localStorage` to the `analytics` and `storage` services (section 8) |
| `legacy/assets/.aistudio/.gitignore` | 1 | Contains `*`. The directory is otherwise empty; `legacy/assets/` holds nothing else |
| `legacy/src/main.tsx` | 14 | Mounts `<StoreProvider><App/></StoreProvider>` in `StrictMode`; imports `index.css` |
| `legacy/src/App.tsx` | 382 | Root component: boot, onboarding gate, six tabs, bottom navigation, overlays, analytics-consent modal |
| `legacy/src/StoreContext.tsx` | 112 | React context holding the whole `AppState`, persisted as one JSON blob |
| `legacy/src/index.css` | 35 | Font import, Tailwind, `dark` variant, `brand-*` colour tokens, large-text rule |
| `legacy/src/types.ts` | 85 | Content types, `JournalEntry`, `AppState` |
| `legacy/src/utils.ts` | 35 | Hijri date string, day of year, local date string, Eastern Arabic numerals, an unused `track` stub |
| `legacy/src/components/BlessingCard.tsx` | 393 | Today's blessing card with verse, expandable reflection text, start button, share-as-image |
| `legacy/src/components/ConsistencyView.tsx` | 215 | Hijri month grid of completed days; streak milestone dialog |
| `legacy/src/components/DailyAffirmationCard.tsx` | 33 | Presentational card «رسالة طمأنينة» |
| `legacy/src/components/DailyDhikrCard.tsx` | 33 | Presentational card «ذكر اليوم» |
| `legacy/src/components/InspirationCard.tsx` | 181 | Verse or hadith of the day with share-as-image |
| `legacy/src/components/JournalView.tsx` | 162 | Journal list with search, category filter, delete confirmation |
| `legacy/src/components/MyBlessings/MyBlessingsView.tsx` | 475 | Personal blessings: list, compose/edit, detail, delete |
| `legacy/src/components/Onboarding.tsx` | 350 | Five-screen swipeable onboarding |
| `legacy/src/components/PrivacyPolicyView.tsx` | 121 | Full-screen privacy policy |
| `legacy/src/components/ReflectionFlow.tsx` | 480 | Five-step guided reflection, journal step, dhikr counter, completion overlay |
| `legacy/src/components/SettingsView.tsx` | 309 | Settings, backup export and import, about |
| `legacy/src/components/SpotlightTour.tsx` | 292 | Seven-step coach-mark tour over the home screen |
| `legacy/src/components/TasbihView.tsx` | 111 | Tasbih counter |
| `legacy/src/data/affirmations.ts` | 15 | 8 short reassurance messages |
| `legacy/src/data/blessings_ar.json` | 2,806 | 40 blessings (identical to v2's file) |
| `legacy/src/data/dhikr.ts` | 16 | 9 adhkar with their stated virtue (identical to `src/data/dhikr.ts`) |
| `legacy/src/data/inspirations.ts` | 48 | 8 verses and hadiths (identical to `src/data/inspirations.ts`) |
| `legacy/src/data/loader.ts` | 13 | `getAllBlessings()` and the `CONTENT_REVIEW_GATE` flag |
| `legacy/src/lib/dailyLogic.ts` | 63 | Daily blessing selection |
| `legacy/src/lib/dailyLogic.test.ts` | 77 | Unit tests for the above (section 7) |
| `legacy/src/lib/userBlessingsStore.ts` | 98 | Async CRUD store for personal blessings |
| `legacy/src/services/analytics.ts` | 95 | PostHog wrapper with consent gating |
| `legacy/src/services/haptics.ts` | 55 | Haptic feedback: Capacitor on native, `navigator.vibrate` on web |
| `legacy/src/services/notifications.ts` | 67 | Daily local notification: Capacitor on native, log-only on web |
| `legacy/src/services/storage.ts` | 45 | Key-value storage: Capacitor Preferences on native, `localStorage` on web |

## 3. Stack and dependencies versus v2

Both `package.json` files are named `react-example` (the AI Studio template name) and share most entries.

| Dependency | v1 (`legacy/package.json`) | v2 (`package.json`) | Used in v1 source? |
|---|---|---|---|
| `react`, `react-dom` | ^19.0.1 | ^19.0.1 | yes |
| `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss` | same ranges | same ranges | yes |
| `lucide-react` | ^0.546.0 | ^0.546.0 | yes |
| `motion` | ^12.23.24 | ^12.23.24 | yes |
| `@capacitor/core` | ^8.4.1 | absent | yes, `Capacitor.isNativePlatform()` in three services |
| `@capacitor/haptics` | ^8.0.2 | absent | yes, dynamic import in `services/haptics.ts` |
| `@capacitor/local-notifications` | ^8.2.0 | absent | yes, dynamic import in `services/notifications.ts` |
| `@capacitor/preferences` | ^8.0.1 | absent | yes, dynamic import in `services/storage.ts` |
| `html-to-image` | ^1.11.13 | absent | yes, `toBlob` in `BlessingCard.tsx:4` and `InspirationCard.tsx:5` |
| `posthog-js` | ^1.386.6 | absent | yes, `services/analytics.ts:1` |
| `recharts` | absent | ^3.10.1 | n/a |
| `@google/genai`, `express`, `dotenv` | present | present | no import anywhere in `legacy/src` |
| dev: `typescript` ~5.8.2, `tsx`, `esbuild`, `autoprefixer`, `@types/node`, `@types/express` | present | present | only `typescript` is exercised (`lint`) |
| a test runner | absent | absent | the test file imports `vitest` |

Other differences:

- Build script: v1 is `vite build` (`legacy/package.json:8`); v2 adds `&& mv dist/index.html dist/app.html` (`package.json:8`).
- Lockfile: v1 has npm's `package-lock.json`; v2 has `bun.lock`.
- Fonts: v1 loads Amiri, IBM Plex Sans Arabic and Inter through a CSS `@import` (`legacy/src/index.css:1`); `Inter` is first in the sans stack (line 7).
- Colour system: v1 defines sixteen `brand-*` theme colours in a slate / indigo / amber palette, eight for light and eight for dark (`legacy/src/index.css:10-26`), used through paired classes such as `bg-brand-surface dark:bg-brand-dark-surface`. Several components ignore those tokens and hard-code a different navy / gold / violet palette (`#15152A`, `#C8A951`, `#6C63FF`, `#d4af37`…): `Onboarding.tsx`, `SpotlightTour.tsx`, `PrivacyPolicyView.tsx`, `ReflectionFlow.tsx`, `JournalView.tsx`. That second palette is the one v2 adopted.
- `legacy/vite.config.ts:16` and the root `vite.config.ts:24` carry the same comment with a mis-encoded dash character.

## 4. Architecture

### 4.1 Boot

`legacy/src/main.tsx:7-13` renders `StoreProvider` around `App`. `StoreProvider` returns `null` until it has read storage (`StoreContext.tsx:99`). `App` then returns `null` until its own three async reads finish (`App.tsx:133`). So nothing is drawn until both async loads complete.

### 4.2 `App.tsx`: screens, tabs and overlays

Local state (`App.tsx:29-37`); the store is read at line 28:

| State | Type | Purpose |
|---|---|---|
| `activeTab` | `'home' \| 'journal' \| 'consistency' \| 'myBlessings' \| 'tasbih' \| 'settings'` | Current tab |
| `showReflection` | boolean | Reflection overlay open |
| `showPrivacyPolicy` | boolean | Privacy overlay open |
| `onboarded` | `boolean \| null` | From storage key `alhamd_onboarded`; `null` while loading |
| `tourCompleted` | `boolean \| null` | From storage key `alhamd:tourComplete` |
| `activeExpIndex` | number | Index into today's experience list. Only ever set to `0` (lines 34, 163, 172, 180) |
| `consentState` | `ConsentState \| null` | Analytics consent |
| `now` | `Date` | Current time used for all date-dependent values |

Effects:

| Lines | What it does |
|---|---|
| 39-52 | Reads `alhamd_onboarded`, `alhamd:tourComplete` and the consent value; captures `app_open` if consent is `granted` |
| 54-59 | Listens for a `tour-replay` window event and resets `tourCompleted` |
| 61-77 | Refreshes `now` when the document becomes visible and every 60 seconds, so the day rolls over without a reload |
| 79-84 | Sets `firstLaunchDate` once, after onboarding |
| 86-97 | When `hapticReminders` is on, fires a light haptic every hour while the app stays open. The comment says a real app would use a background task |

Derived values:

- `todayExperience = resolveTodayExperience(now, state.welcomeSeen, approvedBlessings)` (lines 100-102). `approvedBlessings` is `getAllBlessings()` evaluated once at module load (line 11).
- `currentExp`, `todayBlessing`, `role` come from `todayExperience.blessings[activeExpIndex]` (lines 104-106). Because the index is always 0, a first-time user gets the welcome blessing and a returning user gets the daily one.
- `todayInspiration = inspirations[getDayOfYear(now) % inspirations.length]` (lines 108-111).
- `todayStr` is the local `YYYY-MM-DD` date; `isTodayCompleted` is true when it is in `completedReflections` and the role is `daily` (lines 113-114).

Render order:

1. Onboarding gate: if not onboarded, only `<Onboarding>` is rendered (lines 135-137). Completing or skipping writes `alhamd_onboarded = 'true'` and captures `onboarding_completed` or `onboarding_skipped { at_screen }` (lines 116-126).
2. `<main>` with one tab panel at a time inside `AnimatePresence mode="wait"` (lines 188-301). Each panel fades and slides in.
3. Fixed bottom `<nav>` with six tabs (lines 303-324):

| Order | Tab id | Label | Icon | `data-tour` |
|---|---|---|---|---|
| 1 | `home` | الرئيسية | `Home` | none |
| 2 | `tasbih` | مسبحة | `Hash` | none |
| 3 | `myBlessings` | نِعَمي | `Heart` | `my-blessings` |
| 4 | `journal` | سجل الحمد | `Book` | none |
| 5 | `consistency` | المداومة | `CheckCircle2` | `continuity` |
| 6 | `settings` | الإعدادات | `Settings` | `settings` |

4. Overlays (lines 326-338): `ReflectionFlow` (keyed by blessing id so it resets when the blessing changes) and `PrivacyPolicyView`.
5. `SpotlightTour`, when the tour is not complete, the home tab is active and no reflection is open (lines 339-341).
6. Analytics-consent modal, when the tour is complete and consent is `unset` (lines 342-379). Title «تحسين مسار التطبيق»; buttons «أوافق على المشاركة» (stores `granted`, captures `app_open`) and «ليس الآن» (stores `denied`).

Home tab content (lines 190-234): a header card with «السلام عليكم», the Hijri date from `getIslamicDate(now)` and a generic user icon; `InspirationCard`; the divider label «نعمة اليوم»; `BlessingCard`. Its `onStart` captures `reflection_started` and opens the reflection.

Reflection completion (`handleReflectionComplete`, lines 139-173):

1. If the role is `daily`, marks today complete.
2. Captures `reflection_completed { blessing_id, source: role }`.
3. If text was entered, saves a journal entry with `id: crypto.randomUUID()`, `date: getIslamicDate(now)` (a display string, not an ISO date), the blessing id, short title and category label; captures `journal_saved` with `has_text`.
4. If the role is `welcome`: sets `welcomeSeen: true` and returns without closing. The experience list recomputes to the daily blessing, the overlay's `key` changes, and the flow restarts with today's blessing.
5. Otherwise: switches to the journal tab if text was saved, and closes the overlay.

Closing the overlay early during the welcome flow also sets `welcomeSeen: true` (lines 175-181).

### 4.3 `StoreContext.tsx`: state shape and actions

`AppState` (`types.ts:72-84`) with defaults (`StoreContext.tsx:5-17`):

| Field | Type | Default | Notes |
|---|---|---|---|
| `onboardingComplete` | boolean | `false` | Only written by `completeOnboarding`, which nothing calls. The real flag is the separate key `alhamd_onboarded` |
| `journalEntries` | `JournalEntry[]` | `[]` | Newest first |
| `completedReflections` | `string[]` | `[]` | Local dates `YYYY-MM-DD` |
| `notificationTime` | string | `"07:00"` | |
| `theme` | `'light' \| 'dark' \| 'auto'` | `"dark"` | |
| `textSize` | `'normal' \| 'large'` | `"normal"` | |
| `firstLaunchDate` | `string \| null` | `null` | ISO timestamp |
| `welcomeSeen` | boolean | `false` | |
| `hapticReminders` | boolean | `false` | |
| `notificationsEnabled` | boolean | `false` | |
| `tasbihCount` | number | `0` | Lifetime total |

`JournalEntry` (`types.ts:60-70`): `id`, `date`, `blessingId`, `shortTitle`, `categoryLabel`, `text`, plus optional older fields `blessingTitle` and `category`.

Actions (`StoreContext.tsx:19-26`, `71-97`):

| Action | Effect |
|---|---|
| `completeOnboarding(time)` | Sets `onboardingComplete: true` and `notificationTime`. Unused |
| `saveJournalEntry(entry)` | Prepends the entry |
| `deleteJournalEntry(id)` | Removes by id |
| `markReflectionComplete(date)` | Appends the date if not already present |
| `updateSettings(partial)` | Shallow-merges any `AppState` fields |

Loading (lines 33-48): reads `alhamd_state`, parses it without a `try`, and merges it over the defaults. If the stored object lacks `dark_mode_forced_v1`, the theme is forced to `dark` once and the flag is set.

On every state change (lines 50-69): writes the whole state plus `dark_mode_forced_v1: true` to `alhamd_state` (the returned promise is not awaited); adds or removes the `dark` class on `<html>` and `<body>` (dark when `theme` is `dark`, or `auto` with a dark OS preference); adds or removes `text-size-large` on `<html>`, which sets the root font size to 112.5% (`index.css:33-35`).

### 4.4 Storage service and every storage key

`services/storage.ts` exposes `getItem`, `setItem`, `removeItem` (lines 4-30) and the unused helpers `getJSON`, `setJSON` (lines 32-44). All are async. On a native platform they call `@capacitor/preferences`; otherwise `localStorage`.

| Key | Value | Read / written at | Through the service? |
|---|---|---|---|
| `alhamd_state` | JSON `AppState` plus `dark_mode_forced_v1` | `StoreContext.tsx:35,53`; `SettingsView.tsx:58` (import) | yes |
| `alhamd_onboarded` | `'true'` | `App.tsx:41,117,123` | yes |
| `alhamd:tourComplete` | `'true'` | `App.tsx:42,129`; removed at `SpotlightTour.tsx:55` | yes |
| `alhamd:analytics_consent` | `'granted'` or `'denied'` | `services/analytics.ts:40-52` | yes |
| `alhamd:userBlessings:v1` | JSON array of `UserBlessing` | `lib/userBlessingsStore.ts:24-91` | yes |
| `alhamd_milestone_shown` | Streak number as a string | `ConsistencyView.tsx:62,65` | no, calls `localStorage` directly |

The last key bypasses the service because `ConsistencyView.tsx` was not in the file list of `replace-analytics.cjs` (section 8). On a native build it would live in the web view's `localStorage` while everything else is in Preferences.

### 4.5 Capacitor usage

Every native call is behind `Capacitor.isNativePlatform()` and a dynamic `import()` of the plugin, so the plugins are not loaded on the web.

| Plugin | Calls | Where |
|---|---|---|
| `@capacitor/core` | `Capacitor.isNativePlatform()` | `storage.ts:5,15,24`; `haptics.ts:7,27,42`; `notifications.ts:13,32,60` |
| `@capacitor/preferences` | `Preferences.get`, `.set`, `.remove` | `storage.ts:6-7,16-17,25-26` |
| `@capacitor/haptics` | `Haptics.impact({style})`, `Haptics.notification({type})` | `haptics.ts:8-13,28-29,43-44` |
| `@capacitor/local-notifications` | `LocalNotifications.requestPermissions()`, `.schedule()`, `.cancel()` | `notifications.ts:14-16,33-49,61-62` |

### 4.6 Notifications service

`services/notifications.ts`:

| Method | Native | Web |
|---|---|---|
| `requestPermission()` (12-29) | `LocalNotifications.requestPermissions()`; true when `display === 'granted'` | True if `Notification.permission` is already granted, otherwise the result of `Notification.requestPermission()`; false if the API is missing or throws |
| `scheduleDaily({id,title,body,hour,minute})` (31-57) | Schedules a repeating notification with `schedule: { on: { hour, minute }, allowWhileIdle: true }` | Does not schedule. If permission is granted it writes a console message saying native is required |
| `cancel(id)` (59-66) | Cancels by id | Console message only |

Callers are in `SettingsView.tsx`: the toggle «التنبيهات اليومية» (lines 134-162) requests permission and schedules id `1` with title «الحمد» and body «حان وقت التفكّر والحمد», or cancels id `1`; changing the time (lines 167-188) schedules id `1` again when notifications are on.

### 4.7 Haptics service

`services/haptics.ts`:

| Method | Native | Web (`navigator.vibrate`) | Callers |
|---|---|---|---|
| `impact('light' \| 'medium' \| 'heavy')` (6-24) | `Haptics.impact` with the matching style | 10, 20 or 30 ms | `App.tsx:93`; `TasbihView.tsx:36,38,45,66`; `ReflectionFlow.tsx:161,197`; `SettingsView.tsx:200` |
| `success()` (26-39) | `Haptics.notification(Success)` | `[10, 30, 20]` | `ConsistencyView.tsx:66`; `ReflectionFlow.tsx:179` |
| `warning()` (41-54) | `Haptics.notification(Warning)` | `[20, 30, 40]` | none |

### 4.8 Analytics service (PostHog)

`services/analytics.ts`:

- Consent is stored under `alhamd:analytics_consent` as `'granted'` or `'denied'`; anything else reads as `'unset'` (lines 38-48).
- `setConsent('granted')` initialises PostHog; `setConsent('denied')` calls `posthog.opt_out_capturing()` if it was initialised (lines 51-60).
- `initPostHog()` (lines 62-76) reads `import.meta.env.VITE_POSTHOG_KEY` and returns silently if it is empty. Otherwise it calls `posthog.init` with exactly these options: `api_host: 'https://eu.i.posthog.com'`, `autocapture: false`, `disable_session_recording: true`, `opt_out_capturing_by_default: true`, then `posthog.opt_in_capturing()`.
- At module load it initialises PostHog if consent is already granted (lines 79-83).
- `analytics.capture(event, properties?)` (lines 85-95) re-reads consent on every call. If consent is not `granted` or PostHog is not initialised, it logs with `console.debug` and returns. Otherwise it calls `posthog.capture`.

The project key is not committed: `legacy/.env.example:13` leaves `VITE_POSTHOG_KEY` empty and `.env*` is ignored. Without a key every capture is skipped.

Events captured in the code:

| Event | Properties | Where |
|---|---|---|
| `app_open` | none | `App.tsx:48,361`; `SettingsView.tsx:222` |
| `onboarding_completed` | none | `App.tsx:119` |
| `onboarding_skipped` | `at_screen` (1-based screen number) | `App.tsx:125` |
| `reflection_started` | `blessing_id`, `blessing_order`, `category`, `source` (always the literal `'daily'`, also for the welcome blessing) | `App.tsx:223-228` |
| `reflection_step_viewed` | `blessing_id`, `step_type` | `ReflectionFlow.tsx:153` |
| `reflection_completed` | `blessing_id`, `source` (`welcome` or `daily`) | `App.tsx:144` |
| `journal_saved` | `blessing_id`, `has_text` | `App.tsx:154,156` |
| `dhikr_session` | `count` | `ReflectionFlow.tsx:181,191` |
| `personal_blessing_created`, `personal_blessing_edited` | `has_title`, `has_category`, `used_value_reflection` | `MyBlessingsView.tsx:97-114` |
| `personal_blessing_opened` | `has_title`, `has_category`, `is_favorite` | `MyBlessingsView.tsx:123-127` |
| `personal_blessing_favorited` | `is_favorite` | `MyBlessingsView.tsx:135` |
| `personal_blessing_deleted` | none | `MyBlessingsView.tsx:148` |
| `backup_exported`, `backup_imported`, `backup_import_failed` | none | `SettingsView.tsx:46,63,71` |
| `theme_changed` | `theme` | `SettingsView.tsx:96` |
| `text_size_changed` | `size` | `SettingsView.tsx:117` (not in the `AnalyticsEvent` union; a type error) |
| `notification_permission_granted`, `notification_permission_denied` | none | `SettingsView.tsx:140,151` |
| `reminder_set` | `bucket` (`morning` before 12, `afternoon` before 17, `evening` before 20, else `night`; `SettingsView.tsx:14-20`) | `SettingsView.tsx:173` |

No event carries journal text, blessing text typed by the user, or the reminder time itself.

Declared in the `AnalyticsEvent` union (`services/analytics.ts:4-36`) but never captured: `onboarding_started`, `blessing_viewed`, `blessing_completed`, `value_reflection_started`, `value_reflection_completed`, `value_reflection_skipped`, `journal_opened`, `consistency_opened`, `settings_opened`, `privacy_policy_opened`, `notification_permission_requested`, `daily_reminder_scheduled`.

### 4.9 `userBlessingsStore`

`lib/userBlessingsStore.ts` is a module-level async store, separate from the React context, for the "My blessings" tab.

- `MaqsadCategory` (lines 3-10): seven string literals with underscores: `نعم_الدين`, `نعم_النفس`, `نعم_العقل`, `نعم_النسل`, `نعم_المال`, `نعم_الكون`, `نعم_الوجدان`.
- `UserBlessing` (lines 12-22): `id`, optional `title`, required `body`, optional `valueReflection`, optional `category`, `isFavorite`, `source: 'user'`, `createdAt`, `updatedAt` (epoch ms).
- Methods: `list()` (returns `[]` on any read or parse error), `get(id)`, `add(blessing)` (assigns `crypto.randomUUID()` and timestamps, prepends), `update(id, patch)`, `remove(id)`, `toggleFavorite(id)`, `exportAll()` (raw JSON string or `'[]'`), `importAll(json)` (stores the string if it parses to an array).
- Every method re-reads and re-writes the full array; there is no in-memory cache and no locking.

### 4.10 Daily logic and utilities

`lib/dailyLogic.ts`:

- `getDayNumber(now)` (lines 10-16) returns `Math.floor(Date.UTC(localYear, localMonth, localDay) / 86_400_000)`: a day index built from the device's **local** calendar date. The JSDoc above it (lines 6-9) says the opposite ("UTC-based… flips at 00:00 UTC worldwide"); the inline comment (lines 11-13) describes the real behaviour (flips at local midnight).
- `blessingForDate(date, all)` (lines 18-35) removes the blessing with id `islam`, sorts the rest by `order`, and picks index `dayNumber mod poolSize` with a positive modulo. Throws if the pool is empty.
- `resolveTodayExperience(date, welcomeSeen, all)` (lines 41-63) returns `{ blessings: [...] }`: `[welcome(islam), daily]` for a first-time user, `[daily]` otherwise (and also when no `islam` entry exists).

`utils.ts`:

| Function | Behaviour | Lines |
|---|---|---|
| `getIslamicDate(date)` | `Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day, month: 'long', year})`; falls back to `toLocaleDateString('ar-EG')` | 1-13 |
| `getDayOfYear(now)` | Day of the year in local time, corrected for DST | 15-20 |
| `getTodayDateStr(now)` | Local `YYYY-MM-DD` | 22-24 |
| `toEasternArabicNumerals(n)` | Replaces `0-9` with `٠-٩` | 26-30 |
| `track(event, props)` | Logs to the console. Not imported anywhere | 32-35 |

`getIslamicDate` uses the `islamic` calendar while `ConsistencyView.tsx:76-77` uses `islamic-umalqura`. In Node 22 these differed by one day on every date tried (for example 2026-11-10 is 1 Jumada II in `islamic` and 30 Jumada I in `islamic-umalqura`), so the home header and journal dates could disagree with the consistency grid.

### 4.11 Styling

`legacy/src/index.css`: `@custom-variant dark (&:where(.dark, .dark *))` (line 4) makes `dark:` utilities depend on a `.dark` class; `@theme` (lines 6-27) defines `--font-sans`, `--font-amiri` and the sixteen `--color-brand-*` values; `body` applies the background, text colour and font (lines 29-31).

Two classes used in the components have no definition: `pb-safe` (`App.tsx:303`, `PrivacyPolicyView.tsx:21`), and the CSS variable `--brand-primary` referenced in inline styles (`BlessingCard.tsx:184,246`; the theme defines `--color-brand-primary`).

## 5. Components

### `Onboarding`

- Props: `onComplete: () => void`, `onSkip?: (step: number) => void` (`Onboarding.tsx:73-78`).
- A fixed full-screen carousel, always dark (hard-coded colours), with five screens (`Onboarding.tsx:28-61`):

| # | Eyebrow | Title | Body |
|---|---|---|---|
| 1 | السلام عليكم ورحمة الله | الحمد | مساحةٌ هادئة لتتذكّر نِعَم الله، وتعيش الامتنان… نعمةً واحدة كلَّ يوم. |
| 2 | لماذا الحمد؟ | نِعَمٌ لا تُحصى… وقلوبٌ غَفَلَت | نتقلّب في نِعَمٍ عظيمة كلَّ لحظة: نَفَسٌ يدخل، وقلبٌ ينبض، وبصرٌ يرى. لكنَّ كثرتها ودوامها يُنسياننا قيمتها. هنا نتوقّف قليلًا، ونُعيد للنعمة مكانتها في القلب. |
| 3 | كيف نُمارس الحمد؟ | لا نَعُدّ النِّعَم فحسب… بل نَستشعِر قيمتها | في كلِّ يوم نأخذ نعمةً واحدة، ونتأمّلها بعمق: كيف كانت ستكون حياتنا لو فقدناها؟ حين نتخيّل غيابها، نُدرك حقيقة وجودها، فيصدُق الحمد في القلب قبل اللسان. |
| 4 | وَعْدُنا لك | الاستمرار… لا المنافسة | لا نِقاط، ولا سلاسل، ولا مقارنة بأحد. أنت ومحاسبة نفسك فقط. والقليل الدائم خيرٌ من الكثير المنقطع — نعمةٌ واحدة كلَّ يوم تكفي لتُحيي القلب. |
| 5 | قبل أن تبدأ | رحلتك… بينك وبين الله | لا حسابَ ولا تسجيلَ دخول. كلُّ تأمّلاتك تبقى على جهازك وحدك. ابدأ متى شئت، وعُد متى شئت. |

- Screen 4 also shows the secondary line «ويشاركك المسلمون حول العالم النعمةَ نفسها في اليوم نفسه.» and the hadith from `ONBOARDING_HADITH` (lines 8-14): «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ», attributed «رواه مسلم عن عائشة رضي الله عنها». The constant marks itself `verifiedVerbatim: false` and `reviewStatus: "pending_review"`, and the comment says scholarly review is required before release. The empty-placeholder branch (lines 310-322) cannot be reached while the text is non-empty.
- Controls: «السابق» (not on screen 1), «تخطٍّ» (not on the last screen), five progress dots, and a bottom button «التالي», which becomes «ابدأ بأوّل نعمة» on the last screen (labels at lines 63-68).
- Horizontal drag of more than 50px moves forward (drag right) or back (drag left); drag is disabled on the last screen (lines 118-128, 245).
- Honours `prefers-reduced-motion` through Motion's `useReducedMotion`: slides and staggered children fade instead of moving, and the gold glow on screen 1 is not drawn.
- Imports `analytics` but never calls it (line 3). `onboarding_started` is never captured.

### `SpotlightTour`

- Props: `onTourComplete: () => void` (`SpotlightTour.tsx:59-61`). Also exports `replayTour()`, which removes `alhamd:tourComplete` and dispatches `tour-replay` (lines 54-57); no component calls it.
- Seven steps (lines 12-51). Six target an element by `data-tour` attribute; the last is a centred closing card.

| Key | Title | Body |
|---|---|---|
| `blessing` | نعمة اليوم | هنا نعمةُ اليوم. تتغيّر كلَّ يوم، ويشاركك المسلمون حول العالم النعمةَ نفسها في اليوم نفسه. |
| `reflect-toggle` | تدبّر النعمة | اضغط هنا لتقرأ التدبّر كاملًا وتتعمّق في معاني النعمة وأثرها في حياتك. |
| `feel-button` | استشعر النعمة | قلبُ التجربة: تخيّل حياتك لو فقدتَ هذه النعمة، فتستشعر قيمتها الحقيقية… ويصدُق الحمد في القلب قبل اللسان. |
| `share` | شارك النعمة | انشُر أثر النعمة وذكّر بها من تحب. |
| `settings` | الإعدادات | من هنا تضبط التذكير اليومي، والمظهر، ونسخ بياناتك احتياطيًّا واستعادتها — دون أيِّ تسجيل دخول. |
| `continuity` | محاسبتك مع نفسك | هنا تتابع استمراريتك في الحمد — لا نِقاطٌ ولا سلاسلُ ولا منافسة، بل محاسبةٌ هادئة للنفس. والقليل الدائم خيرٌ من الكثير المنقطع. |
| `final` | بدأت رحلتك | عُد إلى نعمة اليوم كلَّ يوم، وداوم على الحمد. |

- For each step it scrolls the target into view, tracks its rectangle for about 30 animation frames, and draws a gold-ringed cut-out whose 9999px box shadow dims the rest of the screen. If the target is missing the step is skipped (lines 77-108).
- The callout card is placed above or below the target, clamped horizontally (lines 175-200). It shows the title, a `n / 6` counter in Western digits, the body, and the buttons «التالي» (or «فهمت» on the last step), «السابق» and «تخطّي».
- Keyboard: Escape finishes; Enter and Left Arrow advance; Right Arrow goes back (lines 142-150). The comment mentions a focus trap but none is implemented.
- The tab `myBlessings` carries `data-tour="my-blessings"` (`App.tsx:315`) but no step uses it.

### `BlessingCard`

- Props: `blessing: Blessing`, `completed: boolean`, `onStart: () => void` (`BlessingCard.tsx:7`).
- Shows the category label, title, opening line, the verse in ﴿ ﴾ with «سورة {name} : {ayah}», and an expandable «تدبّر النعمة» section containing the hadith text and source, the `tadabbur` paragraph and the scholar quote. The scholar's name is shown only when it does not start with «مستفاد», «مأثور» or «إشارة» (lines 150-152, 245-249).
- Primary action: «استشعر النعمة». When `completed` is true it is replaced by the badge «حمدتَ اللهَ اليوم» and a text link «أعد الاستشعار» (lines 257-282).
- Two share buttons (titles «مشاركة الصورة» and «مشاركة التدبر»). Each renders a hidden off-screen node (1080×1350, fixed at -9999px) to a PNG with `html-to-image`'s `toBlob` at pixel ratio 2, then tries the Web Share API with the file and a text summary ending «عبر تطبيق الحمد». If file sharing is unavailable or fails, it downloads the PNG and copies the text to the clipboard, showing a check mark for 2 seconds. A user-cancelled share (`AbortError`) is ignored (lines 16-148, 285-390).
- Carries the tour anchors `share`, `blessing`, `reflect-toggle` and `feel-button`.
- Defects: `style={{ color: 'var(--brand-primary)' }}` refers to an undefined variable (lines 184, 246); the ternary at line 104 has identical branches; `Download` is imported and unused.

### `InspirationCard`

- Props: `inspiration: Inspiration` (`InspirationCard.tsx:7`).
- Shows the label «آية اليوم» or «حديث اليوم» by `type`, the text wrapped in ﴿ ﴾ or « », and the source.
- One share button (title «مشاركة») with the same image-then-fallback flow as `BlessingCard`, using a hidden 1080×1080 node. If image generation throws, it copies the text instead (lines 13-86).
- Unused: the `isExpanded` state (line 11) and the imports `ChevronDown`, `motion`, `AnimatePresence`.

### `ReflectionFlow`

- Props: `blessing: Blessing`, `onComplete: (journalText: string) => void`, `onClose: () => void` (`ReflectionFlow.tsx:95-99`).
- Steps come from `blessing.istisharSteps` (type, text, `durationSec`) (lines 105-109). In the data every blessing has the five types `ground`, `visualize`, `deepen`, `return`, `hamd` with durations 10, 20, 20, 15, 15 seconds.
- Each step type has a visual "arc" for dark and light mode (`THEME_ARCS`, lines 33-50): background colour, glow colour and strength, vignette opacity, text colours and circle scale. The background darkens through `visualize` and `deepen` and brightens at `return` and `hamd`.

| Phase | Dark `bg` | Dark glow strength / vignette | Light `bg` | Light glow strength / vignette |
|---|---|---|---|---|
| `ground` | `#16213A` | 0.7 / 0 | `#F7F1E3` | 0.5 / 0 |
| `visualize` | `#0B1020` | 0.15 / 0.5 | `#E8E8EA` | 0.1 / 0.35 |
| `deepen` | `#060912` | 0.05 / 0.7 | `#DDDEE2` | 0.05 / 0.35 |
| `return` | `#131B33` | 0.5 / 0.2 | `#EFEAD9` | 0.4 / 0.15 |
| `hamd`, `journal` | `#1A2440` | 1.0 / 0 | `#FAF4E2` | 0.9 / 0 |

- Dark mode is detected by watching the `class` attribute of `<html>` with a `MutationObserver` (lines 21-31). Reduced motion is detected with a local `matchMedia` hook (lines 9-19); it shortens colour transitions from 2500 ms to 800 ms and removes movement and pulsing.
- Text appears clause by clause: `StaggeredText` splits on `.`, `،`, `؟`, `!`, `…` and fades each chunk in 1.5 s after the previous one (lines 52-76).
- The "next" button («التالي», or «الحمد لله» on the `hamd` step) appears when all chunks have appeared (lines 157, 420-437). A dwell timer based on `durationSec` runs and sets `dwellFinished` (lines 135-149), but that value is never read, so the step durations in the data do not gate anything.
- Pressing next fires a light haptic, fades the text out for 400 ms, changes the step, waits for the colour transition, then fades the new text in (lines 159-176).
- On the `hamd` step the blessing's `duaa` is shown under the text (lines 286-294).
- Five progress dots, hard-coded to five steps (lines 78-93). A persistent "breathing" circle pulses on a 7-second cycle (lines 241-269). A round close button (X) is always available.
- After the last step the journal screen appears (lines 299-407): the blessing's `journalPrompt`, a textarea with placeholder «اكتب حمدك...», a tappable pulsing circle labelled «الحمد لله» that counts taps in Eastern Arabic numerals (a small dot is added from 33), and the buttons «حفظ في سجل الحمد» (when text is present) or «إتمام» plus «لاحقًا» (when it is empty).
- Finishing fires a success haptic, captures `dhikr_session { count }` if the counter was used, shows the overlay «تقبل الله منكم» for 1.6 s, then calls `onComplete(text)` (lines 178-187, 444-476).
- The dhikr tap target is a `<div onClick>` (lines 325-328), not a button.

### `JournalView`

- Props: `onGoHome: () => void` (`JournalView.tsx:6`).
- Empty state: «سجلّك ما زال فارغًا... ابدأ بنعمة اليوم» with the button «العودة للرئيسية» (lines 24-45).
- Otherwise: title «سجل الحمد»; a search box (placeholder «ابحث في سجل الحمد (كلمة، تاريخ)...») that matches entry text, title or date string; a horizontally scrolling row of category chips («الكل» plus every distinct `categoryLabel` in the blessings data); and a card per entry with title, date, a trash button and the text clamped to three lines until tapped (lines 47-129).
- Title and category fall back through older field names and finally a lookup of the blessing by id (lines 48, 59, 101).
- Empty-result messages: «لم يتم العثور على نتائج للبحث.» or «لا توجد تدوينات في هذا التصنيف.»
- Delete asks for confirmation: «تأكيد الحذف», «هل تريد حذف هذه التدوينة؟ لا يمكن التراجع.», buttons «إلغاء» and «حذف» (lines 132-158).

### `ConsistencyView`

- No props (`ConsistencyView.tsx:53`).
- Title «سجل المداومة», subtitle «هذه صفحتُك مع نفسك… لا سِباقَ مع أحد».
- Finds the first day of the current Umm al-Qura month by stepping the Gregorian date, then lists up to 30 days of that month (lines 71-131). Shows «أتممتَ {n} يومًا من {month}» and a seven-column grid of day numbers; completed days are green, today has an amber ring. The grid has no weekday header and does not align days to weekdays.
- `calculateStreak` (lines 10-51) counts consecutive completed days ending today or yesterday. When the streak equals one of `MILESTONES = [3, 7, 14, 21, 30, 60, 90, 100, 365]` and differs from the value in `alhamd_milestone_shown`, it fires a success haptic and shows a dialog with an award icon: «ما شاء الله!», «لقد أتممت {n} أيام متتالية من المداومة على الحمد.», button «متابعة» (lines 60-69, 167-212).
- The streak number itself is never shown outside that dialog.
- `completedSet` is rebuilt on every render and used as a `useMemo` dependency (lines 55, 131), so the month computation is never actually memoised.

### `MyBlessingsView`

- No props (`MyBlessingsView.tsx:28`). Three internal views: `list`, `compose`, `detail`.
- List: title «نِعَمي», a plus button (`aria-label="أضِف نعمة"`), the `DailyAffirmationCard` for today (by day of year), then either the empty state («مساحتك لتدوين النِّعَم بكلماتك», explanatory text, button «أضِف نعمة», and the privacy note «ما تكتبه هنا خاصٌّ بك ويبقى على جهازك. هذه مساحة شخصية للتدبّر، وليست من النصوص الموثّقة في التطبيق.») or cards showing title (or the first line of the body), a two-line excerpt, the creation date and category, with a heart toggle for favourites (lines 183-257).
- Compose and edit: header «اكتب نعمتك» or «تعديل» with «إلغاء» and «حفظ»; an optional title (placeholder «عنوان مختصر (اختياري)»); a required body (placeholder «ما النعمة التي تستشعرها الآن؟ اكتبها كما تشعر بها...»); an optional category under «ضمن أي باب؟ (اختياري)» from seven chips; and a collapsible «تأمّل قيمتها» section with the prompt «تخيّل للحظة أن هذه النعمة غابت عن حياتك... كيف سيكون حالك؟ اكتب ما يخطر ببالك.» and a second textarea (lines 259-359). Saving shows the toast «تم الحفظ» for 3 seconds.
- Category labels (lines 10-18): «نعم الدين», «نعم النفس», «نعم العقل», «نعم النسل», «نعم المال», «نعم الكون», «نعم الوجدان».
- Detail: back, favourite, edit and delete icon buttons; category chip; title (or «نعمة بدون عنوان»); body; an «استشعار القيمة» box if a value reflection exists; creation date (lines 361-430).
- Delete confirmation: «حذف النعمة؟», «سيُحذف هذا التدوين نهائيًا من جهازك.», buttons «حذف» and «إلغاء» (the latter has `autoFocus`) (lines 434-472).
- Data goes through `userBlessingsStore`; the list reloads whenever the view changes (lines 53-60).
- Styling artefacts from `replace.js` remain (section 8), for example `hover:text-brand-accent dark:text-brand-dark-accent` (line 195), where the dark colour applies without hover. `MoreVertical` is imported and unused.

### `DailyAffirmationCard`

- Props: `affirmation: Affirmation` (`DailyAffirmationCard.tsx:4`). Shows the label «رسالة طمأنينة», the text, and the optional context line. Used only by `MyBlessingsView`.

### `DailyDhikrCard`

- Props: `dhikr: Dhikr` (`DailyDhikrCard.tsx:4`). Shows the label «ذكر اليوم», the dhikr text, and the optional virtue line. Used only by `TasbihView`.

### `TasbihView`

- No props (`TasbihView.tsx:20`).
- Title «مسبحة الحمد», the lifetime total «إجمالي الحمد: {n}» (from `state.tasbihCount`, formatted with `ar-EG` digits), `DailyDhikrCard` for today (by day of year), and a chip row of seven phrases (lines 10-18): «الحمد لله», «سبحان الله», «الله أكبر», «لا إله إلا الله», «أستغفر الله», «لا حول ولا قوة إلا بالله», «اللهم صلِّ على محمد».
- A large round button shows the session count and the selected phrase. Each tap increments the session count and the persisted total and fires a haptic: heavy on every 33rd tap of the session, light otherwise (lines 30-41). The condition is written `state.hapticReminders || true`, so the setting has no effect here.
- Choosing another phrase or pressing the reset button zeroes the session count only. The lifetime total cannot be reset.
- `Heart` and `AnimatePresence` are imported and unused.

### `SettingsView`

- Props: `onOpenPrivacyPolicy?: () => void` (`SettingsView.tsx:10-12`).
- Title «الإعدادات», three cards.

| Card | Row | Control and behaviour | Lines |
|---|---|---|---|
| التخصيص | المظهر | `<select>`: «فاتح», «داكن», «تلقائي». Captures `theme_changed` | 88-107 |
| | حجم الخط | `<select>`: «عادي», «كبير». Captures `text_size_changed` | 109-127 |
| | التنبيهات اليومية («تذكير يومي في الوقت المحدد») | Toggle. Turning on requests permission and schedules; if refused, `alert('يرجى تفعيل التنبيهات من إعدادات المتصفح/الجهاز.')` | 129-163 |
| | وقت التذكير | `<input type="time">`. Captures `reminder_set`; reschedules if notifications are on | 165-189 |
| | التنبيهات اللمسية («اهتزاز خفيف للتذكير») | Toggle for the hourly haptic | 191-208 |
| | تحسين التطبيق (إحصائيات مجهولة) | Consent toggle with the note «لا نُرسل نصّ تدويناتك أبدًا — بيانات الاستخدام فقط، ويمكنك إيقافها.» | 210-229 |
| البيانات والنسخ الاحتياطي | احتفظ بنسخة من بياناتك | Export (below) | 238-249 |
| | استعادة البيانات | Opens a hidden `.json` file input; import (below) | 251-269 |
| عن التطبيق | شارك التطبيق | Button with no handler | 279-286 |
| | سياسة الخصوصية | Calls `onOpenPrivacyPolicy` | 288-298 |
| | الإصدار | Static `1.0.0` | 300-303 |

- Export (lines 31-47) builds `{ state, userBlessings, version: 1, date }` where `state` is the whole `AppState` and `userBlessings` is the parsed personal-blessings array, and downloads it through a `data:text/json` URL as `alhamd-backup-YYYY-MM-DD.json`.
- Import (lines 49-75) parses the file. If it has `state`, that object is written to `alhamd_state` unchanged. If it has `userBlessings`, they replace the stored array. It then shows `alert('تم استعادة البيانات بنجاح.')` and reloads the page when `state` was present. A parse error shows `alert('فشل استعادة البيانات. تأكد من الملف.')`. There is no shape validation, and a file with neither key (for example a v2 backup) still reports success.
- The toggles are plain `<button>`s without `role="switch"`, `aria-checked` or an accessible name.

### `PrivacyPolicyView`

- Props: `onClose: () => void` (`PrivacyPolicyView.tsx:5-7`).
- A full-screen overlay with a sticky header (back button with `aria-label="العودة"`, title «سياسة الخصوصية») and six sections (lines 46-112): «مقدمة», «البيانات التي نجمعها», «كيف نستخدم البيانات», «أطراف خارجية», «حقوقك», «تواصل معنا».
- Content in summary: reflections and journal entries stay on the device; anonymous usage statistics may be collected; the third-party section names `PostHog Analytics`; the rights section says data can be erased by deleting the app or clearing its data.
- «آخر تحديث: {date}» prints the current date at render time (lines 11, 41), so it always shows today.
- The contact address is the placeholder `support@example.com` (line 110).
- Uses its own hard-coded cream / near-black / gold palette.

## 6. Data files

| File | Content | Used by |
|---|---|---|
| `data/blessings_ar.json` | `schemaVersion: 2`, a `contentNote`, and 40 blessings. Categories: `din` 13, `nafs` 6, `nasl` 6, `rizq` 4, `afiyah` 4, `aql` 3, `amn` 3, `mal` 1. Every entry has `reviewStatus: "pending_review"`, `quran.verified: false`, `hadith.gradeVerified: false`, `scholarQuote.attributionType: "paraphrase"`, `scholarQuote.verifiedVerbatim: false`, empty `reviewedBy`, `reviewDate: null`, `contentVersion: 1`. The `contentNote` states that all sacred texts are pending review and all scholar quotes are paraphrases | `data/loader.ts` |
| `data/loader.ts` | `CONTENT_REVIEW_GATE = false` (line 4). `getAllBlessings()` returns every blessing; if the flag were true it would return only `approved` ones, which is currently none | `App.tsx:11`, `JournalView.tsx:13` |
| `data/inspirations.ts` | 8 items: 4 verses (Ibrahim 7, al-Baqarah 152, Saba 13, an-Nahl 53) and 4 hadiths (sources given as «صحيح مسلم», «مسند أحمد», «متفق عليه», «سنن أبي داود») | `App.tsx:110` |
| `data/dhikr.ts` | 9 adhkar, each with a `virtue` sentence and no source reference | `TasbihView.tsx:27` |
| `data/affirmations.ts` | 8 reassurance sentences with a `context` line each. No source or review fields | `MyBlessingsView.tsx:50` |

The `Blessing` type also carries `relatedPodcastEpisode` (`types.ts:47`, typed `string`); the data holds 16 distinct episode ids and `null` for the rest. No component reads the field.

## 7. The test file

`legacy/src/lib/dailyLogic.test.ts` is the only test file in the repository.

- Framework: it imports `describe`, `it`, `expect` from `vitest` (line 1).
- Runner configuration: none. `vitest` is not in `legacy/package.json` (lines 13-40) or in `legacy/package-lock.json`; there is no `test` script (lines 6-12) and no Vitest config. The root project has none either. The tests cannot be run as committed.
- Fixture: four partial `Blessing` objects cast to the full type: `islam` (order 0), `b1`, `b2`, `b3` (lines 6-13).

Cases:

| Group | Case | Asserts |
|---|---|---|
| `blessingForDate` | returns a consistent daily blessing excluding `ISLAM_ID` | 2026-09-01, -02, -03 at 00:00Z give `b1`, `b2`, `b3` |
| | cycles via modulo at pool boundary | 2026-09-04 gives `b1` again |
| | handles dates before 1970 gracefully | 1969-12-31 gives `b3` (negative day index) |
| `resolveTodayExperience` | first launch gives two blessings | `[welcome islam, daily b2]` for 2026-09-02T10:00Z with `welcomeSeen = false` |
| | day-two returning user gives one blessing | `[daily b3]` for 2026-09-03T10:00Z |
| | reopen mid-day-one gives one blessing | `[b1]` for 2026-09-01T14:00Z with `welcomeSeen = true` |

Not covered: the empty-pool error, a pool without an `islam` entry, ordering by `order`, and `getDayNumber` on its own.

The assertions depend on the machine's time zone, because the inputs are UTC instants and `getDayNumber` reads local date parts. Re-running the same assertions with `tsx` under different `TZ` values gave:

| `TZ` | Result |
|---|---|
| `UTC`, `Asia/Riyadh`, `Europe/London` | all pass |
| `America/New_York`, `America/Los_Angeles` | the three `blessingForDate` cases fail (the local date is the previous day) |
| `Australia/Sydney`, `Pacific/Auckland` | the "reopen mid-day-one" case fails (14:00Z is already the next local day) |

Against v2's `src/lib/dailyLogic.ts` the three `blessingForDate` cases would apply unchanged (same algorithm, lines 17-33). The three `resolveTodayExperience` cases would not compile, because v2 returns a single `{ blessing, role }` (lines 35-55) instead of a `blessings` array.

## 8. The two one-off scripts

Both are spent migration scripts. Neither is referenced by `package.json`.

### `legacy/replace.js`

- Reads `src/components/MyBlessings/MyBlessingsView.tsx`, applies 18 regular-expression replacements that turn arbitrary hex classes into theme classes (for example `text-[#F4F4F8]` to `text-brand-textPrimary dark:text-brand-dark-textPrimary`, `bg-[#15152A]` to `bg-brand-background dark:bg-brand-dark-background`), writes the file back and prints `done` (lines 1-25).
- It uses `require` in a package with `"type": "module"`, so `node replace.js` fails with `ReferenceError: require is not defined in ES module scope` (checked on a scratch copy). Run as CommonJS against the committed file it changes nothing: the file no longer contains any six-digit hex colour.
- The committed component contains class strings that match what these rules produce when applied to prefixed or suffixed classes. The pre-script source is not in the repository, so the original classes below are inferred from the rules:
  - The general `text-[#AEAECB]` rule (line 6) runs before the `placeholder:text-[#AEAECB]/30` and `/40` rules (lines 21-22), so those can never match. The file has `placeholder:text-brand-textSecondary dark:text-brand-dark-textSecondary/40` (`MyBlessingsView.tsx:290`), where the dark class sets the text colour, not the placeholder colour.
  - Variant prefixes are not carried to the dark half: the file has `hover:text-brand-accent dark:text-brand-dark-accent` (`MyBlessingsView.tsx:195`) and `hover:border-brand-accent/30 dark:border-brand-dark-accent/30` (lines 213, 227), so the dark colours apply without hover.
  - Opacity suffixes end up on the dark half only: the file has `bg-brand-accent dark:bg-brand-dark-accent/10` next to `text-brand-accent` (line 311), which in light mode is accent-coloured text on a solid accent background.

### `legacy/replace-analytics.cjs`

- For six files (`SettingsView`, `MyBlessingsView`, `ReflectionFlow`, `Onboarding`, `SpotlightTour`, `App`; lines 22-27) it rewrites imports of `track` from `lib/analytics` to `analytics` from `services/analytics`, removes an `initAnalytics, track` import, replaces `track(` with `analytics.capture(`, and replaces `localStorage.setItem/getItem/removeItem(` with `storage.…(` (lines 7-13).
- A comment on line 14 notes that the storage calls return promises and may need `await`. The script adds neither `await` nor the `storage` import; the committed files have both, so they were finished by hand.
- It documents a previous state that no longer exists: a `legacy/src/lib/analytics.ts` exporting `initAnalytics` and `track`. The unused `track` stub in `utils.ts:32-35` is probably a remnant of the same period.
- `ConsistencyView.tsx` was not in its list, which is why that file still calls `localStorage` directly.
- `Onboarding.tsx` ended up with an `analytics` import and no calls.

## 9. v1 → v2 comparison

### 9.1 Feature and module table

"v2" columns cite only what was read for this comparison; the v2 modules are documented in their own reference files.

| Feature / module | v1 implementation | v2 implementation | Status |
|---|---|---|---|
| Entry and provider | `main.tsx` → `StoreProvider` → `App` | Same pattern in `src/main.tsx`, plus a second entry for the landing page | Carried over |
| Navigation | Six bottom tabs: home, tasbih, my blessings, journal, consistency, settings (`App.tsx:305-312`) | Five bottom tabs: home, journey, journal, consistency, tasbih (`src/components/layout/BottomTabBar.tsx:49-55`); settings behind a gear in the top bar (`src/components/layout/TopBar.tsx:40-52`) | Rewritten |
| State store | One `AppState` object, async load, one JSON blob under `alhamd_state` (`StoreContext.tsx`) | One `useState` per field, read synchronously from separate `localStorage` keys (`src/lib/store.tsx:113-217`) | Rewritten |
| Storage abstraction | `services/storage.ts`: Capacitor Preferences or `localStorage`, async | Direct synchronous `localStorage` calls | Dropped |
| Daily blessing selection | `lib/dailyLogic.ts` | `src/lib/dailyLogic.ts`: same `getDayNumber` and `blessingForDate`; an empty pool returns `allBlessings[0]` instead of throwing (line 24); `resolveTodayExperience` returns one item instead of a list | Carried over with changes |
| Day rollover while open | `now` refreshed on `visibilitychange` and every 60 s (`App.tsx:61-77`) | Today's blessing is memoised on `[welcomeSeen, allBlessings]` and the inspiration on `[]` (`src/lib/store.tsx:317-326`); no `visibilitychange` listener exists in `src/` | Dropped |
| Welcome blessing | `welcomeSeen` inside `AppState`; list `[welcome, daily]` | Key `alhamd_welcome_seen` (`src/lib/store.tsx:117-119,406-409`); single result | Carried over, simplified |
| Unit test | `lib/dailyLogic.test.ts` (Vitest, not runnable) | None | Dropped |
| Blessings data and loader | `blessings_ar.json`, `loader.ts` | Byte-identical JSON; loader adds `getBlessingById` (`src/data/loader.ts:15-17`) | Carried over as-is |
| Inspirations, adhkar | `data/inspirations.ts`, `data/dhikr.ts` | Identical files | Carried over as-is |
| Inspiration of the day | `inspirations[dayOfYear % 8]` (`App.tsx:108-111`) | `getTodayInspiration(getDayNumber())` (`src/lib/dailyLogic.ts:57-60`) | Rewritten (different index base) |
| Daily affirmation «رسالة طمأنينة» | `DailyAffirmationCard`, `data/affirmations.ts` | No equivalent; no `affirmations` file | Dropped |
| Dhikr of the day | By day of year (`TasbihView.tsx:26-28`) | `getTodayDhikr` exists but is not called; the tasbih screen always uses `dailyDhikrs[0]` (`src/components/screens/TasbihModal.tsx:53`) | Rewritten |
| Home screen | Header card, `InspirationCard`, `BlessingCard` | `src/components/screens/HomeScreen.tsx` | Rewritten |
| Guided reflection | `ReflectionFlow.tsx`: colour arcs, clause-by-clause text, breathing circle, journal step with dhikr counter | `src/components/screens/ReflectionModal.tsx`: step chips (lines 451-455), optional timer with 1, 3 and 5 minute presets (lines 18-22), share button (lines 283-287) | Rewritten |
| Share as image | `html-to-image` `toBlob` of hidden DOM nodes, Web Share, download and clipboard fallback | Canvas drawing in `src/components/common/ShareCardModal.tsx` (lines 141-144, 316-318, 335-337) | Rewritten; `html-to-image` dropped |
| Journal | `JournalView.tsx`: search over text, title and date; category chips; delete | `src/components/screens/JournalScreen.tsx`: two segments «سجل الحمد» and «نِعَمي» (lines 127-163); search over text and title (lines 85-87) | Rewritten |
| Personal blessings | Own tab; free-form body with optional title, category (7 values) and value reflection; `userBlessingsStore` | A segment of the journal screen; title plus three prompts; one of 8 categories (`src/types.ts:73-86`, `src/constants/strings.ts:88-97`). Same storage key, different record shape | Rewritten |
| Consistency | Current Hijri month grid; count for the month; milestone dialog at streaks 3, 7, 14, 21, 30, 60, 90, 100, 365 | `src/components/screens/ConsistencyScreen.tsx`: adds a visible streak tile and chart (lines 60-79, 178) and reminder controls (lines 19-22) | Rewritten; milestone dialog dropped |
| Tasbih | Seven unvocalised phrases; session count plus lifetime total; heavy haptic every 33 session taps | `src/components/screens/TasbihModal.tsx`: seven vocalised presets (lines 24-32); heavy haptic at session multiples of 100 (line 58) and lifetime multiples of 33 (`src/lib/store.tsx:568`); Hisn al-Muslim sub-view; audio player | Rewritten and extended |
| Onboarding | Five swipeable screens with a hadith | Four slides with different copy and an analytics toggle (`src/components/screens/OnboardingScreen.tsx:25-58,148-157`). v1's five-screen copy survives verbatim in `src/constants/strings.ts:20-56`, but nothing reads `APP_STRINGS.onboarding` | Rewritten |
| Spotlight tour | Seven steps by `data-tour` attribute; keyboard support; replay helper never wired | Four steps by element id (`src/components/common/SpotlightTour.tsx:19-40`); replay button in settings (`src/components/screens/SettingsScreen.tsx:620`) | Rewritten |
| Theme | `light`, `dark`, `auto` via a `.dark` class; one-time forced-dark migration | Only `light` or `dark` are accepted from storage (`src/lib/store.tsx:130-134`); `theme-light` / `theme-dark` classes; high-contrast and night-reading modes (lines 136-142) | Rewritten |
| Text size | `normal` or `large` (112.5%) | Numeric size 12 to 24 plus a font-family choice (`src/lib/store.tsx:144-165,452-464`) | Rewritten and extended |
| Daily reminder | Real scheduling on native through `@capacitor/local-notifications`; permission request on web | A stored toggle (default on) and time (default 21:00) (`src/lib/store.tsx:167-174,466-475`). No call to the Notification API or any scheduler exists in `src/` | Dropped (the setting remains) |
| Hourly haptic reminder | `hapticReminders` setting and an hourly interval | None | Dropped |
| Haptics | `services/haptics.ts`: Capacitor on native, `navigator.vibrate` on web | `triggerHaptic` in the store, `navigator.vibrate` only (`src/lib/store.tsx:257-266`) | Rewritten; native path dropped |
| Analytics | PostHog (EU host), 21 event names captured, consent `'granted'` / `'denied'` | `trackJourneyEvent` appends five journey event types to a 50-item ring buffer in `localStorage`; nothing is sent (`src/lib/analytics.ts:20-23,42-46`); consent stored as `'true'` / `'false'` (`src/lib/store.tsx:421-424`) | Dropped (local stub remains) |
| Consent prompt | Modal after the tour; toggle in settings | Toggle on the onboarding screen | Rewritten |
| Privacy policy | Full-screen view, six sections, names PostHog, placeholder e-mail, date computed at render | Modal with three points and a fixed date (`src/components/screens/PrivacyPolicyModal.tsx:28-57`) | Rewritten |
| Backup | `{ state, userBlessings, version: 1, date }`; import overwrites storage and reloads | `BackupPayloadV2` (`src/types.ts:211-230`); importer accepts v2 and v1 files (`src/lib/store.tsx:607-680`) | Rewritten; v1 import supported |
| Hijri dates | `Intl` with `islamic` (header, journal) and `islamic-umalqura` (grid) | `src/lib/hijri.ts`, and `islamic-umalqura` for journal display dates (`src/lib/store.tsx:485`) | Rewritten |
| Journey «رحلتي», paywall, Hisn al-Muslim, charts, About and content-review modals, desktop navigation bar, landing page | None | Present | New in v2 |

### 9.2 What v2 dropped, specifically

- **Capacitor native APIs.** All four `@capacitor/*` packages and the three service modules that used them. v2 is web-only code; `README.md:111` lists native packaging as a future item.
- **Real notification scheduling.** v1 could schedule a daily local notification on a native build. v2 keeps the reminder toggle and time picker but has nothing behind them.
- **PostHog.** No analytics SDK and no network call for analytics remain. The v2 consent flag only controls whether events are appended to a local list.
- **`html-to-image`.** Replaced by drawing share cards on a canvas.
- **The storage abstraction.** v2 calls `localStorage` directly and synchronously throughout the store.
- **The unit test.** v2 has no test file and no runner.
- **Day rollover.** v1 re-evaluated the date in the foreground and every minute; v2 computes today's blessing once per mount.
- **Features:** the "My blessings" tab as a separate destination, the daily affirmation card, the streak milestone dialog, the hourly haptic reminder, `auto` theme, per-day dhikr rotation.

### 9.3 What v2's backup importer accepts from v1

`importBackupJSON` (`src/lib/store.tsx:607-680`) takes the legacy branch when the file is not `version === 2` and has a `state` or a `userBlessings` key (line 636). A file produced by v1's export (`legacy/src/components/SettingsView.tsx:33-38`) always has both keys, so it is recognised. The keys the branch reads (`state.journalEntries`, `state.completedReflections`, `userBlessings`) are exactly the ones v1 writes. The branch was not executed end to end here; the table follows the code.

| v1 field | What v2 does with it | v2 lines |
|---|---|---|
| `state.journalEntries[].id` | Kept | 641 |
| `state.journalEntries[].date` | v1 stores a Hijri display string such as «٢٠ ربيع الآخر ١٤٤٨ هـ» (`legacy/src/App.tsx:148`), which contains no `-`. The importer therefore sets `date` to **the day of the import** and keeps the original string as `displayDate` | 642-643 |
| `.blessingId` | Kept (fallback `'islam'`) | 644 |
| `.shortTitle`, older `.blessingTitle` | Kept (fallback «نعمة») | 645 |
| `.categoryLabel`, older `.category` | Passed through `mapOldCategoryToCanonical` | 646 |
| `.text` | Kept | 647 |
| (no v1 field) | `createdAt` is set to the import time for every entry | 648 |
| `state.completedReflections` | Replaces v2's list unchanged | 653-655 |
| `userBlessings[].title` | Kept (fallback «نعمة شخصية») | 660 |
| `userBlessings[].body` | Copied to `prompt3` and `body` | 663-664 |
| `userBlessings[].valueReflection` | Copied to `prompt2` | 662 |
| `userBlessings[].category` | Passed through `mapOldCategoryToCanonical` | 665 |
| `userBlessings[].isFavorite`, `createdAt`, `updatedAt` | Kept | 666-669 |
| `state.theme`, `textSize`, `notificationTime`, `notificationsEnabled`, `hapticReminders`, `tasbihCount`, `firstLaunchDate`, `welcomeSeen`, `onboardingComplete` | Ignored | n/a |
| top-level `version`, `date` | Ignored | n/a |

`mapOldCategoryToCanonical` (`src/constants/categories.ts:17-28`) applied to every category value v1 can produce (run with `tsx`):

| v1 value | Source | v2 result |
|---|---|---|
| The eight `categoryLabel` strings in `blessings_ar.json` | journal entries | Unchanged (all eight map to themselves) |
| `نعم_الدين` | personal blessing | نعم الدين |
| `نعم_النفس` | personal blessing | نعم الحياة والنفس |
| `نعم_العقل` | personal blessing | نعم العقل |
| `نعم_النسل` | personal blessing | نعم الأهل |
| `نعم_المال` | personal blessing | نعم المال |
| `نعم_الكون` | personal blessing | نعم الحياة والنفس (fallback, line 27) |
| `نعم_الوجدان` | personal blessing | نعم الحياة والنفس (fallback, line 27) |
| no category (optional in v1) | either | نعم الدين (line 18) |

So the format matches and the import succeeds, with these losses:

1. Every imported journal entry is dated on the import day and gets the same `createdAt`. Only the Hijri display string preserves when it was written.
2. Personal blessings without a category are labelled «نعم الدين»; the two v1 categories with no v2 counterpart are folded into «نعم الحياة والنفس».
3. The lifetime tasbih count and all settings are not migrated.
4. The import replaces v2's journal, completed days and personal blessings; it does not merge.
5. v1 recorded completed days as local dates (`legacy/src/utils.ts:22-24`). v2 compares against UTC dates (`src/lib/store.tsx:551,560`). The strings have the same format but a different day boundary.

Separately from file import, v2 reuses four v1 storage key names (`src/lib/store.tsx:62-69`). If v1 was ever served from the same origin as v2 (not known from the repository), a returning browser would behave as follows:

| Key | v1 value | How v2 reads it |
|---|---|---|
| `alhamd_onboarded`, `alhamd:tourComplete` | `'true'` | Same meaning |
| `alhamd:analytics_consent` | `'granted'` / `'denied'` | `val === 'true'` (`src/lib/store.tsx:125-128`): both v1 values read as `false`, and the user is not asked again |
| `alhamd:userBlessings:v1` | v1-shaped records | Parsed and used without mapping (`src/lib/store.tsx:206-212`): underscore category values, optional title, no `prompt` fields |
| `alhamd_state` | Journal, completed days, settings | Never read. `STORAGE_KEYS.STATE` is defined (`src/lib/store.tsx:63`) and unused, so that data stays invisible unless exported from v1 and imported |

### 9.4 Parts of v1 with no v2 counterpart that may be worth keeping

- `services/notifications.ts`: the only code in the repository that schedules the daily reminder the v2 settings promise.
- `services/storage.ts`: the seam needed for Capacitor Preferences if native packaging goes ahead.
- `services/analytics.ts`: a typed, consent-gated event wrapper, if real analytics are wanted.
- `lib/dailyLogic.test.ts`: the only tests for logic that v2 still ships.
- The foreground and interval date refresh in `App.tsx:61-77`.

## 10. Defects present in the v1 code

Listed for anyone who reuses parts of it. None affects v2 at run time.

| Area | Defect | Where |
|---|---|---|
| Types | Three `tsc` errors (section 1) | `SettingsView.tsx:117`, `services/analytics.ts:64`, `lib/dailyLogic.test.ts:1` |
| Analytics | `reflection_started` always reports `source: 'daily'` | `App.tsx:223-228` |
| Reflection | `durationSec` dwell is computed but never gates the next button | `ReflectionFlow.tsx:115,135-149,157` |
| Reflection | Dhikr tap target is not a button | `ReflectionFlow.tsx:325-328` |
| Styling | `var(--brand-primary)` and `pb-safe` are undefined | `BlessingCard.tsx:184,246`; `App.tsx:303` |
| Styling | Broken dark, hover and placeholder class pairs | `MyBlessingsView.tsx:195,213,227,290,311` |
| Storage | Unguarded `JSON.parse` of the saved state; a corrupt value leaves the app blank | `StoreContext.tsx:37` |
| Storage | Milestone key bypasses the storage service | `ConsistencyView.tsx:62,65` |
| Dates | Two different Hijri calendars | `utils.ts:3`; `ConsistencyView.tsx:76-77` |
| Dates | Journal entries store only a display date | `App.tsx:148` |
| Daily logic | JSDoc says UTC, code uses the local date (the same contradiction remains in `src/lib/dailyLogic.ts:8-15`) | `lib/dailyLogic.ts:6-16` |
| Settings | «شارك التطبيق» does nothing; toggles have no switch semantics | `SettingsView.tsx:279-286,134-162` |
| Settings | Import performs no validation and reports success for unrelated JSON | `SettingsView.tsx:54-67` |
| Tasbih | `\|\| true` makes the haptic setting irrelevant | `TasbihView.tsx:34` |
| Privacy | "Last updated" is always today; contact is `support@example.com` | `PrivacyPolicyView.tsx:11,41,110` |
| Content | Onboarding hadith is displayed while flagged `pending_review` | `Onboarding.tsx:8-14,299-309` |
| Dead code | `completeOnboarding`, `onboardingComplete`, `replayTour`, `storage.getJSON/setJSON`, `utils.track`, `haptics.warning`, twelve unused event names, several unused imports | `StoreContext.tsx:71-74`; `SpotlightTour.tsx:54-57`; `services/storage.ts:32-44`; `utils.ts:32-35`; `services/haptics.ts:41-54`; `services/analytics.ts:4-36` |
