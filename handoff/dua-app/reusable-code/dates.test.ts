import { describe, expect, it } from 'vitest';
import { parseLocalDateString, toLocalDateString } from './dates';

describe('toLocalDateString', () => {
  it('uses the local calendar day', () => {
    expect(toLocalDateString(new Date(2026, 10, 23, 0, 30))).toBe('2026-11-23');
    expect(toLocalDateString(new Date(2026, 10, 23, 23, 59))).toBe('2026-11-23');
  });

  it('differs from the UTC day just after midnight east of Greenwich', () => {
    const justAfterMidnight = new Date(2026, 10, 23, 0, 30);
    if (justAfterMidnight.getTimezoneOffset() < 0) {
      expect(justAfterMidnight.toISOString().slice(0, 10)).toBe('2026-11-22');
    }
    expect(toLocalDateString(justAfterMidnight)).toBe('2026-11-23');
  });
});

describe('parseLocalDateString', () => {
  it('reads a day as local midnight', () => {
    const d = parseLocalDateString('2026-11-23')!;
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 23, 0]);
  });

  it('round-trips with toLocalDateString', () => {
    expect(toLocalDateString(parseLocalDateString('2026-03-08')!)).toBe('2026-03-08');
  });

  it('returns null for anything that is not YYYY-MM-DD', () => {
    expect(parseLocalDateString('23/11/2026')).toBeNull();
    expect(parseLocalDateString('2026-11-23T00:00:00Z')).toBeNull();
  });
});
