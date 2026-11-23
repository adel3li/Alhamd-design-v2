import { describe, expect, it } from 'vitest';
import { dayNumber, pickForDay, poolForDay, resolveToday } from './daily';

const items = [
  { id: 'welcome', order: 0 },
  { id: 'a', order: 1 },
  { id: 'b', order: 2 },
  { id: 'c', order: 3 },
];

describe('dayNumber', () => {
  it('adds one per local calendar day, across daylight-saving changes', () => {
    expect(dayNumber('2026-11-24') - dayNumber('2026-11-23')).toBe(1);
    expect(dayNumber('2026-03-09') - dayNumber('2026-03-08')).toBe(1);
    expect(dayNumber('2026-11-02') - dayNumber('2026-11-01')).toBe(1);
    expect(dayNumber('2027-01-01') - dayNumber('2026-12-31')).toBe(1);
  });

  it('gives a Date the number of its local day, whatever the hour', () => {
    expect(dayNumber(new Date(2026, 10, 23, 0, 1))).toBe(dayNumber('2026-11-23'));
    expect(dayNumber(new Date(2026, 10, 23, 23, 59))).toBe(dayNumber('2026-11-23'));
  });

  it('rejects a string that is not a local day', () => {
    expect(() => dayNumber('2026-11-23T10:00:00Z')).toThrow();
  });
});

describe('pickForDay', () => {
  it('is the same item all day and the next item the next day', () => {
    const today = pickForDay('2026-11-23', items, 'welcome');
    expect(pickForDay('2026-11-23', items, 'welcome')).toBe(today);
    const pool = poolForDay('2026-11-23', items, 'welcome');
    const next = pickForDay('2026-11-24', items, 'welcome');
    expect(pool.indexOf(next!)).toBe((pool.indexOf(today!) + 1) % pool.length);
  });

  it('visits every item once per cycle and never the excluded one', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const day = new Date(2026, 10, 23 + i);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      seen.add(pickForDay(key, items, 'welcome')!.id);
    }
    expect([...seen].sort()).toEqual(['a', 'b', 'c']);
  });

  it('returns undefined for an empty rotation', () => {
    expect(pickForDay('2026-11-23', [], undefined)).toBeUndefined();
  });

  it('adds an item only from its effectiveFrom day', () => {
    const withNew = [...items, { id: 'd', order: 4, effectiveFrom: '2026-12-01' }];
    expect(poolForDay('2026-11-30', withNew, 'welcome').map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(poolForDay('2026-12-01', withNew, 'welcome').map((i) => i.id)).toEqual(['a', 'b', 'c', 'd']);
    // Before the release date the item of the day is unchanged.
    expect(pickForDay('2026-11-30', withNew, 'welcome')).toEqual(pickForDay('2026-11-30', items, 'welcome'));
  });
});

describe('resolveToday', () => {
  it('shows the welcome item until it is finished', () => {
    expect(resolveToday({ today: '2026-11-23', items, welcomeId: 'welcome', welcomeDoneOn: null })).toEqual({
      item: items[0],
      role: 'welcome',
    });
  });

  it('keeps the welcome item for the rest of the day it was finished', () => {
    expect(resolveToday({ today: '2026-11-23', items, welcomeId: 'welcome', welcomeDoneOn: '2026-11-23' }).role).toBe(
      'welcome',
    );
  });

  it('starts the rotation the next day and never shows the welcome item in it', () => {
    for (const today of ['2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27']) {
      const result = resolveToday({ today, items, welcomeId: 'welcome', welcomeDoneOn: '2026-11-23' });
      expect(result.role).toBe('daily');
      expect(result.item?.id).not.toBe('welcome');
    }
  });

  it('falls back to the welcome item when the rotation is empty', () => {
    const result = resolveToday({ today: '2026-11-24', items: [items[0]], welcomeId: 'welcome', welcomeDoneOn: '2026-11-23' });
    expect(result.item?.id).toBe('welcome');
  });
});
