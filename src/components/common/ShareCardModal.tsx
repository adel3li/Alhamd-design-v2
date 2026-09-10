import React, { useState, useRef } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { Blessing } from '../../types';

interface ShareCardModalProps {
  blessing: Blessing;
  type?: 'ayah' | 'tadabbur';
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  blessing,
  type = 'ayah',
  onClose
}) => {
  const [aspect, setAspect] = useState<'4:5' | '9:16'>('4:5'); // 1080x1350 vs 1080x1920
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const textToCopy = type === 'ayah' 
    ? `﴿${blessing.quran.textUthmani}﴾\n[سورة ${blessing.quran.surahName}: ${blessing.quran.ayahNumber}]\n\nنعمة اليوم: ${blessing.title}\n— تطبيق «الحمد»`
    : `«${blessing.title}»\n\n${blessing.openingLine}\n\n﴿${blessing.quran.textUthmani}﴾ [سورة ${blessing.quran.surahName}: ${blessing.quran.ayahNumber}]\n\n${blessing.tadabbur}\n\n— تطبيق «الحمد»`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      const width = 1080;
      const height = aspect === '4:5' ? 1350 : 1920;
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background ground
      ctx.fillStyle = '#15152A';
      ctx.fillRect(0, 0, width, height);

      // Subtle gradient vignette
      const radialGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width);
      radialGrad.addColorStop(0, 'rgba(30, 30, 56, 0.4)');
      radialGrad.addColorStop(1, 'rgba(17, 17, 38, 0.95)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // Card boundary
      const pad = 90;
      const cardW = width - pad * 2;
      const cardH = height - (aspect === '4:5' ? 320 : 440);
      const cardX = pad;
      const cardY = aspect === '4:5' ? 140 : 200;

      // Glass Card Fill
      ctx.save();
      ctx.fillStyle = 'rgba(30, 30, 56, 0.85)';
      ctx.strokeStyle = 'rgba(46, 46, 74, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 40);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Card Header: Category Chip
      ctx.save();
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      
      // Category pill
      ctx.font = 'bold 30px "IBM Plex Sans Arabic", sans-serif';
      ctx.fillStyle = '#C8A951';
      ctx.fillText(blessing.categoryLabel, width / 2, cardY + 90);

      // Blessing Title
      ctx.font = 'bold 64px "Amiri", serif';
      ctx.fillStyle = '#EDEDF5';
      ctx.fillText(blessing.title, width / 2, cardY + 180);

      // Divider line
      ctx.strokeStyle = 'rgba(200, 169, 81, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 120, cardY + 220);
      ctx.lineTo(width / 2 + 120, cardY + 220);
      ctx.stroke();

      // Sacred Quran Ayah Text
      ctx.font = 'bold 52px "Amiri Quran", "Amiri", serif';
      ctx.fillStyle = '#E4C368';
      const ayahText = `﴿ ${blessing.quran.textUthmani} ﴾`;
      
      // Simple multi-line text wrap for canvas
      const words = ayahText.split(' ');
      let line = '';
      let y = cardY + 330;
      const maxWidth = cardW - 140;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, width / 2, y);
          line = words[n] + ' ';
          y += 85;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, y);

      // Surah Reference
      ctx.font = '32px "IBM Plex Sans Arabic", sans-serif';
      ctx.fillStyle = '#AEAECB';
      ctx.fillText(`سورة ${blessing.quran.surahName}: ${blessing.quran.ayahNumber}`, width / 2, y + 80);

      // If tadabbur mode, write opening line
      if (type === 'tadabbur' && blessing.openingLine) {
        ctx.font = 'italic 34px "IBM Plex Sans Arabic", sans-serif';
        ctx.fillStyle = '#C7C4D8';
        ctx.fillText(blessing.openingLine, width / 2, y + 170);
      }

      ctx.restore();

      // Bottom Bar: Wordmark + Thread & Tagline
      ctx.save();
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.font = 'bold 44px "Amiri", serif';
      ctx.fillStyle = '#EDEDF5';
      ctx.fillText('الحمد', width / 2, height - 100);

      // Thread under wordmark
      const threadW = 100;
      ctx.strokeStyle = '#C8A951';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 2 - threadW / 2, height - 80);
      ctx.lineTo(width / 2 + threadW / 2, height - 80);
      ctx.stroke();

      // Dot on right
      ctx.fillStyle = '#E4C368';
      ctx.beginPath();
      ctx.arc(width / 2 + threadW / 2 + 4, height - 80, 5, 0, Math.PI * 2);
      ctx.fill();

      // Tagline
      ctx.font = '24px "IBM Plex Sans Arabic", sans-serif';
      ctx.fillStyle = '#AEAECB';
      ctx.fillText('نعمةٌ كلَّ يوم', width / 2, height - 42);
      ctx.restore();

      // Export as PNG
      const link = document.createElement('a');
      link.download = `alhamd-${blessing.shortTitle}-${aspect === '4:5' ? 'card' : 'story'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-[#15152A] border border-[#2E2E4A] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2E2E4A]/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAspect('4:5')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                aspect === '4:5' ? 'bg-[#6C63FF] text-white shadow-sm' : 'bg-[#1E1E38] text-[#AEAECB] hover:text-white'
              }`}
            >
              مربع (٤:٥)
            </button>
            <button
              onClick={() => setAspect('9:16')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                aspect === '9:16' ? 'bg-[#6C63FF] text-white shadow-sm' : 'bg-[#1E1E38] text-[#AEAECB] hover:text-white'
              }`}
            >
              قصة (٩:١٦)
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1E1E38] text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Card Preview */}
        <div className="my-5 flex justify-center">
          <div
            ref={cardRef}
            className={`w-full max-w-sm rounded-[24px] bg-[#1E1E38] border border-[#2E2E4A] p-6 shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden transition-all ${
              aspect === '4:5' ? 'min-h-[380px]' : 'min-h-[460px]'
            }`}
          >
            {/* Spotlight hint */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#6C63FF]/10 to-transparent pointer-events-none" />

            <div className="w-full flex flex-col items-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-[#C8A951] bg-[#C8A951]/10 border border-[#C8A951]/30 mb-3">
                {blessing.categoryLabel}
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#EDEDF5] mb-3">
                {blessing.title}
              </h3>
              <div className="w-16 h-[1.5px] bg-[#C8A951]/30 mb-4" />

              {/* Quran ayah text */}
              <p className="font-serif text-[#E4C368] text-xl sm:text-2xl leading-[2.1] font-medium my-2 px-2">
                ﴿ {blessing.quran.textUthmani} ﴾
              </p>
              <span className="text-xs text-[#AEAECB] mt-2">
                سورة {blessing.quran.surahName}: {blessing.quran.ayahNumber}
              </span>

              {type === 'tadabbur' && (
                <p className="text-xs text-[#C7C4D8] leading-relaxed mt-4 italic border-t border-[#2E2E4A] pt-3">
                  {blessing.openingLine}
                </p>
              )}
            </div>

            {/* Bottom brand signoff */}
            <div className="mt-6 flex flex-col items-center">
              <span className="font-serif text-lg font-bold text-[#EDEDF5]">الحمد</span>
              <div className="w-12 h-[2px] bg-gradient-to-l from-[#C8A951] to-transparent rounded-full mt-1 relative">
                <div className="absolute right-0 -top-[1.5px] w-1.5 h-1.5 rounded-full bg-[#E4C368]" />
              </div>
              <span className="text-[11px] text-[#AEAECB] mt-1">نعمةٌ كلَّ يوم</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-medium text-sm transition-colors shadow-lg active:scale-98 disabled:opacity-50"
          >
            <Download size={16} />
            <span>{downloading ? 'جارِ التحميل...' : 'حفظ الصورة'}</span>
          </button>
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-[#EDEDF5] font-medium text-sm transition-colors"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
