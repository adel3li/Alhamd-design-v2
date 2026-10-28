import React, { useState, useEffect, useRef } from 'react';
import { X, Check, BookOpen, HandHeart, ShieldCheck, ChevronRight, ChevronLeft, Share2 } from 'lucide-react';
import { Blessing, IstisharStep } from '../../types';
import { JourneyStationContent } from '../../lib/journeyStore';
import { ThreadProgress } from '../common/ThreadProgress';
import { StarLattice } from '../common/StarLattice';
import { ShareCardModal } from '../common/ShareCardModal';
import { toArabicNumerals } from '../../lib/arabic';

interface JourneyStationFlowProps {
  blessing: Blessing;
  stationNumber: number; // 1..7
  totalStationsInStage?: number;
  stageTitle: string;
  stationContent: JourneyStationContent;
  initialJournalText?: string;
  isStationCompleted?: boolean;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  isNextBlockedByFree?: boolean;
  prevStationTitle?: string;
  nextStationTitle?: string;
  nextBlockedReason?: string;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onTriggerPaywall?: () => void;
  onClose: () => void;
  onComplete: (journalText?: string) => void;
  onReachClosing?: (journalText?: string) => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success') => void;
}

type SessionPhase = 'istishar' | 'dawwin' | 'amal' | 'closing';

