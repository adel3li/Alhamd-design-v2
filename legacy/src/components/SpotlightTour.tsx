import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { storage } from '../services/storage';

type Step = {
  key: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'center';
};

const steps: Step[] = [
  {
    key: 'blessing',
    title: 'نعمة اليوم',
    body: 'هنا نعمةُ اليوم. تتغيّر كلَّ يوم، ويشاركك المسلمون حول العالم النعمةَ نفسها في اليوم نفسه.'
  },
  {
    key: 'reflect-toggle',
    title: 'تدبّر النعمة',
    body: 'اضغط هنا لتقرأ التدبّر كاملًا وتتعمّق في معاني النعمة وأثرها في حياتك.'
  },
  {
    key: 'feel-button',
    title: 'استشعر النعمة',
    body: 'قلبُ التجربة: تخيّل حياتك لو فقدتَ هذه النعمة، فتستشعر قيمتها الحقيقية… ويصدُق الحمد في القلب قبل اللسان.'
  },
  {
    key: 'share',
    title: 'شارك النعمة',
    body: 'انشُر أثر النعمة وذكّر بها من تحب.'
  },
  {
    key: 'settings',
    title: 'الإعدادات',
    body: 'من هنا تضبط التذكير اليومي، والمظهر، ونسخ بياناتك احتياطيًّا واستعادتها — دون أيِّ تسجيل دخول.',
    placement: 'top'
  },
  {
    key: 'continuity',
    title: 'محاسبتك مع نفسك',
    body: 'هنا تتابع استمراريتك في الحمد — لا نِقاطٌ ولا سلاسلُ ولا منافسة، بل محاسبةٌ هادئة للنفس. والقليل الدائم خيرٌ من الكثير المنقطع.',
    placement: 'top'
  },
  {
    key: 'final',
    title: 'بدأت رحلتك',
    body: 'عُد إلى نعمة اليوم كلَّ يوم، وداوم على الحمد.',
    placement: 'center'
  }
];

// Helper to clear and replay tour from elsewhere (e.g. settings)
export const replayTour = async () => {
  await storage.removeItem('alhamd:tourComplete');
  window.dispatchEvent(new Event('tour-replay'));
};

interface SpotlightTourProps {
  onTourComplete: () => void;
}

