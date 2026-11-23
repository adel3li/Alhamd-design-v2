# Project history

Period covered: 10 September 2026 (first commit) to 17 November 2026 (the day this report was written).

Sources: the full Git history of `adel3li/Alhamd-design-v2` including branches that are not merged, the four pull requests on GitHub, and the Vercel projects and deployment records. The file-by-file detail of every commit is in the appendix, [history/commit-by-commit.md](history/commit-by-commit.md); this report tells the story and draws the lines between events.

## 1. Summary

In ten weeks the repository went from an empty Google AI Studio template to a deployed product with its own domain:

- **`main` holds 16 commits**: 13 ordinary commits and 3 merges. The owner (`adel3li`) wrote the first seven, which contain the whole application. Six later commits were written by Claude Code sessions and merged by the owner through three pull requests; they add the README, the landing page and the Vercel routing.
- **The app's code grew from 4,542 to 14,249 lines** of TypeScript and CSS between 10 September and 7 November, then stopped changing. Everything added to `src/` since 7 November is the landing page (836 lines).
- **Most of the product was built in two bursts**: three commits on 20 October (themes, fonts, particles, Hisn Al-Muslim, the Hijri calendar) and one on 28 October (the premium journey, the audio player, charts, accessibility modes). Together they tripled the code.
- **The design changed once, decisively**: on 20 October the single dark look became a two-theme system, "Layl" (ليل, night) and "Nahar" (نهار, day), with a new warm light palette taken from the app-icon specification.
- **Two bodies of work are not in `main`**: a branch with a product audit, six fixes and a case-study site (15 November), and a branch with a marketing kit that is open as draft pull request #4 (17 November).

## 2. Timeline