export const JourneyStationFlow: React.FC<JourneyStationFlowProps> = ({
  blessing,
  stationNumber,
  totalStationsInStage = 7,
  stageTitle,
  stationContent,
  initialJournalText = '',
  isStationCompleted = false,
  canNavigatePrev = false,
  canNavigateNext = false,
  isNextBlockedByFree = false,
  prevStationTitle,
  nextStationTitle,
  nextBlockedReason,
  onNavigatePrev,
  onNavigateNext,
  onTriggerPaywall,
  onClose,
  onComplete,
  onReachClosing,
  triggerHaptic
}) => {
  const [phase, setPhase] = useState<SessionPhase>('istishar');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  // Private journal reflection stored strictly on the local device — never transmitted externally
  const [journalText, setJournalText] = useState(initialJournalText);
  const [showShareModal, setShowShareModal] = useState(false);
  const hasRecordedClosingRef = useRef(false);

  const steps = blessing.istisharSteps || [];
  const currentStep: IstisharStep | undefined = steps[currentStepIdx];

  const sentences = currentStep
    ? currentStep.text
        .split(/(?<=[.،؟!…])\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Pace sentences during the 5-step reflection flow (10/20/20/15/15 seconds)
  useEffect(() => {
    if (phase !== 'istishar') return;

    setSentenceIdx(0);
    setCanAdvance(false);

    let sIndex = 0;
    const interval = setInterval(() => {
      sIndex++;
      if (sIndex < sentences.length) {
        setSentenceIdx(sIndex);
      } else {
        setCanAdvance(true);
        clearInterval(interval);
      }
    }, 2600);

    const durationMs = (currentStep?.durationSec || 12) * 1000;
    const advanceTimer = setTimeout(() => {
      setCanAdvance(true);
      setSentenceIdx(Math.max(0, sentences.length - 1));
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(advanceTimer);
    };
  }, [phase, currentStepIdx, sentences.length, currentStep?.durationSec]);

  const getStepBgClass = () => {
    if (phase !== 'istishar' || !currentStep) return 'bg-[#15152A]';
    switch (currentStep.type) {
      case 'ground':
        return 'bg-[#15152A]';
      case 'visualize':
        return 'bg-[#111126]';
      case 'deepen':
        return 'bg-[#0C0C1C]';
      case 'return':
        return 'bg-[#15152A]';
      case 'hamd':
        return 'bg-[#15152A]';
      default:
        return 'bg-[#15152A]';
    }
  };

  const handleAdvanceIstishar = () => {
    triggerHaptic('light');
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((i) => i + 1);
    } else {
      setPhase('dawwin');
    }
  };

  const handleAdvanceFromDawwin = () => {
    triggerHaptic('light');
    setPhase('amal');
  };

  const handleAdvanceFromAmal = () => {
    triggerHaptic('light');
    if (!hasRecordedClosingRef.current && onReachClosing) {
      hasRecordedClosingRef.current = true;
      onReachClosing(journalText.trim() || undefined);
    }
    setPhase('closing');
  };

  const handleFinishSession = () => {
    triggerHaptic('light');
    onComplete(journalText.trim() || undefined);
  };

  const canTriggerPaywallForNext =
    !canNavigateNext && isStationCompleted && isNextBlockedByFree && Boolean(onTriggerPaywall);

  const renderStationNavStrip = () => (
    <div className="relative z-20 w-full max-w-lg mx-auto pt-2.5">
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-[#1E1E38]/75 border border-[#2E2E4A]/90">
        {/* Previous station within the same stage */}
        <button
          type="button"
          disabled={!canNavigatePrev}
          onClick={() => {
            if (canNavigatePrev && onNavigatePrev) {
              triggerHaptic('light');
              onNavigatePrev();
            }
          }}
          title={
            canNavigatePrev
              ? `الانتقال إلى المحطة ${toArabicNumerals(stationNumber - 1)}${prevStationTitle ? `: ${prevStationTitle}` : ''}`
              : 'أنت في المحطة الأولى من هذا المنزل'
          }
          className={`min-h-[36px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-colors ${
            canNavigatePrev
              ? 'bg-[#15152A] hover:bg-[#252547] text-[#EDEDF5] border border-[#2E2E4A] hover:border-[#6C63FF]/50 cursor-pointer'
              : 'bg-transparent text-[#AEAECB]/35 border border-transparent cursor-not-allowed'
          }`}
        >
          <ChevronRight size={15} className="shrink-0" />
          <span>المحطة السابقة</span>
        </button>

        {/* Current station position in the stage */}
        <div className="flex flex-col items-center text-center px-1 min-w-0">
          <span className="text-[11px] font-semibold text-[#EDEDF5] truncate max-w-[150px] sm:max-w-[220px]">
            {stageTitle}
          </span>
          <span className="text-[10px] text-[#AEAECB] tabular-nums">
            المحطة {toArabicNumerals(stationNumber)} من {toArabicNumerals(totalStationsInStage)}
            {isStationCompleted ? ' · مكتملة' : ''}
          </span>
        </div>

        {/* Next station within the same stage (strictly respecting path order, or opening paywall if blocked by free limit) */}
        <button
          type="button"
          disabled={!canNavigateNext && !canTriggerPaywallForNext}
          onClick={() => {
            if (canNavigateNext && onNavigateNext) {
              triggerHaptic('light');
              onNavigateNext();
            } else if (canTriggerPaywallForNext && onTriggerPaywall) {
              triggerHaptic('light');
              onTriggerPaywall();
            }
          }}
          title={
            canNavigateNext
              ? `الانتقال إلى المحطة ${toArabicNumerals(stationNumber + 1)}${nextStationTitle ? `: ${nextStationTitle}` : ''}`
              : nextBlockedReason || 'التزم بترتيب المسار للانتقال للمحطة التالية'
          }
          className={`min-h-[36px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-colors ${
            canNavigateNext || canTriggerPaywallForNext
              ? 'bg-[#15152A] hover:bg-[#252547] text-[#EDEDF5] border border-[#2E2E4A] hover:border-[#6C63FF]/50 cursor-pointer'
              : 'bg-transparent text-[#AEAECB]/35 border border-transparent cursor-not-allowed'
          }`}
        >
          <span>المحطة التالية</span>
          <ChevronLeft size={15} className="shrink-0" />
        </button>
      </div>

      {!canNavigateNext && nextBlockedReason && stationNumber < totalStationsInStage && (
        <div className="text-center mt-1.5">
          <span className="text-[10px] text-[#AEAECB]/65">
            {nextBlockedReason}
          </span>
        </div>
      )}
    </div>
  );

  // Phase 4: Calm closing screen — «الحمد لله» and calm transition back to the path. No celebration animation.
  if (phase === 'closing') {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#15152A] text-center p-6 sm:p-8 transition-opacity duration-500"
        dir="rtl"
      >
        <StarLattice opacity={0.03} />

        <div className="w-full max-w-lg mx-auto">
          {renderStationNavStrip()}
        </div>

        <div className="relative z-10 my-auto max-w-md mx-auto space-y-5 px-4">
          <div className="w-16 h-16 rounded-full bg-[#1E1E38] border border-[#6C63FF]/45 flex items-center justify-center mx-auto">
            <Check size={28} className="text-[#EDEDF5]" strokeWidth={2} />
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#EDEDF5]">
            الحمد لله
          </h2>

          <p className="text-sm sm:text-base text-[#C7C4D8] leading-relaxed">
            أتممتَ تأمل «{blessing.title}». نسأل الله أن يجعلها نعمةً مشكورةً وأثرًا باقيًا في يومك.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowShareModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1E38] hover:bg-[#27274A] border border-[#2E2E4A] hover:border-[#E4C368]/50 text-xs sm:text-sm font-semibold text-[#E4C368] transition-colors cursor-pointer"
            >
              <Share2 size={15} />
              <span>مشاركة النعمة أو حفظها كصورة</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto pb-2 space-y-2.5">
          {(canNavigateNext || canTriggerPaywallForNext) && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                if (canNavigateNext && onNavigateNext) {
                  onNavigateNext();
                } else if (canTriggerPaywallForNext && onTriggerPaywall) {
                  onTriggerPaywall();
                }
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#1E1E38] hover:bg-[#27274A] border border-[#6C63FF]/50 text-[#EDEDF5] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>الانتقال إلى المحطة التالية ({toArabicNumerals(stationNumber + 1)})</span>
              <ChevronLeft size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={handleFinishSession}
            className="w-full py-4 px-6 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-base transition-colors cursor-pointer"
          >
            العودة إلى المسار
          </button>
        </div>

        {showShareModal && (
          <ShareCardModal
            blessing={blessing}
            type="tadabbur"
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-8 transition-colors duration-700 ease-in-out overflow-y-auto ${getStepBgClass()}`}
      dir="rtl"
    >
      <StarLattice opacity={currentStep?.type === 'deepen' ? 0.015 : 0.045} />

      {/* Top Header & Intra-Stage Station Navigation */}
      <div className="relative z-20 w-full max-w-lg md:max-w-xl mx-auto space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق المحطة"
          >
            <X size={20} />
          </button>

          {phase === 'istishar' ? (
            <ThreadProgress
              currentStep={currentStepIdx + 1}
              totalSteps={steps.length}
              width={130}
            />
          ) : (
            <span className="text-xs font-semibold text-[#C8A951] bg-[#C8A951]/10 px-3.5 py-1.5 rounded-full border border-[#C8A951]/30">
              {phase === 'dawwin' ? 'وقفة تأمل' : 'عمل اليوم'}
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowShareModal(true);
              }}
              className="h-10 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C8A951]/50 text-[#E4C368] flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
              title="مشاركة نص النعمة أو حفظها كصورة"
              aria-label="مشاركة"
            >
              <Share2 size={15} />
              <span>مشاركة</span>
            </button>
          </div>
        </div>

        {renderStationNavStrip()}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md md:max-w-lg mx-auto my-auto flex flex-col items-center text-center px-4 py-6">
        {phase === 'istishar' && currentStep && (
          <div className="space-y-6 w-full animate-fade-in">
            <div className="space-y-2">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-[#C8A951] bg-[#1E1E38]/80 border border-[#C8A951]/30 shadow-sm">
                {currentStep.type === 'ground' && 'التهيئة والحضور'}
                {currentStep.type === 'visualize' && 'تخيّل الغياب'}
                {currentStep.type === 'deepen' && 'إدراك أثر النعمة'}
                {currentStep.type === 'return' && 'العودة بالحمد'}
                {currentStep.type === 'hamd' && 'الحمد والشكر'}
              </span>
              <h2 className="text-sm font-medium text-[#AEAECB]">{blessing.title}</h2>
            </div>

            {/* Sentence-by-sentence contemplation */}
            <div className="min-h-[170px] flex flex-col items-center justify-center">
              <p className="text-2xl sm:text-3xl font-serif text-[#EDEDF5] leading-[2.15] font-medium transition-all duration-500">
                {sentences.slice(0, sentenceIdx + 1).join(' ')}
              </p>
            </div>

            {/* Sacred Quran Ayah on ground step */}
            {currentStep.type === 'ground' && blessing.quran?.textUthmani && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#1E1E38]/85 border border-[#C8A951]/30 space-y-2 shadow-lg">
                <p className="font-quran ayah-text text-xl sm:text-2xl leading-[2.15] text-[#E4C368]">
                  ﴿{blessing.quran.textUthmani}﴾
                </p>
                <span className="block text-xs text-[#AEAECB]">
                  سورة {blessing.quran.surahName} : {toArabicNumerals(blessing.quran.ayahNumber)}
                </span>
              </div>
            )}

            {/* Sacred Duaa on hamd step */}
            {currentStep.type === 'hamd' && blessing.duaa && (
              <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-[#1E1E38]/90 border border-[#C8A951]/30 space-y-2 shadow-lg">
                <span className="text-sm font-bold text-[#E4C368] block">دعاء اليوم:</span>
                <p className="font-serif text-[#EDEDF5] text-xl sm:text-2xl leading-[2.0]">
                  «{blessing.duaa}»
                </p>
              </div>
            )}
          </div>
        )}

        {phase === 'dawwin' && (
          <div className="w-full space-y-6 animate-fade-in text-right">
            <div className="space-y-2 text-center">
              <div className="w-11 h-11 rounded-2xl bg-[#1E1E38] border border-[#6C63FF]/40 flex items-center justify-center text-[#6C63FF] mx-auto mb-2">
                <BookOpen size={20} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5]">
                دوّن
              </h3>
              <p className="text-sm sm:text-base text-[#C7C4D8] leading-relaxed">
                {stationContent.journalPrompt.text}
              </p>
            </div>

            <div className="space-y-2.5">
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="اكتب موقفًا شعرت فيه بقيمة هذه النعمة… (اختياري)"
                rows={4}
                className="w-full p-4 rounded-2xl bg-[#1E1E38]/90 border border-[#2E2E4A] focus:border-[#C8A951] text-[#EDEDF5] placeholder-[#AEAECB]/50 text-base leading-[1.9] outline-none transition-colors resize-none"
              />
              <div className="flex items-center gap-2 text-[11px] text-[#AEAECB] bg-[#1E1E38]/60 px-3 py-2 rounded-xl border border-[#2E2E4A]">
                <ShieldCheck size={14} className="text-[#6C63FF] shrink-0" />
                <span>
                  تُحفظ تدويناتك التأملية محليًا على جهازك فقط ولا يتم إرسالها لأي جهة خارجية.
                </span>
              </div>
            </div>
          </div>
        )}

        {phase === 'amal' && (
          <div className="w-full space-y-6 animate-fade-in text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#1E1E38] border border-[#6C63FF]/40 flex items-center justify-center text-[#6C63FF] mx-auto mb-2">
                <HandHeart size={22} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5]">
                عمل اليوم
              </h3>
              <p className="text-xs sm:text-sm text-[#AEAECB]">
                أثرٌ عمليٌّ يسير يربط القلب بالعمل
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#1E1E38] border border-[#6C63FF]/40 shadow-lg space-y-4">
              <p className="text-lg sm:text-xl font-medium text-[#EDEDF5] leading-[1.95]">
                «{stationContent.dailyAction.text}»
              </p>
              <div className="pt-2 border-t border-[#2E2E4A]/80 flex items-center justify-between text-[11px] text-[#AEAECB]">
                <span>نعمة: {blessing.shortTitle}</span>
                {stationContent.dailyAction.reviewStatus === 'pending_review' && (
                  <span>محتوى توجيهي (قيد المراجعة)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 w-full max-w-md md:max-w-lg mx-auto pt-4">
        {phase === 'istishar' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleAdvanceIstishar}
              disabled={!canAdvance}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 ${
                canAdvance
                  ? 'bg-[#6C63FF] hover:bg-[#594DFF] text-white shadow-lg shadow-[#6C63FF]/25 cursor-pointer'
                  : 'bg-[#1E1E38] text-[#AEAECB]/60 border border-[#2E2E4A] cursor-not-allowed opacity-70'
              }`}
            >
              {currentStep?.type === 'hamd' ? 'متابعة إلى وقفة التأمل' : 'التالي'}
            </button>
            {!canAdvance && (
              <button
                type="button"
                onClick={() => {
                  setCanAdvance(true);
                  setSentenceIdx(Math.max(0, sentences.length - 1));
                }}
                className="w-full py-1.5 text-[11px] text-[#AEAECB]/70 hover:text-[#EDEDF5] transition-colors cursor-pointer"
              >
                إظهار النص كاملًا
              </button>
            )}
          </div>
        )}

        {phase === 'dawwin' && (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleAdvanceFromDawwin}
              className="w-full py-4 px-6 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-base transition-colors shadow-lg shadow-[#6C63FF]/25 cursor-pointer"
            >
              متابعة إلى عمل اليوم
            </button>
          </div>
        )}

        {phase === 'amal' && (
          <button
            type="button"
            onClick={handleAdvanceFromAmal}
            className="w-full py-4 px-6 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-base transition-colors shadow-lg shadow-[#6C63FF]/25 cursor-pointer"
          >
            نويتُ بإذن الله · إتمام المحطة
          </button>
        )}
      </div>

      {/* Share Blessing Modal */}
      {showShareModal && (
        <ShareCardModal
          blessing={blessing}
          type="tadabbur"
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
