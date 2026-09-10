import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Blessing } from '../types';
import { X, CheckCircle } from 'lucide-react';
import { toEasternArabicNumerals } from '../utils';
import { analytics } from '../services/analytics';
import { haptics } from '../services/haptics';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mediaQuery.matches);
    const handleChange = () => setReduced(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  return reduced;
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

const THEME_ARCS = {
  dark: {
    ground: { bg: '#16213A', glow: '232, 201, 125', str: 0.7, vig: 0, text: '#F5EFE0', textDim: '#A1A6B8', size: 1.0 },
    visualize: { bg: '#0B1020', glow: '138, 143, 163', str: 0.15, vig: 0.5, text: '#C9CDD8', textDim: '#7A7F92', size: 1.0 },
    deepen: { bg: '#060912', glow: '107, 112, 128', str: 0.05, vig: 0.7, text: '#A1A6B8', textDim: '#5A5F70', size: 1.0 },
    return: { bg: '#131B33', glow: '217, 184, 106', str: 0.5, vig: 0.2, text: '#E3E8F5', textDim: '#9196A8', size: 1.0 },
    hamd: { bg: '#1A2440', glow: '240, 212, 138', str: 1.0, vig: 0, text: '#FFFFFF', textDim: '#B1B6C8', size: 1.5 },
    journal: { bg: '#1A2440', glow: '240, 212, 138', str: 1.0, vig: 0, text: '#FFFFFF', textDim: '#B1B6C8', size: 1.5 },
  },
  light: {
    ground: { bg: '#F7F1E3', glow: '212, 168, 67', str: 0.5, vig: 0, text: '#2B3247', textDim: '#6A6F80', size: 1.0 },
    visualize: { bg: '#E8E8EA', glow: '185, 188, 198', str: 0.1, vig: 0.35, text: '#4A4F5E', textDim: '#7A7F92', size: 1.0 },
    deepen: { bg: '#DDDEE2', glow: '185, 188, 198', str: 0.05, vig: 0.35, text: '#3A3F4E', textDim: '#6A6F80', size: 1.0 },
    return: { bg: '#EFEAD9', glow: '212, 168, 67', str: 0.4, vig: 0.15, text: '#3B4257', textDim: '#7A7F92', size: 1.0 },
    hamd: { bg: '#FAF4E2', glow: '201, 155, 46', str: 0.9, vig: 0, text: '#1F2538', textDim: '#5A5F70', size: 1.5 },
    journal: { bg: '#FAF4E2', glow: '201, 155, 46', str: 0.9, vig: 0, text: '#1F2538', textDim: '#5A5F70', size: 1.5 }
  }
};

const StaggeredText = ({ text, reducedMotion, onAllAppeared }: { text: string, reducedMotion: boolean, onAllAppeared: () => void }) => {
    const chunks = useMemo(() => text.match(/[^.،؟!…]+[.،؟!…]?/g) || [text], [text]);
    
    useEffect(() => {
        const totalTimeMs = ((chunks.length - 1) * 1.5 + 1.5) * 1000;
        const timer = setTimeout(onAllAppeared, totalTimeMs);
        return () => clearTimeout(timer);
    }, [chunks, onAllAppeared]);

    return (
        <span className="inline-block text-center max-w-[32ch] font-amiri" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', lineHeight: '2.1' }}>
            {chunks.map((chunk, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 1.5, duration: 1.8, ease: "easeOut" }}
                    className="inline ml-1 text-inherit"
                >
                    {chunk.trim()}{' '}
                </motion.span>
            ))}
        </span>
    );
};

const ProgressDots = ({ currentIndex, arc, colorTransition }: { currentIndex: number, arc: any, colorTransition: string }) => (
    <div className="flex gap-2 justify-center items-center" style={{ opacity: arc.str < 0.2 ? 0.3 : 1, transition: colorTransition }} dir="rtl">
       {[0, 1, 2, 3, 4].map(idx => {
         let dotClass = "rounded-full transition-all duration-500 box-border";
         let dotStyle: any = {};
         if (idx === currentIndex) {
           dotStyle = { backgroundColor: 'rgba(212, 175, 55, 1)', width: '8px', height: '8px' };
         } else if (idx < currentIndex) {
           dotStyle = { backgroundColor: 'rgba(212, 175, 55, 0.4)', width: '6px', height: '6px' };
         } else {
           dotStyle = { border: '1px solid rgba(212, 175, 55, 0.4)', width: '6px', height: '6px' };
         }
         return <div key={idx} className={dotClass} style={dotStyle} />;
       })}
    </div>
);

