import { parseLocalDateString, toLocalDateString } from './dates';

/**
 * Daily selection: everyone sees the same item on the same calendar date, and
 * it changes at each user's local midnight. Generalised from Alhamd's
 * `src/lib/dailyLogic.ts` after its fixes (B-01, B-07).
 *
 * What the user actually saw must be stored with its id when they complete it.
 * Never recompute "which item was shown on day X" from the date later: the
 * pool grows, and the mapping from dates to items changes with it.
 */

const MS_PER_DAY = 86_400_000;

export interface Schedulable {
  id: string;
  /** Position in the rotation. Items are sorted by it. */
  order: number;
  /**
   * Local day ("YYYY-MM-DD") from which the item joins the rotation. Leave it
   * out for items present at launch. Setting it to a future date means a
   * content release does not change the item of the day the moment it ships:
   * the rotation changes at that date's midnight instead.
   */
  effectiveFrom?: string;
}

function toDate(localDay: string | Date): Date {
  if (localDay instanceof Date) return localDay;
  const parsed = parseLocalDateString(localDay);
  if (!parsed) throw new Error(`Expected a local day "YYYY-MM-DD", got "${localDay}"`);
  return parsed;
}

/** One integer per local calendar day: the same all day, one more after local midnight. */
export function dayNumber(localDay: string | Date): number {
  const d = toDate(localDay);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_PER_DAY);
}

/** The items in the rotation on that day, in order. */
export function poolForDay<T extends Schedulable>(localDay: string, items: readonly T[], excludeId?: string): T[] {
  return items
    .filter((item) => item.id !== excludeId && (!item.effectiveFrom || item.effectiveFrom <= localDay))
    .slice()
    .sort((a, b) => a.order - b.order);
}

/** The item of the day, or undefined when the rotation is empty. */
export function pickForDay<T extends Schedulable>(localDay: string, items: readonly T[], excludeId?: string): T | undefined {
  const pool = poolForDay(localDay, items, excludeId);
  if (pool.length === 0) return undefined;
  const n = pool.length;
  const index = ((dayNumber(localDay) % n) + n) % n;
  return pool[index];
}

export interface TodayInput<T extends Schedulable> {
  /** Today's local day, from `useLocalDay()` or `toLocalDateString()`. */
  today?: string;
  items: readonly T[];
  /** Id of the welcome item shown to a new user. */
  welcomeId?: string;
  /** Local day on which the user finished the welcome item, or null if they have not. */
  welcomeDoneOn: string | null;
}

export interface TodayResult<T> {
  item: T | undefined;
  role: 'welcome' | 'daily';
}

/**
 * A new user gets the welcome item until they finish it. It stays, shown as
 * done, for the rest of that day, and the daily rotation starts the next day.
 * Completion is recorded per day, so switching to the daily item on the same
 * day would show a new item already marked as done.
 */
export function resolveToday<T extends Schedulable>({
  today = toLocalDateString(),
  items,
  welcomeId,
  welcomeDoneOn,
}: TodayInput<T>): TodayResult<T> {
  const welcome = welcomeId ? items.find((item) => item.id === welcomeId) : undefined;
  if (welcome && (welcomeDoneOn === null || welcomeDoneOn === today)) {
    return { item: welcome, role: 'welcome' };
  }
  const daily = pickForDay(today, items, welcomeId);
  if (daily) return { item: daily, role: 'daily' };
  return { item: welcome, role: 'welcome' };
}
