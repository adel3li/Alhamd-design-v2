import React, { useState } from 'react';
import { X, RotateCcw, Sparkles } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { toArabicNumerals } from '../../lib/arabic';
import { dailyDhikrs } from '../../data/dhikr';

interface TasbihModalProps {
  onClose?: () => void;
  tasbihCount: number;
  onIncrementTasbih: () => void;
  onResetTasbih: () => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
  inline?: boolean;
}

const DHIKR_PRESETS = [
  'الْحَمْدُ لِلَّهِ',
  'سُبْحَانَ اللَّهِ',
  'اللَّهُ أَكْبَرُ',
  'لا إِلَهَ إِلا اللَّهُ',
  'أَسْتَغْفِرُ اللَّهَ',
  'لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ',
  'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ'
];

export const TasbihModal: React.FC<TasbihModalProps> = ({
  onClose,
  tasbihCount,
  onIncrementTasbih,
  onResetTasbih,
  triggerHaptic,
  inline = false
}) => {
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(DHIKR_PRESETS[0]);

  // Today's dhikr card with virtue
  const todayDhikr = dailyDhikrs[0];

  const handleTap = () => {
    setSessionCount(c => {
      const next = c + 1;
      if (next % 100 === 0) {
        triggerHaptic('heavy');
      } else {
        triggerHaptic('light');
      }
      return next;
    });
    onIncrementTasbih();
  };

  const handleResetSession = () => {
    setSessionCount(0);
    triggerHaptic('medium');
  };

  const innerContent = (
    <>
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-[#2E2E4A]/80">
        {inline ? (
          <div className="text-right space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5]">
              المسبحة
            </h1>
            <p className="text-xs sm:text-sm text-[#AEAECB]">
              أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#1E1E38] text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>

            <h2 className="text-base sm:text-lg font-serif font-bold text-[#EDEDF5]">
              المسبحة
            </h2>
          </>
        )}

        <button
          onClick={handleResetSession}
          className="h-9 px-3 rounded-full bg-[#1E1E38] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
          title="تصفير الجلسة"
          aria-label="تصفير الجلسة"
        >
          <RotateCcw size={15} />
          {inline && <span>تصفير الجلسة</span>}
        </button>
      </div>

      {/* Dhikr selection chips */}
      <div className="w-full py-4 overflow-x-auto no-scrollbar flex items-center gap-2">
        {DHIKR_PRESETS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDhikr(d)}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
              selectedDhikr === d
                ? 'bg-[#E4C368] text-[#15152A] font-bold shadow-md'
                : 'bg-[#1E1E38] text-[#AEAECB] hover:text-white border border-[#2E2E4A]'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Selected Dhikr Display */}
      <div className="text-center my-2 min-h-[44px] flex items-center justify-center">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#EDEDF5] tracking-wide">
          {selectedDhikr}
        </h3>
      </div>

      {/* Big Tap Circle */}
      <div className="my-5 flex justify-center">
        <button
          type="button"
          onClick={handleTap}
          id="btn-tasbih-tap"
          style={{
            backgroundColor: 'var(--bg-raised)',
            boxShadow: 'var(--raised-shadow)',
          }}
          className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full active:scale-95 flex flex-col items-center justify-center transition-all cursor-pointer select-none group"
          aria-label="اضغط للتسبيح"
        >
          {/* SVG Progress Ring (0 = empty, 100 = complete, 101 = starts again) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="var(--border-hairline)"
              strokeWidth="5"
            />
            {sessionCount > 0 && (
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="var(--accent-stroke)"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 92}
                strokeDashoffset={
                  2 * Math.PI * 92 * (1 - ((sessionCount % 100) === 0 ? 100 : (sessionCount % 100)) / 100)
                }
                className="transition-all duration-300 ease-out"
              />
            )}
          </svg>

          <span
            className="relative z-10 text-5xl sm:text-6xl font-bold tracking-wider group-active:scale-105 transition-transform"
            style={{ color: 'var(--text-primary)' }}
          >
            {toArabicNumerals(sessionCount)}
          </span>
          <span
            className="relative z-10 text-xs mt-2 font-semibold"
            style={{ color: 'var(--accent-text)' }}
          >
            اضغط للذكر
          </span>
        </button>
      </div>

      {/* Counters & Virtue card */}
      <div className="w-full space-y-4 pt-2">
        <div className="flex items-center justify-around text-center py-3 px-4 rounded-2xl bg-[#1E1E38]/80 border border-[#2E2E4A]">
          <div>
            <span className="text-xs text-[#AEAECB] block">في هذه الجلسة</span>
            <span className="text-base font-bold text-[#EDEDF5]">{toArabicNumerals(sessionCount)}</span>
          </div>
          <div className="w-[1px] h-8 bg-[#2E2E4A]" />
          <div>
            <span className="text-xs text-[#AEAECB] block">إجمالي الذكر</span>
            <span className="text-base font-bold text-[#E4C368]">{toArabicNumerals(tasbihCount)}</span>
          </div>
        </div>

        {/* Daily Dhikr with Virtue */}
        {todayDhikr && (
          <GlassCard padding="p-4" className="text-right space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#C8A951] font-semibold mb-1">
              <Sparkles size={14} />
              <span>فضل الذكر</span>
            </div>
            <p className="font-serif text-xs sm:text-sm text-[#EDEDF5]">
              {todayDhikr.text}
            </p>
            {todayDhikr.virtue && (
              <p className="text-[11px] text-[#AEAECB] leading-relaxed">
                {todayDhikr.virtue}
              </p>
            )}
          </GlassCard>
        )}
      </div>
    </>
  );

  if (inline) {
    return (
      <div className="w-full pb-28 pt-4 px-4 sm:px-6 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto flex flex-col items-center animate-fade-in" dir="rtl">
        {innerContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-md bg-[#15152A] border border-[#2E2E4A] rounded-3xl p-6 shadow-2xl flex flex-col items-center max-h-[92vh] overflow-y-auto">
        {innerContent}
      </div>
    </div>
  );
};
