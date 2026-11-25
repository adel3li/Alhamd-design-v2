# Findings and next steps

Written on 2026-11-17 against commit `68e723a`. This file has two parts:

- **Part A** lists the areas where the knowledge in this documentation can be put to work, with a suggested starting point for each.
- **Part B** is the register of concrete findings from the read-through, each with an id, a severity, the evidence and a direction.

## Status

The fixes so far are in commits `d3dfd92` to `23a188e` (17 November 2026). The rows below keep their original text; this table says what changed. Every finding not listed here is open.

| Id | Status | What changed |
|---|---|---|
| B-01 | Fixed | Finishing the welcome reflection records it and its day; the daily rotation starts the next day. Existing users with any completed reflection move straight on |
| B-02, B-06, B-10 | Fixed | Every day key comes from `src/lib/dates.ts` (the local day): completed days, journal dates, the calendar's today marker, the consistency statistics, the Hisn Al-Muslim counters. Days saved by earlier builds are left as they are |
| B-04 | Fixed | The verse of the day is formatted as a verse. Found by the type check once the React types were installed |
| B-05 | Fixed | The blessing, the verse and "done today" are recomputed when the local day changes, without a reload |
| B-07 | Fixed | A `YYYY-MM-DD` string is read as a local day |
| B-09 | Fixed | Reflection text is split without a regex lookbehind. The error boundary (M-03) is still missing |
| P-01 | Fixed | New users start empty. The samples earlier builds saved are removed on load and on backup import; the three seeded days are removed only when all three are found. Written here, not taken from the unmerged branch |
| U-01 | Fixed | The entrance animations no longer keep their end state, so no transform is left on the screens. Checked on all five screens |
| M-10 | Fixed | `@types/react` and `@types/react-dom` are installed and `strict` is on; the type check passes |
| S-01, P-05 | Resolved by the owner's decision | «رحلتي» is free for everyone (`b8db9cc`). One switch, `PAYWALL_ENABLED` in `src/lib/entitlements.ts`, is off: every premium check answers yes, and the paywall and the developer unlock are not rendered. If a paid tier is introduced later, the developer flag must first be replaced by a real purchase check |
| S-04, U-02, U-12 | Not rendered, still open | The developer tools and the paywall are not shown while `PAYWALL_ENABLED` is off. Their defects remain and matter only if a paywall comes back |
| B-03 | Fixed in `b8db9cc` | A station's note is copied into the main journal once |
| J-01 | Fixed in `b8db9cc` | The path stays on a finished stage until its end-of-stage review is saved |
| J-02 | Fixed in `b8db9cc` | First-time set-up opens on the first visit to the journey |
| J-03 | Resolved in `23a188e` as a gentle limit | The station preview already tells the user they may rest until tomorrow or start now, so the pace stays advisory. The unused strict gate (`handleStartStation`) is removed, and the day's count lapses at midnight. The set-up copy («تُفتح لك في كل يوم») is unchanged; say so if the limit should be hard instead |
| J-04 | Fixed in `23a188e` | The pacing timer only ever reveals more text. The daily reflection had the same step-back and got the same fix |
| U-05 | Resolved by the Home rewrite (25 November 2026) | The verse or hadith of the day on Home has no share button; it has a copy button that copies it, labelled for its type |
| C-07 | Fixed on Home (25 November 2026) | Home shows the scholar's remark without quotation marks, with «بالمعنى» for a paraphrase, and no hadith grade. The share image and the reflection are unchanged |
| Home, smaller items in [findings/screens-core.md](findings/screens-core.md) | Fixed by the Home rewrite (25 November 2026) | Clipboard failures are shown; the inspiration's copy button works from the keyboard and names the right type; the reflection toggle is gone (the tadabbur is never collapsed); one `h1` before the `h2`s; buttons are 44 px; the inspiration's source uses Arabic-Indic digits; a replayed tour finds «أعد الاستشعار» on a finished day; `getFormattedHijriDayHeader` is used (M-05) |
| J-05 | Fixed in `23a188e` | Set-up shows the journey's own reminder setting; saving other preferences no longer turns app notifications on |
| J-06 | Fixed in `23a188e` | Unsaved station notes and review answers are kept as drafts on the device (`alhamd:journey_drafts:v1`) and removed once saved |
| J-07 | Fixed in `23a188e` | The weekly chart counts journey stations only, and "done out of total" counts stations on the current path |
| J-08 | Fixed in part in `23a188e` | The station's note can be deleted from the station preview, and clearing it on a replay clears it. The copy added to «سجل الحمد» on completion is still a separate entry, deleted from there |
| J-09 | Fixed in `23a188e` | The current station's start button applies the free-taste rule, which now has one definition (`isBeyondFreeLimit`). It only runs if a paywall is switched on |
| J-10 | Fixed in `23a188e` for the journey | The station preview, the station session and the review are modal dialogs with focus handling and Escape (`src/lib/useDialog.ts`). The rest of the app's overlays are still open under A-03 |
| J-11 | Fixed in `23a188e` | The day's count lapses at midnight; the two events are recorded once; station counts come from the stage; totals ignore deselected themes; timeouts are cleared; the misspelled content key is corrected |
| J-12 | Fixed in `23a188e` | Dead code removed from the path screen. The free-taste rule is defined once for the places that share it |
| C-02 | **Open, and reachable by every user** | The journey's own texts (stage intentions, journal prompts, daily actions) are still `pending_review`, and 28 sacred or dhikr slots hold placeholder tokens instead of text |
| P-02 | Fixed in `403f633` | The streak card, the seven-day chart, the running total and the month percentage are gone from the consistency screen; the Hijri calendar stays. Cherry-picked from `e2296c2` |
| P-03 | Fixed in `b7b2e94` | Onboarding, the tour text and the landing page all say 80 seconds. Cherry-picked from `4209f2c`, without its change to the landing page's sourcing sentence |
| Part A, 12 | Started in `755170f` | `reflection_started`, `reflection_step_viewed` and `reflection_completed` are recorded, consent-gated and kept on the device like the journey events. Cherry-picked from `16dd14a` |
| C-01 | Changed by the owner's decision | The "under review" badges are no longer shown to users. The content sheet reads its count from the data, and neither it nor the landing page now says the texts were reviewed or approved. The review itself has not been done |
| C-08 | Partly changed | The landing page's sourcing sentence no longer claims scholarly review or the Uthmani script. Since `9f6b4a0` the content sheet's verse paragraph names the real source, the Tanzil Project, with a link. Its hadith paragraph ("only sound and good hadith") and the landing page's "free" are unchanged |
| C-06 | Fixed in `d42c2b0` | The share image draws the whole verse, shrinking its type until it fits, and waits for its fonts before drawing |
| Content | 60 blessings added in `9f6b4a0` | The app now has 100 blessings and ten categories. The 60 new verses are whole ayahs from the Tanzil Project's text and are unreviewed like the rest. New findings C-09 and C-10 below come from this import |
| Content | 25 blessings added (376–400) | Built complete on the same rules as 151–200. Unreviewed |
| Content | 25 blessings added (351–375) | Built complete on the same rules as 151–200. Unreviewed |
| Content | 25 blessings added (326–350) | Built complete on the same rules as 151–200. Unreviewed |
| Content | 25 blessings added (301–325) | Built complete on the same rules as 151–200. Unreviewed |
| Content | 25 blessings added (276–300) | Built complete on the same rules as 151–200. Unreviewed |
| Content | 25 blessings added (251–275) | Built complete on the same rules as 151–200. Unreviewed |
| Content | 25 blessings added (226–250) | Built complete on the same rules as 151–200. Unreviewed |
| Content | 25 blessings added (201–225) | Built complete on the same rules as 151–200. Unreviewed |
| Content | 25 blessings added (176–200) | Fourth and last batch of the second hundred: the app has 200 blessings. Same rules as 151–175. Unreviewed |
| Content | 25 blessings added (151–175) | Third batch, built complete on the same rules: hadith from the two Sahihs or, graded by al-Albani, from Tirmidhi, Abu Dawud and al-Nasa'i. Unreviewed |
| Content | 25 blessings added (126–150) | Second batch, built complete: verse, hadith (one from Sunan al-Tirmidhi, graded by al-Albani), al-Sa'di quote, sourced supplication where one fits, and drafted text. Unreviewed like the rest |
| Content | Hadith and sourced supplications added | 77 hadith on blessings 41–125 from Bukhari and Muslim, 25 verbatim tafsir quotes on 101–125, and 27 supplications from the Qur'an or the Sahihs shown beneath the short `duaa`. All copied by script from published sources; unreviewed. New finding C-12 |
| Content | 25 blessings added (101–125) | First batch of four for a second hundred. Verses are whole ayahs from Tanzil, chosen by reference with the owner; hadith, scholar quote and supplication are left empty for the owner and a reviewer. New findings C-11 and B-13 below |
| M-09 | Partly fixed | The `getDayNumber` and `fontSize` comments were corrected |

