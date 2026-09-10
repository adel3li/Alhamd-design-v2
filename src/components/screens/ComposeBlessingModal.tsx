import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { CATEGORIES } from '../../constants/categories';
import { APP_STRINGS } from '../../constants/strings';
import { toArabicNumerals } from '../../lib/arabic';

interface ComposeBlessingModalProps {
  onClose: () => void;
  onSave: (data: {
    title: string;
    prompt1: string;
    prompt2: string;
    prompt3: string;
    category: string;
  }) => void;
}

export const ComposeBlessingModal: React.FC<ComposeBlessingModalProps> = ({
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [prompt1, setPrompt1] = useState('');
  const [prompt2, setPrompt2] = useState('');
  const [prompt3, setPrompt3] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      setError('يرجى كتابة اسم النعمة أولًا');
      return;
    }
    onSave({
      title: title.trim(),
      prompt1: prompt1.trim(),
      prompt2: prompt2.trim(),
      prompt3: prompt3.trim(),
      category
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#15152A] overflow-y-auto flex flex-col animate-fade-in" dir="rtl">
      {/* Header bar: Matches ref-05-compose.png */}
      <header className="sticky top-0 z-20 w-full px-5 py-4 bg-[#15152A]/90 backdrop-blur-md border-b border-[#2E2E4A] flex items-center justify-between">
        {/* Right side: الرجوع */}
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm font-medium text-[#AEAECB] hover:text-[#EDEDF5] transition-colors"
        >
          <ChevronRight size={18} />
          <span>رجوع</span>
        </button>

        {/* Center: العنوان */}
        <h2 className="text-base sm:text-lg font-bold font-serif text-[#EDEDF5]">
          {APP_STRINGS.composeTitle}
        </h2>

        {/* Left side: حفظ */}
        <button
          onClick={handleSave}
          className="text-sm font-bold text-[#6C63FF] hover:text-[#594DFF] px-2 py-1 transition-colors"
        >
          حفظ
        </button>
      </header>

      {/* Form Content */}
      <div className="w-full max-w-lg mx-auto p-5 sm:p-6 space-y-6 pb-28">
        {/* Subtitle */}
        <div className="text-right space-y-1">
          <span className="text-xs font-semibold text-[#C8A951]">نِعَمي</span>
          <p className="text-xs text-[#AEAECB] leading-relaxed">
            دوّن نعمةً خاصةً بك، واستشعر قيمتها.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Card 1: ما النعمة؟ */}
        <GlassCard padding="p-5" className="space-y-3">
          <label className="block text-sm font-bold text-[#EDEDF5]">
            {APP_STRINGS.prompts.what}
          </label>
          <input
            type="text"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder={APP_STRINGS.prompts.whatPlaceholder}
            className="w-full p-3.5 rounded-xl bg-[#15152A]/80 border border-[#2E2E4A] focus:border-[#C8A951] text-[#EDEDF5] placeholder-[#AEAECB]/40 text-sm outline-none transition-colors"
          />
        </GlassCard>

        {/* Card 2: Prompt 1 */}
        <GlassCard padding="p-5" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/40 text-[#6C63FF] text-xs font-bold flex items-center justify-center">
              {toArabicNumerals(1)}
            </span>
            <label className="text-xs sm:text-sm font-bold text-[#EDEDF5]">
              {APP_STRINGS.prompts.q1}
            </label>
          </div>
          <textarea
            value={prompt1}
            onChange={e => setPrompt1(e.target.value)}
            placeholder={APP_STRINGS.prompts.answerPlaceholder}
            rows={3}
            className="w-full p-3.5 rounded-xl bg-[#15152A]/80 border border-[#2E2E4A] focus:border-[#C8A951] text-[#EDEDF5] placeholder-[#AEAECB]/40 text-sm outline-none transition-colors resize-none leading-relaxed"
          />
        </GlassCard>

        {/* Card 3: Prompt 2 */}
        <GlassCard padding="p-5" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/40 text-[#6C63FF] text-xs font-bold flex items-center justify-center">
              {toArabicNumerals(2)}
            </span>
            <label className="text-xs sm:text-sm font-bold text-[#EDEDF5]">
              {APP_STRINGS.prompts.q2}
            </label>
          </div>
          <textarea
            value={prompt2}
            onChange={e => setPrompt2(e.target.value)}
            placeholder={APP_STRINGS.prompts.answerPlaceholder}
            rows={3}
            className="w-full p-3.5 rounded-xl bg-[#15152A]/80 border border-[#2E2E4A] focus:border-[#C8A951] text-[#EDEDF5] placeholder-[#AEAECB]/40 text-sm outline-none transition-colors resize-none leading-relaxed"
          />
        </GlassCard>

        {/* Card 4: Prompt 3 */}
        <GlassCard padding="p-5" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/40 text-[#6C63FF] text-xs font-bold flex items-center justify-center">
              {toArabicNumerals(3)}
            </span>
            <label className="text-xs sm:text-sm font-bold text-[#EDEDF5]">
              {APP_STRINGS.prompts.q3}
            </label>
          </div>
          <textarea
            value={prompt3}
            onChange={e => setPrompt3(e.target.value)}
            placeholder={APP_STRINGS.prompts.answerPlaceholder}
            rows={3}
            className="w-full p-3.5 rounded-xl bg-[#15152A]/80 border border-[#2E2E4A] focus:border-[#C8A951] text-[#EDEDF5] placeholder-[#AEAECB]/40 text-sm outline-none transition-colors resize-none leading-relaxed"
          />
        </GlassCard>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#AEAECB]">
            التصنيف (اختياري):
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.label)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === c.label
                    ? 'bg-[#C8A951] text-[#15152A] font-bold shadow-sm'
                    : 'bg-[#1E1E38] text-[#AEAECB] hover:text-white border border-[#2E2E4A]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Big Violet Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 px-6 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-base transition-colors shadow-lg shadow-[#6C63FF]/25 active:scale-[0.98] mt-4"
        >
          حفظ النعمة
        </button>
      </div>
    </div>
  );
};
