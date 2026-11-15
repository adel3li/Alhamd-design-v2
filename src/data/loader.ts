import blessingsRaw from './blessings_ar.json';
import { BlessingsData, Blessing } from '../types';

/**
 * When on, only blessings a reviewer has approved are served.
 *
 * It stays off until the scholarly review is done: today no blessing is
 * approved, so turning it on would ship an empty app. While it is off, the UI
 * marks every unapproved text as under review (see `isApproved`) and no copy
 * may claim the content has been reviewed.
 *
 * Launch step: set VITE_CONTENT_REVIEW_GATE=true once the review is signed.
 */
export const CONTENT_REVIEW_GATE = import.meta.env.VITE_CONTENT_REVIEW_GATE === 'true';

const data = blessingsRaw as unknown as BlessingsData;

/** True only when a named reviewer has approved this blessing's texts. */
export const isApproved = (blessing: Pick<Blessing, 'reviewStatus'>): boolean =>
  blessing.reviewStatus === 'approved';

export const getAllBlessings = (): Blessing[] => {
  if (CONTENT_REVIEW_GATE) {
    return data.blessings.filter(isApproved);
  }
  return data.blessings;
};

export const getBlessingById = (id: string): Blessing | undefined => {
  return data.blessings.find(b => b.id === id);
};

/** Counts for the «عن المحتوى والتوثيق» sheet, read from the data rather than typed in. */
export const getReviewSummary = (): { total: number; approved: number } => ({
  total: data.blessings.length,
  approved: data.blessings.filter(isApproved).length,
});
