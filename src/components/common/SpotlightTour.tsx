import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Check } from 'lucide-react';
import { toArabicNumerals } from '../../lib/arabic';

interface SpotlightTourProps {
  onComplete: () => void;
}

interface TourStep {
  targetId: string;
  title: string;
  description: string;
}

export const SpotlightTour: React.FC<SpotlightTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = [
    {
      targetId: 'card-today-blessing',
      title: 'نعمة اليوم',
      description: 'نعمة متجددة يومياً بالتزامن مع جميع المستخدمين حول العالم، مصحوبة بآيتها وحديثها وتدبرها.'
    },
    {
      targetId: 'btn-start-reflection',
      title: 'استشعار النعمة',
      description: 'رحلة تفكّر هادئة من ٥ خطوات تنتقل بك من المعرفة إلى الشعور الصادق بالحمد.'
    },
    {
      targetId: 'card-daily-inspiration',
      title: 'حديث اليوم',
      description: 'قبس نبوي شريف يُعينك على التفكر والذكر، مع إمكانية مشاركته كبطاقة أنيقة.'
    },
    {
      targetId: 'tab-btn-tasbih',
      title: 'المسبحة وسجل الحمد',
      description: 'مسبحة إلكترونية هادئة في الشريط السفلي مع تسجيل تأملاتك اليومية المحفوظة بأمان على جهازك وحدك.'
    }
  ];

  const step = steps[currentStep];

  useEffect(() => {
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const updatePos = () => setTargetRect(el.getBoundingClientRect());
      updatePos();
      window.addEventListener('resize', updatePos);
      return () => window.removeEventListener('resize', updatePos);
    } else {
      setTargetRect(null);
    }
  }, [step.targetId, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto" dir="rtl">
      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-all duration-300" />

      {/* Spotlight cutout border */}
      {targetRect && (
        <div
          className="absolute rounded-3xl border-2 border-[#E4C368] shadow-[0_0_25px_rgba(228,195,104,0.4)] pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12
          }}
        />
      )}

      {/* Floating explanation card */}
      <div className="absolute bottom-16 inset-x-4 max-w-sm mx-auto z-10 animate-fade-in">
        <div className="bg-[#1E1E38] border border-[#C8A951]/40 rounded-3xl p-5 shadow-2xl space-y-3 text-right">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E4C368] bg-[#E4C368]/10 px-2.5 py-1 rounded-full border border-[#E4C368]/30">
              خطوة {toArabicNumerals(currentStep + 1)} من {toArabicNumerals(steps.length)}
            </span>
            <button
              onClick={onComplete}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors"
              aria-label="تخطي الجولة"
            >
              <X size={14} />
            </button>
          </div>

          <h3 className="text-base font-serif font-bold text-[#EDEDF5]">
            {step.title}
          </h3>

          <p className="text-xs text-[#C7C4D8] leading-relaxed">
            {step.description}
          </p>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={onComplete}
              className="text-xs text-[#AEAECB] hover:text-white py-2 px-3"
            >
              تخطي الجولة
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <span>{currentStep === steps.length - 1 ? 'فهمت' : 'التالي'}</span>
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
