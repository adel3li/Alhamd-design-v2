import React, { useState } from 'react';
import { X, BookOpen, Check, ShieldCheck } from 'lucide-react';
import { getBlessingById } from '../../data/loader';
import { makeStationId } from '../../lib/journeyStore';
import { toArabicNumerals } from '../../lib/arabic';

interface JourneyMuhasabaScreenProps {
  stage: {
    id: string;
    theme: string;
    title: string;
    stationBlessingIds: string[];
  };
  journalMap: Record<string, string>;
  initialAnswers?: { q1: string; q2: string };
  onClose: () => void;
  onSave: (q1: string, q2: string) => void;
}

export const JourneyMuhasabaScreen: React.FC<JourneyMuhasabaScreenProps> = ({
  stage,
  journalMap,
  initialAnswers,
  onClose,
  onSave
}) => {
  const [q1, setQ1] = useState(initialAnswers?.q1 || '');
  const [q2, setQ2] = useState(initialAnswers?.q2 || '');

  // Collect the user's own local journal entries from the 7 stations of this stage
  const stageStationsSummary = stage.stationBlessingIds.map((blessingId, idx) => {
    const stationId = makeStationId(stage.id, idx);
    const blessing = getBlessingById(blessingId);
    const journalText = journalMap[stationId] || '';
    return {
      stationNumber: idx + 1,
      blessingTitle: blessing?.title || 'نعمة',
      journalText
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(q1, q2);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#15152A] overflow-y-auto p-4 sm:p-6 animate-fade-in"
      dir="rtl"
    >
      <div className="w-full max-w-lg md:max-w-2xl mx-auto py-4 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#C7C4D8] px-3 py-1 rounded-xl bg-[#1E1E38] border border-[#2E2E4A]">
            ختام {stage.title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1E1E38] border border-[#2E2E4A] flex items-center justify-center text-[#AEAECB] hover:text-[#EDEDF5] transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2 text-right">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5]">
            وقفة محاسبة
          </h2>
          <p className="text-xs sm:text-sm text-[#AEAECB] leading-relaxed">
            أتممتَ المحطات السبع في «{stage.title}». هذه تدويناتك الخاصة خلال هذا المنزل، فقف معها وقفة تأملٍ هادئة.
          </p>
        </div>

        {/* Collected local journal entries from this stage */}
        <div className="p-5 rounded-2xl bg-[#1E1E38]/85 border border-[#2E2E4A] space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C7C4D8]">
            <BookOpen size={15} className="text-[#6C63FF]" />
            <span>ما دوّنته في هذا المنزل ({toArabicNumerals(stageStationsSummary.length)} محطات)</span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pl-1">
            {stageStationsSummary.map((item) => (
              <div
                key={item.stationNumber}
                className="p-3.5 rounded-xl bg-[#15152A] border border-[#2E2E4A] space-y-1.5 text-right"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-[#EDEDF5]">
                    المحطة {toArabicNumerals(item.stationNumber)} · {item.blessingTitle}
                  </div>
                  <Check size={14} className="text-[#6C63FF] shrink-0" />
                </div>
                {item.journalText ? (
                  <p className="text-xs text-[#C7C4D8] leading-relaxed">
                    «{item.journalText}»
                  </p>
                ) : (
                  <p className="text-[11px] text-[#AEAECB]/60">
                    تأمل صامت (دون تدوين نصي)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Two Reflection Questions (Saved strictly in localStorage) */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-right">
            <label
              htmlFor="muhasaba-q1"
              className="block text-sm sm:text-base font-bold text-[#EDEDF5]"
            >
              ١. أي نعمة في هذا المنزل كنت أغفل عنها أكثر؟
            </label>
            <textarea
              id="muhasaba-q1"
              rows={3}
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              placeholder="اكتب بتأملٍ وصدق مع نفسك..."
              className="w-full p-4 rounded-2xl bg-[#1E1E38] border border-[#2E2E4A] focus:border-[#6C63FF] text-[#EDEDF5] placeholder-[#AEAECB]/50 text-sm sm:text-base leading-relaxed outline-none resize-none"
            />
          </div>

          <div className="space-y-2 text-right">
            <label
              htmlFor="muhasaba-q2"
              className="block text-sm sm:text-base font-bold text-[#EDEDF5]"
            >
              ٢. ماذا ستغير في يومك بعد هذا المنزل؟
            </label>
            <textarea
              id="muhasaba-q2"
              rows={3}
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              placeholder="خطوة عملية أو عادة قلبية تنوي المداومة عليها..."
              className="w-full p-4 rounded-2xl bg-[#1E1E38] border border-[#2E2E4A] focus:border-[#6C63FF] text-[#EDEDF5] placeholder-[#AEAECB]/50 text-sm sm:text-base leading-relaxed outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#AEAECB] bg-[#1E1E38]/60 px-3.5 py-2.5 rounded-xl border border-[#2E2E4A]">
            <ShieldCheck size={15} className="text-[#6C63FF] shrink-0" />
            <span>
              تُخزن إجاباتك وتأملاتك محليًا على جهازك فقط ولا يتم إرسالها لأي جهة خارجية.
            </span>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#6C63FF]/25 transition-colors cursor-pointer"
            >
              <Check size={18} />
              <span>حفظ وقفة المحاسبة وفتح المنزل التالي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
