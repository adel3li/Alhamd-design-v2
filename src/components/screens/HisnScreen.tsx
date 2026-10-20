import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Sun,
  Moon,
  Sparkles,
  Bookmark,
  Copy,
  Check,
  RotateCcw,
  Search,
  PanelRightOpen,
  X,
  Compass,
  Home as HomeIcon,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../common/GlassCard';
import {
  HISN_CATEGORIES,
  HISN_ADHAKR,
  HisnCategoryId,
  HisnDhikrItem,
  getDailyHisnTip
} from '../../data/hisnAlMuslim';
import { toArabicNumerals } from '../../lib/arabic';

interface HisnScreenProps {
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success') => void;
  initialCategory?: HisnCategoryId;
  externalDrawerOpen?: boolean;
  onCloseExternalDrawer?: () => void;
  embedded?: boolean;
}

const getRecommendedCategoryForCurrentTime = (): {
  categoryId: HisnCategoryId;
  label: string;
  reason: string;
} => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return {
      categoryId: 'morning',
      label: 'أذكار الصباح',
      reason: 'وقتها المستحب الآن في الصباح'
    };
  }
  if (hour >= 15 && hour < 21) {
    return {
      categoryId: 'evening',
      label: 'أذكار المساء',
      reason: 'وقتها المستحب الآن في المساء'
    };
  }
  if (hour >= 21 || hour < 4) {
    return {
      categoryId: 'sleep',
      label: 'أذكار النوم والاستيقاظ',
      reason: 'ختام يومك بذكر الله قبل المنام'
    };
  }
  return {
    categoryId: 'prayer',
    label: 'أذكار بعد الصلاة',
    reason: 'أذكار دُبُر الصلوات المكتوبة'
  };
};

export const HisnCategoryIcon: React.FC<{ categoryId: HisnCategoryId; size?: number; className?: string }> = ({
  categoryId,
  size = 18,
  className = ''
}) => {
  switch (categoryId) {
    case 'morning':
      return <Sun size={size} className={className} />;
    case 'evening':
      return <Moon size={size} className={className} />;
    case 'prayer':
      return <Compass size={size} className={className} />;
    case 'sleep':
      return <Sparkles size={size} className={className} />;
    case 'home':
      return <HomeIcon size={size} className={className} />;
    case 'dua':
    default:
      return <HeartHandshake size={size} className={className} />;
  }
};

