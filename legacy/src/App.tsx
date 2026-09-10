import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from './StoreContext';
import { Onboarding } from './components/Onboarding';
import { getAllBlessings } from './data/loader';
import { Blessing } from './types';
import { analytics, getConsent, setConsent, ConsentState } from './services/analytics';
import { storage } from './services/storage';
import { haptics } from './services/haptics';
import { resolveTodayExperience } from './lib/dailyLogic';

const approvedBlessings = getAllBlessings();
import { inspirations } from './data/inspirations';
import { getDayOfYear, getIslamicDate, getTodayDateStr } from './utils';
import { BlessingCard } from './components/BlessingCard';
import { InspirationCard } from './components/InspirationCard';
import { ReflectionFlow } from './components/ReflectionFlow';
import { JournalView } from './components/JournalView';
import { ConsistencyView } from './components/ConsistencyView';
import { SettingsView } from './components/SettingsView';
import { SpotlightTour } from './components/SpotlightTour';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { TasbihView } from './components/TasbihView';
import { MyBlessingsView } from './components/MyBlessings/MyBlessingsView';
import { Book, CheckCircle2, Home, Settings, User, Heart, ShieldQuestion, Hash } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { state, saveJournalEntry, markReflectionComplete, updateSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'home' | 'journal' | 'consistency' | 'myBlessings' | 'tasbih' | 'settings'>('home');
  const [showReflection, setShowReflection] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [tourCompleted, setTourCompleted] = useState<boolean | null>(null);
  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const [consentState, setConsentState] = useState<ConsentState | null>(null);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const initApp = async () => {
       const isOb = await storage.getItem('alhamd_onboarded');
       const isTc = await storage.getItem('alhamd:tourComplete');
       const currentConsent = await getConsent();
       setConsentState(currentConsent);
       setOnboarded(isOb === 'true');
       setTourCompleted(isTc === 'true');
       if (currentConsent === 'granted') {
           analytics.capture('app_open');
       }
    };
    initApp();
  }, []);

  useEffect(() => {
    // Listen for tour replay from settings
    const handleReplay = () => setTourCompleted(false);
    window.addEventListener('tour-replay', handleReplay);
    return () => window.removeEventListener('tour-replay', handleReplay);
  }, []);

  useEffect(() => {
    // Recompute current date when app comes to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setNow(new Date());
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Also recompute occasionally just in case it sits open
    const interval = setInterval(() => setNow(new Date()), 60 * 1000); // Check every minute

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Determine firstLaunchDate
    if (onboarded && !state.firstLaunchDate) {
      updateSettings({ firstLaunchDate: new Date().toISOString() });
    }
  }, [onboarded, state.firstLaunchDate, updateSettings]);

  useEffect(() => {
    if (!state.hapticReminders) return;

    // Set up a gentle reminder to pause and reflect
    // In a real mobile app, this would use a background task.
    // For this web app, it runs while the app is active.
    const interval = setInterval(() => {
       haptics.impact('light');
    }, 60 * 60 * 1000); // Every hour while active

    return () => clearInterval(interval);
  }, [state.hapticReminders]);

  // Deterministic daily blessing selection
  const todayExperience = useMemo(() => {
    return resolveTodayExperience(now, state.welcomeSeen, approvedBlessings);
  }, [now, state.welcomeSeen]);

  const currentExp = todayExperience.blessings[activeExpIndex] || todayExperience.blessings[0];
  const todayBlessing = currentExp.blessing;
  const role = currentExp.role;

  const todayInspiration = useMemo(() => {
    // using day of year from `now`
    return inspirations[getDayOfYear(now) % inspirations.length];
  }, [now]);

  const todayStr = getTodayDateStr(now);
  const isTodayCompleted = state.completedReflections.includes(todayStr) && role === 'daily';

  const handleOnboardingComplete = async () => {
      await storage.setItem('alhamd_onboarded', 'true');
      setOnboarded(true);
      analytics.capture('onboarding_completed');
  };

  const handleOnboardingSkip = async (step: number) => {
      await storage.setItem('alhamd_onboarded', 'true');
      setOnboarded(true);
      analytics.capture('onboarding_skipped', { at_screen: step });
  };

  const handleTourComplete = async () => {
    await storage.setItem('alhamd:tourComplete', 'true');
    setTourCompleted(true);
  };

  if (onboarded === null || tourCompleted === null || consentState === null) return null;

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />;
  }

  const handleReflectionComplete = (journalText: string) => {
    if (role === 'daily') {
      markReflectionComplete(todayStr);
    }
    
    analytics.capture('reflection_completed', { blessing_id: todayBlessing.id, source: role });
    if (journalText.trim()) {
      saveJournalEntry({
        id: crypto.randomUUID(),
        date: getIslamicDate(now),
        blessingId: todayBlessing.id,
        shortTitle: todayBlessing.shortTitle,
        categoryLabel: todayBlessing.categoryLabel,
        text: journalText.trim()
      });
      analytics.capture('journal_saved', { blessing_id: todayBlessing.id, has_text: true });
    } else {
      analytics.capture('journal_saved', { blessing_id: todayBlessing.id, has_text: false });
    }
    
    if (role === 'welcome') {
      updateSettings({ welcomeSeen: true });
      // Updating welcomeSeen will cause todayExperience to seamlessly recalculate
      // to just the global blessing at index 0. We leave reflection flow open.
      setActiveExpIndex(0);
      return;
    }
    
    // Fallback or daily case
    if (journalText.trim()) {
      setActiveTab('journal');
    }
    setShowReflection(false);
    setActiveExpIndex(0); // Reset for next time
  };

  const handleReflectionClose = () => {
    if (role === 'welcome') {
      updateSettings({ welcomeSeen: true });
    }
    setShowReflection(false);
    setActiveExpIndex(0);
  };



  return (
    <div className="h-[100dvh] w-full flex flex-col bg-brand-background dark:bg-brand-dark-background text-brand-textPrimary dark:text-brand-dark-textPrimary overflow-hidden font-sans">
      
      <main className="flex-1 overflow-auto pb-20">
         <AnimatePresence mode="wait">
            {activeTab === 'home' && (
                <motion.div 
                    key="home"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 h-full flex flex-col max-w-md mx-auto w-full"
                >
                    <header className="mb-6 pt-4">
                        <div className="flex justify-between items-center bg-gradient-to-br from-brand-surface to-brand-surface/80 dark:from-brand-dark-surface dark:to-brand-dark-surface/80 px-6 py-4 rounded-3xl shadow-sm border border-brand-textPrimary/10 backdrop-blur-md">
                             <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-brand-textPrimary dark:text-brand-dark-textPrimary">السلام عليكم</span>
                                <span className="text-xs text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80">{getIslamicDate(now)}</span>
                             </div>
                             <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-brand-textPrimary/10 shadow-inner bg-brand-quranBg dark:bg-brand-dark-quranBg flex items-center justify-center">
                                 <User className="w-6 h-6 text-brand-textSecondary dark:text-brand-dark-textSecondary opacity-80" />
                             </div>
                        </div>
                    </header>

                    <InspirationCard inspiration={todayInspiration} />

                    <div className="flex-1 flex flex-col items-center justify-center pb-12">
                         <h3 className="text-brand-textSecondary dark:text-brand-dark-textSecondary font-medium mb-5 text-xs flex items-center gap-2">
                            <span className="w-8 h-px bg-brand-textSecondary/30"></span>
                            نعمة اليوم
                            <span className="w-8 h-px bg-brand-textSecondary/30"></span>
                         </h3>
                         <BlessingCard 
                             blessing={todayBlessing} 
                             completed={isTodayCompleted} 
                             onStart={() => {
                                analytics.capture('reflection_started', { 
                                  blessing_id: todayBlessing.id, 
                                  blessing_order: todayBlessing.order, 
                                  category: todayBlessing.category, 
                                  source: 'daily' 
                                });
                                setShowReflection(true);
                             }} 
                         />
                    </div>
                </motion.div>
            )}

            {activeTab === 'journal' && (
                <motion.div 
                   key="journal"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.98 }}
                   transition={{ duration: 0.3 }}
                   className="h-full"
                >
                    <JournalView onGoHome={() => setActiveTab('home')} />
                </motion.div>
            )}

            {activeTab === 'consistency' && (
                <motion.div
                   key="consistency"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.98 }}
                   transition={{ duration: 0.3 }}
                   className="h-full"
                >
                    <ConsistencyView />
                </motion.div>
            )}

            {activeTab === 'myBlessings' && (
                <motion.div
                    key="myBlessings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                >
                    <MyBlessingsView />
                </motion.div>
            )}

            {activeTab === 'tasbih' && (
                <motion.div
                   key="tasbih"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.98 }}
                   transition={{ duration: 0.3 }}
                   className="h-full"
                >
                    <TasbihView />
                </motion.div>
            )}

            {activeTab === 'settings' && (
                <motion.div
                   key="settings"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.98 }}
                   transition={{ duration: 0.3 }}
                   className="h-full"
                >
                    <SettingsView onOpenPrivacyPolicy={() => setShowPrivacyPolicy(true)} />
                </motion.div>
            )}
         </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 w-full bg-brand-surface/90 dark:bg-brand-dark-surface/90 backdrop-blur-md border-t border-brand-textPrimary/10 pb-safe">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 py-4">
           {[
               { id: 'home', icon: Home, label: 'الرئيسية' },
               { id: 'tasbih', icon: Hash, label: 'مسبحة' },
               { id: 'myBlessings', icon: Heart, label: 'نِعَمي' },
               { id: 'journal', icon: Book, label: 'سجل الحمد' },
               { id: 'consistency', icon: CheckCircle2, label: 'المداومة' },
               { id: 'settings', icon: Settings, label: 'الإعدادات' },
           ].map(tab => (
               <button
                  key={tab.id}
                  data-tour={tab.id === 'settings' ? 'settings' : tab.id === 'consistency' ? 'continuity' : tab.id === 'myBlessings' ? 'my-blessings' : undefined}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-brand-accent dark:text-brand-dark-accent' : 'text-brand-textSecondary/60 dark:text-brand-dark-textSecondary/60 hover:text-brand-textPrimary'}`}
               >
                 <tab.icon className="w-6 h-6" />
                 <span className="text-[10px] font-medium">{tab.label}</span>
               </button>
           ))}
        </div>
      </nav>

      <AnimatePresence mode="wait">
         {showReflection && (
            <ReflectionFlow 
               key={todayBlessing.id} // Ensure it completely resets when blessing changes
               blessing={todayBlessing}
               onComplete={handleReflectionComplete}
               onClose={handleReflectionClose}
            />
         )}
         {showPrivacyPolicy && (
             <PrivacyPolicyView onClose={() => setShowPrivacyPolicy(false)} />
         )}
      </AnimatePresence>
      {!tourCompleted && onboarded && activeTab === 'home' && !showReflection && (
          <SpotlightTour onTourComplete={handleTourComplete} />
      )}
      {tourCompleted && onboarded && consentState === 'unset' && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" dir="rtl">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="max-w-sm w-full bg-brand-surface dark:bg-brand-dark-surface p-8 rounded-3xl shadow-xl border border-brand-textPrimary/10 flex flex-col items-center text-center"
            >
                 <ShieldQuestion className="w-12 h-12 text-brand-accent mb-6 opacity-80" />
                 <h2 className="text-xl font-bold mb-4">تحسين مسار التطبيق</h2>
                 <p className="text-sm text-brand-textSecondary dark:text-brand-dark-textSecondary leading-relaxed mb-8">
                     نأمل جمع بيانات استخدام <strong>مجهولة المصدر بالكامل</strong> (مثل الصفحات المفتوحة) لتحسين تجربتك.
                     <br/><br/>
                     <strong>خصوصيتك أولوية:</strong> لا يتم حفظ نصوص الحمد إطلاقاً ولا نطلب إنشاء حساب. كل بياناتك محفوظة بجهازك فقط.
                 </p>
                 <div className="flex flex-col gap-3 w-full">
                     <button
                         onClick={async () => {
                             await setConsent('granted');
                             setConsentState('granted');
                             analytics.capture('app_open');
                         }}
                         className="w-full bg-brand-primary dark:bg-brand-dark-primary text-white py-3.5 rounded-xl font-medium transition-transform hover:scale-[1.02]"
                     >
                         أوافق على المشاركة
                     </button>
                     <button
                         onClick={async () => {
                             await setConsent('denied');
                             setConsentState('denied');
                         }}
                         className="w-full bg-brand-textPrimary/5 dark:bg-brand-dark-textPrimary/5 text-brand-textPrimary dark:text-brand-dark-textPrimary py-3.5 rounded-xl font-medium transition-transform hover:scale-[1.02]"
                     >
                         ليس الآن
                     </button>
                 </div>
            </motion.div>
         </div>
      )}
    </div>
  );
}
