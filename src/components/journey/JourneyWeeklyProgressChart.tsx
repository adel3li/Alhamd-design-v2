import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Sparkles, CalendarCheck2, Compass } from 'lucide-react';
import { JourneyState } from '../../types';
import { getLocalDateString } from '../../lib/journeyStore';
import { toArabicNumerals } from '../../lib/arabic';

interface JourneyWeeklyProgressChartProps {
  journeyState: JourneyState;
  completedDays?: string[];
}

const ARABIC_WEEKDAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export const JourneyWeeklyProgressChart: React.FC<JourneyWeeklyProgressChartProps> = ({
  journeyState,
  completedDays = []
}) => {
  const [chartView, setChartView] = useState<'combined' | 'daily'>('combined');

  const weeklyStats = useMemo(() => {
    const today = new Date();

    // Map each local YYYY-MM-DD date to count of completed journey stations on that date
    const stationCountsByDate: Record<string, number> = {};
    const allCompletionDates: string[] = [];

    const completedEntries = Object.values(journeyState.completed || {}) as Array<{
      completedAt: string;
    }>;

    completedEntries.forEach((item) => {
      if (!item?.completedAt) return;
      const parsed = new Date(item.completedAt);
      const dateStr = Number.isNaN(parsed.getTime())
        ? item.completedAt.slice(0, 10)
        : getLocalDateString(parsed);
      stationCountsByDate[dateStr] = (stationCountsByDate[dateStr] || 0) + 1;
      allCompletionDates.push(dateStr);
    });

    // Also include general daily reflections if a day had a reflection outside station count
    const generalCompletedSet = new Set(completedDays);

    const data: Array<{
      dateIso: string;
      dayLabel: string;
      dailyBlessings: number;
      cumulativeBlessings: number;
      paceTarget: number;
    }> = [];

    let weekBlessingsTotal = 0;
    let activeDaysThisWeek = 0;

    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const iso = getLocalDateString(d);

      const stationsOnDay = stationCountsByDate[iso] || 0;
      const hasGeneralReflection = generalCompletedSet.has(iso) ? 1 : 0;
      const dailyBlessings = Math.max(stationsOnDay, hasGeneralReflection);

      const cumulativeStationsUpToDay = allCompletionDates.filter(
        (dt) => dt <= iso
      ).length;
      const cumulativeGeneralUpToDay = completedDays.filter(
        (dt) => dt <= iso
      ).length;
      const cumulativeBlessings = Math.max(
        cumulativeStationsUpToDay,
        cumulativeGeneralUpToDay
      );

      weekBlessingsTotal += dailyBlessings;
      if (dailyBlessings > 0) {
        activeDaysThisWeek += 1;
      }

      data.push({
        dateIso: iso,
        dayLabel: offset === 0 ? 'اليوم' : ARABIC_WEEKDAYS[d.getDay()],
        dailyBlessings,
        cumulativeBlessings,
        paceTarget: journeyState.pace
      });
    }

    const totalStationsInJourney = journeyState.stages.reduce(
      (acc, stg) => acc + stg.stationBlessingIds.length,
      0
    );
    const totalCompletedStations = Object.keys(journeyState.completed || {}).length;

    return {
      data,
      weekBlessingsTotal,
      activeDaysThisWeek,
      totalCompletedStations,
      totalStationsInJourney
    };
  }, [journeyState.completed, journeyState.stages, journeyState.pace, completedDays]);

  // Encouraging, non-pressuring message based on weekly activity
  const motivationalMessage = useMemo(() => {
    if (weeklyStats.activeDaysThisWeek >= 5) {
      return 'ما شاء الله، حضورٌ قلبيٌّ متصل مع تدبر النعم هذا الأسبوع.';
    }
    if (weeklyStats.activeDaysThisWeek >= 2) {
      return 'خطواتٌ هادئة ومباركة على مسار التدبر؛ قليلٌ دائم خيرٌ من كثيرٍ منقطع.';
    }
    if (weeklyStats.activeDaysThisWeek === 1) {
      return 'بداية طيبة هذا الأسبوع؛ محطة واحدة في اليوم تفتح للقلب أبواب الشكر.';
    }
    return 'ابدأ محطتك اليوم لتضيء مسار تدبرك الأسبوعي خطوةً بخطوة.';
  }, [weeklyStats.activeDaysThisWeek]);

  return (
    <section
      aria-label="التقدم الأسبوعي في تدبر النعم"
      className="p-4 sm:p-5 rounded-3xl bg-[#1E1E38]/90 border border-[#2E2E4A] space-y-4"
      dir="rtl"
    >
      {/* Header & View Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/35 flex items-center justify-center text-[#E4C368] shrink-0">
            <TrendingUp size={16} />
          </div>
          <div className="text-right">
            <h2 className="text-sm sm:text-base font-bold text-[#EDEDF5]">
              أثر المداومة الأسبوعي
            </h2>
            <p className="text-[11px] text-[#AEAECB]">
              متابعة بصرية هادئة لتدبر النعم خلال آخر {toArabicNumerals(7)} أيام
            </p>
          </div>
        </div>

        {/* Chart Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#15152A] p-1 rounded-xl border border-[#2E2E4A]">
          <button
            type="button"
            onClick={() => setChartView('combined')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              chartView === 'combined'
                ? 'bg-[#6C63FF] text-white'
                : 'text-[#AEAECB] hover:text-[#EDEDF5]'
            }`}
          >
            التراكمي واليومي
          </button>
          <button
            type="button"
            onClick={() => setChartView('daily')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              chartView === 'daily'
                ? 'bg-[#6C63FF] text-white'
                : 'text-[#AEAECB] hover:text-[#EDEDF5]'
            }`}
          >
            الورد اليومي
          </button>
        </div>
      </div>

      {/* Quick Weekly Metrics Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#15152A]/90 border border-[#2E2E4A] text-right space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[#AEAECB]">
            <Sparkles size={13} className="text-[#E4C368] shrink-0" />
            <span>نعم الأسبوع</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#EDEDF5]">
            {toArabicNumerals(weeklyStats.weekBlessingsTotal)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#15152A]/90 border border-[#2E2E4A] text-right space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[#AEAECB]">
            <CalendarCheck2 size={13} className="text-[#6C63FF] shrink-0" />
            <span>أيام الحضور</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#EDEDF5]">
            {toArabicNumerals(weeklyStats.activeDaysThisWeek)}{' '}
            <span className="text-[11px] font-normal text-[#AEAECB]">
              / {toArabicNumerals(7)}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#15152A]/90 border border-[#2E2E4A] text-right space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[#AEAECB]">
            <Compass size={13} className="text-[#E4C368] shrink-0" />
            <span>محطات الرحلة</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#EDEDF5]">
            {toArabicNumerals(weeklyStats.totalCompletedStations)}{' '}
            <span className="text-[11px] font-normal text-[#AEAECB]">
              / {toArabicNumerals(weeklyStats.totalStationsInJourney)}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Weekly Visualization */}
      <div className="w-full h-48 pt-2" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={weeklyStats.data}
            margin={{ top: 10, right: 12, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="journeyCumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E4C368" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#E4C368" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="journeyDailyBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#6C63FF" stopOpacity={0.45} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#2E2E4A"
              opacity={0.65}
            />

            <XAxis
              dataKey="dayLabel"
              tick={{ fill: '#AEAECB', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tickFormatter={(val) => toArabicNumerals(val)}
              tick={{ fill: '#AEAECB', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: 'rgba(108, 99, 255, 0.08)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const row = payload[0]?.payload as {
                  dailyBlessings: number;
                  cumulativeBlessings: number;
                  paceTarget: number;
                };
                return (
                  <div
                    dir="rtl"
                    className="rounded-2xl px-3.5 py-2.5 bg-[#15152A] border border-[#2E2E4A] text-xs shadow-xl space-y-1.5"
                  >
                    <div className="font-bold text-[#EDEDF5] border-b border-[#2E2E4A] pb-1">
                      {label}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#AEAECB]">نعم متدبَّرة في اليوم:</span>
                      <span className="font-bold text-[#6C63FF]">
                        {toArabicNumerals(row?.dailyBlessings ?? 0)}
                      </span>
                    </div>
                    {chartView === 'combined' && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#AEAECB]">التقدم التراكمي:</span>
                        <span className="font-bold text-[#E4C368]">
                          {toArabicNumerals(row?.cumulativeBlessings ?? 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#AEAECB]">الوتيرة اليومية:</span>
                      <span className="text-[#C7C4D8]">
                        {toArabicNumerals(row?.paceTarget ?? 1)} محطة
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {chartView === 'combined' && (
              <Area
                type="monotone"
                dataKey="cumulativeBlessings"
                name="التقدم التراكمي"
                stroke="#E4C368"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#journeyCumulativeGrad)"
              />
            )}

            <Bar
              dataKey="dailyBlessings"
              name="نعم اليوم"
              barSize={chartView === 'daily' ? 24 : 16}
              radius={[6, 6, 0, 0]}
              fill="url(#journeyDailyBarGrad)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Gentle Motivational Footer */}
      <div className="pt-2 border-t border-[#2E2E4A]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <p className="text-[#C7C4D8] leading-relaxed">{motivationalMessage}</p>
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#AEAECB]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#6C63FF]" />
            <span>نعم اليوم</span>
          </span>
          {chartView === 'combined' && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E4C368]" />
              <span>التقدم التراكمي</span>
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
