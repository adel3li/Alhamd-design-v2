# Findings and next steps

Written on 2026-11-17 against commit `68e723a`. This file has two parts:

- **Part A** lists the areas where the knowledge in this documentation can be put to work, with a suggested starting point for each.
- **Part B** is the register of concrete findings from the read-through, each with an id, a severity, the evidence and a direction.

Nothing here has been fixed. This file records what was found; fixing is separate work.

How each finding was established is stated in its row: **run time** means the behaviour was observed in a headless browser against the production build; **code** means it was read in the source and, for "nothing calls X" claims, confirmed with a repository-wide search; **branch** means a fix already exists on the unmerged branch `claude/trusting-rubin-9ue5hh` (see [HISTORY.md](HISTORY.md), section 9).

Severity: **High** breaks a core promise or a core flow for every user; **Medium** is wrong or risky in a common situation; **Low** is a defect with limited reach, or cleanup.

---

## Part A — Where this knowledge can be used

The first three are the ones already planned. The rest are suggestions, ordered roughly by how much the current code would gain.

| # | Area | Why it is worth doing here | Where to start |
|---:|---|---|---|
| 1 | **Frontend quality** | The UI works, but it is built from very large components (one file is 1,398 lines), hard-coded colours, a light theme implemented by CSS overrides, inline copy, and dead UI paths | Fix the High bugs in Part B first; then split the largest screens, move colours to variables, and add screenshot comparisons so refactors are safe |
| 2 | **Testing** | There are no tests, no test runner and no CI. Several High bugs (B-01, B-02) would have been caught by ten lines of unit tests | Vitest for the pure modules listed in [reference/03](reference/03-domain-logic.md) section 6 and in T-01 to T-06; Playwright for the five core flows; a timezone matrix |
| 3 | **Security and privacy** | No backend limits the attack surface, but premium is a client flag anyone can set, imported backups are not validated, no security headers are sent, and the privacy promise is broader than what the app does | S-01 to S-10; then a privacy-policy review against [reference/11](reference/11-build-and-deployment.md) section 5 |
| 4 | **Product-promise integrity** | The app promises no streaks, an honest duration, an empty private journal and reviewed text; the code breaks each of these today | P-01 to P-06. Six fixes and a build-time guard already exist on an unmerged branch |
| 5 | **Content and scholarly review** | 0 of 40 blessings and 0 journey texts are approved; adhkar have no review fields; the UI does not distinguish reviewed from unreviewed sacred text | C-01 to C-06; a reviewer worksheet generated from the JSON; a verse check against a trusted Qur'an source |
| 6 | **Performance** | One 1 MB JavaScript chunk (280 kB gzipped) loads before first paint; every store change re-renders every consumer; five font families block rendering | PF-01 to PF-07; lazy-load each tab and recharts first |
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
| C-01 | High | **No sacred text has been reviewed, and the app says otherwise.** All 40 blessings are `pending_review` with unverified verse, hadith grade and quote; the content sheet reports 40 approved; unreviewed text is shown with no marker | `src/data/blessings_ar.json`; `src/components/screens/ContentReviewModal.tsx` (code) | **Branch** `5c1347d` reports the real count and marks unreviewed verses. The review itself is the real fix |
| C-02 | Medium | Journey content is entirely `pending_review`; 28 sacred or dhikr slots hold placeholder tokens instead of text | `src/data/journey_content.json` (code) | Same review; decide what the UI shows for a placeholder |
| C-03 | Medium | Hisn Al-Muslim adhkar, the daily tips, the verse-of-the-day list and the tasbih dhikr have no review fields at all | `src/data/hisnAlMuslim.ts`, `inspirations.ts`, `dhikr.ts` (code) | Bring them under the same review schema |
| C-04 | Low | The tasbih "dhikr of the day" is always the first item; the function that rotates it is unused | `src/components/screens/TasbihModal.tsx:53`; `src/lib/dailyLogic.ts:62` (code) | Use `getTodayDhikr` |
| C-05 | Low | 17 blessings name a podcast episode that nothing displays; the journey file's note still describes two stages | `relatedPodcastEpisode` in `blessings_ar.json`; `contentNote` in `journey_content.json` (code) | Remove or use; update the note |

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

### D. Design system

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| D-01 | Medium | The light theme is produced by overriding specific hex-colour utility classes with `!important`. A colour that is not in the override list stays dark in light mode | `src/index.css:79`–`226` (code). **Run time:** the journey's muhasaba node and path connectors stay dark on the cream background | Components should read CSS variables; then delete the override block |
| D-02 | Low | `src/constants/tokens.ts` is imported by nothing and its light palette is the pre-October blue-grey one | Repository search (code) | Delete it or make it the single source |

### M. Maintainability and engineering

| Id | Sev | Finding | Evidence | Direction |
|---|---|---|---|---|
| M-01 | High | No tests, no test runner, no CI. The only automated check is `tsc --noEmit`, with `strict` off | `package.json`; `tsconfig.json` | See T-01 onward; add a CI workflow that runs type check, tests and build |
| M-02 | Medium | Six fixes for live problems sit on a branch with no pull request | [HISTORY.md](HISTORY.md), section 9 | Review and merge, or re-apply |
| M-03 | Medium | No error boundary: a render error leaves a blank page with nothing reported | Repository search (code) | Add one at the root with a recovery screen |
| M-04 | Low | Seven declared dependencies are unused: `@google/genai`, `express`, `dotenv`, `@types/express`, `autoprefixer`, `esbuild`, `tsx` | Import search (code) | Remove |
| M-05 | Low | Dead code: `isTasbihOpen` overlay in `App.tsx`; `updateUserBlessing`; `getTodayDhikr`; `getFormattedHijriDayHeader`; `getStageStations`; `getEntitlementStatus`; `toggleDeveloperPremium`; `STORAGE_KEYS.STATE`; `firstLaunchDate`; three props on `HomeScreen`; most of `APP_STRINGS`; three re-export shims | [reference/01](reference/01-overview-and-architecture.md), [02](reference/02-state-and-persistence.md), [04](reference/04-content-and-data.md) (code) | Remove, or wire up where the feature is wanted |
| M-06 | Low | Journey types are declared twice, in `src/types.ts` and again in `src/lib/store.tsx:27`–`60` | (code) | Keep one |
| M-07 | Low | The repository carries the whole v1 app (`legacy/`, 42 files), AI Studio working files (`.aistudio/`) and template leftovers (`metadata.json`, `.env.example`, `clean` script) | Repository listing | Archive `legacy/` on a tag or branch; delete the rest |
| M-08 | Low | `package.json` is still named `react-example` at version `0.0.0`; there are no release tags | `package.json:2`–`4` | Name it, version it, tag releases |
| M-09 | Low | Comments and behaviour disagree: `getDayNumber` says UTC-synchronised but uses local dates; `App.tsx` says ≥900 px but switches at 768 px; `AppState.fontSize` says default 15 but it is 16 | `src/lib/dailyLogic.ts:8`; `src/App.tsx:119`; `src/types.ts:161` (code) | Fix the comments |

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
