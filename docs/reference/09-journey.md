# My Journey (رحلتي) — premium feature

> **Changed since this was written** (commits `d3dfd92` to `b8db9cc`, 17 November 2026): the journey is free for everyone. `PAYWALL_ENABLED` in `src/lib/entitlements.ts` is false, so the tab opens the journey directly, `premiumStatus` is always true, and neither paywall is rendered; the free-tier branches described below are dead code. Three defects described below are fixed: set-up opens on the first visit, a station's note is copied to the main journal once, and the path stays on a finished stage until its review is saved. The label «محتوى توجيهي (قيد المراجعة)» was removed, and the station flow splits text without a regex lookbehind. The other defects in FINDINGS, section J, are still present and now reachable by every user.

This document covers every file in `src/components/journey/`, the one-line shim `src/components/screens/JourneyPathScreen.tsx`, and the content file `src/data/journey_content.json`.

The logic these components call (`src/lib/journeyStore.ts`, `src/lib/entitlements.ts`, `src/lib/analytics.ts`, `src/lib/store.tsx`) is described in [02-state-and-persistence.md](02-state-and-persistence.md). The real paywall component, `src/components/screens/PremiumPaywallScreen.tsx`, is described with the other screens. Both are referenced here only where a journey component calls into them.

Conventions:

- Line references are `path:line` against the working tree at commit `68e723a`. A bare `:N` that follows a full reference inside the same parentheses refers to that same file. Otherwise, inside a per-file section, a bare `:N` refers to that section's file.
- Arabic UI strings are quoted verbatim in "…". `{…}` inside a quoted string marks an interpolated value.
- "The store" means the object returned by `useStore()` (`src/lib/store.tsx:749`).
- Vocabulary used by the code: a *stage* (منزل) is a themed group of seven *stations* (محطة). Each station points at one blessing in `src/data/blessings_ar.json`. *Muhasaba* (وقفة محاسبة) is the end-of-stage review.

## Files

| Path | Lines | Role |
|---|---|---|
| `src/components/journey/JourneyPathScreen.tsx` | 1,398 | Root screen of the feature. Renders the top bar, stage selector, the seven-station path and the stats tab, and owns every overlay (customisation screen, station preview modal, station flow, muhasaba screen, paywall). |
| `src/components/journey/JourneyStationFlow.tsx` | 533 | Full-screen guided session for one station: five paced reflection steps, journal prompt, daily action, closing screen. |
| `src/components/journey/JourneyOnboarding.tsx` | 377 | Customisation form: focus themes and their order, daily pace (1 or 2), optional reminder time. Used for first-time setup and for later edits. |
| `src/components/journey/JourneyMuhasabaScreen.tsx` | 170 | Full-screen end-of-stage review: lists the stage's seven station journal texts and asks two questions. |
| `src/components/journey/JourneyWeeklyProgressChart.tsx` | 347 | Recharts card for the last seven days: daily bars, cumulative area, three counters. |
| `src/components/journey/JourneyPaywall.tsx` | 7 | Re-export shim for the paywall under two names. Imported by nothing. |
| `src/components/journey/PremiumPaywallScreen.tsx` | 5 | Re-export shim for the paywall. Imported by `JourneyPathScreen.tsx`. |
| `src/components/screens/JourneyPathScreen.tsx` | 1 | Re-export shim for the path screen. Imported by nothing. |
| `src/data/journey_content.json` | 725 | Authored content: 4 stages × 7 stations (intention, journal prompt, daily action, placeholders, review fields). |

There are no tests for any of these files. `package.json` has no test script or test runner; the only check is `tsc --noEmit`.

## How the feature works end to end

### 1. Entry and gating

1. The tab is labelled "رحلتي" (`src/constants/strings.ts:11`). Tapping it calls `handleTabChange('journey')` in `App`.
2. `handleTabChange` reads the developer flag synchronously with `getDeveloperPremiumSync()` (`src/App.tsx:67`). The flag is the `localStorage` key `alhamd:dev_premium` (`src/lib/entitlements.ts:1`, `:46-53`).
   - Flag false: `App` opens its own paywall (`triggerReason="preview"`) and does **not** switch tabs (`src/App.tsx:67-70`, `:209-218`). If the user unlocks there, `App` closes the paywall and sets the tab to `journey` (`src/App.tsx:213-216`).
   - Flag true: `App` renders `<JourneyPathScreen />` with no props (`src/App.tsx:158-160`).
3. `JourneyPathScreen` keeps its own copy of the entitlement in `premiumStatus`. It is initialised from `getDeveloperPremiumSync()` (`src/components/journey/JourneyPathScreen.tsx:196`), then refreshed by an effect that awaits `isPremium()` on mount and again on every `alhamd:entitlement_changed` window event (`src/components/journey/JourneyPathScreen.tsx:251-270`).
4. The path screen contains a complete free-tier mode driven by `premiumStatus === false`:
   - only the first stage is listed in `revealedStages` (`src/components/journey/JourneyPathScreen.tsx:276-278`);
   - `FREE_STATION_LIMIT` (2, `src/lib/entitlements.ts:3`) is applied in several places (see the lock table in section 4);
   - a second paywall instance is rendered by the path screen itself (`src/components/journey/JourneyPathScreen.tsx:1379-1393`).

   Because of step 2, the screen is only mounted while the flag is true, and leaving the tab unmounts it. Nothing in the UI turns the flag off while the journey tab is showing, so **the free-tier branches inside `JourneyPathScreen` are not reachable through the app as it is wired today**. They would run only if the flag were cleared while the screen is mounted and the `alhamd:entitlement_changed` event fired in the same window.

### 2. Customisation ("onboarding")

1. `showOnboarding` starts as `false` (`src/components/journey/JourneyPathScreen.tsx:198`). It is set to `true` in exactly two places:
   - the "تخصيص" button in the top bar (`src/components/journey/JourneyPathScreen.tsx:674-683`);
   - the `onUnlocked` callback of the path screen's own paywall, and only when `hasCompletedJourneyOnboarding()` is false (`src/components/journey/JourneyPathScreen.tsx:1386-1391`).
2. Since the path screen's own paywall is unreachable (section 1), **first-time setup is never opened automatically**. A user who unlocks through `App`'s paywall or the Settings developer switch lands directly on the path, running on the default state built by `createDefaultJourneyState()`: themes `din` and `afiyah`, pace 1, reminder `21:00` (`src/lib/journeyStore.ts:198-217`). The flag `alhamd:journey_onboarded:v1` stays unset until the user taps "تخصيص" and saves.
3. While `showOnboarding` is true the path screen returns `<JourneyOnboarding>` instead of its normal tree (`src/components/journey/JourneyPathScreen.tsx:597-608`). It is pre-filled from `state.focusThemes`, `state.pace` and `state.reminderTime || notificationTime`. `isEditing` is `hasCompletedJourneyOnboarding()`, which reads `alhamd:journey_onboarded:v1` (`src/lib/journeyStore.ts:403-409`); it only changes the headings and button label.
4. Saving calls `handleOnboardingComplete` (`src/components/journey/JourneyPathScreen.tsx:341-357`):
   - `completeJourneyOnboardingState(params)` from the store. The store wrapper calls `completeJourneyOnboarding` (`src/lib/store.tsx:268-276`), which rebuilds `stages` from the chosen themes in the chosen order, keeps `completed`, `journal` and `muhasaba` as they are, sets `alhamd:journey_onboarded:v1` to `'true'` and saves (`src/lib/journeyStore.ts:414-433`).
   - If a reminder time was chosen, it is copied into the app-wide notification settings: `setNotificationTime(time)` and `setNotificationsEnabled(true)` (`src/components/journey/JourneyPathScreen.tsx:347-350`). Turning the reminder off stores `reminderTime: null` in the journey state but does not touch the app-wide notification switch.
   - `trackJourneyEvent('journey_onboarded', { themes_count, pace })`.
   - The form is closed and a `success` haptic fires.
5. The back arrow calls `onCancel`, which only hides the form (`src/components/journey/JourneyPathScreen.tsx:605`).

No code under `src/` uses the Notification API or a service worker (searched for `Notification`, `serviceWorker`, `showNotification`, `requestPermission`). The reminder time is a stored preference only.

### 3. The path screen

All values below are derived on every render from `journeyState` (aliased `state`, `src/components/journey/JourneyPathScreen.tsx:184`).

- **Current pointer.** `currentPointer` is the first station, scanning `state.stages` in order and stations by index, whose id is not a key of `state.completed` (`src/components/journey/JourneyPathScreen.tsx:295-311`). Station ids are `{stageId}_station_{index+1}` (`src/lib/journeyStore.ts:71-73`). When everything is complete the pointer is pinned to station 7 of the last stage with `allCompleted: true` (`src/components/journey/JourneyPathScreen.tsx:313-323`).
- **Revealed stages.** For a premium user the list starts with stage 0 and keeps adding the next stage while the previous one has all its stations complete **and** has a `state.muhasaba[stage.id]` entry (`src/components/journey/JourneyPathScreen.tsx:279-291`). This list only feeds the stage selector pills.
- **Displayed stage.** `displayedStage` is the revealed stage the user picked with a pill, otherwise `currentPointer.stage` (`src/components/journey/JourneyPathScreen.tsx:626-629`). The third fallback in that expression can never be reached because `currentPointer.stage` is always set.
- **Counters.** `totalCompletedCount` is the number of keys in `state.completed`; `dailyPaceReached` is `state.unlockedTodayCount >= state.pace`; `freeTasteLimitReached` is `!premiumStatus && totalCompletedCount >= FREE_STATION_LIMIT` (`src/components/journey/JourneyPathScreen.tsx:326-328`).

What the user sees (path tab):

1. A top bar with the pointer position, "المحطة {n} من {٧} · {stage title}", a two-way switch "مسار الرحلة" / "الإحصائيات", and the "تخصيص" button (`src/components/journey/JourneyPathScreen.tsx:637-685`).
2. Stage pills "{n}. {stage title}", only when more than one stage is revealed (`src/components/journey/JourneyPathScreen.tsx:688-708`).
3. One card for the displayed stage (`src/components/journey/JourneyPathScreen.tsx:711-909`):
   - header: stage title, "{done} / {٧} مكتملة", "أتممت ورد اليوم" when the daily pace is reached, the stage intention text, and a "فتح المحطة الحالية" button;
   - the muhasaba node at the top;
   - seven station pills drawn from station 7 at the top down to station 1 at the bottom, joined by curved SVG connectors.
4. Tapping any station pill, or "فتح المحطة الحالية", opens the station preview modal (section 4). No pill is disabled.

### 4. Station preview modal and station flow

Tapping a pill calls `handleSelectStation`, which stores the station in `inspectedStation` (`src/components/journey/JourneyPathScreen.tsx:359-372`). The modal (`src/components/journey/JourneyPathScreen.tsx:986-1376`) shows the blessing's category, title, opening line, Qur'an verse, a collapsible "تدبّر النعمة" section (hadith, tadabbur text, scholar quote), the saved journal text if any, and one call to action that depends on the station's state.

Locking rules. A station has exactly one of three states (`src/components/journey/JourneyPathScreen.tsx:992-1002`):

