# State and persistence

Covers `src/lib/store.tsx`, `src/lib/journeyStore.ts`, `src/lib/entitlements.ts`, `src/lib/analytics.ts` and the state types in `src/types.ts`. Everything the app remembers is in the browser's `localStorage`; there is no server.

> Updated for commits `d3dfd92` to `b8db9cc` (17 November 2026): new users start empty, the welcome blessing is recorded, day keys are local, the journey is free with the paywall switched off, and the daily reflection records consent-gated events (`trackEvent` in `src/lib/analytics.ts`: `reflection_started`, `reflection_step_viewed`, `reflection_completed`, kept on the device). Sections 1.1, 1.2, 1.4, 1.5, 2 and 5 describe the code after that commit. Line numbers still refer to `68e723a`; in `src/lib/store.tsx` they have moved.

## 1. The store (`src/lib/store.tsx`, 753 lines)

`StoreProvider` (`src/lib/store.tsx:111`) is a single React Context provider. Each field is its own `useState` with a lazy initialiser that reads `localStorage`. `useStore()` (`src/lib/store.tsx:749`) returns the context and throws when used outside the provider.

The context value is a fresh object literal on every render (`src/lib/store.tsx:683`), so every component that calls `useStore()` re-renders on any state change, including each tasbih tap.

### 1.1 State fields

| Field | Type | Default for a new user | Storage key | Written |
|---|---|---|---|---|
| `onboardingComplete` | boolean | `false` | `alhamd_onboarded` | in `completeOnboarding` |
| `welcomeSeen` | boolean | `false` | `alhamd_welcome_seen` | effect, once the welcome reflection is finished (see 1.5) |
| `welcomeDate` | local `YYYY-MM-DD` \| null | `null` | `alhamd_welcome_date` | same effect |
| `tourCompleted` | boolean | `false` | `alhamd:tourComplete` | in `completeTour`; removed by `replayTour` |
| `analyticsConsent` | boolean \| null | `null` (not asked) | `alhamd:analytics_consent` | in `setAnalyticsConsent` |
| `theme` | `ThemeMode` | `'dark'` | `alhamd_theme_v2` | effect, `src/lib/store.tsx:335` |
| `highContrast` | boolean | `false` | `alhamd_high_contrast` | effect, `:347` |
| `nightReadingMode` | boolean | `false` | `alhamd_night_reading` | effect, `:353` |
| `fontFamily` | `'ibm' \| 'noto-naskh' \| 'amiri' \| 'tajawal'` | `'ibm'` | `alhamd_font_family` | effect, `:360` |
| `textSize` | `'normal' \| 'large' \| 'xlarge'` | `'normal'` | `alhamd_text_size` | effect, `:375` (derived from `fontSize`) |
| `fontSize` | number, 12–24 px in 0.5 steps | `16` | `alhamd_font_size_v2` | effect, `:375` |
| `notificationsEnabled` | boolean | `true` (anything except the string `'false'`) | `alhamd_notif_enabled` | in setter |
| `notificationTime` | `"HH:mm"` | `'21:00'` | `alhamd_notif_time` | in setter |
| `completedReflections` | string[] of local `YYYY-MM-DD` | `[]` | `alhamd_completed_reflections` | effect |
| `journalEntries` | `JournalEntry[]` | `[]` | `alhamd_journal` | effect |
| `userBlessings` | `UserBlessing[]` | `[]` | `alhamd:userBlessings:v1` | effect |
| `tasbihCount` | number | `0` | `alhamd_tasbih_count` | in `incrementTasbih` / `resetTasbih` |
| `journeyState` | `JourneyState` | built by `createDefaultJourneyState()` | `alhamd:journey_state:v1` | effect `:220` and `saveJourneyState` |

Notes:

- `ThemeMode` includes `'auto'` (`src/types.ts:99`), but the initialiser only accepts `'light'` or `'dark'` (`src/lib/store.tsx:133`) and the effect treats anything that is not `'light'` as dark. There is no system-theme detection.
- The theme initialiser deletes the old key `alhamd_theme` on every start (`src/lib/store.tsx:131`).
- The comment on `AppState.fontSize` says the default is 15 (`src/types.ts:161`); the code default is 16 (`src/lib/store.tsx:164`).
- `STORAGE_KEYS.STATE` (`'alhamd_state'`, `src/lib/store.tsx:63`) is declared and never used.
- `firstLaunchDate` is always `null` in the context value (`src/lib/store.tsx:704`).
- `src/lib/store.tsx:27`–`60` re-declare `JourneyStation`, `JourneyStage` and `JourneyState` locally with extra optional fields (`stageIndex`, `completed`, `intention`). They shadow the versions in `src/types.ts` inside this file only.

