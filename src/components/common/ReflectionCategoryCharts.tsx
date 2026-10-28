import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Compass,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Radar as RadarIcon,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { CATEGORIES, mapOldCategoryToCanonical } from '../../constants/categories';
import { getAllBlessings, getBlessingById } from '../../data/loader';
import { blessingForDate } from '../../lib/dailyLogic';
import { toArabicNumerals } from '../../lib/arabic';

export interface ReflectionCategoryChartsProps {
  /** Optional compact styling when embedded inside Journey screen */
  variant?: 'default' | 'journey';
}

interface CategoryStatItem {
  key: string;
  label: string;
  shortLabel: string;
  count: number;
  percentage: number;
  color: string;
  topTopics: string[];
}

interface TopicStatItem {
  title: string;
  categoryLabel: string;
  count: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'نعم الدين': '#E4C368',
  'نعم الحياة والنفس': '#6C63FF',
  'نعم الأهل': '#4DB6AC',
  'نعم العافية': '#9D97FF',
  'نعم الرزق': '#F4A261',
  'نعم العقل': '#56CFE1',
  'نعم الأمن': '#80ED99',
  'نعم المال': '#E76F51'
};

const SHORT_CATEGORY_LABELS: Record<string, string> = {
  'نعم الدين': 'الدين',
  'نعم الحياة والنفس': 'الحياة والنفس',
  'نعم الأهل': 'الأهل',
  'نعم العافية': 'العافية',
  'نعم الرزق': 'الرزق',
  'نعم العقل': 'العقل',
  'نعم الأمن': 'الأمن',
  'نعم المال': 'المال'
};

const CATEGORY_SELF_AWARENESS_HINTS: Record<string, string> = {
  'نعم الدين': 'تأمل نعمة الهداية، تيسير الذكر، وانشراح الصدر للطاعة.',
  'نعم الحياة والنفس': 'تأمل نعمة الأنفاس المتجددة، الحواس، والقدرة على السعي كل صباح.',
  'نعم الأهل': 'تأمل دفء القرب، دعوات الوالدين، ومودة من يؤنس وحشتك.',
  'نعم العافية': 'تأمل سكون الألم، عافية الجوارح، ونوم الليل في طمأنينة.',
  'نعم الرزق': 'تأمل الرزق الذي يسوقه الله إليك من حيث تحتسب ومن حيث لا تحتسب.',
  'نعم العقل': 'تأمل نعمة الفهم، التمييز، التدبر، وحفظ الذكريات الجميلة.',
  'نعم الأمن': 'تأمل نعمة الأمان في المسكن والوطن وطمأنينة القلب عند المساء.',
  'نعم المال': 'تأمل نعمة الكفاية، الاستغناء عن الخلق، والقدرة على البذل والعطاء.'
};