export const HisnScreen: React.FC<HisnScreenProps> = ({
  triggerHaptic,
  initialCategory,
  externalDrawerOpen = false,
  onCloseExternalDrawer,
  embedded = false
}) => {
  const recommended = useMemo(() => getRecommendedCategoryForCurrentTime(), []);
  const { tip: dailyTip } = useMemo(() => getDailyHisnTip(), []);
  const [selectedCategory, setSelectedCategory] = useState<HisnCategoryId>(
    initialCategory || recommended.categoryId
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedDailyTip, setCopiedDailyTip] = useState(false);

  // Sync with external drawer trigger if provided
  useEffect(() => {
    if (externalDrawerOpen) {
      setIsSideMenuOpen(true);
    }
  }, [externalDrawerOpen]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setShowFavoritesOnly(false);
    }
  }, [initialCategory]);

  // Daily progress keyed by today's ISO date
  const todayKey = useMemo(() => {
    const iso = new Date().toISOString().split('T')[0];
    return `alhamd_hisn_counts_${iso}`;
  }, []);

  const [counts, setCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Pinned / Quick-access favorite dhikr IDs
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('alhamd_hisn_favorites');
      return saved
        ? JSON.parse(saved)
        : ['morning-ayat-kursi', 'morning-sayyid-istighfar', 'evening-afiyah'];
    } catch {
      return ['morning-ayat-kursi', 'morning-sayyid-istighfar', 'evening-afiyah'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(counts));
    } catch {}
  }, [counts, todayKey]);

  useEffect(() => {
    try {
      localStorage.setItem('alhamd_hisn_favorites', JSON.stringify(favoriteIds));
    } catch {}
  }, [favoriteIds]);

  const handleCloseDrawer = () => {
    setIsSideMenuOpen(false);
    onCloseExternalDrawer?.();
  };

  const handleTapDhikr = (item: HisnDhikrItem) => {
    const current = counts[item.id] || 0;
    if (current >= item.count) {
      // Already completed; gentle tap feedback
      triggerHaptic('light');
      return;
    }
    const next = current + 1;
    setCounts(prev => ({ ...prev, [item.id]: next }));
    if (next >= item.count) {
      triggerHaptic('success');
    } else {
      triggerHaptic('light');
    }
  };

  const handleResetDhikr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    setCounts(prev => ({ ...prev, [id]: 0 }));
  };

  const handleResetCategory = () => {
    triggerHaptic('medium');
    const next = { ...counts };
    HISN_ADHAKR.filter(d => d.categoryId === selectedCategory).forEach(d => {
      delete next[d.id];
    });
    setCounts(next);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    setFavoriteIds(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleCopyDhikr = async (item: HisnDhikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = `${item.title}\n${item.isQuran ? `﴿${item.text}﴾` : `«${item.text}»`}\n(${item.source})\n— حصن المسلم · تطبيق «الحمد»`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedId(item.id);
      triggerHaptic('light');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  // Compute completion per category (items & repetitions)
  const categoryStats = useMemo(() => {
    const map: Record<
      string,
      {
        completed: number;
        total: number;
        completedReps: number;
        totalReps: number;
        percentage: number;
      }
    > = {};
    for (const cat of HISN_CATEGORIES) {
      const items = HISN_ADHAKR.filter(d => d.categoryId === cat.id);
      const completed = items.filter(d => (counts[d.id] || 0) >= d.count).length;
      const completedReps = items.reduce(
        (sum, d) => sum + Math.min(d.count, counts[d.id] || 0),
        0
      );
      const totalReps = items.reduce((sum, d) => sum + d.count, 0);
      const percentage = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
      map[cat.id] = {
        completed,
        total: items.length,
        completedReps,
        totalReps,
        percentage
      };
    }
    return map;
  }, [counts]);

  // Core Time-Divided Daily Wirds (أذكار الصباح، أذكار المساء، أذكار الصلاة)
  const dailyTimeWirds = useMemo(() => {
    const definitions: Array<{
      id: HisnCategoryId;
      title: string;
      timeRange: string;
    }> = [
      {
        id: 'morning',
        title: 'أذكار الصباح',
        timeRange: 'من الفجر إلى الضحى'
      },
      {
        id: 'evening',
        title: 'أذكار المساء',
        timeRange: 'من العصر إلى المساء'
      },
      {
        id: 'prayer',
        title: 'أذكار الصلاة',
        timeRange: 'دُبُر كل صلاة مكتوبة'
      }
    ];

    return definitions.map(def => {
      const stat = categoryStats[def.id] || {
        completed: 0,
        total: 1,
        completedReps: 0,
        totalReps: 1,
        percentage: 0
      };
      const items = HISN_ADHAKR.filter(d => d.categoryId === def.id);
      const nextItem = items.find(d => (counts[d.id] || 0) < d.count);
      return {
        ...def,
        ...stat,
        items,
        nextItem,
        isRecommendedNow: recommended.categoryId === def.id
      };
    });
  }, [categoryStats, counts, recommended.categoryId]);

  const overallDailyWirdStats = useMemo(() => {
    const totalItems = dailyTimeWirds.reduce((acc, w) => acc + w.total, 0);
    const completedItems = dailyTimeWirds.reduce((acc, w) => acc + w.completed, 0);
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { totalItems, completedItems, percentage };
  }, [dailyTimeWirds]);

  // Filtered Adhkar list
  const displayedAdhkar = useMemo(() => {
    return HISN_ADHAKR.filter(item => {
      if (showFavoritesOnly && !favoriteIds.includes(item.id)) return false;
      if (!showFavoritesOnly && !searchQuery.trim() && item.categoryId !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.text.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, showFavoritesOnly, favoriteIds, searchQuery]);

  const activeCategoryMeta = useMemo(
    () => HISN_CATEGORIES.find(c => c.id === selectedCategory) || HISN_CATEGORIES[0],
    [selectedCategory]
  );

  const currentCatStat = categoryStats[selectedCategory] || {
    completed: 0,
    total: 1,
    completedReps: 0,
    totalReps: 1,
    percentage: 0
  };

  return (
    <div
      className={
        embedded
          ? 'w-full space-y-5 animate-fade-in'
          : 'w-full pb-28 pt-4 px-4 sm:px-6 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-5 animate-fade-in'
      }
      dir="rtl"
    >
      {/* Top Header with Side Menu Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="text-right space-y-1">
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-[#E4C368]" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5]">
              حصن المسلم
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#AEAECB]">
            أذكار اليوم والليلة المختارة لتحصين القلب ودوام الذكر.
          </p>
        </div>

        {/* Open Side Menu Drawer Button (قائمة جانبية للوصول السريع) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setIsSideMenuOpen(true);
          }}
          className="h-10 px-3.5 rounded-2xl bg-[#1E1E38] hover:bg-[#25232E] border border-[#C8A951]/40 text-[#E4C368] flex items-center gap-2 text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
          title="فتح القائمة الجانبية للأذكار"
          aria-label="فتح القائمة الجانبية للأذكار"
        >
          <PanelRightOpen size={17} />
          <span>فهرس الأذكار</span>
        </button>
      </div>

      {/* Small Daily Tip Section on the Virtue of Dhikr & Tadabbur (نصيحة يومية حول فضل الذكر والتدبر) */}
      <GlassCard padding="p-4 sm:p-5" borderAccent className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/40 text-[#E4C368] flex items-center justify-center shrink-0">
              <Sparkles size={14} />
            </span>
            <div>
              <span className="text-[11px] font-bold text-[#E4C368] block">
                نصيحة اليوم في فضل الذكر والتدبر
              </span>
              <h2 className="text-sm font-serif font-bold text-[#EDEDF5]">
                {dailyTip.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const formatted = `نصيحة اليوم: ${dailyTip.title}\n${dailyTip.content}\n${dailyTip.evidence} (${dailyTip.source})\n— حصن المسلم · تطبيق «الحمد»`;
              try {
                await navigator.clipboard.writeText(formatted);
                setCopiedDailyTip(true);
                triggerHaptic('light');
                setTimeout(() => setCopiedDailyTip(false), 2000);
              } catch {}
            }}
            className="w-8 h-8 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="نسخ نصيحة اليوم"
            aria-label="نسخ نصيحة اليوم"
          >
            {copiedDailyTip ? (
              <Check size={14} className="text-[#E4C368]" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#C7C4D8] leading-relaxed">
          {dailyTip.content}
        </p>

        <div
          className="pt-2 border-t flex items-center justify-between gap-2 text-xs"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <span
            className="font-serif font-medium"
            style={{ color: 'var(--accent-text)' }}
          >
            {dailyTip.evidence}
          </span>
          <span className="text-[11px] text-[#AEAECB] shrink-0">
            {dailyTip.source}
          </span>
        </div>
      </GlassCard>

      {/* Daily Time-Divided Wirds (أذكار الصباح · أذكار المساء · أذكار الصلاة) with Progress Indicators */}
      <GlassCard padding="p-5 sm:p-6" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#EDEDF5]">
              الأوراد اليومية حسب الوقت
            </h2>
            <p className="text-xs text-[#AEAECB]">
              تتبّع تقدّمك اليومي في أذكار الصباح والمساء والصلاة
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#15152A] border border-[#C8A951]/40 text-[#E4C368]">
              إنجاز اليوم: {toArabicNumerals(overallDailyWirdStats.percentage)}٪
            </span>
          </div>
        </div>

        {/* Overall Daily Wird Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#15152A] overflow-hidden border border-[#2E2E4A]/60">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${overallDailyWirdStats.percentage}%`,
              backgroundColor: 'var(--accent-stroke)'
            }}
          />
        </div>

        {/* 3 Time-Based Wird Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {dailyTimeWirds.map(wird => {
            const isSelected = !showFavoritesOnly && selectedCategory === wird.id;
            const isComplete = wird.completed === wird.total && wird.total > 0;
            const circleR = 20;
            const circleCircumference = 2 * Math.PI * circleR;
            const dashOffset = circleCircumference * (1 - wird.percentage / 100);

            return (
              <div
                key={wird.id}
                onClick={() => {
                  triggerHaptic('light');
                  setShowFavoritesOnly(false);
                  setSearchQuery('');
                  setSelectedCategory(wird.id);
                }}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-raised)' : 'var(--bg-sunken)',
                  borderColor: isSelected || isComplete ? 'var(--accent-stroke)' : 'var(--border-hairline)'
                }}
                className="rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-3.5 hover:scale-[1.01] active:scale-[0.99]"
              >
                {/* Top Row: Icon + Title + Circular Progress Ring */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#E4C368]">
                        <HisnCategoryIcon categoryId={wird.id} size={16} />
                      </span>
                      <h3 className="text-sm font-bold text-[#EDEDF5]">
                        {wird.title}
                      </h3>
                    </div>
                    <span className="text-[11px] text-[#AEAECB] block">
                      {wird.timeRange}
                    </span>
                    {wird.isRecommendedNow && !isComplete && (
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C8A951]/15 text-[#E4C368] border border-[#C8A951]/30">
                        وقته الآن
                      </span>
                    )}
                  </div>

                  {/* Circular SVG Ring Progress Indicator */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r={circleR}
                        fill="none"
                        stroke="var(--border-hairline)"
                        strokeWidth="3.5"
                      />
                      {wird.percentage > 0 && (
                        <circle
                          cx="24"
                          cy="24"
                          r={circleR}
                          fill="none"
                          stroke="var(--accent-stroke)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray={circleCircumference}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-500 ease-out"
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isComplete ? (
                        <Check size={15} className="text-[#E4C368]" strokeWidth={2.5} />
                      ) : (
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {toArabicNumerals(wird.percentage)}٪
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Segmented Dots + Linear Progress Bar */}
                <div className="space-y-2">
                  {/* Segmented step indicators for each dhikr in this wird */}
                  <div className="flex items-center gap-1">
                    {wird.items.map(d => {
                      const dCount = counts[d.id] || 0;
                      const dDone = dCount >= d.count;
                      const dPartial = dCount > 0 && !dDone;
                      return (
                        <div
                          key={d.id}
                          className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: dDone
                              ? 'var(--accent-stroke)'
                              : dPartial
                              ? 'var(--cta-bg)'
                              : 'var(--border-hairline)'
                          }}
                          title={`${d.title}: ${toArabicNumerals(dCount)}/${toArabicNumerals(d.count)}`}
                        />
                      );
                    })}
                  </div>

                  {/* Count summary + Quick Status */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#AEAECB]">
                      {toArabicNumerals(wird.completed)} من {toArabicNumerals(wird.total)} أذكار
                    </span>
                    <span
                      className="font-semibold"
                      style={{
                        color: isComplete ? 'var(--accent-text)' : 'var(--text-secondary)'
                      }}
                    >
                      {isComplete
                        ? 'مكتمل ✓'
                        : `${toArabicNumerals(wird.completedReps)}/${toArabicNumerals(wird.totalReps)} تكرار`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pinned Favorites Quick Filter Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2E2E4A]/70">
          <span className="text-xs text-[#AEAECB]">
            اختر الورد أعلاه لعرض أذكاره بالأسفل أو تصفّح أذكارك المثبّتة:
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowFavoritesOnly(prev => !prev);
            }}
            className={`h-8 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              showFavoritesOnly
                ? 'bg-[#6C63FF] border-[#6C63FF] text-white shadow-sm'
                : 'bg-[#15152A] border-[#2E2E4A] text-[#C7C4D8] hover:text-[#EDEDF5]'
            }`}
          >
            <Bookmark size={13} className={showFavoritesOnly ? 'fill-current' : ''} />
            <span>المثبّتة ({toArabicNumerals(favoriteIds.length)})</span>
          </button>
        </div>
      </GlassCard>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث في أذكار حصن المسلم..."
          className="w-full pl-9 pr-10 py-2.5 rounded-2xl bg-[#1E1E38]/90 border border-[#2E2E4A] focus:border-[#C8A951] text-[#EDEDF5] placeholder-[#AEAECB]/50 text-xs sm:text-sm outline-none transition-colors"
        />
        <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AEAECB]/60" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEAECB] hover:text-[#EDEDF5] cursor-pointer"
            aria-label="مسح البحث"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Horizontal Category Pills */}
      {!searchQuery.trim() && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {HISN_CATEGORIES.map(cat => {
            const isSelected = !showFavoritesOnly && selectedCategory === cat.id;
            const stat = categoryStats[cat.id];
            const isAllDone = stat && stat.completed === stat.total && stat.total > 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowFavoritesOnly(false);
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E4C368] text-[#15152A] border-[#E4C368] font-bold shadow-sm'
                    : 'bg-[#1E1E38] text-[#AEAECB] hover:text-[#EDEDF5] border-[#2E2E4A]'
                }`}
              >
                <HisnCategoryIcon categoryId={cat.id} size={14} />
                <span>{cat.badge}</span>
                {isAllDone && (
                  <Check size={13} className={isSelected ? 'text-[#15152A]' : 'text-[#E4C368]'} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Category Header & Progress */}
      {!showFavoritesOnly && !searchQuery.trim() && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#EDEDF5]">
              {activeCategoryMeta.title}
            </h2>
            <p className="text-xs text-[#AEAECB]">{activeCategoryMeta.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#E4C368] bg-[#1E1E38] border border-[#2E2E4A] px-2.5 py-1 rounded-full">
              {toArabicNumerals(currentCatStat.completed)} / {toArabicNumerals(currentCatStat.total)} مكتمل
            </span>
            {currentCatStat.completed > 0 && (
              <button
                type="button"
                onClick={handleResetCategory}
                className="w-8 h-8 rounded-full bg-[#1E1E38] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-colors cursor-pointer"
                title="إعادة ضبط عدادات هذا القسم"
                aria-label="إعادة ضبط عدادات هذا القسم"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Adhkar Cards List */}
      <div className="space-y-4">
        {displayedAdhkar.length === 0 ? (
          <GlassCard padding="p-8" className="text-center space-y-2">
            <Shield size={32} className="text-[#C8A951]/60 mx-auto" />
            <p className="text-sm font-bold text-[#EDEDF5]">
              لا توجد أذكار مطابقة
            </p>
            <p className="text-xs text-[#AEAECB]">
              {showFavoritesOnly
                ? 'اضغط على أيقونة الحفظ بجانب أي ذكر لإضافته إلى الوصول السريع.'
                : 'جرّب البحث بكلمة أخرى أو اختر قسمًا من فهرس الأذكار.'}
            </p>
          </GlassCard>
        ) : (
          displayedAdhkar.map(item => {
            const currentCount = counts[item.id] || 0;
            const isDone = currentCount >= item.count;
            const isPinned = favoriteIds.includes(item.id);
            const progressPct = Math.min(100, (currentCount / item.count) * 100);

            return (
              <GlassCard
                key={item.id}
                padding="p-5 sm:p-6"
                borderAccent={isDone}
                onClick={() => handleTapDhikr(item)}
                className="space-y-4 transition-all select-none"
              >
                {/* Card Header: Title + Icon-only Pin & Copy buttons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{
                        borderColor: isDone ? 'var(--accent-stroke)' : 'var(--border-hairline)',
                        color: isDone ? 'var(--accent-text)' : 'var(--text-primary)',
                        backgroundColor: 'var(--bg-sunken)'
                      }}
                    >
                      {item.title}
                    </span>
                  </div>

                  {/* Icon-only buttons: Reset (if > 0), Pin to Quick Access, Copy */}
                  <div className="flex items-center gap-1.5">
                    {currentCount > 0 && (
                      <button
                        type="button"
                        onClick={e => handleResetDhikr(item.id, e)}
                        className="w-8 h-8 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-colors cursor-pointer"
                        title="تصفير العداد"
                        aria-label="تصفير العداد"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={e => toggleFavorite(item.id, e)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                        isPinned
                          ? 'bg-[#C8A951]/15 border-[#C8A951]/50 text-[#E4C368]'
                          : 'bg-[#15152A]/80 hover:bg-[#25232E] border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5]'
                      }`}
                      title={isPinned ? 'إزالة من الوصول السريع' : 'تثبيت في الوصول السريع'}
                      aria-label={isPinned ? 'إزالة من الوصول السريع' : 'تثبيت في الوصول السريع'}
                    >
                      <Bookmark size={14} className={isPinned ? 'fill-current' : ''} />
                    </button>

                    <button
                      type="button"
                      onClick={e => handleCopyDhikr(item, e)}
                      className="w-8 h-8 rounded-full bg-[#15152A]/80 hover:bg-[#25232E] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center transition-colors cursor-pointer"
                      title="نسخ الذكر"
                      aria-label="نسخ الذكر"
                    >
                      {copiedId === item.id ? (
                        <Check size={14} className="text-[#E4C368]" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sacred Vocalized Text */}
                <div
                  className="rounded-2xl p-4 sm:p-5 border text-center"
                  style={{
                    backgroundColor: 'var(--bg-sunken)',
                    borderColor: isDone ? 'var(--accent-stroke)' : 'var(--ayah-border)'
                  }}
                >
                  <p
                    className={`text-lg sm:text-xl leading-[2.1] ${
                      item.isQuran ? 'font-quran ayah-text' : 'font-serif'
                    }`}
                    style={{
                      color: item.isQuran ? 'var(--ayah-color)' : 'var(--text-primary)'
                    }}
                  >
                    {item.isQuran ? `﴿${item.text}﴾` : item.text}
                  </p>
                </div>

                {/* Virtue & Source */}
                {item.virtue && (
                  <p className="text-xs text-[#AEAECB] leading-relaxed px-1">
                    <span className="font-semibold text-[#C8A951]">الفضل: </span>
                    {item.virtue}
                  </p>
                )}

                {/* Bottom Interactive Counter Bar */}
                <div className="pt-1 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#AEAECB] font-medium">
                    {item.source}
                  </span>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleTapDhikr(item);
                    }}
                    className={`relative overflow-hidden h-10 px-5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                      isDone
                        ? 'bg-[#C8A951]/20 border border-[#C8A951] text-[#E4C368]'
                        : 'bg-[#6C63FF] hover:bg-[#594DFF] text-white shadow-sm'
                    }`}
                  >
                    {/* Subtle progress fill */}
                    {!isDone && currentCount > 0 && (
                      <div
                        className="absolute inset-y-0 right-0 bg-white/20 transition-all duration-200 pointer-events-none"
                        style={{ width: `${progressPct}%` }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {isDone ? (
                        <>
                          <Check size={15} />
                          <span>تمّ ({toArabicNumerals(item.count)})</span>
                        </>
                      ) : (
                        <>
                          <span>تكرار:</span>
                          <span className="text-sm">
                            {toArabicNumerals(currentCount)} / {toArabicNumerals(item.count)}
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Slide-Over Side Menu Drawer (القائمة الجانبية لحصن المسلم والوصول السريع) */}
      <AnimatePresence>
        {isSideMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-start" dir="rtl">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCloseDrawer}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Drawer Panel from Right */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-80 max-w-[86vw] h-full bg-[#15152A] border-l border-[#2E2E4A] p-5 flex flex-col justify-between overflow-y-auto shadow-2xl"
            >
              <div className="space-y-5">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#2E2E4A]">
                  <div className="flex items-center gap-2">
                    <Shield size={20} className="text-[#E4C368]" />
                    <h3 className="text-lg font-serif font-bold text-[#EDEDF5]">
                      فهرس حصن المسلم
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="w-8 h-8 rounded-full bg-[#1E1E38] border border-[#2E2E4A] text-[#AEAECB] hover:text-[#EDEDF5] flex items-center justify-center cursor-pointer"
                    aria-label="إغلاق القائمة الجانبية"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Quick Access Pinned Section */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#AEAECB] block px-1">
                    الوصول السريع
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setShowFavoritesOnly(true);
                      setSearchQuery('');
                      handleCloseDrawer();
                    }}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between text-right transition-all cursor-pointer ${
                      showFavoritesOnly
                        ? 'bg-[#6C63FF]/15 border-[#6C63FF] text-[#EDEDF5]'
                        : 'bg-[#1E1E38]/90 border-[#2E2E4A] text-[#C7C4D8] hover:border-[#C8A951]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bookmark size={16} className="text-[#E4C368]" />
                      <div>
                        <span className="text-xs font-bold text-[#EDEDF5] block">
                          الأذكار المثبّتة
                        </span>
                        <span className="text-[11px] text-[#AEAECB]">
                          أذكارك المختارة للوصول الفوري
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#E4C368]">
                      {toArabicNumerals(favoriteIds.length)}
                    </span>
                  </button>
                </div>

                {/* All Categories List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#AEAECB] block px-1">
                    أبواب حصن المسلم اليومية
                  </span>
                  <div className="space-y-2">
                    {HISN_CATEGORIES.map(cat => {
                      const stat = categoryStats[cat.id] || { completed: 0, total: 1 };
                      const isCurrent = !showFavoritesOnly && selectedCategory === cat.id;
                      const isDone = stat.completed === stat.total && stat.total > 0;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setShowFavoritesOnly(false);
                            setSearchQuery('');
                            setSelectedCategory(cat.id);
                            handleCloseDrawer();
                          }}
                          className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-right transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#25232E] border-[#C8A951] shadow-sm'
                              : 'bg-[#1E1E38]/80 border-[#2E2E4A] hover:border-[#C8A951]/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                                isCurrent
                                  ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E4C368]'
                                  : 'bg-[#15152A] border-[#2E2E4A] text-[#AEAECB]'
                              }`}
                            >
                              <HisnCategoryIcon categoryId={cat.id} size={17} />
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-bold text-[#EDEDF5] block">
                                {cat.title}
                              </span>
                              <span className="text-[11px] text-[#AEAECB]">
                                {cat.subtitle}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isDone
                                ? 'bg-[#C8A951]/20 text-[#E4C368]'
                                : 'text-[#AEAECB]'
                            }`}
                          >
                            {toArabicNumerals(stat.completed)}/{toArabicNumerals(stat.total)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Note */}
              <div className="pt-4 border-t border-[#2E2E4A] text-center">
                <p className="text-[11px] text-[#AEAECB]">
                  ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
