export interface CategoryDef {
  key: string;
  label: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'deen', label: 'نعم الدين' },
  { key: 'nafs', label: 'نعم الحياة والنفس' },
  { key: 'nasl', label: 'نعم الأهل' },
  { key: 'rizq', label: 'نعم الرزق' },
  { key: 'afiyah', label: 'نعم العافية' },
  { key: 'aql', label: 'نعم العقل' },
  { key: 'amn', label: 'نعم الأمن' },
  { key: 'mal', label: 'نعم المال' }
];

export function mapOldCategoryToCanonical(oldCategory?: string): string {
  if (!oldCategory) return 'نعم الدين';
  if (oldCategory.includes('الدين')) return 'نعم الدين';
  if (oldCategory.includes('النفس') || oldCategory.includes('الحياة')) return 'نعم الحياة والنفس';
  if (oldCategory.includes('النسل') || oldCategory.includes('الأهل')) return 'نعم الأهل';
  if (oldCategory.includes('المال')) return 'نعم المال';
  if (oldCategory.includes('العقل')) return 'نعم العقل';
  if (oldCategory.includes('العافية')) return 'نعم العافية';
  if (oldCategory.includes('الأمن')) return 'نعم الأمن';
  if (oldCategory.includes('الرزق')) return 'نعم الرزق';
  return 'نعم الحياة والنفس';
}