export const ReflectionCategoryCharts: React.FC<ReflectionCategoryChartsProps> = ({
  variant = 'default'
}) => {
  const { completedDays, entries, userBlessings, journeyState } = useStore();
  const [chartType, setChartType] = useState<'bars' | 'radar' | 'donut'>('bars');

  const analytics = useMemo(() => {
    const allBlessings = getAllBlessings();
    const categoryCounts: Record<string, number> = {};
    const categoryTopicsMap: Record<string, Set<string>> = {};
    const topicMap: Record<string, { title: string; categoryLabel: string; count: number }> = {};

    CATEGORIES.forEach((cat) => {
      categoryCounts[cat.label] = 0;
      categoryTopicsMap[cat.label] = new Set<string>();
    });

    const recordReflection = (rawCategory: string | undefined, topicTitle: string | undefined) => {
      const canonicalCat = mapOldCategoryToCanonical(rawCategory);
      categoryCounts[canonicalCat] = (categoryCounts[canonicalCat] || 0) + 1;

      if (topicTitle && topicTitle.trim()) {
        const cleanTitle = topicTitle.trim();
        if (!categoryTopicsMap[canonicalCat]) {
          categoryTopicsMap[canonicalCat] = new Set<string>();
        }
        categoryTopicsMap[canonicalCat].add(cleanTitle);

        if (!topicMap[cleanTitle]) {
          topicMap[cleanTitle] = {
            title: cleanTitle,
            categoryLabel: canonicalCat,
            count: 0
          };
        }
        topicMap[cleanTitle].count += 1;
      }
    };

    // 1. Completed daily reflections (from calendar / home daily reflection)
    completedDays.forEach((isoDate) => {
      const b = blessingForDate(isoDate, allBlessings);
      if (b) {
        recordReflection(b.categoryLabel, b.shortTitle || b.title);
      }
    });

    // 2. Journal entries written by the user
    entries.forEach((entry) => {
      recordReflection(entry.categoryLabel, entry.shortTitle);
    });

    // 3. Personal blessings added by the user
    userBlessings.forEach((ub) => {
      recordReflection(ub.category, ub.title);
    });

    // 4. Completed Journey stations («رحلتي»)
    const completedStationIds = Object.keys(journeyState?.completed || {});
    completedStationIds.forEach((stationId) => {
      const parts = stationId.split('__');
      if (parts.length === 2) {
        const [stageId, idxStr] = parts;
        const stationIdx = parseInt(idxStr, 10);
        const stage = journeyState.stages.find((s) => s.id === stageId);
        const blessingId = stage?.stationBlessingIds?.[stationIdx];
        if (blessingId) {
          const b = getBlessingById(blessingId);
          if (b) {
            recordReflection(b.categoryLabel, b.shortTitle || b.title);
          }
        }
      }
    });

    const totalReflections = Object.values(categoryCounts).reduce((acc, c) => acc + c, 0);

    const categoryStats: CategoryStatItem[] = CATEGORIES.map((cat) => {
      const count = categoryCounts[cat.label] || 0;
      const percentage =
        totalReflections > 0 ? Math.round((count / totalReflections) * 100) : 0;
      const color = CATEGORY_COLORS[cat.label] || '#E4C368';
      const topTopics = Array.from(categoryTopicsMap[cat.label] || []).slice(0, 3);

      return {
        key: cat.key,
        label: cat.label,
        shortLabel: SHORT_CATEGORY_LABELS[cat.label] || cat.label,
        count,
        percentage,
        color,
        topTopics
      };
    });

    // Sorted descending for bar chart and ranking
    const sortedByCount = [...categoryStats].sort((a, b) => b.count - a.count);
    const activeCategories = sortedByCount.filter((c) => c.count > 0);

    const topCategory = sortedByCount[0] || null;
    // Find a category with 0 or lowest count to gently suggest for balanced self-awareness
    const leastExploredCategory =
      [...categoryStats].sort((a, b) => a.count - b.count)[0] || null;

    const topTopicsList: TopicStatItem[] = Object.values(topicMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        color: CATEGORY_COLORS[item.categoryLabel] || '#E4C368'
      }));

    return {
      totalReflections,
      categoryStats,
      sortedByCount,
      activeCategories,
      topCategory,
      leastExploredCategory,
      topTopicsList
    };
  }, [completedDays, entries, userBlessings, journeyState]);

  const containerClass =
    variant === 'journey'
      ? 'p-4 sm:p-5 rounded-3xl bg-[#1E1E38]/90 border border-[#2E2E4A] space-y-5'
      : 'rounded-3xl p-5 sm:p-6 border space-y-5 bg-[#1E1E38]/85 border-[#2E2E4A] shadow-lg';

  return (
    <section
      aria-label="بصيرة التدبر وتوزيع فئات النعم"
      className={containerClass}
      style={{
        backgroundColor: 'var(--bg-raised)',
        borderColor: 'var(--border-hairline)'
      }}
      dir="rtl"
    >
      {/* Header & Chart Type Switcher */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/35 flex items-center justify-center text-[#E4C368] shrink-0">
            <Compass size={18} />
          </div>
          <div className="text-right">
            <h2 className="text-sm sm:text-base font-bold text-[#EDEDF5]">
              بصيرة التدبر والوعي الذاتي
            </h2>
            <p className="text-[11px] text-[#AEAECB]">
              أكثر المواضيع وفئات النعم حضوراً في تأملاتك ({toArabicNumerals(analytics.totalReflections)} وقفة تدبر)
            </p>
          </div>
        </div>

        {/* 3-Way Chart Switcher */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-sunken)',
            borderColor: 'var(--border-hairline)'
          }}
        >
          <button
            type="button"
            onClick={() => setChartType('bars')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              chartType === 'bars'
                ? 'bg-[#6C63FF] text-white'
                : 'text-[#AEAECB] hover:text-[#EDEDF5]'
            }`}
          >
            <BarChart3 size={12} />
            <span>الفئات</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('radar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              chartType === 'radar'
                ? 'bg-[#6C63FF] text-white'
                : 'text-[#AEAECB] hover:text-[#EDEDF5]'
            }`}
          >
            <RadarIcon size={12} />
            <span>ميزان الوعي</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              chartType === 'donut'
                ? 'bg-[#6C63FF] text-white'
                : 'text-[#AEAECB] hover:text-[#EDEDF5]'
            }`}
          >
            <PieChartIcon size={12} />
            <span>النِّسَب</span>
          </button>
        </div>
      </div>

      {/* Self-Awareness Summary Cards: Most Reflected vs Suggested Next Focus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {analytics.topCategory && analytics.topCategory.count > 0 && (
          <div
            className="rounded-2xl p-3.5 border text-right space-y-1"
            style={{
              backgroundColor: 'var(--bg-sunken)',
              borderColor: 'var(--border-hairline)'
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#AEAECB] flex items-center gap-1">
                <Sparkles size={13} className="text-[#E4C368]" />
                <span>أكثر الفئات حضوراً في قلبك</span>
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: `${analytics.topCategory.color}22`,
                  color: analytics.topCategory.color
                }}
              >
                {toArabicNumerals(analytics.topCategory.percentage)}٪ من تدبرك
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-[#EDEDF5]">
              {analytics.topCategory.label} ({toArabicNumerals(analytics.topCategory.count)})
            </div>
            {analytics.topCategory.topTopics.length > 0 && (
              <p className="text-[11px] text-[#AEAECB] truncate">
                أبرز النعم: {analytics.topCategory.topTopics.join('، ')}
              </p>
            )}
          </div>
        )}

        {analytics.leastExploredCategory && (
          <div
            className="rounded-2xl p-3.5 border text-right space-y-1"
            style={{
              backgroundColor: 'var(--bg-sunken)',
              borderColor: 'var(--border-hairline)'
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#AEAECB] flex items-center gap-1">
                <Lightbulb size={13} className="text-[#6C63FF]" />
                <span>أفق مقترح لتوسيع الوعي</span>
              </span>
              <span className="text-[10px] text-[#AEAECB]">
                {analytics.leastExploredCategory.count === 0
                  ? 'لم يُستكشف بعد'
                  : `${toArabicNumerals(analytics.leastExploredCategory.count)} وقفة`}
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-[#EDEDF5]">
              {analytics.leastExploredCategory.label}
            </div>
            <p className="text-[11px] text-[#AEAECB] leading-relaxed">
              {CATEGORY_SELF_AWARENESS_HINTS[analytics.leastExploredCategory.label]}
            </p>
          </div>
        )}
      </div>

      {/* Main Recharts Visualization Area */}
      <div className="w-full h-60 pt-1" dir="ltr">
        {chartType === 'bars' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics.sortedByCount}
              layout="vertical"
              margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="var(--border-hairline)"
                opacity={0.55}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                tickFormatter={(val) => toArabicNumerals(val)}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="shortLabel"
                width={82}
                tick={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(108, 99, 255, 0.08)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload as CategoryStatItem;
                  return (
                    <div
                      dir="rtl"
                      className="rounded-2xl px-3.5 py-2.5 border text-xs shadow-xl space-y-1.5"
                      style={{
                        backgroundColor: 'var(--bg-raised)',
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div
                        className="font-bold border-b pb-1 flex items-center justify-between gap-3"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      >
                        <span>{item.label}</span>
                        <span style={{ color: item.color }}>
                          {toArabicNumerals(item.percentage)}٪
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span style={{ color: 'var(--text-muted)' }}>عدد مرات التدبر:</span>
                        <span className="font-bold">{toArabicNumerals(item.count)}</span>
                      </div>
                      {item.topTopics.length > 0 && (
                        <div className="text-[11px] pt-0.5" style={{ color: 'var(--text-muted)' }}>
                          من النعم المتدبَّرة: {item.topTopics.join('، ')}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={16}>
                {analytics.sortedByCount.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={entry.count > 0 ? entry.color : 'rgba(174, 174, 203, 0.2)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'radar' && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="72%"
              data={analytics.categoryStats}
            >
              <PolarGrid stroke="var(--border-hairline)" />
              <PolarAngleAxis
                dataKey="shortLabel"
                tick={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                allowDecimals={false}
                tickFormatter={(val) => toArabicNumerals(val)}
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload as CategoryStatItem;
                  return (
                    <div
                      dir="rtl"
                      className="rounded-2xl px-3.5 py-2.5 border text-xs shadow-xl space-y-1"
                      style={{
                        backgroundColor: 'var(--bg-raised)',
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div className="font-bold" style={{ color: item.color }}>
                        {item.label}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span style={{ color: 'var(--text-muted)' }}>وقفات التدبر:</span>
                        <span className="font-bold">
                          {toArabicNumerals(item.count)} ({toArabicNumerals(item.percentage)}٪)
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Radar
                name="وقفات التدبر"
                dataKey="count"
                stroke="#E4C368"
                strokeWidth={2.2}
                fill="#6C63FF"
                fillOpacity={0.38}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'donut' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={
                  analytics.activeCategories.length > 0
                    ? analytics.activeCategories
                    : analytics.categoryStats
                }
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={84}
                paddingAngle={3}
                stroke="none"
              >
                {(analytics.activeCategories.length > 0
                  ? analytics.activeCategories
                  : analytics.categoryStats
                ).map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload as CategoryStatItem;
                  return (
                    <div
                      dir="rtl"
                      className="rounded-2xl px-3.5 py-2.5 border text-xs shadow-xl space-y-1"
                      style={{
                        backgroundColor: 'var(--bg-raised)',
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div className="font-bold" style={{ color: item.color }}>
                        {item.label}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span style={{ color: 'var(--text-muted)' }}>النسبة:</span>
                        <span className="font-bold">
                          {toArabicNumerals(item.percentage)}٪ ({toArabicNumerals(item.count)})
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Progress Chips & Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {analytics.sortedByCount.map((cat) => (
          <div
            key={cat.key}
            className="px-3 py-2 rounded-xl border flex items-center justify-between gap-2"
            style={{
              backgroundColor: 'var(--bg-sunken)',
              borderColor: 'var(--border-hairline)'
            }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: cat.count > 0 ? cat.color : 'rgba(174,174,203,0.3)'
                }}
              />
              <span className="text-xs font-medium text-[#EDEDF5] truncate">
                {cat.shortLabel}
              </span>
            </div>
            <span className="text-xs font-bold text-[#AEAECB] shrink-0">
              {toArabicNumerals(cat.count)}
            </span>
          </div>
        ))}
      </div>

      {/* Top Contemplated Topics / Specific Blessings */}
      {analytics.topTopicsList.length > 0 && (
        <div
          className="pt-3.5 border-t space-y-2.5"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#EDEDF5]">
              <BookOpen size={14} className="text-[#E4C368]" />
              <span>أكثر المواضيع والنعم حضوراً في تدبرك</span>
            </div>
            <span className="text-[11px] text-[#AEAECB]">حسب تكرار التأمل والتدوين</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {analytics.topTopicsList.map((topic) => (
              <div
                key={topic.title}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
                style={{
                  backgroundColor: 'var(--bg-sunken)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: topic.color }}
                />
                <span className="font-bold text-[#EDEDF5]">{topic.title}</span>
                <span className="text-[11px] text-[#AEAECB]">({topic.categoryLabel})</span>
                {topic.count > 1 && (
                  <span
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                    style={{
                      backgroundColor: `${topic.color}20`,
                      color: topic.color
                    }}
                  >
                    ×{toArabicNumerals(topic.count)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
