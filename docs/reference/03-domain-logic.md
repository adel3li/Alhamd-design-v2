# Domain logic and utilities

Covers `src/lib/dailyLogic.ts`, `src/lib/hijri.ts` and `src/lib/arabic.ts`: pure functions with no React and no storage access. These are the cheapest parts of the app to unit-test.

## 1. Daily selection (`src/lib/dailyLogic.ts`, 65 lines)

| Export | Signature | Behaviour |
|---|---|---|
| `ISLAM_ID` | `'islam'` | Id of the welcome blessing, excluded from the daily pool |
| `getDayNumber(now?)` | `Date → number` | `floor(Date.UTC(localYear, localMonth, localDay) / 86_400_000)`. One integer per **local calendar date** |
| `blessingForDate(date, all)` | `(Date \| string, Blessing[]) → Blessing` | Daily pool is every blessing except `islam`, sorted by `order`; returns `pool[dayNumber mod pool.length]`. With an empty pool it returns `all[0]` |
| `resolveTodayExperience(date, welcomeSeen, all, welcomeDate?)` | `→ { blessing, role }` | `role: 'welcome'` with the `islam` blessing while `welcomeSeen` is false, and (since `d3dfd92`) also on `welcomeDate`, the day the welcome reflection was finished; otherwise `role: 'daily'` with `blessingForDate` |
| `getTodayInspiration(dayNumber)` | `→ InspirationItem` | `inspirations[abs(dayNumber) mod 8]` |
| `getTodayDhikr(dayNumber)` | `→ DhikrItem` | `dailyDhikrs[abs(dayNumber) mod 9]`. Imported by nothing |

Facts worth knowing (the last three bullets describe `68e723a`; `d3dfd92` corrected the comment, made the string form read as a local day, and made the store use the role and set the flag):

- The pool has 39 blessings, so the cycle repeats every 39 days. On 17 November 2026 the daily blessing is «نعمة الرزق» (order 28), on the 18th «نعمة المال», on the 25th «نعمة السمع» (checked in a browser).
- The doc comment on `getDayNumber` says the value is UTC-based so that every device computes the same value at the same moment (`src/lib/dailyLogic.ts:8`). The code feeds **local** year, month and day into `Date.UTC`, so the blessing changes at each user's local midnight. Two users see the same blessing on the same calendar date, not at the same instant.
- `blessingForDate` accepts a string. `new Date('YYYY-MM-DD')` is parsed as UTC midnight, so in a timezone behind UTC the function returns the blessing of the previous day. The only caller that passes a string is `ReflectionCategoryCharts.tsx:130`.
- The `role` returned by `resolveTodayExperience` is discarded by the store (`src/lib/store.tsx:320`), and `welcomeSeen` never becomes true; see [02-state-and-persistence.md](02-state-and-persistence.md), section 1.5.

## 2. Hijri calendar (`src/lib/hijri.ts`, 236 lines)

All Hijri work is done with `Intl.DateTimeFormat` and the locale `ar-SA-u-ca-islamic-umalqura`. There is no date library and no tabular conversion in the code, so the result depends on the browser's ICU data.

| Export | Returns | Fallback |
|---|---|---|
| `getFormattedHijriDate(date?)` | Day, month name, year and a single trailing «هـ», e.g. «٧ جمادى الآخرة ١٤٤٨ هـ». Any «هـ» the formatter already appended is stripped first | Retries with `ar-SA-u-ca-islamic`, then returns «اليوم المبارك» |
| `getFormattedHijriDayHeader(date?)` | Weekday plus Hijri day and month. Imported by nothing | «اليوم» |
| `getHijriMonthAndYear(date?)` | `{ monthName, year, full }` | Fixed «ذو الحجة ١٤٤٧» |
| `generateMonthCalendar(referenceDate?, monthOffset?)` | `{ monthTitle, monthName, year, days, startPadding }` for one Hijri month | Internal helpers fall back to the Gregorian day number and «ذو الحجة ١٤٤٧» |
| `HijriCalendarDay` | `dayNumber`, `arabicNumber`, `isoDate` (local `YYYY-MM-DD`), `gregorianLabel`, `hijriFullLabel`, `isToday`, `isFuture`, `weekdayIndex` (0 = Saturday … 6 = Friday) | |

`generateMonthCalendar` algorithm (`src/lib/hijri.ts:137`):

1. Normalise the reference date to local noon, to stay clear of DST and midnight edges.
2. Read the Hijri day number and step back `day − 1` days, then step back one day at a time until the Hijri day is 1.
3. Apply `monthOffset` one month at a time. Forward: jump 28 days, then advance until the Hijri day is 1. Backward: step back one day into the previous month, then rewind to its day 1.
4. Walk forward up to 30 days, stopping when the Hijri day returns to 1, building one `HijriCalendarDay` each. `weekdayIndex` is `(jsDay + 1) mod 7`, which makes Saturday the first column.
5. `startPadding` is the weekday index of day 1.

