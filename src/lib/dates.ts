import { useEffect, useState } from 'react';

/**
 * The user's calendar day as "YYYY-MM-DD".
 *
 * Every "which day is it" key in the app (completed reflections, journal
 * dates, daily counters, the calendar's today marker) must come from here.
 * `toISOString()` gives the UTC day, which is still yesterday for the first
 * hours after midnight anywhere east of Greenwich.
 */
export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Reads "YYYY-MM-DD" as a day in the user's time zone.
 * `new Date('YYYY-MM-DD')` reads it as UTC midnight, which is the previous
 * day west of Greenwich.
 */
export function parseLocalDateString(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * The current local day, kept current while the app stays open: it is
 * re-read when the tab becomes visible again and once a minute, so content
 * that changes daily rolls over at midnight without a reload.
 */
export function useLocalDay(): string {
  const [day, setDay] = useState<string>(() => toLocalDateString());

  useEffect(() => {
    const refresh = () => setDay(toLocalDateString());
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    const interval = setInterval(refresh, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  return day;
}
