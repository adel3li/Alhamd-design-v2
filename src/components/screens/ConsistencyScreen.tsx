import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Bell } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { generateMonthCalendar } from '../../lib/hijri';
import { toArabicNumerals, formatArabicTime } from '../../lib/arabic';

interface ConsistencyScreenProps {
  completedDays: string[]; // ISO dates YYYY-MM-DD
  notificationsEnabled: boolean;
  notificationTime: string;
  onToggleNotifications: (enabled: boolean) => void;
  onChangeNotificationTime: (time: string) => void;
}

export const ConsistencyScreen: React.FC<ConsistencyScreenProps> = ({
  completedDays,
  notificationsEnabled,
  notificationTime,
  onToggleNotifications,
  onChangeNotificationTime
}) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  // Generate calendar days for the current offset
  const calendarData = useMemo(() => {
    return generateMonthCalendar(new Date(), monthOffset);
  }, [monthOffset]);

  // Count how many days in this month are completed
  const completedInThisMonthCount = useMemo(() => {
    return calendarData.days.filter(d => completedDays.includes(d.isoDate)).length;
  }, [calendarData.days, completedDays]);

  // Weekday letters from Saturday to Friday: س ح ن ث ر خ ج (as in ref-04-calendar.png)
  const weekdayLetters = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];

  return (
    <div className="w-full pb-28 pt-4 px-4 sm:px-6 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      {/* Title & Subtitle (Matches ref-04-calendar.png) */}
      <div className="text-right space-y-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5]">
          المداومة
        </h1>
        <p className="text-xs sm:text-sm text-[#AEAECB]">
          وردٌ هادئ تحاسب به نفسك — لا سباق، ولا مقارنة بأحد.
        </p>
      </div>

      {/* Calendar Card (Matches ref-04-calendar.png) */}
      <GlassCard padding="p-6" className="space-y-6">
        {/* Month Navigation: ‹ ذو الحجة ١٤٤٧ › */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => setMonthOffset(m => m + 1)}
            className="w-9 h-9 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] transition-colors"
            aria-label="الشهر القادم"
          >
            <ChevronRight size={18} />
          </button>

          <span className="font-serif font-bold text-lg sm:text-xl text-[#C8A951]">
            {calendarData.monthTitle}
          </span>

          <button
            onClick={() => setMonthOffset(m => m - 1)}
            className="w-9 h-9 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] transition-colors"
            aria-label="الشهر السابق"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Weekday Headers: س ح ن ث ر خ ج */}
        <div className="grid grid-cols-7 gap-1 text-center border-b border-[#2E2E4A]/80 pb-3">
          {weekdayLetters.map((letter, idx) => (
            <span key={idx} className="text-xs font-semibold text-[#AEAECB]">
              {letter}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center items-center">
          {/* Padding empty slots */}
          {Array.from({ length: calendarData.startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="h-10 w-full" />
          ))}

          {/* Calendar day cells */}
          {calendarData.days.map((day) => {
            const isCompleted = completedDays.includes(day.isoDate);

            return (
              <div
                key={day.dayNumber}
                className="flex flex-col items-center justify-center h-11 w-full relative"
              >
                {/* Number with today ring if today */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    day.isToday
                      ? 'border-2 border-[#6C63FF] bg-[#6C63FF]/20 text-white font-bold shadow-[0_0_10px_rgba(108,99,255,0.4)]'
                      : 'text-[#EDEDF5]'
                  }`}
                >
                  {day.arabicNumber}
                </div>

                {/* Gold dot underneath if completed */}
                {isCompleted && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E4C368] shadow-[0_0_6px_rgba(228,195,104,0.9)] mt-0.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Line under grid: «أتممتَ N يومًا من <الشهر>» */}
        <div className="border-t border-[#2E2E4A]/80 pt-4 text-center">
          <p className="text-xs sm:text-sm text-[#AEAECB]">
            أتممتَ{' '}
            <span className="font-bold text-[#E4C368]">
              {toArabicNumerals(completedInThisMonthCount)}
            </span>{' '}
            يومًا من {calendarData.monthTitle}
          </p>
        </div>
      </GlassCard>

      {/* Daily Reminder Toggle Card directly under calendar (Matches ref-04-calendar.png) */}
      <GlassCard padding="p-5" className="flex items-center justify-between">
        {/* Left side: Violet Toggle Switch */}
        <button
          onClick={() => onToggleNotifications(!notificationsEnabled)}
          role="switch"
          aria-checked={notificationsEnabled}
          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
            notificationsEnabled ? 'bg-[#6C63FF]' : 'bg-[#2E2E4A]'
          }`}
          aria-label="تبديل التذكير اليومي"
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              notificationsEnabled ? '-translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>

        {/* Right side: Bell icon + Label & Time */}
        <div
          onClick={() => setIsTimePickerOpen(true)}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="text-right">
            <span className="text-sm font-bold text-[#EDEDF5] block">
              التذكير اليومي
            </span>
            <span className="text-xs text-[#AEAECB]">
              {formatArabicTime(notificationTime)}
            </span>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#15152A]/80 border border-[#2E2E4A] flex items-center justify-center text-[#E4C368]">
            <Bell size={18} />
          </div>
        </div>
      </GlassCard>

      {/* Simple Time Picker Modal */}
      {isTimePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-xs bg-[#1E1E38] border border-[#2E2E4A] rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#EDEDF5] text-center">
              وقت التذكير اليومي
            </h3>
            <input
              type="time"
              defaultValue={notificationTime}
              onChange={e => onChangeNotificationTime(e.target.value)}
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
    </div>
  );
};