How the fixes were checked: 95 scripted checks in a headless browser against the production build (43 for the first round, 22 for the journey fixes in `23a188e`, 30 for the import of blessings 41–100, including 99 consecutive days that each showed a different blessing with its exact verse), plus `bun run lint` and `bun run build`. The checks cover a new user at 01:30 Riyadh time, the welcome reflection end to end, the next day without a reload, an existing user with seeded and real data, overlay geometry on every screen, the consistency screen without streaks, entering the journey with no paywall, its first-visit set-up, one station completed with a note, and a finished stage whose review was not saved. The scripts were written for these changes and are not in the repository; there is still no test suite.

How each finding was established is stated in its row: **run time** means the behaviour was observed in a headless browser against the production build; **code** means it was read in the source and, for "nothing calls X" claims, confirmed with a repository-wide search; **run time (reviewer)** means it was observed in a browser by one of the parallel reviewers that read each area line by line; **branch** means a fix already exists on the unmerged branch `claude/trusting-rubin-9ue5hh` (see [HISTORY.md](HISTORY.md), section 9).

Severity: **High** breaks a core promise or a core flow for every user; **Medium** is wrong or risky in a common situation; **Low** is a defect with limited reach, or cleanup.

---

## Part A — Where this knowledge can be used

The first three are the ones already planned. The rest are suggestions, ordered roughly by how much the current code would gain.

