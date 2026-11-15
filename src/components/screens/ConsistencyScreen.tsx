import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Bell, CalendarDays, CheckCircle2, RotateCcw } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { ReflectionCategoryCharts } from '../common/ReflectionCategoryCharts';
import { generateMonthCalendar, HijriCalendarDay } from '../../lib/hijri';
import { formatArabicTime } from '../../lib/arabic';

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
  const [selectedDay, setSelectedDay] = useState<HijriCalendarDay | null>(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  // Generate calendar days for the current offset
  const calendarData = useMemo(() => {
    return generateMonthCalendar(new Date(), monthOffset);
  }, [monthOffset]);

  // Weekday letters from Saturday to Friday: س ح ن ث ر خ ج (as in ref-04-calendar.png)
  const weekdayLetters = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];
  const weekdayFullNames = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const activeDayToReview = useMemo(() => {
    if (selectedDay && calendarData.days.some(d => d.isoDate === selectedDay.isoDate)) {
      return selectedDay;
    }
    return calendarData.days.find(d => d.isToday) || calendarData.days[0] || null;
  }, [selectedDay, calendarData.days]);

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

      {/* Self-Awareness & Most Reflected Categories / Topics Visualization */}
      <ReflectionCategoryCharts />

      {/* Hijri Calendar Card for Monthly Reflection Achievement Review */}
      <GlassCard padding="p-5 sm:p-6" className="space-y-5">
        {/* Card Section Header */}
        <div className="flex items-center justify-between border-b border-[#2E2E4A]/70 pb-3.5">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-[#C8A951]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#EDEDF5]">
                التقويم الهجري للتدبر
              </h2>
              <p className="text-[11px] text-[#AEAECB]">
                أيام تدبّرك في الشهر الهجري — بلا عدّاد ولا أيّامٍ «فائتة»
              </p>
            </div>
          </div>

          {monthOffset !== 0 && (
            <button
              type="button"
              onClick={() => {
                setMonthOffset(0);
                setSelectedDay(null);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#15152A]/90 hover:bg-[#25232E] border border-[#2E2E4A] text-[#E4C368] transition-colors cursor-pointer"
              title="العودة للشهر الحالي"
            >
              <RotateCcw size={13} />
              <span>الشهر الحالي</span>
            </button>
          )}
        </div>

        {/* Month Navigation: ‹ الشهر الهجري ١٤٤٨ هـ › */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => {
              setMonthOffset(m => m - 1);
              setSelectedDay(null);
            }}
            className="w-9 h-9 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] transition-colors cursor-pointer"
            aria-label="الشهر الهجري السابق"
          >
            <ChevronRight size={18} />
          </button>

          <div className="text-center">
            <span className="font-serif font-bold text-lg sm:text-xl text-[#C8A951] block">
              {calendarData.monthTitle}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setMonthOffset(m => m + 1);
              setSelectedDay(null);
            }}
            className="w-9 h-9 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] transition-colors cursor-pointer"
            aria-label="الشهر الهجري القادم"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Weekday Headers: س ح ن ث ر خ ج */}
        <div className="grid grid-cols-7 gap-1 text-center border-b border-[#2E2E4A]/80 pb-2.5">
          {weekdayLetters.map((letter, idx) => (
            <span key={idx} className="text-xs font-semibold text-[#AEAECB]">
              {letter}
            </span>
          ))}
        </div>

        {/* Days Grid with Distinctive Reflection Dots */}
        <div className="grid grid-cols-7 gap-y-2.5 gap-x-1 text-center items-center">
          {/* Padding empty slots */}
          {Array.from({ length: calendarData.startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="h-12 w-full" />
          ))}

          {/* Calendar day cells */}
          {calendarData.days.map((day) => {
            const isCompleted = completedDays.includes(day.isoDate);
            const isSelected = activeDayToReview?.isoDate === day.isoDate;

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center justify-center h-12 w-full rounded-xl relative transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#252547]/90 ring-1 ring-[#C8A951]/60'
                    : 'hover:bg-[#15152A]/60'
                }`}
                aria-label={`${day.hijriFullLabel} - ${isCompleted ? 'تم التدبر' : 'لم يتم التدبر'}`}
              >
                {/* Day Number Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    day.isToday
                      ? 'border-2 border-[#6C63FF] bg-[#6C63FF]/20 text-[#EDEDF5] font-bold'
                      : isCompleted
                      ? 'bg-[#C8A951]/15 border border-[#C8A951]/40 text-[#E4C368] font-bold'
                      : day.isFuture
                      ? 'text-[#AEAECB]/45'
                      : 'text-[#EDEDF5]'
                  }`}
                >
                  {day.arabicNumber}
                </div>

                {/* Distinctive Gold Indicator Dot Underneath Completed Reflection Days */}
                <div className="h-2.5 flex items-center justify-center mt-0.5">
                  {isCompleted ? (
                    <span className="w-2 h-2 rounded-full bg-[#E4C368] shadow-[0_0_8px_rgba(228,195,104,0.95)] ring-2 ring-[#E4C368]/25 transition-transform scale-100" />
                  ) : day.isToday ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]/80" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend for Calendar Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-[11px] text-[#AEAECB]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4C368] shadow-[0_0_6px_rgba(228,195,104,0.9)] inline-block" />
            <span>يوم تم فيه التدبر</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#6C63FF] bg-[#6C63FF]/20 inline-block" />
            <span>اليوم الحالي</span>
          </div>
        </div>

        {/* Selected Day Details & Monthly Progress Review Box */}
        <div
          className="rounded-2xl p-4 border space-y-3"
          style={{
            backgroundColor: 'var(--bg-sunken)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          {/* Selected Day Status */}
          {activeDayToReview && (
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-[#EDEDF5]">
                  {weekdayFullNames[activeDayToReview.weekdayIndex]}، {activeDayToReview.hijriFullLabel}
                </div>
                <div className="text-[11px] text-[#AEAECB]">
                  الموافق {activeDayToReview.gregorianLabel}
                </div>
              </div>

              {completedDays.includes(activeDayToReview.isoDate) ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C8A951]/15 border border-[#C8A951]/35 text-[#E4C368] text-xs font-bold">
                  <CheckCircle2 size={14} />
                  <span>تم التدبر</span>
                </div>
              ) : (
                <div className="px-2.5 py-1 rounded-lg bg-[#15152A]/80 border border-[#2E2E4A] text-[#AEAECB] text-xs">
                  {activeDayToReview.isFuture ? 'يوم قادم' : 'لم يُسجَّل تدبر'}
                </div>
              )}
            </div>
          )}
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