### 1.2 Derived values and aliases

| Value | How it is computed |
|---|---|
| `today` (internal) | `useLocalDay()`: the local `YYYY-MM-DD`, re-read when the tab becomes visible and once a minute |
| `todayBlessing`, `todayRole` | `resolveTodayExperience(today, welcomeSeen, allBlessings, welcomeDate)`. `todayRole` is `'welcome'` or `'daily'`. Recomputed when the day changes |
| `todayInspiration` | `getTodayInspiration(getDayNumber(today))`, recomputed when the day changes |
| `isCompletedToday` | `completedReflections.includes(today)`: the local day |
| `entries` | alias of `journalEntries` |
| `completedDays` | alias of `completedReflections` |
| `onboardingCompleted` | alias of `onboardingComplete` |
| `markTodayCompleted` | alias of `markReflectionCompleted` |

### 1.3 Actions

| Action | Effect | Haptic |
|---|---|---|
| `completeOnboarding()` | Sets the flag and key | success |
| `markWelcomeSeen()` | Sets the flag and, once, the local day. `App` calls it when a reflection is finished while `todayRole` is `'welcome'` | none |
| `completeTour()` / `replayTour()` | Sets / clears `alhamd:tourComplete` | none |
| `setAnalyticsConsent(bool)` | Stores `'true'` or `'false'` | none |
| `setTheme(mode)` | Sets theme; choosing `light` turns night-reading off | none |
| `setHighContrast(bool)` | Enabling turns night-reading off | none |
| `setNightReadingMode(bool)` | Enabling forces theme `dark` and high-contrast off | none |
| `setFontFamily(font)` | Sets the family | none |
| `setFontSize(px)` | Rounds to 0.5, clamps to 12–24, derives `textSize` (≥20 xlarge, ≥18 large) | none |
| `setTextSize(size)` | Sets `fontSize` to 16 / 18 / 20 | none |
| `setNotificationTime(time)` | Stores the string | none |
| `setNotificationsEnabled(bool)` | Stores the flag | light |
| `addJournalEntry(textOrObject)` | Prepends an entry. Missing `blessingId`, `shortTitle`, `categoryLabel` default to today's blessing; `date` defaults to the UTC date; `displayDate` is weekday plus Hijri day and month. Id is `entry_<ms>_<5 random chars>`. Returns the entry | success |
| `deleteJournalEntry(id)` | Removes it | medium |
| `addUserBlessing(data)` | Prepends a `UserBlessing`; `body` is set to `prompt3 \|\| title`. Id is `user_blessing_<ms>_<5 random chars>` | success |
| `updateUserBlessing(id, patch)` | Shallow-merges and bumps `updatedAt`. Called by no component | light |
| `deleteUserBlessing(id)` | Removes it | medium |
| `toggleFavoriteUserBlessing(id)` | Flips `isFavorite` (does not bump `updatedAt`) | light |
| `markReflectionCompleted(isoDate?)` | Prepends the date (default: UTC today) if absent | success |
| `isReflectionCompletedToday()` | Same test as `isCompletedToday` | none |
| `incrementTasbih()` | +1, persisted; heavy haptic on every multiple of 33 | light / heavy |
| `resetTasbih()` | Sets 0 | medium |
| `exportBackupJSON()` | Returns the backup as a pretty-printed string (section 3) | none |
| `importBackupJSON(json)` | Restores a backup, returns `{ success, message }` (section 3) | none |
| `triggerHaptic(type)` | `navigator.vibrate`: light 8 ms, medium 20 ms, heavy 35 ms, success `[15, 30, 25]` | n/a |
| `updateJourneyState(updater)` | Sanitises, saves, sets | none |
| `completeJourneyOnboardingState(params)` | Wraps `completeJourneyOnboarding` | success |
| `completeJourneyStationState(params)` | Wraps `completeJourneyStation` | success |
| `saveJourneyStationJournal(id, text)` | Wraps `saveStationJournal` | success |
| `saveJourneyStageMuhasaba(stageId, q1, q2)` | Wraps `saveStageMuhasaba` | success |
| `resetJourneyState()` | Wraps `devResetEntireJourney` | medium |