| # | Area | Why it is worth doing here | Where to start |
|---:|---|---|---|
| 1 | **Frontend quality** | The UI works, but it is built from very large components (one file is 1,398 lines), hard-coded colours, a light theme implemented by CSS overrides, inline copy, and dead UI paths | Fix the High items in B, U and J first; then split the largest screens, move colours to variables, and add screenshot comparisons so refactors are safe |
| 2 | **Testing** | There are no tests, no test runner and no CI. Several High bugs (B-01, B-02) would have been caught by ten lines of unit tests | Vitest for the pure modules listed in [reference/03](reference/03-domain-logic.md) section 6 and in T-01 to T-06; Playwright for the five core flows; a timezone matrix |
| 3 | **Security and privacy** | No backend limits the attack surface, but premium is a client flag anyone can set, imported backups are not validated, no security headers are sent, and the privacy promise is broader than what the app does | S-01 to S-12; then a privacy-policy review against [reference/11](reference/11-build-and-deployment.md) section 5 |
| 4 | **Product-promise integrity** | The app promises no streaks, an honest duration, an empty private journal and reviewed text; the code breaks each of these today | P-01 to P-06. Six fixes and a build-time guard already exist on an unmerged branch |
| 5 | **Content and scholarly review** | 0 of 100 blessings and 0 journey texts are approved; adhkar have no review fields; the UI does not distinguish reviewed from unreviewed sacred text | C-01 to C-10; a reviewer worksheet generated from the JSON. The verse check against a trusted Qur'an source is done for the blessings' verses ([reference/04](reference/04-content-and-data.md), section 1.7); it does not replace a named reviewer |
| 6 | **Performance** | One 1 MB JavaScript chunk (280 kB gzipped) loads before first paint; every store change re-renders every consumer; five font families block rendering | PF-01 to PF-06; lazy-load each tab and recharts first |
| 7 | **Accessibility** | Zoom is disabled, there is no reduced-motion handling, and modals are hand-built | A-01 onward; an automated axe pass, then a screen-reader walk-through in Arabic |
| 8 | **Design-system consolidation** | Colours live in four places that disagree (CSS variables, hex classes, `tokens.ts`, the landing page) | D-01 onward; one token source, components that read variables, removal of the override block |
| 9 | **Data model and migrations** | Two key naming styles, UTC and local dates mixed in stored data, no migration mechanism, a backup that omits several things | [reference/02](reference/02-state-and-persistence.md); a versioned storage layer with migrations and schema validation |
| 10 | **Monetisation** | The paywall, plans and entitlement interface exist; payment does not, prices are placeholders, and the free tier is unreachable | S-01, P-05; RevenueCat behind the existing `isPremium()` interface |
| 11 | **Reminders, PWA and native packaging** | The UI offers a daily reminder that never fires; there is no manifest or service worker; v1 already used Capacitor | P-04; a web manifest and offline shell; then decide between web push and a Capacitor build |
| 12 | **Measurement** | Analytics are consent-gated and local-only, and the core action, the daily reflection, records nothing | A decision on whether events should ever leave the device; the reflection events on the unmerged branch |
| 13 | **Engineering hygiene** | No lint rules, `strict` off, unused dependencies, dead code, an old app and AI Studio files in the repository, unmerged branches with live fixes | M-01 onward |
| 14 | **Landing page and SEO** | The landing page repeats app content by hand and can drift; no share image; the same pages answer on two hosts | L-01 onward |
| 15 | **Internationalisation** | All copy is Arabic and inline, so a second language or a copy review means touching every component | Move strings into `src/constants/strings.ts` (already started, mostly unused) |
| 16 | **Working with the codebase** | A new developer or a new AI session has no map | Done in part by this documentation and `CLAUDE.md`; keep both current |

---

## Part B — Findings register

### B. Bugs

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| B-01 | High | **The blessing of the day never changes.** Home shows «نعمة الإسلام» every day for every real user, because the "welcome seen" flag is never set | `src/lib/store.tsx:117`, `406`; `src/lib/dailyLogic.ts:47`; no caller of `markWelcomeSeen`. **Run time:** same blessing on 17, 18 and 25 Nov; rotates only when `alhamd_welcome_seen` is set by hand | Set the flag when the first reflection completes, as v1 did (`legacy/src/App.tsx:160`), or remove the gate. Add a unit test |
| B-02 | High | **"Done today" follows the UTC date, not the user's date.** Between local midnight and the UTC offset, yesterday's reflection still counts as today and a new one is recorded as yesterday | `src/lib/store.tsx:330`, `479`, `551`. **Run time:** Riyadh, 01:00 on 18 Nov | Use `getLocalDateString` for all day keys; decide how to treat already stored UTC dates |
| B-03 | Medium | A journey station completed with journal text adds **two identical entries** to the main journal; replaying a station adds more | `src/components/journey/JourneyPathScreen.tsx:440`, `560`, `567` (code) | Write the journal copy once, keyed by station id |
| B-04 | Medium | The verse of the day is formatted as a hadith: guillemets instead of ﴿ ﴾ and without the Qur'an typeface. The code tests for type `'ayah'`; the data uses `'quran'` | `src/components/screens/HomeScreen.tsx:51`, `95`, `137`; `src/data/inspirations.ts`. **Run time** | Compare with `'quran'`; type the prop so the compiler catches it |
| B-05 | Medium | The blessing and verse of the day are computed once when the app mounts. A tab left open past midnight shows yesterday's until reload | `src/lib/store.tsx:317`, `323` (code) | Recompute on `visibilitychange` or when the local date changes |
| B-06 | Medium | The calendar's "today" marker uses the UTC date while its cells use local dates | `src/lib/hijri.ts:191`, `218` (code) | Same fix as B-02 |
| B-07 | Low | `blessingForDate` given a date string returns the previous day's blessing in time zones behind UTC | `src/lib/dailyLogic.ts:27`; caller `src/components/common/ReflectionCategoryCharts.tsx:130` (code) | Parse `YYYY-MM-DD` as a local date |
| B-08 | Low | Backup restore ignores three settings that backup writes (`notificationsEnabled`, `onboardingComplete`, `welcomeSeen`); tasbih count, Hisn counters and favourites, reciter and volume are not backed up at all | `src/lib/store.tsx:583`–`634` (code) | Decide what a backup is for, then make export and import symmetrical |
| B-09 | Medium | **Opening a reflection may crash on iOS before 16.4.** Both reflection screens split text with a regular-expression lookbehind, which Safari did not support before 16.4. The build emits it as `new RegExp(...)` inside the component, so the error is thrown during render, and there is no error boundary. Not tested on a device | `src/components/screens/ReflectionModal.tsx:53`; `src/components/journey/JourneyStationFlow.tsx:71`; present in `dist/assets/main-*.js` (code) | Split without lookbehind; add an error boundary (M-03) |
| B-10 | Medium | Hisn Al-Muslim's daily counters reset at UTC midnight (03:00 in Riyadh), and not at all while the screen stays open | `src/components/screens/HisnScreen.tsx:126`–`129`. **Run time** (reviewer): at 01:30 on 18 Nov in Riyadh the key is still `…_2026-11-17` | Same fix as B-02 |
| B-11 | Medium | Importing a v1 backup gives every journal entry today's date, because v1 stored the date as a Hijri display string; v1's analytics consent (`'granted'`) is read by v2 as "no" | `src/lib/store.tsx:642`, `648`; `legacy/src/App.tsx:148`; `legacy/src/services/analytics.ts:40`–`52` (code) | Parse or keep the original date; map the old consent value |
| B-12 | Medium | The category charts over-count: a reflection finished with a note counts once as a completed day and again as a journal entry, and a fresh install already shows the seeded items | `src/components/common/ReflectionCategoryCharts.tsx:129`–`144` (code) | Count each reflection once; see P-01 |
| B-13 | Medium | Adding blessings rewrites the category charts' past. The charts do not store which blessing a completed day had; they recompute it with `blessingForDate` from today's pool, so every batch that grows the pool reassigns the user's past days to other blessings and categories | `src/components/common/ReflectionCategoryCharts.tsx:135`–`140`; `src/lib/dailyLogic.ts:20` (code) | Record the blessing id with each completed reflection (a new stored shape needs a migration and an update to reference/02), or release the remaining batches together so the history is remapped once |

