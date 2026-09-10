import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Trash2, 
  Clock, 
  Plus, 
  Star, 
  BookOpen, 
  Sparkles,
  Heart
} from 'lucide-react';
import { JournalEntry, UserBlessing } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { CATEGORIES } from '../../constants/categories';
import { getHijriMonthAndYear } from '../../lib/hijri';
import { formatTimestampArabicTime, toArabicNumerals } from '../../lib/arabic';
import { ComposeBlessingModal } from './ComposeBlessingModal';

interface JournalScreenProps {
  entries: JournalEntry[];
  userBlessings: UserBlessing[];
  onDeleteEntry: (id: string) => void;
  onAddUserBlessing: (data: {
    title: string;
    prompt1: string;
    prompt2: string;
    prompt3: string;
    category: string;
  }) => void;
  onDeleteUserBlessing: (id: string) => void;
  onToggleFavoriteBlessing: (id: string) => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  entries,
  userBlessings,
  onDeleteEntry,
  onAddUserBlessing,
  onDeleteUserBlessing,
  onToggleFavoriteBlessing
}) => {
  const [segment, setSegment] = useState<'journal' | 'personal'>('journal');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [monthOffset, setMonthOffset] = useState(0);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // Month navigation calculation
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthInfo = useMemo(() => getHijriMonthAndYear(targetDate), [targetDate]);

  // Filter journal entries
  const filteredJournalEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = !searchQuery || 
        entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.shortTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'الكل' || 
        entry.categoryLabel === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [entries, searchQuery, selectedCategory]);

  // Group entries by display date
  const groupedEntries = useMemo<Record<string, JournalEntry[]>>(() => {
    const groups: Record<string, JournalEntry[]> = {};
    for (const entry of filteredJournalEntries) {
      const dateKey = entry.displayDate || entry.date || 'اليوم';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    }
    return groups;
  }, [filteredJournalEntries]);

  // Filter personal blessings
  const filteredUserBlessings = useMemo(() => {
    return userBlessings.filter(b => {
      const matchesSearch = !searchQuery || 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.prompt3 && b.prompt3.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.body && b.body.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'الكل' || 
        b.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [userBlessings, searchQuery, selectedCategory]);

  return (
    <div className="w-full pb-28 pt-4 px-4 sm:px-6 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      {/* Title & Subtitle (Matches ref-03-journal.png) */}
      <div className="text-right space-y-1">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#EDEDF5]">
          {segment === 'journal' ? 'سجل الحمد' : 'نِعَمي'}
        </h1>
        <p className="text-xs sm:text-sm text-[#AEAECB]">
          {segment === 'journal' 
            ? 'كل ما حمدتَ اللهَ عليه… في مكانٍ واحد.' 
            : 'نعمٌ خاصة بحياتك دوّنتها بنفسك لتستشعر قيمتها.'
          }
        </p>
      </div>

      {/* Segment Switcher: «سجل الحمد» | «نِعَمي» */}
      <div className="flex bg-[#1E1E38]/90 p-1 rounded-2xl border border-[#2E2E4A] max-w-xs mx-auto shadow-sm">
        <button
          onClick={() => setSegment('journal')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            segment === 'journal'
              ? 'bg-[#6C63FF] text-white shadow-sm'
              : 'text-[#AEAECB] hover:text-white'
          }`}
        >
          سجل الحمد
        </button>
        <button
          onClick={() => setSegment('personal')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            segment === 'personal'
              ? 'bg-[#6C63FF] text-white shadow-sm'
              : 'text-[#AEAECB] hover:text-white'
          }`}
        >
          نِعَمي ({toArabicNumerals(userBlessings.length)})
        </button>
      </div>

      {/* Search Bar + Month Navigator (For Journal) */}
      {segment === 'journal' && (
        <div className="space-y-3">
          {/* Hijri Month Navigator: ‹ ذو الحجة ١٤٤٧ › */}
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={() => setMonthOffset(m => m + 1)}
              className="w-8 h-8 rounded-full bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] transition-colors"
              aria-label="الشهر القادم"
            >
              <ChevronRight size={16} />
            </button>

            <span className="font-serif font-bold text-base sm:text-lg text-[#C8A951]">
              {monthInfo.full}
            </span>

            <button
              onClick={() => setMonthOffset(m => m - 1)}
              className="w-8 h-8 rounded-full bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] transition-colors"
              aria-label="الشهر السابق"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في تأملاتك..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-[#1E1E38]/90 border border-[#2E2E4A] focus:border-[#C8A951] text-[#EDEDF5] placeholder-[#AEAECB]/40 text-xs sm:text-sm outline-none transition-colors"
            />
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AEAECB]/60" />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('الكل')}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                selectedCategory === 'الكل'
                  ? 'bg-[#E4C368] text-[#15152A] font-bold'
                  : 'bg-[#1E1E38] text-[#AEAECB] border border-[#2E2E4A]'
              }`}
            >
              الكل
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.label)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                  selectedCategory === c.label
                    ? 'bg-[#E4C368] text-[#15152A] font-bold'
                    : 'bg-[#1E1E38] text-[#AEAECB] border border-[#2E2E4A]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Segment 1: Journal Entries Content (Matches ref-03-journal.png) */}
      {segment === 'journal' && (
        <div className="space-y-6">
          {Object.keys(groupedEntries).length === 0 ? (
            <GlassCard className="text-center py-12 px-6">
              <BookOpen size={36} className="text-[#C8A951]/60 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-base font-serif font-bold text-[#EDEDF5] mb-1">
                سجلّك ما زال فارغًا...
              </h3>
              <p className="text-xs text-[#AEAECB]">
                ابدأ بنعمة اليوم واستشعر أثرها ودوّن حمدك ليحفظ هنا.
              </p>
            </GlassCard>
          ) : (
            Object.entries(groupedEntries).map(([dateLabel, dateEntries]) => (
              <div key={dateLabel} className="space-y-3">
                {/* Day Header e.g. «الأحد ٢٥ ذو الحجة» */}
                <h3 className="text-xs font-semibold text-[#AEAECB] px-1">
                  {dateLabel}
                </h3>

                {/* Entry Cards */}
                {(dateEntries as JournalEntry[]).map(entry => (
                  <GlassCard
                    key={entry.id}
                    id={`journal-card-${entry.id}`}
                    padding="p-5"
                    className="relative group transition-all"
                  >
                    {/* Top Row: Gold-outlined blessing chip */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#EDEDF5] border border-[#C8A951] bg-[#C8A951]/5 shadow-sm">
                        {entry.shortTitle ? `نعمة ${entry.shortTitle}` : entry.categoryLabel}
                      </span>

                      {/* Delete Entry Button */}
                      <button
                        onClick={() => {
                          if (window.confirm('هل تود حذف هذا التأمل من سجلك؟')) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#AEAECB] hover:text-red-400 p-1"
                        title="حذف"
                        aria-label="حذف التأمل"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Entry Reflection Text */}
                    <p className="text-sm sm:text-base text-[#EDEDF5] leading-relaxed font-sans mb-3">
                      {entry.text}
                    </p>

                    {/* Bottom Row: Time Stamp */}
                    <div className="flex items-center gap-1.5 text-xs text-[#AEAECB]/80 pt-1">
                      <Clock size={13} />
                      <span>{formatTimestampArabicTime(entry.createdAt)}</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Segment 2: Personal Blessings Content (نِعَمي) */}
      {segment === 'personal' && (
        <div className="space-y-4">
          {/* Add New Personal Blessing Button */}
          <button
            onClick={() => setIsComposeOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#6C63FF] hover:bg-[#594DFF] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#6C63FF]/20 transition-all active:scale-98"
          >
            <Plus size={18} />
            <span>دوّن نعمة جديدة</span>
          </button>

          {filteredUserBlessings.length === 0 ? (
            <GlassCard className="text-center py-12 px-6">
              <Sparkles size={36} className="text-[#C8A951]/60 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-base font-serif font-bold text-[#EDEDF5] mb-1">
                لم تدوّن نِعَمًا شخصية بعد
              </h3>
              <p className="text-xs text-[#AEAECB] max-w-xs mx-auto">
                اضغط على الزر أعلاه لتدوين نعمة خاصة بك والإجابة عن أسئلة الاستشعار الثلاثة.
              </p>
            </GlassCard>
          ) : (
            filteredUserBlessings.map(blessing => (
              <GlassCard
                key={blessing.id}
                padding="p-5"
                className="space-y-4 relative group"
              >
                {/* Header: Title + Category + Actions */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#C8A951] bg-[#C8A951]/10 border border-[#C8A951]/30">
                      {blessing.category}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#EDEDF5]">
                      {blessing.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavoriteBlessing(blessing.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        blessing.isFavorite ? 'text-[#E4C368]' : 'text-[#AEAECB]/50 hover:text-white'
                      }`}
                      title={blessing.isFavorite ? 'إلغاء التفضيل' : 'تفضيل'}
                    >
                      <Star size={16} fill={blessing.isFavorite ? '#E4C368' : 'none'} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('هل تود حذف هذه النعمة؟')) {
                          onDeleteUserBlessing(blessing.id);
                        }
                      }}
                      className="p-1.5 text-[#AEAECB]/50 hover:text-red-400 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* 3 Prompts Content */}
                <div className="space-y-2.5 text-xs text-[#C7C4D8] border-t border-[#2E2E4A]/80 pt-3">
                  {blessing.prompt1 && (
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-[#AEAECB] block">متى شعرتَ بها آخر مرة؟</span>
                      <p className="leading-relaxed bg-black/20 p-2 rounded-lg">{blessing.prompt1}</p>
                    </div>
                  )}

                  {blessing.prompt2 && (
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-[#AEAECB] block">لو غابت هذه النعمة... ماذا يتغيّر؟</span>
                      <p className="leading-relaxed bg-black/20 p-2 rounded-lg">{blessing.prompt2}</p>
                    </div>
                  )}

                  {blessing.prompt3 && (
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-[#E4C368] block">علامَ تحمد الله الآن؟</span>
                      <p className="leading-relaxed bg-black/20 p-2 rounded-lg text-[#EDEDF5] font-medium">{blessing.prompt3}</p>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center justify-between text-[11px] text-[#AEAECB]/60 pt-1">
                  <span>أضيفت في {formatTimestampArabicTime(blessing.createdAt)}</span>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* Compose Blessing Modal (Matches ref-05-compose.png) */}
      {isComposeOpen && (
        <ComposeBlessingModal
          onClose={() => setIsComposeOpen(false)}
          onSave={onAddUserBlessing}
        />
      )}
    </div>
  );
};
