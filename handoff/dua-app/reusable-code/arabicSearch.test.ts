import { describe, expect, it } from 'vitest';
import { matchesQuery, normalizeArabic, splitSentences } from './arabicSearch';

describe('normalizeArabic', () => {
  it('removes vowel marks, shadda, sukun and tanween', () => {
    expect(normalizeArabic('كَتَبَ الطَّالِبُ رِسَالَةً')).toBe('كتب الطالب رساله');
  });

  it('folds alef forms, hamza seats, alef maqsura and ta marbuta', () => {
    expect(normalizeArabic('إِبْرَاهِيمُ')).toBe('ابراهيم');
    expect(normalizeArabic('أَحْمَد آمَنَ')).toBe('احمد امن');
    expect(normalizeArabic('مَسْؤُول بِئْر')).toBe('مسوول بير');
    expect(normalizeArabic('مُوسَى')).toBe(normalizeArabic('موسي'));
    expect(normalizeArabic('رحمة')).toBe(normalizeArabic('رحمه'));
  });

  it('removes the dagger alef and tatweel', () => {
    expect(normalizeArabic('هَٰذَا')).toBe('هذا');
    expect(normalizeArabic('الحـــمد')).toBe('الحمد');
  });

  it('turns punctuation into single spaces', () => {
    expect(normalizeArabic('«سلامٌ»،   عليكم!')).toBe('سلام عليكم');
  });
});

describe('matchesQuery', () => {
  it('matches every word regardless of marks and order', () => {
    expect(matchesQuery('كَتَبَ الطَّالِبُ رِسَالَةً طَوِيلَةً', 'رساله الطالب')).toBe(true);
    expect(matchesQuery('كَتَبَ الطَّالِبُ رِسَالَةً', 'الطالبة')).toBe(false);
  });

  it('matches everything for an empty query', () => {
    expect(matchesQuery('أي نص', '   ')).toBe(true);
  });
});

describe('splitSentences', () => {
  it('splits after punctuation followed by whitespace and keeps the punctuation', () => {
    expect(splitSentences('اهدأ… وتذكّر. ثم عُد، الباب مفتوح؟ نعم! تمّ؛ انتهى')).toEqual([
      'اهدأ…',
      'وتذكّر.',
      'ثم عُد،',
      'الباب مفتوح؟',
      'نعم!',
      'تمّ؛',
      'انتهى',
    ]);
  });

  it('does not split punctuation inside a word or at the very end', () => {
    expect(splitSentences('١.٥ كيلو.')).toEqual(['١.٥ كيلو.']);
  });

  it('drops empty parts', () => {
    expect(splitSentences('  أولًا.   ')).toEqual(['أولًا.']);
    expect(splitSentences('')).toEqual([]);
  });
});
