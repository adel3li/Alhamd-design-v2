import React, { useMemo, useState, useEffect } from "react";
import { useStore } from "../StoreContext";
import { toEasternArabicNumerals } from "../utils";
import { motion, AnimatePresence } from "motion/react";
import { Award } from "lucide-react";
import { haptics } from "../services/haptics";

const MILESTONES = [3, 7, 14, 21, 30, 60, 90, 100, 365];

const calculateStreak = (completedReflections: string[]) => {
    const sortedDates = Array.from(new Set(completedReflections)).sort((a, b) => b.localeCompare(a));
    if (sortedDates.length === 0) return 0;
  
    let currentStreak = 0;
    let d = new Date();
    
    const getLocalDateStr = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
  
    let index = 0;
    let dateStr = getLocalDateStr(d);
    
    if (sortedDates[0] === dateStr) {
      currentStreak++;
      index++;
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 1);
      let dateStrYest = getLocalDateStr(d);
      if (sortedDates[0] === dateStrYest) {
        // continues
      } else {
        return 0; 
      }
    }
  
    while (index < sortedDates.length) {
      let checkStr = getLocalDateStr(d);
      if (sortedDates[index] === checkStr) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
        index++;
      } else if (sortedDates[index] > checkStr) {
        index++;
      } else {
        break;
      }
    }
    return currentStreak;
};

export const ConsistencyView: React.FC = () => {
    const { state } = useStore();
    const completedSet = new Set(state.completedReflections);
    
    const streak = useMemo(() => calculateStreak(state.completedReflections), [state.completedReflections]);
    const [showMilestone, setShowMilestone] = useState(false);

    useEffect(() => {
        if (streak > 0 && MILESTONES.includes(streak)) {
            const lastShown = localStorage.getItem('alhamd_milestone_shown');
            if (lastShown !== streak.toString()) {
                setShowMilestone(true);
                localStorage.setItem('alhamd_milestone_shown', streak.toString());
                haptics.success();
            }
        }
    }, [streak]);
    
    const { monthDays, currentMonthName, completedCount } = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);

        const getHijriInfo = (d: Date) => {
            const enFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' });
            const arFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { month: 'long' });
            const enParts = enFormatter.formatToParts(d);
            
            const dayText = enParts.find(p => p.type === 'day')?.value || '1';
            const monthText = enParts.find(p => p.type === 'month')?.value || '1';
            const yearText = enParts.find(p => p.type === 'year')?.value || '1';
            
            const day = parseInt(dayText, 10);
            const monthId = `${yearText}-${monthText}`;
            const arMonthName = arFormatter.formatToParts(d).find(p => p.type === 'month')?.value || '';
            
            return { day, monthId, arMonthName };
        };

        const currentInfo = getHijriInfo(today);
        
        // Find start of current Hijri month
        let startOfMonth = new Date(today);
        startOfMonth.setDate(startOfMonth.getDate() - (currentInfo.day - 1));
        
        // Failsafe: if the calculation is off due to calendar differences, step backward/forward
        while(getHijriInfo(startOfMonth).monthId !== currentInfo.monthId) {
             startOfMonth.setDate(startOfMonth.getDate() + 1);
        }
        let testPrev = new Date(startOfMonth);
        testPrev.setDate(testPrev.getDate() - 1);
        while(getHijriInfo(testPrev).monthId === currentInfo.monthId) {
             startOfMonth.setDate(startOfMonth.getDate() - 1);
             testPrev.setDate(testPrev.getDate() - 1);
        }

        const mDays = [];
        let cCount = 0;

        for (let i = 0; i < 30; i++) {
            const d = new Date(startOfMonth);
            d.setDate(d.getDate() + i);
            
            const info = getHijriInfo(d);
            if (info.monthId !== currentInfo.monthId) break; 
            
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const isCompleted = completedSet.has(dateStr);
            if (isCompleted) cCount++;
            
            mDays.push({
                dateStr,
                hijriDay: info.day,
                isToday: d.getTime() === today.getTime(),
                isCompleted
            });
        }

        return { monthDays: mDays, currentMonthName: currentInfo.arMonthName, completedCount: cCount };
    }, [completedSet]);

    return (
        <div className="p-6 min-h-full overflow-y-auto pb-24 flex flex-col max-w-md mx-auto w-full">
            <div className="text-center mb-8 px-4 mt-6">
                <h3 className="text-2xl font-bold mb-3">سجل المداومة</h3>
                <p className="text-brand-textSecondary dark:text-brand-dark-textSecondary text-sm leading-relaxed max-w-[240px] mx-auto">
                    هذه صفحتُك مع نفسك… لا سِباقَ مع أحد
                </p>
            </div>

            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center bg-brand-surface dark:bg-brand-dark-surface border border-brand-textPrimary/10 px-6 py-3 rounded-full shadow-sm">
                    <p className="text-[15px] font-medium text-brand-textPrimary dark:text-brand-dark-textPrimary">
                        أتممتَ <span className="font-bold text-brand-primary">{toEasternArabicNumerals(completedCount)}</span> يومًا من {currentMonthName}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-2 bg-brand-background dark:bg-brand-dark-background/50 p-6 rounded-[2rem] border border-brand-textPrimary/5 text-center mt-2" dir="rtl">
                {monthDays.map((dayObj, i) => {
                    return (
                        <div 
                           key={dayObj.dateStr} 
                           className={`aspect-square w-10 h-10 mx-auto rounded-full flex items-center justify-center text-[15px] font-sans transition-all duration-300
                               ${dayObj.isCompleted 
                                 ? 'bg-brand-success text-white shadow-sm font-bold' 
                                 : 'bg-brand-surface dark:bg-brand-dark-surface text-brand-textSecondary border shadow-sm'} 
                               ${dayObj.isToday ? 'ring-2 ring-offset-2 ring-offset-brand-background dark:ring-offset-[#1E1E1E] ring-amber-400' : 'border-brand-textPrimary/5'}`}
                        >
                            {toEasternArabicNumerals(dayObj.hijriDay)}
                        </div>
                    )
                })}
            </div>

            <AnimatePresence>
                {showMilestone && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowMilestone(false)}
                        dir="rtl"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 20, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="bg-brand-surface dark:bg-brand-dark-surface p-8 rounded-[2rem] shadow-2xl border border-brand-accent/20 flex flex-col items-center text-center max-w-sm w-full relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand-accent/10 to-transparent pointer-events-none" />
                            
                            <motion.div 
                                initial={{ rotate: -180, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", delay: 0.2, bounce: 0.6 }}
                                className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center shadow-lg relative z-10"
                            >
                                <Award className="w-12 h-12 text-[#0a0c0f]" />
                            </motion.div>
                            
                            <h2 className="text-2xl font-bold mb-3 text-brand-textPrimary dark:text-brand-dark-textPrimary">
                                ما شاء الله!
                            </h2>
                            <p className="text-[17px] text-brand-textSecondary dark:text-brand-dark-textSecondary leading-relaxed mb-8 font-medium">
                                لقد أتممت <span className="font-bold text-[#d4af37] mx-1">{toEasternArabicNumerals(streak)}</span> أيام متتالية من المداومة على الحمد.
                            </p>
                            
                            <button
                                onClick={() => setShowMilestone(false)}
                                className="w-full py-3.5 rounded-xl bg-brand-textPrimary/5 hover:bg-brand-textPrimary/10 dark:bg-brand-dark-textPrimary/5 dark:hover:bg-brand-dark-textPrimary/10 text-brand-textPrimary dark:text-brand-dark-textPrimary font-bold transition-colors"
                            >
                                متابعة
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
