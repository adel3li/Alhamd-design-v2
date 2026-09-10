import React from 'react';
import { X, ShieldCheck, HeartHandshake, Feather, BookMarked } from 'lucide-react';
import { BrandMark } from '../common/BrandMark';
import { GlassCard } from '../common/GlassCard';

interface AboutModalProps {
  onClose: () => void;
  onOpenContentReview: () => void;
  onOpenPrivacyPolicy: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  onClose,
  onOpenContentReview,
  onOpenPrivacyPolicy
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-md bg-[#15152A] border border-[#2E2E4A] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2E2E4A]">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1E1E38] text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
          <span className="text-sm font-semibold text-[#AEAECB]">عن التطبيق</span>
          <div className="w-9" />
        </div>

        {/* Brand identity */}
        <div className="flex flex-col items-center text-center my-6">
          <BrandMark size={40} showThread={true} />
          <span className="text-xs text-[#E4C368] font-bold mt-3 tracking-wider">
            نعمةٌ كلَّ يوم
          </span>
          <p className="text-sm font-serif text-[#EDEDF5] mt-3 max-w-xs">
            «من المعرفة إلى الشعور»
          </p>
        </div>

        {/* Core Pillars */}
        <div className="space-y-3 my-2">
          <GlassCard padding="p-4" className="flex items-start gap-3 text-right">
            <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 text-[#6C63FF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <HeartHandshake size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#EDEDF5]">الحمد موقف لا كلمة</h4>
              <p className="text-[11px] text-[#AEAECB] leading-relaxed mt-0.5">
                لا نعدّ النعم فحسب، بل نستشعر قيمتها عبر تخيّل غيابها ليصدق الحمد في القلب قبل اللسان.
              </p>
            </div>
          </GlassCard>

          <GlassCard padding="p-4" className="flex items-start gap-3 text-right">
            <div className="w-8 h-8 rounded-full bg-[#E4C368]/20 text-[#E4C368] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Feather size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#EDEDF5]">هادئ بلا سلاسل</h4>
              <p className="text-[11px] text-[#AEAECB] leading-relaxed mt-0.5">
                لا نقاط، ولا منافسة، ولا رسائل ذنب. ورد هادئ تحاسب به نفسك، والقليل الدائم خير من الكثير المنقطع.
              </p>
            </div>
          </GlassCard>

          <GlassCard padding="p-4" className="flex items-start gap-3 text-right">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#EDEDF5]">خصوصية تامة على جهازك</h4>
              <p className="text-[11px] text-[#AEAECB] leading-relaxed mt-0.5">
                بلا تسجيل دخول ولا خوادم. تأملاتك وسجلك محفوظ بأمان على هاتفك وحدك.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Links */}
        <div className="pt-4 border-t border-[#2E2E4A] flex flex-col gap-2">
          <button
            onClick={onOpenContentReview}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-semibold text-[#EDEDF5] flex items-center justify-between transition-colors"
          >
            <span>عن المحتوى والمراجعة العلمية</span>
            <BookMarked size={15} className="text-[#C8A951]" />
          </button>

          <button
            onClick={onOpenPrivacyPolicy}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-semibold text-[#AEAECB] hover:text-white flex items-center justify-between transition-colors"
          >
            <span>سياسة الخصوصية</span>
            <span className="text-[10px] text-[#AEAECB]">محلية بالكامل</span>
          </button>
        </div>

        {/* Version */}
        <div className="text-center pt-4">
          <span className="text-[11px] text-[#AEAECB]/60">
            الإصدار ١.٠.٠ • متاح الآن
          </span>
        </div>
      </div>
    </div>
  );
};
