import React from 'react';
import { Affirmation } from '../data/affirmations';

export const DailyAffirmationCard: React.FC<{ affirmation: Affirmation }> = ({ affirmation }) => {
    return (
        <div 
            className="mb-8 w-full shrink-0 flex flex-col py-4 bg-gradient-to-tl from-brand-surface to-brand-accent/5 dark:from-brand-dark-surface dark:to-brand-dark-accent/5 rounded-[24px] shadow-sm border border-brand-textPrimary/10 px-4 relative"
        >
            <div className="w-full flex justify-between items-center mb-3 text-right" dir="rtl">
                <div className="flex items-center gap-2 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                    <span className="text-xs font-bold text-brand-textSecondary dark:text-brand-dark-textSecondary whitespace-nowrap">
                        رسالة طمأنينة
                    </span>
                </div>
            </div>

            <div className="w-full relative z-10 flex flex-col justify-center px-2">
                <p 
                    className="font-amiri text-[20px] md:text-[22px] leading-[2.2] text-brand-textPrimary dark:text-brand-dark-textPrimary opacity-90 text-center w-full pb-2" 
                    dir="rtl"
                >
                    {affirmation.text}
                </p>
                {affirmation.context && (
                    <p className="text-[12px] text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80 font-sans text-center mt-1 pb-1">
                        {affirmation.context}
                    </p>
                )}
            </div>
        </div>
    );
};
