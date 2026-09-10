import React, { useState, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  Type, 
  Bell, 
  Download, 
  Upload, 
  ShieldCheck, 
  BookMarked, 
  RotateCcw, 
  Share2, 
  Info,
  Check
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { GlassCard } from '../common/GlassCard';
import { formatArabicTime } from '../../lib/arabic';
import { AboutModal } from './AboutModal';
import { ContentReviewModal } from './ContentReviewModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

export const SettingsScreen: React.FC = () => {
  const {
    theme,
    textSize,
    notificationsEnabled,
    notificationTime,
    analyticsConsent,
    setTheme,
    setTextSize,
    setNotificationsEnabled,
    setNotificationTime,
    setAnalyticsConsent,
    exportBackupJSON,
    importBackupJSON,
    replayTour,
    triggerHaptic
  } = useStore();

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [modalType, setModalType] = useState<'none' | 'about' | 'review' | 'privacy'>('none');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert('تعذر تصدير النسخة الاحتياطية');
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
      alert('تم نسخ رابط التطبيق بنجاح');
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
          تخصيص المظهر والتنبيهات، والنسخ الاحتياطي المحلي.
        </p>
      </div>

      {importStatus && (
        <div className="p-3.5 rounded-2xl bg-[#6C63FF]/20 border border-[#6C63FF]/50 text-xs font-semibold text-[#EDEDF5] text-center flex items-center justify-center gap-2">
          <Check size={16} className="text-[#E4C368]" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* 1. Appearance / Theme */}
      <GlassCard padding="p-5" className="space-y-4">
        <h3 className="text-xs font-bold text-[#AEAECB] uppercase tracking-wider">
          المظهر
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-[#6C63FF] border-[#6C63FF] text-white shadow-md'
                : 'bg-[#15152A] border-[#2E2E4A] text-[#AEAECB] hover:text-white'
            }`}
          >
            <Moon size={16} />
            <span>داكن (ليل)</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-[#6C63FF] border-[#6C63FF] text-white shadow-md'
                : 'bg-[#15152A] border-[#2E2E4A] text-[#AEAECB] hover:text-white'
            }`}
          >
            <Sun size={16} />
            <span>فاتح (فجر)</span>
          </button>
        </div>
      </GlassCard>

      {/* 2. Text Size */}
      <GlassCard padding="p-5" className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#AEAECB] uppercase tracking-wider">
            حجم الخط العربي
          </span>
          <Type size={16} className="text-[#C8A951]" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTextSize('normal')}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
              textSize === 'normal'
                ? 'bg-[#E4C368] text-[#15152A] border-[#E4C368] font-bold'
                : 'bg-[#15152A] border-[#2E2E4A] text-[#AEAECB] hover:text-white'
            }`}
          >
            عادي
          </button>

          <button
            onClick={() => setTextSize('large')}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
              textSize === 'large'
                ? 'bg-[#E4C368] text-[#15152A] border-[#E4C368] font-bold'
                : 'bg-[#15152A] border-[#2E2E4A] text-[#AEAECB] hover:text-white'
            }`}
          >
            كبير
          </button>

          <button
            onClick={() => setTextSize('xlarge')}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
              textSize === 'xlarge'
                ? 'bg-[#E4C368] text-[#15152A] border-[#E4C368] font-bold'
                : 'bg-[#15152A] border-[#2E2E4A] text-[#AEAECB] hover:text-white'
            }`}
          >
            أكبر
          </button>
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
    </div>
  );
};
