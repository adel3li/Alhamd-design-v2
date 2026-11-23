/**
 * Which hadith may enter the app.
 *
 * Current scope (00-decisions.md §5): al-Bukhari and Muslim only. Every other
 * collection is deferred, whatever its grading. `decide()` applies the scope.
 *
 * Kept for when the scope widens: option B, applied to the gradings
 * sunnah.com records for each hadith (as copied by scripts/fetch-hadith.ts
 * from the open hadith-api dataset):
 *
 * - In al-Bukhari or Muslim: include.
 * - Otherwise al-Albani's grading decides, unless one of the dissent graders
 *   (Shu'ayb al-Arna'ut, Ahmad Shakir, Bashar Awad Ma'ruf) grades it weak:
 *   then the scholarly reviewer decides.
 * - No grading from al-Albani, a grading that is not a prophetic attribution
 *   (mawquf, maqtu', mursal), or a wording this module does not know: the
 *   reviewer decides.
 *
 * This module only reads grade labels. It contains no hadith text.
 */

export type GradeClass = 'accepted' | 'weak' | 'not_marfu' | 'unknown';

export interface Grading {
  /** Grader as sunnah.com names them, e.g. "Al-Albani". */
  by: string;
  /** Grade as sunnah.com writes it, e.g. "Sahih", "Isnaad Hasan", "Daif". */
  grade: string;
}

export type DecisionKind = 'include' | 'review' | 'exclude' | 'defer';

/** 'sahihayn': al-Bukhari and Muslim only (current). 'ruleB': option B over the sunan as well. */
export type Scope = 'sahihayn' | 'ruleB';
export const CURRENT_SCOPE: Scope = 'sahihayn';

export interface Decision {
  decision: DecisionKind;
  /** Why, in Arabic, for the verification report. */
  reason: string;
}

export const SAHIHAYN = new Set(['bukhari', 'muslim']);
export const PRIMARY_GRADER = 'Al-Albani';
export const DISSENT_GRADERS = ['Shuaib Al Arnaut', 'Ahmad Muhammad Shakir', 'Bashar Awad Maarouf'];

export const GRADER_NAMES_AR: Record<string, string> = {
  'Al-Albani': 'الألباني',
  'Shuaib Al Arnaut': 'شعيب الأرنؤوط',
  'Ahmad Muhammad Shakir': 'أحمد شاكر',
  'Bashar Awad Maarouf': 'بشار عواد معروف',
  'Zubair Ali Zai': 'زبير علي زئي',
  'Muhammad Muhyi Al-Din Abdul Hamid': 'محمد محيي الدين عبد الحميد',
  'Muhammad Fouad Abd al-Baqi': 'محمد فؤاد عبد الباقي',
  'Abu Ghuddah': 'عبد الفتاح أبو غدة',
};

const WEAK = /\b(daif|da'if|mawdu|maudu|munkar|shadh|batil)\b/i;
const NOT_MARFU = /\b(muquf|mauquf|mawquf|maqtu|mursal)\b/i;
const ACCEPTED = /\b(sahih|hasan)\b/i;

/** Sorts one grade label. Weak wins over anything else in the same label. */
export function classifyGrade(grade: string): GradeClass {
  const g = grade.trim();
  if (WEAK.test(g)) return 'weak';
  if (NOT_MARFU.test(g)) return 'not_marfu';
  if (ACCEPTED.test(g)) return 'accepted';
  return 'unknown';
}

const LABELS_AR: Array<[RegExp, string]> = [
  [/^hasan sahih$/i, 'حسن صحيح'],
  [/^(isnaad sahih|sahih isnaad)$/i, 'إسناده صحيح'],
  [/^(isnaad hasan|hasan isnaad)$/i, 'إسناده حسن'],
  [/^sahih lighairihi$/i, 'صحيح لغيره'],
  [/^hasan lighairihi$/i, 'حسن لغيره'],
  [/^sahih$/i, 'صحيح'],
  [/^hasan$/i, 'حسن'],
];

/** Arabic label for the common accepted grades, or null when a person should word it. */
export function gradeLabelAr(grade: string): string | null {
  const g = grade.trim();
  for (const [pattern, label] of LABELS_AR) if (pattern.test(g)) return label;
  return null;
}

export function decideByRuleB(collection: string, gradings: readonly Grading[]): Decision {
  if (SAHIHAYN.has(collection)) {
    return { decision: 'include', reason: 'في الصحيحين' };
  }
  const primary = gradings.find((g) => g.by === PRIMARY_GRADER);
  if (!primary) {
    return { decision: 'review', reason: 'لا حكم للألباني في المصدر' };
  }
  const primaryClass = classifyGrade(primary.grade);
  if (primaryClass === 'weak') {
    return { decision: 'exclude', reason: 'ضعّفه الألباني' };
  }
  if (primaryClass !== 'accepted') {
    return { decision: 'review', reason: `حكم الألباني يحتاج نظرًا: ${primary.grade}` };
  }
  const dissent = gradings.filter((g) => DISSENT_GRADERS.includes(g.by) && classifyGrade(g.grade) === 'weak');
  if (dissent.length > 0) {
    const who = dissent.map((g) => GRADER_NAMES_AR[g.by] ?? g.by).join('، ');
    return { decision: 'review', reason: `صححه الألباني وضعّفه ${who}` };
  }
  const notMarfu = gradings.some((g) => DISSENT_GRADERS.includes(g.by) && classifyGrade(g.grade) === 'not_marfu');
  if (notMarfu) {
    return { decision: 'review', reason: 'أحد المحققين جعله موقوفًا أو مقطوعًا أو مرسلًا' };
  }
  return { decision: 'include', reason: 'صححه أو حسّنه الألباني، ولم يضعّفه أحد من المحققين المعتبرين في القاعدة' };
}

/** The decision under the current scope, or under the scope given. */
export function decide(collection: string, gradings: readonly Grading[], scope: Scope = CURRENT_SCOPE): Decision {
  if (scope === 'sahihayn') {
    return SAHIHAYN.has(collection)
      ? { decision: 'include', reason: 'في الصحيحين' }
      : { decision: 'defer', reason: 'خارج الصحيحين: مؤجل بقرار صاحب المشروع' };
  }
  return decideByRuleB(collection, gradings);
}
