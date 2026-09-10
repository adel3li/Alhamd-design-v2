import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { userBlessingsStore, UserBlessing, MaqsadCategory } from '../../lib/userBlessingsStore';
import { analytics } from '../../services/analytics';
import { MoreVertical, Heart, Plus, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { DailyAffirmationCard } from '../DailyAffirmationCard';
import { dailyAffirmations } from '../../data/affirmations';
import { getDayOfYear } from '../../utils';

const CATEGORY_LABELS: Record<MaqsadCategory, string> = {
  'نعم_الدين': 'نعم الدين',
  'نعم_النفس': 'نعم النفس',
  'نعم_العقل': 'نعم العقل',
  'نعم_النسل': 'نعم النسل',
  'نعم_المال': 'نعم المال',
  'نعم_الكون': 'نعم الكون',
  'نعم_الوجدان': 'نعم الوجدان'
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as MaqsadCategory[];

// Helper to format date
const formatDate = (epoch: number) => {
  const d = new Date(epoch);
  return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const MyBlessingsView: React.FC = () => {
  const [blessings, setBlessings] = useState<UserBlessing[]>([]);
  const [view, setView] = useState<'list' | 'compose' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Compose / Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<MaqsadCategory | ''>('');
  const [showValueReflection, setShowValueReflection] = useState(false);
  const [valueReflection, setValueReflection] = useState('');
  
  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState('');

  const [now] = useState(() => new Date());
  const todayAffirmation = useMemo(() => {
    return dailyAffirmations[getDayOfYear(now) % dailyAffirmations.length];
  }, [now]);

  useEffect(() => {
    loadList();
  }, [view]);

  const loadList = async () => {
    const data = await userBlessingsStore.list();
    setBlessings(data);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOpenCompose = () => {
    setEditId(null);
    setTitle('');
    setBody('');
    setCategory('');
    setShowValueReflection(false);
    setValueReflection('');
    setView('compose');
  };

  const handleOpenEdit = (b: UserBlessing) => {
    setEditId(b.id);
    setTitle(b.title || '');
    setBody(b.body);
    setCategory(b.category || '');
    setShowValueReflection(!!b.valueReflection);
    setValueReflection(b.valueReflection || '');
    setView('compose');
  };

  const handleSave = async () => {
    if (!body.trim()) return;

    if (editId) {
      await userBlessingsStore.update(editId, {
        title: title.trim() || undefined,
        body: body.trim(),
        category: (category as MaqsadCategory) || undefined,
        valueReflection: valueReflection.trim() || undefined
      });
      analytics.capture('personal_blessing_edited', {
        has_title: !!title.trim(),
        has_category: !!category,
        used_value_reflection: !!valueReflection.trim(),
      });
    } else {
      await userBlessingsStore.add({
        title: title.trim() || undefined,
        body: body.trim(),
        category: (category as MaqsadCategory) || undefined,
        valueReflection: valueReflection.trim() || undefined,
        isFavorite: false
      });
      analytics.capture('personal_blessing_created', {
         has_title: !!title.trim(),
         has_category: !!category,
         used_value_reflection: !!valueReflection.trim(),
      });
    }
    showToast('تم الحفظ');
    setView('list');
  };

  const handleOpenDetail = (b: UserBlessing) => {
    setSelectedId(b.id);
    setView('detail');
    analytics.capture('personal_blessing_opened', {
        has_title: !!b.title,
        has_category: !!b.category,
        is_favorite: b.isFavorite
    });
  };

  const handleToggleFavorite = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isFav = await userBlessingsStore.toggleFavorite(id);
    if (isFav !== null) {
      loadList();
      analytics.capture('personal_blessing_favorited', { is_favorite: isFav });
    }
  };

  const promptDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await userBlessingsStore.remove(deleteId);
      analytics.capture('personal_blessing_deleted');
      setDeleteId(null);
      setShowDeleteConfirm(false);
      loadList();
      if (view === 'detail') {
        setView('list');
        setSelectedId(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setShowDeleteConfirm(false);
  };

  const activeBlessing = selectedId ? blessings.find(b => b.id === selectedId) : null;

  return (
    <div className="h-full flex flex-col font-sans relative max-w-md mx-auto w-full" dir="rtl">
        {/* Toast */}
        <AnimatePresence>
            {toast && (
                <motion.div
                   initial={{ opacity: 0, y: -20, x: '-50%' }}
                   animate={{ opacity: 1, y: 0, x: '-50%' }}
                   exit={{ opacity: 0, y: -20, x: '-50%' }}
                   className="absolute top-10 left-1/2 z-50 bg-brand-accent dark:bg-brand-dark-accent text-brand-background dark:text-brand-dark-background px-4 py-2 rounded-full font-medium text-sm shadow-md pointer-events-none"
                >
                    {toast}
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            {view === 'list' && (
                <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col h-full overflow-hidden"
                >
                    <header className="px-6 py-6 border-b border-brand-textPrimary/10 flex items-center justify-between shrink-0">
                        <h1 className="text-2xl font-bold text-brand-textPrimary dark:text-brand-dark-textPrimary">نِعَمي</h1>
                        <button 
                            onClick={handleOpenCompose}
                            className="bg-brand-quranBg dark:bg-brand-dark-quranBg text-brand-textPrimary dark:text-brand-dark-textPrimary hover:text-brand-accent dark:text-brand-dark-accent hover:bg-brand-surface dark:hover:bg-brand-dark-surface p-2.5 rounded-full transition-colors active:scale-95 border border-brand-textPrimary/10"
                            aria-label="أضِف نعمة"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </header>
                    
                    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
                        <DailyAffirmationCard affirmation={todayAffirmation} />
                        
                        {blessings.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto px-4 opacity-80 pb-20">
                                <h2 className="text-brand-accent dark:text-brand-dark-accent font-bold text-xl mb-4">مساحتك لتدوين النِّعَم بكلماتك</h2>
                                <p className="text-brand-textSecondary dark:text-brand-dark-textSecondary text-base leading-relaxed mb-10">
                                    هنا تكتب ما تستشعره من نِعَم الله عليك، بأسلوبك أنت. مساحة هادئة بينك وبين نفسك.
                                </p>
                                <button
                                    onClick={handleOpenCompose}
                                    className="bg-brand-quranBg dark:bg-brand-dark-quranBg text-brand-textPrimary dark:text-brand-dark-textPrimary px-8 py-3.5 rounded-xl font-medium border border-brand-textPrimary/10 hover:border-brand-accent/30 dark:border-brand-dark-accent/30 transition-all active:scale-95"
                                >
                                    أضِف نعمة
                                </button>
                                <p className="text-brand-textSecondary dark:text-brand-dark-textSecondary/50 text-xs mt-12 leading-relaxed">
                                    ما تكتبه هنا خاصٌّ بك ويبقى على جهازك. هذه مساحة شخصية للتدبّر، وليست من النصوص الموثّقة في التطبيق.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {blessings.map(b => (
                                    <div 
                                        key={b.id}
                                        onClick={() => handleOpenDetail(b)}
                                        className="bg-brand-surface dark:bg-brand-dark-surface border border-brand-textPrimary/10 rounded-2xl p-5 cursor-pointer hover:border-brand-accent/30 dark:border-brand-dark-accent/30 transition-colors group relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-brand-textPrimary dark:text-brand-dark-textPrimary text-lg flex-1 pl-4 truncate">
                                                {b.title || b.body.split('\n')[0]}
                                            </h3>
                                            <button 
                                                onClick={(e) => handleToggleFavorite(b.id, e)}
                                                className="opacity-40 hover:opacity-100 transition-opacity p-1 -mr-1 -mt-1"
                                            >
                                                <Heart className={`w-5 h-5 ${b.isFavorite ? 'fill-brand-accent dark:fill-brand-dark-accent text-brand-accent dark:text-brand-dark-accent opacity-100' : 'text-brand-textSecondary dark:text-brand-dark-textSecondary'}`} />
                                            </button>
                                        </div>
                                        <p className="text-brand-textSecondary dark:text-brand-dark-textSecondary text-sm leading-relaxed line-clamp-2 mb-4 opacity-80">
                                            {b.title ? b.body : b.body.split('\n').slice(1).join(' ') || b.body}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-brand-textSecondary dark:text-brand-dark-textSecondary/60">
                                            <span>{formatDate(b.createdAt)}</span>
                                            {b.category && (
                                                <span className="bg-brand-quranBg dark:bg-brand-dark-quranBg text-brand-textSecondary dark:text-brand-dark-textSecondary px-3 py-1 rounded-full">
                                                    {CATEGORY_LABELS[b.category]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {view === 'compose' && (
                 <motion.div
                    key="compose"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex-1 flex flex-col h-full bg-brand-background dark:bg-brand-dark-background overflow-hidden"
                >
                    <header className="px-5 py-4 border-b border-brand-textPrimary/10 flex items-center justify-between shrink-0">
                        <button 
                            onClick={() => setView('list')}
                            className="text-brand-textSecondary dark:text-brand-dark-textSecondary hover:text-brand-textPrimary dark:text-brand-dark-textPrimary px-2 py-2"
                        >
                            إلغاء
                        </button>
                        <h2 className="text-lg font-bold text-brand-textPrimary dark:text-brand-dark-textPrimary">{editId ? 'تعديل' : 'اكتب نعمتك'}</h2>
                        <button 
                            onClick={handleSave}
                            disabled={!body.trim()}
                            className="text-brand-accent dark:text-brand-dark-accent font-bold px-2 py-2 disabled:opacity-30 transition-opacity"
                        >
                            حفظ
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
                        <input 
                            type="text"
                            placeholder="عنوان مختصر (اختياري)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-brand-textPrimary dark:text-brand-dark-textPrimary text-xl font-bold placeholder:text-brand-textSecondary dark:text-brand-dark-textSecondary/40 focus:outline-none border-b border-brand-textPrimary/10 pb-3"
                        />
                        
                        <textarea
                            placeholder="ما النعمة التي تستشعرها الآن؟ اكتبها كما تشعر بها..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full bg-transparent text-brand-textPrimary dark:text-brand-dark-textPrimary text-lg leading-[1.8] placeholder:text-brand-textSecondary dark:text-brand-dark-textSecondary/30 focus:outline-none resize-none min-h-[160px]"
                        />

                        <div className="border-t border-brand-textPrimary/10 pt-6">
                            <label className="block text-sm font-medium text-brand-textSecondary dark:text-brand-dark-textSecondary/80 mb-3">
                                ضمن أي باب؟ (اختياري)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(category === cat ? '' : cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                            category === cat 
                                              ? 'bg-brand-accent dark:bg-brand-dark-accent/10 border-brand-accent dark:border-brand-dark-accent text-brand-accent dark:text-brand-dark-accent' 
                                              : 'bg-brand-surface dark:bg-brand-dark-surface border-brand-textPrimary/10 text-brand-textSecondary dark:text-brand-dark-textSecondary hover:border-brand-textPrimary/30'
                                        }`}
                                    >
                                        {CATEGORY_LABELS[cat]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-brand-textPrimary/10 pt-6">
                            <button 
                                onClick={() => setShowValueReflection(!showValueReflection)}
                                className="w-full flex items-center justify-between text-brand-textSecondary dark:text-brand-dark-textSecondary hover:text-brand-accent dark:text-brand-dark-accent transition-colors"
                            >
                                <span className="font-medium text-brand-textPrimary dark:text-brand-dark-textPrimary">تأمّل قيمتها</span>
                                <ChevronRight className={`w-5 h-5 transition-transform ${showValueReflection ? 'rotate-90' : 'rotate-180'}`} />
                            </button>
                            
                            <AnimatePresence>
                                {showValueReflection && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4 space-y-4">
                                            <p className="text-brand-accent dark:text-brand-dark-accent/80 text-sm leading-relaxed">
                                                تخيّل للحظة أن هذه النعمة غابت عن حياتك... كيف سيكون حالك؟ اكتب ما يخطر ببالك.
                                            </p>
                                            <textarea
                                                placeholder="تأمّلك في قيمتها..."
                                                value={valueReflection}
                                                onChange={(e) => setValueReflection(e.target.value)}
                                                className="w-full bg-brand-surface dark:bg-brand-dark-surface text-brand-textPrimary dark:text-brand-dark-textPrimary text-base leading-[1.8] placeholder:text-brand-textSecondary dark:text-brand-dark-textSecondary/30 focus:outline-none border border-brand-textPrimary/10 rounded-xl p-4 min-h-[120px]"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <p className="text-brand-textSecondary dark:text-brand-dark-textSecondary/40 text-xs pt-8 leading-relaxed text-center">
                            ما تكتبه هنا خاصٌّ بك ويبقى على جهازك. هذه مساحة شخصية للتدبّر، وليست من النصوص الموثّقة في التطبيق.
                        </p>
                    </div>
                 </motion.div>
            )}

            {view === 'detail' && activeBlessing && (
                <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col h-full bg-brand-background dark:bg-brand-dark-background overflow-hidden"
                >
                    <header className="px-4 py-4 flex items-center justify-between shrink-0 mb-2">
                        <button 
                            onClick={() => setView('list')}
                            className="text-brand-textSecondary dark:text-brand-dark-textSecondary hover:text-brand-textPrimary dark:text-brand-dark-textPrimary p-2 flex items-center gap-1"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleToggleFavorite(activeBlessing.id)}
                                className="p-2 text-brand-textSecondary dark:text-brand-dark-textSecondary hover:text-brand-accent dark:text-brand-dark-accent transition-colors"
                            >
                                <Heart className={`w-5 h-5 ${activeBlessing.isFavorite ? 'fill-brand-accent dark:fill-brand-dark-accent text-brand-accent dark:text-brand-dark-accent' : ''}`} />
                            </button>
                            <button 
                                onClick={() => handleOpenEdit(activeBlessing)}
                                className="p-2 text-brand-textSecondary dark:text-brand-dark-textSecondary hover:text-brand-textPrimary dark:text-brand-dark-textPrimary transition-colors"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => promptDelete(activeBlessing.id)}
                                className="p-2 text-brand-textSecondary dark:text-brand-dark-textSecondary hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-8 pb-32">
                        {activeBlessing.category && (
                            <span className="inline-block bg-brand-quranBg dark:bg-brand-dark-quranBg text-brand-textSecondary dark:text-brand-dark-textSecondary px-3 py-1 rounded-full text-xs font-medium mb-6">
                                {CATEGORY_LABELS[activeBlessing.category]}
                            </span>
                        )}

                        <h2 className="text-3xl font-bold text-brand-textPrimary dark:text-brand-dark-textPrimary mb-6 leading-tight">
                            {activeBlessing.title || 'نعمة بدون عنوان'}
                        </h2>

                        <div className="text-brand-textPrimary dark:text-brand-dark-textPrimary text-[1.1rem] leading-[2.2] opacity-90 whitespace-pre-wrap mb-10">
                            {activeBlessing.body}
                        </div>

                        {activeBlessing.valueReflection && (
                             <div className="bg-brand-surface dark:bg-brand-dark-surface border border-brand-textPrimary/10 rounded-2xl p-6 relative">
                                  <h4 className="text-brand-accent dark:text-brand-dark-accent text-sm font-bold mb-3 flex items-center gap-2">
                                      <span className="w-1 h-3 bg-brand-accent dark:bg-brand-dark-accent rounded-full inline-block"></span>
                                      استشعار القيمة
                                  </h4>
                                  <p className="text-brand-textSecondary dark:text-brand-dark-textSecondary leading-[2] whitespace-pre-wrap">
                                      {activeBlessing.valueReflection}
                                  </p>
                             </div>
                        )}

                        <div className="mt-12 text-brand-textSecondary dark:text-brand-dark-textSecondary/50 text-sm">
                            {formatDate(activeBlessing.createdAt)}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 pointer-events-auto"
                        onClick={cancelDelete}
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-brand-surface dark:bg-brand-dark-surface border border-brand-textPrimary/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl z-10"
                    >
                        <h3 className="text-xl font-bold text-brand-textPrimary dark:text-brand-dark-textPrimary mb-3">حذف النعمة؟</h3>
                        <p className="text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-90 mb-8 leading-relaxed">
                            سيُحذف هذا التدوين نهائيًا من جهازك.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 bg-red-500/10 text-red-400 font-bold py-3.5 rounded-xl border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all"
                            >
                                حذف
                            </button>
                            <button 
                                onClick={cancelDelete}
                                className="flex-1 bg-brand-quranBg dark:bg-brand-dark-quranBg text-brand-textPrimary dark:text-brand-dark-textPrimary font-bold py-3.5 rounded-xl hover:bg-brand-surface dark:hover:bg-brand-dark-surface active:scale-95 transition-all"
                                autoFocus
                            >
                                إلغاء
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};
