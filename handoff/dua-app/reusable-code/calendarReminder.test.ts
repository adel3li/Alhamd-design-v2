import { describe, expect, it } from 'vitest';
import { buildDailyReminderIcs, escapeIcsText, foldIcsLine } from './calendarReminder';

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

describe('buildDailyReminderIcs', () => {
  const ics = buildDailyReminderIcs({
    title: 'دعاء اليوم',
    description: 'دقيقة ونصف مع دعاء اليوم، في وقتك الذي اخترته، بهدوء وبلا استعجال ولا عدّاد.',
    url: 'https://example.app/#/today',
    time: '21:00',
    startDate: new Date(2026, 10, 23),
    now: new Date(Date.UTC(2026, 10, 23, 12, 0, 0)),
  });

  it('repeats daily at a floating local time', () => {
    expect(ics).toContain('DTSTART:20261123T210000\r\n');
    expect(ics).toContain('DTEND:20261123T210500\r\n');
    expect(ics).toContain('RRULE:FREQ=DAILY\r\n');
    expect(ics).toContain('DTSTAMP:20261123T120000Z\r\n');
    expect(ics).toContain('BEGIN:VALARM\r\n');
  });

  it('uses CRLF line ends and lines of at most 75 bytes', () => {
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    const physical = ics.split('\r\n').slice(0, -1);
    for (const line of physical) {
      expect(line.includes('\n')).toBe(false);
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it('unfolds back to the escaped description', () => {
    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).toContain(
      'DESCRIPTION:دقيقة ونصف مع دعاء اليوم، في وقتك الذي اخترته، بهدوء وبلا استعجال ولا عدّاد.\\nhttps://example.app/#/today',
    );
  });

  it('rejects a malformed time', () => {
    expect(() => buildDailyReminderIcs({ title: 't', url: 'u', time: '9:00' })).toThrow();
    expect(() => buildDailyReminderIcs({ title: 't', url: 'u', time: '24:00' })).toThrow();
  });

  it('keeps the end of a late event on the same day', () => {
    const late = buildDailyReminderIcs({ title: 't', url: 'u', time: '23:58', startDate: new Date(2026, 10, 23) });
    expect(late).toContain('DTEND:20261123T235900');
  });
});

describe('escapeIcsText', () => {
  it('escapes backslash, semicolon, comma and line breaks', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
  });
});

describe('foldIcsLine', () => {
  it('never splits a multi-byte character', () => {
    const line = 'SUMMARY:' + 'دعاء '.repeat(40);
    const folded = foldIcsLine(line);
    for (const chunk of folded.split('\r\n')) {
      expect(encoder.encode(chunk).length).toBeLessThanOrEqual(75);
      expect(() => decoder.decode(encoder.encode(chunk))).not.toThrow();
    }
    expect(folded.replace(/\r\n /g, '')).toBe(line);
  });
});
