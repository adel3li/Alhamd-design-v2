# Alhamd (الحمد) — Project overview

Home document for this project. Written 2026-11-27 from a read of the repository at `main` = `bb2504c`, every remote branch, and every pull request on `adel3li/Alhamd-design-v2`. For depth, follow the links into `docs/`; this file is the map, not the territory.

---

## 1. What the project is

**Alhamd («الحمد», "all praise")** is an Arabic-only, right-to-left, mobile-first web app for daily gratitude in an Islamic context. Each day it shows one blessing (*ni'mah*) with a Qur'anic verse, a hadith, a scholar's remark, a short reflection and a supplication, then walks the user through an ~80-second, five-step reflection and a private journal line.

Around that core: Hisn Al-Muslim (23 adhkar), a tasbih counter with recitation audio, a Hijri (Umm al-Qura) calendar, shareable image cards, and «رحلتي» (My Journey), a guided programme of 4 stages × 7 stations.

**Goal and promises** (these are product rules, not just marketing):
- No streaks, no points, no pressure («بدون ضغط أو سلاسل»).
- No account and no backend: everything stays in the browser (`localStorage`). Nothing that carries user text leaves the device. Analytics are opt-in, metadata-only, and stored locally.
- Sacred text (Qur'an, hadith, adhkar) is never reworded or generated; it is copied from named sources and awaits a named scholarly reviewer.
- «رحلتي» is free for everyone (owner's decision, 17 Nov 2026).

Owner: **adel3li** (Adel). The app itself was built by the owner in Google AI Studio (Sept–Nov 2026); since 8 Nov, Claude Code sessions have done docs, fixes, content, routing and marketing, merged by the owner through PRs.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| UI | React 19, TypeScript 5.8 (`strict` on) |
| Build | Vite 6, Bun (`bun.lock`) |
| Styling | Tailwind CSS v4; CSS custom properties for themes; light theme via overrides in `src/index.css` |
| Motion / charts / icons | `motion`, `recharts`, `lucide-react` |
| Fonts | IBM Plex Sans Arabic, Noto Naskh Arabic, Amiri / Amiri Quran, Tajawal (Google Fonts) |
| State | One React Context store (`src/lib/store.tsx`) persisted to `localStorage` |
| Audio | Recitations streamed from `everyayah.com`; speech-synthesis fallback |
| Hosting | Vercel, static (project `alhamd`) |
| Tests / CI | **None.** `bun run lint` (`tsc --noEmit`) is the only static check |

Unused leftovers from the AI Studio template: `@google/genai`, `express`, `dotenv`, `metadata.json`, `.aistudio/`, the `DISABLE_HMR` switch in `vite.config.ts`.

---

## 3. Run, build, deploy

```bash
bun install
bun run dev      # app at http://localhost:3000/, landing at /landing/
bun run lint     # tsc --noEmit
bun run build    # vite build, then mv dist/index.html dist/app.html
bun run preview  # open /app.html, not /
```

**Two Vite entries**: `index.html` (the app) and `landing/index.html` (marketing page).

**Deploy**: Vercel builds on push; `main` → production, other branches → previews. `vercel.json` routes by host:
- `alhamd.app/` → `/landing/index.html`
- any other host (`app.alhamd.app`) `/` → `/app.html`
- `www.alhamd.app` → 301 to `alhamd.app`

The build **must** rename the app to `app.html` (Vercel serves an existing `index.html` before rewrites). Keep the `mv` step.

**Environment variables (names only)**
| Name | Status |
|---|---|
| *(none)* | The app needs no env vars to run or build |
| `GEMINI_API_KEY`, `APP_URL` | In `.env.example`; AI Studio leftovers, not read by the code |
| `DISABLE_HMR` | Optional, dev server only (AI Studio) |
| `VITE_CONTENT_REVIEW_GATE` | Only on the unmerged branch `claude/trusting-rubin-9ue5hh` |
| `PW_CHANNEL` | Marketing render tools only (on carousel branches): `chrome` uses installed Chrome |

---

## 4. Structure

```
src/
  App.tsx                 shell: tab state, modal flags, onboarding, tour (no router)
  main.tsx, index.css     entry; themes, light-mode overrides, animations
  types.ts
  lib/
    store.tsx             the single Context store + localStorage + backup v2
    dates.ts              toLocalDateString / useLocalDay — the ONLY source of day keys
    dailyLogic.ts         blessing of the day (welcome «نعمة الإسلام», then rotation)
    hijri.ts, arabic.ts   Umm al-Qura formatting, Arabic numerals/text helpers
    journeyStore.ts       journey state, sanitising, schemaVersion 1
    journeyDrafts.ts      unsaved journey notes (alhamd:journey_drafts:v1)
    entitlements.ts       PAYWALL_ENABLED = false; isPremium() always true
    analytics.ts          consent-gated, local-only, allow-listed metadata
    useDialog.ts          focus trap / Escape for dialogs
  components/
    screens/              Home, Journal, Consistency, Tasbih(+audio), Hisn, Settings, Reflection, modals
    journey/              «رحلتي»: onboarding, path, station flow, muhasaba, weekly chart, paywall
    layout/               TopBar, BottomTabBar, DesktopNavBar
    common/               ShareCardModal, SourcedDuaa, SpotlightTour, BrandMark, particles, charts
  data/                   blessings_ar.json (400), journey_content.json, hisnAlMuslim.ts, dhikr.ts, inspirations.ts, loader.ts
  constants/              tokens, strings, categories
  landing/                the alhamd.app landing page (React)
landing/index.html        landing entry
public/assets/            images, icon; aistudio/ design sheets (Layl dark / Nahar light)
docs/                     README index, HISTORY, FINDINGS, reference/01–12, findings/, screenshots/
marketing/
  promo-video/            9:16 promo film: storyboard, VO script, scene engine, renders, catalogue
  organic-kit/            12-week social plan, calendar, creatives in both themes, render tools
legacy/                   v1 app, reference only — do not edit or import
vercel.json               host routing
CLAUDE.md                 rules for agents (read it)
```

Key docs: `docs/reference/01-overview-and-architecture.md` (start here), `02-state-and-persistence.md` (every storage key), `05-design-system.md` (theming), `docs/FINDINGS.md` (bug register with ids), `docs/HISTORY.md` (narrative history).

---

## 5. Work history

### 5.1 Before Claude (owner, in Google AI Studio)
| Date | Commit | What |
|---|---|---|
| 10 Sep | `3aaa222`, `a47edd1` | AI Studio template; v2 app + whole v1 in `legacy/` |
| 20 Oct | `5ebc2dc`, `3a7e4e4`, `4b31e3b` | Two-theme design system (Layl / Nahar), tasbih tab, particles, Hisn Al-Muslim, real Hijri calendar |
| 28 Oct | `e341c65` | «رحلتي», paywall, entitlements, analytics, recitation player, charts, fonts, contrast & night modes |
| 7 Nov | `28d36cb` | Haptics, quick journal composer, compact paywall (owner's last commit) |

### 5.2 Branches and pull requests (Claude Code sessions)

Session titles were not supplied (the prompt still had the placeholder), so each row is a branch/PR. Map your sidebar titles onto these.

| Branch | PR | Date | What it did | Status |
|---|---|---|---|---|
| `claude/project-resume-presentation-kg85tf` | [#2](https://github.com/adel3li/Alhamd-design-v2/pull/2), [#3](https://github.com/adel3li/Alhamd-design-v2/pull/3) | 8–16 Nov | README with six screenshots; live links to `app.alhamd.app` | **Done** (merged) |
| `claude/brave-archimedes-mmnpem` | [#1](https://github.com/adel3li/Alhamd-design-v2/pull/1) | 10–15 Nov | Landing page (second Vite entry), host routing in `vercel.json`, `app.html` rename | **Done** (merged) |
| `claude/trusting-rubin-9ue5hh` | none | 15 Nov | Product audit + case-study site at `/story/` (4 drafts); six fixes; `scripts/check-promises.mjs` build guard | **Partly superseded / parked.** 3 fixes cherry-picked into #5; 1 superseded; 1 rejected by owner (on-screen "under review" badge). Only the case study and promise-check script remain unique |
| `claude/magical-volta-9uw2sx` | [#4](https://github.com/adel3li/Alhamd-design-v2/pull/4) | 17 Nov | Marketing: promo film (storyboard, VO, animation, SFX), silent videos, 66 designs, organic content kit with 12-week calendar | **Done** (merged 17 Nov) |
| `claude/gracious-tesla-3wpebg` | [#5](https://github.com/adel3li/Alhamd-design-v2/pull/5), [#6](https://github.com/adel3li/Alhamd-design-v2/pull/6), [#7](https://github.com/adel3li/Alhamd-design-v2/pull/7) | 17 Nov | Full documentation (`docs/`), findings register; first fixes (daily rotation, local dates, clean first run, overlays, strict types); journey made free; journey defects J-03…J-12; blessings 41–100 from owner's file (verses from Tanzil); share image draws whole verse | **Done** (merged) |
| `claude/amazing-brahmagupta-shdey6` | [#8](https://github.com/adel3li/Alhamd-design-v2/pull/8) | 23 Nov | Blessings 101–400 in batches of 25; hadith (Bukhari/Muslim, then Sunan with al-Albani grade), al-Sa'di quotes, sourced supplications (`duaaSourced`) | **Done** (merged; current `main`) |
| `claude/charming-dijkstra-01v4us` | [#9](https://github.com/adel3li/Alhamd-design-v2/pull/9) draft | 23 Nov | `handoff/dua-app/`: starter kit for «قريب», a dua-of-the-day sister app (brief, UX, content model, verified catalogue, blueprint, lessons, kickoff prompt) | **In progress** (draft, docs only) |
| `claude/zen-johnson-n1kw1n` | [#10](https://github.com/adel3li/Alhamd-design-v2/pull/10) draft | 23–24 Nov | Marketing: full content packages per blessing (prayer, sight, water, mother, mind… ten total) + template | **In progress** (draft) |
| `claude/jr-carousels-400` | [#11](https://github.com/adel3li/Alhamd-design-v2/pull/11) draft | 24 Nov | Marketing: «الرحلة كاملة» carousels JR-01…110; then four carousel families per blessing (JR, GH, TR, HS), 4K/Full HD export, per-hundred file split, `batch.sh` | **In progress** (draft). Base for #12–#14 |
| `claude/carousels-101-200` | [#14](https://github.com/adel3li/Alhamd-design-v2/pull/14) draft | 24 Nov | Carousels + icons for blessings 111–200 | **In progress** (draft; stacked on #11) |
| `claude/carousels-201-300` | [#12](https://github.com/adel3li/Alhamd-design-v2/pull/12) draft | 24 Nov | Carousels + icons for 201–300, with per-blessing notes | **In progress** (draft; stacked on #11) |
| `claude/carousels-301-400` | [#13](https://github.com/adel3li/Alhamd-design-v2/pull/13) draft | 24 Nov | Carousels + icons for 301–400; last commit shows only the blessing's phrase of 12 long ayat | **In progress** (draft; stacked on #11; tied to #15) |
| `claude/app-verse-portions` | [#15](https://github.com/adel3li/Alhamd-design-v2/pull/15) draft | 24 Nov | In the app, blessings 305, 315, 321, 322, 326, 351, 364, 370, 392, 393, 398, 399 show a run of whole words instead of the whole ayah (owner's request). Sacred text — needs the named reviewer | **In progress** (draft, needs review) |
| `claude/jolly-mccarthy-lrtocm` | [#16](https://github.com/adel3li/Alhamd-design-v2/pull/16) draft | 25 Nov | Home redesigned as «المشهد»: verse in a sky scene (water / dawn / crescent), `BlessingScene.tsx`, `--scene-*` tokens, transparent top bar on Home, fixes C-07 and U-05 | **In progress** (draft, latest UI work) |
| `claude/clever-cori-jrdy8w` | — | 27 Nov | This session: `PROJECT_OVERVIEW.md` | Current |

Merge order to keep in mind: #12, #13, #14 contain #11's commits; merge #11 first. #13's last commit and #15 make the same verse-portion decision in marketing and in the app respectively.

---

## 6. Decisions made, and why

| Decision | Why / where |
|---|---|
| Local-first, no account, no backend | Privacy promise; nothing to secure server-side |
| No streaks (streak card removed, `403f633`) | Contradicted «بلا سلاسل» |
| One stated duration: 80 seconds (`b7b2e94`) | Several conflicting durations were stated |
| «رحلتي» free for everyone; `PAYWALL_ENABLED = false` (`b8db9cc`) | Owner's decision; the only purchase check was a `localStorage` flag anyone could set. Don't turn it on without real payments (RevenueCat planned) |
| "Under review" badges not shown to users | Owner's decision; the review itself is still not done, and no copy may claim it is |
| Verses copied by reference from the Tanzil Project; hadith from Bukhari/Muslim, then Tirmidhi/Abu Dawud/Nasa'i graded sahih by al-Albani; quotes from Tafsir al-Sa'di | Never attribute sacred text from memory. Dorar.net named by owner but unreachable by script |
| Own short `duaa` kept; a Qur'an/Sunnah supplication shown beside it (`duaaSourced`) | Owner asked for both, not a replacement |
| All day keys from `src/lib/dates.ts` | `toISOString()` gave the UTC day (wrong until 03:00 Riyadh) |
| No `forwards`/`transform` on screen roots | Broke `position: fixed` dialogs (U-01) |
| App served as `app.html`, host-based routing | Let `alhamd.app` show the landing and `app.alhamd.app` the app |
| Journey pace J-03 is a gentle, advisory limit | Owner can still ask for a hard limit |
| Long ayat may show a phrase (12 blessings, #15) | Owner's request; pending reviewer |
| Sister app «قريب» planned as a separate project | Reuse lessons from Alhamd (#9) |

---

## 7. Open items, known bugs, next steps

**Content and review (biggest gap)**
- 0 of 400 blessings approved; all `pending_review`. Need a named scholarly reviewer.
- C-02: journey texts all `pending_review`; 28 sacred/dhikr slots still hold placeholder tokens — visible to every user now the journey is free.
- 8 blessings have no hadith (no fitting sahih one found). C-09…C-12 and B-13 in FINDINGS from the imports.

**Open findings worth doing first** (see `docs/FINDINGS.md`)
- D-03 High: light theme + high contrast doesn't work.
- M-01 High: no tests, no CI. Vitest for `dates`, `dailyLogic`, `hijri`; Playwright for core flows.
- M-03: no React error boundary.
- A-03: overlays outside the journey lack focus handling.
- PF-01: one ~1 MB JS chunk; lazy-load tabs and recharts.
- S-*: backup import not validated; no security headers.
- README still claims auto theme and reduced-motion support the code doesn't have; README says "curated set of 100" in Features while there are 400.

**Pending decisions for the owner**
- Merge or close draft PRs #9–#16 (merge #11 before #12–#14).
- Approve the verse-portion cuts (#15, #13) with the reviewer.
- Review the «المشهد» Home redesign (#16).
- Fate of `claude/trusting-rubin-9ue5hh` (case study, promise-check script).

**Roadmap** (from README/HISTORY): RevenueCat if a paid tier returns; reminders that actually fire; code-splitting; Capacitor native packaging with local notifications; launch the marketing plan.

---

## 8. Links

| What | Link |
|---|---|
| Repository | https://github.com/adel3li/Alhamd-design-v2 |
| Landing page | https://alhamd.app |
| App | https://app.alhamd.app |
| Vercel fallback domain | https://alhamd-wheat.vercel.app |
| Pull requests | https://github.com/adel3li/Alhamd-design-v2/pulls |
| Design sheets | `public/assets/aistudio/design-sheet-layl-dark_*.html`, `design-sheet-nahar-light_*.html`; app-icon palette `app-icon-palette_*.png` |
| Screenshots | `docs/screenshots/` |
| Verse source | Tanzil Project (https://tanzil.net) |
| Related repos (owner's) | `adel3li/alhamd` (v1, same 40 blessings), `adel3li/Alhmd-MVP-V2` (Flutter build, June), `adel3li/Alhmd-MVP-V1` (README only) |
| Figma / external designs | Not found in the repo |