export const SpotlightTour: React.FC<SpotlightTourProps> = ({ onTourComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const currentStep = steps[currentIdx];
  const isFinalStep = currentIdx === steps.length - 1;

  // We only run this on first arrival
  useEffect(() => {
    setIsRendered(true);
  }, []);

  const updateRect = useCallback(() => {
    if (isFinalStep) {
      setTargetRect(null);
      return;
    }

    const key = currentStep.key;
    const el = document.querySelector(`[data-tour="${key}"]`);
    
    if (el) {
      // Scroll into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      
      // We need to wait for smooth scroll to finish, or just grab the rect
      // Let's use requestAnimationFrame loop briefly to track the rect during scroll
      let frameId: number;
      let count = 0;
      const trackScroll = () => {
        setTargetRect(el.getBoundingClientRect());
        if (count < 30) { // arbitrary ~500ms
          count++;
          frameId = requestAnimationFrame(trackScroll);
        }
      };
      
      trackScroll();

    } else {
      // Element not found - skip gracefully
      handleNext();
    }
  }, [currentIdx, isFinalStep]); // Need to watch currentIdx too

  // Re-run updateRect when step changes or window resizes
  useEffect(() => {
    if (isRendered) {
      updateRect();
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, { passive: true });
      return () => {
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
      };
    }
  }, [currentIdx, isRendered, updateRect]);

  const handleNext = () => {
    if (currentIdx < steps.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      finishTour();
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
    }
  };

  const finishTour = () => {
    onTourComplete();
  };

  // Accessibility: trap focus and handle keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finishTour();
      if (e.key === 'Enter' || e.key === 'ArrowLeft') handleNext(); // ArrowLeft is advance in RTL
      if (e.key === 'ArrowRight') handleBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIdx]);

  if (!isRendered) return null;

  // Mask logic
  // We'll use a large box-shadow around an absolutely positioned div, 
  // or point-events-none overlay.
  // Box shadow mask is easiest: `box-shadow: 0 0 0 9999px rgba(0,0,0,0.6)`
  
  const hasTarget = !!targetRect;
  
  const highlightStyle = hasTarget ? {
    top: targetRect.top - 8,
    left: targetRect.left - 8,
    width: targetRect.width + 16,
    height: targetRect.height + 16,
  } : {
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    transform: 'translate(-50%, -50%)' // Fallback
  };

  // Determine placement for callout
  let cardTop: string | number = '50%';
  let cardLeft: string | number = '50%';
  let cardY = '-50%';
  let cardX = '-50%';

  if (hasTarget && !isFinalStep) {
    const isTopPlacement = currentStep.placement === 'top' || (targetRect.top > window.innerHeight / 2 && currentStep.placement !== 'bottom');
    if (isTopPlacement) {
      // Put card above highlight
      cardTop = targetRect.top - 24; 
      cardY = '-100%';
    } else {
      // Put card below highlight
      cardTop = targetRect.bottom + 24;
      cardY = '0%';
    }
    // Clamp the horizontal position so the card doesn't bleed off screen.
    // The card has max-width: 384px and width: calc(100vw - 40px).
    const expectedWidth = Math.min(window.innerWidth - 40, 384);
    const halfWidth = expectedWidth / 2;
    const centerPoint = targetRect.left + targetRect.width / 2;
    
    // Ensure the center point is at least halfWidth + margin from both edges
    const clampedCenter = Math.max(halfWidth + 20, Math.min(window.innerWidth - halfWidth - 20, centerPoint));
    cardLeft = clampedCenter;
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto" dir="rtl" onClick={(e) => e.stopPropagation()}>
        {/* The dim overlay & spotlight cutout */}
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none overflow-hidden"
            >
               {hasTarget && !isFinalStep ? (
                  <motion.div
                     initial={false}
                     animate={{
                         top: highlightStyle.top,
                         left: highlightStyle.left,
                         width: highlightStyle.width,
                         height: highlightStyle.height
                     }}
                     transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 150, damping: 20 }}
                     className="absolute rounded-2xl ring-2 ring-[#C8A951] ring-offset-4 ring-offset-transparent outline-none"
                     style={{
                         boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
                     }}
                     aria-live="polite"
                     aria-label={`تحديد: ${currentStep.title}`}
                  />
               ) : (
                  <div className="absolute inset-0 bg-black/70" />
               )}
            </motion.div>
        </AnimatePresence>

        {/* The Callout Card */}
        <motion.div
           layout={!prefersReducedMotion}
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ 
               opacity: 1, 
               scale: 1,
               top: cardTop,
               left: cardLeft,
               x: cardX,
               y: cardY
           }}
           transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 25 }}
           className="absolute w-[calc(100vw-40px)] max-w-sm bg-[#20203A] border border-[#AEAECB]/20 rounded-2xl shadow-2xl p-6 pointer-events-auto z-10"
        >
             <h3 className="text-[#C8A951] font-bold text-xl mb-3 flex items-center justify-between">
                <span>{currentStep.title}</span>
                {!isFinalStep && (
                   <span className="text-xs font-normal text-[#AEAECB] opacity-70">
                      {currentIdx + 1} / {steps.length - 1}
                   </span>
                )}
             </h3>
             <p className="text-[#F4F4F8] text-base leading-[1.8] opacity-90 mb-6 font-sans">
                 {currentStep.body}
             </p>

             <div className="flex items-center justify-between flex-row-reverse">
                 <button
                    onClick={handleNext}
                    className="bg-[#6C63FF] text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#5A51E6] transition-colors active:scale-95"
                 >
                    {isFinalStep ? 'فهمت' : 'التالي'}
                 </button>
                 
                 <div className="flex gap-2">
                     {!isFinalStep && currentIdx > 0 && (
                        <button
                           onClick={handleBack}
                           className="text-[#F4F4F8] px-4 py-2.5 opacity-70 hover:opacity-100 transition-opacity text-sm font-medium"
                        >
                           السابق
                        </button>
                     )}
                     {!isFinalStep && (
                         <button
                           onClick={finishTour}
                           className="text-[#F4F4F8] px-3 py-2.5 opacity-40 hover:opacity-80 transition-opacity text-sm font-medium"
                        >
                           تخطّي
                        </button>
                     )}
                 </div>
             </div>
        </motion.div>
    </div>
  );
};
