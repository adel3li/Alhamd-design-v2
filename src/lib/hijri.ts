import { toArabicNumerals } from './arabic';

/**
 * Native Arabic Hijri date formatter using Islamic calendar
 */
export function getFormattedHijriDate(date: Date = new Date()): string {
  const normalizeHijriSuffix = (formatted: string) => {
    // Strip any trailing هـ or ه that Intl.DateTimeFormat may already include, then append a single هـ
    const cleaned = formatted.replace(/\s*هـ?\s*$/u, '').trim();
    return `${cleaned} هـ`;
  };

  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return normalizeHijriSuffix(formatter.format(date));
  } catch {
    // Fallback if umalqura subtag not supported
    try {
      const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return normalizeHijriSuffix(formatter.format(date));
    } catch {
      return 'اليوم المبارك';
    }
  }
}

/**
 * Returns weekday + Hijri day + month, e.g. "الأحد ٢٥ ذو الحجة"
 */
export function getFormattedHijriDayHeader(date: Date = new Date()): string {
  try {
    const weekdayFormatter = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' });
    const weekday = weekdayFormatter.format(date);

    const dayMonthFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long'
    });
    return `${weekday} ${dayMonthFormatter.format(date)}`;
  } catch {
    return 'اليوم';
  }
}

/**
 * Returns Hijri month and year e.g. "ذو الحجة ١٤٤٧"
 */
export function getHijriMonthAndYear(date: Date = new Date()): { monthName: string; year: string; full: string } {
  try {
    const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      month: 'long',
      year: 'numeric'
    }).formatToParts(date);

    const month = parts.find(p => p.type === 'month')?.value || 'ذو الحجة';
    const year = parts.find(p => p.type === 'year')?.value || '١٤٤٧';

    return {
      monthName: month,
      year: year,
      full: `${month} ${year}`
    };
  } catch {
    return {
      monthName: 'ذو الحجة',
      year: '١٤٤٧',
      full: 'ذو الحجة ١٤٤٧'
    };
  }
}

export interface HijriCalendarDay {
  dayNumber: number; // 1 to 29 or 30
  arabicNumber: string;
  isoDate: string; // YYYY-MM-DD
  isToday: boolean;
  weekdayIndex: number; // 0=Saturday (س), 1=Sunday (ح), 2=Monday (ن), 3=Tuesday (ث), 4=Wednesday (ر), 5=Thursday (خ), 6=Friday (ج)
}

/**
 * Computes calendar days for the current displayed month
 */
export function generateMonthCalendar(referenceDate: Date = new Date(), monthOffset: number = 0): {
  monthTitle: string;
  days: HijriCalendarDay[];
  startPadding: number; // Empty slots before the 1st day (Saturday-based)
} {
  const targetDate = new Date(referenceDate);
  targetDate.setMonth(targetDate.getMonth() + monthOffset);

  const monthInfo = getHijriMonthAndYear(targetDate);
  const todayIso = new Date().toISOString().split('T')[0];

  // Hijri months have either 29 or 30 days
  const totalDays = 30; // standard display representation
  const days: HijriCalendarDay[] = [];

  // Anchor target date around the 15th of the month
  const baseDay = targetDate.getDate();
  
  // Approximate mapping of Hijri days for visual calendar
  for (let i = 1; i <= totalDays; i++) {
    const dayDate = new Date(targetDate);
    dayDate.setDate(baseDay + (i - 15));
    const isoDate = dayDate.toISOString().split('T')[0];
    
    // Convert JS getDay() (0=Sunday ... 6=Saturday) to Saturday-first (0=Saturday ... 6=Friday)
    // Saturday in JS is 6 -> mapped to 0
    // Sunday in JS is 0 -> mapped to 1
    const jsDay = dayDate.getDay();
    const satFirstIndex = (jsDay + 1) % 7;

    days.push({
      dayNumber: i,
      arabicNumber: toArabicNumerals(i),
      isoDate,
      isToday: isoDate === todayIso,
      weekdayIndex: satFirstIndex
    });
  }

  // Calculate start padding based on day 1's weekday
  const firstDayWeekday = days[0].weekdayIndex;

  return {
    monthTitle: monthInfo.full,
    days,
    startPadding: firstDayWeekday
  };
}