Because `incrementTasbih` calls `triggerHaptic` and writes `localStorage` inside a `setState` updater (`src/lib/store.tsx:565`), React StrictMode runs those side effects twice per tap in development.

### 1.4 First run, and the samples earlier builds seeded

Since `d3dfd92` a new user starts with an empty journal, no personal blessings and no completed days.

Builds before that commit started every new user with content the user did not create:

- `alhamd_completed_reflections`: yesterday, two days ago and four days ago (`src/lib/store.tsx:181`–`190`).
- `alhamd_journal`: two entries, «الأم» and «الماء», with the fixed display dates «الأحد ٢٥ ذو الحجة» and «السبت ٢٤ ذو الحجة» (`src/lib/store.tsx:71`–`92`).
- `alhamd:userBlessings:v1`: one personal blessing, «صوت المطر على نافذتي», marked favourite (`src/lib/store.tsx:94`–`107`).

The persistence effects wrote these to `localStorage` on first render, so existing users still have them. `readInitialHistory()` removes them when the store starts, and `importBackupJSON()` removes them from imported files:

- The journal entries (`sample_entry_1`, `sample_entry_2`) and the personal blessing (`sample_user_blessing_1`) are dropped by id.
- The three days are recomputed from the first-launch time, which is recovered from the seeded journal entry (created exactly one day before first launch) or from `createdAt` in the journey state. They are removed only when all three are present, so a day the user really completed is never dropped. A user who deleted the seeded journal entry and first launched before the journey existed keeps the three days.

### 1.5 The welcome blessing

`resolveTodayExperience` returns the blessing with id `islam` (role `'welcome'`) while `welcomeSeen` is false, and also on `welcomeDate`, the day the welcome reflection was finished. From the next day it returns the daily blessing.

- `App.handleReflectionComplete` calls `markWelcomeSeen()` when the finished reflection was the welcome one. Closing the reflection without finishing it does not count.
- On the day it is finished, Home keeps showing «نعمة الإسلام», marked as done; the rotation starts the following local day. v1 switched to the daily blessing immediately. v2 records completion per day, not per blessing, so an immediate switch would show the new blessing as already done.
- Migration: a user whose history, after the clean-up in 1.4, has at least one completed day is treated as having finished the welcome reflection, with `welcomeDate` set to their latest completed day.

Before `d3dfd92`, `welcomeSeen` only became true through `markWelcomeSeen()`, and no component called it. In v1 the flag was set after the first reflection (`legacy/src/App.tsx:160`, `177`). The result, confirmed in a headless browser on three different dates: Home shows «نعمة الإسلام» every day, and the daily rotation only appears when `alhamd_welcome_seen` is set by hand.

### 1.6 Effects that touch the document

| Effect | What it does |
|---|---|
| Theme (`:335`) | Sets `light theme-light` or `dark theme-dark` on `<html>` |
| High contrast (`:347`) | Toggles `high-contrast` on `<html>` |
| Night reading (`:353`) | Toggles `night-reading` on `<html>` |
| Font family (`:360`) | Sets `--font-sans` to the chosen stack and `data-font-family` on `<html>` |
| Font size (`:375`) | Sets `--app-font-size` and `html { font-size }`, and one of `text-size-normal\|large\|xlarge` on `<html>` |

Font stacks (`src/lib/store.tsx:362`): `ibm` → `'IBM Plex Sans Arabic', sans-serif`; `noto-naskh` → `'Noto Naskh Arabic', 'Amiri', serif`; `amiri` → `'Amiri', serif`; `tajawal` → `'Tajawal', 'IBM Plex Sans Arabic', sans-serif`.

## 2. Storage key registry

Every key the current code reads or writes. The two naming styles (`alhamd_snake` and `alhamd:colon:vN`) both come from the code.

