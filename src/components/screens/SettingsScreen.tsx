import React, { useState, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  Type, 
  Minus,
  Plus,
  Bell, 
  Download, 
  Upload, 
  ShieldCheck, 
  BookMarked, 
  RotateCcw, 
  Share2, 
  Info,
  Check,
  Code2,
  Contrast,
  BookOpen
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { DisplayFontFamily } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { formatArabicTime, toArabicNumerals } from '../../lib/arabic';
import {
  isPremium,
  getDeveloperPremiumSync,
  setDeveloperPremium,
  subscribeEntitlementChange
} from '../../lib/entitlements';
import { devResetTodayPacingLock, devResetEntireJourney } from '../../lib/journeyStore';
import { AboutModal } from './AboutModal';
import { ContentReviewModal } from './ContentReviewModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { PremiumPaywallScreen } from './PremiumPaywallScreen';

const DISPLAY_FONT_OPTIONS: Array<{
  id: DisplayFontFamily;
  name: string;
  badge: string;
  description: string;
  fontStack: string;
}> = [
  {
    id: 'ibm',
    name: 'IBM Plex Sans Arabic',
    badge: 'الافتراضي المتوازن',
    description: 'حروف واضحة ومتوازنة لواجهة التطبيق والقراءة اليومية.',
    fontStack: "'IBM Plex Sans Arabic', sans-serif"
  },
  {
    id: 'noto-naskh',
    name: 'Noto Naskh Arabic',
    badge: 'للقراءة الطويلة',
    description: 'خط نسخي هادئ مصمم لراحة العين في القراءة المطوّلة والتدبر.',
    fontStack: "'Noto Naskh Arabic', 'Amiri', serif"
  },
  {
    id: 'amiri',
    name: 'Amiri (الأميري)',
    badge: 'تراثي أدبي',
    description: 'طابع الكتب والمخطوطات الأصيلة مع مسافة سطور مريحة للتأمل.',
    fontStack: "'Amiri', serif"
  },
  {
    id: 'tajawal',
    name: 'Tajawal (تجوال)',
    badge: 'وضوح عالٍ',
    description: 'حروف مفتوحة وانسيابية تمنح وضوحاً ممتازاً في الإضاءة العالية.',
    fontStack: "'Tajawal', sans-serif"
  }
];

export const SettingsScreen: React.FC = () => {
  const {
    theme,
    highContrast,
    nightReadingMode,
    fontFamily,
    fontSize,
    notificationsEnabled,
    notificationTime,
    setTheme,
    setHighContrast,
    setNightReadingMode,
    setFontFamily,
    setFontSize,
    setNotificationsEnabled,
    setNotificationTime,
    exportBackupJSON,
    importBackupJSON,
    replayTour,
    triggerHaptic
  } = useStore();

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [modalType, setModalType] = useState<'none' | 'about' | 'review' | 'privacy' | 'paywall'>('none');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [devPremium, setDevPremium] = useState<boolean>(() => getDeveloperPremiumSync());
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    void isPremium().then(setDevPremium);
    return subscribeEntitlementChange(setDevPremium);
  }, []);

  const handleExportBackup = () => {
    try {
      const jsonStr = exportBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alhamd-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      triggerHaptic('success');
    } catch {
      setImportStatus('تعذر تصدير النسخة الاحتياطية');
      setTimeout(() => setImportStatus(null), 3500);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const res = importBackupJSON(content);
        setImportStatus(res.message);
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'تطبيق «الحمد» — نعمةٌ كلَّ يوم',
      text: 'تطبيق هادئ لاستشعار نعم الله وتدبرها، نعمةٌ واحدة كلَّ يوم بلا سلاسل وبلا حسابات.',
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      setImportStatus('تم نسخ رابط التطبيق بنجاح');
      setTimeout(() => setImportStatus(null), 3500);
    }
  };

  return (
    <div className="w-full pb-28 pt-4 px-4 sm:px-6 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      {/* Title */}
      <div className="text-right space-y-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5]">
          الإعدادات
        </h1>
        <p className="text-xs sm:text-sm text-[#AEAECB]">
          تخصيص المظهر، وضع القراءة الليلية المريح للعين قبل النوم، وتباين الإضاءة العالية، وخط العرض.
        </p>
      </div>

      {importStatus && (
        <div className="p-3.5 rounded-2xl bg-[#6C63FF]/20 border border-[#6C63FF]/50 text-xs font-semibold text-[#EDEDF5] text-center flex items-center justify-center gap-2">
          <Check size={16} className="text-[#E4C368]" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* 1. Appearance, Theme, Night Reading Mode & High-Light Text Contrast */}
      <GlassCard padding="p-5" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-bold text-[#AEAECB] uppercase tracking-wider">
            المظهر وراحة العين (الليل والنهار)
          </h3>
          <div className="flex items-center gap-1.5">
            {nightReadingMode && (
              <span className="px-2.5 py-0.5 rounded-lg bg-[#E4C368]/15 border border-[#E4C368]/40 text-[11px] font-bold text-[#E4C368]">
                وضع القراءة الليلية مفعّل
              </span>
            )}
            {highContrast && (
              <span className="px-2.5 py-0.5 rounded-lg bg-[#E4C368]/15 border border-[#E4C368]/40 text-[11px] font-bold text-[#E4C368]">
                تباين عالٍ مفعّل
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              triggerHaptic('light');
            }}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#6C63FF] border-[#6C63FF] text-white shadow-md'
                : 'bg-[#15152A] border-[#2E2E4A] text-[#AEAECB] hover:text-white'
            }`}
          >
            <Moon size={16} />
            <span>داكن (ليل)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('light');
              triggerHaptic('light');
            }}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-[#6C63FF] border-[#6C63FF] text-white shadow-md'
                : 'bg-[#15152A] border-[#2E2E4A] text-[#AEAECB] hover:text-white'
            }`}
          >
            <Sun size={16} />
            <span>فاتح (نهار)</span>
          </button>
        </div>

        {/* Night Reading Mode Toggle (Low Blue Light & Deeper Warm Shades before sleep) */}
        <div className="pt-3 border-t border-[#2E2E4A]/80 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-[#E4C368]" />
                <span className="text-xs sm:text-sm font-bold text-[#EDEDF5]">
                  وضع القراءة الليلية (قبل النوم)
                </span>
              </div>
              <p className="text-[11px] text-[#AEAECB] leading-relaxed">
                يقلل من انبعاث الضوء الأزرق ويحوّل الخلفية إلى درجات داكنة أعمق وأكثر دفئاً لراحة العين والسكينة عند قراءة النعم قبل النوم.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={nightReadingMode}
              aria-label="تفعيل وضع القراءة الليلية"
              onClick={() => {
                setNightReadingMode(!nightReadingMode);
                triggerHaptic('light');
              }}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                nightReadingMode ? 'bg-[#6C63FF]' : 'bg-[#2E2E4A]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  nightReadingMode ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* High Contrast Text Toggle for High Ambient Lighting */}
        <div className="pt-3 border-t border-[#2E2E4A]/80 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2">
                <Contrast size={16} className="text-[#E4C368]" />
                <span className="text-xs sm:text-sm font-bold text-[#EDEDF5]">
                  تحويل تباين النصوص للإضاءة العالية
                </span>
              </div>
              <p className="text-[11px] text-[#AEAECB] leading-relaxed">
                يزيد من حدة تباين الحروف والحدود لتصبح النصوص أكثر وضوحاً تحت ضوء النهار الساطع أو الإضاءة القوية.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={highContrast}
              aria-label="تحويل تباين النصوص للإضاءة العالية"
              onClick={() => {
                setHighContrast(!highContrast);
                triggerHaptic('light');
              }}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                highContrast ? 'bg-[#6C63FF]' : 'bg-[#2E2E4A]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  highContrast ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick One-Tap Preset for Bright Daylight Reading */}
          {!(theme === 'light' && highContrast) && (
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                setHighContrast(true);
                triggerHaptic('medium');
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#15152A] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-semibold text-[#E4C368] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sun size={14} />
              <span>تفعيل وضع الإضاءة الساطعة (نهار + تباين نصوص عالٍ)</span>
            </button>
          )}
        </div>
      </GlassCard>

      {/* 2. Display Font Family & Numeric Font Size Control for Long Reading */}
      <GlassCard padding="p-5" className="space-y-5">
        {/* Font Family Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#C8A951]" />
              <span className="text-xs font-bold text-[#AEAECB] uppercase tracking-wider">
                خط العرض للقراءة الطويلة
              </span>
            </div>
            <span className="text-[11px] text-[#AEAECB]">
              اختر الخط الأنسب لراحة عينيك
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DISPLAY_FONT_OPTIONS.map((option) => {
              const isSelected = fontFamily === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setFontFamily(option.id);
                    triggerHaptic('light');
                  }}
                  style={{ fontFamily: option.fontStack }}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#6C63FF]/15 border-[#6C63FF] shadow-sm'
                      : 'bg-[#15152A] border-[#2E2E4A] hover:border-[#6C63FF]/45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-sm font-bold text-[#EDEDF5]">
                      {option.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                        isSelected
                          ? 'bg-[#6C63FF] text-white'
                          : 'bg-[#1E1E38] text-[#E4C368] border border-[#2E2E4A]'
                      }`}
                    >
                      {option.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#C7C4D8] leading-relaxed">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Numeric Font Size Control (12px – 24px) */}
        <div className="pt-4 border-t border-[#2E2E4A]/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type size={16} className="text-[#C8A951]" />
              <span className="text-xs font-bold text-[#AEAECB] uppercase tracking-wider">
                حجم الخط بالرقم (١٢ – ٢٤)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {fontSize !== 16 && (
                <button
                  type="button"
                  onClick={() => {
                    setFontSize(16);
                    triggerHaptic('light');
                  }}
                  className="text-[11px] font-medium text-[#AEAECB] hover:text-[#E4C368] px-2 py-1 rounded-lg border border-[#2E2E4A] transition-colors cursor-pointer"
                  title="إعادة الحجم الافتراضي (16)"
                >
                  افتراضي (١٦)
                </button>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-[#15152A] border border-[#C8A951]/40 text-xs font-bold text-[#E4C368]">
                {toArabicNumerals(fontSize)} px
              </span>
            </div>
          </div>

          {/* Stepper + Slider + Direct Number Input */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setFontSize(fontSize - 1);
                triggerHaptic('light');
              }}
              disabled={fontSize <= 12}
              className="w-10 h-10 rounded-xl bg-[#15152A] hover:bg-[#25232E] disabled:opacity-40 border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] transition-colors cursor-pointer shrink-0"
              aria-label="تصغير الخط"
            >
              <Minus size={16} />
            </button>

            <div className="flex-1 flex flex-col gap-1.5">
              <input
                type="range"
                min={12}
                max={24}
                step={0.5}
                value={fontSize}
                onChange={e => setFontSize(parseFloat(e.target.value))}
                aria-label="شريط تحديد حجم الخط"
                className="w-full accent-[#C8A951] cursor-pointer h-2 rounded-lg"
                dir="ltr"
              />
              <div className="flex justify-between text-[11px] text-[#AEAECB] px-0.5" dir="ltr">
                <span>12px</span>
                <span>16px</span>
                <span>20px</span>
                <span>24px</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFontSize(fontSize + 1);
                triggerHaptic('light');
              }}
              disabled={fontSize >= 24}
              className="w-10 h-10 rounded-xl bg-[#15152A] hover:bg-[#25232E] disabled:opacity-40 border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] transition-colors cursor-pointer shrink-0"
              aria-label="تكبير الخط"
            >
              <Plus size={16} />
            </button>

            {/* Direct Number Input */}
            <div className="flex items-center bg-[#15152A] border border-[#2E2E4A] focus-within:border-[#C8A951] rounded-xl px-2.5 h-10 shrink-0" dir="ltr">
              <input
                type="number"
                min={12}
                max={24}
                step={0.5}
                value={fontSize}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setFontSize(val);
                }}
                aria-label="إدخال رقم حجم الخط"
                className="w-12 bg-transparent text-center text-sm font-bold text-[#EDEDF5] outline-none"
              />
              <span className="text-[11px] text-[#AEAECB] select-none">px</span>
            </div>
          </div>

          {/* Live Reading & Contrast Preview Box */}
          <div
            className="rounded-2xl p-4 border text-right space-y-2"
            style={{
              backgroundColor: 'var(--bg-sunken)',
              borderColor: 'var(--border-hairline)'
            }}
          >
            <p className="font-quran ayah-text text-lg text-center leading-[2.0]" style={{ color: 'var(--ayah-color)' }}>
              ﴿وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا﴾
            </p>
            <p className="text-sm text-[#EDEDF5] leading-[1.95]">
              التأمل الهادئ في النعم المألوفة يعيد للقلب يقظته وسكينته، ويجعل القراءة الطويلة في سير النعم أنساً يورث الحمد والشكر.
            </p>
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[11px] text-[#AEAECB]">
              <span>
                الخط: {DISPLAY_FONT_OPTIONS.find(f => f.id === fontFamily)?.name} ({toArabicNumerals(fontSize)}px)
              </span>
              <span>
                {nightReadingMode
                  ? 'وضع القراءة الليلية: مفعّل (تقليل الضوء الأزرق قبل النوم)'
                  : highContrast
                  ? 'تباين النصوص: عالٍ (وضوح الإضاءة العالية)'
                  : 'تباين النصوص: قياسي هادئ'}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 3. Daily Reminder */}
      <GlassCard padding="p-5" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs font-bold text-[#AEAECB] uppercase tracking-wider block">
              التذكير اليومي
            </span>
            <span className="text-xs text-[#C7C4D8]">
              حان وقت التفكّر والحمد
            </span>
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            role="switch"
            aria-checked={notificationsEnabled}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
              notificationsEnabled ? 'bg-[#6C63FF]' : 'bg-[#2E2E4A]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                notificationsEnabled ? '-translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {notificationsEnabled && (
          <div className="flex items-center justify-between border-t border-[#2E2E4A]/80 pt-3">
            <span className="text-xs text-[#AEAECB]">وقت التذكير:</span>
            <button
              onClick={() => setIsTimePickerOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#15152A] border border-[#2E2E4A] text-xs font-bold text-[#E4C368] hover:border-[#C8A951]"
            >
              {formatArabicTime(notificationTime)}
            </button>
          </div>
        )}
      </GlassCard>

      {/* 4. Local Backup & Restore */}
      <GlassCard padding="p-5" className="space-y-4">
        <h3 className="text-xs font-bold text-[#AEAECB] uppercase tracking-wider">
          النسخ الاحتياطي المحلي
        </h3>
        <p className="text-xs text-[#AEAECB] leading-relaxed">
          احتفظ بنسخة من سجلك وتأملاتك في ملف آمن على جهازك يمكنك استرجاعه متى شئت.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-semibold text-[#EDEDF5] transition-colors"
          >
            <Download size={15} />
            <span>تصدير ملف (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] text-xs font-semibold text-[#EDEDF5] transition-colors"
          >
            <Upload size={15} />
            <span>استيراد نسخة</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>
      </GlassCard>

      {/* 5. General & Informational Links */}
      <div className="space-y-2">
        <button
          onClick={() => setModalType('review')}
          className="w-full p-4 rounded-2xl bg-[#1E1E38]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-between text-xs font-semibold text-[#EDEDF5] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <BookMarked size={16} className="text-[#C8A951]" />
            <span>عن المحتوى والمراجعة العلمية</span>
          </div>
          <span className="text-[11px] text-amber-400 font-medium">قيد المراجعة</span>
        </button>

        <button
          onClick={() => setModalType('about')}
          className="w-full p-4 rounded-2xl bg-[#1E1E38]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-between text-xs font-semibold text-[#EDEDF5] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Info size={16} className="text-[#6C63FF]" />
            <span>عن تطبيق «الحمد»</span>
          </div>
          <span className="text-[11px] text-[#AEAECB]">رسالة التطبيق</span>
        </button>

        <button
          onClick={() => setModalType('privacy')}
          className="w-full p-4 rounded-2xl bg-[#1E1E38]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-between text-xs font-semibold text-[#EDEDF5] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>سياسة الخصوصية</span>
          </div>
          <span className="text-[11px] text-[#AEAECB]">على جهازك فقط</span>
        </button>

        <button
          onClick={replayTour}
          className="w-full p-4 rounded-2xl bg-[#1E1E38]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-between text-xs font-semibold text-[#EDEDF5] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <RotateCcw size={16} className="text-[#E4C368]" />
            <span>إعادة الجولة التعريفية</span>
          </div>
          <span className="text-[11px] text-[#AEAECB]">٤ خطوات</span>
        </button>

        <button
          onClick={handleShareApp}
          className="w-full p-4 rounded-2xl bg-[#1E1E38]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-between text-xs font-semibold text-[#EDEDF5] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Share2 size={16} className="text-[#6C63FF]" />
            <span>شارك التطبيق مع أحبابك</span>
          </div>
          <span className="text-[11px] text-[#AEAECB]">الدال على الخير</span>
        </button>

        {/* Developer Mode Toggle ('وضع المطور: تفعيل الرحلة') for testing «رحلتي» locally before subscribing */}
        <div className="pt-2">
          <div className="p-4 rounded-2xl bg-[#1E1E38]/90 border border-dashed border-[#2E2E4A] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2">
                  <Code2 size={15} className="text-[#6C63FF]" />
                  <span className="text-xs font-bold text-[#EDEDF5]">
                    وضع المطور: تفعيل الرحلة
                  </span>
                </div>
                <span className="text-[11px] text-[#AEAECB] block leading-relaxed">
                  تجربة ميزات «رحلتي» (المسار الكامل، اليوميات الخاصة، ووقفات المحاسبة) محلياً قبل الاشتراك في الخطة المدفوعة.
                </span>
                <span className="text-[11px] text-[#E4C368] block">
                  {devPremium
                    ? 'الحالة الحالية: مفعّل محلياً (كامل ميزات رحلتي متاحة)'
                    : 'الحالة الحالية: غير مفعّل (الوضع المجاني — أول محطتين فقط)'}
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={devPremium}
                aria-label="وضع المطور: تفعيل الرحلة"
                onClick={() => {
                  const next = !devPremium;
                  setDeveloperPremium(next);
                  setDevPremium(next);
                  triggerHaptic('light');
                }}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                  devPremium ? 'bg-[#6C63FF]' : 'bg-[#2E2E4A]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    devPremium ? '-translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2E2E4A]/70">
              <span className="text-[11px] text-[#AEAECB]">
                فحص محلي عبر <code className="text-[#C7C4D8]">isPremium()</code> (بديل RevenueCat المؤقت)
              </span>
              <button
                type="button"
                onClick={() => setShowDevPanel((prev) => !prev)}
                className="text-[11px] font-medium text-[#E4C368] hover:underline cursor-pointer"
              >
                {showDevPanel ? 'إخفاء أدوات الاختبار' : 'أدوات اختبار المسار'}
              </button>
            </div>

            {showDevPanel && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#2E2E4A] animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    devResetTodayPacingLock();
                    setImportStatus('تم فتح حد اليوم في «رحلتي» لتجربة محطة إضافية.');
                    setTimeout(() => setImportStatus(null), 3500);
                    triggerHaptic('light');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#15152A] hover:bg-[#25232E] border border-[#2E2E4A] text-[11px] font-semibold text-[#C7C4D8] hover:text-[#EDEDF5] transition-colors cursor-pointer"
                >
                  تجاوز حد اليوم (فتح محطة جديدة)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    devResetEntireJourney();
                    setImportStatus('تمت إعادة ضبط مسار «رحلتي» من البداية.');
                    setTimeout(() => setImportStatus(null), 3500);
                    triggerHaptic('medium');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#15152A] hover:bg-[#25232E] border border-[#2E2E4A] text-[11px] font-semibold text-[#C7C4D8] hover:text-[#EDEDF5] transition-colors cursor-pointer"
                >
                  إعادة تعيين «رحلتي» بالكامل
                </button>

                <button
                  type="button"
                  onClick={() => setModalType('paywall')}
                  className="sm:col-span-2 py-2.5 px-3 rounded-xl bg-[#6C63FF]/15 hover:bg-[#6C63FF]/25 border border-[#6C63FF]/40 text-[11px] font-semibold text-[#EDEDF5] transition-colors cursor-pointer"
                >
                  معاينة نافذة الترقية (PremiumPaywallScreen)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Picker Modal */}
      {isTimePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-xs bg-[#1E1E38] border border-[#2E2E4A] rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#EDEDF5] text-center">
              وقت التذكير اليومي
            </h3>
            <input
              type="time"
              defaultValue={notificationTime}
              onChange={e => setNotificationTime(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#15152A] border border-[#2E2E4A] text-[#EDEDF5] text-center text-lg font-bold outline-none"
            />
            <button
              onClick={() => setIsTimePickerOpen(false)}
              className="w-full py-3 rounded-xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-sm transition-colors"
            >
              تم
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalType === 'about' && (
        <AboutModal
          onClose={() => setModalType('none')}
          onOpenContentReview={() => setModalType('review')}
          onOpenPrivacyPolicy={() => setModalType('privacy')}
        />
      )}

      {modalType === 'review' && (
        <ContentReviewModal onClose={() => setModalType('none')} />
      )}

      {modalType === 'privacy' && (
        <PrivacyPolicyModal onClose={() => setModalType('none')} />
      )}

      {modalType === 'paywall' && (
        <PremiumPaywallScreen
          onClose={() => setModalType('none')}
          onUnlocked={() => {
            setDevPremium(true);
            setModalType('none');
          }}
        />
      )}
    </div>
  );
};
