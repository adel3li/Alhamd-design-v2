import blessingsRaw from './blessings_ar.json';
import { BlessingsData, Blessing } from '../types';

export const CONTENT_REVIEW_GATE = false;

const data = blessingsRaw as unknown as BlessingsData;

export const getAllBlessings = (): Blessing[] => {
  if (CONTENT_REVIEW_GATE) {
    return data.blessings.filter(b => b.reviewStatus === 'approved');
  }
  return data.blessings;
};