### U. User interface and flows

Found by exercising the production build in a headless browser as well as by reading. The complete lists are in [findings/screens-core.md](findings/screens-core.md), [findings/screens-worship-settings-paywall.md](findings/screens-worship-settings-paywall.md) and [findings/design-system-shared.md](findings/design-system-shared.md).

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| U-01 | High | **Dialogs opened from inside a screen are placed against the screen, not the viewport.** The screen roots carry `animate-fade-in`, which leaves a transform in place; a transformed element becomes the frame for its `position: fixed` children. On long screens the dialog is centred far below what the user sees. Affected: the share card from Home, the compose form in the journal, the reminder-time dialog, About / content review / privacy and the paywall preview opened from Settings, the Hisn index drawer | `src/index.css:261`–`273`. **Run time:** on Settings a fixed child measures 2,351 px tall in an 844 px viewport; reviewers saw the reminder-time dialog and the About dialog open off screen | Drop `forwards` or end the animation at `transform: none`; better, render overlays through a portal on `document.body` |
| U-02 | High | **The paywall cuts off its own buttons on short screens** and cannot scroll | `src/components/screens/PremiumPaywallScreen.tsx:82`, `88`. **Run time** (reviewer) at 360×640 | Let the card scroll |
| U-03 | Medium | The delete button on a journal entry is invisible on touch devices (it only appears on hover), though it still receives taps | `src/components/screens/JournalScreen.tsx:353`. **Run time** (reviewer) | Always show it; confirm before deleting |
| U-04 | Medium | The journal's month navigator changes its label and filters nothing; the hidden search and category filters keep applying to «نِعَمي» and can make it look empty | `src/components/screens/JournalScreen.tsx:49`, `74`–`120`. **Run time** (reviewer) | Filter by month; reset or show the filters on both segments |
| U-05 | Medium | The share button on the verse-of-the-day card shares the day's blessing instead | `src/components/screens/HomeScreen.tsx:113`–`124` (code and run time, reviewer) | Give the share card an inspiration input |
| U-06 | Medium | The font-size number box cannot be typed into: each keystroke is clamped to 12–24, so typing "18" gives 24 | `src/components/screens/SettingsScreen.tsx:460`–`472`. **Run time** (reviewer) | Clamp on blur |
| U-07 | Medium | Backup import replaces all data with no confirmation, shows a success icon even when it fails, and shows the result where the user may not see it; export confirms nothing | `src/components/screens/SettingsScreen.tsx:108`–`140`, `171`–`176`. **Run time** (reviewer) | Confirm with a summary; show errors as errors |
| U-08 | Medium | "Replay the tour" does nothing visible, because the tour only renders on Home | `src/components/screens/SettingsScreen.tsx:619`–`628`; `src/App.tsx:261` | Switch to Home when it is tapped |
| U-09 | Medium | The spotlight tour misplaces itself: the highlight is measured before the smooth scroll finishes, the explanation card covers the button it explains, the highlighted element stays dimmed, and on desktop the fourth step points at a hidden element | `src/components/common/SpotlightTour.tsx:36`, `47`–`51`, `68`–`84`. **Run time** (reviewer) | Re-measure after scroll; position the card away from the target |
| U-10 | Medium | Hisn search does not normalise Arabic: searching «الحمد» finds 1 item, the vocalised form finds 9 | `src/components/screens/HisnScreen.tsx:309`–`316`. **Run time** (reviewer) | Strip diacritics and normalise letter forms on both sides |
| U-11 | Medium | The recitation player's fallbacks misfire: one failure triggers both the stream and the chime-and-speech fallback; pausing does not stop the speech; one reciter's fallback address returns 403 | `src/components/screens/TasbihAudioPlayer.tsx:71`, `249`, `283`–`299`, `448`–`512`. **Run time** (reviewer) | One fallback path guarded by one state; cancel speech on pause and unmount; fix the address |
| U-12 | Low | User-facing text contains developer terms (`isPremium()`, RevenueCat, "developer mode") and bracketed placeholder prices | `src/components/screens/PremiumPaywallScreen.tsx:191`, `226`; `src/components/screens/SettingsScreen.tsx:641`–`690` | Remove before any public launch |
| U-13 | Low | Smaller defects: the desktop nav wraps between 768 and 800 px; `ThreadProgress` draws its origin dot at the wrong end; Hisn's daily total covers only three of six categories; several haptics fire for one tap | [findings/](findings/) | |

### J. My Journey

