import { Blessing, InspirationItem, DhikrItem } from '../types';
import { inspirations } from '../data/inspirations';
import { dailyDhikrs } from '../data/dhikr';

export const ISLAM_ID = 'islam';
const MS_PER_DAY = 86_400_000;

/**
 * Continuous day number, UTC-based so every device computes the SAME value
 * at the same moment -> global sync.
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

  const dateArg = new Date(localDate);
  const dayIndex = getDayNumber(dateArg);
  const total = dailyPool.length;

  const idx = ((dayIndex % total) + total) % total;
  return dailyPool[idx];
}

export interface TodayExperience {
  blessing: Blessing;
  role: 'welcome' | 'daily';
}

export function resolveTodayExperience(
  localDate: Date | string,
  welcomeSeen: boolean,
  allBlessings: Blessing[]
): TodayExperience {
  const todaysGlobal = blessingForDate(localDate, allBlessings);

  if (!welcomeSeen) {
    const islamBlessing = allBlessings.find(b => b.id === ISLAM_ID);
    if (islamBlessing) {
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
