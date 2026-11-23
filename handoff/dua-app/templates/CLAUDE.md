# قريب (Qareeb)

Arabic-only, right-to-left, mobile-first web app: one supplication (dua) a day from the Qur'an and the Sunnah, with the situation it was said in, its meaning, short reflections and a five-step guided experience. Sister app of Alhamd (one blessing a day). React 19, TypeScript strict, Vite, Tailwind v4, Zustand. No backend: all user data is in `localStorage`. Installable PWA that works offline.

## Read before working

- `docs/handoff/README.md` indexes the starting kit: product brief, UX, content model, technical blueprint, lessons from Alhamd, roadmap.
- `docs/handoff/05-technical-blueprint.md` is the architecture. `docs/handoff/03-content-model.md` is the content model and the review process.
- `docs/reference/` documents the code as built. `storage.md` lists every `localStorage` key. Update it in the same pull request as the code.
- `docs/decisions.md` records the owner's decisions. Open decisions are listed at the end of `docs/handoff/01-product-brief.md`; do not take them yourself.

## Commands

```bash
bun install
bun run dev               # app at http://localhost:5173/
bun run lint              # tsc --noEmit, strict
bun run test              # vitest
bun run e2e -- --trace off
bun run validate-content  # schema, sacred-text and review checks on content/duas
bun run check-promises    # product promises as code checks
bun run build             # production build: content at CONTENT_MIN_LEVEL or above (approved by default)
CONTENT_PREVIEW=1 bun run build   # preview build: drafts included, marked
```

## Rules that are easy to break

- **Sacred text is never written.** Qur'an text is fetched by `scripts/fetch-quran.ts` from the source file in `content/sources/`, by surah and ayah. Hadith text is pasted by a researcher from the source named in `hadith.sourceUrl`. Never type, complete, correct, re-vowel or paraphrase a verse or a hadith from memory, in content, code, tests or copy. Where text is missing, leave a placeholder `<<يُلصق من المصدر: …>>`; the production build fails on any placeholder.
- **Three content layers.** Sacred text (verbatim), transmitted information (with a citation), authored text (reviewed). Authored text adds no event, name, quote or ruling that is not in the first two layers. Anything quoted inside authored text between ﴿ ﴾ or « » must match its source; `validate-content` checks the Qur'an fragments.
- **Review gate.** Two stages: `verified` (source verification by Claude, with a report in `review.verification`) then `approved` (the named scholarly reviewer, in `review.approval`). Production shows cards at `CONTENT_MIN_LEVEL` or above (`approved` by default). Never set `approval` or the `approved` status yourself, and never write in the interface that the content was reviewed by scholars unless every card shown is `approved`.
- **Dates.** Every day key comes from `src/lib/dates.ts` (`toLocalDateString`, `parseLocalDateString`, `useLocalDay`). Never `toISOString().slice(0, 10)` or `new Date("YYYY-MM-DD")`: those are UTC, which is still yesterday until 03:00 in Riyadh.
- **Store what was shown.** A completion stores the dua id with the local day. Never recompute which dua a past day had from its date.
- **Storage keys.** One registry, `src/state/keys.ts`, one pattern `qareeb:name:v1`. Never rename a key or change a stored shape without a migration, a test for it and an update to `docs/reference/storage.md`. Nothing is written on first run except what the user did.
- **Product promises.** No streaks, consecutive-day counts, points, badges or percentages of days. No account. No network request from `src/` (the allow-list in `scripts/check-promises.ts` is empty). No user text in anything shared or exported except the user's own backup file. Do not show a setting or claim a feature that does not work.
- **Theming.** Components use semantic tokens from `src/styles/tokens.css` through Tailwind's `@theme`. No hex, `rgb(` or named colours in components. The theme is set on `<html>` only.
- **Overlays.** Every dialog renders through the shared `Dialog` component (portal to `document.body`, `useDialog` for focus, Escape and scroll lock). Never put `transform`, `filter` or `animation-fill-mode: forwards` on a screen root: a transformed ancestor becomes the containing block of `position: fixed` children.
- **Sacred text display.** Only through `SacredText`. It is never truncated, in the app or on share images: shrink the type or grow the card.
- **Accessibility.** No `user-scalable=no` or `maximum-scale`. Honour `prefers-reduced-motion`. Paced text lives in a polite live region and can always be shown in full.
- **No developer tools in production builds.** Use `import.meta.env.DEV`.
- **Size.** Keep components under about 300 lines; pure logic goes in `src/lib/` with tests.

## Layout

`src/app/` shell, hash routing, error boundary. `src/screens/` one folder per screen. `src/features/` live-dua flow, share card, backup. `src/components/` shared UI (`Dialog`, `SacredText`…). `src/lib/` pure logic. `src/state/` store, keys, migrations. `src/content/` types, schema and the generated content. `src/copy/ar.ts` all interface text. `content/` the dua cards and their sources. `scripts/` content and promise checks. `landing/` the static marketing page.

## Verifying a change

Type check, unit tests and the content and promise checks must pass. For UI, check in a browser at 390×844 and 360×640, in light and dark, and with a large text size, before saying it works.