The complete list for this feature (64 items) is in [findings/journey.md](findings/journey.md). B-03 above also belongs here.

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| J-01 | High | **An end-of-stage review can become unreachable.** After station 7 the pointer moves to the next stage. If the user closes the review unsaved, the path shows the next stage, no stage pills appear, and the review node of the finished stage is never shown again | `src/components/journey/JourneyPathScreen.tsx:275`–`292`, `572`–`574`, `626`–`629` (code) | Keep the displayed stage on the first stage with a pending review, or always list finished stages |
| J-02 | High | **First-time set-up never opens by itself.** A newly unlocked user lands on the default path (themes `din` and `afiyah`, pace 1) and is never asked for themes, pace or reminder unless they find «تخصيص» | `src/components/journey/JourneyPathScreen.tsx:198`, `1386`–`1391`; `src/App.tsx:213` (code) | Open set-up when `hasCompletedJourneyOnboarding()` is false |
| J-03 | Medium | The daily pace is advisory. With the day's quota used, «ابدأ التدبر» still starts the next station; the strict gate, `handleStartStation`, is called by nothing. The set-up copy says stations open day by day | `src/components/journey/JourneyPathScreen.tsx:374`–`420`, `1306`–`1323` (code) | Decide whether pace is a hard or a soft limit, then wire the gate or change the copy |
| J-04 | Medium | «إظهار النص كاملًا» is undone 2.6 seconds later: the pacing interval keeps running and resets the text to an earlier clause | `src/components/journey/JourneyStationFlow.tsx:84`–`92`, `486`–`495` (code) | Clear the interval when skipping |
| J-05 | Medium | Reopening set-up silently switches the reminder back on, and saving then turns app notifications on | `src/components/journey/JourneyPathScreen.tsx:347`–`350`, `602` (code) | Pass the journey's own reminder value and an explicit on/off flag |
| J-06 | Medium | Text typed in a station or in the end-of-stage review is lost without warning when the screen is closed or the previous/next buttons are used | `src/components/journey/JourneyStationFlow.tsx:62`, `321`–`328`; `src/components/journey/JourneyMuhasabaScreen.tsx:61`–`68` (code) | Save a draft, or confirm before discarding |
| J-07 | Medium | The weekly "journey" chart also counts non-journey activity and the seeded sample days, so a user who never opened a station sees three active days | `src/components/journey/JourneyWeeklyProgressChart.tsx:59`–`91` (code) | Chart journey completions only |
| J-08 | Medium | A station's private note is stored twice (journey state and main journal) and the journey copy cannot be cleared or deleted from any screen | `src/components/journey/JourneyPathScreen.tsx:435`–`448`; `src/lib/journeyStore.ts:453`–`459` (code) | One source of truth, with a delete |
| J-09 | Medium | The free-station limit is not applied to the current station's start button. Unreachable today (P-05), but it becomes a paywall bypass the moment free users are let in | `src/components/journey/JourneyPathScreen.tsx:995`–`996`, `1306`–`1323` (code) | Apply the same check as the "upcoming" branch |
| J-10 | Medium | Station preview, station flow and review screens have no focus trap, no Escape handling and no dialog semantics on the full-screen ones; the page behind stays reachable | `src/components/journey/JourneyPathScreen.tsx:1041`–`1052`; `src/components/journey/JourneyStationFlow.tsx:312`–`315` (code) | One shared modal primitive |
| J-11 | Low | Smaller defects: the daily counter is stale after midnight; `journey_onboarded` and `journey_stage_completed` fire on every edit; seven stations per stage is hard-coded; completed counts include stations of deselected themes; two timers are not cleared on unmount; one content key is misspelled (`reviewedDate`, `journey_content.json:655`) | [findings/journey.md](findings/journey.md) | |
| J-12 | Low | Dead code in the path screen: `handleStartStation`, the returning-user banner that is computed and never rendered, `entitlementLoaded`, three unused imports, and five copies of the free-tier rule | `src/components/journey/JourneyPathScreen.tsx:197`, `329`, `374` (code) | Remove or wire up; centralise the rule in `entitlements.ts` |

### P. Product promises

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| P-01 | High | **New users start with someone else's history**: three completed days, two journal entries and one personal blessing they never wrote | `src/lib/store.tsx:71`–`107`, `181`–`190`. **Run time:** present in `localStorage` after the first load of a clean profile | **Branch** `f05f291` empties the defaults and drops seeded items already saved |
| P-02 | High | **The consistency screen counts streaks**: «أيام التدبر المتتالية» with a flame, a seven-day chart and a monthly percentage, while the app promises «بدون ضغط أو سلاسل» | `src/components/screens/ConsistencyScreen.tsx`; `index.html:7`. **Run time:** visible in both themes | **Branch** `e2296c2` removes all four elements |
| P-03 | Medium | Four different durations are stated for the reflection: 80 seconds in the data, two minutes on the landing page, three in the tour text, five in onboarding | `src/data/blessings_ar.json`; `src/landing/LandingPage.tsx`; `src/constants/strings.ts:68`; `src/components/screens/OnboardingScreen.tsx` (code) | **Branch** `4209f2c` states 80 seconds everywhere |
| P-04 | Medium | **Reminders do not exist.** Onboarding, the consistency screen, Settings and the journey all let the user set a daily reminder; nothing schedules or sends one | No use of the Notification API or a service worker anywhere in `src/` (code) | Either build it (web push or native) or say plainly that it is not available yet |
| P-05 | Medium | The journey's free tier cannot be reached: the tab opens the paywall for anyone without the premium flag, and first-time set-up is never opened automatically | `src/App.tsx:67`; [reference/09](reference/09-journey.md), sections 1 and 2 (code) | Let non-premium users into the path screen, which already implements the two-station taste |
| P-06 | Low | The README lists an automatic theme and reduced-motion support; the app has neither | `README.md`; `src/lib/store.tsx:133`; no `prefers-reduced-motion` outside `src/landing/landing.css` (code) | Correct the README or implement both |