Each step constructs a new `Intl.DateTimeFormat` (`getHijriNumericParts`, `src/lib/hijri.ts:96`, and `formatGregorianArabic`, `src/lib/hijri.ts:122`): two per day cell, so about 60 for the current month and more when navigating to another month.

`isToday` compares the cell's local date with the local day (`toLocalDateString()`). Before `d3dfd92` it compared it with the UTC date (`src/lib/hijri.ts:191`, `218`).

Private helpers: `parseArabicInt` (Arabic-Indic digits to number, defaulting to 1), `getHijriNumericParts`, `formatGregorianArabic` (`ar-SA-u-ca-gregory`, falling back to the ISO date).

## 3. Arabic formatting (`src/lib/arabic.ts`, 42 lines)

| Export | Behaviour |
|---|---|
| `toArabicNumerals(numOrString)` | Replaces `0-9` with `٠-٩`; other characters pass through |
| `formatArabicTime("HH:mm")` | 12-hour time with «ص» / «م», e.g. `"21:00"` → «٩:٠٠ م»; empty input returns `''`; input without `:` is returned with digits converted |
| `formatTimestampArabicTime(msOrDate)` | Same format from a timestamp, in local time |

## 4. Dates: which clock each feature uses

**Since `d3dfd92` every row below uses the local day.** `src/lib/dates.ts` is now the only place that decides which day it is:

| Export | Behaviour |
|---|---|
| `toLocalDateString(date?)` | The user's calendar day as `YYYY-MM-DD` |
| `parseLocalDateString("YYYY-MM-DD")` | That day as a local `Date`, or `null` when the string has another shape |
| `useLocalDay()` | Hook returning the current local day; re-read when the tab becomes visible and every 60 seconds, so daily content rolls over at midnight without a reload |

Days saved by earlier builds are kept as they are: a reflection finished between midnight and the UTC offset before the fix is stored under the previous day. The only remaining uses of `toISOString()` are full timestamps (`completedAt`, `exportedAt`, analytics) and the clean-up code that reproduces how old builds computed their seeded days.

The rest of this section describes the code at `68e723a`, which is what users had until the fix.

The code mixed UTC dates and local dates. For users east of UTC (the whole Arab world) the two disagree between local midnight and the UTC offset, which is 00:00 to 03:00 in Riyadh and 00:00 to 02:00 or 03:00 in Cairo, depending on daylight saving.

| Feature | Date used | Where |
|---|---|---|
| Blessing of the day | local | `dailyLogic.ts:13` |
| Verse or hadith of the day | local | `store.tsx:324` |
| "Completed today" flag and the date recorded on completion | UTC | `store.tsx:330`, `551` |
| Journal entry `date` | UTC | `store.tsx:479` |
| Seeded sample days | UTC | `store.tsx:187` |
| Hisn Al-Muslim daily counters | UTC, computed once per mount | `HisnScreen.tsx:126` |
| Journey unlock window, weekly chart | local | `journeyStore.ts:61` |
| Calendar cell dates | local | `hijri.ts:203` |
| Calendar "today" marker | UTC | `hijri.ts:191` |

Observed in a browser set to Riyadh time at 01:00 on 18 November (22:00 UTC on the 17th): Home shows the blessing for the 18th, but a reflection completed on the evening of the 17th still counts as "today" («حمدتَ اللهَ اليوم على هذه النعمة»), and one completed now would be recorded as the 17th.

## 5. Haptics

`triggerHaptic` lives in the store (`src/lib/store.tsx:257`) and is passed down as a prop or read from `useStore()`. It calls `navigator.vibrate` inside a `try`, with four patterns: light 8 ms, medium 20 ms, heavy 35 ms, success `[15, 30, 25]`. Browsers without the Vibration API (all iOS browsers, desktop Safari and Firefox) silently do nothing. v1 used Capacitor's native haptics instead; see [12-legacy-v1.md](12-legacy-v1.md).

## 6. Test targets

None of this module has tests today. Suggested first cases, all runnable without a DOM:

| Function | Cases |
|---|---|
| `getDayNumber` | same value across a local day; +1 across local midnight; behaviour in UTC−, UTC and UTC+ zones |
| `blessingForDate` | never returns `islam`; wraps after 39 days; stable for a given date; string versus `Date` input in a zone behind UTC; empty pool |
| `resolveTodayExperience` | welcome versus daily; missing `islam` blessing |
| `getTodayInspiration`, `getTodayDhikr` | index wraps; negative day numbers |
| `toArabicNumerals`, `formatArabicTime`, `formatTimestampArabicTime` | `00:00`, `12:00`, `12:30`, `23:59`, malformed input |
| `generateMonthCalendar` | 29- and 30-day months, offsets −12 to +12, first-column padding, exactly one `isToday` in the current month, year boundary |
| `getFormattedHijriDate` | exactly one «هـ» suffix |

`legacy/src/lib/dailyLogic.test.ts` already holds cases for the v1 version of `dailyLogic.ts` and can be ported.
