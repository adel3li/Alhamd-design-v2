import React, { useState, useRef } from 'react';
import { X, Download, Copy, Check, Share2, MessageCircle, Send, Image as ImageIcon, FileText, Sparkles } from 'lucide-react';
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
  type = 'tadabbur',
  onClose
}) => {
  const { theme, triggerHaptic } = useStore();
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [cardTheme, setCardTheme] = useState<'dark' | 'light' | 'royal'>(theme === 'light' ? 'light' : 'dark');
  const [contentMode, setContentMode] = useState<'ayah' | 'tadabbur' | 'full'>(type === 'ayah' ? 'ayah' : 'tadabbur');
  const [aspect, setAspect] = useState<'4:5' | '9:16'>('4:5');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);
  const [sharingNative, setSharingNative] = useState(false);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isLight = cardTheme === 'light';
  const isRoyal = cardTheme === 'royal';

  // Build richly formatted Arabic text for copying
  const buildFormattedBlessingText = (): string => {
    const lines: string[] = [
      `✨ ━━━ « ${blessing.title} » ━━━ ✨`,
      `🏷️ المحور: ${blessing.categoryLabel}`,
      '',
      `${blessing.openingLine}`,
      '',
      `📖 الآية الكريمة:`,
      `﴿ ${blessing.quran.textUthmani} ﴾`,
      `[سورة ${blessing.quran.surahName} · الآية ${toArabicNumerals(blessing.quran.ayahNumber)}]`
    ];

    if (contentMode === 'tadabbur' || contentMode === 'full') {
      if (blessing.tadabbur) {
        lines.push('', `💭 وقفة تدبّر:`, `${blessing.tadabbur}`);
      }
    }

    if (contentMode === 'full') {
      if (blessing.hadith?.text) {
        lines.push(
          '',
          `🌿 من الهدي النبوي:`,
          `«${blessing.hadith.text}» (${blessing.hadith.source})`
        );
      }
      if (blessing.duaa) {
        lines.push('', `🤲 دعاء النعمة:`, `«${blessing.duaa}»`);
      }
    } else if (blessing.duaa && contentMode === 'tadabbur') {
      lines.push('', `🤲 دعاء النعمة:`, `«${blessing.duaa}»`);
    }

    lines.push('', `━━━━━━━━━━━━━━`, `— تطبيق «الحمد» لتأمل النعم`);
    return lines.join('\n');
  };

  const textToCopy = buildFormattedBlessingText();

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      triggerHaptic('success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy method for restricted contexts
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        triggerHaptic('success');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
      document.body.removeChild(textarea);
    }
  };

  // Word-wrap helper for Arabic canvas rendering
  const wrapCanvasText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines = 6
  ): string[] => {
    const words = text.trim().split(/\s+/);
    const result: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        result.push(currentLine);
        currentLine = words[i];
        if (result.length >= maxLines - 1) {
          const remaining = words.slice(i).join(' ');
          if (ctx.measureText(remaining).width > maxWidth) {
            let truncated = words[i];
            for (let j = i + 1; j < words.length; j++) {
              const nextTry = `${truncated} ${words[j]}`;
              if (ctx.measureText(`${nextTry}...`).width > maxWidth) break;
              truncated = nextTry;
            }
            currentLine = `${truncated}...`;
          } else {
            currentLine = remaining;
          }
          break;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) result.push(currentLine);
    return result;
  };

  // Render high-resolution 1080x1350 or 1080x1920 custom blessing image canvas
  const renderCardCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const width = 1080;
    const height = aspect === '4:5' ? 1350 : 1920;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Palette tokens for Layl (Dark), Nahar (Light), and Royal (Indigo/Gold)
    const groundBg = isLight ? '#F4EDE3' : isRoyal ? '#0F1026' : '#15152A';
    const cardFill = isLight ? '#FBF8F3' : isRoyal ? '#171836' : '#1E1E38';
    const cardStroke = isLight
      ? 'rgba(185, 87, 59, 0.35)'
      : isRoyal
      ? 'rgba(228, 195, 104, 0.45)'
      : 'rgba(228, 195, 104, 0.22)';
    const primaryText = isLight ? '#2A1F19' : '#EDEDF5';
    const secondaryText = isLight ? '#4A3B32' : '#C7C4D8';
    const mutedText = isLight ? '#6B5A4E' : '#AEAECB';
    const accentStroke = isLight ? '#B9573B' : '#E4C368';
    const ayahTextCol = isLight ? '#2A1F19' : '#E4C368';
    const ayahBoxFill = isLight ? '#EFE6D9' : isRoyal ? '#12132B' : '#16162C';

    // 1. Ground Fill + Subtle Radial Glow
    ctx.fillStyle = groundBg;
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(width / 2, height * 0.35, 60, width / 2, height * 0.45, width * 0.7);
    grad.addColorStop(0, isLight ? 'rgba(228, 195, 104, 0.14)' : 'rgba(108, 99, 255, 0.14)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Inner Sacred Card
    const pad = 76;
    const cardW = width - pad * 2;
    const cardH = height - (aspect === '4:5' ? 240 : 320);
    const cardX = pad;
    const cardY = aspect === '4:5' ? 90 : 130;

    ctx.save();
    ctx.fillStyle = cardFill;
    ctx.strokeStyle = cardStroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 44);
    ctx.fill();
    ctx.stroke();

    // Inner ornamental frame border
    ctx.strokeStyle = isLight ? 'rgba(185, 87, 59, 0.14)' : 'rgba(228, 195, 104, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX + 20, cardY + 20, cardW - 40, cardH - 40, 32);
    ctx.stroke();
    ctx.restore();

    // 3. Typography & Content inside Card
    ctx.save();
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    let cursorY = cardY + 95;
    const maxTextWidth = cardW - 140;

    // Category badge
    ctx.font = '600 26px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillStyle = isLight ? '#9E4A30' : '#E4C368';
    ctx.fillText(`✦ ${blessing.categoryLabel} ✦`, width / 2, cursorY);

    // Blessing Title
    cursorY += 80;
    ctx.font = 'bold 58px "Amiri", serif';
    ctx.fillStyle = primaryText;
    ctx.fillText(blessing.title, width / 2, cursorY);

    // Opening Line
    cursorY += 64;
    ctx.font = '29px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillStyle = secondaryText;
    const openingLines = wrapCanvasText(ctx, blessing.openingLine, maxTextWidth, 2);
    for (const line of openingLines) {
      ctx.fillText(line, width / 2, cursorY);
      cursorY += 46;
    }

    // Sacred Quran Ayah Box
    cursorY += 20;
    ctx.font = '44px "Amiri Quran", "Amiri", serif';
    const ayahString = `﴿ ${blessing.quran.textUthmani} ﴾`;
    const ayahLines = wrapCanvasText(ctx, ayahString, maxTextWidth - 60, 4);
    const ayahBoxHeight = ayahLines.length * 76 + 96;

    ctx.save();
    ctx.fillStyle = ayahBoxFill;
    ctx.strokeStyle = cardStroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX + 54, cursorY, cardW - 108, ayahBoxHeight, 28);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    let ayahCursorY = cursorY + 68;
    ctx.fillStyle = ayahTextCol;
    for (const aLine of ayahLines) {
      ctx.fillText(aLine, width / 2, ayahCursorY);
      ayahCursorY += 74;
    }

    // Surah Reference inside Ayah Box
    ctx.font = '26px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillStyle = mutedText;
    ctx.fillText(
      `سورة ${blessing.quran.surahName} · الآية ${toArabicNumerals(blessing.quran.ayahNumber)}`,
      width / 2,
      ayahCursorY + 8
    );

    cursorY += ayahBoxHeight + 58;

    // Tadabbur reflection excerpt when in 'tadabbur' or 'full' mode
    if ((contentMode === 'tadabbur' || contentMode === 'full') && blessing.tadabbur) {
      ctx.font = '600 25px "IBM Plex Sans Arabic", sans-serif';
      ctx.fillStyle = isLight ? '#9E4A30' : '#E4C368';
      ctx.fillText('وقفة تدبّر', width / 2, cursorY);
      cursorY += 48;

      ctx.font = '28px "IBM Plex Sans Arabic", sans-serif';
      ctx.fillStyle = secondaryText;
      const maxTadabburLines = aspect === '9:16' ? 4 : 3;
      const tLines = wrapCanvasText(ctx, blessing.tadabbur, maxTextWidth, maxTadabburLines);
      for (const tLine of tLines) {
        ctx.fillText(tLine, width / 2, cursorY);
        cursorY += 48;
      }
    }

    // Optional Duaa when in 'full' mode (or if space permits in 9:16)
    if (contentMode === 'full' && blessing.duaa && cursorY < cardY + cardH - 110) {
      cursorY += 20;
      ctx.font = 'italic 32px "Amiri", serif';
      ctx.fillStyle = primaryText;
      const duaaLines = wrapCanvasText(ctx, `«${blessing.duaa}»`, maxTextWidth, 2);
      for (const dLine of duaaLines) {
        ctx.fillText(dLine, width / 2, cursorY);
        cursorY += 50;
      }
    }

    ctx.restore();

    // 4. Bottom Brand Signoff
    ctx.save();
    const signoffX = width / 2;
    const signoffY = height - 68;
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.font = 'bold 42px "Amiri", serif';
    ctx.fillStyle = isLight ? '#2A1F19' : '#E4C368';
    ctx.fillText('الحمد · لتأمل النعم', signoffX, signoffY);

    const threadW = 140;
    ctx.strokeStyle = accentStroke;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(signoffX - threadW / 2, signoffY + 18);
    ctx.lineTo(signoffX + threadW / 2, signoffY + 18);
    ctx.stroke();
    ctx.restore();

    return canvas;
  };

  const handleGenerateAndDownloadImage = async () => {
    setDownloading(true);
    try {
      const canvas = await renderCardCanvas();
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedPreviewUrl(dataUrl);
      const link = document.createElement('a');
      link.download = `alhamd-${blessing.shortTitle || blessing.id}-${aspect === '4:5' ? 'card' : 'story'}.png`;
      link.href = dataUrl;
      link.click();
      triggerHaptic('success');
      setImageSaved(true);
      setTimeout(() => setImageSaved(false), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeSocialShare = async () => {
    setSharingNative(true);
    try {
      const canvas = await renderCardCanvas();
      if (canvas && navigator.share) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const file = new File([blob], `alhamd-${blessing.shortTitle || blessing.id}.png`, {
            type: 'image/png'
          });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `نعمة: ${blessing.title}`,
              text: textToCopy,
              files: [file]
            });
            triggerHaptic('success');
            return;
          }
        }
        await navigator.share({
          title: `نعمة: ${blessing.title}`,
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
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#15152A] border border-[#2E2E4A] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#2E2E4A]/80">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#EDEDF5]">
              مشاركة النعمة والاحتفاظ بها
            </h2>
            <p className="text-[11px] text-[#AEAECB]">
              انسخ نص النعمة بتنسيق جميل أو أنشئ صورة مخصصة للاحتفاظ بها
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1E1E38] text-[#AEAECB] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق نافذة المشاركة"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs: Custom Image vs Formatted Text */}
        <div className="grid grid-cols-2 gap-2 p-1 mt-3.5 rounded-2xl bg-[#1E1E38] border border-[#2E2E4A]">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('image');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-[#6C63FF] text-white shadow-sm'
                : 'text-[#AEAECB] hover:text-[#EDEDF5]'
            }`}
          >
            <ImageIcon size={15} />
            <span>إنشاء صورة مخصصة</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('text');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-[#6C63FF] text-white shadow-sm'
                : 'text-[#AEAECB] hover:text-[#EDEDF5]'
            }`}
          >
            <FileText size={15} />
            <span>نسخ النص المنسّق</span>
          </button>
        </div>

        {/* Customization Controls (Content Level + Image Style when on Image Tab) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
          {/* Content Mode */}
          <div className="flex items-center gap-1 bg-[#1E1E38] p-1 rounded-xl border border-[#2E2E4A]">
            <button
              type="button"
              onClick={() => setContentMode('ayah')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                contentMode === 'ayah' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
              }`}
            >
              مع الآية
            </button>
            <button
              type="button"
              onClick={() => setContentMode('tadabbur')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                contentMode === 'tadabbur' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
              }`}
            >
              مع التدبّر
            </button>
            <button
              type="button"
              onClick={() => setContentMode('full')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                contentMode === 'full' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
              }`}
            >
              شاملة مع الدعاء
            </button>
          </div>

          {activeTab === 'image' && (
            <>
              {/* Aspect Ratio */}
              <div className="flex items-center gap-1 bg-[#1E1E38] p-1 rounded-xl border border-[#2E2E4A]">
                <button
                  type="button"
                  onClick={() => setAspect('4:5')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    aspect === '4:5' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
                  }`}
                >
                  بطاقة (٤:٥)
                </button>
                <button
                  type="button"
                  onClick={() => setAspect('9:16')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    aspect === '9:16' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
                  }`}
                >
                  قصة (٩:١٦)
                </button>
              </div>

              {/* Card Theme Style */}
              <div className="flex items-center gap-1 bg-[#1E1E38] p-1 rounded-xl border border-[#2E2E4A]">
                <button
                  type="button"
                  onClick={() => setCardTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    cardTheme === 'dark' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
                  }`}
                >
                  ليل
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('royal')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    cardTheme === 'royal' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
                  }`}
                >
                  ملكي
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('light')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    cardTheme === 'light' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#AEAECB] hover:text-white'
                  }`}
                >
                  نهار
                </button>
              </div>
            </>
          )}
        </div>

        {/* Main Content Preview: Either Live Image Card or Formatted Text Box */}
        {activeTab === 'image' ? (
          <div className="my-4 flex flex-col items-center">
            <div
              ref={cardRef}
              style={{
                backgroundColor: isLight ? '#F4EDE3' : isRoyal ? '#0F1026' : '#15152A',
                borderColor: isLight ? '#DCCFBE' : isRoyal ? 'rgba(228,195,104,0.4)' : '#2E2E4A'
              }}
              className={`w-full max-w-sm rounded-[24px] border p-4 sm:p-5 shadow-xl flex flex-col justify-between text-center relative overflow-hidden transition-all duration-300 ${
                aspect === '4:5' ? 'min-h-[340px]' : 'min-h-[410px]'
              }`}
            >
              <div
                className="w-full rounded-2xl p-4 sm:p-5 flex flex-col items-center border transition-colors duration-300"
                style={{
                  backgroundColor: isLight ? '#FBF8F3' : isRoyal ? '#171836' : '#1E1E38',
                  borderColor: isLight
                    ? 'rgba(185, 87, 59, 0.35)'
                    : isRoyal
                    ? 'rgba(228, 195, 104, 0.35)'
                    : 'rgba(228, 195, 104, 0.16)'
                }}
              >
                <span
                  className="inline-block px-3 py-1 rounded-lg text-[11px] font-semibold border mb-2"
                  style={{
                    color: isLight ? '#9E4A30' : '#E4C368',
                    borderColor: isLight ? '#B9573B' : 'rgba(228, 195, 104, 0.4)',
                    backgroundColor: isLight ? 'rgba(185, 87, 59, 0.08)' : 'rgba(228, 195, 104, 0.1)'
                  }}
                >
                  ✦ {blessing.categoryLabel} ✦
                </span>
                <h3
                  className="text-xl sm:text-2xl font-serif font-bold mb-1.5"
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
                    backgroundColor: isLight ? '#EFE6D9' : isRoyal ? '#12132B' : '#16162C',
                    borderColor: isLight ? 'rgba(185, 87, 59, 0.3)' : 'rgba(228, 195, 104, 0.2)'
                  }}
                >
                  <p
                    className="font-quran text-base sm:text-lg leading-[2.05]"
                    style={{ color: isLight ? '#2A1F19' : '#E4C368' }}
                  >
                    ﴿{blessing.quran.textUthmani}﴾
                  </p>
                  <span
                    className="text-[10px] block mt-1.5"
                    style={{ color: isLight ? '#6B5A4E' : '#AEAECB' }}
                  >
                    سورة {blessing.quran.surahName} · الآية {toArabicNumerals(blessing.quran.ayahNumber)}
                  </span>
                </div>

                {(contentMode === 'tadabbur' || contentMode === 'full') && blessing.tadabbur && (
                  <p
                    className="text-xs leading-relaxed mt-3 border-t pt-2.5 line-clamp-3"
                    style={{
                      color: isLight ? '#4A3B32' : '#C7C4D8',
                      borderColor: isLight ? '#DCCFBE' : '#2E2E4A'
                    }}
                  >
                    {blessing.tadabbur}
                  </p>
                )}

                {contentMode === 'full' && blessing.duaa && (
                  <p
                    className="text-[11px] font-serif italic leading-relaxed mt-2 pt-2 border-t"
                    style={{
                      color: isLight ? '#2A1F19' : '#E4C368',
                      borderColor: isLight ? '#DCCFBE' : '#2E2E4A'
                    }}
                  >
                    «{blessing.duaa}»
                  </p>
                )}
              </div>

              {/* Bottom Signoff */}
              <div className="mt-4 self-center inline-flex flex-col items-center gap-1">
                <span
                  className="font-serif text-base font-bold leading-none"
                  style={{ color: isLight ? '#2A1F19' : '#E4C368' }}
                >
                  الحمد · لتأمل النعم
                </span>
                <div
                  className="w-20 h-[1.5px] rounded-full"
                  style={{ backgroundColor: isLight ? '#B9573B' : '#E4C368' }}
                />
              </div>
            </div>

            {generatedPreviewUrl && imageSaved && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#E4C368] font-medium">
                <Sparkles size={14} />
                <span>تم إنشاء الصورة المخصصة وتنزيلها على جهازك للاحتفاظ بها</span>
              </div>
            )}
          </div>
        ) : (
          <div className="my-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#AEAECB] px-1">
              <span>معاينة النص المنسّق الجاهز للنسخ:</span>
              <span className="text-[11px] text-[#E4C368]">تنسيق عربي مزخرف</span>
            </div>
            <pre className="w-full p-4 rounded-2xl bg-[#1E1E38] border border-[#2E2E4A] text-xs sm:text-sm text-[#EDEDF5] font-sans whitespace-pre-wrap leading-relaxed max-h-[280px] overflow-y-auto text-right select-all">
              {textToCopy}
            </pre>
          </div>
        )}

        {/* Primary Action Buttons: Save Custom PNG, Copy Formatted Text, Share */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleGenerateAndDownloadImage}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#6C63FF]/20 cursor-pointer disabled:opacity-50"
            >
              {imageSaved ? (
                <>
                  <Check size={16} className="text-[#E4C368]" />
                  <span>تم حفظ الصورة المخصصة</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>{downloading ? 'جارِ إنشاء الصورة...' : 'إنشاء صورة مخصصة وحفظها'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#1E1E38] hover:bg-[#27274A] border border-[#6C63FF]/45 text-[#EDEDF5] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-[#E4C368]" />
                  <span className="text-[#E4C368]">تم نسخ النص بالتنسيق الجميل</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-[#E4C368]" />
                  <span>نسخ نص النعمة بتنسيق جميل</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleNativeSocialShare}
            disabled={sharingNative}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#1E1E38] hover:bg-[#252545] border border-[#2E2E4A] text-[#C7C4D8] hover:text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-60"
          >
            <Share2 size={15} />
            <span>{sharingNative ? 'جارِ تجهيز البطاقة...' : 'مشاركة مباشرة عبر التطبيقات'}</span>
          </button>

          {/* Quick Social Platforms Strip */}
          <div className="pt-2 border-t border-[#2E2E4A]/70 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] text-[#AEAECB]">إرسال سريع للنص المنسّق:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePlatformShare('whatsapp')}
                className="px-3 py-1.5 rounded-xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-medium text-[#EDEDF5] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="مشاركة عبر واتساب"
              >
                <MessageCircle size={14} className="text-emerald-500" />
                <span>واتساب</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlatformShare('telegram')}
                className="px-3 py-1.5 rounded-xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-medium text-[#EDEDF5] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="مشاركة عبر تيليجرام"
              >
                <Send size={13} className="text-sky-500" />
                <span>تيليجرام</span>
              </button>

              <button
                type="button"
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