### C. Content

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| C-01 | High | **No sacred text has been reviewed, and the app says otherwise.** All 40 blessings (100 since `9f6b4a0`) are `pending_review` with unverified verse, hadith grade and quote; the content sheet reports 40 approved; unreviewed text is shown with no marker | `src/data/blessings_ar.json`; `src/components/screens/ContentReviewModal.tsx` (code) | **Branch** `5c1347d` reports the real count and marks unreviewed verses. The review itself is the real fix |
| C-02 | Medium | Journey content is entirely `pending_review`; 28 sacred or dhikr slots hold placeholder tokens instead of text | `src/data/journey_content.json` (code) | Same review; decide what the UI shows for a placeholder |
| C-03 | Medium | Hisn Al-Muslim adhkar, the daily tips, the verse-of-the-day list and the tasbih dhikr have no review fields at all | `src/data/hisnAlMuslim.ts`, `inspirations.ts`, `dhikr.ts` (code) | Bring them under the same review schema |
| C-04 | Low | The tasbih "dhikr of the day" is always the first item; the function that rotates it is unused | `src/components/screens/TasbihModal.tsx:53`; `src/lib/dailyLogic.ts:62` (code) | Use `getTodayDhikr` |
| C-05 | Low | 17 blessings name a podcast episode that nothing displays; the journey file's note still describes two stages | `relatedPodcastEpisode` in `blessings_ar.json`; `contentNote` in `journey_content.json` (code) | Remove or use; update the note |
| C-06 | Medium | The share image limits a verse to four lines and cuts the rest with "...", dropping the closing ﴾; the design sheet says sacred text is shown without truncation. It is also drawn without waiting for fonts to load | `src/components/common/ShareCardModal.tsx:113`–`126`, `137`–`311` (code) | Shrink the type or grow the card instead of cutting; wait for `document.fonts` |
| C-07 | Medium | Paraphrases are displayed as quotations, 19 of 40 with no name (75 of 100 since the import); the hadith grade is printed as fact although no grade is verified | `src/components/screens/HomeScreen.tsx:263`–`289` (code) | Present paraphrases as paraphrases; hide or mark unverified grades |
| C-08 | Medium | The landing page and the content sheet make claims the data does not support: every text reviewed by scholars, verses in the Uthmani script of the King Fahd Complex, only sound hadith, a free app | `src/landing/LandingPage.tsx:27`–`40`, `338`; `src/components/screens/ContentReviewModal.tsx:41`–`62` (code) | **Branch** `4209f2c` rewrites the review claim; the rest needs the same treatment |
| C-09 | Medium | Blessings 41–100 had no hadith, and five of their texts lean on one without a source: the scholar quote of blessing 51 is close to the wording of two hadith but is labelled as scholars' words; the quote of 54 and the reflections of 79, 83 and 91 report a hadith by meaning. **Since 23 November** 54, 79, 83 and 91 carry the sahih hadith their texts refer to, and 51 a hadith on Friday, all copied from Bukhari or Muslim ([reference/04](reference/04-content-and-data.md), section 1.8) | `src/data/blessings_ar.json` (code) | The reviewer checks each hadith and its number, and still decides whether 51's quote should stay labelled as scholars' words |
| C-10 | Low | The 60 new verses are whole ayahs; 24 are longer than any verse before the import and ten are longer than 25 words (the longest, Al-Ma'idah 2, is 53), and in several the part that speaks to the blessing is one clause of a long ayah | [reference/04](reference/04-content-and-data.md), section 1.7, with the fragment each reflection quotes (code, run time) | Owner's decision: keep whole ayahs, or approve an excerpt for each long one. Cutting a verse is not a developer's call |
| C-11 | Medium | Blessings 101–400: the opening lines, reflection steps, `tadabbur`, short `duaa` and journal prompts are drafts written in development. Two `tadabbur` drafts state an exegetical view (113, 122) and blessing 102 links Fussilat 41:33 to the call to prayer. Their hadith, scholar quotes and sourced supplications are copied from published sources, not written | `src/data/blessings_ar.json`; [reference/04](reference/04-content-and-data.md), sections 1.7 and 1.8 (code) | The owner reads the drafts; the reviewer confirms or removes the three exegetical claims and checks every hadith, quote and number |
| C-12 | Medium | The hadith numbers for Sahih Muslim come from one digital edition: two were inferred from neighbouring numbers (blessings 84 and 93) and one (83, given as 2732) may be 2733. One Bukhari copy in that edition had corrupted characters and was replaced by another narration | [reference/04](reference/04-content-and-data.md), section 1.8 (code) | Check every number against a printed edition before `gradeVerified` is set |

### S. Security and privacy

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| S-01 | High (revenue) | **Anyone can unlock premium for free.** The paywall's purchase button shows a notice that payments are not connected and offers a developer unlock; Settings has a "developer mode" switch; both are in production. The entitlement is one `localStorage` value | `src/components/screens/PremiumPaywallScreen.tsx:38`–`57`; `src/components/screens/SettingsScreen.tsx:641`–`730`; `src/lib/entitlements.ts:46` (code) | Remove developer controls from production builds (build flag). With no server, a client flag can always be edited; real enforcement needs receipts validated by the store or RevenueCat |
| S-02 | Medium | No security headers are sent: no Content-Security-Policy, no clickjacking protection, no `nosniff`, no referrer policy | **Run time:** response headers of `app.alhamd.app` and `alhamd.app` on 17 Nov; `vercel.json` has no `headers` | Add a `headers` block: CSP allowing self, Google Fonts and the two audio hosts; `frame-ancestors 'none'`; `X-Content-Type-Options`; `Referrer-Policy` |
| S-03 | Medium | An imported backup is not validated. Any array becomes the journal; any value becomes the theme or font. A malformed or crafted file can leave the app unable to render until storage is cleared | `src/lib/store.tsx:607`–`680` (code) | Validate each record against a schema, cap sizes, reject unknown values; confirm before replacing data |
| S-04 | Medium | Settings exposes "reset the whole journey" as a developer tool with no confirmation; it deletes the user's private journey notes | `src/components/screens/SettingsScreen.tsx:712`–`724`; `src/lib/journeyStore.ts:567` (code) | Remove from production or add a confirmation |
| S-05 | Low | Internal design material is deployed publicly: design sheets and working screenshots under `/assets/aistudio/` | **Run time:** `https://app.alhamd.app/assets/aistudio/design-sheet-layl-dark_f2b4cff4.html` returns 200 | Move out of `public/` |
| S-06 | Low | The app tells users nothing leaves the device. User text does not, but every visit contacts Google Fonts, and playing a recitation contacts `everyayah.com` or `cdn.islamic.network`, each of which sees the user's IP address | `index.html:12`–`14`; `src/components/screens/TasbihAudioPlayer.tsx` (code) | Self-host the fonts; name the audio hosts in the privacy policy |
| S-07 | Low | Two known advisories in the dependency tree: `body-parser` (high), pulled in by the unused `express`; Vite 6.4.4 dev server (moderate) | `bun audit` on 17 Nov | Remove `express`; update Vite. Neither affects the deployed static site |
| S-08 | Low | Journal text is stored unencrypted in `localStorage`, readable by anyone with the device or by any script that runs on the origin | By design (code) | State it in the privacy policy; a CSP (S-02) is the main protection |
| S-09 | Low | The app also answers at `https://alhamd.app/app.html`, a different origin with separate storage | **Run time** | Redirect that path to `app.alhamd.app` |
| S-10 | Medium | The privacy policy says the backup file is encrypted. It is plain JSON containing the whole journal | `src/components/screens/PrivacyPolicyModal.tsx:45`; `src/lib/store.tsx:604` (code) | Correct the text, or encrypt the file with a passphrase |
| S-11 | Medium | Analytics consent can only be given during onboarding; there is no control to change or withdraw it later | `src/App.tsx:86`; no control in `SettingsScreen.tsx` (code) | Add a switch in Settings |
| S-12 | Low | There is no "erase all my data" control, and the privacy policy exists only inside a dialog with no address, date or contact | `src/components/screens/SettingsScreen.tsx`; `src/landing/LandingPage.tsx:83`–`135` (code) | Add both |

### PF. Performance

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| PF-01 | Medium | The whole app is one 1,031 kB chunk (280 kB gzipped): every screen, recharts, motion and all JSON content load before first paint | Build output, [reference/11](reference/11-build-and-deployment.md) section 3 | `React.lazy` per tab; load recharts and the journey on demand |
| PF-02 | Medium | The store's context value is a new object on every render, so every `useStore()` consumer re-renders on every change, including each tasbih tap | `src/lib/store.tsx:683` (code) | Memoise the value, or split state and actions into separate contexts |
| PF-03 | Low | Each journey save serialises the state several times and reloads it from storage through a window event | `src/lib/store.tsx:220`–`241`; `src/lib/journeyStore.ts:388` (code) | One writer |
| PF-04 | Low | The Hijri calendar constructs about 60 `Intl.DateTimeFormat` objects per month render | `src/lib/hijri.ts:96`, `122` (code) | Create the formatters once |
| PF-05 | Low | Five font families are requested from Google in a render-blocking stylesheet, whichever font the user chose | `index.html:14` (code) | Self-host, subset, and load the optional families on demand |
| PF-06 | Low | One `alhamd_hisn_counts_<date>` key is created per day of use and never removed | `src/components/screens/HisnScreen.tsx:126`–`156` (code) | Prune old days on start |

### A. Accessibility

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| A-01 | Medium | Pinch zoom is disabled for the whole app | `index.html:5` (`maximum-scale=1.0, user-scalable=no`) | Remove both |
| A-02 | Medium | The app has no reduced-motion handling: particles, breathing halos and transitions always run | No `prefers-reduced-motion` or `useReducedMotion` in the app (code) | Honour the media query in CSS and in `motion` |
| A-03 | Medium | No overlay in the app manages focus: no focus trap, no Escape key, no return of focus, and the page behind stays reachable. The full-screen flows are not exposed as dialogs at all | J-10; [findings/screens-core.md](findings/screens-core.md) (code) | One modal primitive used everywhere |
| A-04 | Low | Many controls are 24–36 px, toggles lack state attributes, charts have no text alternative, and some small text falls just under 4.5:1 | [findings/](findings/) (code) | Fix alongside the component split |

### D. Design system

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| D-01 | Medium | The light theme is produced by overriding specific hex-colour utility classes with `!important`. A colour that is not in the override list stays dark in light mode | `src/index.css:79`–`226` (code). **Run time:** the journey's muhasaba node and path connectors stay dark on the cream background | Components should read CSS variables; then delete the override block |
| D-02 | Low | `src/constants/tokens.ts` is imported by nothing and its light palette is the pre-October blue-grey one | Repository search (code) | Delete it or make it the single source |
| D-03 | High | **Light theme with high contrast does not work.** The app's root element also carries `theme-light`, which re-declares the ordinary light variables and hides the high-contrast ones set on `<html>` | `src/App.tsx:112`; `src/index.css:31`, `324`. **Run time** (reviewer): `--text-primary` is `#0d0805` on `<html>` and `#2a1f19` inside the app | Set theme classes in one place only |
| D-04 | Medium | 79 of the 132 hex colour classes used in components (157 uses) have no light-theme rule. Visible results: the selected calendar day is dark on dark, the paywall cards are unreadable, completed journey stations are dark text on a dark fill | `src/components/screens/ConsistencyScreen.tsx:370`; `src/components/screens/PremiumPaywallScreen.tsx:143`; [reference/05](reference/05-design-system.md) section 16. **Run time** (reviewer) | Same as D-01; until then, a check that fails on an unmapped class |
| D-05 | Low | Classes and variables that nothing reads: `text-size-*`, `text-scale-*` (three names for the same rule), `dark`, `light`, `theme-dark`, `--bg-deep`, `--cta-pressed`, `--danger` | [reference/05](reference/05-design-system.md) (code) | Remove |
| D-06 | Low | Tailwind scans the whole repository, so the app's stylesheet contains utilities used only in `legacy/` and grows when documentation mentions class names | `src/index.css:1` has no `source()` restriction (code and build) | Restrict the source to `src/` |

### M. Maintainability and engineering

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| M-01 | High | No tests, no test runner, no CI. The only automated check is `tsc --noEmit`, with `strict` off, and it does not cover React code (M-10) | `package.json`; `tsconfig.json` | See T-01 onward; add a CI workflow that runs type check, tests and build |
| M-02 | Medium | Six fixes for live problems sit on a branch with no pull request | [HISTORY.md](HISTORY.md), section 9 | Review and merge, or re-apply |
| M-03 | Medium | No error boundary: a render error leaves a blank page with nothing reported | Repository search (code) | Add one at the root with a recovery screen |
| M-04 | Low | Seven declared dependencies are unused: `@google/genai`, `express`, `dotenv`, `@types/express`, `autoprefixer`, `esbuild`, `tsx` | Import search (code) | Remove |
| M-05 | Low | Dead code: `isTasbihOpen` overlay in `App.tsx`; `updateUserBlessing`; `getTodayDhikr`; `getFormattedHijriDayHeader`; `getStageStations`; `getEntitlementStatus`; `toggleDeveloperPremium`; `STORAGE_KEYS.STATE`; `firstLaunchDate`; three props on `HomeScreen`; most of `APP_STRINGS`; three re-export shims | [reference/01](reference/01-overview-and-architecture.md), [02](reference/02-state-and-persistence.md), [04](reference/04-content-and-data.md) (code) | Remove, or wire up where the feature is wanted |
| M-06 | Low | Journey types are declared twice, in `src/types.ts` and again in `src/lib/store.tsx:27`–`60` | (code) | Keep one |
| M-07 | Low | The repository carries the whole v1 app (`legacy/`, 42 files), AI Studio working files (`.aistudio/`) and template leftovers (`metadata.json`, `.env.example`, `clean` script) | Repository listing | Archive `legacy/` on a tag or branch; delete the rest |
| M-08 | Low | `package.json` is still named `react-example` at version `0.0.0`; there are no release tags | `package.json:2`–`4` | Name it, version it, tag releases |
| M-09 | Low | Comments and behaviour disagree: `getDayNumber` says UTC-synchronised but uses local dates; `App.tsx` says ≥900 px but switches at 768 px; `AppState.fontSize` says default 15 but it is 16 | `src/lib/dailyLogic.ts:8`; `src/App.tsx:119`; `src/types.ts:161` (code) | Fix the comments |
| M-10 | High | **The type check does not check React code.** `@types/react` and `@types/react-dom` are not installed, so `react` is typed `any` and no component's props or JSX are checked. With `--strict` the project reports 3,119 errors, 2,808 of them for untyped JSX. B-04 is a mistake the compiler would otherwise have caught | `package.json`; `node_modules/@types` (verified by running `tsc --strict`) | Install both packages, then turn on `strict` in steps |
| M-11 | Low | The only test file in the repository (`legacy/src/lib/dailyLogic.test.ts`) cannot run: Vitest is in neither lockfile, there is no test script, and three of its cases fail in time zones behind UTC | (code; run by a reviewer) | Port to v2 with a fake clock (T-01) |
| M-12 | Low | Screens are very large single components: `JourneyPathScreen` 1,398 lines, `HisnScreen` 1,021, `SettingsScreen` 790, `TasbihAudioPlayer` 770, `ShareCardModal` 761, with logic inside render functions | Line counts | Extract pure functions and hooks first (they are also the test targets), then split the views |

### L. Landing page

The complete list is in [findings/landing-legacy.md](findings/landing-legacy.md).

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| L-01 | Medium | No share image, canonical link or `og:url`, although `twitter:card` asks for a large image | `landing/index.html:9`–`12` (code) | Add a 1200×630 image and the missing tags |
| L-02 | Medium | All content is rendered in the browser: the HTML body is an empty `#root`, so crawlers and link previews that do not run JavaScript see nothing | `landing/index.html:20` (code) | Prerender to static HTML at build time |
| L-03 | Medium | The page ships React (70 kB gzipped) to render static markup with one dialog | Build output | Same fix as L-02 |
| L-04 | Medium | The phone mockups are hand-built copies of two app screens with frozen text, including a literal date | `src/landing/PhoneMockups.tsx:64`–`144` (code) | Generate from real screenshots, or accept and document |
| L-05 | Medium | Copy that contradicts the app; see C-08, P-02, P-03 | | |

### T. Test targets

Nothing is tested today. These are the places where tests would pay for themselves first.

| Id | What to test | Kind | Why here first |
|---|---|---|---|
| T-01 | `dailyLogic.ts`: rotation, the welcome gate, wrap-around, time zones | Unit | Would have caught B-01 and B-07; v1 already has cases to port |
| T-02 | Day keys across the store: completion, journal dates, calendar marker, in UTC−, UTC and UTC+ | Unit with a fake clock | B-02, B-06 |
| T-03 | `journeyStore.ts`: `sanitizeJourneyState` on malformed input, onboarding that preserves progress, completion idempotence, the unlock window | Unit | 575 lines of state logic guarding private user text |
| T-04 | Backup: export then import returns the same state; v1 files migrate; malformed files are rejected | Unit | S-03, B-08; this is the user's only way to move data |
| T-05 | `hijri.ts`: month lengths, navigation in both directions, one "today" | Unit | Depends on browser ICU data |
| T-06 | `arabic.ts` formatting | Unit | Trivial and stable |
| T-07 | First run: clean storage, onboarding, tour, Home | End to end | P-01 |
| T-08 | Daily loop: reflection, journal entry, "done today", next day shows a new blessing | End to end with a controlled clock | B-01, B-02, B-05 |
| T-09 | Journey: unlock, set-up, complete a station with text, one journal entry, pace limit | End to end | B-03, P-05 |
| T-10 | Themes: every screen in dark, light, high contrast and night reading | Screenshot comparison | D-01 |
| T-11 | Product promises as assertions | Build-time script | **Branch** `2ba90c4` has `scripts/check-promises.mjs` |

---

## Detailed lists

Part B holds the findings that matter most. The line-by-line reviews produced 353 items in all; the complete lists are kept here so nothing is lost.

| File | Area | Items |
|---|---|---:|
| [findings/screens-core.md](findings/screens-core.md) | Home, reflection, onboarding, journal, compose, consistency, info modals | 72 |
| [findings/screens-worship-settings-paywall.md](findings/screens-worship-settings-paywall.md) | Tasbih, recitation player, Hisn Al-Muslim, Settings, paywall | 92 |
| [findings/journey.md](findings/journey.md) | My Journey | 64 |
| [findings/design-system-shared.md](findings/design-system-shared.md) | Design system, layout, shared components | 79 |
| [findings/landing-legacy.md](findings/landing-legacy.md) | Landing page, legacy v1 | 46 |

Items in those lists were established by reading the code unless the item says it was checked at run time. Every High item in Part B was checked a second time, against the source or in the browser, before being listed. Medium and Low items rest on one reviewer's read unless their row says run time.
