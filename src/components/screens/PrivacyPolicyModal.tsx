import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-[#15152A] border border-[#2E2E4A] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#2E2E4A]">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1E1E38] text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
          <h2 className="text-sm font-bold text-[#EDEDF5]">سياسة الخصوصية</h2>
          <div className="w-9" />
        </div>

        <div className="space-y-5 my-5 text-right text-xs leading-relaxed text-[#C7C4D8]">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck size={18} />
            <span>بياناتك بينك وبين الله، لا تغادر جهازك</span>
          </div>

          <p>
            نحن نحترم خصوصيتك التامة ونلتزم بحمايتها. صُمم تطبيق «الحمد» ليكون مساحة عبادة وتفكّر آمنة، دون أي حسابات أو خوادم تجمع بياناتك الشخصية.
          </p>

          <GlassCard padding="p-4" className="space-y-2">
            <h4 className="text-xs font-bold text-[#EDEDF5]">١. تخزين محلي على جهازك</h4>
            <p>
              جميع ما تكتبه في «سجل الحمد» وفي «نِعَمي»، وسجل أيام المداومة، يُخزّن محلياً على ذاكرة جهازك وحدك. لا نملك أي وسيلة للاطلاع على ما تدونه.
            </p>
          </GlassCard>

          <GlassCard padding="p-4" className="space-y-2">
            <h4 className="text-xs font-bold text-[#EDEDF5]">٢. النسخ الاحتياطي والاستعادة</h4>
            <p>
              النسخ الاحتياطي يتم يدوياً عن طريق تصدير ملف مشفّر نصياً تحتفظ به بنفسك أينما أردت، ويمكنك استرجاعه في أي وقت بضغطة زر.
            </p>
          </GlassCard>

          <GlassCard padding="p-4" className="space-y-2">
            <h4 className="text-xs font-bold text-[#EDEDF5]">٣. الإحصاءات التحسينية (اختيارية)</h4>
            <p>
              في حال موافقتك، تُجمع بيانات استخدام تقنية مجهولة الهوية تماماً (مثل فتح التطبيق أو إتمام جولة الاستشعار) بهدف تحسين استقرار التطبيق فقط، دون جمع أي نصوص أو معلومات شخصية إطلاقاً.
            </p>
          </GlassCard>

          <p className="text-[11px] text-[#AEAECB]">
            آخر تحديث: سبتمبر ٢٠٢٦ م • ربيع الأول ١٤٤٨ هـ
          </p>
        </div>
      </div>
    </div>
  );
};
