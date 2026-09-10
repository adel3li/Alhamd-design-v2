import React, { useState } from 'react';
import { Share2, ChevronDown, ChevronUp, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { Blessing, InspirationItem } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { getFormattedHijriDate } from '../../lib/hijri';
import { toArabicNumerals } from '../../lib/arabic';
import { ShareCardModal } from '../common/ShareCardModal';

interface HomeScreenProps {
  blessing: Blessing;
  inspiration: InspirationItem;
  isCompletedToday: boolean;
  tasbihCount: number;
  onStartReflection: () => void;
  onOpenTasbih: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  blessing,
  inspiration,
  isCompletedToday,
  tasbihCount,
  onStartReflection,
  onOpenTasbih
}) => {
  const [showTadabbur, setShowTadabbur] = useState(false);
  const [shareModalData, setShareModalData] = useState<{ open: boolean; type: 'ayah' | 'tadabbur' }>({
    open: false,
    type: 'ayah'
  });

  const hijriToday = getFormattedHijriDate();

  // Scholar name display rule from A4: only show if not generic starting with مستفاد / مأثور / إشارة
  const showScholarName = blessing.scholarQuote.scholar && 
    !['مستفاد', 'مأثور', 'إشارة'].some(prefix => blessing.scholarQuote.scholar.startsWith(prefix));

  return (
    <div className="w-full pb-28 pt-2 px-4 sm:px-6 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      {/* 1. Header Greeting + Hijri Date */}
      <div className="flex flex-col items-start px-1 space-y-1">
        <span className="text-sm font-medium text-[#AEAECB]">السلام عليكم</span>
        <h2 className="text-xl sm:text-2xl font-bold font-ibm text-[#EDEDF5]">
          {hijriToday}
        </h2>
      </div>

      {/* 2. «حديث اليوم» / «آية اليوم» Card (Matches ref-01-home.png) */}
      <GlassCard
        id="card-daily-inspiration"
        className="relative overflow-hidden group hover:border-[#E4C368]/30 transition-all duration-300"
        padding="p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E4C368] shadow-[0_0_6px_rgba(228,195,104,0.8)]" />
            <span className="text-xs sm:text-sm font-semibold text-[#E4C368]">
              {inspiration.type === 'hadith' ? 'حديث اليوم' : 'آية اليوم'}
            </span>
          </div>

          <button
            onClick={() => setShareModalData({ open: true, type: 'ayah' })}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-colors"
            title="مشاركة"
            aria-label="مشاركة حديث اليوم"
          >
            <Share2 size={15} />
          </button>
        </div>

        {/* Text with tashkeel */}
        <p className="font-serif text-[#E4C368] text-lg sm:text-xl md:text-2xl leading-[2.1] text-center px-2 font-medium">
          «{inspiration.text}»
        </p>

        <div className="mt-4 text-center">
          <span className="text-xs text-[#AEAECB] font-medium tracking-wide">
            {inspiration.source}
          </span>
        </div>
      </GlassCard>

      {/* 3. Divider with "نعمة اليوم" Badge */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#2E2E4A] to-transparent" />
        <span className="relative z-10 px-4 py-1 rounded-full text-xs font-medium text-[#AEAECB] bg-[#1E1E38] border border-[#2E2E4A]">
          نعمة اليوم
        </span>
      </div>

      {/* 4. Blessing of the Day Main Card (Matches ref-01-home.png) */}
      <div className="relative">
        {/* Subtle Spotlight Cone behind the blessing card */}
        <div
          className="absolute -top-12 inset-x-0 h-48 bg-gradient-to-b from-[#6C63FF]/15 via-[#6C63FF]/5 to-transparent blur-2xl pointer-events-none rounded-full"
          aria-hidden="true"
        />

        <GlassCard
          id="card-today-blessing"
          className="relative overflow-hidden flex flex-col items-center text-center pt-8 pb-7 px-6"
          borderAccent={true}
        >
          {/* Category Pill */}
          <div className="mb-5">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#EDEDF5] bg-[#25232E] border border-[#C8A951]/40 shadow-sm">
              {blessing.categoryLabel}
            </span>
          </div>

          {/* Blessing Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#EDEDF5] tracking-tight mb-3">
            {blessing.title}
          </h1>

          {/* Opening Line */}
          <p className="text-sm sm:text-base text-[#C7C4D8] leading-relaxed max-w-md mx-auto mb-6">
            {blessing.openingLine}
          </p>

          {/* Sacred Quran Ayah Block */}
          <div className="w-full bg-[#15152A]/80 border border-[#2E2E4A] rounded-2xl p-5 sm:p-6 mb-6 shadow-inner">
            <p className="font-serif text-[#E4C368] text-xl sm:text-2xl md:text-3xl leading-[2.2] font-semibold text-center">
              ﴿ {blessing.quran.textUthmani} ﴾
            </p>
            <div className="mt-3 text-center">
              <span className="text-xs text-[#AEAECB]">
                سورة {blessing.quran.surahName}: {toArabicNumerals(blessing.quran.ayahNumber)}
              </span>
            </div>
          </div>

          {/* Collapsible «تدبّر النعمة» (Tadabbur section) */}
          <div className="w-full border-t border-[#2E2E4A]/80 pt-4 mb-6">
            <button
              onClick={() => setShowTadabbur(!showTadabbur)}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-[#EDEDF5] hover:text-[#E4C368] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#C8A951]" />
                <span>تدبّر النعمة</span>
              </div>
              {showTadabbur ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showTadabbur && (
              <div className="mt-4 space-y-4 text-right animate-fade-in bg-black/20 p-4 rounded-xl border border-[#2E2E4A]/50">
                {/* Hadith */}
                {blessing.hadith && blessing.hadith.text && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#C8A951]">الحديث الشريف:</span>
                    <p className="font-serif text-sm text-[#EDEDF5] leading-relaxed">
                      «{blessing.hadith.text}»
                    </p>
                    <span className="text-[11px] text-[#AEAECB]">
                      {blessing.hadith.source} {blessing.hadith.grade ? `(${blessing.hadith.grade})` : ''}
                    </span>
                  </div>
                )}

                {/* Tadabbur Text */}
                {blessing.tadabbur && (
                  <div className="space-y-1 border-t border-[#2E2E4A]/40 pt-3">
                    <span className="text-xs font-semibold text-[#C8A951]">وقفات في أثر النعمة:</span>
                    <p className="text-xs sm:text-sm text-[#C7C4D8] leading-relaxed">
                      {blessing.tadabbur}
                    </p>
                  </div>
                )}

                {/* Scholar Quote */}
                {blessing.scholarQuote && blessing.scholarQuote.text && (
                  <div className="space-y-1 border-t border-[#2E2E4A]/40 pt-3">
                    <p className="text-xs text-[#C7C4D8] italic">
                      "{blessing.scholarQuote.text}"
                    </p>
                    {showScholarName && (
                      <span className="text-[11px] text-[#C8A951]">
                        — {blessing.scholarQuote.scholar} {blessing.scholarQuote.work ? `(${blessing.scholarQuote.work})` : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* Share Tadabbur Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShareModalData({ open: true, type: 'tadabbur' })}
                    className="flex items-center gap-1.5 text-xs text-[#AEAECB] hover:text-[#E4C368] transition-colors"
                  >
                    <Share2 size={13} />
                    <span>مشاركة التدبّر</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA Button: «استشعر النعمة» */}
          {isCompletedToday ? (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#1E1E38] border border-[#2E2E4A] text-[#E4C368] font-medium text-sm">
                <CheckCircle2 size={18} className="text-[#E4C368]" />
                <span>حمدتَ اللهَ اليوم على هذه النعمة</span>
              </div>
              <button
                onClick={onStartReflection}
                className="flex items-center gap-1.5 text-xs text-[#AEAECB] hover:text-[#EDEDF5] py-2 transition-colors"
              >
                <RotateCcw size={13} />
                <span>أعد الاستشعار</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-start-reflection"
              onClick={onStartReflection}
              className="w-full py-4 px-8 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-[#6C63FF]/25 transition-all duration-200"
            >
              استشعر النعمة
            </button>
          )}
        </GlassCard>
      </div>

      {/* 5. Small Calm Tasbih Card */}
      <GlassCard
        id="card-home-tasbih"
        onClick={onOpenTasbih}
        className="flex items-center justify-between p-4 cursor-pointer hover:border-[#C8A951]/40"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center text-[#6C63FF] font-serif font-bold text-lg">
            ح
          </div>
          <div className="text-right">
            <h4 className="text-sm font-semibold text-[#EDEDF5]">المسبحة</h4>
            <p className="text-xs text-[#AEAECB]">أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left">
            <span className="text-xs text-[#AEAECB] block">إجمالي الذكر</span>
            <span className="text-base font-bold text-[#E4C368]">{toArabicNumerals(tasbihCount)}</span>
          </div>
        </div>
      </GlassCard>

      {/* Share Modal */}
      {shareModalData.open && (
        <ShareCardModal
          blessing={blessing}
          type={shareModalData.type}
          onClose={() => setShareModalData({ open: false, type: 'ayah' })}
        />
      )}
    </div>
  );
};
