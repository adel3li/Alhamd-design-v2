import React, { useState } from 'react';
import { Share2, Copy, Check, ChevronDown, ChevronUp, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
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
  const [copiedBlessing, setCopiedBlessing] = useState(false);
  const [copiedInspiration, setCopiedInspiration] = useState(false);
  const [shareModalData, setShareModalData] = useState<{ open: boolean; type: 'ayah' | 'tadabbur' }>({
    open: false,
    type: 'ayah'
  });

  const hijriToday = getFormattedHijriDate();

  // Scholar name display rule from A4: only show if not generic starting with مستفاد / مأثور / إشارة
  const showScholarName = blessing.scholarQuote.scholar && 
    !['مستفاد', 'مأثور', 'إشارة'].some(prefix => blessing.scholarQuote.scholar.startsWith(prefix));

  const handleCopyBlessingText = async () => {
    const formatted = `«${blessing.title}»\n${blessing.openingLine}\n\n﴿${blessing.quran.textUthmani}﴾ [سورة ${blessing.quran.surahName} : ${toArabicNumerals(blessing.quran.ayahNumber)}]\n\n— تطبيق «الحمد»`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedBlessing(true);
      setTimeout(() => setCopiedBlessing(false), 2200);
    } catch {}
  };

  const handleCopyInspirationText = async () => {
    const formatted = `${inspiration.type === 'ayah' ? `﴿${inspiration.text}﴾` : `«${inspiration.text}»`}\n(${inspiration.source})\n— تطبيق «الحمد»`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedInspiration(true);
      setTimeout(() => setCopiedInspiration(false), 2200);
    } catch {}
  };

  return (
    <div className="w-full pb-28 pt-2 px-4 sm:px-6 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      {/* 1. Header Greeting + Hijri Date */}
      <div className="flex flex-col items-start px-1 space-y-1">
        <span className="text-sm font-medium text-[#AEAECB]">السلام عليكم</span>
        <h2 className="text-xl sm:text-2xl font-bold font-ibm text-[#EDEDF5]">
          {hijriToday}
        </h2>
      </div>

      {/* 2. «حديث اليوم» / «آية اليوم» Card */}
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

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyInspirationText}
              className="w-8 h-8 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-colors cursor-pointer"
              title="نسخ النص"
              aria-label="نسخ نص حديث اليوم"
            >
              {copiedInspiration ? <Check size={14} className="text-[#E4C368]" /> : <Copy size={14} />}
            </button>
            <button
              onClick={() => setShareModalData({ open: true, type: 'ayah' })}
              className="w-8 h-8 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-colors cursor-pointer"
              title="مشاركة كبطاقة"
              aria-label="مشاركة حديث اليوم"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* Text with tashkeel */}
        <p className={`text-lg sm:text-xl md:text-2xl leading-[2.1] text-center px-2 font-medium ${inspiration.type === 'ayah' ? 'font-quran ayah-text text-[#E4C368]' : 'font-serif text-[#EDEDF5]'}`}>
          {inspiration.type === 'ayah' ? `﴿${inspiration.text}﴾` : `«${inspiration.text}»`}
        </p>

        <div className="mt-4 text-center">
          <span className="text-xs text-[#AEAECB] font-medium tracking-wide">
            {inspiration.source}
          </span>
        </div>
      </GlassCard>

      {/* 3. Divider with "نعمة اليوم" Badge */}
      <div className="relative flex items-center justify-center my-6">
        <div
          className="absolute inset-x-0 h-[1px]"
          style={{ background: 'linear-gradient(to right, transparent, var(--border-hairline), transparent)' }}
        />
        <span className="relative z-10 px-4 py-1 rounded-full text-xs font-medium text-[#AEAECB] bg-[#1E1E38] border border-[#2E2E4A]">
          نعمة اليوم
        </span>
      </div>

      {/* 4. Blessing of the Day Main Card */}
      <div className="relative">
        {/* Ambient backdrop: Spotlight Cone in Layl, Two soft #E6DAC8 blobs in Nahar */}
        <div
          className="absolute -top-10 inset-x-6 h-44 blur-2xl pointer-events-none rounded-full opacity-60"
          style={{ backgroundColor: 'var(--bg-deepest)' }}
          aria-hidden="true"
        />

        <GlassCard
          id="card-today-blessing"
          className="relative overflow-hidden flex flex-col items-center text-center pt-7 pb-7 px-6"
          borderAccent={true}
        >
          {/* Top Bar of Blessing Card: Category Pill on Right + Copy & Share Actions on Left */}
          <div className="w-full flex items-center justify-between mb-5">
            <span
              className="px-4 py-1.5 rounded-full text-xs font-semibold border shadow-sm"
              style={{
                borderColor: 'var(--accent-stroke)',
                color: 'var(--accent-text)',
                backgroundColor: 'var(--bg-raised)'
              }}
            >
              {blessing.categoryLabel}
            </span>

            {/* Quick Copy & Share Icon-Only Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyBlessingText}
                className="w-9 h-9 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="نسخ نص النعمة"
                aria-label="نسخ نص النعمة"
              >
                {copiedBlessing ? <Check size={15} className="text-[#E4C368]" /> : <Copy size={15} />}
              </button>

              <button
                onClick={() => setShareModalData({ open: true, type: 'ayah' })}
                className="w-9 h-9 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="مشاركة النعمة"
                aria-label="مشاركة النعمة"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>

          {/* Blessing Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#EDEDF5] tracking-tight mb-3 leading-[1.45]">
            {blessing.title}
          </h1>

          {/* Opening Line */}
          <p className="text-sm sm:text-base text-[#C7C4D8] leading-[1.9] max-w-md mx-auto mb-6">
            {blessing.openingLine}
          </p>

          {/* Sacred Quran Ayah Block (Sunken surface, Amiri Quran font, Gold in Layl / Ink #2A1F19 in Nahar) */}
          <div
            className="w-full rounded-2xl p-5 sm:p-6 mb-6 border"
            style={{
              backgroundColor: 'var(--bg-sunken)',
              borderColor: 'var(--ayah-border)'
            }}
          >
            <p
              className="font-quran ayah-text text-xl sm:text-2xl leading-[2.15] text-center"
              style={{ color: 'var(--ayah-color)' }}
            >
              ﴿{blessing.quran.textUthmani}﴾
            </p>
            <div className="mt-3 text-center">
              <span className="text-xs sm:text-sm text-[#AEAECB]">
                سورة {blessing.quran.surahName} : {toArabicNumerals(blessing.quran.ayahNumber)}
              </span>
            </div>
          </div>

          {/* Collapsible «تدبّر النعمة» (Tadabbur section) */}
          <div className="w-full border-t border-[#2E2E4A]/80 pt-4 mb-6">
            <button
              onClick={() => setShowTadabbur(!showTadabbur)}
              className="w-full flex items-center justify-between py-2.5 text-base font-bold text-[#EDEDF5] hover:text-[#E4C368] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#C8A951]" />
                <span>تدبّر النعمة</span>
              </div>
              {showTadabbur ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {showTadabbur && (
              <div className="mt-4 space-y-5 text-right animate-fade-in bg-black/20 p-5 sm:p-6 rounded-2xl border border-[#2E2E4A]/60">
                {/* Hadith */}
                {blessing.hadith && blessing.hadith.text && (
                  <div className="space-y-2">
                    <span className="text-sm font-bold text-[#C8A951] block">الحديث الشريف:</span>
                    <p className="font-serif text-xl sm:text-2xl text-[#EDEDF5] leading-[1.95]">
                      «{blessing.hadith.text}»
                    </p>
                    <span className="text-xs sm:text-sm text-[#AEAECB] block pt-0.5">
                      {blessing.hadith.source} {blessing.hadith.grade ? `(${blessing.hadith.grade})` : ''}
                    </span>
                  </div>
                )}

                {/* Tadabbur Text */}
                {blessing.tadabbur && (
                  <div className="space-y-2 border-t border-[#2E2E4A]/50 pt-4">
                    <span className="text-sm font-bold text-[#C8A951] block">وقفات في أثر النعمة:</span>
                    <p className="text-base sm:text-lg text-[#C7C4D8] leading-[1.95]">
                      {blessing.tadabbur}
                    </p>
                  </div>
                )}

                {/* Scholar Quote */}
                {blessing.scholarQuote && blessing.scholarQuote.text && (
                  <div className="space-y-2 border-t border-[#2E2E4A]/50 pt-4">
                    <p className="font-serif text-lg sm:text-xl text-[#C7C4D8] italic leading-[1.95]">
                      "{blessing.scholarQuote.text}"
                    </p>
                    {showScholarName && (
                      <span className="text-xs sm:text-sm font-medium text-[#C8A951] block">
                        — {blessing.scholarQuote.scholar} {blessing.scholarQuote.work ? `(${blessing.scholarQuote.work})` : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* Share Tadabbur Icon Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShareModalData({ open: true, type: 'tadabbur' })}
                    className="w-9 h-9 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-colors cursor-pointer"
                    title="مشاركة التدبّر"
                    aria-label="مشاركة التدبّر"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA Button: «استشعر النعمة» */}
          {isCompletedToday ? (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#1E1E38] border border-[#2E2E4A] text-[#E4C368] font-semibold text-base">
                <CheckCircle2 size={20} className="text-[#E4C368]" />
                <span>حمدتَ اللهَ اليوم على هذه النعمة</span>
              </div>
              <button
                onClick={onStartReflection}
                className="flex items-center gap-1.5 text-sm font-medium text-[#AEAECB] hover:text-[#EDEDF5] py-2 transition-colors cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>أعد الاستشعار</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-start-reflection"
              onClick={onStartReflection}
              className="w-full py-4 px-8 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] active:scale-[0.98] text-white font-bold text-lg shadow-lg shadow-[#6C63FF]/25 transition-all duration-200 cursor-pointer"
            >
              استشعر النعمة
            </button>
          )}
        </GlassCard>
      </div>

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
