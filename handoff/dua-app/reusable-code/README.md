# reusable-code

Small modules for the new project. Copy them into `src/lib/` with their tests.

| File | Origin | What it does |
|---|---|---|
| `dates.ts` | Alhamd `src/lib/dates.ts`, unchanged | The user's local day as `YYYY-MM-DD`, reading such a string as a local day, and `useLocalDay()`, which rolls over at midnight while the app is open. Imports `react` for the hook |
| `arabic.ts` | Alhamd `src/lib/arabic.ts`, unchanged | Arabic-Indic digits and 12-hour Arabic times |
| `hijri.ts` | Alhamd `src/lib/hijri.ts`, unchanged | Hijri (Umm al-Qura) dates and a month calendar with real Hijri month navigation, using `Intl` only. Imports `arabic.ts` and `dates.ts` |
| `useDialog.ts` | Alhamd `src/lib/useDialog.ts`, unchanged | Focus moves into a dialog, Tab stays inside, Escape closes, the page behind does not scroll, focus returns on close |
| `daily.ts` | Generalised from Alhamd `src/lib/dailyLogic.ts` | Item of the day for everyone on the same local date, the welcome item until it is finished, and `effectiveFrom` so a content release does not change today's item |
| `arabicSearch.ts` | New | `normalizeArabic` and `matchesQuery` for search that ignores vowel marks and letter forms; `splitSentences` for the paced reader, without a regex lookbehind |
| `hadithGrade.ts` | New | The owner's grading rule (option B) over the gradings sunnah.com records: include what is in al-Bukhari or Muslim, or accepted by al-Albani with no weakening by al-Arna'ut, Ahmad Shakir or Bashar Awad Ma'ruf; otherwise the reviewer decides. Arabic names for the graders and labels for the common grades |
| `calendarReminder.ts` | New | Builds an `.ics` file with one event repeating daily at a local time, so the user's own calendar does the reminding. No server and no notification permission |

Tests: `dates.test.ts`, `daily.test.ts`, `arabicSearch.test.ts`, `calendarReminder.test.ts`, `hadithGrade.test.ts` (43 tests). They import from `vitest`. They were run with Bun's test runner in three time zones, and all pass:

```bash
TZ=Asia/Riyadh bun test
TZ=UTC bun test
TZ=America/New_York bun test
```

The modules also pass `tsc --noEmit --strict` (ES2022, DOM).
