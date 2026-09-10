import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { analytics } from '../services/analytics';

// نصٌّ شرعي — منسوخ حرفيًا من مصدر معتمد (صحيح مسلم ٧٨٣ب — sunnah.com/muslim:783b).
// لا يُعدَّل برمجيًا مطلقًا. المراجعة العلمية مطلوبة قبل الإصدار الإنتاجي
// (بوابة الإصدار: pending_review → approved).
export const ONBOARDING_HADITH = {
  text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ",
  attribution: "رواه مسلم عن عائشة رضي الله عنها",
  sourceRef: "Sahih Muslim 783b — https://sunnah.com/muslim:783b",
  verifiedVerbatim: false,
  reviewStatus: "pending_review",
} as const;

// ----------------------------------------------------------------------
// Copy & Content Source of Truth (فصحى)
// ----------------------------------------------------------------------
type ScreenContent = {
  id: number;
  eyebrow: string;
  title: string;
  body: string;
  secondary?: string;
  hasHadithPlaceholder?: boolean;
};

const screens: ScreenContent[] = [
  {
    id: 1,
    eyebrow: "السلام عليكم ورحمة الله",
    title: "الحمد",
    body: "مساحةٌ هادئة لتتذكّر نِعَم الله، وتعيش الامتنان… نعمةً واحدة كلَّ يوم.",
  },
  {
    id: 2,
    eyebrow: "لماذا الحمد؟",
    title: "نِعَمٌ لا تُحصى… وقلوبٌ غَفَلَت",
    body: "نتقلّب في نِعَمٍ عظيمة كلَّ لحظة: نَفَسٌ يدخل، وقلبٌ ينبض، وبصرٌ يرى. لكنَّ كثرتها ودوامها يُنسياننا قيمتها. هنا نتوقّف قليلًا، ونُعيد للنعمة مكانتها في القلب.",
  },
  {
    id: 3,
    eyebrow: "كيف نُمارس الحمد؟",
    title: "لا نَعُدّ النِّعَم فحسب… بل نَستشعِر قيمتها",
    body: "في كلِّ يوم نأخذ نعمةً واحدة، ونتأمّلها بعمق: كيف كانت ستكون حياتنا لو فقدناها؟ حين نتخيّل غيابها، نُدرك حقيقة وجودها، فيصدُق الحمد في القلب قبل اللسان.",
  },
  {
    id: 4,
    eyebrow: "وَعْدُنا لك",
    title: "الاستمرار… لا المنافسة",
    body: "لا نِقاط، ولا سلاسل، ولا مقارنة بأحد. أنت ومحاسبة نفسك فقط. والقليل الدائم خيرٌ من الكثير المنقطع — نعمةٌ واحدة كلَّ يوم تكفي لتُحيي القلب.",
    secondary: "ويشاركك المسلمون حول العالم النعمةَ نفسها في اليوم نفسه.",
    hasHadithPlaceholder: true,
  },
  {
    id: 5,
    eyebrow: "قبل أن تبدأ",
    title: "رحلتك… بينك وبين الله",
    body: "لا حسابَ ولا تسجيلَ دخول. كلُّ تأمّلاتك تبقى على جهازك وحدك. ابدأ متى شئت، وعُد متى شئت.",
  }
];

const labels = {
  next: "التالي",
  back: "السابق",
  skip: "تخطٍّ",
  start: "ابدأ بأوّل نعمة"
};

// ----------------------------------------------------------------------
// Props & Component
// ----------------------------------------------------------------------
interface OnboardingProps {
  // Triggered when CTA pressed or bypassed via skip button.
  // Parent should switch view out of Onboarding and go straight to the welcome blessing.
  onComplete: () => void;
  onSkip?: (step: number) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const prefersReducedMotion = useReducedMotion();

  const isFirst = currentIdx === 0;
  const isLast = currentIdx === screens.length - 1;
  const screen = screens[currentIdx];

  const goNext = () => {
    if (!isLast) {
      setDirection(1);
      setCurrentIdx(i => i + 1);
    } else {
      finishOnboarding();
    }
  };

