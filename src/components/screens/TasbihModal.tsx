import React, { useState } from 'react';
import { X, RotateCcw, Sparkles } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { toArabicNumerals } from '../../lib/arabic';
import { dailyDhikrs } from '../../data/dhikr';

interface TasbihModalProps {
  onClose: () => void;
  tasbihCount: number;
  onIncrementTasbih: () => void;
  onResetTasbih: () => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
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
  triggerHaptic
}) => {
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(DHIKR_PRESETS[0]);

  // Today's dhikr card with virtue
  const todayDhikr = dailyDhikrs[0];

  const handleTap = () => {
    setSessionCount(c => {
      const next = c + 1;
      if (next % 33 === 0) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-md bg-[#15152A] border border-[#2E2E4A] rounded-3xl p-6 shadow-2xl flex flex-col items-center max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-[#2E2E4A]/80">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1E1E38] text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>

          <h2 className="text-base sm:text-lg font-serif font-bold text-[#EDEDF5]">
            المسبحة
          </h2>

          <button
            onClick={handleResetSession}
            className="w-9 h-9 rounded-full bg-[#1E1E38] text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors"
            title="تصفير الجلسة"
            aria-label="تصفير الجلسة"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Dhikr selection chips */}
        <div className="w-full py-4 overflow-x-auto no-scrollbar flex items-center gap-2">
          {DHIKR_PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDhikr(d)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
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
        <div className="text-center my-3 min-h-[44px]">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#EDEDF5] tracking-wide">
            {selectedDhikr}
          </h3>
        </div>

        {/* Big Tap Circle */}
        <div className="my-6">
          <button
            onClick={handleTap}
            id="btn-tasbih-tap"
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#1E1E38] to-[#17172E] border-4 border-[#C8A951]/40 hover:border-[#C8A951] active:scale-95 shadow-[0_0_35px_rgba(200,169,81,0.2)] flex flex-col items-center justify-center transition-all cursor-pointer select-none group"
            aria-label="اضغط للتسبيح"
          >
            <span className="text-5xl sm:text-6xl font-bold font-mono text-[#E4C368] tracking-wider group-active:scale-105 transition-transform">
              {toArabicNumerals(sessionCount)}
            </span>
            <span className="text-xs text-[#AEAECB] mt-2 font-medium">
              اضغط للذكر
            </span>
          </button>
        </div>

        {/* Counters & Virtue card */}
        <div className="w-full space-y-4 pt-2">
          <div className="flex items-center justify-around text-center py-2 px-4 rounded-xl bg-[#1E1E38]/80 border border-[#2E2E4A]">
            <div>
              <span className="text-xs text-[#AEAECB] block">في هذه الجلسة</span>
              <span className="text-sm font-bold text-[#EDEDF5]">{toArabicNumerals(sessionCount)}</span>
            </div>
            <div className="w-[1px] h-8 bg-[#2E2E4A]" />
            <div>
              <span className="text-xs text-[#AEAECB] block">إجمالي الذكر</span>
              <span className="text-sm font-bold text-[#E4C368]">{toArabicNumerals(tasbihCount)}</span>
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
      </div>
    </div>
  );
};
