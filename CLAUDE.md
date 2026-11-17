# Alhamd (الحمد)

Arabic-only, right-to-left, mobile-first gratitude app. React 19, TypeScript, Vite 6, Tailwind v4. No backend: all user data is in `localStorage`. Deployed on Vercel: `alhamd.app` is the landing page, `app.alhamd.app` is the app.

## Read before working

- `docs/README.md` indexes the full documentation.
- `docs/reference/01-overview-and-architecture.md` explains the structure; `02-state-and-persistence.md` lists every `localStorage` key and the store API.
- `docs/FINDINGS.md` lists known bugs and improvement areas, with ids. Check it before fixing something, and mark the finding when it is fixed.
- `docs/HISTORY.md` explains how the code got here, including work on branches that are not merged.

## Commands

```bash
bun install
bun run dev      # app at http://localhost:3000/, landing at /landing/
bun run lint     # tsc --noEmit; the only static check
bun run build    # vite build, then renames dist/index.html to dist/app.html
bun run preview  # open /app.html, not /
```

There are no tests yet. Verify UI changes in a browser.

## Rules that are easy to break

- **Sacred text.** Qur'an verses, hadith and adhkar in `src/data/` must never be reworded, completed or generated. Every item is still `pending_review`; changes to these texts need the owner and a named reviewer.
- **Storage keys.** Real users have data under the existing keys. Do not rename a key or change a stored shape without a migration and an update to `docs/reference/02-state-and-persistence.md`.
- **Dates.** The store mixes UTC and local dates (`docs/reference/03-domain-logic.md`, section 4). Use `getLocalDateString` for new code.
- **Theming.** The light theme works by overriding specific Tailwind arbitrary-colour classes in `src/index.css`. A new hard-coded hex colour in a component will not adapt to light mode unless it is one already overridden there (`docs/reference/05-design-system.md`).
- **Product promises.** No streaks, no points, no account, nothing leaves the device. Do not add counters of consecutive days or network calls that carry user text.
- **`legacy/`** is the old v1 app, kept for reference. Do not edit or import it.
- **Build rename.** `vercel.json` relies on the app being `app.html`; keep the `mv` step in the build script.

## Layout

`src/App.tsx` is the shell (tab state, modal flags; no router). `src/lib/store.tsx` is the single Context store. `src/components/screens/` holds screens, `src/components/journey/` the premium journey, `src/components/common/` shared pieces, `src/data/` content, `src/landing/` the marketing page.
