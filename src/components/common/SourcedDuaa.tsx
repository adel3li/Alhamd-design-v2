import React from 'react';
import { SourcedDuaa as SourcedDuaaData } from '../../types';
import { toArabicNumerals } from '../../lib/arabic';

/**
 * A supplication taken verbatim from the Qur'an or a hadith collection,
 * shown beside the blessing's own short duaa on the praise step.
 */
export const SourcedDuaa: React.FC<{ duaa: SourcedDuaaData | null | undefined }> = ({ duaa }) => {
  if (!duaa || !duaa.text) return null;
  const isQuran = duaa.source === 'القرآن الكريم';
  return (
    <div className="mt-3 p-5 sm:p-6 rounded-2xl bg-[#1E1E38]/90 border border-[#C8A951]/30 space-y-2 shadow-lg animate-fade-in">
      <span className="text-sm font-bold text-[#E4C368] block">
        {isQuran ? 'ومن دعاء القرآن:' : 'ومن الدعاء المأثور:'}
      </span>
      {isQuran ? (
        <p className="font-quran ayah-text text-xl sm:text-2xl leading-[2.15] text-[#E4C368]">
          ﴿{duaa.text}﴾
        </p>
      ) : (
        <p className="font-serif text-[#EDEDF5] text-xl sm:text-2xl leading-[2.0]">«{duaa.text}»</p>
      )}
      <span className="block text-xs text-[#AEAECB]">
        {isQuran
          ? `سورة ${toArabicNumerals(duaa.reference)}`
          : `${duaa.source}: ${toArabicNumerals(duaa.reference)}`}
      </span>
    </div>
  );
};
