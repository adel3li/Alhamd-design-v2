import { Blessing } from '../types';

export const ISLAM_ID = 'islam';
const MS_PER_DAY = 86_400_000;

/**
 * Continuous day number, UTC-based so every device computes the SAME value
 * at the same moment -> global sync. The day flips at 00:00 UTC worldwide.
 */
export function getDayNumber(now: Date = new Date()): number {
  // To get a consistent daily index that changes exactly at local midnight:
  // We construct a UTC date from the local year, month, and day components,
  // then divide by MS_PER_DAY. This avoids all timezone offset and DST complications.
  const utcMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(utcMidnight / MS_PER_DAY);
}

export function blessingForDate(localDate: Date | string, allBlessings: Blessing[]): Blessing {
  const dailyPool = allBlessings
    .filter(b => b.id !== ISLAM_ID)
    .sort((a, b) => a.order - b.order);

  if (dailyPool.length === 0) {
    throw new Error('dailyPool is empty');
  }

  const dateArg = new Date(localDate);
  let dayIndex = getDayNumber(dateArg);
  const total = dailyPool.length;
  
  // Safe positive modulo in case of pre-1970 dates (negative index)
  const idx = ((dayIndex % total) + total) % total;

  return dailyPool[idx];
}

export interface TodayExperience {
    blessings: { blessing: Blessing; role: 'welcome' | 'daily' }[];
}

export function resolveTodayExperience(
  localDate: Date | string,
  welcomeSeen: boolean,
  allBlessings: Blessing[]
): TodayExperience {
  const todaysGlobal = blessingForDate(localDate, allBlessings);

  if (!welcomeSeen) {
    const islamBlessing = allBlessings.find(b => b.id === ISLAM_ID);
    if (!islamBlessing) {
       // Fallback if islam config is weirdly missing
       return { blessings: [{ blessing: todaysGlobal, role: 'daily' }] };
    }
    return {
      blessings: [
        { blessing: islamBlessing, role: 'welcome' },
        { blessing: todaysGlobal, role: 'daily' }
      ]
    };
  }

  return { blessings: [{ blessing: todaysGlobal, role: 'daily' }] };
}