| Key | Owner | Value |
|---|---|---|
| `alhamd_onboarded` | store | `'true'` |
| `alhamd_welcome_seen` | store | `'true'` |
| `alhamd_welcome_date` | store | local `YYYY-MM-DD` on which the welcome reflection was finished |
| `alhamd:tourComplete` | store | `'true'` |
| `alhamd:analytics_consent` | store, analytics | `'true'` / `'false'` |
| `alhamd_theme_v2` | store | `'dark'` / `'light'` |
| `alhamd_theme` | store | removed on every start (old key) |
| `alhamd_high_contrast` | store | `'true'` / `'false'` |
| `alhamd_night_reading` | store | `'true'` / `'false'` |
| `alhamd_font_family` | store | font id |
| `alhamd_font_size_v2` | store | number as string |
| `alhamd_text_size` | store | `normal` / `large` / `xlarge` |
| `alhamd_notif_enabled` | store | `'true'` / `'false'` |
| `alhamd_notif_time` | store | `HH:mm` |
| `alhamd_completed_reflections` | store | JSON array of dates |
| `alhamd_journal` | store | JSON array of `JournalEntry` |
| `alhamd:userBlessings:v1` | store | JSON array of `UserBlessing` |
| `alhamd_tasbih_count` | store | integer as string |
| `alhamd:journey_state:v1` | journeyStore, store | JSON `JourneyState` |
| `alhamd:journey_onboarded:v1` | journeyStore | `'true'` |
| `alhamd:dev_premium` | entitlements | `'true'` / `'false'` |
| `alhamd:analytics_events_log` | analytics | JSON array, last 50 events |
| `alhamd_hisn_counts_<YYYY-MM-DD>` | `HisnScreen.tsx:128` | JSON map of per-dhikr counts for that day; a new key is created each day and old ones are never removed |
| `alhamd_hisn_favorites` | `HisnScreen.tsx:143` | JSON array of dhikr ids |
| `alhamd_tasbih_reciter_v1` | `TasbihAudioPlayer.tsx:150` | reciter id |
| `alhamd_tasbih_volume_v1` | `TasbihAudioPlayer.tsx:151` | 0–1 as string |

Most reads in the store are not wrapped in `try`/`catch` (for example `src/lib/store.tsx:114`–`174`), so a browser that blocks storage would throw during the first render.

## 3. Backup format

`exportBackupJSON()` (`src/lib/store.tsx:583`) produces `BackupPayloadV2` (`src/types.ts:211`):

```jsonc
{
  "version": 2,
  "exportedAt": "ISO timestamp",
  "settings": {
    "theme", "highContrast", "nightReadingMode", "fontFamily", "textSize", "fontSize",
    "notificationTime", "notificationsEnabled", "onboardingComplete", "welcomeSeen"
  },
  "journal": [JournalEntry],
  "completedDays": ["YYYY-MM-DD"],
  "personalBlessings": [UserBlessing],
  "journeyState": JourneyState   // passed through sanitizeJourneyState
}
```

Not included in a backup: tasbih count, Hisn Al-Muslim counters and favourites, reciter and volume, analytics consent, tour state, journey onboarding flag, premium flag.

`importBackupJSON()` (`src/lib/store.tsx:607`):

- **Version 2.** Replaces journal, completed days and personal blessings when each is an array; sanitises and saves `journeyState`; applies `theme`, `highContrast`, `nightReadingMode`, `fontFamily`, `textSize`, `fontSize`, `notificationTime`. It ignores `notificationsEnabled`, `onboardingComplete` and `welcomeSeen` even though they are exported. Returns «تم استرجاع بياناتك بنجاح.»
- **Version 1** (any object with `state` or `userBlessings`). Maps `state.journalEntries` and `userBlessings` into the v2 shapes, mapping categories through `mapOldCategoryToCanonical`; copies `state.completedReflections`. Every migrated entry gets `createdAt: Date.now()`. Returns «تم استرجاع النسخة الاحتياطية وترقيتها بنجاح.»
- Anything else returns «ملف النسخة الاحتياطية غير متوافق.»; a JSON parse error returns «تعذر قراءة ملف النسخة الاحتياطية.»

Import **replaces** existing data; it does not merge. Array elements and setting values are not validated: any array is accepted as the journal, and any truthy value is accepted as `theme` or `fontFamily`. A malformed element reaches the screens as-is. `journeyState` is the only part that is validated.

## 4. Journey store (`src/lib/journeyStore.ts`, 575 lines)

Plain functions over `localStorage`, usable outside React.

