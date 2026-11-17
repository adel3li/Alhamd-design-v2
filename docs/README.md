# Alhamd documentation

Written on 2026-11-17 from a full read of the repository at commit `68e723a` (`main`). Every file under `src/`, `legacy/`, `landing/`, `public/` and the root configuration was read; the Git history, pull requests, remote branches and Vercel deployments were reviewed; the production build was run and the app was exercised in a headless browser to confirm the behaviours marked "verified at run time".

## Three documents

| Document | Question it answers |
|---|---|
| [HISTORY.md](HISTORY.md) | What was done, when, by whom, and how the product and its design changed from the first commit to today |
| [reference/](reference/) | How the code works now: every module, screen, component, data file and setting |
| [FINDINGS.md](FINDINGS.md) | What should be improved, and the areas where this knowledge can be put to work next |

## History

| File | Contents |
|---|---|
| [HISTORY.md](HISTORY.md) | Narrative report: phases, versions, design evolution, pull requests, branches, deployments, open threads |
| [history/commit-by-commit.md](history/commit-by-commit.md) | Appendix: every commit, file by file, plus the design-reference images and codebase size over time |

## Reference

Read 01 first; the rest can be read in any order.

| # | File | Covers |
|---:|---|---|
| 01 | [Overview and architecture](reference/01-overview-and-architecture.md) | Product, stack, repository map, runtime structure, `App.tsx`, navigation, feature inventory |
| 02 | [State and persistence](reference/02-state-and-persistence.md) | The store, every `localStorage` key, backup format, journey store, entitlements, analytics, types |
| 03 | [Domain logic](reference/03-domain-logic.md) | Blessing of the day, Hijri calendar, Arabic formatting, the UTC/local date matrix, test targets |
| 04 | [Content and data](reference/04-content-and-data.md) | The 40 blessings, journey content, adhkar, strings, categories, review status |
| 05 | [Design system](reference/05-design-system.md) | Themes, CSS custom properties, fonts, text scaling, contrast modes, tokens, design sheets |
| 06 | [Layout and shared components](reference/06-layout-and-shared-components.md) | Navigation bars, share cards, charts, tour, particles, brand mark, cards |
| 07 | [Core screens](reference/07-screens-core.md) | Home, reflection, onboarding, journal, compose, consistency, about, content review, privacy |
| 08 | [Tasbih, Hisn Al-Muslim, Settings, Paywall](reference/08-screens-worship-settings-paywall.md) | Counter, audio player, adhkar and dataset, settings and backup UI, paywall |
| 09 | [My Journey](reference/09-journey.md) | The premium journey end to end, and its content tables |
| 10 | [Landing page](reference/10-landing-page.md) | The marketing page served at `alhamd.app` |
| 11 | [Build and deployment](reference/11-build-and-deployment.md) | Commands, configuration, bundle sizes, Vercel routing, headers, third-party requests |
| 12 | [Legacy v1](reference/12-legacy-v1.md) | The previous app kept in `legacy/`, and what changed between v1 and v2 |

## Conventions

- `path:line` references point at commit `68e723a`. After the code changes, search for the symbol name instead of trusting the line number.
- Arabic UI text is quoted exactly as it appears in the code.
- "Verified at run time" means the behaviour was observed in a browser against the production build. Everything else was read from the code.
- Statements about what the code does not do (for example "no component calls X") were checked with a repository-wide search.

## Keeping this current

The reference files describe a snapshot. When a module changes, update its section in the same pull request. When a finding in [FINDINGS.md](FINDINGS.md) is fixed, mark it there with the commit that fixed it.