  const goBack = () => {
    if (!isFirst) {
      setDirection(-1);
      setCurrentIdx(i => i - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
        onSkip(currentIdx + 1);
    } else {
        finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    onComplete();
  };

  // Drag handlers for swipe capability
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipeThreshold = 50;
    // Note: RTL UI means moving visual right means swiping content from left.
    if (offset.x > swipeThreshold) {
      // Swiped right -> go next in RTL
      goNext();
    } else if (offset.x < -swipeThreshold) {
      // Swiped left -> go back in RTL
      goBack();
    }
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => {
      if (prefersReducedMotion) return { opacity: 0 };
      // Note: X direction is reversed for RTL sliding
      return {
        x: direction > 0 ? -40 : 40,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      if (prefersReducedMotion) return { opacity: 0 };
      return {
        zIndex: 0,
        x: direction < 0 ? -40 : 40,
        opacity: 0
      };
    }
  };

  // Staggered contents variants
  const itemVariant = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } }
  } : {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 250, damping: 25 } }
  };

  const containerVariant = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#15152A] text-[#F4F4F8] flex flex-col font-sans" dir="rtl">
      
      {/* Background Motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
         {/* Subtle Gold glow on screen 1 */}
         {isFirst && !prefersReducedMotion && (
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 0.4, scale: 1 }}
             transition={{ duration: 4, ease: "easeOut" }}
             className="absolute w-[80vw] h-[80vw] max-w-lg max-h-lg rounded-full blur-[100px]"
             style={{ background: 'radial-gradient(circle, #E7D3A1 0%, transparent 70%)' }}
           />
         )}
         {/* Abstract Geometric Element (Najmah / Star representation) */}
         <svg className="absolute opacity-[0.03] w-96 h-96 right-[-100px] top-[-50px]" viewBox="0 0 100 100">
           <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor"/>
           <path d="M14.6 14.6 L41 41 L14.6 85.4 L41 59 L85.4 85.4 L59 59 L85.4 14.6 L59 41 Z" fill="currentColor" opacity="0.5"/>
         </svg>
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex justify-between items-center px-6 pt-10 pb-4">
        {/* Empty space for alignment if back button isn't there */}
        <div className="w-16">
          {!isFirst && (
            <button 
              onClick={goBack}
              className="text-[#F4F4F8] opacity-60 hover:opacity-100 transition-opacity font-medium py-2 text-sm"
            >
              {labels.back}
            </button>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2.5 items-center justify-center" dir="ltr">
          {screens.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                currentIdx === i ? 'w-6 bg-[#C8A951]' : 'w-2 bg-[#AEAECB]/20'
              }`}
            />
          ))}
        </div>

        {/* Skip Container */}
        <div className="w-16 flex justify-end">
          {/* Skip everywhere except the final screen */}
          {!isLast && (
            <button 
              onClick={handleSkip}
              className="text-[#F4F4F8] opacity-40 hover:opacity-80 transition-opacity font-medium py-2 text-sm"
            >
              {labels.skip}
            </button>
          )}
        </div>
      </div>

      {/* Main Carousel Area */}
      <div className="flex-1 relative overflow-hidden z-10 flex text-center px-8">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIdx}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
            drag={isLast ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex flex-col items-center justify-center pt-8 pb-16 touch-pan-y"
          >
             <motion.div 
               variants={containerVariant} 
               initial="hidden" 
               animate="show"
               className="max-w-sm w-full flex flex-col items-center gap-6"
             >
                {/* Eyebrow */}
                <motion.span 
                  variants={itemVariant}
                  className="text-xs font-semibold tracking-wider text-[#C8A951] uppercase"
                >
                  {screen.eyebrow}
                </motion.span>
                
                {/* Title */}
                <motion.h1 
                  variants={itemVariant}
                  className={`text-[#F4F4F8] leading-snug drop-shadow-sm ${isFirst ? 'font-amiri text-6xl py-4 text-[#C8A951]' : 'font-sans text-3xl font-bold'}`}
                >
                  {screen.title}
                </motion.h1>

                <div className="h-4" />

                {/* Body Text */}
                <motion.p 
                  variants={itemVariant}
                  className="text-[#AEAECB] text-lg leading-[1.8] opacity-90 px-2"
                >
                  {screen.body}
                </motion.p>

                {/* Secondary line (if any) */}
                {screen.secondary && (
                   <motion.p 
                     variants={itemVariant}
                     className="text-sm font-medium text-[#C8A951] opacity-90 mt-2 px-6"
                   >
                     {screen.secondary}
                   </motion.p>
                )}

                {/* Hadith Placeholder / Block */}
                {screen.hasHadithPlaceholder && (
                  <motion.div 
                     variants={itemVariant}
                     className={`mt-6 w-full max-w-[280px] relative flex flex-col items-center justify-center ${ONBOARDING_HADITH.text ? "" : "min-h-[80px] rounded-xl border border-dashed border-[#C8A951]/40 bg-[#2A2A46] p-4"}`}
                  >
                     {ONBOARDING_HADITH.text ? (
                        <>
                           <p className="font-amiri text-[#C8A951] text-center text-xl md:text-2xl leading-loose">
                              <span className="opacity-50 ml-1">«</span>
                              {ONBOARDING_HADITH.text}
                              <span className="opacity-50 mr-1">»</span>
                           </p>
                           <p className="text-sm text-[#AEAECB] font-sans text-center mt-3">
                              {ONBOARDING_HADITH.attribution}
                           </p>
                        </>
                     ) : (
                        <>
                           {/* 
                               verified: false 
                               reviewStatus: "pending_review"
                               This slot is reserved for the hadith on consistent deeds. 
                               Do not populate this placeholder until text from a verified source is provided by a qualified scholar. 
                           */}
                           <span className="text-xs text-[#AEAECB]/40 italic absolute bottom-2 left-3">(مساحة للحديث الشريف)</span>
                           <div className="w-8 h-8 rounded-full bg-[#C8A951]/10 flex items-center justify-center">
                              <span className="text-[#C8A951] opacity-60 text-lg leading-none">« »</span>
                           </div>
                        </>
                     )}
                  </motion.div>
                )}
             </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-20 px-8 pb-12 pt-6 flex justify-center w-full">
         <button
            onClick={goNext}
            className={`w-full max-w-md py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]
              ${isLast 
                ? 'bg-[#6C63FF] text-[#FFFFFF] shadow-lg shadow-[#6C63FF]/20 hover:bg-[#5A51E6]' 
                : 'bg-[#20203A] text-[#F4F4F8] border border-[#AEAECB]/10 shadow-sm hover:bg-[#2A2A46]'
              }
            `}
         >
            {isLast ? labels.start : labels.next}
         </button>
      </div>

    </div>
  );
};


