import React, { useState, useMemo } from "react";
import { useStore } from "../StoreContext";
import { getAllBlessings } from "../data/loader";
import { Search } from "lucide-react";

export const JournalView: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
    const { state, deleteJournalEntry } = useStore();
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

    const allBlessings = useMemo(() => getAllBlessings(), []);

    const categories = useMemo(() => {
        const cats = new Set(allBlessings.map((b) => b.categoryLabel));
        return ["الكل", ...Array.from(cats)];
    }, [allBlessings]);

    const toggleExpand = (id: string) => {
        setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (state.journalEntries.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
                <div className="w-48 h-48 mb-8 rounded-full bg-brand-accent/5 dark:bg-brand-dark-accent/5 flex items-center justify-center relative">
                     <div className="w-32 h-32 rounded-full border border-brand-accent/20 dark:border-brand-dark-accent/20 absolute opacity-50" />
                     <div className="w-40 h-40 rounded-full border border-brand-accent/10 dark:border-brand-dark-accent/10 absolute opacity-50" />
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-textSecondary/40 relative z-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                     </svg>
                </div>
                <p className="text-xl font-amiri text-brand-textSecondary dark:text-brand-dark-textSecondary leading-loose mb-10 opacity-70">
                    سجلّك ما زال فارغًا...<br/> ابدأ بنعمة اليوم
                </p>
                <button
                    onClick={onGoHome}
                    className="px-8 py-3 rounded-full bg-[#d4af37] text-[#0a0c0f] font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:opacity-90 transition-opacity"
                >
                    العودة للرئيسية
                </button>
            </div>
        )
    }

    const filteredEntries = state.journalEntries.filter(entry => {
        const title = entry.shortTitle || entry.blessingTitle || (entry as any).blessingShortTitle || allBlessings.find(b => b.id === entry.blessingId)?.shortTitle || "الحمدلله";
        
        const searchMatch = !searchQuery 
            || entry.text.toLowerCase().includes(searchQuery.toLowerCase()) 
            || title.toLowerCase().includes(searchQuery.toLowerCase())
            || entry.date.toLowerCase().includes(searchQuery.toLowerCase());

        if (!searchMatch) return false;

        if (selectedCategory === "الكل") return true;
        // Old entries might not have categoryLabel, fetch it from allBlessings if missing
        const entryCategoryLabel = entry.categoryLabel || allBlessings.find(b => b.id === entry.blessingId)?.categoryLabel || entry.category;
        return entryCategoryLabel === selectedCategory;
    });

    return (
        <div className="p-6 h-full flex flex-col max-w-md mx-auto w-full overflow-y-auto pb-24">
            <h2 className="text-2xl font-bold mb-6 pt-4">سجل الحمد</h2>
             
            <div className="relative mb-6">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-brand-textSecondary/50" />
                </div>
                <input
                    type="text"
                    placeholder="ابحث في سجل الحمد (كلمة، تاريخ)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-surface dark:bg-brand-dark-surface border border-brand-textPrimary/10 rounded-2xl py-3 pr-11 pl-4 text-brand-textPrimary dark:text-brand-dark-textPrimary focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] placeholder-brand-textSecondary/50 transition-colors text-[15px]"
                />
            </div>

            <div className="flex gap-2 overflow-x-auto shrink-0 pb-4 mb-2 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" dir="rtl">
                 {categories.map(cat => (
                     <button
                         key={cat}
                         onClick={() => setSelectedCategory(cat)}
                         className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${selectedCategory === cat ? 'bg-[#d4af37] text-[#0a0c0f] border-[#d4af37]' : 'bg-transparent border-brand-textPrimary/10 text-brand-textSecondary hover:bg-brand-textPrimary/5 cursor-pointer'}`}
                     >
                         {cat}
                     </button>
                 ))}
            </div>
            
            <div className="space-y-4">
                {filteredEntries.map(entry => {
                    const isExpanded = expandedEntries[entry.id];
                    return (
                    <div key={entry.id} className="bg-brand-surface dark:bg-brand-dark-surface p-5 rounded-3xl shadow-sm border border-brand-textPrimary/5">
                        <div className="flex justify-between items-start mb-3">
                             <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                     <div className="h-4 w-1 bg-[#d4af37] rounded-full"></div>
                                     <span className="font-bold text-brand-textPrimary dark:text-brand-dark-textPrimary">{entry.shortTitle || entry.blessingTitle || (entry as any).blessingShortTitle || allBlessings.find(b => b.id === entry.blessingId)?.shortTitle || "الحمدلله"}</span>
                                </div>
                                <span className="text-xs text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80 mr-3">{entry.date}</span>
                             </div>
                             <button 
                                onClick={() => setEntryToDelete(entry.id)}
                                className="text-brand-textSecondary/40 hover:text-red-500 transition-colors p-1"
                             >
                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                 </svg>
                             </button>
                        </div>
                        <div 
                            className={`cursor-pointer group`}
                            onClick={() => toggleExpand(entry.id)}
                        >
                            <p className={`text-brand-textPrimary/90 dark:text-brand-dark-textPrimary/90 text-[15px] leading-relaxed transition-all duration-300 font-sans break-words ${isExpanded ? '' : 'line-clamp-3 relative'}`}>
                                {entry.text}
                            </p>
                        </div>
                    </div>
                )})}
                {filteredEntries.length === 0 && (
                     <div className="text-center py-10 text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-70">
                         {searchQuery ? "لم يتم العثور على نتائج للبحث." : "لا توجد تدوينات في هذا التصنيف."}
                     </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {entryToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setEntryToDelete(null)}>
                    <div className="bg-brand-surface dark:bg-brand-dark-surface p-6 rounded-3xl max-w-sm w-full border border-brand-textPrimary/10 shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-2">تأكيد الحذف</h3>
                        <p className="text-brand-textSecondary dark:text-brand-dark-textSecondary mb-6">
                            هل تريد حذف هذه التدوينة؟ لا يمكن التراجع.
                        </p>
                        <div className="flex gap-3 justify-end font-medium">
                            <button 
                                onClick={() => setEntryToDelete(null)}
                                className="px-5 py-2.5 rounded-full bg-brand-textPrimary/5 hover:bg-brand-textPrimary/10 dark:bg-brand-dark-textPrimary/5 dark:hover:bg-brand-dark-textPrimary/10 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button 
                                onClick={() => {
                                    deleteJournalEntry(entryToDelete);
                                    setEntryToDelete(null);
                                }}
                                className="px-5 py-2.5 rounded-full bg-red-400 hover:bg-red-500 text-white transition-colors"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

