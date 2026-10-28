import React, { useState } from 'react';
import { Check, ArrowRight, Bell, Compass, Clock, ShieldCheck, ArrowUp } from 'lucide-react';
import { getAllStageTemplates } from '../../lib/journeyStore';
import { getBlessingById } from '../../data/loader';
import { toArabicNumerals, formatArabicTime } from '../../lib/arabic';

export interface JourneyOnboardingProps {
  initialThemes?: string[];
  initialPace?: 1 | 2;
  initialReminderTime?: string;
  isEditing?: boolean;
  onComplete: (params: {
    focusThemes: string[];
    pace: 1 | 2;
    reminderTime: string | null;
  }) => void;
  onCancel?: () => void;
}

const THEME_SHORT_NAMES: Record<string, string> = {
  din: 'العبادات',
  afiyah: 'البدن',
  nasl: 'الأهل والمودة',
  rizq: 'الرزق والسكينة'
};

export const JourneyOnboarding: React.FC<JourneyOnboardingProps> = ({
  initialThemes = ['din', 'afiyah'],
  initialPace = 1,
  initialReminderTime = '21:00',
  isEditing = false,
  onComplete,
  onCancel
}) => {
  const stageTemplates = getAllStageTemplates();

  const [selectedThemes, setSelectedThemes] = useState<string[]>(
    initialThemes.length > 0 ? initialThemes : ['din', 'afiyah']
  );
  const [pace, setPace] = useState<1 | 2>(initialPace === 2 ? 2 : 1);
  const [enableReminder, setEnableReminder] = useState<boolean>(
    initialReminderTime !== null && initialReminderTime !== ''
  );
  const [reminderTime, setReminderTime] = useState<string>(initialReminderTime || '21:00');

  const toggleTheme = (themeKey: string) => {
    setSelectedThemes((prev) => {
      if (prev.includes(themeKey)) {
        if (prev.length <= 1) return prev; // Keep at least 1 focus theme selected
        return prev.filter((t) => t !== themeKey);
      }
      return [...prev, themeKey];
    });
  };

  const promoteThemeOrder = (themeKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedThemes((prev) => {
      const idx = prev.indexOf(themeKey);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(idx - 1, 0, item);
      return next;
    });
  };

  const handleSaveAndStart = () => {
    onComplete({
      focusThemes: selectedThemes,
      pace,
      reminderTime: enableReminder ? reminderTime : null
    });
  };

  const selectedThemeLabels = selectedThemes
    .map((themeKey) => {
      const tpl = stageTemplates.find((s) => s.theme === themeKey || s.id === themeKey);
      return THEME_SHORT_NAMES[themeKey] || tpl?.focusLabel || themeKey;
    })
    .join('، ');

  return (
    <div
      className="w-full min-h-[calc(100vh-8rem)] max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-28 space-y-6 animate-fade-in"
      dir="rtl"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-10 h-10 rounded-full bg-[#1E1E38] border border-[#2E2E4A] flex items-center justify-center text-[#AEAECB] hover:text-[#EDEDF5] transition-colors cursor-pointer"
              aria-label="رجوع إلى مسار الرحلة"
            >
              <ArrowRight size={18} />
            </button>
          )}
          <div className="text-xs font-medium text-[#AEAECB] flex items-center gap-1.5">
            <Compass size={14} className="text-[#6C63FF]" />
            <span>{isEditing ? 'تعديل تفضيلات رحلتي' : 'تخصيص محتوى الرحلة قبل بدئها'}</span>
          </div>
        </div>

        <div className="text-[11px] text-[#AEAECB] flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#6C63FF]" />
          <span>يُحفظ محلياً على جهازك</span>
        </div>
      </div>

      {/* Intro Header */}
      <header className="space-y-2 text-right">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5] leading-snug">
          {isEditing ? 'خصّص مسار رحلتك ووتيرتك اليومية' : 'صمّم رحلتك الخاصة مع النِّعَم'}
        </h1>
        <p className="text-xs sm:text-sm text-[#C7C4D8] leading-relaxed">
          اختر محاور اهتمامك التي تودّ التأمل فيها (مثل «العبادات» و«البدن»)، وحدّد وتيرة تقدمك اليومية؛ ستُحفظ تفضيلاتك محلياً في سجل رحلتك ويمكنك تعديلها في أي وقت.
        </p>
      </header>

      {/* Section 1: Focus Themes (محاور الاهتمام) */}
      <section className="space-y-3.5" aria-labelledby="customize-themes-heading">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5 text-right">
            <h2 id="customize-themes-heading" className="text-base sm:text-lg font-bold text-[#EDEDF5] flex items-center gap-2">
              <Compass size={16} className="text-[#6C63FF]" />
              <span>١. اختر محاور اهتمامك</span>
            </h2>
            <p className="text-xs text-[#AEAECB]">
              تُرتَّب منازل الرحلة حسب ترتيب اختيارك، وفي كل منزلٍ {toArabicNumerals(7)} محطات تأملية.
            </p>
          </div>
          <span className="text-xs text-[#C7C4D8] tabular-nums shrink-0">
            تم اختيار {toArabicNumerals(selectedThemes.length)} من {toArabicNumerals(stageTemplates.length)}
          </span>
        </div>

        <div className="space-y-3">
          {stageTemplates.map((tpl) => {
            const selectedIndex = selectedThemes.indexOf(tpl.theme);
            const isSelected = selectedIndex !== -1;
            const shortName = THEME_SHORT_NAMES[tpl.theme] || tpl.focusLabel;

            const stationTitles = tpl.stations
              .slice(0, 5)
              .map((st) => getBlessingById(st.blessingId)?.shortTitle)
              .filter(Boolean)
              .join(' · ');

            return (
              <div
                key={tpl.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => toggleTheme(tpl.theme)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme(tpl.theme);
                  }
                }}
                className={`w-full p-4 sm:p-5 rounded-2xl border text-right transition-all flex items-start justify-between gap-3.5 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#1E1E38] border-[#6C63FF] shadow-[0_0_22px_rgba(108,99,255,0.16)]'
                    : 'bg-[#1E1E38]/45 border-[#2E2E4A] hover:border-[#6C63FF]/40 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-[#EDEDF5]">
                      {shortName}
                    </span>
                    <span aria-hidden="true" className="text-[#AEAECB]/50">·</span>
                    <span className="text-xs font-medium text-[#E4C368]">
                      {tpl.title}
                    </span>
                    <span aria-hidden="true" className="text-[#AEAECB]/50">·</span>
                    <span className="text-[11px] text-[#AEAECB]">
                      {toArabicNumerals(tpl.stations.length)} محطات
                    </span>
                  </div>

                  <p className="text-xs text-[#C7C4D8] leading-relaxed">
                    {tpl.focusDescription}
                  </p>

                  {stationTitles && (
                    <p className="text-[11px] text-[#AEAECB]/80 pt-0.5 leading-relaxed">
                      من محطاته: {stationTitles}…
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#6C63FF] text-white'
                        : 'border border-[#2E2E4A] bg-[#15152A] text-transparent'
                    }`}
                  >
                    {isSelected ? toArabicNumerals(selectedIndex + 1) : <Check size={14} />}
                  </div>

                  {isSelected && selectedIndex > 0 && (
                    <button
                      type="button"
                      onClick={(e) => promoteThemeOrder(tpl.theme, e)}
                      title="تقديم هذا المحور في الترتيب"
                      className="px-2 py-0.5 rounded-lg bg-[#15152A] hover:bg-[#232342] border border-[#2E2E4A] text-[10px] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      <ArrowUp size={10} />
                      <span>تقديم</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Daily Pace (وتيرة التقدم اليومية: محطة واحدة أو اثنتان) */}
      <section className="space-y-3.5" aria-labelledby="customize-pace-heading">
        <div className="space-y-0.5 text-right">
          <h2 id="customize-pace-heading" className="text-base sm:text-lg font-bold text-[#EDEDF5] flex items-center gap-2">
            <Clock size={16} className="text-[#6C63FF]" />
            <span>٢. حدّد وتيرة التقدم اليومية</span>
          </h2>
          <p className="text-xs text-[#AEAECB]">
            اختر عدد المحطات التي تودّ أن تُفتح لك في كل يوم بما يناسب وقتك وسكينتك.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPace(1)}
            aria-pressed={pace === 1}
            className={`p-4 sm:p-5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
              pace === 1
                ? 'bg-[#1E1E38] border-[#6C63FF] shadow-[0_0_20px_rgba(108,99,255,0.18)]'
                : 'bg-[#1E1E38]/45 border-[#2E2E4A] hover:border-[#6C63FF]/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-base font-bold text-[#EDEDF5]">
                محطة واحدة يومياً
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${
                  pace === 1
                    ? 'bg-[#6C63FF] border-[#6C63FF] text-white'
                    : 'border-[#2E2E4A] bg-[#15152A]'
                }`}
              >
                {pace === 1 && <Check size={14} />}
              </div>
            </div>
            <p className="text-xs text-[#AEAECB] leading-relaxed">
              وقفة تأمل واحدة هادئة كل يوم؛ يكتمل المنزل في {toArabicNumerals(7)} أيام بلا استعجال.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPace(2)}
            aria-pressed={pace === 2}
            className={`p-4 sm:p-5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
              pace === 2
                ? 'bg-[#1E1E38] border-[#6C63FF] shadow-[0_0_20px_rgba(108,99,255,0.18)]'
                : 'bg-[#1E1E38]/45 border-[#2E2E4A] hover:border-[#6C63FF]/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-base font-bold text-[#EDEDF5]">
                محطتان يومياً
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${
                  pace === 2
                    ? 'bg-[#6C63FF] border-[#6C63FF] text-white'
                    : 'border-[#2E2E4A] bg-[#15152A]'
                }`}
              >
                {pace === 2 && <Check size={14} />}
              </div>
            </div>
            <p className="text-xs text-[#AEAECB] leading-relaxed">
              محطة في الصباح وأخرى في المساء لمن يرغب في التعمق أكثر؛ يكتمل المنزل في {toArabicNumerals(4)} أيام.
            </p>
          </button>
        </div>
      </section>

      {/* Section 3: Gentle Daily Reminder (موعد التذكير اليومي) */}
      <section className="space-y-3" aria-labelledby="customize-reminder-heading">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1E1E38]/80 border border-[#2E2E4A] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5 text-right">
              <h2 id="customize-reminder-heading" className="text-sm sm:text-base font-bold text-[#EDEDF5] flex items-center gap-2">
                <Bell size={15} className="text-[#6C63FF]" />
                <span>٣. تذكير يومي هادئ (اختياري)</span>
              </h2>
              <p className="text-xs text-[#AEAECB]">
                اختر وقتًا يصفو فيه ذهنك للتأمل في محطتك اليومية.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enableReminder}
              aria-label="تفعيل التذكير اليومي"
              onClick={() => setEnableReminder((prev) => !prev)}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                enableReminder ? 'bg-[#6C63FF]' : 'bg-[#2E2E4A]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  enableReminder ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {enableReminder && (
            <div className="pt-3 border-t border-[#2E2E4A] flex items-center justify-between gap-3">
              <label htmlFor="journey-reminder-time" className="text-xs text-[#C7C4D8]">
                الوقت المفضل للتذكير ({formatArabicTime(reminderTime)}):
              </label>
              <input
                id="journey-reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#15152A] border border-[#2E2E4A] focus:border-[#6C63FF] text-[#EDEDF5] text-sm font-bold outline-none"
              />
            </div>
          )}
        </div>
      </section>

      {/* Summary & Save CTA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#15152A] border border-[#2E2E4A] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#C7C4D8]">
          <div>
            <span className="text-[#AEAECB]">المحاور المختارة: </span>
            <span className="font-bold text-[#EDEDF5]">{selectedThemeLabels}</span>
          </div>
          <span aria-hidden="true" className="text-[#AEAECB]/40 hidden sm:inline">·</span>
          <div>
            <span className="text-[#AEAECB]">الوتيرة اليومية: </span>
            <span className="font-bold text-[#E4C368]">
              {pace === 1 ? 'محطة واحدة يومياً' : 'محطتان يومياً'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveAndStart}
          className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-[#6C63FF]/25 active:scale-[0.99] cursor-pointer"
        >
          {isEditing ? 'حفظ التفضيلات والعودة للمسار' : 'حفظ التفضيلات وبدء الرحلة'}
        </button>
      </div>
    </div>
  );
};

export const JourneyCustomizationScreen = JourneyOnboarding;
export default JourneyOnboarding;
