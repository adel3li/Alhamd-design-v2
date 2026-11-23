/**
 * A daily reminder without a server or notification permission: an iCalendar
 * (.ics) file with one event that repeats every day at a local time and opens
 * the app. The user adds it to their own calendar, which does the reminding.
 *
 * The time is "floating" (no time zone), so 21:00 stays 21:00 wherever the
 * user travels. Lines end with CRLF and are folded at 75 bytes without
 * splitting a character, as RFC 5545 requires.
 *
 * Test on iPhone and Android before shipping. If opening a generated file does
 * not offer "Add to Calendar" on iOS, serve pre-built files for fixed times
 * (for example /reminders/21-00.ics, one per half hour) as static assets.
 */

export interface DailyReminderOptions {
  /** Event title, e.g. «دعاء اليوم». */
  title: string;
  /** Optional longer text shown in the event. */
  description?: string;
  /** Address the event links to. */
  url: string;
  /** Local time "HH:mm". */
  time: string;
  /** First day of the series; defaults to today. */
  startDate?: Date;
  /** Length of the event in minutes; defaults to 5. */
  durationMinutes?: number;
  /** Add an alert at the start of the event; defaults to true. */
  alarm?: boolean;
  /** Stable id, so re-adding updates the event instead of duplicating it in some calendars. */
  uid?: string;
  /** Product identifier for the PRODID line. */
  productId?: string;
  /** Used for DTSTAMP; defaults to now. Exposed for tests. */
  now?: Date;
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

function localStamp(date: Date, hours: number, minutes: number): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(hours)}${pad(minutes)}00`;
}

function utcStamp(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** Escapes a TEXT value: backslash, semicolon, comma and line breaks. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/** Folds one content line into chunks of at most 75 bytes, never inside a character. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let current = '';
  let currentBytes = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    // Continuation lines start with a space, which counts towards their 75 bytes.
    const limit = chunks.length === 0 ? 75 : 74;
    if (currentBytes + bytes > limit) {
      chunks.push(current);
      current = '';
      currentBytes = 0;
    }
    current += char;
    currentBytes += bytes;
  }
  chunks.push(current);
  return chunks.join('\r\n ');
}

function parseTime(time: string): { hours: number; minutes: number } {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) throw new Error(`Expected a time "HH:mm", got "${time}"`);
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

export function buildDailyReminderIcs(options: DailyReminderOptions): string {
  const {
    title,
    description,
    url,
    time,
    startDate = new Date(),
    durationMinutes = 5,
    alarm = true,
    uid = `daily-reminder-${time.replace(':', '')}@app`,
    productId = '-//App//Daily reminder//AR',
    now = new Date(),
  } = options;

  const { hours, minutes } = parseTime(time);
  const endTotal = hours * 60 + minutes + durationMinutes;
  // Keep the end on the same day; a reminder that runs past midnight is not useful.
  const endClamped = Math.min(endTotal, 23 * 60 + 59);

  const body = description ? `${description}\n${url}` : url;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${productId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${localStamp(startDate, hours, minutes)}`,
    `DTEND:${localStamp(startDate, Math.floor(endClamped / 60), endClamped % 60)}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(body)}`,
    `URL:${url}`,
    'TRANSP:TRANSPARENT',
  ];
  if (alarm) {
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeIcsText(title)}`, 'TRIGGER:PT0M', 'END:VALARM');
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

/** Offers the file to the browser. Call it from a click handler. */
export function downloadIcs(ics: string, fileName = 'reminder.ics'): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1_000);
}
