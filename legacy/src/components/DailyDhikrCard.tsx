import React from 'react';
import { Dhikr } from '../data/dhikr';

export const DailyDhikrCard: React.FC<{ dhikr: Dhikr }> = ({ dhikr }) => {
    return (
        <div 
            className="mb-8 w-full shrink-0 flex flex-col py-4 bg-gradient-to-tr from-brand-surface to-brand-quranBg/30 dark:from-brand-dark-surface dark:to-brand-dark-quranBg/30 rounded-[24px] shadow-sm border border-brand-textPrimary/10 px-4 relative"
        >
            <div className="w-full flex justify-between items-center mb-3 text-right" dir="rtl">
                <div className="flex items-center gap-2 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                    <span className="text-xs font-bold text-brand-textSecondary dark:text-brand-dark-textSecondary whitespace-nowrap">
                        ذكر اليوم
                    </span>
                </div>
            </div>

            <div className="w-full relative z-10 flex flex-col justify-center px-2">
                <p 
                    className="font-amiri text-[22px] md:text-[24px] leading-[2.2] text-brand-primary dark:text-brand-dark-primary opacity-90 text-center w-full pb-2" 
                    dir="rtl"
                >
                    {dhikr.text}
                </p>
                {dhikr.virtue && (
                    <p className="text-[12px] text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80 font-sans text-center mt-1 pb-1">
                        {dhikr.virtue}
                    </p>
                )}
            </div>
        </div>
    );
};