| State | Definition | Pill sub-label | Modal call to action | Can a session start? |
|---|---|---|---|---|
| completed | id is in `state.completed` | "مكتملة · عرض النعمة" | "حمدتَ اللهَ في هذه المحطة" plus "ابدأ التدبر من جديد" | Yes, as a replay (`:1293-1304`) |
| current | it is `currentPointer` and not everything is complete | "المحطة الحالية · ابدأ التدبر" | "ابدأ التدبر" | Yes (`:1313-1323`). Neither the daily pace nor the free limit blocks this button. |
| upcoming | anything else | "محطة قادمة · معاينة" | A notice, then "الانتقال إلى المحطة الحالية"; or "متاح في رحلتي الخاصة" when `!premiumStatus` and the station index is ≥ `FREE_STATION_LIMIT` (`:1325-1360`) | No |

(Line numbers in the table are in `src/components/journey/JourneyPathScreen.tsx`.)

Consequences:

- **Completion order** is enforced because only the pointer station and already completed stations can start a session.
- **Content is not hidden.** The modal's previous/next arrows move through all stations of the stage regardless of state (`src/components/journey/JourneyPathScreen.tsx:1004-1020`), and the modal renders the full blessing text for upcoming stations too.
- The stricter gate that would send free users to the paywall and refuse to start when the daily pace is reached exists as `handleStartStation` (`src/components/journey/JourneyPathScreen.tsx:374-420`), but nothing calls it.

Starting a session sets `activeSession` and closes the modal. The path screen then renders `<JourneyStationFlow>` keyed by station id, so moving to another station remounts it (`src/components/journey/JourneyPathScreen.tsx:923-968`). The authored texts come from `getStationContent(stageId, stationIndex, blessingId)` (`src/lib/journeyStore.ts:114-144`).

The flow has four phases (`src/components/journey/JourneyStationFlow.tsx:33`):

1. `istishar` — the blessing's `istisharSteps` one at a time. Text appears clause by clause every 2.6 s. The "التالي" button is disabled until 2.6 s after the last clause appears or until the step's `durationSec` has passed, whichever comes first (`src/components/journey/JourneyStationFlow.tsx:77-104`). "إظهار النص كاملًا" skips the wait. After the last step the phase becomes `dawwin`.
2. `dawwin` — heading "دوّن", the station's `journalPrompt.text`, and an optional textarea (`src/components/journey/JourneyStationFlow.tsx:408-438`).
3. `amal` — heading "عمل اليوم" and the station's `dailyAction.text` (`src/components/journey/JourneyStationFlow.tsx:440-466`). The button "نويتُ بإذن الله · إتمام المحطة" calls `onReachClosing(journalText)` once and moves to `closing` (`src/components/journey/JourneyStationFlow.tsx:138-145`). **This is the moment the station is saved as completed.**
4. `closing` — "الحمد لله", a share button, an optional "next station" button, and "العودة إلى المسار", which calls `onComplete(journalText)` (`src/components/journey/JourneyStationFlow.tsx:147-150`, `:234-309`).

Both callbacks end in `persistStationCompletion` in the path screen (`src/components/journey/JourneyPathScreen.tsx:422-459`, `:558-567`):

1. `completeJourneyStationState({ stationId, journalText })` from the store (`src/lib/store.tsx:278-286`), which calls `completeJourneyStation` (`src/lib/journeyStore.ts:439-473`): it keeps the first `completedAt`, stores non-empty journal text under `journal[stationId]`, and adds 1 to `unlockedTodayCount` only the first time the station is completed.
2. If the journal text is non-empty, `addJournalEntry({ blessingId, shortTitle, categoryLabel, text })` adds a copy to the app's general journal (`src/lib/store.tsx:477-508`). Fallback labels are "محطة تأمل" and "رحلتي".
3. If the station was not already completed, `trackJourneyEvent('journey_station_completed', { stage_id, station_index })` with a 1-based index.
4. A `success` haptic.

Because `persistStationCompletion` runs at `amal → closing` and again at "العودة إلى المسار", step 2 runs twice with the same text. A session with journal text therefore creates **two identical entries in the general journal**. Replaying a completed station with its pre-filled text adds more.

In-flow navigation between stations of the same stage is computed by `getIntraStageNavigation` (`src/components/journey/JourneyPathScreen.tsx:465-538`):

| Direction | Allowed when | Otherwise |
|---|---|---|
| Previous | `stationIndex > 0` | Button disabled; tooltip "أنت في المحطة الأولى من هذا المنزل" |
| Next | The open station is completed **and** the next station is either completed, or is the pointer station while the daily pace is not reached and the free limit does not block it | Button disabled and one reason shown: "أكمل هذه المحطة أولًا للانتقال إلى المحطة التالية بالترتيب", "المحطة التالية متاحة ضمن رحلتك الخاصة", "أتممت محطة اليوم، نلتقي غدًا بإذن الله" or "التزم بترتيب المسار للانتقال إلى المحطة التالية" |

For a free user whose next station is blocked by the free limit and whose open station is completed, the next button stays enabled and calls `onTriggerPaywall`, which closes the session and opens the paywall with the next station's title (`src/components/journey/JourneyStationFlow.tsx:152-153`, `src/components/journey/JourneyPathScreen.tsx:958-961`).

### 5. Daily pacing

- The pace (1 or 2) is chosen in the customisation form and stored as `state.pace`.
- The counter is `state.unlockedTodayCount`. `completeJourneyStation` increments it on first completion (`src/lib/journeyStore.ts:465-467`). `syncDailyUnlockWindow` resets it to 0 when `lastUnlockDate` is not today's local date, but only runs inside `loadJourneyState` and `completeJourneyStation` (`src/lib/journeyStore.ts:223-233`, `:367`, `:443`).
- The path screen reads the counter as `dailyPaceReached` (`src/components/journey/JourneyPathScreen.tsx:328`). It has three effects:
  1. the stage header shows "أتممت ورد اليوم" (`src/components/journey/JourneyPathScreen.tsx:739-744`);
  2. the preview modal of the current station shows the note "أتممت محطة اليوم، يمكنك أخذ قسط من السكينة للغد أو بدء التدبر في هذه المحطة الآن بهدوء." above a still-active "ابدأ التدبر" button (`src/components/journey/JourneyPathScreen.tsx:1308-1323`);
  3. the in-flow "next station" button is disabled with "أتممت محطة اليوم، نلتقي غدًا بإذن الله" (`src/components/journey/JourneyPathScreen.tsx:499-503`, `:520-521`).
- So the pace is a hard limit only for chaining stations inside the flow. From the path, the user can always start the current station; the counter then goes above the pace.
- The path screen does not compare `state.lastUnlockDate` with today. If the app stays open past midnight, `dailyPaceReached` keeps yesterday's value until something reloads or saves the journey state.

### 6. Stage completion and muhasaba

The muhasaba screen opens in two ways:

1. **Automatically**, from `handleSessionComplete`: after "العودة إلى المسار" on the last station of a stage (`stationIndex === stationBlessingIds.length - 1`), `activeMuhasabaStageId` is set to that stage (`src/components/journey/JourneyPathScreen.tsx:563-574`). This also happens when the last station is replayed.
2. **Manually**, from the node at the top of the path card, labelled "وقفة محاسبة · {stage title}" followed by a state suffix in brackets: "بعد السبع", "ابدأ الآن" or "مكتملة". The button is disabled until every station of the displayed stage is complete (`src/components/journey/JourneyPathScreen.tsx:764-788`).

`<JourneyMuhasabaScreen>` receives the stage, the whole `state.journal` map and any saved answers (`src/components/journey/JourneyPathScreen.tsx:971-983`). Submitting calls `handleSaveMuhasaba` (`src/components/journey/JourneyPathScreen.tsx:583-591`):

1. `saveJourneyStageMuhasaba(stageId, q1, q2)` from the store (`src/lib/store.tsx:298-306`), which calls `saveStageMuhasaba`; answers are trimmed and the first `completedAt` is kept (`src/lib/journeyStore.ts:500-515`). Empty answers are accepted.
2. `trackJourneyEvent('journey_stage_completed', { stage_id })`. It fires on every save, including edits of an existing muhasaba.
3. The screen closes with a `success` haptic.

Saving has two visible effects: the node shows a check mark and the suffix "مكتملة", and the next stage joins `revealedStages`, so the stage pills appear.

What muhasaba does **not** gate: `currentPointer` ignores `state.muhasaba`. As soon as the seventh station is saved, the pointer, the top bar and the displayed stage move to the next stage. If the user leaves the muhasaba screen without saving (the X button), or never reaches it (for example by using the "previous station" button on the closing screen and then closing the flow, or by reloading on the closing screen), then for any stage that is not the last one:

- the displayed stage is the next stage, whose own muhasaba node is disabled;
- `revealedStages` still has one entry, so there are no pills to go back;
- the previous stage's muhasaba cannot be opened from the UI.

For the last stage (or a single-stage journey) the pointer stays on that stage, so its node remains reachable.

### 7. Stats tab and weekly chart

Switching the top-bar toggle to "الإحصائيات" replaces the path card with `<JourneyWeeklyProgressChart journeyState={state} completedDays={completedDays} />` and `<ReflectionCategoryCharts variant="journey" />` (`src/components/journey/JourneyPathScreen.tsx:912-920`). The stage pills are hidden on this tab.

The weekly chart builds seven rows, six days ago through today, using local dates (`src/components/journey/JourneyWeeklyProgressChart.tsx:73-105`):

