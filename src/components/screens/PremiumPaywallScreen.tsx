import React, { useEffect, useState } from 'react';
import { X, Compass, BookOpen, PauseCircle, Check, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';
import { trackJourneyEvent } from '../../lib/analytics';
import { setDeveloperPremium, FREE_STATION_LIMIT } from '../../lib/entitlements';
import { toArabicNumerals } from '../../lib/arabic';

export interface PremiumPaywallScreenProps {
  onClose: () => void;
  onUnlocked?: () => void;
  triggerReason?: 'free_limit_reached' | 'preview';
  completedFreeCount?: number;
  freeStationLimit?: number;
  targetStationTitle?: string;
}

export const PremiumPaywallScreen: React.FC<PremiumPaywallScreenProps> = ({
  onClose,
  onUnlocked,
  triggerReason = 'free_limit_reached',
  completedFreeCount = FREE_STATION_LIMIT,
  freeStationLimit = FREE_STATION_LIMIT,
  targetStationTitle
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    trackJourneyEvent('journey_paywall_viewed', {
      trigger_reason: triggerReason
    });
  }, [triggerReason]);

  const handleSelectPlan = (plan: 'annual' | 'lifetime') => {
    setSelectedPlan(plan);
    setNoticeMessage(null);
  };

  const handleSubscribeClick = () => {
    trackJourneyEvent('journey_paywall_cta_tapped', { plan: selectedPlan });
    // TODO: RevenueCat — Replace placeholder notice with actual RevenueCat purchasePackage(selectedPlan) call
    setNoticeMessage(
      'بوابة الاشتراك قيد الربط (RevenueCat). يمكنك تفعيل «رحلتي» للتجربة الآن عبر زر وضع المطوّر أدناه أو من الإعدادات.'
    );
  };

  const handleRestorePurchases = () => {
    // TODO: RevenueCat — Call Purchases.restorePurchases() and check active entitlements
    setNoticeMessage(
      'استعادة المشتريات ستعمل تلقائياً فور ربط خدمة RevenueCat. يمكنك حالياً التفعيل التجريبي من وضع المطوّر.'
    );
  };

  const handleDevUnlockNow = () => {
    setDeveloperPremium(true);
    if (onUnlocked) onUnlocked();
    onClose();
  };

  const benefits = [
    {
      id: 'personal-journey',
      icon: Compass,
      title: 'الرحلة الشخصية الكاملة',
      desc: 'فتح جميع محطات المسار ومنازل النِّعَم المتدرّجة لتسير معك خطوةً بخطوة وفق محاور اهتمامك ووتيرتك اليومية، بلا استعجال ولا ضغط.'
    },
    {
      id: 'private-journal',
      icon: BookOpen,
      title: 'اليوميات الخاصة والعمل اليومي',
      desc: 'مساحة تدوين تأملية خاصة لكل محطة مع عمل يومي يسير؛ تُحفظ نصوصك محلياً على جهازك فقط ولا تُرسل لأي خادم خارجي.'
    },
    {
      id: 'muhasaba-pauses',
      icon: PauseCircle,
      title: 'وقفات المحاسبة في ختام كل منزل',
      desc: 'وقفة مراجعة هادئة عند إتمام المحطات السبع لكل منزل تجمع لك خلاصة تأملاتك لتستحضر أثر النعمة في يومك وسلوكك.'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-paywall-title"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#15152A] border border-[#2E2E4A] p-6 sm:p-7 shadow-2xl space-y-5 my-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#AEAECB] px-3 py-1 rounded-xl bg-[#1E1E38] border border-[#2E2E4A]">
            رحلتي · المسار الخاص
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#AEAECB] hover:text-[#EDEDF5] transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Limit Contextual Notice when user attempts to exceed free station limit */}
        {triggerReason === 'free_limit_reached' && (
          <div className="p-3.5 rounded-2xl bg-[#6C63FF]/12 border border-[#6C63FF]/35 flex items-start gap-3 text-right">
            <div className="w-8 h-8 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex items-center justify-center text-[#E4C368] shrink-0 mt-0.5">
              <Sparkles size={16} />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#EDEDF5]">
                وصلتَ إلى نهاية المعاينة المجانية ({toArabicNumerals(Math.min(completedFreeCount, freeStationLimit))} من {toArabicNumerals(freeStationLimit)} محطات)
              </div>
              <p className="text-[11px] text-[#C7C4D8] leading-relaxed">
                {targetStationTitle
                  ? `لبدء التدبر في «${targetStationTitle}» وإكمال بقية محطات ومنازل الرحلة، يمكنك الترقية إلى الخطة الكاملة.`
                  : 'لإكمال بقية المحطات وفتح جميع منازل الرحلة ووقفات المحاسبة، يمكنك الترقية إلى الخطة الكاملة.'}
              </p>
            </div>
          </div>
        )}

        {/* Calm Header & Subtitle */}
        <div className="space-y-2 text-right">
          <h2
            id="premium-paywall-title"
            className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5] leading-snug"
          >
            رحلتك الخاصة مع النعم
          </h2>
          <p className="text-xs sm:text-sm text-[#C7C4D8] leading-relaxed">
            مساحة هادئة للغوص أعمق في منازل الشكر والامتنان، صُممت لترافقك بخصوصية تامة وبلا أي ضغوط أو تنبيهات مزعجة.
          </p>
        </div>

        {/* Three Core Benefits */}
        <div className="space-y-3" aria-label="مزايا الخطة المدفوعة">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.id}
                className="p-4 rounded-2xl bg-[#1E1E38]/85 border border-[#2E2E4A] flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/35 flex items-center justify-center text-[#6C63FF] shrink-0 mt-0.5">
                  <Icon size={18} />
                </div>
                <div className="space-y-1 text-right">
                  <h3 className="text-sm font-bold text-[#EDEDF5]">{benefit.title}</h3>
                  <p className="text-xs text-[#AEAECB] leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Plan Options: Annual & Lifetime with Price Placeholders (No countdowns, no fake urgency) */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-[#AEAECB] block text-right">
            اختر الخطة المناسبة لك:
          </span>

          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="خيارات الاشتراك">
            {/* Option 1: Annual */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedPlan === 'annual'}
              onClick={() => handleSelectPlan('annual')}
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                selectedPlan === 'annual'
                  ? 'bg-[#1E1E38] border-[#6C63FF] shadow-[0_0_20px_rgba(108,99,255,0.18)]'
                  : 'bg-[#1E1E38]/50 border-[#2E2E4A] hover:border-[#2E2E4A]/90'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-[#EDEDF5]">اشتراك سنوي</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    selectedPlan === 'annual'
                      ? 'bg-[#6C63FF] border-[#6C63FF] text-white'
                      : 'border-[#2E2E4A]'
                  }`}
                >
                  {selectedPlan === 'annual' && <Check size={12} />}
                </div>
              </div>

              <div className="pt-1 space-y-0.5">
                <div className="text-sm sm:text-base font-bold text-[#EDEDF5]">
                  [السعر السنوي]
                </div>
                <div className="text-[11px] text-[#AEAECB]">
                  يُجدَّد سنوياً · يمكن إلغاؤه بأي وقت
                </div>
              </div>
            </button>

            {/* Option 2: Lifetime */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedPlan === 'lifetime'}
              onClick={() => handleSelectPlan('lifetime')}
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                selectedPlan === 'lifetime'
                  ? 'bg-[#1E1E38] border-[#6C63FF] shadow-[0_0_20px_rgba(108,99,255,0.18)]'
                  : 'bg-[#1E1E38]/50 border-[#2E2E4A] hover:border-[#2E2E4A]/90'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-[#EDEDF5]">مدى الحياة</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    selectedPlan === 'lifetime'
                      ? 'bg-[#6C63FF] border-[#6C63FF] text-white'
                      : 'border-[#2E2E4A]'
                  }`}
                >
                  {selectedPlan === 'lifetime' && <Check size={12} />}
                </div>
              </div>

              <div className="pt-1 space-y-0.5">
                <div className="text-sm sm:text-base font-bold text-[#EDEDF5]">
                  [سعر مدى الحياة]
                </div>
                <div className="text-[11px] text-[#AEAECB]">
                  دفعة واحدة · دون اشتراك متكرر
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Privacy & local storage reassurance */}
        <div className="px-3.5 py-2.5 rounded-xl bg-[#1E1E38]/50 border border-[#2E2E4A]/80 flex items-center gap-2.5 text-right">
          <ShieldCheck size={16} className="text-[#AEAECB] shrink-0" />
          <p className="text-[11px] text-[#AEAECB] leading-relaxed">
            تبقى جميع يومياتك ووقفات محاسبتك محفوظة محلياً على جهازك وحده حتى بعد الاشتراك.
          </p>
        </div>

        {/* Developer / RevenueCat Notice */}
        {noticeMessage && (
          <div className="p-3.5 rounded-2xl bg-[#1E1E38] border border-[#6C63FF]/40 space-y-2.5 text-right animate-fade-in">
            <p className="text-xs text-[#C7C4D8] leading-relaxed">{noticeMessage}</p>
            <button
              type="button"
              onClick={handleDevUnlockNow}
              className="w-full py-2.5 px-4 rounded-xl bg-[#6C63FF]/20 hover:bg-[#6C63FF]/30 border border-[#6C63FF]/50 text-xs font-bold text-[#EDEDF5] transition-colors cursor-pointer"
            >
              تفعيل «رحلتي» الآن (وضع المطوّر)
            </button>
          </div>
        )}

        {/* Primary CTA & Reassurance */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleSubscribeClick}
            className="w-full py-4 px-6 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-[#6C63FF]/25 cursor-pointer"
          >
            {selectedPlan === 'annual'
              ? 'متابعة مع الاشتراك السنوي'
              : 'متابعة مع خطة مدى الحياة'}
          </button>

          <div className="flex items-center justify-between pt-1 px-1">
            <button
              type="button"
              onClick={handleRestorePurchases}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#AEAECB] hover:text-[#EDEDF5] transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>استعادة المشتريات</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-[#AEAECB] hover:text-[#EDEDF5] transition-colors cursor-pointer"
            >
              العودة للمسار المجاني
            </button>
          </div>

          {/* Mandatory clear reassurance sentence */}
          <p className="text-xs text-[#AEAECB] text-center font-medium pt-1 border-t border-[#2E2E4A]/60">
            نعمة اليوم والأذكار والتسبيح تبقى مجانية دائماً وبلا إعلانات
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumPaywallScreen;