### 4.1 State shape (`JourneyState`, `src/types.ts:133`)

| Field | Meaning |
|---|---|
| `schemaVersion` | Always `1`; anything else is replaced by the default state |
| `createdAt` | ISO timestamp |
| `focusThemes` | Theme keys chosen in onboarding (default `['din', 'afiyah']`) |
| `pace` | `1` or `2` stations per day |
| `reminderTime` | `"HH:mm"` or `null` (default `'21:00'`) |
| `stages` | Ordered `JourneyStage[]`, each with `stationBlessingIds` (max 7) and hydrated `stations` |
| `stations` | Flat list of all stations, hydrated with `completedAt` and `journalText` |
| `completed` | `stationId → { completedAt }` |
| `unlockedTodayCount` | Stations completed on `lastUnlockDate` |
| `lastUnlockDate` | Local `YYYY-MM-DD` |
| `journal` | `stationId → private text` |
| `muhasaba` | `stageId → { q1, q2, completedAt }` |

Station ids are deterministic: `` `${stageId}_station_${index + 1}` `` (`makeStationId`, `src/lib/journeyStore.ts:71`).

### 4.2 Functions

| Function | Behaviour |
|---|---|
| `getLocalDateString(date?)` | Local `YYYY-MM-DD`; delegates to `toLocalDateString` in `src/lib/dates.ts`, which the whole app uses since `d3dfd92` |
| `getAllStageTemplates()` / `getStageContent(id, theme?)` / `getStationContent(stageId, index, blessingId)` | Read `journey_content.json`. `getStationContent` falls back to a generic prompt and action marked `pending_review` when nothing matches |
| `buildStagesFromThemes(themes)` | Maps theme keys (also `focusLabel`, stage id, and four Arabic aliases) to stage templates in the order chosen, de-duplicated; falls back to the first two templates when nothing matches; takes the first 7 stations of each |
| `createDefaultJourneyState()` | Themes `din` and `afiyah`, pace 1, reminder 21:00, nothing completed |
| `syncDailyUnlockWindow(state)` | Resets `unlockedTodayCount` when the local date changed; never touches progress |
| `sanitizeJourneyState(any)` | Rebuilds a valid state field by field: drops non-string themes, coerces pace, keeps only completed entries with a string `completedAt`, drops empty journal text, rebuilds stations from `stationBlessingIds`, clamps the unlock count at 0 |
| `loadJourneyState()` | Reads, sanitises, syncs the unlock window, saves when it changed; any error returns and saves the default state |
| `saveJourneyState(state)` | Sanitises again, writes the key, dispatches `alhamd:journey_updated` with the state as `detail` |
| `hasCompletedJourneyOnboarding()` | Reads `alhamd:journey_onboarded:v1` |
| `completeJourneyOnboarding({ focusThemes, pace, reminderTime })` | Rebuilds stages from the chosen themes on top of the existing state, so completed stations and journal text keyed by station id survive; sets the onboarded flag |
| `completeJourneyStation({ stationId, journalText? })` | Records `completedAt` (kept if already set), stores trimmed text when non-empty, increments `unlockedTodayCount` only for a first completion |
| `saveStationJournal(stationId, text)` | Stores trimmed text or deletes the entry when empty |
| `saveStageMuhasaba(stageId, q1, q2)` | Stores trimmed answers; keeps the first `completedAt` |
| `hasMissedDaysRecently(state)` | True when the latest completion is older than yesterday; used only to show a welcome-back line |
| `devResetTodayPacingLock()` | Sets `unlockedTodayCount` to 0 |
| `devResetEntireJourney()` | Removes both journey keys and saves a default state |

### 4.3 Two writers, one key

`alhamd:journey_state:v1` is written by `saveJourneyState` and again by a store effect on every `journeyState` change (`src/lib/store.tsx:220`). `saveJourneyState` dispatches `alhamd:journey_updated`; the store listens (`src/lib/store.tsx:229`), reloads from storage and replaces its copy when the serialised value differs. Each save therefore costs several `JSON.stringify` passes and a reload. The mechanism exists so that components can call `journeyStore` functions directly and still update the React tree.

The daily pacing rule (`pace` versus `unlockedTodayCount`) and the free-tier limit are enforced in `JourneyPathScreen`, not in this module; see [09-journey.md](09-journey.md).

