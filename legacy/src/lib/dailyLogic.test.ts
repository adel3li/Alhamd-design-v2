import { describe, it, expect } from 'vitest';
import { resolveTodayExperience, blessingForDate, ISLAM_ID, getDayNumber } from './dailyLogic';
import { Blessing } from '../types';

// Mock blessings pool for testing
const mockBlessings: Partial<Blessing>[] = [
  { id: ISLAM_ID, order: 0, title: 'Islam' },
  { id: 'b1', order: 1, title: 'Blessing 1' },
  { id: 'b2', order: 2, title: 'Blessing 2' },
  { id: 'b3', order: 3, title: 'Blessing 3' },
];

const allBlessings = mockBlessings as Blessing[];

describe('Daily Blessing Scheduling Logic', () => {

  describe('blessingForDate (Pure Global Daily Selection)', () => {

    it('returns a consistent daily blessing excluding ISLAM_ID', () => {
      // 2026-09-01 is day 20697, 20697 % 3 = 0
      const b0 = blessingForDate('2026-09-01T00:00:00.000Z', allBlessings);
      expect(b0.id).toBe('b1'); // index 0 of pool

      const b1 = blessingForDate('2026-09-02T00:00:00.000Z', allBlessings);
      expect(b1.id).toBe('b2'); // index 1

      const b2 = blessingForDate('2026-09-03T00:00:00.000Z', allBlessings);
      expect(b2.id).toBe('b3'); // index 2
    });

    it('cycles via modulo at pool boundary', () => {
      // There are 3 items in the dailyPool. Day 3 should roll back to index 0.
      const b3 = blessingForDate('2026-09-04T00:00:00.000Z', allBlessings);
      expect(b3.id).toBe('b1'); 
    });

    it('handles dates before 1970 gracefully', () => {
      const bOld = blessingForDate('1969-12-31T00:00:00.000Z', allBlessings);
      // 1969-12-31 is day -1. (-1 % 3 + 3) % 3 = 2
      expect(bOld.id).toBe('b3'); 
    });

  });

  describe('resolveTodayExperience', () => {

    it('first launch -> two blessings (welcome Islam, then today\'s global)', () => {
      // User hasn't seen welcome (welcomeSeen = false)
      const exp = resolveTodayExperience('2026-09-02T10:00:00.000Z', false, allBlessings);
      
      expect(exp.blessings.length).toBe(2);
      expect(exp.blessings[0].role).toBe('welcome');
      expect(exp.blessings[0].blessing.id).toBe(ISLAM_ID);
      
      expect(exp.blessings[1].role).toBe('daily');
      expect(exp.blessings[1].blessing.id).toBe('b2'); // 2026-09-02 is day 1
    });

    it('day-two returning user -> single correct global blessing', () => {
      // User has seen welcome (welcomeSeen = true)
      const exp = resolveTodayExperience('2026-09-03T10:00:00.000Z', true, allBlessings);
      
      expect(exp.blessings.length).toBe(1);
      expect(exp.blessings[0].role).toBe('daily');
      expect(exp.blessings[0].blessing.id).toBe('b3');
    });

    it('reopen mid-day-one -> one blessing if global was not complete', () => {
       // If welcome is complete, always just returns daily!
       const exp = resolveTodayExperience('2026-09-01T14:00:00.000Z', true, allBlessings);
       expect(exp.blessings.length).toBe(1);
       expect(exp.blessings[0].blessing.id).toBe('b1');
    });
    
  });

});
