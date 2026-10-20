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
  gregorianLabel: string; // e.g., "٢٠ أكتوبر ٢٠٢٦"
  hijriFullLabel: string; // e.g., "٩ جمادى الأولى ١٤٤٨ هـ"
  isToday: boolean;
  isFuture: boolean;
  weekdayIndex: number; // 0=Saturday (س), 1=Sunday (ح), 2=Monday (ن), 3=Tuesday (ث), 4=Wednesday (ر), 5=Thursday (خ), 6=Friday (ج)
}

function parseArabicInt(str: string): number {
  const normalized = str.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[^\d]/g, '');
  return parseInt(normalized, 10) || 1;
}

function getHijriNumericParts(date: Date): { day: number; monthName: string; year: string } {
  try {
    const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).formatToParts(date);

    const dayStr = parts.find(p => p.type === 'day')?.value || '1';
    const monthName = parts.find(p => p.type === 'month')?.value || 'ذو الحجة';
    const year = parts.find(p => p.type === 'year')?.value || '١٤٤٧';

    return {
      day: parseArabicInt(dayStr),
      monthName,
      year
    };
  } catch {
    return {
      day: date.getDate(),
      monthName: 'ذو الحجة',
      year: '١٤٤٧'
    };
  }
}

function formatGregorianArabic(date: Date): string {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Computes exact Hijri calendar days for the target Hijri month (supports monthOffset navigation)
 */
export function generateMonthCalendar(referenceDate: Date = new Date(), monthOffset: number = 0): {
  monthTitle: string;
  monthName: string;
  year: string;
  days: HijriCalendarDay[];
  startPadding: number; // Empty slots before the 1st day (Saturday-based)
} {
  // Normalize to noon to avoid DST / timezone midnight boundary shifts
  const cursor = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    12,
    0,
    0
  );

  // Step 1: Move cursor to the 1st of the current Hijri month
  const currentHijri = getHijriNumericParts(cursor);
  cursor.setDate(cursor.getDate() - (currentHijri.day - 1));

  // Verify and fine-tune to exact day 1 of current Hijri month
  while (getHijriNumericParts(cursor).day > 1) {
    cursor.setDate(cursor.getDate() - 1);
  }

  // Step 2: Apply Hijri monthOffset accurately month-by-month
  if (monthOffset !== 0) {
    const direction = monthOffset > 0 ? 1 : -1;
    let remaining = Math.abs(monthOffset);

    while (remaining > 0) {
      if (direction > 0) {
        // Jump to next Hijri month (28 days forward is still day 29 or 1, then step until day === 1)
        cursor.setDate(cursor.getDate() + 28);
        while (getHijriNumericParts(cursor).day !== 1) {
          cursor.setDate(cursor.getDate() + 1);
        }
      } else {
        // Step back 1 day into the previous Hijri month, then rewind to day 1 of that month
        cursor.setDate(cursor.getDate() - 1);
        const prevMonthParts = getHijriNumericParts(cursor);
        cursor.setDate(cursor.getDate() - (prevMonthParts.day - 1));
        while (getHijriNumericParts(cursor).day > 1) {
          cursor.setDate(cursor.getDate() - 1);
        }
      }
      remaining--;
    }
  }

  const targetMonthParts = getHijriNumericParts(cursor);
  const todayNoon = new Date();
  todayNoon.setHours(12, 0, 0, 0);
  const todayIso = new Date().toISOString().split('T')[0];

  const days: HijriCalendarDay[] = [];
  const dayCursor = new Date(cursor);

  // Collect all days belonging to this Hijri month (29 or 30 days)
  for (let i = 0; i < 30; i++) {
    const parts = getHijriNumericParts(dayCursor);
    if (i > 0 && parts.day === 1) {
      break; // Reached the 1st of the next Hijri month
    }

    const yyyy = dayCursor.getFullYear();
    const mm = String(dayCursor.getMonth() + 1).padStart(2, '0');
    const dd = String(dayCursor.getDate()).padStart(2, '0');
    const isoDate = `${yyyy}-${mm}-${dd}`;

    const jsDay = dayCursor.getDay();
    const satFirstIndex = (jsDay + 1) % 7;
    const dayNum = parts.day || (i + 1);

    days.push({
      dayNumber: dayNum,
      arabicNumber: toArabicNumerals(dayNum),
      isoDate,
      gregorianLabel: formatGregorianArabic(dayCursor),
      hijriFullLabel: `${toArabicNumerals(dayNum)} ${targetMonthParts.monthName} ${targetMonthParts.year} هـ`,
      isToday: isoDate === todayIso,
      isFuture: dayCursor.getTime() > todayNoon.getTime() && isoDate !== todayIso,
      weekdayIndex: satFirstIndex
    });

    dayCursor.setDate(dayCursor.getDate() + 1);
  }

  const firstDayWeekday = days.length > 0 ? days[0].weekdayIndex : 0;

  return {
    monthTitle: `${targetMonthParts.monthName} ${targetMonthParts.year} هـ`,
    monthName: targetMonthParts.monthName,
    year: targetMonthParts.year,
    days,
    startPadding: firstDayWeekday
  };
}

