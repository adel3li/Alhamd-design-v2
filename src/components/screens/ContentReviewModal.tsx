import React from 'react';
import { X } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { toArabicNumerals } from '../../lib/arabic';
import { getAllBlessings } from '../../data/loader';

interface ContentReviewModalProps {
  onClose: () => void;
}

export const ContentReviewModal: React.FC<ContentReviewModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-md bg-[#15152A] border border-[#2E2E4A] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#2E2E4A]">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1E1E38] text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
          <h2 className="text-sm font-bold text-[#EDEDF5]">عن المحتوى والتوثيق</h2>
          <div className="w-9" />
        </div>

        <div className="space-y-4 my-5 text-right">
          <GlassCard padding="p-4" className="space-y-2">
            <h4 className="text-xs font-bold text-[#E4C368]">الآيات القرآنية</h4>
            <p className="text-xs text-[#C7C4D8] leading-relaxed">
              جميع الآيات منقولة بالنص العثماني المعتمد من مجمع الملك فهد لطباعة المصحف الشريف، مع ذكر رقم الآية واسم السورة بدقة.
            </p>
          </GlassCard>

          <GlassCard padding="p-4" className="space-y-2">
            <h4 className="text-xs font-bold text-[#E4C368]">الأحاديث النبوية</h4>
            <p className="text-xs text-[#C7C4D8] leading-relaxed">
              نقتصر على الأحاديث الصحيحة والحسنة المخرجة في كتب السنة المعتمدة كصحيحي البخاري ومسلم، مع عزو كل حديث إلى مصدره.
            </p>
          </GlassCard>

          <GlassCard padding="p-4" className="space-y-2">
            <h4 className="text-xs font-bold text-[#E4C368]">أقوال العلماء والتدبر</h4>
            <p className="text-xs text-[#C7C4D8] leading-relaxed">
              كُتبت وقفات التدبّر بعناية لتقريب معاني النعم، ونُقلت أقوال أهل العلم كابن القيم وابن الجوزي وغيرهم مع ذكر المصدر أو التصريح بما هو مستفاد.
            </p>
          </GlassCard>
        </div>

        <div className="pt-2 text-center">
          <span className="text-xs text-[#AEAECB]">
            إجمالي النعم في التطبيق: {toArabicNumerals(getAllBlessings().length)} نعمة
          </span>
        </div>
      </div>
    </div>
  );
};
