import React, { useState, useMemo } from 'react';
import { useStore } from '../StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Heart } from 'lucide-react';
import { haptics } from '../services/haptics';
import { DailyDhikrCard } from './DailyDhikrCard';
import { dailyDhikrs } from '../data/dhikr';
import { getDayOfYear } from '../utils';

const TASBIH_OPTIONS = [
  "الحمد لله",
  "سبحان الله",
  "الله أكبر",
  "لا إله إلا الله",
  "أستغفر الله",
  "لا حول ولا قوة إلا بالله",
  "اللهم صلِّ على محمد"
];

export const TasbihView: React.FC = () => {
  const { state, updateSettings } = useStore();
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(TASBIH_OPTIONS[0]);
  const [now] = useState(() => new Date());

  const todayDhikr = useMemo(() => {
    return dailyDhikrs[getDayOfYear(now) % dailyDhikrs.length];
  }, [now]);

  const handleTap = () => {
    setSessionCount(prev => prev + 1);
    updateSettings({ tasbihCount: (state.tasbihCount || 0) + 1 });
    // Light vibration on every tap
    if (state.hapticReminders || true) {
      if ((sessionCount + 1) % 33 === 0) {
        haptics.impact('heavy');
      } else {
        haptics.impact('light');
      }
    }
  };

  const handleReset = () => {
    setSessionCount(0);
    haptics.impact('heavy');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-24 relative max-w-md mx-auto w-full">
      <div className="px-6 pt-6 pb-2 z-10 text-center">
        <h1 className="text-2xl font-bold font-sans">مسبحة الحمد</h1>
        <p className="text-sm text-brand-textSecondary dark:text-brand-dark-textSecondary mt-1 mb-6">
          إجمالي الحمد: {state.tasbihCount.toLocaleString('ar-EG')}
        </p>
        
        <DailyDhikrCard dhikr={todayDhikr} />

        <div className="w-[calc(100%+3rem)] overflow-x-auto pb-2 pt-2 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex gap-2" dir="rtl">
          {TASBIH_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => {
                if (selectedDhikr !== option) {
                  setSelectedDhikr(option);
                  setSessionCount(0);
                  haptics.impact('light');
                }
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                selectedDhikr === option 
                  ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                  : 'bg-brand-surface dark:bg-brand-dark-surface border-brand-textPrimary/10 text-brand-textSecondary hover:bg-brand-textPrimary/5'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative px-6 pb-6 pt-2 shrink-0">
        <div className="relative flex items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTap}
            className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-brand-surface dark:bg-brand-dark-surface shadow-[0_0_40px_rgba(0,0,0,0.05)] border-4 border-brand-primary/20 flex flex-col items-center justify-center relative z-20 outline-none"
          >
            <span className="text-5xl md:text-6xl font-bold text-brand-primary dark:text-brand-dark-primary tabular-nums">
              {sessionCount.toLocaleString('ar-EG')}
            </span>
            <span className="text-sm font-medium text-brand-textSecondary mt-2">
              {selectedDhikr}
            </span>
          </motion.button>
          
          {/* Decorative background ripples */}
          <div className="absolute inset-0 bg-brand-primary/5 rounded-full blur-2xl scale-150 -z-10"></div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="mt-12 w-12 h-12 rounded-full bg-brand-textPrimary/5 dark:bg-brand-dark-textPrimary/5 text-brand-textPrimary dark:text-brand-dark-textPrimary flex items-center justify-center transition-colors hover:bg-brand-textPrimary/10 border border-brand-textPrimary/10"
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};