- `dailyBlessings` = the larger of (stations completed that day) and (1 if the day is in `completedDays`, the app's general daily-reflection list, else 0);
- `cumulativeBlessings` = the larger of (all station completions up to that day) and (all `completedDays` up to that day);
- `paceTarget` = `journeyState.pace` (tooltip only).

It also shows "نعم الأسبوع" (sum of `dailyBlessings`), "أيام الحضور" (days with a non-zero value, out of 7) and "محطات الرحلة" (keys in `completed` / total stations in the current stages).

`completedDays` is seeded with three past days for a new user (`src/lib/store.tsx:181-190`), so a user with no activity sees three active days here.

### 8. Returning-user behaviour

- Progress is never reset. On app start `loadJourneyState` only resets `unlockedTodayCount` for a new local day (`src/lib/journeyStore.ts:356-382`).
- The path screen computes `showGentleReturnBanner = hasMissedDaysRecently(state)` (`src/components/journey/JourneyPathScreen.tsx:329`), which is true when the newest completion is older than yesterday (`src/lib/journeyStore.ts:521-548`). **The variable is never read.** The welcome text «الطريق ينتظرك، فلنكمل» exists only in a comment (`src/lib/journeyStore.ts:519`). There is no returning-user banner.
- Each time the screen mounts it shows the path tab and the pointer's stage (`journeyTab` and `activeStageIdView` are component state), and after 250 ms it scrolls the current station into view (`src/components/journey/JourneyPathScreen.tsx:332-339`).
- Saved journal text is shown in the preview modal under "تدوينتك المحفوظة على جهازك" and is pre-filled in the flow's textarea on replay (`src/components/journey/JourneyPathScreen.tsx:944`, `:1274-1284`).
- Once `alhamd:journey_onboarded:v1` is set, the customisation form uses its "edit" wording.

### Reference: store calls versus direct calls

All writes from the journey components go through the store. Direct imports from `journeyStore` are read-only helpers. Line numbers in each row refer to the file named in the first column.

| Caller | Through `useStore()` | Direct import |
|---|---|---|
| `JourneyPathScreen.tsx` | `journeyState`, `completedDays`, `notificationTime` (reads); `completeJourneyOnboardingState`, `completeJourneyStationState`, `saveJourneyStageMuhasaba`, `setNotificationTime`, `setNotificationsEnabled`, `addJournalEntry`, `triggerHaptic` (`:183-194`) | `journeyStore`: `hasCompletedJourneyOnboarding`, `getStageContent`, `getStationContent`, `makeStationId`, `hasMissedDaysRecently` (`:27-33`). `entitlements`: `isPremium`, `getDeveloperPremiumSync`, `ENTITLEMENT_CHANGED_EVENT`, `FREE_STATION_LIMIT` (`:21-26`). `analytics`: `trackJourneyEvent` (`:34`) |
| `JourneyStationFlow.tsx` | none (haptics arrive as a prop) | `journeyStore`: type `JourneyStationContent` only (`:4`) |
| `JourneyOnboarding.tsx` | none | `journeyStore`: `getAllStageTemplates` (`:3`) |
| `JourneyMuhasabaScreen.tsx` | `triggerHaptic` (`:28`) | `journeyStore`: `makeStationId` (`:4`) |
| `JourneyWeeklyProgressChart.tsx` | none (data arrives as props) | `journeyStore`: `getLocalDateString` (`:14`) |

Store actions that exist but are not used by any journey component: `updateJourneyState`, `saveJourneyStationJournal`, `resetJourneyState` (`src/lib/store.tsx:244`, `:288`, `:308`). No file in `src/components/journey/` touches `localStorage` directly.

### Reference: analytics calls

`trackJourneyEvent` does nothing unless `alhamd:analytics_consent` is `'true'`, keeps only allow-listed metadata keys, and appends to the `localStorage` log `alhamd:analytics_events_log` (`src/lib/analytics.ts:15-50`).

| Event | Call site | Metadata | When |
|---|---|---|---|
| `journey_onboarded` | `src/components/journey/JourneyPathScreen.tsx:351-354` | `themes_count` (number of chosen themes), `pace` | Every save of the customisation form, first time or edit |
| `journey_station_completed` | `src/components/journey/JourneyPathScreen.tsx:450-455` | `stage_id`, `station_index` (1-based) | First completion of a station only |
| `journey_stage_completed` | `src/components/journey/JourneyPathScreen.tsx:586-588` | `stage_id` | Every muhasaba save, including edits. Not fired when the seventh station is completed. |
| `journey_paywall_viewed` | `src/components/screens/PremiumPaywallScreen.tsx:28-30` | Passes `trigger_reason`, which is not on the allow-list (`src/lib/analytics.ts:28`), so the stored metadata is empty | Paywall mount |
| `journey_paywall_cta_tapped` | `src/components/screens/PremiumPaywallScreen.tsx:39` | `plan` | Subscribe button |

No journal text, muhasaba answer or blessing text is passed to `trackJourneyEvent` from any journey component.

### Reference: where private text goes

| Text | Held in | Written to | Shown again in |
|---|---|---|---|
| Station journal (textarea in the `dawwin` phase) | `journalText` state of `JourneyStationFlow` until the `amal → closing` step (`src/components/journey/JourneyStationFlow.tsx:62`) | (a) `journeyState.journal[stationId]` under `alhamd:journey_state:v1`; (b) a copy in the general journal, `alhamd_journal`, via `addJournalEntry` (`src/components/journey/JourneyPathScreen.tsx:435-448`) | Preview modal (`:1274-1284`), flow textarea on replay (`:944`), muhasaba screen list, and the app's Journal tab |
| Muhasaba answers `q1`, `q2` | `q1` / `q2` state of `JourneyMuhasabaScreen` | `journeyState.muhasaba[stageId]` only (`src/components/journey/JourneyPathScreen.tsx:585`) | Muhasaba screen when reopened |

Both are included in the backup export, which serialises `journal` and `journeyState` (`src/lib/store.tsx:583-605`). Text typed in the flow is lost if the user closes the flow before the `amal → closing` step. Deleting the copy from the Journal tab does not remove `journeyState.journal[stationId]` (`src/lib/store.tsx:510-513`), and no journey UI can delete it: `completeJourneyStation` ignores empty text (`src/lib/journeyStore.ts:453-459`).

The copy-to-clipboard button in the preview modal copies blessing content only (`src/components/journey/JourneyPathScreen.tsx:1028-1038`).

### Reference: placeholders and `reviewStatus` at render time

- `[[AYAH_TOKEN]]` and `[[HADITH_TOKEN]]` are never rendered, replaced or checked. A search of `src/` for `AYAH_TOKEN`, `HADITH_TOKEN`, `sacredPlaceholder`, `dhikrPlaceholder` finds only the type definitions and the fallback object in `src/lib/journeyStore.ts:13-27`, `:138-142`. The sacred text shown in a station (verse, hadith, duaa) comes from the blessing record, not from `journey_content.json`.
- The only review field read by a component is `dailyAction.reviewStatus`: when it is `'pending_review'` the daily-action card shows "محتوى توجيهي (قيد المراجعة)" (`src/components/journey/JourneyStationFlow.tsx:460-462`). All 28 daily actions are `pending_review`, so the label always shows.
- `journalPrompt.reviewStatus`, the station-level and stage-level `reviewStatus`, `intention.reviewStatus`, `verifiedVerbatim`, `reviewedBy`, `reviewDate` and the file-level `reviewStatus` are not read anywhere. Journal prompts and stage intentions are displayed with no review marker.
- `CONTENT_REVIEW_GATE` in `src/data/loader.ts:4` is `false` and affects only `getAllBlessings`; `getBlessingById`, which the journey uses, never filters.

### Reference: developer-only controls

There are none inside `src/components/journey/`. The controls that affect the journey live elsewhere:

| Control | Location | Effect |
|---|---|---|
| Switch "وضع المطور: تفعيل الرحلة" | `src/components/screens/SettingsScreen.tsx:662-682` | `setDeveloperPremium(next)`: writes `alhamd:dev_premium` and dispatches `alhamd:entitlement_changed` |
| "تجاوز حد اليوم (فتح محطة جديدة)" | `src/components/screens/SettingsScreen.tsx:700-711` | Calls `devResetTodayPacingLock()` directly (not through the store): sets `unlockedTodayCount` to 0 |
| "إعادة تعيين «رحلتي» بالكامل" | `src/components/screens/SettingsScreen.tsx:713-724` | Calls `devResetEntireJourney()` directly: removes `alhamd:journey_state:v1` and `alhamd:journey_onboarded:v1`, then saves a fresh default state |
| "تفعيل الآن (وضع المطوّر)" | `src/components/screens/PremiumPaywallScreen.tsx:53-57`, `:250-256` | `setDeveloperPremium(true)`, then `onUnlocked`, then `onClose`. Shown after tapping the subscribe or restore button. |

Both reset helpers end in `saveJourneyState`, which dispatches `alhamd:journey_updated`; the store listens and reloads (`src/lib/store.tsx:229-241`), so a mounted path screen follows. None of these controls is behind a build-time flag: `src/` contains no `import.meta.env` or `process.env` check.

## `src/components/journey/JourneyPathScreen.tsx`

**Purpose.** Root screen of the feature and owner of all journey UI state. It derives the pointer, the revealed stages and the lock rules from the store's `journeyState`, renders the path and stats tabs, and mounts every overlay.

**Mounted from.** `src/App.tsx:158-160` when `activeTab === 'journey'` (import at `src/App.tsx:7`). Also re-exported by `src/components/screens/JourneyPathScreen.tsx:1`, which nothing imports.

**Exports.** Named `JourneyPathScreen` (`:182`) and the same component as default (`:1398`). `CurvedPathConnector` (`:63-180`) is private to the module.

**Props.** None. The component is declared as `React.FC` with no props (`:182`).

**Store / persistence.**

- `useStore()` fields (`:183-194`): `journeyState` (as `state`), `completedDays`, `notificationTime`; actions `completeJourneyOnboardingState` (`:346`), `completeJourneyStationState` (`:435`), `saveJourneyStageMuhasaba` (`:585`), `setNotificationTime` and `setNotificationsEnabled` (`:348-349`), `addJournalEntry` (`:442`), `triggerHaptic`.
- `entitlements`: `getDeveloperPremiumSync()` (`:196`), `isPremium()` (`:254`), `ENTITLEMENT_CHANGED_EVENT` (`:265`, `:268`), `FREE_STATION_LIMIT` (`:327`, `:394`, `:498`, `:575`, `:1330`, `:1382-1383`).
- `journeyStore` read-only helpers: `hasCompletedJourneyOnboarding()` (`:603`, `:1388`), `getStageContent` (`:713`), `getStationContent` (`:926`), `makeStationId` (many), `hasMissedDaysRecently` (`:329`).
- `analytics`: three `trackJourneyEvent` calls (`:351`, `:451`, `:586`), listed in the analytics table above.
- `data/loader`: `getBlessingById` for titles and full blessing content.
- `localStorage`: no direct access. Indirectly, `hasCompletedJourneyOnboarding()` reads `alhamd:journey_onboarded:v1` and `getDeveloperPremiumSync()` reads `alhamd:dev_premium`.
- Window events: listens to `alhamd:entitlement_changed` (`:265`). It does not listen to `alhamd:journey_updated`; the store does.

**Local state, refs, memos.**

| Name | Type and initial value | Use |
|---|---|---|
| `premiumStatus` (`:196`) | boolean, from `getDeveloperPremiumSync()` | Free-tier branches |
| `entitlementLoaded` (`:197`) | boolean, `true` | Only ever set to `true` (`:257`), so the guard at `:593-595` never returns `null` |
| `showOnboarding` (`:198`) | boolean, `false` | Swap the screen for `JourneyOnboarding` |
| `showPaywall` (`:199`), `paywallContext` (`:200-203`) | boolean; `{ reason, targetStationTitle? }` | Path screen's own paywall. `openPaywall` (`:205-211`) is only ever called with reason `'free_limit_reached'` |
| `activeSession` (`:214-220`) | `{ stageId, stageTitle, stationIndex, stationId, blessingId }` or `null` | Station flow |
| `activeMuhasabaStageId` (`:223`) | string or `null` | Muhasaba screen |
| `inspectedStation` (`:226-232`) | same shape as `activeSession`, or `null` | Preview modal |
| `showPopupTadabbur` (`:233`) | boolean | Collapsible section in the modal |
| `copiedPopupBlessing` (`:234`) | boolean | Copy button feedback |
| `popupShareModalData` (`:235-238`) | `{ open, type: 'ayah' or 'tadabbur' }` | `ShareCardModal` inside the preview modal |
| `journeyTab` (`:239`) | `'path'` or `'stats'`, initial `'path'` | Tab switch |
| `activeStageIdView` (`:240`) | string or `null` | Stage picked with a pill |
| `currentStationRef` (`:248`) | ref to a `div` | Attached to the wrapper of the current station (`:844`) for auto-scroll |
| `revealedStages` (`:275-292`) | `useMemo` on `state.stages`, `state.completed`, `state.muhasaba`, `premiumStatus` | Stage pills |
| `currentPointer` (`:295-324`) | `useMemo` on `state.stages`, `state.completed` | Pointer |

Plain derived values: `totalCompletedCount`, `freeTasteLimitReached`, `dailyPaceReached`, `showGentleReturnBanner` (`:326-329`), `activeThemesSummary` (`:622-624`), `displayedStage` (`:626-629`).

**Effects, timers, browser APIs.**

- `:243-246` — when `inspectedStation?.stationId` changes, collapse the tadabbur section and clear the copy feedback.
- `:251-270` — entitlement check on mount and on `alhamd:entitlement_changed`; guarded by a `mounted` flag; listener removed on cleanup.
- `:332-339` — when `entitlementLoaded` or `showOnboarding` changes (in practice: on mount and when the customisation form closes), wait 250 ms and call `scrollIntoView({ behavior: 'smooth', block: 'center' })` on the current station. The timeout is cleared on cleanup.
- `:577-579` — `setTimeout` of 450 ms before opening the paywall after a free user's limit is reached. Not cleared on unmount.
- `:1032` — `navigator.clipboard.writeText`; errors are swallowed. `:1034` — `setTimeout` of 2,200 ms to clear the copy feedback. Not cleared on unmount.
- Haptics go through the store's `triggerHaptic`, which wraps `navigator.vibrate` (`src/lib/store.tsx:257-266`).

**UI structure and behaviour.**

Root: `div[dir="rtl"]`, max width `max-w-lg` / `md:max-w-2xl` / `lg:max-w-3xl`, `animate-fade-in` (`:632-635`).

1. *Top bar* (`:637-685`).
   - "المحطة {n} من {٧} · {stage title}" from `currentPointer`. The total 7 is a literal (`:640`). On `sm` and wider, the chosen themes follow in brackets, using `themeLabelsMap` (`:616-621`).
   - Segmented switch "مسار الرحلة" / "الإحصائيات" sets `journeyTab`.
   - "تخصيص" (icon `SlidersHorizontal`, `aria-label="تخصيص الرحلة"`, `title="تخصيص محاور الاهتمام ووتيرة التقدم اليومية"`) sets `showOnboarding` to `true`.
2. *Stage pills* (`:688-708`): only on the path tab and only when `revealedStages.length > 1`. Label "{n}. {stage title}"; tap sets `activeStageIdView`. Horizontal scroll with `no-scrollbar`.
3. *Path card* (`:711-909`), a `GlassCard`, rendered by an inline function for `displayedStage`.
   - Header (`:731-760`): stage title in gold, "{done} / {٧} مكتملة" (7 is a literal, `:737`), "أتممت ورد اليوم" when `dailyPaceReached && !freeTasteLimitReached`, then the intention text on one truncated line. The intention is `stage.intention`, else `getStageContent(stage.id, stage.theme)?.intention.text`, else the fallback "في هذا المنزل نتأمل نِعَم الله التي تحيط بنا في كل حين." (`:713-717`). `stage.intention` is never populated by `journeyStore`, so the JSON text is what shows.
   - "فتح المحطة الحالية" (`:751-759`) opens the preview modal for the pointer station, even when another stage is displayed.
   - Muhasaba node (`:763-803`): see section 6. Three visual states (saved, ready, not yet). A 20 px connector joins it to station 7.
   - Stations (`:806-906`): indices `[6,5,4,3,2,1,0]` (`:725`), so station 7 is at the top. Each wrapper is shifted horizontally with `translateX` by `getWindingOffsetPx`, pattern `[0, 22, 34, 10, -20, -32, -10]` px for stations 1–7 (`:611-614`). Each pill (`:849-891`) shows a round badge (station number, or a check when completed), the blessing's `shortTitle` (falls back to `title`, then "المحطة {n}"), and the state sub-label from the lock table. Tap calls `handleSelectStation`.
   - Between consecutive pills a 22 px `CurvedPathConnector` (`:894-902`) is `completed` when both stations are complete, `ascending` when the lower one is complete and the upper one is the current station, otherwise `upcoming` (`:834-839`).
4. *Stats tab* (`:912-920`): the weekly chart and `ReflectionCategoryCharts variant="journey"`.
5. *Station flow* (`:923-968`): rendered while `activeSession` is set and the blessing exists. Props are assembled from `getStationContent` and `getIntraStageNavigation`. `onClose` just clears `activeSession`.
6. *Muhasaba screen* (`:971-983`): rendered while `activeMuhasabaStageId` is set and the stage exists.
7. *Station preview modal* (`:986-1376`): `div[role="dialog"][aria-modal="true"]`, `aria-label="تفاصيل المحطة {n}: {blessing title}"`, dark backdrop; a click on the backdrop closes it (`:1041-1048`). Content, inside a `GlassCard` with accent border:
   - context bar (`:1060-1129`): "{stage title} · المحطة {n} من {total}", the state word ("مكتملة", "المحطة الحالية" or "محطة قادمة"), previous and next arrows (`aria-label` "المحطة السابقة" / "المحطة التالية", disabled at the ends of the stage), and a close button (`aria-label="إغلاق نافذة تفاصيل المحطة"`);
   - category pill, copy button (`aria-label="نسخ نص النعمة"`) and share button (`aria-label="مشاركة النعمة"`, opens `ShareCardModal` with type `ayah`) (`:1132-1169`);
   - blessing title, opening line, verse in ﴿ ﴾ with "سورة {name} : {ayah number}" (`:1172-1200`);
   - collapsible "تدبّر النعمة" (`:1203-1271`) with "الحديث الشريف:", the hadith text, its source and grade; "وقفات في أثر النعمة:" and the tadabbur text; the scholar quote, with the scholar's name unless it starts with "مستفاد", "مأثور" or "إشارة" (`:1022-1026`); and a "مشاركة" button that opens `ShareCardModal` with type `tadabbur`;
   - saved journal block "تدوينتك المحفوظة على جهازك" (`:1274-1284`);
   - the call to action for the station's state (`:1287-1361`), as in the lock table. For an upcoming station the notice reads "هذه محطة قادمة في المسار. تُفتح المحطات بالتدريج وبالترتيب بعد إتمام المحطات السابقة حفاظاً على سكينة الرحلة." "الانتقال إلى المحطة الحالية" re-targets the modal to the pointer station.
   - The copied text is `«{title}»`, the opening line, the verse with "[سورة {name} : {n}]", and "— تطبيق «الحمد»" (`:1030`).
8. *Paywall* (`:1379-1393`): `PremiumPaywallScreen` with `triggerReason`, `completedFreeCount = min(FREE_STATION_LIMIT, totalCompletedCount)`, `freeStationLimit`, `targetStationTitle`. `onUnlocked` sets `premiumStatus` to `true` and opens the customisation form if it was never completed.

After a session ends (`handleSessionComplete`, `:563-581`): the flow closes; if the station was the last of its stage the muhasaba screen opens; otherwise, for a free user with at least `FREE_STATION_LIMIT` completions, the paywall opens after 450 ms.

**Helpers, sub-components and constants defined in the file.**

| Name | Lines | What it does |
|---|---|---|
| `CurvedPathConnector` | `:46-180` | SVG, 240 px wide, height prop (default 64). Draws a cubic curve between two horizontal offsets. `status` selects solid violet with a mid dot (`completed`), gradient with end dots (`ascending`) or dashed grey with a hollow dot (`upcoming`). `dir="ltr"` on the SVG so x-coordinates match `translateX`. `aria-hidden="true"`. |
| `openPaywall` | `:205-211` | Sets `paywallContext` and shows the paywall |
| `handleOnboardingComplete` | `:341-357` | Section 2 |
| `handleSelectStation` | `:359-372` | Light haptic, opens the preview modal |
| `handleStartStation` | `:374-420` | **Unused.** Would open the modal for completed stations, the paywall for free-limit stations, the modal for non-current or pace-blocked stations, and the flow otherwise |
| `persistStationCompletion` | `:422-459` | Section 4 |
| `getIntraStageNavigation` | `:465-538` | Section 4. Returns `totalStations`, `isCurrentStationCompleted`, `canNavigatePrev`, `canNavigateNext`, `isNextBlockedByFree`, `prevStationTitle`, `nextStationTitle`, `nextBlockedReason` |
| `handleNavigateActiveSession` | `:540-556` | Re-targets `activeSession` to another index of the same stage |
| `handleSessionReachClosing`, `handleSessionComplete` | `:558-581` | Section 4 and above |
| `handleSaveMuhasaba` | `:583-591` | Section 6 |
| `getWindingOffsetPx` | `:611-614` | Horizontal offset pattern |
| `themeLabelsMap` | `:616-621` | `din` "العبادات", `afiyah` "البدن", `nasl` "الأهل والمودة", `rizq` "الرزق والسكينة" |
| `handleNavigateInspected`, `showScholarName`, `handleCopyPopupBlessingText` | `:1008-1038` | Defined inside the modal's inline render function |

**Styling.**

- Classes from `src/index.css`: `animate-fade-in` (`src/index.css:271`, keyframes at `src/index.css:261`), `no-scrollbar` (`src/index.css:252-258`), `font-serif` (`src/index.css:66`), `font-quran` (`src/index.css:74`), `ayah-text` (theme overrides at `src/index.css:162` and `src/index.css:534`). The modal's category pill and verse block use the custom properties `--accent-stroke`, `--accent-text`, `--bg-raised`, `--bg-sunken`, `--ayah-border`, `--ayah-color` (`:1135-1139`, `:1184-1191`).
- Everything else is Tailwind utilities with hard-coded dark-palette hex values: backgrounds `#15152A`, `#1E1E38`, `#232342`, `#2C2C52`, `#25232E`; borders `#2E2E4A`; text `#EDEDF5`, `#C7C4D8`, `#AEAECB`; violet `#6C63FF` / `#594DFF`; gold `#E4C368` / `#C8A951`. The connector SVG hard-codes `#6C63FF`, `#9D97FF`, `#2E2E4A`, `#15152A` as attributes.
- Light theme and night-reading mode work by overriding specific Tailwind class names in `src/index.css` (for example `.theme-light .bg-\[\#1E1E38\]\/90`, `src/index.css:88-92`). Several class names used here have no light-theme override, among them `bg-[#232342]`, `bg-[#232342]/90`, `bg-[#15152A]/50`, `bg-[#15152A]/30`, `bg-[#1E1E38]/70`, `border-[#6C63FF]/55`, `border-[#6C63FF]/35`. The completed station pill combines `bg-[#232342]/90` (not overridden) with `text-[#EDEDF5]` (overridden to dark ink, `src/index.css:133`). SVG stroke colours cannot be overridden by those rules at all. This was established by reading the CSS; it was not checked in a browser.
- Breakpoints: Tailwind defaults `sm`, `md`, `lg` (no custom breakpoints in `src/index.css`). Used for padding, type size, pill width and max width; the theme summary in the top bar is hidden below `sm`.
- Animations: `animate-fade-in` on the root, the stats tab, the modal backdrop and the tadabbur panel; `transition-transform duration-300` on station wrappers; `active:scale-95` on pills. `motion` is imported (`:18`) but not used.

**Accessibility.**

- The preview modal has `role="dialog"`, `aria-modal` and a label, but no focus trap, no initial focus, no Escape handler and no focus return. The page behind it is neither inert nor scroll-locked.
- Station pills have `aria-label="المحطة {n}: {shortTitle}"` (`:852`), which replaces the visible sub-label, so the state (completed, current, upcoming) is not in the accessible name.
- The view switch, stage pills and the tadabbur toggle carry no `aria-pressed`, `aria-selected` or `aria-expanded`.
- Disabled buttons use the `disabled` attribute (muhasaba node, modal arrows).
- Icon-only buttons in the modal have `aria-label` and `title`. They are 32 px squares (`w-8 h-8`); the tab switch buttons and "تخصيص" are about 24–28 px high.
- Connectors are `aria-hidden`.

**Notes and quirks.**

- Unused imports: `HandHeart` (`:5`), `motion` (`:18`), `getFormattedHijriDate` (`:36`). Unused values: `handleStartStation`, `showGentleReturnBanner`, the `'preview'` paywall reason within this file.
- `entitlementLoaded` is dead state (always `true`).
- Seven stations per stage is assumed in literals at `:318-321`, `:640`, `:725`, `:737`, and as a fallback at `:469`, `:990`. All four stages in the JSON have seven.
- `isInspectBlockedByFree` uses the literal `2` instead of `FREE_STATION_LIMIT` (`:996`) and is used only to hide the pace note.
- The free limit is not applied to the "ابدأ التدبر" button of the current station (`:1306-1323`); it is applied to upcoming stations (`:1330`), to in-flow next navigation (`:497-498`) and after completion (`:575`).
- For a free user on a completed last station, `isNextBlockedByFree` is still true although there is no next station, so the flow would offer a "next station (8)" button that opens the paywall (`:497-498` here, with `src/components/journey/JourneyStationFlow.tsx:152-153` and `src/components/journey/JourneyStationFlow.tsx:274-290`). Unreachable today for the reason given in section 1.
- `totalCompletedCount` counts every key in `state.completed`, including stations of stages the user later removed in the customisation form (the store keeps them, `src/lib/journeyStore.ts:421-427`).
- After everything is complete the top bar reads "المحطة {٧} من {٧}" with the last stage's title, and no pill is marked current.
- If a station's blessing id is not found, the pill shows "المحطة {n}", the preview modal opens as an empty backdrop (`:1053`), and a session does not render (`:925`).
- `JourneyStage` is imported from `src/lib/store.tsx` (`:20`), which declares its own copy of the type with an extra optional `intention` field.
- Several taps fire more than one haptic: the store wrappers call `triggerHaptic('success')` and the handlers here call it again (`:356`, `:457`, `:590`).

## `src/components/journey/JourneyStationFlow.tsx`

**Purpose.** The guided session for one station, shown as a full-screen overlay.

**Mounted from.** `src/components/journey/JourneyPathScreen.tsx:937-966`, with `key={activeSession.stationId}`.

**Exports.** Named `JourneyStationFlow` (`:35`). No default export.

**Props** (`:10-31`).

| Name | Type | Required | What it does |
|---|---|---|---|
| `blessing` | `Blessing` | yes | Source of the reflection steps, title, short title, verse and duaa |
| `stationNumber` | number (1–7) | yes | Shown in the navigation strip and in tooltips |
| `totalStationsInStage` | number | no, default 7 | "من {total}" in the strip; hides the blocked-reason line on the last station |
| `stageTitle` | string | yes | Strip heading |
| `stationContent` | `JourneyStationContent` | yes | `journalPrompt.text`, `dailyAction.text`, `dailyAction.reviewStatus`. Its `blessingId`, `reviewStatus`, `journalPrompt.reviewStatus`, `sacredPlaceholder` and `dhikrPlaceholder` are not read |
| `initialJournalText` | string | no, default `''` | Initial textarea value |
| `isStationCompleted` | boolean | no, default `false` | Adds " · مكتملة" to the strip; part of the paywall-next rule |
| `canNavigatePrev`, `canNavigateNext` | boolean | no, default `false` | Enable the strip buttons |
| `isNextBlockedByFree` | boolean | no, default `false` | With `isStationCompleted` and `onTriggerPaywall`, turns the next button into a paywall trigger |
| `prevStationTitle`, `nextStationTitle` | string | no | Tooltip text only |
| `nextBlockedReason` | string | no | Tooltip and the small line under the strip |
| `onNavigatePrev`, `onNavigateNext` | function | no | Strip buttons |
| `onTriggerPaywall` | function | no | Next button when blocked by the free limit |
| `onClose` | function | yes | X button (not shown on the closing screen) |
| `onComplete` | `(journalText?) => void` | yes | "العودة إلى المسار" |
| `onReachClosing` | `(journalText?) => void` | no | Called once at `amal → closing` |
| `triggerHaptic` | function | yes | Haptics |

No prop is unused.

**Store / persistence.** None. The component does not call `useStore()`, `localStorage`, `journeyStore` functions or analytics. It imports only the `JourneyStationContent` type (`:4`). Persistence happens in the parent through `onReachClosing` and `onComplete`.

**Local state, refs, memos.**

- `phase` (`:57`): `'istishar'`, `'dawwin'`, `'amal'` or `'closing'`; starts at `'istishar'`.
- `currentStepIdx`, `sentenceIdx`, `canAdvance` (`:58-60`): position in the reflection steps, how many clauses are visible, whether "التالي" is enabled.
- `journalText` (`:62`): textarea value, starts as `initialJournalText`.
- `showShareModal` (`:63`).
- `hasRecordedClosingRef` (`:64`): ensures `onReachClosing` is called once per mount.
- Derived on each render: `steps = blessing.istisharSteps || []`, `currentStep`, and `sentences`, the current step's text split with `/(?<=[.،؟!…])\s+/` (`:66-74`). The split treats the Arabic comma as a boundary, so the units are clauses.
- `canTriggerPaywallForNext` (`:152-153`).

**Effects, timers, browser APIs.**

One effect (`:77-104`), active only in the `istishar` phase and re-run when the phase, the step index, the clause count or the step's `durationSec` changes:

- resets `sentenceIdx` to 0 and `canAdvance` to `false`;
- starts a 2,600 ms interval that reveals one more clause per tick and, on the tick after the last clause, sets `canAdvance` and stops;
- starts a timeout of `durationSec` seconds (12 if missing) that sets `canAdvance` and reveals all clauses;
- clears both on cleanup.

With N clauses, "التالي" unlocks after `min(N × 2.6 s, durationSec)`. The comment at `:76` gives 10/20/20/15/15 seconds, which are the `durationSec` values in the data; for the 28 journey blessings the clause count unlocks first in 137 of 140 steps (measured by applying the same split to `src/data/blessings_ar.json`).

"إظهار النص كاملًا" sets `canAdvance` and shows all clauses but does not stop the interval (`:486-495`). The next tick calls `setSentenceIdx` with its own smaller counter (`:86-87`), so for steps with three or more clauses the text can shrink back to the paced position until the interval catches up. The button stays enabled.

The regular expression uses a lookbehind, which older Safari versions do not support; the same expression is in `src/components/screens/ReflectionModal.tsx:53`. Not tested on devices.

**UI structure and behaviour.**

Phases `istishar`, `dawwin`, `amal` share one layout (`:311-532`): a fixed full-screen `div[dir="rtl"]` with a `StarLattice` background.

1. Header row (`:320-357`): X button (`aria-label="إغلاق المحطة"`, calls `onClose`); in `istishar` a `ThreadProgress` (current step of total steps), otherwise a pill reading "وقفة تأمل" (`dawwin`) or "عمل اليوم" (`amal`); a "مشاركة" button that opens `ShareCardModal` with type `tadabbur`.
2. Navigation strip (`renderStationNavStrip`, `:155-231`): "المحطة السابقة" button, the stage title with "المحطة {n} من {total}" and " · مكتملة" when completed, and "المحطة التالية" button. Under it, the blocked reason when next is blocked and this is not the last station.
3. Main area by phase.
   - `istishar` (`:364-406`): a pill naming the step type — `ground` "التهيئة والحضور", `visualize` "تخيّل الغياب", `deepen` "إدراك أثر النعمة", `return` "العودة بالحمد", `hamd` "الحمد والشكر" — the blessing title, and the visible clauses in a large serif paragraph. On the `ground` step the verse is shown with "سورة {name} : {n}". On the `hamd` step "دعاء اليوم:" and the blessing's duaa are shown.
   - `dawwin` (`:408-438`): "دوّن", the journal prompt, a four-row textarea with placeholder "اكتب موقفًا شعرت فيه بقيمة هذه النعمة… (اختياري)", and the privacy line "تُحفظ تدويناتك التأملية محليًا على جهازك فقط ولا يتم إرسالها لأي جهة خارجية."
   - `amal` (`:440-466`): "عمل اليوم", "أثرٌ عمليٌّ يسير يربط القلب بالعمل", the daily action in « », a footer "نعمة: {shortTitle}" and, when `dailyAction.reviewStatus` is `pending_review`, "محتوى توجيهي (قيد المراجعة)".
4. Bottom button by phase (`:470-521`).
   - `istishar`: "التالي", or "متابعة إلى وقفة التأمل" on the `hamd` step; disabled until `canAdvance`. While disabled, the link "إظهار النص كاملًا" is shown.
   - `dawwin`: "متابعة إلى عمل اليوم". Writing is optional.
   - `amal`: "نويتُ بإذن الله · إتمام المحطة".

The `closing` phase has its own layout (`:234-309`): navigation strip at the top; a check icon, "الحمد لله", "أتممتَ تأمل «{blessing title}». نسأل الله أن يجعلها نعمةً مشكورةً وأثرًا باقيًا في يومك.", and a "مشاركة النعمة أو حفظها كصورة" button; at the bottom "الانتقال إلى المحطة التالية ({n+1})" when next navigation or the paywall trigger is available, and "العودة إلى المسار". There is no X button on this screen.

Step flow: `handleAdvanceIstishar` (`:124-131`) moves to the next step or to `dawwin`; `handleAdvanceFromDawwin` (`:133-136`) moves to `amal`; `handleAdvanceFromAmal` (`:138-145`) calls `onReachClosing` and moves to `closing`; `handleFinishSession` (`:147-150`) calls `onComplete`. There is no way back to an earlier phase.

**Helpers, sub-components and constants defined in the file.** `SessionPhase` type (`:33`); `getStepBgClass` (`:106-122`); the four handlers above; `renderStationNavStrip` (`:155-231`).

**Styling.**

- Background colour by step type: `ground`, `return`, `hamd` `#15152A`; `visualize` `#111126`; `deepen` `#0C0C1C`, with a 700 ms colour transition (`:106-122`, `:313`). All three have light-theme overrides (`src/index.css:79`, `src/index.css:85-86`).
- `StarLattice` opacity is 0.015 on the `deepen` step, 0.045 otherwise, 0.03 on the closing screen.
- Classes from `src/index.css`: `animate-fade-in`, `font-serif`, `font-quran`, `ayah-text`.
- Hard-coded palette as in the path screen, plus `bg-white/5`, `bg-white/10`, `border-white/10` on header buttons (overridden in light theme, `src/index.css:110-117`). Classes without a light-theme override include `bg-[#1E1E38]/75`, `/85`, `/60`, `hover:bg-[#27274A]`, `hover:bg-[#252547]`.
- Breakpoints `sm` and `md` for padding, type size and max width.
- Overlay is `fixed inset-0 z-50`. The main layout has `overflow-y-auto`; the closing layout does not.

**Accessibility.**

- The overlay has no `role="dialog"`, no `aria-modal`, no focus management and no Escape handling.
- The paced paragraph is not an `aria-live` region.
- The header share button has `aria-label="مشاركة"`. Strip buttons explain a blocked state through `title`, and the reason is also rendered as text under the strip.
- The textarea has a placeholder but no `<label>` or `aria-label`; the prompt paragraph above it is not associated with it.
- `ThreadProgress` renders `role="progressbar"` with `aria-valuenow`/`min`/`max` and no accessible name (`src/components/common/ThreadProgress.tsx:26-29`).

**Notes and quirks.**

- Closing the flow with X, or moving to another station with the strip, before the `amal → closing` step discards the typed text without a prompt.
- If `blessing.istisharSteps` is empty, the main area is blank and "التالي" unlocks after one interval tick and leads to `dawwin`.
- `journalPrompt.text` is shown without any review marker although it is also `pending_review`.

## `src/components/journey/JourneyOnboarding.tsx`

**Purpose.** One-page form to choose and order focus themes, pick the daily pace and optionally set a reminder time.

**Mounted from.** `src/components/journey/JourneyPathScreen.tsx:597-608`, as the path screen's whole output while `showOnboarding` is true. It renders inside `App`'s `<main>`, so the app's top bar and tab bar stay visible.

**Exports.** Type `JourneyOnboardingProps` (`:7`), named `JourneyOnboarding` (`:27`), alias `JourneyCustomizationScreen` (`:376`) and default export (`:377`). Only the named export is imported anywhere.

**Props** (`:7-18`).

| Name | Type | Required | What it does |
|---|---|---|---|
| `initialThemes` | string[] | no, default `['din', 'afiyah']` | Initial selection and order. An empty array also falls back to the default (`:38`) |
| `initialPace` | 1 or 2 | no, default 1 | Initial pace |
| `initialReminderTime` | string | no, default `'21:00'` | Initial time. The reminder switch starts on unless this is `''` (`:41-43`) |
| `isEditing` | boolean | no, default `false` | Switches three strings to the "edit" wording |
| `onComplete` | `({ focusThemes, pace, reminderTime }) => void` | yes | Save button. `reminderTime` is `null` when the switch is off |
| `onCancel` | function | no | Shows the back button when provided |

No prop is unused.

**Store / persistence.** None directly. Reads the stage templates with `getAllStageTemplates()` (`:35`) and blessing short titles with `getBlessingById` (`:148`). No `localStorage`, analytics or window events. The parent saves.

**Local state, refs, memos.** `selectedThemes` (ordered list of theme keys), `pace`, `enableReminder`, `reminderTime` (`:37-44`). `selectedThemeLabels` is derived on each render (`:76-81`).

**Effects, timers, browser APIs.** None. Uses a native `<input type="time">`.

**UI structure and behaviour.**

1. Top bar (`:89-111`): optional back button (`aria-label="رجوع إلى مسار الرحلة"`); a caption, "تعديل تفضيلات رحلتي" when editing, else "تخصيص محتوى الرحلة قبل بدئها"; and the note "يُحفظ محلياً على جهازك".
2. Header (`:114-121`): `h1` "خصّص مسار رحلتك ووتيرتك اليومية" when editing, else "صمّم رحلتك الخاصة مع النِّعَم"; then "اختر محاور اهتمامك التي تودّ التأمل فيها (مثل «العبادات» و«البدن»)، وحدّد وتيرة تقدمك اليومية؛ ستُحفظ تفضيلاتك محلياً في سجل رحلتك ويمكنك تعديلها في أي وقت."
3. Section "١. اختر محاور اهتمامك" (`:124-224`): sub-line "تُرتَّب منازل الرحلة حسب ترتيب اختيارك، وفي كل منزلٍ {٧} محطات تأملية." and a counter "تم اختيار {n} من {total}". One card per stage template with: the short theme name from `THEME_SHORT_NAMES` (falls back to `focusLabel`), the stage title, "{n} محطات", the `focusDescription`, and "من محطاته: {first five blessing short titles}…".
   - Tapping a card toggles its theme (`toggleTheme`, `:46-54`). The last selected theme cannot be removed. A newly selected theme goes to the end of the order.
   - A selected card shows its position number in a violet circle. From position 2 onward it also shows a "تقديم" button (`title="تقديم هذا المحور في الترتيب"`) that moves the theme one place earlier (`promoteThemeOrder`, `:56-66`).
4. Section "٢. حدّد وتيرة التقدم اليومية" (`:227-297`): sub-line "اختر عدد المحطات التي تودّ أن تُفتح لك في كل يوم بما يناسب وقتك وسكينتك." Two buttons:
   - "محطة واحدة يومياً" — "وقفة تأمل واحدة هادئة كل يوم؛ يكتمل المنزل في {٧} أيام بلا استعجال."
   - "محطتان يومياً" — "محطة في الصباح وأخرى في المساء لمن يرغب في التعمق أكثر؛ يكتمل المنزل في {٤} أيام."
5. Section "٣. تذكير يومي هادئ (اختياري)" (`:300-346`): sub-line "اختر وقتًا يصفو فيه ذهنك للتأمل في محطتك اليومية.", a switch (`aria-label="تفعيل التذكير اليومي"`), and when on, a time input labelled "الوقت المفضل للتذكير ({formatted time}):".
6. Summary and save (`:349-371`): "المحاور المختارة: {labels}", "الوتيرة اليومية: {pace label}", and the button "حفظ التفضيلات والعودة للمسار" (editing) or "حفظ التفضيلات وبدء الرحلة". It calls `onComplete` with the current values (`:68-74`).

**Helpers, sub-components and constants defined in the file.** `THEME_SHORT_NAMES` (`:20-25`): `din` "العبادات", `afiyah` "البدن", `nasl` "الأهل والمودة", `rizq` "الرزق والسكينة". `toggleTheme`, `promoteThemeOrder`, `handleSaveAndStart`.

**Styling.** `animate-fade-in` on the root; `min-h-[calc(100vh-8rem)]`, `pb-28`; same hard-coded palette. Classes without a light-theme override include `bg-[#1E1E38]/45` on unselected cards and pace buttons and `hover:bg-[#232342]`. Breakpoints: `sm` (two-column pace grid, larger type), `md`, `lg` (max width). The switch thumb moves with `-translate-x-6` (RTL).

**Accessibility.**

- Sections use `aria-labelledby` pointing at their `h2`.
- Theme cards are `div[role="button"][tabIndex=0][aria-pressed]` with Enter and Space handling (`:153-164`). The "تقديم" `<button>` is nested inside that element. Its click handler stops propagation (`:57`), but the card's `onKeyDown` does not check the event target, so pressing Enter or Space while "تقديم" is focused runs the card's handler: it calls `preventDefault()` and toggles the card. Whether the button's own activation still fires was not tested in a browser.
- Pace buttons use `aria-pressed`. The reminder control is `role="switch"` with `aria-checked`. The time input has a `<label htmlFor>`.
- The unselected circle contains a check icon drawn in transparent colour.

**Notes and quirks.**

- The parent passes `state.reminderTime || notificationTime` (`src/components/journey/JourneyPathScreen.tsx:602`). When the saved reminder is `null`, the app-wide notification time is used instead, so the switch starts **on** every time the form is opened. Saving then calls `setNotificationsEnabled(true)`.
- The comparison `initialReminderTime !== null` (`:42`) is redundant for a prop typed `string` with a default.
- If `initialThemes` contains a key that matches no template `theme` (the store also accepts stage ids and Arabic aliases, `src/lib/journeyStore.ts:156-165`), it is counted in "تم اختيار" and listed in the summary, but no card appears selected.
- Theme labels exist in three places: `THEME_SHORT_NAMES` here, `themeLabelsMap` in the path screen, and `focusLabel` in the JSON (which differs: "العبادات ومواسمها", "البدن والحواس").

## `src/components/journey/JourneyMuhasabaScreen.tsx`

**Purpose.** End-of-stage review screen.

**Mounted from.** `src/components/journey/JourneyPathScreen.tsx:975-981`.

**Exports.** Named `JourneyMuhasabaScreen` (`:21`). No default export.

**Props** (`:8-19`).

| Name | Type | Required | What it does |
|---|---|---|---|
| `stage` | `{ id, theme, title, stationBlessingIds }` | yes | `id`, `title`, `stationBlessingIds` are used. **`theme` is declared and never read.** |
| `journalMap` | `Record<string, string>` | yes | The whole `journeyState.journal`; looked up by station id |
| `initialAnswers` | `{ q1, q2 }` | no | Pre-fills the two textareas |
| `onClose` | function | yes | X button |
| `onSave` | `(q1, q2) => void` | yes | Form submit |

**Store / persistence.** `useStore()` for `triggerHaptic` only (`:28`). `makeStationId` from `journeyStore` (`:4`, `:34`) and `getBlessingById` (`:35`). No `localStorage`, analytics or window events; the parent saves.

**Local state, refs, memos.** `q1`, `q2` (`:29-30`). `stageStationsSummary` is rebuilt on each render: station number, blessing `title` (fallback "نعمة") and journal text (`:33-42`).

**Effects, timers, browser APIs.** None.

**UI structure and behaviour.**

1. Top bar (`:57-69`): pill "ختام {stage title}" and X button (`aria-label="إغلاق"`).
2. Title (`:72-79`): `h2` "وقفة محاسبة" and "أتممتَ المحطات السبع في «{stage title}». هذه تدويناتك الخاصة خلال هذا المنزل، فقف معها وقفة تأملٍ هادئة."
3. Journal list (`:82-112`): heading "ما دوّنته في هذا المنزل ({n} محطات)"; a scrollable list (`max-h-60`) with one row per station: "المحطة {n} · {blessing title}", a check icon, and the journal text in « » or "تأمل صامت (دون تدوين نصي)" when there is none.
4. Form (`:115-166`):
   - "١. أي نعمة في هذا المنزل كنت أغفل عنها أكثر؟" — textarea `#muhasaba-q1`, placeholder "اكتب بتأملٍ وصدق مع نفسك..."
   - "٢. ماذا ستغير في يومك بعد هذا المنزل؟" — textarea `#muhasaba-q2`, placeholder "خطوة عملية أو عادة قلبية تنوي المداومة عليها..."
   - privacy line "تُخزن إجاباتك وتأملاتك محليًا على جهازك فقط ولا يتم إرسالها لأي جهة خارجية."
   - submit button "حفظ وقفة المحاسبة وفتح المنزل التالي".

   Submit prevents the default, fires a `success` haptic and calls `onSave(q1, q2)` (`:44-48`). Neither field is required.

**Helpers, sub-components and constants defined in the file.** `handleSubmit` only.

**Styling.** `fixed inset-0 z-50`, `overflow-y-auto`, `animate-fade-in`, same palette. `bg-[#1E1E38]/85` and `/60` have no light-theme override. Breakpoints `sm`, `md`.

**Accessibility.** Both textareas have `<label htmlFor>`. The overlay has no `role="dialog"`, `aria-modal`, focus management or Escape handling. The check icon appears on every row regardless of station state and has no text alternative.

**Notes and quirks.**

- The submit label says "وفتح المنزل التالي" even for the last stage and when editing an existing muhasaba.
- Closing with X discards the typed answers. For a non-final stage this can leave the muhasaba unreachable (section 6).
- The check icon is not tied to completion data; the screen assumes it is opened only when all stations are complete.

## `src/components/journey/JourneyWeeklyProgressChart.tsx`

**Purpose.** Seven-day activity card on the stats tab.

**Mounted from.** `src/components/journey/JourneyPathScreen.tsx:914-917`.

**Exports.** Named `JourneyWeeklyProgressChart` (`:32`). No default export.

**Props** (`:17-20`).

| Name | Type | Required | What it does |
|---|---|---|---|
| `journeyState` | `JourneyState` (from `src/types.ts`) | yes | Uses `completed`, `stages`, `pace` |
| `completedDays` | string[] | no, default `[]` | General daily-reflection dates (`YYYY-MM-DD`) merged into the chart |

No prop is unused.

**Store / persistence.** None. Imports `getLocalDateString` from `journeyStore` (`:14`).

**Local state, refs, memos.**

- `chartView` (`:36`): `'combined'` (default) or `'daily'`.
- `weeklyStats` (`:38-120`), `useMemo` on `journeyState.completed`, `journeyState.stages`, `journeyState.pace`, `completedDays`. Returns `data` (seven rows of `dateIso`, `dayLabel`, `dailyBlessings`, `cumulativeBlessings`, `paceTarget`), `weekBlessingsTotal`, `activeDaysThisWeek`, `totalCompletedStations`, `totalStationsInJourney`. Completion timestamps are converted to local dates; an unparseable timestamp falls back to its first ten characters (`:51-54`). `dayLabel` is "اليوم" for today, otherwise the Arabic weekday.
- `motivationalMessage` (`:123-134`), by `activeDaysThisWeek`: 5 or more "ما شاء الله، حضورٌ قلبيٌّ متصل مع تدبر النعم هذا الأسبوع."; 2–4 "خطواتٌ هادئة ومباركة على مسار التدبر؛ قليلٌ دائم خيرٌ من كثيرٍ منقطع."; 1 "بداية طيبة هذا الأسبوع؛ محطة واحدة في اليوم تفتح للقلب أبواب الشكر."; 0 "ابدأ محطتك اليوم لتضيء مسار تدبرك الأسبوعي خطوةً بخطوة."

**Effects, timers, browser APIs.** None of its own. `ResponsiveContainer` from Recharts measures its parent.

**UI structure and behaviour.**

`section[aria-label="التقدم الأسبوعي في تدبر النعم"]` (`:137-141`):

1. Header (`:143-183`): "أثر المداومة الأسبوعي", "متابعة بصرية هادئة لتدبر النعم خلال آخر {٧} أيام", and a two-button switch "التراكمي واليومي" / "الورد اليومي" that sets `chartView`.
2. Three counters (`:186-222`): "نعم الأسبوع", "أيام الحضور" ({n} / {٧}), "محطات الرحلة" ({done} / {total}).
3. Chart (`:225-327`), in an `h-48` container, inside `div[dir="ltr"]`, so the oldest day is on the left and today on the right. A `ComposedChart` with a horizontal dashed grid, an x-axis of day labels, a y-axis in Arabic-Indic digits with no decimals, violet bars for `dailyBlessings` (16 px wide, 24 px in the daily view) and, in the combined view only, a gold area for `cumulativeBlessings`. The custom tooltip shows the day, "نعم متدبَّرة في اليوم:", "التقدم التراكمي:" (combined view only) and "الوتيرة اليومية: {pace} محطة".
4. Footer (`:330-344`): the motivational message and a legend, "نعم اليوم" and, in the combined view, "التقدم التراكمي".

**Helpers, sub-components and constants defined in the file.** `ARABIC_WEEKDAYS` (`:22-30`), Sunday first, indexed by `Date.getDay()`.

**Styling.** Hard-coded colours passed to Recharts as props: ticks `#AEAECB`, grid `#2E2E4A`, area `#E4C368`, bars `#6C63FF`; gradient ids `journeyCumulativeGrad` and `journeyDailyBarGrad` (`:231-240`). These are SVG attributes, so the class-based theme overrides in `src/index.css` do not reach them. Card classes: `bg-[#1E1E38]/90` (overridden in light theme), `border-[#2E2E4A]`. Breakpoint `sm` only.

**Accessibility.** The section is labelled. The chart has no text alternative for per-day values; they are available only through the hover tooltip. The switch buttons have no `aria-pressed`.

**Notes and quirks.**

- The chart mixes journey completions with the app's general daily reflections, taking the larger of the two per day and for the cumulative line (`:78-91`). It is not a pure journey chart.
- `completedDays` entries are UTC dates (`toISOString().split('T')[0]`, `src/lib/store.tsx:551`), while the chart's day keys are local dates (`:76`). Near midnight in non-UTC time zones a reflection can land on the neighbouring day.
- "محطات الرحلة" can show a numerator larger than the denominator if `completed` holds stations of removed stages (`:107-111`).
- `today` is created inside the memo (`:39`), so the window does not move at midnight until a dependency changes.
- `paceTarget` is in the data but is not drawn; it appears in the tooltip only.

## `src/components/journey/JourneyPaywall.tsx`

**Purpose.** Compatibility shim. The whole file is one re-export statement (`:1-7`).

**Exports.** From `../screens/PremiumPaywallScreen`: `PremiumPaywallScreen`; the same component again as `JourneyPaywall`; the type `PremiumPaywallScreenProps`; the same type again as `JourneyPaywallProps`; and `default`.

**Mounted from / imported by.** Nothing. A search of `src/` for `JourneyPaywall` matches only this file.

Props, state, effects, UI, styling and accessibility: none of its own; see the paywall component's documentation.

## `src/components/journey/PremiumPaywallScreen.tsx`

**Purpose.** Compatibility shim. The whole file is one re-export statement (`:1-5`).

**Exports.** From `../screens/PremiumPaywallScreen`: `PremiumPaywallScreen`, the type `PremiumPaywallScreenProps`, and `default`.

**Mounted from / imported by.** `src/components/journey/JourneyPathScreen.tsx:42` imports `PremiumPaywallScreen` from `./PremiumPaywallScreen` and renders it at `src/components/journey/JourneyPathScreen.tsx:1380-1392`. `App` and `SettingsScreen` import the real file directly (`src/App.tsx:21`, `src/components/screens/SettingsScreen.tsx:35`).

Props, state, effects, UI, styling and accessibility: none of its own.

## `src/components/screens/JourneyPathScreen.tsx`

**Purpose.** Compatibility shim. The whole file is `export { JourneyPathScreen, default } from '../journey/JourneyPathScreen';` (`:1`).

**Exports.** Named `JourneyPathScreen` and `default`, both the component from `src/components/journey/JourneyPathScreen.tsx`.

**Mounted from / imported by.** Nothing. `App` imports the component from `./components/journey/JourneyPathScreen` (`src/App.tsx:7`).

## `src/data/journey_content.json`

**Purpose.** Authored content for the journey. Imported once, in `src/lib/journeyStore.ts:1`, and cast to `JourneyContentFile` with `as unknown as` (`src/lib/journeyStore.ts:56`). There is no runtime validation.

**Read through.** `getAllStageTemplates()` (customisation form), `getStageContent()` (path header), `getStationContent()` (station flow) and `buildStagesFromThemes()` (building the user's stages).

### Schema

Types are in `src/lib/journeyStore.ts:6-50`.

Top level:

| Field | Type | Value in the file | Read at run time |
|---|---|---|---|
| `schemaVersion` | number | `1` | No |
| `reviewStatus` | string | `"pending_review"` | No |
| `reviewedBy` | string | `""` | No |
| `reviewDate` | string or null | `null` | No |
| `contentNote` | string | Arabic note (see below) | No |
| `stages` | array | 4 stages | Yes |

Stage (`JourneyStageContent`):

| Field | Type | Read at run time |
|---|---|---|
| `id` | string | Yes. Stage identity; prefix of station ids; stored in the user's state |
| `theme` | string | Yes. Selection key in the customisation form and in `focusThemes` |
| `focusLabel` | string | Only as a fallback label (`src/components/journey/JourneyOnboarding.tsx:79`, `:144`) and as a match key in `buildStagesFromThemes` (`src/lib/journeyStore.ts:160`). All four themes have a short name in `THEME_SHORT_NAMES`, so it is not displayed today |
| `focusDescription` | string | Yes. Customisation card (`src/components/journey/JourneyOnboarding.tsx:187`) |
| `title` | string | Yes. Copied into the user's stage (`src/lib/journeyStore.ts:187`) and shown throughout |
| `reviewStatus`, `reviewedBy`, `reviewDate` | review fields | No |
| `intention` | `AuthoredTextField` | `text` is shown in the path header (`src/components/journey/JourneyPathScreen.tsx:716`); review fields are not read |
| `stations` | array of 7 | Yes. Only the first 7 are used (`src/lib/journeyStore.ts:177`) |

Station (`JourneyStationContent`):

| Field | Type | Read at run time |
|---|---|---|
| `blessingId` | string | Yes. Copied into the user's `stationBlessingIds`; previewed in the customisation form |
| `reviewStatus` | `'pending_review'` or `'approved'`, optional | No |
| `journalPrompt` | `AuthoredTextField` | `text` shown in the `dawwin` phase; `reviewStatus` not read |
| `dailyAction` | `AuthoredTextField` | `text` shown in the `amal` phase; `reviewStatus` drives the "قيد المراجعة" label |
| `sacredPlaceholder` | `SacredPlaceholderField`, optional | No |
| `dhikrPlaceholder` | `SacredPlaceholderField`, optional | No |

`AuthoredTextField`: `text`, `reviewStatus`, optional `reviewedBy`, optional `reviewDate`.

`SacredPlaceholderField`: `token` (`'[[AYAH_TOKEN]]'` or `'[[HADITH_TOKEN]]'`), `verifiedVerbatim` (boolean), `reviewStatus`, optional `reviewedBy`, optional `reviewDate`.

### Observations

- Every `reviewStatus` in the file is `pending_review`, every `reviewedBy` is `""`, every `verifiedVerbatim` is `false`.
- `contentNote` (`src/data/journey_content.json:6`) says the file holds two trial stages ("مرحلتين تجريبيتين"). It holds four.
- Stages `stage_ibadah` and `stage_badan` have both placeholders on every station. Stages `stage_ahl` and `stage_rizq` have none.
- One field name is misspelled: `"reviewedDate"` instead of `"reviewDate"` in the daily action of `stage_rizq` station 3 (`src/data/journey_content.json:655`).
- All 28 `blessingId` values exist in `src/data/blessings_ar.json` (40 blessings), and no blessing is used twice. Each referenced blessing has five `istisharSteps` of types `ground`, `visualize`, `deepen`, `return`, `hamd` with durations 10, 20, 20, 15, 15 seconds. All 40 blessings are themselves `pending_review`.
- The first station's id is `islam`; the others follow the `blessing_NNN` pattern.
- A stage's `theme` matches a blessing category key, but stations are not limited to that category: `stage_badan` includes blessings from `nafs` and `aql`, `stage_ahl` one from `amn`, `stage_rizq` blessings from `nafs` and `amn` (see the "Blessing" columns below).
- The user's stages (`id`, `theme`, `title`, `stationBlessingIds`) are copied into `localStorage` when the default state is created or the customisation form is saved, and are kept as stored on later loads (`src/lib/journeyStore.ts:289-315`). Journal prompts, daily actions and intentions are looked up live from this file. `getStationContent` matches by station index first and by `blessingId` second, and falls back to a generic prompt "اكتب موقفًا شعرت فيه بقيمة هذه النعمة." and action "اشكر من أعانك اليوم بكلمة." (`src/lib/journeyStore.ts:114-144`).

### Stages

| # | `id` | `theme` | `focusLabel` | `focusDescription` | `title` | `intention.text` | `reviewStatus` (stage / intention) | Line |
|---|---|---|---|---|---|---|---|---|
| 1 | `stage_ibadah` | `din` | العبادات ومواسمها | تأمل نعمة الهداية، الصلاة، القرآن، ومواسم القرب من الله | منزل نعمة العبادة | في هذا المنزل نتأمل نعمة الاصطفاء والقرب والوقوف بين يدي الله. | `pending_review` / `pending_review` | `src/data/journey_content.json:9` |
| 2 | `stage_badan` | `afiyah` | البدن والحواس | تأمل نعمة العافية، السمع، البصر، الحركة، والأنفاس الصامتة | منزل نعمة البدن | في هذا المنزل نتأمل نعمة الجسد الذي نغفل عنه. | `pending_review` / `pending_review` | `src/data/journey_content.json:237` |
| 3 | `stage_ahl` | `nasl` | الأهل والمودة | تأمل نعمة الوالدين، السكن الزوجي، الذرية، الأرحام، والصحبة الصالحة | منزل نعمة الأهل | في هذا المنزل نتأمل القلوب التي آنس الله بها وحشتنا وجعلها سكنًا ومودة. | `pending_review` / `pending_review` | `src/data/journey_content.json:465` |
| 4 | `stage_rizq` | `rizq` | الرزق والسكينة | تأمل نعمة الكفاية، الماء، الطعام، العمل، القناعة، والأمن في الأوطان | منزل نعمة الرزق والسكينة | في هذا المنزل نتأمل أرزاق الله التي تسري إلينا كل يومٍ بلطفٍ وكفاية. | `pending_review` / `pending_review` | `src/data/journey_content.json:595` |

### Stations

Columns: "Blessing" is the `shortTitle` and category key of the referenced record in `src/data/blessings_ar.json`, added for readability. "Placeholders" lists `sacredPlaceholder.token` / `dhikrPlaceholder.token`. "Review" is the station-level `reviewStatus`; the `journalPrompt` and `dailyAction` review statuses are the same value in every row.

#### Stage 1 — `stage_ibadah` (منزل نعمة العبادة)

| Stage | Index | `blessingId` | Blessing | `journalPrompt.text` | `dailyAction.text` | Placeholders (sacred / dhikr) | Review | Line |
|---|---|---|---|---|---|---|---|---|
| `stage_ibadah` | 1 | `islam` | الإسلام (`din`) | اكتب موقفًا شعرت فيه بقيمة هذه النعمة وطمأنينة الانتماء إليها. | جدّد نيتك في عملٍ عاديّ تقوم به اليوم ليكون خالصًا لله. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:25` |
| `stage_ibadah` | 2 | `blessing_002` | معرفة الله (`din`) | متى شعرتَ بربّك قريبًا منك يسمع نجواك في لحظة ضيق؟ | اختلِ بنفسك دقيقتين اليوم في مكان هادئ وناجِ ربك بما في صدرك. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:55` |
| `stage_ibadah` | 3 | `blessing_003` | القرآن (`din`) | ما الآية التي كلما سمعتها شعرتَ أنها تخاطب قلبك مباشرة؟ | اقرأ اليوم خمس آيات من المصحف بتأنٍّ وتأملٍ في معانيها. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:85` |
| `stage_ibadah` | 4 | `blessing_005` | الصلاة (`din`) | صف شعورك بعد صلاةٍ أدّيتها بقلبٍ حاضرٍ وسكينة. | توضأ للصلاة القادمة قبل الأذان بدقائق واستحضر الوقوف بين يدي الله. | `[[HADITH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:115` |
| `stage_ibadah` | 5 | `blessing_006` | الدعاء (`din`) | تذكّر دعوةً قديمةً استجابها الله لك أو صرف عنك بها سوءًا. | ادعُ اليوم لإنسانٍ تحبه بظهر الغيب دون أن تخبره. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:145` |
| `stage_ibadah` | 6 | `blessing_007` | التوبة (`din`) | ماذا يعني لقلبك أن باب العودة إلى الله مفتوح في كل لحظة؟ | خصص لحظةً قبل نومك اليوم لمحاسبة نفسك بهدوء واستغفار. | `[[HADITH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:175` |
| `stage_ibadah` | 7 | `blessing_009` | الذكر (`din`) | في أي أوقات يومك تجد أثر الذكر أشدّ طمأنينةً على قلبك؟ | اجعل طريقك اليوم أو وقت انتظارك معمورًا بالتسبيح الهادئ. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:205` |

#### Stage 2 — `stage_badan` (منزل نعمة البدن)

| Stage | Index | `blessingId` | Blessing | `journalPrompt.text` | `dailyAction.text` | Placeholders (sacred / dhikr) | Review | Line |
|---|---|---|---|---|---|---|---|---|
| `stage_badan` | 1 | `blessing_035` | العافية (`afiyah`) | اكتب موقفًا شعرت فيه بقيمة العافية بعد وعكةٍ أو تعبٍ عابر. | اسأل عن مريضٍ تعرفه اليوم أو ادعُ له بالشفاء والعافية. | `[[HADITH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:253` |
| `stage_badan` | 2 | `blessing_036` | السمع (`afiyah`) | ما الصوت الطيب الذي سمعته قريبًا وأدخل السكينة على قلبك؟ | أنصت اليوم باهتمامٍ كاملٍ لمن يحدثك دون مقاطعة أو انشغال. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:283` |
| `stage_badan` | 3 | `blessing_037` | البصر (`afiyah`) | صف مشهدًا رأته عيناك اليوم وتوقفتَ عنده متأملًا. | انظر اليوم إلى السماء أو الطبيعة حولك نظرة تدبرٍ صامتة لمدة دقيقة. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:313` |
| `stage_badan` | 4 | `blessing_038` | الحركة (`afiyah`) | ما العمل الذي أنجزته بيديك أو سرتَ إليه بقدميك اليوم وتستشعر فيه فضل الله؟ | أعِن أحدًا اليوم بيدك في حمل شيءٍ أو قضاء حاجةٍ يسيرة. | `[[HADITH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:343` |
| `stage_badan` | 5 | `blessing_017` | النَّفَس (`nafs`) | حين تتنفس بعمقٍ وهدوء الآن، ما الشعور الذي يسري في صدرك؟ | توقف ثلاث مرات اليوم لتأخذ نفسًا عميقًا وتحمد الله في سرك. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:373` |
| `stage_badan` | 6 | `blessing_014` | النوم (`nafs`) | تذكّر ليلةً نمتَ فيها مطمئنًا بعد تعبٍ طويل… كيف كان صباحك؟ | اترك الهاتف قبل نومك الليلة بربع ساعة لتسكن نفسك وتستحضر أذكار النوم. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:403` |
| `stage_badan` | 7 | `blessing_021` | البيان (`aql`) | ما الكلمة الطيبة التي نطقتَ بها يومًا فتركت أثرًا جميلًا فيمن حولك؟ | اشكر من أعانك اليوم بكلمةٍ طيبةٍ صادقة. | `[[AYAH_TOKEN]]` / `[[HADITH_TOKEN]]` | `pending_review` | `:433` |

#### Stage 3 — `stage_ahl` (منزل نعمة الأهل)

| Stage | Index | `blessingId` | Blessing | `journalPrompt.text` | `dailyAction.text` | Placeholders (sacred / dhikr) | Review | Line |
|---|---|---|---|---|---|---|---|---|
| `stage_ahl` | 1 | `blessing_022` | الأم (`nasl`) | تذكّر موقفًا شعرتَ فيه بدفء دعاء أمك أو حنانها عليك. | ادعُ لأمك اليوم دعوةً صادقةً أو أدخل السرور على قلبها بتواصلٍ لطيف. | none | `pending_review` | `:481` |
| `stage_ahl` | 2 | `blessing_023` | الأب (`nasl`) | ما الأثر الذي تركه أبوك في شخصيتك أو حياتك وتستشعر قيمته اليوم؟ | تصدّق اليوم بصدقةٍ يسيرةٍ أو دعوةٍ طيبةٍ بنية برّ والديك. | none | `pending_review` | `:497` |
| `stage_ahl` | 3 | `blessing_024` | السكن الزوجي (`nasl`) | كيف تجلّت لك معنى السكينة والمودة في بيتك وأهلك؟ | عبّر اليوم بكلمة امتنانٍ صادقةٍ لمن يشاركك بيتك وحياتك. | none | `pending_review` | `:513` |
| `stage_ahl` | 4 | `blessing_025` | الأولاد (`nasl`) | ما اللحظة التي أدخل فيها صغار العائلة البهجة والرحمة على قلبك؟ | امسح على رأس صغيرٍ في عائلتك اليوم وادعُ له بالبركة والصلاح. | none | `pending_review` | `:529` |
| `stage_ahl` | 5 | `blessing_026` | صلة الرحم (`nasl`) | من القريب الذي تشعر بالطمأنينة والبركة كلما وصلتَ رحمه؟ | أرسل رسالة سلامٍ وسؤالٍ لقريبٍ لم تتواصل معه منذ مدة. | none | `pending_review` | `:545` |
| `stage_ahl` | 6 | `blessing_027` | الصحبة الصالحة (`nasl`) | اذكر صديقًا صالحًا أعانك على الخير أو خفّف عنك عبء يومٍ ثقيل. | ادعُ لصديقك الصالح بظهر الغيب أو أخبره بامتنانك لوجوده. | none | `pending_review` | `:561` |
| `stage_ahl` | 7 | `blessing_033` | البيت (`amn`) | ما الشعور الذي يغمرك حين تغلق باب بيتك وتأوي إلى سكنك آمنًا؟ | قل دعاء دخول المنزل بحضور قلبٍ حين تعود إلى بيتك اليوم. | none | `pending_review` | `:577` |

#### Stage 4 — `stage_rizq` (منزل نعمة الرزق والسكينة)

| Stage | Index | `blessingId` | Blessing | `journalPrompt.text` | `dailyAction.text` | Placeholders (sacred / dhikr) | Review | Line |
|---|---|---|---|---|---|---|---|---|
| `stage_rizq` | 1 | `blessing_015` | الماء (`nafs`) | كيف تغيّر شعورك بشربة الماء العذب حين تستحضر تيسيرها لك؟ | توقف لحظةً قبل شرب الماء اليوم، وسمِّ الله، واحمده بقلبٍ حاضر. | none | `pending_review` | `:611` |
| `stage_rizq` | 2 | `blessing_016` | الطعام (`rizq`) | تأمّل في طعام يومك، كم سببًا سخّره الله ليصل إليك هنيئًا؟ | احرص اليوم على عدم إهدار أي جزءٍ من طعامك شكرًا لنعمة الله. | none | `pending_review` | `:627` |
| `stage_rizq` | 3 | `blessing_028` | الرزق (`rizq`) | متى جاءك رزقٌ أو فرجٌ من بابٍ لم تكن تحتسبه؟ | جدّد توكلك على الله في أمرٍ يشغل بالك اليوم وقل: حسبي الله ونعم الوكيل. | none | `pending_review` | `:643` |
| `stage_rizq` | 4 | `blessing_030` | العمل (`rizq`) | ما الجانب الذي تحمد الله عليه في عملك أو سعيك اليومي؟ | أتقن مهمةً واحدةً في عملك اليوم بنية الإحسان وشكر النعمة. | none | `pending_review` | `:659` |
| `stage_rizq` | 5 | `blessing_031` | القناعة (`rizq`) | اذكر ثلاثة أشياء تملكها اليوم كانت يومًا ما أمنيةً تدعو الله بها. | تصدّق اليوم بشيءٍ يسيرٍ مما رزقك الله تطهيرًا وبركة. | none | `pending_review` | `:675` |
| `stage_rizq` | 6 | `blessing_032` | الأمن (`amn`) | ما التفاصيل اليومية التي تنعم بها بفضل نعمة الأمن والطمأنينة؟ | ادعُ الله اليوم أن يديم الأمن والسكينة وأن يفرّج عن كل خائف. | none | `pending_review` | `:691` |
| `stage_rizq` | 7 | `blessing_039` | الوقت (`nafs`) | كيف يمكنك استثمار ساعة فراغٍ في يومك بما يترك أثرًا طيبًا في قلبك؟ | خصّص عشر دقائق من وقتك اليوم لعملٍ نافعٍ أو قراءةٍ هادئة بلا مقاطعة. | none | `pending_review` | `:707` |

The "Line" column gives the line of the station's `blessingId` in `src/data/journey_content.json`.
