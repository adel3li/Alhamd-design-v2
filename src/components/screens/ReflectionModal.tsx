import React, { useState, useEffect } from 'react';
import { X, Check, Timer, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Blessing, IstisharStep } from '../../types';
import { ThreadProgress } from '../common/ThreadProgress';
import { StarLattice } from '../common/StarLattice';
import { CompletionParticles } from '../common/CompletionParticles';
import { toArabicNumerals } from '../../lib/arabic';

interface ReflectionModalProps {
  blessing: Blessing;
  onClose: () => void;
  onComplete: (journalText?: string) => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success') => void;
}

const TIMER_PRESETS = [
  { label: 'دقيقة واحدة', shortLabel: '١ د', seconds: 60 },
  { label: '٣ دقائق', shortLabel: '٣ د', seconds: 180 },
  { label: '٥ دقائق', shortLabel: '٥ د', seconds: 300 },
];

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

  // Optional Relaxation & Tadabbur Timer State
  const [showTimerPanel, setShowTimerPanel] = useState(false);
  const [timerDuration, setTimerDuration] = useState<number>(60);
  const [timerRemaining, setTimerRemaining] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);

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

  // Format MM:SS in Arabic numerals
  const formatArabicTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const minStr = toArabicNumerals(mins);
    const secStr = secs < 10 ? `٠${toArabicNumerals(secs)}` : toArabicNumerals(secs);
    return `${minStr}:${secStr}`;
  };

  // Optional Tadabbur Countdown Interval
  useEffect(() => {
    if (!isTimerRunning) return;

    const countdown = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          setTimerCompleted(true);
          triggerHaptic('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isTimerRunning, triggerHaptic]);

  const handleSelectPreset = (seconds: number) => {
    triggerHaptic('light');
    setTimerDuration(seconds);
    setTimerRemaining(seconds);
    setTimerCompleted(false);
    setIsTimerRunning(true);
  };

  const toggleTimerRunning = () => {
    triggerHaptic('light');
    if (timerRemaining === 0) {
      setTimerRemaining(timerDuration);
      setTimerCompleted(false);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(r => !r);
    }
  };

  const resetRelaxTimer = () => {
    triggerHaptic('light');
    setIsTimerRunning(false);
    setTimerCompleted(false);
    setTimerRemaining(timerDuration);
  };

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
    }, 2200);
  };

  const handleDhikrTap = () => {
    setDhikrCount(c => {
      const next = c + 1;
      if (next % 100 === 0) {
        triggerHaptic('heavy');
      } else {
        triggerHaptic('light');
      }
      return next;
    });
  };

  const timerProgress = timerDuration > 0 ? (timerDuration - timerRemaining) / timerDuration : 0;
  const circleRadius = 42;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - timerProgress);

  // Serene Completion Overlay with Gentle Floating Particles
  if (showAcceptedOverlay) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111126] text-center p-6 animate-fade-in overflow-hidden" dir="rtl">
        <StarLattice opacity={0.04} />
        <CompletionParticles count={36} />

        <div className="relative flex items-center justify-center mb-7">
          {/* Calm expanding ripple rings */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 2.0, ease: 'easeOut', repeat: Infinity }}
            className="absolute w-20 h-20 rounded-full border pointer-events-none"
            style={{ borderColor: 'var(--accent-stroke)' }}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0.4 }}
            animate={{ scale: 1.65, opacity: 0 }}
            transition={{ duration: 1.8, delay: 0.25, ease: 'easeOut', repeat: Infinity }}
            className="absolute w-20 h-20 rounded-full border pointer-events-none"
            style={{ borderColor: 'var(--cta-bg)' }}
          />

          <div className="relative z-10 w-20 h-20 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex items-center justify-center shadow-[0_0_30px_rgba(108,99,255,0.4)] animate-scale-up">
            <Check size={36} className="text-[#E4C368]" strokeWidth={2.5} />
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-10 text-3xl font-serif font-bold text-[#EDEDF5] mb-2"
        >
          تقبل الله منكم
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 text-sm text-[#AEAECB]"
        >
          جعل الله هذا اليوم شاهدًا لك بالحمد والشكر.
        </motion.p>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-8 transition-colors duration-700 ease-in-out overflow-y-auto ${getStepBgClass()}`}
      dir="rtl"
    >
      {/* Star lattice background */}
      <StarLattice opacity={currentStep?.type === 'deepen' ? 0.015 : 0.045} />

      {/* Top Header: Close, Progress, and Optional Relaxation Timer Button */}
      <div className="relative z-20 w-full max-w-lg mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
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

          {/* Optional Relaxation Timer Toggle Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowTimerPanel(prev => !prev);
            }}
            className={`h-10 px-3 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all border ${
              showTimerPanel || isTimerRunning
                ? 'bg-[#C8A951]/15 border-[#C8A951]/50 text-[#E4C368] shadow-[0_0_15px_rgba(200,169,81,0.2)]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-[#AEAECB] hover:text-white'
            }`}
            aria-label="مؤقت خلوة التدبر الاختياري"
            title="مؤقت الاسترخاء والتدبر"
          >
            <Timer size={16} className={isTimerRunning ? 'animate-pulse text-[#E4C368]' : ''} />
            <span className="hidden xs:inline">
              {isTimerRunning || timerRemaining < timerDuration
                ? formatArabicTime(timerRemaining)
                : 'مؤقت التدبر'}
            </span>
            {(isTimerRunning || timerRemaining < timerDuration) && (
              <span className="xs:hidden font-mono font-bold">
                {formatArabicTime(timerRemaining)}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Relaxation & Tadabbur Timer Panel */}
        <AnimatePresence>
          {showTimerPanel && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-[#1E1E38]/90 backdrop-blur-md border border-[#C8A951]/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#E4C368]" />
                    <span className="text-xs font-semibold text-[#EDEDF5]">
                      خلوة تدبر واسترخاء (اختياري)
                    </span>
                  </div>
                  <span className="text-[11px] text-[#AEAECB]">
                    {timerCompleted
                      ? 'اكتمل وقت الخلوة بسلام'
                      : isTimerRunning
                      ? 'تنفّس بعمق واستشعر النعمة...'
                      : 'اختر مدة للتأمل الهادئ'}
                  </span>
                </div>

                {/* Preset Pills + Circular Countdown & Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Duration Presets */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    {TIMER_PRESETS.map(preset => {
                      const active = timerDuration === preset.seconds;
                      return (
                        <button
                          key={preset.seconds}
                          onClick={() => handleSelectPreset(preset.seconds)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            active
                              ? 'bg-[#C8A951] text-[#111126] font-bold shadow-sm'
                              : 'bg-[#15152A]/80 text-[#AEAECB] hover:text-white border border-[#2E2E4A]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Circular Ring & Play/Pause/Reset */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {/* Breathing halo when running */}
                      {isTimerRunning && (
                        <motion.div
                          className="absolute inset-1 rounded-full blur-md pointer-events-none"
                          style={{ backgroundColor: 'var(--ayah-border)' }}
                          animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r={circleRadius}
                          fill="transparent"
                          stroke="var(--border-hairline)"
                          strokeWidth="5"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r={circleRadius}
                          fill="transparent"
                          stroke="var(--accent-stroke)"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={circleCircumference}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-700 ease-linear"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span
                          className="text-base font-bold tracking-wider"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {formatArabicTime(timerRemaining)}
                        </span>
                        {timerCompleted && (
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: 'var(--accent-text)' }}
                          >
                            تمّ بحمد الله
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleTimerRunning}
                        className="w-10 h-10 rounded-xl bg-[#6C63FF] hover:bg-[#594DFF] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-[#6C63FF]/25 cursor-pointer"
                        aria-label={isTimerRunning ? 'إيقاف مؤقت' : 'بدء المؤقت'}
                      >
                        {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button
                        onClick={resetRelaxTimer}
                        className="w-10 h-10 rounded-xl bg-[#15152A] hover:bg-[#2E2E4A] text-[#AEAECB] hover:text-white border border-[#2E2E4A] flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="إعادة ضبط المؤقت"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center text-center px-4 py-4">
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
            <div className="min-h-[170px] flex flex-col items-center justify-center">
              <p className="text-2xl sm:text-3xl font-serif text-[#EDEDF5] leading-[2.15] font-medium transition-all duration-500">
                {sentences.slice(0, sentenceIdx + 1).join(' ')}
              </p>
            </div>

            {/* Special Hamd Step: Sacred Duaa Display */}
            {currentStep.type === 'hamd' && blessing.duaa && (
              <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-[#1E1E38]/90 border border-[#C8A951]/30 animate-fade-in shadow-lg">
                <span className="text-sm font-bold text-[#E4C368] block mb-2">دعاء اليوم:</span>
                <p className="font-serif text-[#EDEDF5] text-xl sm:text-2xl leading-[2.0]">
                  «{blessing.duaa}»
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Step 6: Journal Step */
          <div className="w-full space-y-6 animate-fade-in text-right">
            <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5]">
                سجل الحمد
              </h3>
              <p className="text-sm sm:text-base text-[#AEAECB]">
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
                className="w-full p-4 rounded-2xl bg-[#1E1E38]/90 border border-[#2E2E4A] focus:border-[#C8A951] text-[#EDEDF5] placeholder-[#AEAECB]/50 text-base leading-[1.9] outline-none transition-colors resize-none"
              />
            </div>

            {/* Tap-to-count "الحمد لله" Dhikr Circle */}
            <div className="flex flex-col items-center justify-center pt-2">
              <span className="text-xs font-medium text-[#AEAECB] mb-2.5">تسبيح ختامي</span>
              <button
                type="button"
                onClick={handleDhikrTap}
                style={{
                  backgroundColor: 'var(--bg-raised)',
                  boxShadow: 'var(--raised-shadow)',
                }}
                className="relative w-28 h-28 rounded-full active:scale-95 flex flex-col items-center justify-center transition-all cursor-pointer select-none group"
              >
                {/* SVG Ring Track & Progress (0 = empty, 100 = full, 101 = 1/100) */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 112 112">
                  <circle
                    cx="56"
                    cy="56"
                    r="51"
                    fill="none"
                    stroke="var(--border-hairline)"
                    strokeWidth="3"
                  />
                  {dhikrCount > 0 && (
                    <circle
                      cx="56"
                      cy="56"
                      r="51"
                      fill="none"
                      stroke="var(--accent-stroke)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 51}
                      strokeDashoffset={
                        2 * Math.PI * 51 * (1 - ((dhikrCount % 100) === 0 ? 100 : (dhikrCount % 100)) / 100)
                      }
                      className="transition-all duration-300 ease-out"
                    />
                  )}
                </svg>

                <span
                  className="relative z-10 font-serif text-base font-bold group-hover:scale-105 transition-transform"
                  style={{ color: 'var(--accent-text)' }}
                >
                  الحمد لله
                </span>
                <span
                  className="relative z-10 text-lg font-bold mt-1 leading-none"
                  style={{ color: 'var(--text-primary)' }}
                >
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

