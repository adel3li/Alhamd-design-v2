/**
 * Arabic text helpers for search and for paced reading.
 *
 * Alhamd's Hisn Al-Muslim search compared raw strings, so «الحمد» found one
 * item and the same word with its vowel marks found nine (finding U-10). Its
 * reflection screens split sentences with a regular-expression lookbehind,
 * which throws on Safari before 16.4 (finding B-09). Both are handled here.
 */

/**
 * Vowel marks, tanween, shadda, sukun, the superscript (dagger) alef, Qur'anic
 * annotation marks and the extended Arabic marks. Hamza and madda above or
 * below a letter are separated from it by NFD and removed with these.
 */
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣣ࣡-ࣿ]/g;
const TATWEEL = /ـ/g;

/**
 * Folds Arabic text to a form for comparison: no marks, no tatweel, one form
 * of alef, alef maqsura as ya, ta marbuta as ha, hamza seats as their bare
 * letter, punctuation as spaces, single spaces.
 *
 * Uthmani script spells some words differently from modern spelling (for
 * example a dagger alef where modern text writes a full alef), so search over
 * Qur'anic text should also index a modern-spelling copy of it.
 */
export function normalizeArabic(input: string): string {
  return input
    .normalize('NFD')
    .replace(MARKS, '')
    .replace(TATWEEL, '')
    .replace(/[آأإٱ-ٳٵ]/g, 'ا') // آ أ إ ٱ → ا
    .replace(/[ىی]/g, 'ي') // ى ی → ي
    .replace(/ة/g, 'ه') // ة → ه
    .replace(/ؤ/g, 'و') // ؤ → و
    .replace(/ئ/g, 'ي') // ئ → ي
    .replace(/ک/g, 'ك') // ک → ك
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when every word of the query appears in the text, ignoring marks and letter forms. */
export function matchesQuery(text: string, query: string): boolean {
  const words = normalizeArabic(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeArabic(text);
  return words.every((word) => haystack.includes(word));
}

/** Punctuation after which the paced reader may reveal the next part. */
const SENTENCE_END = /([.،؛؟!…])\s+/g;
const SPLIT_MARK = '\u0000';

/**
 * Splits text into the parts revealed one at a time in the guided flow: after
 * a full stop, Arabic comma, Arabic semicolon, question mark, exclamation mark
 * or ellipsis that is followed by whitespace. The punctuation stays with the
 * part before it. Equivalent to Alhamd's `split(/(?<=[.،؟!…])\s+/)` plus «؛»,
 * without a lookbehind.
 */
export function splitSentences(text: string): string[] {
  return text
    .replace(SENTENCE_END, `$1${SPLIT_MARK}`)
    .split(SPLIT_MARK)
    .map((part) => part.trim())
    .filter(Boolean);
}
