import { describe, expect, it } from 'vitest';
import { CURRENT_SCOPE, classifyGrade, decide, decideByRuleB, gradeLabelAr } from './hadithGrade';

describe('classifyGrade', () => {
  it('accepts sahih and hasan in their common wordings', () => {
    for (const g of ['Sahih', 'Hasan', 'Hasan Sahih', 'Isnaad Sahih', 'Sahih Isnaad', 'Isnaad Hasan', 'Hasan Isnaad', 'Sahih Lighairihi', 'Sahih Muslim (1480)']) {
      expect(classifyGrade(g)).toBe('accepted');
    }
  });

  it('treats any weak wording as weak, even next to an accepted word', () => {
    for (const g of ['Daif', 'Very Daif', 'Daif Isnaad', 'Sanad Daif', 'Mawdu', 'Munkar', 'Shadh', 'Batil', 'Daif Munkar', 'Hasan Daif']) {
      expect(classifyGrade(g)).toBe('weak');
    }
  });

  it('flags gradings that do not attribute the words to the Prophet', () => {
    for (const g of ['Sahih Muquf', 'Sahih Maqtu', 'Sahih Isnaad Mauquf', 'Sahih Isnaad Mursal']) {
      expect(classifyGrade(g)).toBe('not_marfu');
    }
  });

  it('does not guess at unknown wordings', () => {
    expect(classifyGrade('-')).toBe('unknown');
    expect(classifyGrade('')).toBe('unknown');
  });
});

describe('decideByRuleB', () => {
  it('includes anything in al-Bukhari or Muslim', () => {
    expect(decideByRuleB('bukhari', []).decision).toBe('include');
    expect(decideByRuleB('muslim', []).decision).toBe('include');
  });

  it('includes what al-Albani accepts when no dissent grader weakens it', () => {
    const d = decideByRuleB('abudawud', [
      { by: 'Al-Albani', grade: 'Sahih' },
      { by: 'Shuaib Al Arnaut', grade: 'Sahih' },
      { by: 'Zubair Ali Zai', grade: 'Daif' },
    ]);
    expect(d.decision).toBe('include');
  });

  it('ignores graders outside the rule', () => {
    const d = decideByRuleB('tirmidhi', [
      { by: 'Al-Albani', grade: 'Sahih' },
      { by: 'Ahmad Muhammad Shakir', grade: 'Sahih' },
      { by: 'Zubair Ali Zai', grade: 'Daif' },
    ]);
    expect(d.decision).toBe('include');
  });

  it('sends to the reviewer when a dissent grader weakens what al-Albani accepts', () => {
    const d = decideByRuleB('tirmidhi', [
      { by: 'Al-Albani', grade: 'Hasan' },
      { by: 'Bashar Awad Maarouf', grade: 'Daif Isnaad' },
    ]);
    expect(d.decision).toBe('review');
    expect(d.reason).toContain('بشار عواد معروف');
  });

  it('excludes what al-Albani weakens', () => {
    expect(decideByRuleB('ibnmajah', [{ by: 'Al-Albani', grade: 'Daif' }]).decision).toBe('exclude');
  });

  it('sends to the reviewer without a grading from al-Albani, or with an unclear one', () => {
    expect(decideByRuleB('nasai', [{ by: 'Abu Ghuddah', grade: 'Sahih' }]).decision).toBe('review');
    expect(decideByRuleB('nasai', [{ by: 'Al-Albani', grade: '-' }]).decision).toBe('review');
    expect(decideByRuleB('abudawud', [{ by: 'Al-Albani', grade: 'Sahih Maqtu' }]).decision).toBe('review');
  });
});

describe('gradeLabelAr', () => {
  it('labels the common accepted grades and leaves the rest to a person', () => {
    expect(gradeLabelAr('Sahih')).toBe('صحيح');
    expect(gradeLabelAr('Hasan Isnaad')).toBe('إسناده حسن');
    expect(gradeLabelAr('Hasan Sahih')).toBe('حسن صحيح');
    expect(gradeLabelAr('Sahih Muslim (1480)')).toBeNull();
  });
});

describe('decide (current scope)', () => {
  it('is al-Bukhari and Muslim only', () => {
    expect(CURRENT_SCOPE).toBe('sahihayn');
    expect(decide('bukhari', []).decision).toBe('include');
    expect(decide('muslim', []).decision).toBe('include');
  });

  it('defers every other collection, even a hadith al-Albani grades sahih', () => {
    const d = decide('abudawud', [{ by: 'Al-Albani', grade: 'Sahih' }]);
    expect(d.decision).toBe('defer');
  });

  it('applies option B when asked for it', () => {
    expect(decide('abudawud', [{ by: 'Al-Albani', grade: 'Sahih' }], 'ruleB').decision).toBe('include');
  });
});
