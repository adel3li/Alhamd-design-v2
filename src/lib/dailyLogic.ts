import { Blessing, InspirationItem, DhikrItem } from '../types';
import { inspirations } from '../data/inspirations';
import { dailyDhikrs } from '../data/dhikr';
import { parseLocalDateString, toLocalDateString } from './dates';

export const ISLAM_ID = 'islam';
const MS_PER_DAY = 86_400_000;

/**
 * Continuous day number of the user's calendar date. Everyone sees the same
 * blessing on the same date; it changes at each user's local midnight.
 */
export function getDayNumber(now: Date = new Date()): number {
  const utcMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(utcMidnight / MS_PER_DAY);
}

export function blessingForDate(localDate: Date | string, allBlessings: Blessing[]): Blessing {
  const dailyPool = allBlessings
    .filter(b => b.id !== ISLAM_ID)
    .sort((a, b) => a.order - b.order);

  if (dailyPool.length === 0) {
    // Fallback if empty
    return allBlessings[0];
  }

  // A bare "YYYY-MM-DD" names a local day; `new Date(string)` would read it as UTC.
  const dateArg =
    typeof localDate === 'string'
      ? parseLocalDateString(localDate) ?? new Date(localDate)
      : localDate;
  const dayIndex = getDayNumber(dateArg);
  const total = dailyPool.length;

  const idx = ((dayIndex % total) + total) % total;
  return dailyPool[idx];
}

export interface TodayExperience {
  blessing: Blessing;
  role: 'welcome' | 'daily';
}

/**
 * A new user starts with the welcome blessing («نعمة الإسلام») and keeps it
 * until they finish its reflection. It stays for the rest of that day, shown
 * as done, and the daily rotation begins the next day.
 *
 * @param welcomeDate local day ("YYYY-MM-DD") on which the welcome reflection
 *   was finished, or null if it has not been.
 */
export function resolveTodayExperience(
  localDate: Date | string,
  welcomeSeen: boolean,
  allBlessings: Blessing[],
  welcomeDate: string | null = null
): TodayExperience {
  const todaysGlobal = blessingForDate(localDate, allBlessings);
  const islamBlessing = allBlessings.find(b => b.id === ISLAM_ID);

  if (islamBlessing) {
    const today =
      typeof localDate === 'string' && parseLocalDateString(localDate)
        ? localDate
        : toLocalDateString(new Date(localDate));
    if (!welcomeSeen || welcomeDate === today) {
      return { blessing: islamBlessing, role: 'welcome' };
    }
  }

  return { blessing: todaysGlobal, role: 'daily' };
}

export function getTodayInspiration(dayNumber: number): InspirationItem {
  const idx = Math.abs(dayNumber) % inspirations.length;
  return inspirations[idx];
}

export function getTodayDhikr(dayNumber: number): DhikrItem {
  const idx = Math.abs(dayNumber) % dailyDhikrs.length;
  return dailyDhikrs[idx];
}