interface ReflectionProps {
  blessing: Blessing;
  onComplete: (journalText: string) => void;
  onClose: () => void;
}

export const ReflectionFlow: React.FC<ReflectionProps> = ({ blessing, onComplete, onClose }) => {
  const isDark = useDarkMode();
  const reducedMotion = useReducedMotion();

  const steps = useMemo(() => blessing.istisharSteps.map(s => ({
    type: s.type,
    text: s.text,
    dwell: s.durationSec
  })), [blessing]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [stepState, setStepState] = useState<'text-in' | 'text-out' | 'light-shift'>('text-in');
  const [textAppeared, setTextAppeared] = useState(false);
  const [dwellFinished, setDwellFinished] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [dhikrCount, setDhikrCount] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const currentStep = steps[currentStepIndex];
  const visualPhase = completed ? 'journal' : currentStep.type;
  
  // Type assertion ensures we use correct theme keys
  const activeTheme = isDark ? THEME_ARCS.dark : THEME_ARCS.light;
  const arc = activeTheme[visualPhase as keyof typeof activeTheme];

  const LIGHT_TRANSITION_MS = reducedMotion ? 800 : 2500;
  
  const bgTransition = `background-color ${LIGHT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  const colorTransition = `color ${LIGHT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), border-color ${LIGHT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  const circleTransition = `background-color ${LIGHT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow ${LIGHT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), border ${LIGHT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${LIGHT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  const opacityTransition = `opacity ${LIGHT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  useEffect(() => {
      if (stepState === 'text-in' && !completed) {
          if (currentStep.dwell > 0) {
              const timer = setTimeout(() => {
                  setDwellFinished(true);
              }, currentStep.dwell * 1000);
              return () => clearTimeout(timer);
          } else {
              setDwellFinished(true);
          }
      } else {
          setDwellFinished(false);
          setTextAppeared(false);
      }
  }, [stepState, currentStep.dwell, completed]);

  useEffect(() => {
    if (!completed) {
      analytics.capture('reflection_step_viewed', { blessing_id: blessing.id, step_type: steps[currentStepIndex].type });
    }
  }, [currentStepIndex, completed, blessing.id, steps]);

  const canAdvance = textAppeared;

  const handleNext = () => {
      if (stepState !== 'text-in') return;
      haptics.impact('light');
      
      setStepState('text-out');
      setTimeout(() => {
          if (currentStepIndex < steps.length - 1) {
              setCurrentStepIndex(prev => prev + 1);
              setStepState('light-shift');
              setTimeout(() => {
                  setStepState('text-in');
              }, LIGHT_TRANSITION_MS);
          } else {
              setCompleted(true);
              setStepState('text-in');
          }
      }, 400);
  };

  const finishFlow = (text: string) => {
      haptics.success();
      if (dhikrCount > 0) {
          analytics.capture("dhikr_session", { count: dhikrCount });
      }
      setIsCelebrating(true);
      setTimeout(() => {
          onComplete(text);
      }, 1600);
  };

  const closeFlow = () => {
      if (completed && dhikrCount > 0) {
          analytics.capture("dhikr_session", { count: dhikrCount });
      }
      onClose();
  };

  const handleDhikrTap = () => {
      haptics.impact('light');
      setDhikrCount(prev => prev + 1);
      setPulseKey(prev => prev + 1);
  };

  const vigColor = isDark ? '0, 0, 0' : '150, 150, 155';

  return (
    <div 
        className="fixed inset-0 z-50 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-hidden"
        style={{ 
            backgroundColor: arc.bg,
            transition: bgTransition
        }}
    >
      {/* Vignette Layer */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
           background: `radial-gradient(circle at center, transparent 30%, rgba(${vigColor}, 1) 120%)`,
           opacity: arc.vig,
           transition: opacityTransition
        }}
      />
      
      {/* Header / Close */}
      <div className="flex justify-start p-6 relative z-50">
        <button 
           onClick={closeFlow} 
           className="flex items-center group p-2 -m-2"
           style={{
              opacity: (visualPhase === 'visualize' || visualPhase === 'deepen') ? 0.4 : 1,
              transition: opacityTransition
           }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors backdrop-blur-sm"
               style={{ borderColor: `rgba(${arc.glow}, 0.2)`, color: arc.textDim, backgroundColor: `rgba(${arc.glow}, 0.05)` }}
          >
            <X className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Persistent Breathing Anchor */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex justify-center items-center pointer-events-none z-10 w-full">
        <motion.div
            animate={{ scale: reducedMotion ? 1 : [1, 1 + 0.05 * arc.str, 1] }} 
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            className="rounded-full flex items-center justify-center relative"
        >
             <div
                style={{
                    backgroundColor: `rgba(${arc.glow}, ${arc.str * 0.4})`,
                    boxShadow: `0 0 ${80 * arc.size}px ${40 * arc.size}px rgba(${arc.glow}, ${arc.str * 0.3})`,
                    border: `1px solid rgba(${arc.glow}, ${arc.str * 0.8})`,
                    transform: `scale(${arc.size})`,
                    transition: circleTransition,
                    width: isDark ? '80px' : '90px',
                    height: isDark ? '80px' : '90px',
                    borderRadius: '50%'
                }}
             >
                 {visualPhase === 'hamd' && stepState === 'text-in' && !completed && !reducedMotion && (
                   <motion.div
                     initial={{ scale: 1, opacity: 0.5, border: `1px solid rgba(${arc.glow}, 0.8)` }}
                     animate={{ scale: 1.8, opacity: 0 }}
                     transition={{ duration: 3, ease: 'easeOut' }}
                     className="absolute inset-0 rounded-full box-border"
                   />
                 )}
             </div>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center z-20 mt-16 sm:mt-24 pointer-events-none w-full">
        {!completed ? (
            <AnimatePresence mode="wait">
                {stepState === 'text-in' && (
                  <motion.div
                     key={currentStep.type}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.4 }}
                     className="max-w-xl flex flex-col items-center justify-center w-full"
                     style={{ color: arc.text, transition: colorTransition }}
                  >
                     <StaggeredText text={currentStep.text} reducedMotion={reducedMotion} onAllAppeared={() => setTextAppeared(true)} />
                     {currentStep.type === 'hamd' && blessing.duaa && (
                        <motion.p 
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1.5 }}
                           className="pt-8 leading-loose font-amiri"
                           style={{ color: arc.textDim, fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', transition: colorTransition }}
                         >
                            {blessing.duaa}
                        </motion.p>
                     )}
                  </motion.div>
                )}
            </AnimatePresence>
        ) : (
             <motion.div
               initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.5 }}
               className="max-w-md w-full space-y-8 flex flex-col items-center pointer-events-auto"
               style={{ color: arc.text, transition: colorTransition }}
             >
                 <div className="w-full space-y-4 text-center pb-6 border-b" style={{ borderColor: `rgba(${arc.glow}, 0.2)` }}>
                  <p className="text-xl leading-loose font-amiri" style={{ color: arc.textDim }}>
                    {blessing.journalPrompt}
                  </p>
                  <textarea
                    className="w-full h-28 p-4 rounded-xl outline-none text-right resize-none font-sans transition-all duration-300"
                    style={{ 
                        backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
                        border: `1px solid rgba(${arc.glow}, 0.2)`,
                        color: arc.text
                    }}
                    placeholder="اكتب حمدك..."
                    value={journalText}
                    onChange={e => setJournalText(e.target.value)}
                    dir="auto"
                  />
                </div>
                
                <div className="w-full flex flex-col items-center justify-center py-2">
                    <div
                        onClick={handleDhikrTap}
                        className="rounded-full flex items-center justify-center relative cursor-pointer outline-none"
                    >
                         {/* Continuous pulsing rings to indicate it's a button */}
                         {!reducedMotion && (
                             <>
                                 <motion.div
                                    className="absolute inset-0 rounded-full z-0 pointer-events-none"
                                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                    style={{ border: `2px solid rgba(${arc.glow}, 0.5)` }}
                                 />
                                 <motion.div
                                    className="absolute inset-0 rounded-full z-0 pointer-events-none"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                                    style={{ border: `2px solid rgba(${arc.glow}, 0.6)` }}
                                 />
                             </>
                         )}
                         <motion.div
                            animate={{ scale: reducedMotion ? 1 : [1, 1.08, 1] }} 
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            className="rounded-full flex items-center justify-center relative select-none z-10"
                            style={{
                                backgroundColor: `rgba(${arc.glow}, ${arc.str * 0.3})`,
                                boxShadow: `0 0 ${30 * arc.size}px ${15 * arc.size}px rgba(${arc.glow}, ${arc.str * 0.25})`,
                                border: `2px solid rgba(${arc.glow}, ${arc.str * 0.6})`,
                                width: isDark ? '50px' : '60px',
                                height: isDark ? '50px' : '60px',
                            }}
                         >
                            <AnimatePresence>
                               {pulseKey > 0 && !reducedMotion && (
                                 <motion.div
                                   key={pulseKey}
                                   initial={{ scale: 1, opacity: 0.8, border: `3px solid rgba(${arc.glow}, 0.8)` }}
                                   animate={{ scale: 1.8, opacity: 0 }}
                                   transition={{ duration: 0.5, ease: 'easeOut' }}
                                   className="absolute inset-0 rounded-full box-border"
                                 />
                               )}
                            </AnimatePresence>
                         </motion.div>
                    </div>
                    <div className="mt-3 flex flex-col items-center opacity-80" style={{ color: arc.textDim }}>
                        <span className="font-amiri text-lg mb-0.5">الحمد لله</span>
                        <span className="font-amiri text-sm opacity-60 flex items-center gap-2 h-5">
                            {dhikrCount > 0 && (
                               <>
                                 {toEasternArabicNumerals(dhikrCount)}
                                 {dhikrCount >= 33 && (
                                    <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                                 )}
                               </>
                            )}
                        </span>
                    </div>
                </div>

                <div className="w-full space-y-3">
                   <button 
                      onClick={() => finishFlow(journalText)}
                      className="w-full py-4 rounded-xl font-bold text-lg transition-opacity hover:opacity-90 shadow-lg"
                      style={{
                          backgroundColor: `rgba(${arc.glow}, 0.9)`,
                          color: '#1A1D24' // consistent high contrast on gold
                      }}
                    >
                      {journalText.trim() ? "حفظ في سجل الحمد" : "إتمام"}
                    </button>
                    {!journalText.trim() && (
                       <button 
                       onClick={() => finishFlow("")}
                       className="w-full py-4 font-medium transition-opacity hover:opacity-90"
                       style={{ color: arc.textDim }}
                     >
                       لاحقًا
                     </button>
                    )}
                </div>
             </motion.div>
        )}
      </div>

      {/* Footer Navigation */}
      {!completed && (
        <div className="absolute bottom-10 left-0 right-0 p-6 flex flex-col items-center justify-center z-50">
            <div className="mb-6">
                <ProgressDots currentIndex={currentStepIndex} arc={arc} colorTransition={colorTransition} />
            </div>

            <div className="h-12 flex justify-center items-center">
                <AnimatePresence mode="wait">
                    {canAdvance && stepState === 'text-in' && (
                        <motion.button 
                            initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                            whileHover={reducedMotion ? {} : { scale: 1.05 }}
                            whileTap={reducedMotion ? {} : { scale: 0.95 }}
                            onClick={handleNext}
                            className="px-10 py-3 font-medium text-lg border rounded-full transition-colors backdrop-blur-sm"
                            style={{
                                color: `rgba(${arc.glow}, 1)`,
                                borderColor: `rgba(${arc.glow}, 0.3)`,
                                backgroundColor: `rgba(${arc.glow}, 0.05)`
                            }}
                        >
                            {currentStep.type === 'hamd' ? 'الحمد لله' : 'التالي'}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
      )}

      {/* Celebration Overlay */}
      <AnimatePresence>
        {isCelebrating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-md"
            style={{ backgroundColor: 'rgba(20, 20, 25, 0.4)' }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center"
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl"
                style={{ backgroundColor: `rgba(${arc.glow}, 0.9)` }}
              >
                <CheckCircle color="#1A1D24" size={48} strokeWidth={2.5} />
              </div>
              <motion.h2 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white text-center shadow-sm drop-shadow-md"
              >
                تقبل الله منكم
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

