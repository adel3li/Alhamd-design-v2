import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Bell, ShieldCheck, Check, ArrowLeft } from 'lucide-react';
import { StarLattice } from '../common/StarLattice';
import { ThreadProgress } from '../common/ThreadProgress';
import { BrandMark } from '../common/BrandMark';

interface OnboardingScreenProps {
  onComplete: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  analyticsConsent: boolean;
  onToggleAnalytics: (enabled: boolean) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  notificationsEnabled,
  onToggleNotifications,
  analyticsConsent,
  onToggleAnalytics
}) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      icon: Sparkles,
      iconColor: 'text-[#E4C368]',
      iconBg: 'bg-[#E4C368]/15 border-[#E4C368]/30',
      title: 'الحمد موقف، لا كلمة',
      body: 'كم من نعمةٍ ألِفناها حتى نسينا شكرها؟ الحمد يبدأ حين نرى ما اعتدنا أن نغفل عنه.',
      bullet: 'نعمةٌ واحدة كلَّ يوم — بهدوءٍ وتؤدة.'
    },
    {
      icon: Heart,
      iconColor: 'text-[#6C63FF]',
      iconBg: 'bg-[#6C63FF]/15 border-[#6C63FF]/30',
      title: 'من المعرفة إلى الشعور',
      body: 'لا نعدّ النعم، بل نستشعرها: نتخيّل غيابها، لندرك أثرها، فيفيض اللسان بالحمد صادقاً.',
      bullet: 'خمس دقائق هادئة تغيّر نظرتك ليومك.'
    },
    {
      icon: Bell,
      iconColor: 'text-[#C8A951]',
      iconBg: 'bg-[#C8A951]/15 border-[#C8A951]/30',
      title: 'بلا سلاسل، بلا مقارنة',
      body: 'لا نقاط، ولا منافسة، ولا رسائل تُشعرك بالذنب. وردٌ هادئ بينك وبين ربك — إن فاتك يوم، فاليوم التالي ينتظرك.',
      bullet: 'القليل الدائم خيرٌ من الكثير المنقطع.'
    },
    {
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      title: 'سجلك، خصوصيتك',
      body: 'كل ما تكتبه يبقى على جهازك فقط. لا حسابات، لا خوادم، لا أحد يرى ما بينك وبين الله.',
      bullet: 'بياناتك في أمانٍ تام على هاتفك.'
    }
  ];

  const currentSlide = slides[slide];
  const IconComponent = currentSlide.icon;
  const isLastSlide = slide === slides.length - 1;

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(s => s + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#15152A] flex flex-col justify-between p-6 sm:p-8 select-none" dir="rtl">
      {/* 8-point geometric star pattern at ~4% opacity */}
      <StarLattice opacity={0.04} />

      {/* Top Header: Wordmark + Thread Progress + Skip */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pt-2">
        <button
          onClick={onComplete}
          className="text-xs font-semibold text-[#AEAECB] hover:text-[#EDEDF5] px-2 py-1 transition-colors"
        >
          تخطي
        </button>

        {/* Thread progress growing leftward from the right dot */}
        <ThreadProgress currentStep={slide + 1} totalSteps={slides.length} width={120} />

        <div className="w-12 text-left">
          <BrandMark size={20} showThread={false} />
        </div>
      </div>

      {/* Slide Visual and Content (Matches ref-02-onboarding.png) */}
      <div className="relative z-10 w-full max-w-sm mx-auto my-auto flex flex-col items-center text-center px-2 animate-fade-in">
        {/* Large Iconic Emblem */}
        <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ${currentSlide.iconBg} border flex items-center justify-center mb-8 shadow-xl transition-all`}>
          <IconComponent size={44} className={currentSlide.iconColor} strokeWidth={1.8} />
        </div>

        {/* Slide Title in Amiri Bold */}
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5] tracking-tight mb-4">
          {currentSlide.title}
        </h2>

        {/* Slide Body */}
        <p className="text-sm sm:text-base text-[#C7C4D8] leading-relaxed mb-6 font-sans">
          {currentSlide.body}
        </p>

        {/* Highlight Card */}
        <div className="w-full bg-[#1E1E38]/80 border border-[#2E2E4A] rounded-2xl py-3 px-4 shadow-sm mb-4">
          <span className="text-xs font-medium text-[#E4C368]">
            {currentSlide.bullet}
          </span>
        </div>

        {/* Special permissions switches on the last slide */}
        {slide === 3 && (
          <div className="w-full space-y-3 pt-2 text-right">
            {/* Notifications switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1E1E38]/80 border border-[#2E2E4A]">
              <span className="text-xs font-semibold text-[#EDEDF5]">
                تذكير يومي هادئ (٩:٠٠ م)
              </span>
              <button
                onClick={() => onToggleNotifications(!notificationsEnabled)}
                role="switch"
                aria-checked={notificationsEnabled}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors p-0.5 ${
                  notificationsEnabled ? 'bg-[#6C63FF]' : 'bg-[#2E2E4A]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    notificationsEnabled ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Analytics opt-in switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1E1E38]/80 border border-[#2E2E4A]">
              <span className="text-xs text-[#AEAECB]">
                إحصاءات تحسين مجهولة
              </span>
              <button
                onClick={() => onToggleAnalytics(!analyticsConsent)}
                role="switch"
                aria-checked={analyticsConsent}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors p-0.5 ${
                  analyticsConsent ? 'bg-[#6C63FF]' : 'bg-[#2E2E4A]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    analyticsConsent ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA Button */}
      <div className="relative z-10 w-full max-w-sm mx-auto pb-4">
        {/* Calm Breathing Ambient Aura behind 'ابدأ' */}
        {isLastSlide && (
          <motion.div
            aria-hidden="true"
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#6C63FF]/30 via-[#C8A951]/20 to-[#6C63FF]/30 blur-md pointer-events-none"
            animate={{
              opacity: [0.35, 0.75, 0.35],
              scale: [0.98, 1.025, 0.98],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        <motion.button
          id="onboarding-cta-btn"
          onClick={handleNext}
          className="relative group overflow-hidden w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[#5A50FF] to-[#6C63FF] hover:brightness-105 text-white font-bold text-base transition-all shadow-xl shadow-[#6C63FF]/30 border border-white/10 flex items-center justify-center gap-2 cursor-pointer select-none"
          animate={
            isLastSlide
              ? {
                  scale: [1, 1.018, 1],
                  boxShadow: [
                    '0 10px 25px -5px rgba(108, 99, 255, 0.35)',
                    '0 16px 32px -4px rgba(108, 99, 255, 0.55)',
                    '0 10px 25px -5px rgba(108, 99, 255, 0.35)',
                  ],
                }
              : undefined
          }
          transition={
            isLastSlide
              ? {
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : undefined
          }
          whileHover={{
            scale: 1.025,
            y: -2,
            transition: { duration: 0.2 },
          }}
          whileTap={{
            scale: 0.98,
            y: 0,
            transition: { duration: 0.1 },
          }}
        >
          {/* Smooth Light Sheen Sliding Effect on Hover */}
          <div
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            style={{ transform: 'skewX(-20deg)' }}
          />

          {/* Button Text & Sliding Indicator */}
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>{isLastSlide ? 'ابدأ' : 'التالي'}</span>
            {isLastSlide && (
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1.5" />
            )}
          </span>
        </motion.button>
      </div>
    </div>
  );
};