## 5. Entitlements (`src/lib/entitlements.ts`, 96 lines)

| Export | Behaviour |
|---|---|
| `DEV_PREMIUM_STORAGE_KEY` | `'alhamd:dev_premium'` |
| `ENTITLEMENT_CHANGED_EVENT` | `'alhamd:entitlement_changed'` |
| `FREE_STATION_LIMIT` | `2` |
| `PAYWALL_ENABLED` | `false` since `b8db9cc`: the journey is free for everyone. While it is false, `isPremium()` and `getDeveloperPremiumSync()` return true, and the paywall and the developer block in Settings are not rendered |
| `isPremium()` | async; returns `getDeveloperPremiumSync()` |
| `getEntitlementStatus()` | async; `{ isPremium, plan: 'lifetime' \| 'free', source: 'local_dev' }`. Imported by nothing |
| `getDeveloperPremiumSync()` | `localStorage['alhamd:dev_premium'] === 'true'` |
| `setDeveloperPremium(bool)` | Writes the key, dispatches the event |
| `toggleDeveloperPremium()` | Imported by nothing |
| `subscribeEntitlementChange(listener)` | Listens for the event, returns an unsubscribe function |

There is no payment provider. Premium is whatever that `localStorage` key says. It is set to `'true'` by the paywall (`src/components/screens/PremiumPaywallScreen.tsx:54`) and by a switch in Settings (`src/components/screens/SettingsScreen.tsx:669`). Since `b8db9cc` the journey is free: `PAYWALL_ENABLED` is false, every premium check answers yes, and neither the paywall nor the Settings switch is rendered. If a paywall is ever switched back on, the unlock must first be replaced by a real purchase check. Three `TODO: RevenueCat` comments mark where a real check would go (`src/lib/entitlements.ts:17`, `26`, `34`).

Callers: `App.tsx:67` (tab gate), `JourneyPathScreen.tsx` (station gating), `SettingsScreen.tsx` (developer switch), `PremiumPaywallScreen.tsx` (unlock).

## 6. Analytics (`src/lib/analytics.ts`, 50 lines)

`trackJourneyEvent(name, metadata?)`:

1. Returns immediately unless `alhamd:analytics_consent` is exactly `'true'`.
2. Copies only the allow-listed metadata keys `themes_count`, `pace`, `stage_id`, `station_index`, `plan`.
3. Appends `{ event, metadata, timestamp }` to `alhamd:analytics_events_log`, keeping the last 50.

Nothing is transmitted; the log is never read by the app. The five events and their call sites:

| Event | Metadata | Call site |
|---|---|---|
| `journey_onboarded` | `themes_count`, `pace` | `JourneyPathScreen.tsx:351` |
| `journey_station_completed` | `stage_id`, `station_index` | `JourneyPathScreen.tsx:451` |
| `journey_stage_completed` | `stage_id` | `JourneyPathScreen.tsx:586` |
| `journey_paywall_viewed` | none | `PremiumPaywallScreen.tsx:28` |
| `journey_paywall_cta_tapped` | `plan` | `PremiumPaywallScreen.tsx:39` |

The free daily reflection, the core of the product, records no event.

## 7. State types (`src/types.ts`)

| Type | Purpose |
|---|---|
| `QuranReference`, `HadithReference`, `ScholarQuote`, `IstisharStep`, `IstisharStepType`, `Blessing`, `BlessingsData` | Content schema, see [04](04-content-and-data.md) |
| `JournalEntry` | `id`, `date`, optional `displayDate`, `blessingId`, `shortTitle`, `categoryLabel`, `text`, `createdAt` |
| `UserBlessing` | `id`, `title`, optional `prompt1`–`prompt3`, optional legacy `body` and `valueReflection`, `category`, `isFavorite`, `source: 'user'`, `createdAt`, `updatedAt` |
| `InspirationItem`, `DhikrItem` | Daily verse/hadith and dhikr |
| `ThemeMode`, `TextSize`, `DisplayFontFamily` | Appearance settings |
| `JourneyStation`, `JourneyStage`, `JourneyState` | Journey, section 4 |
| `AppState` | The persisted fields of the store |
| `StoreContextType` | `AppState` plus derived values and actions |
| `BackupPayloadV2` | Backup file, section 3 |