Times are as recorded in Git (the owner's commits carry a local offset; Claude Code commits are UTC).

| Date | Event |
|---|---|
| 1 Sep 2026 | A Vercel project named `alhmd-bilingual-landing-page-…` is created. It is not connected to this repository and was not inspected |
| 10 Sep, 19:44 UTC | A Vercel project `alhamd-app` is created with one production deployment that carries no Git metadata |
| 10 Sep, 22:59 +0300 | `3aaa222` Initial commit: the AI Studio template README |
| 10 Sep, 23:21 +0300 | `a47edd1` The v2 app (`src/`) and the complete v1 app (`legacy/`) arrive in one commit |
| 20 Oct, 17:31 +0300 | `5ebc2dc` Theme system, numeric font size, tasbih becomes a tab, design sheets added |
| 20 Oct, 17:36 +0300 | `3a7e4e4` Completion particles; theme storage key moves to `alhamd_theme_v2` |
| 20 Oct, 21:05 +0300 | `4b31e3b` Hisn Al-Muslim; real Hijri month calendar |
| 28 Oct, 04:48 +0300 | `e341c65` My Journey, paywall, audio player, category charts, font choice, high-contrast and night-reading modes |
| 7 Nov, 18:14 +0200 | `28d36cb` More haptics; quick journal composer; compact paywall |
| 8 Nov, 18:59 UTC | Vercel project `alhamd` is created, connected to this repository; first production deployment of `28d36cb` at `alhamd-wheat.vercel.app` |
| 8 Nov, 19:00 UTC | `1340209` README with screenshots (branch `claude/project-resume-presentation-kg85tf`) |
| 10 Nov, 23:33 UTC | `55ccf2e` Landing page (branch `claude/brave-archimedes-mmnpem`) |
| 11 Nov, 14:31 UTC | `70602c1` Host-based routing in `vercel.json` |
| 11 Nov, 14:36 UTC | Domains `alhamd.app`, `app.alhamd.app`, `www.alhamd.app` attached to the Vercel project |
| 11 Nov, 14:48 UTC | `e7dfbbe` Fix: ship the app as `app.html` so the apex domain can show the landing page. Deployed to production from the branch |
| 15 Nov, 16:49 UTC | PR #1 merged (`1d7eb66`): landing page and routing are in `main` |
| 15 Nov, 18:25–21:37 UTC | Branch `claude/trusting-rubin-9ue5hh`: case-study drafts, a product audit and six fixes. Not merged |
| 16 Nov, 20:13 UTC | PR #2 merged (`bca55ba`): README |
| 16 Nov, 20:16 UTC | PR #3 merged (`68e723a`): README link points to `app.alhamd.app`. Current tip of `main` |
| 17 Nov, 01:16–06:12 UTC | Branch `claude/magical-volta-9uw2sx`: promo-video storyboard, script, animation, sound, social formats. Open as draft PR #4 |

## 3. Before this repository

Three things show that the project is older than its first commit.

**It was built in Google AI Studio.** The first commit is the stock AI Studio README ("Built with AI Studio"). `metadata.json`, `.env.example` (a Gemini API key placeholder), the `DISABLE_HMR` switch in `vite.config.ts`, the `.aistudio/` folder and the unused `@google/genai`, `express` and `dotenv` dependencies all come from that template. The landing page's first app link was `https://alhamd.ai.studio` (`55ccf2e`), which means the app was first hosted by AI Studio.

**There was a complete earlier app.** `legacy/` holds version 1: six tabs (home, tasbih, my blessings, journal, consistency, settings), a slate-and-indigo palette, Capacitor plugins for native haptics, local notifications and preferences, PostHog analytics, `html-to-image` for share cards, and one unit-test file. It is documented in [reference/12-legacy-v1.md](reference/12-legacy-v1.md). The repository's name, `Alhamd-design-v2`, and its description on GitHub ("the alhamd app with the new design") refer to the redesign of that app.

**The content already existed.** `blessings_ar.json`, with its 40 blessings, was byte-identical in `legacy/` and `src/` (until the v2 file grew to 100 in November 2026). Four storage keys are shared between v1 and v2, and the v2 backup importer accepts v1 files.

## 4. Phases

### Phase 1 — Baseline (10 September)

`a47edd1` is described in its message as project set-up, but it is a working application: onboarding, a home screen with the blessing of the day, the five-step reflection, a journal with personal blessings, a consistency calendar, settings with backup and restore, a tasbih modal, share-card images, a spotlight tour and the about, content-review and privacy modals.

Compared with v1, the redesign already shows:

- The navy, gold and violet palette (`#15152A`, `#E4C368` / `#C8A951`, `#6C63FF`), written as literal hex values in Tailwind classes.
- Four tabs instead of six: home, journal, consistency, settings. Tasbih is a modal opened from a card on Home; "my blessings" becomes a segment inside the journal.
- No native layer: Capacitor, PostHog and `html-to-image` are gone. Haptics use `navigator.vibrate`; share cards are drawn on a `<canvas>`; reminders are a stored setting with nothing that fires them.
- The light theme is a stub that only recolours the page wrapper.

Things set here that have never changed since: the seeded sample data for new users, the `triggerHaptic` patterns, the v2 backup format, and the four files `OnboardingScreen`, `AboutModal`, `ContentReviewModal`, `PrivacyPolicyModal`.

Then nothing is committed for forty days.

### Phase 2 — The design system (20 October, three commits in four hours)

**`5ebc2dc`** is the design turning point.

- CSS custom properties are introduced for both themes. The dark values are the baseline's, now named. The light theme is replaced outright by cream `#F4EDE3`, ink `#2A1F19` and terracotta `#B9573B`, the colours of `app-icon-palette_a8ddd79f.png`, which is added in the same commit.
- Light mode is implemented mainly by about 170 lines of CSS that override the hard-coded dark classes (`.theme-light .bg-\[\#15152A\] { … !important }`), not by changing the components.
- Text size becomes a number (12–24 px) set on the root element.
- Navigation changes: tasbih replaces settings in the tab bar and becomes a full tab; settings moves to a gear in the top bar; the tasbih card on Home is removed.
- The reflection gains an optional timer and a 100-count progress ring; the consistency screen gains a statistics card with a streak figure and a seven-day chart; the share card is rewritten with its own theme switch and native sharing.
- `recharts` and `bun.lock` appear. The two design sheets and seven reference images are added under `public/assets/aistudio/`.

**`3a7e4e4`**, five minutes later, adds the completion particles and renames the theme key to `alhamd_theme_v2`. The old key is deleted without carrying its value over. The particles are imported into `App.tsx` but not rendered; the missing line arrives in the next commit.

**`4b31e3b`**, that evening, adds Hisn Al-Muslim (23 adhkar in six categories, with daily counters, favourites and tips) as the second half of the tasbih tab, and rewrites the calendar to follow real Hijri months. The home inspiration card becomes collapsible.

### Phase 3 — The premium journey (28 October)

**`e341c65`** is the largest commit after the baseline: 31 files, +7,606 lines.

- **My Journey («رحلتي»)**: four themed stages of seven stations, an onboarding that picks themes, pace and a reminder time, a winding path screen, a four-phase station flow, an end-of-stage self-review, a weekly chart, and its own state module with sanitising and schema versioning.
- **Paywall and entitlements**: annual and lifetime plans with placeholder prices, and an entitlement service whose only source of truth is a `localStorage` developer flag. Comments mark where RevenueCat would go.
- **Consent-gated analytics**: five journey events, stored locally, never sent.
- **Not in the commit message**: a 770-line recitation player with five reciters streaming from `everyayah.com`; the reflection category charts; a second rewrite of the share card (image and text tabs, a third "royal" theme); a night-reading mode.
- **Accessibility and personalisation**: a choice of four Arabic typefaces, high-contrast variants of both themes, and night reading.
- A fifth tab, رحلتي, is added in second position.

### Phase 4 — Polish (7 November)

**`28d36cb`** is the owner's last commit to date. Its message announces a centralised haptic system; the diff moves the existing `triggerHaptic` and calls it in more places. It also adds a quick journal composer, so an entry can be written without doing a reflection, and compacts the paywall to fit one screen.

The application code has not changed on `main` since this commit.

### Phase 5 — Going public (8–16 November)

All of this phase was done in Claude Code sessions on branches and merged by the owner.

- **8 November.** A Vercel project connected to the repository is created and `28d36cb` is deployed at `alhamd-wheat.vercel.app`. A README is written with six screenshots of the running app.
- **10 November.** A landing page is built as a second Vite entry: hero, story, the five-step method, features, the privacy promise. It shares colours and fonts with the app but no code, and follows the system colour scheme.
- **11 November.** The domains are attached and `vercel.json` routes by host: `alhamd.app` shows the landing page, `app.alhamd.app` shows the app. The first attempt failed because Vercel serves an existing `index.html` before applying rewrites; seventeen minutes later the build was changed to ship the app as `app.html`. Production was deployed from the branch that day, four days before the pull request was merged.
- **15–16 November.** PR #1 (landing and routing), PR #2 (README) and PR #3 (README link) are merged.

### Phase 6 — Work that is not merged (15–17 November)

See section 9 for the contents of the two branches.

### Phase 7 — First fixes after the read-through (17 November)

The documentation in this folder was written on 17 November. The same day, on the same branch, the owner chose a first set of findings to act on, and commit `d3dfd92` made the first changes to application code since 7 November:

- The blessing of the day works as intended: «نعمة الإسلام» until its reflection is finished, then the daily rotation from the next day.
- Every day key follows the user's local day, and daily content rolls over at midnight while the app is open.
- New users start with empty history; the samples older builds saved are cleaned up.
- Dialogs opened from inside a screen are positioned against the viewport.
- The React type packages are installed and strict type checking is on.
- By the owner's decision, the "under review" badges are no longer shown to users.
- «رحلتي» was first hidden behind a switch. Later the same day the owner decided it should be free like the rest of the app (`b8db9cc`): the tab opens the journey for everyone, and the paywall and the developer unlock are no longer rendered. Three journey defects that this exposed were fixed with it: set-up now opens on the first visit, a station's note is copied to the journal once, and a finished stage keeps its review reachable.
- Three fixes were cherry-picked from `claude/trusting-rubin-9ue5hh`: the streak statistics are gone from the consistency screen (`403f633`), every stated duration is 80 seconds (`b7b2e94`), and the daily reflection records consent-gated events (`755170f`).

Pull request #5, carrying all of the above, was merged the same day. A follow-up (`23a188e`) then fixed the journey defects that making it free had exposed: lost drafts, a note that could not be deleted, text that stepped back while being read, a reminder that switched itself on, a chart that counted the wrong things, and overlays without focus handling.

The owner also remembered writing more than 40 blessings. A search of the other Alhamd repositories found none: `adel3li/alhamd` holds the same 40, byte for byte, across its whole history; `adel3li/Alhmd-MVP-V2` (a Flutter build from June) holds one; `adel3li/Alhmd-MVP-V1` holds only a README. The build specification in `Alhmd-MVP-V2` plans a database of 365 blessings, launching with 30 to 60, so the larger number was a plan. If more were written, they are somewhere other than GitHub.

They were on the owner's machine. The same day he supplied a file of 100 blessings. Its first 40 were the 40 in the app, differing in one corrected word; the other 60 had their titles, reflections, supplications and verse references, but no verse text and no hadith. At his instruction the 60 verses were taken, by those references, from the Tanzil Project's text and the blessings were added (`9f6b4a0`). Comparing the existing 40 against the same text showed that they had come from it too. The import brought two new categories, «نعم الكون» and «نعم الوجدان», lengthened the daily cycle from 39 days to 99, and made the share image's four-line limit on verses untenable, so that was fixed with it (`d42c2b0`). Details are in [reference/04-content-and-data.md](reference/04-content-and-data.md), section 1.7.

On 23 November 2026 the owner asked for a second hundred. No written text existed this time, so the work was split: the owner approved a list of 100 titles across the ten categories, then, in batches of about 25, a verse reference for each; the verse text is taken from Tanzil by reference as before, the other non-sacred fields are drafted for review, and the hadith, scholar quote and supplication are left empty for the owner and a named reviewer, who will supply them. Blessings 101–125, the first batch, lengthened the daily cycle to 124 days.

The owner then asked that every blessing have the same fields as the first 40: a hadith, a scholar's words and a supplication, and that where a supplication from the Qur'an or the Sunnah fits, it be shown beside the app's own short one rather than replace it. To avoid attributing anything from memory, the hadith were copied from digital editions of Bukhari and Muslim and the quotes from Tafsir al-Sa'di, each by script from a located span; the supplications from the Qur'an came from Tanzil. This added 77 hadith, 25 quotes and 27 sourced supplications (a new field, `duaaSourced`), and left eight blessings without a hadith where no fitting sahih hadith was found. The second batch, 126–150, was built with all fields at once; the owner allowed repeated hadith and hadith outside the two Sahihs when graded sahih, and named Dorar.net as a reference, which could not be reached by script.

## 5. Versions

The repository has no tags and `package.json` is still `0.0.0`, so "version" means different things in different places.

| What | Versions | Where |
|---|---|---|
| The app | v1 (`legacy/`) and v2 (`src/`, the "new design") | Repository name, `legacy/` |
| v2 milestones | Baseline (10 Sep) → themes (20 Oct) → journey (28 Oct) → current (7 Nov) | Section 4 |
| Blessings content schema | `schemaVersion: 2`, every blessing `contentVersion: 1` | `src/data/blessings_ar.json` |
| Journey content schema | `schemaVersion: 1` | `src/data/journey_content.json` |
| Journey state | `schemaVersion: 1`, key `alhamd:journey_state:v1` | `src/lib/journeyStore.ts` |
| Backup file | `version: 2`; v1 files are migrated on import | `src/lib/store.tsx` |
| Storage keys with a version suffix | `alhamd_theme_v2`, `alhamd_font_size_v2`, `alhamd:userBlessings:v1`, `alhamd:journey_onboarded:v1`, `alhamd_tasbih_reciter_v1`, `alhamd_tasbih_volume_v1` | [reference/02](reference/02-state-and-persistence.md) |
| Design | Layl (dark) and Nahar (light), each with a high-contrast variant, plus night reading | [reference/05](reference/05-design-system.md) |
| Case study (unmerged) | Four drafts: v1, v2, v3, and the short v4 served at `/story/` | Branch `claude/trusting-rubin-9ue5hh` |
| Promo video (unmerged) | Storyboard v1, then script, animation and sound | Branch `claude/magical-volta-9uw2sx` |

## 6. Design evolution

| Aspect | v1 (legacy) | Baseline, 10 Sep | 20 Oct | 28 Oct | 10 Nov |
|---|---|---|---|---|---|
| Dark palette | Slate `#0f172a`, indigo `#6366f1`, amber `#fbbf24` | Navy `#15152A`, gold `#E4C368` / `#C8A951`, violet `#6C63FF`, as hex classes | Same values, named as CSS variables ("Layl") | Adds high-contrast dark and the warm night-reading palette | Landing page repeats Layl under its own variable names |
| Light palette | `#f8fafc`, indigo `#4f46e5`, amber `#f59e0b` | Stub: wrapper `#F4F5FA` only | Cream `#F4EDE3`, ink `#2A1F19`, terracotta `#B9573B` ("Nahar") | Adds high-contrast light | Landing page repeats Nahar, chosen by system preference |
| Accent roles | Indigo primary, amber accent | Gold for text, violet for actions | In light mode both become terracotta; Qur'an text turns from gold to ink | Night reading removes violet | |
| Fonts | Inter, IBM Plex Sans Arabic, Amiri | Amiri Quran, Amiri, IBM Plex Sans Arabic | | Adds Noto Naskh Arabic and Tajawal; the body font is user-selectable | Landing loads three families |
| Text size | | Three steps | Numeric, 12–24 px on the root | | |
| Mobile tabs | 6: home, tasbih, my blessings, journal, consistency, settings | 4: home, journal, consistency, settings | 4: home, journal, consistency, tasbih; settings is a gear | 5: home, journey, journal, consistency, tasbih | |
| Brand mark | | Wordmark with gradient thread and glowing dot | Flat thread and dot with proportions from the icon specification | | |
| Share card | DOM to image | Canvas, dark only, two sizes | Own theme switch, native share, WhatsApp / X / Telegram | Image and text tabs, "royal" theme, "full" content mode | |
| Motion and effects | | Fade and scale keyframes | Progress rings, timer halo, area chart | Particles (20 Oct), journey path, ambient audio | |

Design reference material in the repository:

- **Two design sheets** (`public/assets/aistudio/design-sheet-layl-dark_*.html`, `design-sheet-nahar-light_*.html`), added on 20 October: colours, fonts, surfaces and ornament, the mark and the thread, components and states, sizes, motion and touch.
- **The app-icon specification** (`app-icon-palette_*.png`): the source of the Nahar palette and of the brand mark's proportions.
- **Nine working screenshots** from 20 and 28 October. Several are bug reports (a doubled «هـ» suffix; a dhikr circle that stayed dark in light mode) and several show intermediate states that were changed before committing (labelled share buttons, a font-size preset grid, a row of Hisn shortcut chips on Home).
- **Six README screenshots** (`docs/screenshots/`) of the app as of 7 November, in the dark theme.

Each image is described in the appendix.

## 7. Feature timeline

| Feature | Introduced | Later changes |
|---|---|---|
| Onboarding, tour, about / review / privacy modals | `a47edd1` | Tour retargeted to the tasbih tab in `5ebc2dc`; otherwise untouched |
| Blessing of the day, daily logic | `a47edd1` (ported from v1) | None |
| Five-step reflection | `a47edd1` | Timer and 100-count ring `5ebc2dc`; completion overlay `3a7e4e4`; share button `e341c65` |
| Journal and personal blessings | `a47edd1` | Quick composer `28d36cb` |
| Consistency calendar | `a47edd1` | Statistics card with streak `5ebc2dc`; real Hijri months and day detail `4b31e3b`; category charts `e341c65` |
| Tasbih counter | `a47edd1` (modal) | Becomes a tab `5ebc2dc`; Hisn sub-view `4b31e3b`; audio player `e341c65` |
| Share cards | `a47edd1` | Rewritten `5ebc2dc` and again `e341c65` |
| Settings, backup and restore | `a47edd1` | Numeric font size `5ebc2dc`; fonts, contrast, night reading, developer tools `e341c65` |
| Themes | Stub in `a47edd1` | Real light theme `5ebc2dc`; contrast and night modes `e341c65` |
| Completion particles | `3a7e4e4` | Rendered from `4b31e3b` |
| Hisn Al-Muslim | `4b31e3b` | None |
| My Journey, paywall, entitlements, analytics | `e341c65` | Haptics and paywall layout `28d36cb` |
| Recitation player | `e341c65` | None |
| Haptics | `a47edd1` | Wider use `28d36cb` |
| README | `1340209` | Links `793f8be`, `c28abe4` |
| Landing page | `55ccf2e` | App URL `70602c1` |
| Host routing | `70602c1` | Fixed `e7dfbbe` |

## 8. Data model and storage

| Commit | Change |
|---|---|
| `a47edd1` | Twelve storage keys; content types; backup version 2 with v1 import; seeded sample data |
| `5ebc2dc` | `fontSize` and `alhamd_font_size_v2`; `alhamd_text_size` becomes derived |
| `3a7e4e4` | `alhamd_theme` retired in favour of `alhamd_theme_v2` |
| `4b31e3b` | Hisn keys written by the component, outside the store and outside the backup |
| `e341c65` | Journey types and state, display font, contrast and night flags; nine new keys; two window events; journey state added to the backup |

No commit after `e341c65` changes a type or a key. The complete registry of keys is in [reference/02-state-and-persistence.md](reference/02-state-and-persistence.md).

## 9. Branches and pull requests

### Pull requests

| # | Title | Branch | Opened | State | What it brought |
|---:|---|---|---|---|---|
| 1 | Serve the landing page on alhamd.app and the app on app.alhamd.app | `claude/brave-archimedes-mmnpem` | 15 Nov | Merged 15 Nov (`1d7eb66`) | Landing page, `vercel.json`, build rename: 9 files, +890 / −1 |
| 2 | docs: add project README with screenshots and live links | `claude/project-resume-presentation-kg85tf` | 16 Nov | Merged 16 Nov (`bca55ba`) | `README.md`, six screenshots |
| 3 | docs: point the README live app link at app.alhamd.app | same branch | 16 Nov | Merged 16 Nov (`68e723a`) | One line |
| 4 | Add storyboard v1 for the Alhamd promo video | `claude/magical-volta-9uw2sx` | 17 Nov | **Open, draft** | `marketing/promo-video/`: 49 files, +6,553 |

Each pull request was merged within minutes of being opened, by the owner, with no review comments.

### Branches on the remote

| Branch | Tip | Status |
|---|---|---|
| `main` | `68e723a` | Production |
| `claude/brave-archimedes-mmnpem` | `e7dfbbe` | Merged (PR #1) |
| `claude/project-resume-presentation-kg85tf` | `c28abe4` | Merged (PR #2, #3) |
| `claude/trusting-rubin-9ue5hh` | `cbce2d1` | **Not merged, no pull request** |
| `claude/magical-volta-9uw2sx` | `4cf262a` | **Not merged, draft PR #4** |

Both unmerged branches merge into `main` without conflicts as of 17 November.

### `claude/trusting-rubin-9ue5hh` — audit, fixes and case study (15 November)

Based on `main` after PR #1. Sixteen commits; three are duplicates of the first three, joined by a merge commit, so there are twelve distinct changes.

*Case study.* Four single-file HTML drafts under `case-study/`, a build script that publishes them under `/story/` (latest at `/story/`, earlier ones at `/story/v1/` to `/story/v3/`, marked `noindex`), and nine captures of the running app. The third draft is an audit of the product against its own promises.

*Fixes to the app that came out of that audit:*

| Commit | Fix |
|---|---|
| `e2296c2` | Removes the streak card, the seven-day streak chart, the running total and the month percentage from the consistency screen, because the app promises «بلا سلاسل» |
| `f05f291` | New users start with empty history; sample entries saved by earlier builds are dropped on load |
| `4209f2c` | States one duration, 80 seconds, in the tour, onboarding and landing page; removes the landing page's claim that every text is reviewed by scholars |
| `5c1347d` | Marks unreviewed verses on Home as «النص قيد المراجعة العلمية»; the content sheet reports the real approved count; the review gate is controlled by `VITE_CONTENT_REVIEW_GATE` |
| `16dd14a` | Records `reflection_started`, `reflection_step_viewed` and `reflection_completed`, consent-gated and metadata-only |
| `2ba90c4` | `scripts/check-promises.mjs` fails the build if streak counting, seeded history, a wrong duration or an unearned review claim comes back |

None of these fixes is in `main` or in production. The problems they address are still present and are listed in [FINDINGS.md](FINDINGS.md).

### `claude/magical-volta-9uw2sx` — marketing kit (17 November)

Six commits, all under `marketing/promo-video/`; no application code is touched.

- A storyboard for a 9:16 social advert titled «النعمة لا تُرى… حتى تغيب», 24 scenes, built as HTML and SVG in the app's Layl tokens.
- The final voice-over script (19 lines, about 50 seconds), with plain-text and SSML versions.
- An animation engine in which each scene is a function of time, a renderer at 30 fps, and alignment of scene timing to the recorded voice.
- Procedurally generated sound effects.
- 66 silent designs (posts, carousels, stories, a profile kit, store graphics, wallpapers, stickers, a poster, a bookmark), eight silent videos, a QR code for `alhamd.app`, and a catalogue page for review.
- App screens captured for the film with the clock fixed to 13 December 2026, the day the rotation reaches «نعمة الماء». The capture script sets `alhamd_welcome_seen` by hand, which is why the film shows a rotating blessing although the live app does not rotate (see FINDINGS, B-01).

## 10. Deployments

One Vercel project, `alhamd`, serves production. Seventeen deployments were recorded between 8 and 17 November, all successful.

| When (UTC) | Target | Branch | Commit |
|---|---|---|---|
| 8 Nov 19:00 | Production | `main` | `28d36cb` |
| 11 Nov 14:37 | Production | `claude/brave-archimedes-mmnpem` | `70602c1` |
| 11 Nov 14:48 | Preview | same | `e7dfbbe` |
| 11 Nov 14:49 | Production | same | `e7dfbbe` |
| 15 Nov 16:49 | Production | `main` | `1d7eb66` (PR #1) |
| 15 Nov 18:25, 21:37 | Preview | `claude/trusting-rubin-9ue5hh` | `2d2cd6e`, `cbce2d1` |
| 16 Nov 20:10 | Preview | `claude/project-resume-presentation-kg85tf` | `793f8be` |
| 16 Nov 20:13 | Production | `main` | `bca55ba` (PR #2) |
| 16 Nov 20:16 | Preview, then Production | README branch, then `main` | `c28abe4`, `68e723a` (PR #3) |
| 17 Nov 01:16–06:12 | Preview (6) | `claude/magical-volta-9uw2sx` | `209ea9f` … `4cf262a` |

Production today is `68e723a`. Because the application code has not changed since 7 November, what users see at `app.alhamd.app` is the app as of `28d36cb`.

## 11. Who did what

| Author | Commits on `main` | Work |
|---|---:|---|
| adel3li | 10 (the initial commit, 6 feature commits, 3 merges) | The whole application: v1, the v2 redesign, themes, Hisn Al-Muslim, the journey, the paywall, the audio player. Built in Google AI Studio |
| Claude (Claude Code sessions) | 6 | README and screenshots, the landing page, Vercel routing |
| Claude, not merged | 22 | Audit, six fixes, case study; marketing kit |

## 12. What the history shows

Points that matter for the work ahead.

1. **A regression from v1 to v2 was never noticed.** v1 marked the welcome blessing as seen after the first reflection. v2 kept the flag and the logic but dropped the call, so the daily blessing has not rotated for any real user since the baseline. Screenshots and captures did not reveal it: the README's home screenshot shows «نعمة الإسلام», which is also what a first-day user should see, and the marketing captures set the flag by hand.
2. **Commit messages understate the commits.** The four large commits each contain features their messages do not mention (the audio player, the charts, the quick journal composer, navigation changes). The diff is the only reliable record; the appendix lists what each really contains.
3. **Features left traces after being cut.** A row of Hisn shortcuts on Home appears in a screenshot from 20 October; in the code only the unused `onOpenHisn` prop remains. The tasbih card on Home was removed, but `tasbihCount` and `onOpenTasbih` are still passed.
4. **The free tier of the journey was never reachable.** The same commit that introduced a two-station free taste also made the journey tab open the paywall for anyone without the premium flag.
5. **The streak statistics contradict the product's promise and were added on purpose** (`5ebc2dc`), forty days after the baseline, whose page description already promised «بدون ضغط أو سلاسل». The fix exists on an unmerged branch.
6. **The README describes two things the code does not have**: an automatic theme and reduced-motion support.
7. **Nothing has been reviewed.** Every pull request was merged within minutes; there are no tests, no CI and no review comments in the history.
8. **Production was briefly ahead of `main`.** From 11 to 15 November the live site ran a branch build.

## 13. Where things stand on 17 November

- `main` and production: `68e723a`. Application code as of 7 November.
- Open: draft PR #4 (marketing kit).
- Branch `claude/gracious-tesla-3wpebg` (pull request #5): this documentation and the fixes (`d3dfd92` to `b8db9cc`). Not merged yet.
- Unmerged and without a pull request: `claude/trusting-rubin-9ue5hh`. Of its six fixes, three are now cherry-picked into pull request #5 (streak removal, one stated duration, reflection events), the seeded-history one is superseded by `d3dfd92`, and the one that marks unreviewed text on screen goes against the owner's later decision. What remains only on that branch is the build-time promise check (`2ba90c4`, which would need its review-claim rule adjusted) and the case-study pages.
- Not started: payments (RevenueCat), scholarly review of the content (0 of 40 blessings approved; 0 of 100 after the import of `9f6b4a0`), reminders, tests, native packaging.
