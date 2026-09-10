import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Check, ChevronLeft } from 'lucide-react';
import { Blessing, IstisharStep } from '../../types';
import { ThreadProgress } from '../common/ThreadProgress';
import { StarLattice } from '../common/StarLattice';
import { toArabicNumerals } from '../../lib/arabic';

interface ReflectionModalProps {
  blessing: Blessing;
  onClose: () => void;
  onComplete: (journalText?: string) => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success') => void;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  blessing,
  onClose,
  onComplete,
  triggerHaptic
}) => {
  // Steps: 0 to 4 are istishar steps, 5 is the journal step, 6 is completion overlay
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [dhikrCount, setDhikrCount] = useState(0);
  const [showAcceptedOverlay, setShowAcceptedOverlay] = useState(false);

  const steps = blessing.istisharSteps || [];
  const currentStep: IstisharStep | undefined = steps[currentStepIdx];
  const isJournalStep = currentStepIdx === steps.length;

  // Split text into sentences for peaceful pacing
  const sentences = currentStep
    ? currentStep.text
        .split(/(?<=[.،؟!…])\s+/)
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  // Reset sentence index on step change and pace through sentences
  useEffect(() => {
    if (isJournalStep || showAcceptedOverlay) return;

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
    }, 2800);

    // Fallback timer based on durationSec
    const durationMs = ((currentStep?.durationSec || 12) * 1000);
    const advanceTimer = setTimeout(() => {
      setCanAdvance(true);
      setSentenceIdx(sentences.length - 1);
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(advanceTimer);
    };
  }, [currentStepIdx, isJournalStep, showAcceptedOverlay, sentences.length, currentStep?.durationSec]);

  // Step ambient background colors according to token design
  const getStepBgClass = () => {
    if (isJournalStep) return 'bg-[#15152A]';
    if (!currentStep) return 'bg-[#15152A]';
    switch (currentStep.type) {
      case 'ground': return 'bg-[#15152A]';
      case 'visualize': return 'bg-[#111126]';
      case 'deepen': return 'bg-[#0C0C1C]';
      case 'return': return 'bg-[#15152A]';
      case 'hamd': return 'bg-[#15152A]';
      default: return 'bg-[#15152A]';
    }
  };

  const handleNext = () => {
    triggerHaptic('light');
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(i => i + 1);
    } else if (currentStepIdx === steps.length - 1) {
      // Step 5 (hamd) completed -> go to journal step
      setCurrentStepIdx(steps.length);
    }
  };

  const handleFinishJournal = (saveText: boolean) => {
    setShowAcceptedOverlay(true);
    triggerHaptic('success');

    setTimeout(() => {
      onComplete(saveText && journalText.trim() ? journalText.trim() : undefined);
    }, 1600);
  };

  const handleDhikrTap = () => {
    setDhikrCount(c => {
      const next = c + 1;
      if (next % 33 === 0) {
        triggerHaptic('heavy');
      } else {
        triggerHaptic('light');
      }
      return next;
    });
  };

  // 1.6s Completion Overlay
  if (showAcceptedOverlay) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111126] text-center p-6 animate-fade-in" dir="rtl">
        <div className="w-20 h-20 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(108,99,255,0.4)] animate-scale-up">
          <Check size={36} className="text-[#E4C368]" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#EDEDF5] mb-2">
          تقبل الله منكم
        </h2>
        <p className="text-sm text-[#AEAECB]">
          جعل الله هذا اليوم شاهدًا لك بالحمد والشكر.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-8 transition-colors duration-700 ease-in-out ${getStepBgClass()}`}
      dir="rtl"
    >
      {/* Star lattice background */}
      <StarLattice opacity={currentStep?.type === 'deepen' ? 0.015 : 0.045} />

      {/* Top Header: Close, Progress, and Step Label */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors"
          aria-label="إغلاق الاستشعار"
        >
          <X size={20} />
        </button>

        {/* Thread Progress (growing leftward from right dot) */}
        {!isJournalStep ? (
          <ThreadProgress
            currentStep={currentStepIdx + 1}
            totalSteps={steps.length}
            width={130}
          />
        ) : (
          <span className="text-xs font-semibold text-[#C8A951] bg-[#C8A951]/10 px-3 py-1 rounded-full border border-[#C8A951]/30">
            خاتمة الاستشعار
          </span>
        )}

        <div className="w-10" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center text-center px-4">
        {!isJournalStep && currentStep ? (
          <div className="space-y-6 w-full animate-fade-in">
            {/* Step Type Chip */}
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-[#C8A951] bg-[#1E1E38]/80 border border-[#C8A951]/30 shadow-sm">
              {currentStep.type === 'ground' && 'التهيئة والحضور'}
              {currentStep.type === 'visualize' && 'تخيّل الغياب'}
              {currentStep.type === 'deepen' && 'إدراك أثر النعمة'}
              {currentStep.type === 'return' && 'العودة بالحمد'}
              {currentStep.type === 'hamd' && 'الحمد والشكر'}
            </span>

            {/* Step Sentence by Sentence Display */}
            <div className="min-h-[160px] flex flex-col items-center justify-center">
              <p className="text-xl sm:text-2xl font-serif text-[#EDEDF5] leading-[2.1] font-medium transition-all duration-500">
                {sentences.slice(0, sentenceIdx + 1).join(' ')}
              </p>
            </div>

            {/* Special Hamd Step: Sacred Duaa Display */}
            {currentStep.type === 'hamd' && blessing.duaa && (
              <div className="mt-4 p-5 rounded-2xl bg-[#1E1E38]/90 border border-[#C8A951]/30 animate-fade-in shadow-lg">
                <span className="text-xs font-semibold text-[#E4C368] block mb-2">دعاء اليوم:</span>
                <p className="font-serif text-[#EDEDF5] text-lg leading-relaxed">
                  «{blessing.duaa}»
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Step 6: Journal Step */
          <div className="w-full space-y-6 animate-fade-in text-right">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif font-bold text-[#EDEDF5]">
                سجل الحمد
              </h3>
              <p className="text-xs text-[#AEAECB]">
                {blessing.journalPrompt || 'دوّن ما فاض به قلبك من شكرٍ لله على هذه النعمة:'}
              </p>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                placeholder="اكتب حمدك..."
                rows={3}
                className="w-full p-4 rounded-2xl bg-[#1E1E38]/90 border border-[#2E2E4A] focus:border-[#C8A951] text-[#EDEDF5] placeholder-[#AEAECB]/50 text-sm leading-relaxed outline-none transition-colors resize-none"
              />
            </div>

            {/* Tap-to-count "الحمد لله" Dhikr Circle */}
            <div className="flex flex-col items-center justify-center pt-2">
              <span className="text-xs text-[#AEAECB] mb-2">تسبيح ختامي</span>
              <button
                onClick={handleDhikrTap}
                className="w-24 h-24 rounded-full bg-gradient-to-b from-[#1E1E38] to-[#25232E] border-2 border-[#C8A951]/50 hover:border-[#C8A951] active:scale-95 shadow-[0_0_20px_rgba(200,169,81,0.15)] flex flex-col items-center justify-center transition-all group"
              >
                <span className="font-serif text-sm font-bold text-[#E4C368] group-hover:scale-105 transition-transform">
                  الحمد لله
                </span>
                <span className="text-xs font-bold text-[#EDEDF5] mt-1">
                  {toArabicNumerals(dhikrCount)}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA Area */}
      <div className="relative z-10 w-full max-w-md mx-auto pt-4">
        {!isJournalStep ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg ${
              canAdvance
                ? 'bg-[#6C63FF] hover:bg-[#594DFF] text-white active:scale-[0.98]'
                : 'bg-[#1E1E38] text-[#AEAECB]/60 border border-[#2E2E4A] cursor-not-allowed opacity-70'
            }`}
          >
            {currentStep?.type === 'hamd' ? 'الحمد لله' : 'التالي'}
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handleFinishJournal(true)}
              className="w-full py-4 px-6 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-base transition-all shadow-lg active:scale-[0.98]"
            >
              {journalText.trim() ? 'حفظ في سجل الحمد' : 'إتمام'}
            </button>
            <button
              onClick={() => handleFinishJournal(false)}
              className="w-full py-2.5 text-xs text-[#AEAECB] hover:text-white transition-colors text-center block"
            >
              لاحقًا
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
