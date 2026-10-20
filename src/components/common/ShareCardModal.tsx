import React, { useState, useRef } from 'react';
import { X, Download, Copy, Check, Share2, MessageCircle, Send } from 'lucide-react';
import { Blessing } from '../../types';
import { useStore } from '../../lib/store';
import { toArabicNumerals } from '../../lib/arabic';

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
  const { theme, triggerHaptic } = useStore();
  const [cardTheme, setCardTheme] = useState<'dark' | 'light'>(theme);
  const [contentMode, setContentMode] = useState<'ayah' | 'tadabbur'>(type);
  const [aspect, setAspect] = useState<'4:5' | '9:16'>('4:5'); // 1080x1350 vs 1080x1920
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharingNative, setSharingNative] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isLight = cardTheme === 'light';

  const textToCopy = contentMode === 'ayah' 
    ? `«${blessing.title}» — ${blessing.categoryLabel}\n${blessing.openingLine}\n\n﴿${blessing.quran.textUthmani}﴾\n[سورة ${blessing.quran.surahName} : ${toArabicNumerals(blessing.quran.ayahNumber)}]\n\n— تطبيق «الحمد»`
    : `«${blessing.title}» — ${blessing.categoryLabel}\n\n${blessing.openingLine}\n\n﴿${blessing.quran.textUthmani}﴾ [سورة ${blessing.quran.surahName} : ${toArabicNumerals(blessing.quran.ayahNumber)}]\n\n${blessing.tadabbur}\n\n— تطبيق «الحمد»`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      triggerHaptic('success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  // Render high-resolution 1080x1350 or 1080x1920 canvas following the Design System
  const renderCardCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const width = 1080;
    const height = aspect === '4:5' ? 1350 : 1920;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Palette tokens for Layl (Dark) vs Nahar (Light)
    const groundBg = isLight ? '#F4EDE3' : '#15152A';
    const cardFill = isLight ? '#FBF8F3' : '#1E1E38';
    const cardStroke = isLight ? 'rgba(185, 87, 59, 0.35)' : 'rgba(185, 87, 59, 0.18)';
    const primaryText = isLight ? '#2A1F19' : '#EDEDF5';
    const secondaryText = isLight ? '#4A3B32' : '#C7C4D8';
    const mutedText = isLight ? '#6B5A4E' : '#AEAECB';
    const accentStroke = isLight ? '#B9573B' : '#E4C368';
    const ayahTextCol = isLight ? '#2A1F19' : '#E4C368';

    // 1. Ground Fill
    ctx.fillStyle = groundBg;
    ctx.fillRect(0, 0, width, height);

    // 2. Inner Sacred Glass Card
    const pad = 84;
    const cardW = width - pad * 2;
    const cardH = height - (aspect === '4:5' ? 300 : 420);
    const cardX = pad;
    const cardY = aspect === '4:5' ? 110 : 160;

    ctx.save();
    ctx.fillStyle = cardFill;
    ctx.strokeStyle = cardStroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 42);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Typography & Content inside Card
    ctx.save();
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    // Category badge
    ctx.font = '600 28px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillStyle = isLight ? '#9E4A30' : '#C8A951';
    ctx.fillText(blessing.categoryLabel, width / 2, cardY + 95);

    // Blessing Title
    ctx.font = 'bold 64px "Amiri", serif';
    ctx.fillStyle = primaryText;
    ctx.fillText(blessing.title, width / 2, cardY + 185);

    // Opening Line
    ctx.font = '32px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillStyle = secondaryText;
    ctx.fillText(blessing.openingLine, width / 2, cardY + 255);

    // Sacred Quran Ayah Text
    ctx.font = '50px "Amiri Quran", "Amiri", serif';
    ctx.fillStyle = ayahTextCol;
    const ayahText = `﴿${blessing.quran.textUthmani}﴾`;

    const words = ayahText.split(' ');
    let line = '';
    let y = cardY + 375;
    const maxWidth = cardW - 140;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, width / 2, y);
        line = words[n] + ' ';
        y += 86;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, width / 2, y);

    // Surah Reference
    ctx.font = '30px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillStyle = mutedText;
    ctx.fillText(
      `سورة ${blessing.quran.surahName} : ${toArabicNumerals(blessing.quran.ayahNumber)}`,
      width / 2,
      y + 74
    );

    // Optional Tadabbur excerpt when in 'tadabbur' mode
    if (contentMode === 'tadabbur' && blessing.tadabbur) {
      ctx.font = '28px "IBM Plex Sans Arabic", sans-serif';
      ctx.fillStyle = secondaryText;
      const tadabburWords = blessing.tadabbur.split(' ');
      let tLine = '';
      let ty = y + 155;
      let linesCount = 0;
      for (let i = 0; i < tadabburWords.length; i++) {
        const test = tLine + tadabburWords[i] + ' ';
        if (ctx.measureText(test).width > maxWidth && i > 0) {
          ctx.fillText(tLine, width / 2, ty);
          tLine = tadabburWords[i] + ' ';
          ty += 52;
          linesCount++;
          if (linesCount >= 2) {
            tLine = tLine.trim() + '...';
            break;
          }
        } else {
          tLine = test;
        }
      }
      if (tLine) ctx.fillText(tLine, width / 2, ty);
    }

    ctx.restore();

    // 4. Bottom-Left Brand Signoff (العلامة أسفل اليسار)
    ctx.save();
    const signoffX = pad + 70;
    const signoffY = height - 80;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 46px "Amiri", serif';
    ctx.fillStyle = isLight ? '#2A1F19' : '#E4C368';
    ctx.fillText('الحمد', signoffX, signoffY);

    // Thread under wordmark
    const threadW = 92;
    ctx.strokeStyle = accentStroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(signoffX - threadW / 2, signoffY + 18);
    ctx.lineTo(signoffX + threadW / 2, signoffY + 18);
    ctx.stroke();

    // Dot on right end of thread
    ctx.fillStyle = accentStroke;
    ctx.beginPath();
    ctx.arc(signoffX + threadW / 2, signoffY + 18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return canvas;
  };

  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      const canvas = await renderCardCanvas();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `alhamd-${blessing.shortTitle}-${aspect === '4:5' ? 'card' : 'story'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      triggerHaptic('success');
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeSocialShare = async () => {
    setSharingNative(true);
    try {
      const canvas = await renderCardCanvas();
      if (canvas && navigator.share) {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const file = new File([blob], `alhamd-${blessing.shortTitle}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `نعمة اليوم: ${blessing.title}`,
              text: textToCopy,
              files: [file]
            });
            triggerHaptic('success');
            return;
          }
        }
        await navigator.share({
          title: `نعمة اليوم: ${blessing.title}`,
          text: textToCopy
        });
        triggerHaptic('success');
      } else {
        await handleCopyText();
      }
    } catch {
      // User cancelled share sheet
    } finally {
      setSharingNative(false);
    }
  };

  const handlePlatformShare = (platform: 'whatsapp' | 'x' | 'telegram') => {
    triggerHaptic('light');
    const encodedText = encodeURIComponent(textToCopy);
    const appUrl = encodeURIComponent(window.location.href);
    let shareUrl = '';

    if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${encodedText}`;
    } else if (platform === 'x') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    } else if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${appUrl}&text=${encodedText}`;
    }

    const a = document.createElement('a');
    a.href = shareUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-[#15152A] border border-[#2E2E4A] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2E2E4A]/80">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#EDEDF5]">
              مشاركة نعمة اليوم
            </h2>
            <p className="text-[11px] text-[#AEAECB]">
              شارك البطاقة أو انسخ النص عبر تطبيقات التواصل
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1E1E38] text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Customization Bar: Aspect Ratio + Content Mode + Card Theme */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
          {/* Aspect Ratio */}
          <div className="flex items-center gap-1.5 bg-[#1E1E38] p-1 rounded-xl border border-[#2E2E4A]">
            <button
              onClick={() => setAspect('4:5')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                aspect === '4:5' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
              }`}
            >
              مربع (٤:٥)
            </button>
            <button
              onClick={() => setAspect('9:16')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                aspect === '9:16' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
              }`}
            >
              قصة (٩:١٦)
            </button>
          </div>

          {/* Content Mode: Ayah vs Tadabbur */}
          <div className="flex items-center gap-1.5 bg-[#1E1E38] p-1 rounded-xl border border-[#2E2E4A]">
            <button
              onClick={() => setContentMode('ayah')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                contentMode === 'ayah' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
              }`}
            >
              مع الآية
            </button>
            <button
              onClick={() => setContentMode('tadabbur')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                contentMode === 'tadabbur' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
              }`}
            >
              مع التدبّر
            </button>
          </div>

          {/* Card Theme Style: Layl vs Nahar */}
          <div className="flex items-center gap-1.5 bg-[#1E1E38] p-1 rounded-xl border border-[#2E2E4A]">
            <button
              onClick={() => setCardTheme('dark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                cardTheme === 'dark' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
              }`}
            >
              ليل
            </button>
            <button
              onClick={() => setCardTheme('light')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                cardTheme === 'light' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
              }`}
            >
              نهار
            </button>
          </div>
        </div>

        {/* Live Card Preview matching Design Sheet Section 6 */}
        <div className="my-4 flex justify-center">
          <div
            ref={cardRef}
            style={{
              backgroundColor: isLight ? '#F4EDE3' : '#15152A',
              borderColor: isLight ? '#DCCFBE' : '#2E2E4A'
            }}
            className={`w-full max-w-sm rounded-[24px] border p-5 shadow-xl flex flex-col justify-between text-center relative overflow-hidden transition-all duration-300 ${
              aspect === '4:5' ? 'min-h-[360px]' : 'min-h-[430px]'
            }`}
          >
            <div
              className="w-full rounded-2xl p-5 flex flex-col items-center border transition-colors duration-300"
              style={{
                backgroundColor: isLight ? '#FBF8F3' : '#1E1E38',
                borderColor: isLight ? 'rgba(185, 87, 59, 0.35)' : 'rgba(185, 87, 59, 0.14)'
              }}
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium border mb-2.5"
                style={{
                  color: isLight ? '#9E4A30' : '#E4C368',
                  borderColor: isLight ? '#B9573B' : '#C8A951',
                  backgroundColor: isLight ? 'rgba(185, 87, 59, 0.1)' : 'rgba(200, 169, 81, 0.1)'
                }}
              >
                {blessing.categoryLabel}
              </span>
              <h3
                className="text-2xl font-serif font-bold mb-1.5"
                style={{ color: isLight ? '#2A1F19' : '#EDEDF5' }}
              >
                {blessing.title}
              </h3>
              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: isLight ? '#4A3B32' : '#C7C4D8' }}
              >
                {blessing.openingLine}
              </p>

              {/* Quran ayah text */}
              <div
                className="w-full rounded-xl p-3.5 my-1 border"
                style={{
                  backgroundColor: isLight ? '#EFE6D9' : '#1B1B33',
                  borderColor: isLight ? 'rgba(185, 87, 59, 0.3)' : 'rgba(185, 87, 59, 0.14)'
                }}
              >
                <p
                  className="font-quran text-lg sm:text-xl leading-[2.1]"
                  style={{ color: isLight ? '#2A1F19' : '#E4C368' }}
                >
                  ﴿{blessing.quran.textUthmani}﴾
                </p>
                <span
                  className="text-[11px] block mt-1.5"
                  style={{ color: isLight ? '#6B5A4E' : '#AEAECB' }}
                >
                  سورة {blessing.quran.surahName} : {toArabicNumerals(blessing.quran.ayahNumber)}
                </span>
              </div>

              {contentMode === 'tadabbur' && blessing.tadabbur && (
                <p
                  className="text-xs leading-relaxed mt-3 border-t pt-2.5 line-clamp-2"
                  style={{
                    color: isLight ? '#4A3B32' : '#C7C4D8',
                    borderColor: isLight ? '#DCCFBE' : '#2E2E4A'
                  }}
                >
                  {blessing.tadabbur}
                </p>
              )}
            </div>

            {/* Bottom-Left Brand Signoff (العلامة أسفل اليسار) */}
            <div className="mt-5 self-end inline-flex flex-col gap-1.5">
              <span
                className="font-serif text-xl font-bold leading-none"
                style={{ color: isLight ? '#2A1F19' : '#E4C368' }}
              >
                الحمد
              </span>
              <div className="flex items-center">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isLight ? '#B9573B' : '#E4C368' }}
                />
                <div
                  className="flex-1 h-[1.5px]"
                  style={{ backgroundColor: isLight ? '#B9573B' : '#E4C368' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons: Share Card via Native Sheet, Save PNG, Copy Text */}
        <div className="space-y-3">
          <button
            onClick={handleNativeSocialShare}
            disabled={sharingNative}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-sm transition-all shadow-lg active:scale-98 cursor-pointer disabled:opacity-60"
          >
            <Share2 size={17} />
            <span>{sharingNative ? 'جارِ تجهيز البطاقة...' : 'مشاركة البطاقة عبر التطبيقات'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-[#EDEDF5] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download size={16} className="text-[#E4C368]" />
              <span>{downloading ? 'جارِ الحفظ...' : 'حفظ كصورة (PNG)'}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-[#EDEDF5] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {copied ? <Check size={16} className="text-[#E4C368]" /> : <Copy size={16} className="text-[#C8A951]" />}
              <span>{copied ? 'تم نسخ النص' : 'نسخ نص النعمة'}</span>
            </button>
          </div>

          {/* Quick Social Platforms Strip */}
          <div className="pt-2 border-t border-[#2E2E4A]/70 flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#AEAECB]">مشاركة سريعة للنص:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlatformShare('whatsapp')}
                className="px-3 py-1.5 rounded-xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-medium text-[#EDEDF5] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="مشاركة عبر واتساب"
              >
                <MessageCircle size={14} className="text-emerald-500" />
                <span>واتساب</span>
              </button>

              <button
                onClick={() => handlePlatformShare('telegram')}
                className="px-3 py-1.5 rounded-xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-medium text-[#EDEDF5] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="مشاركة عبر تيليجرام"
              >
                <Send size={13} className="text-sky-500" />
                <span>تيليجرام</span>
              </button>

              <button
                onClick={() => handlePlatformShare('x')}
                className="px-3 py-1.5 rounded-xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-medium text-[#EDEDF5] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="مشاركة عبر منصة X"
              >
                <span className="font-bold text-xs">𝕏</span>
                <span>منصة X</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

