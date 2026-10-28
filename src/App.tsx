import React, { useState } from 'react';
import { StoreProvider, useStore } from './lib/store';
import { TopBar } from './components/layout/TopBar';
import { BottomTabBar, TabId } from './components/layout/BottomTabBar';
import { DesktopNavBar } from './components/layout/DesktopNavBar';
import { HomeScreen } from './components/screens/HomeScreen';
import { JourneyPathScreen } from './components/journey/JourneyPathScreen';
import { JournalScreen } from './components/screens/JournalScreen';
import { ConsistencyScreen } from './components/screens/ConsistencyScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { ReflectionModal } from './components/screens/ReflectionModal';
import { TasbihModal, TasbihSubView } from './components/screens/TasbihModal';
import { HisnCategoryId } from './data/hisnAlMuslim';
import { AboutModal } from './components/screens/AboutModal';
import { ContentReviewModal } from './components/screens/ContentReviewModal';
import { PrivacyPolicyModal } from './components/screens/PrivacyPolicyModal';
import { SpotlightTour } from './components/common/SpotlightTour';
import { CompletionParticles } from './components/common/CompletionParticles';
import { getDeveloperPremiumSync } from './lib/entitlements';
import { PremiumPaywallScreen } from './components/screens/PremiumPaywallScreen';

const MainAppContent: React.FC = () => {
  const {
    todayBlessing,
    todayInspiration,
    entries,
    userBlessings,
    completedDays,
    tasbihCount,
    theme,
    textSize,
    notificationsEnabled,
    notificationTime,
    analyticsConsent,
    onboardingCompleted,
    tourCompleted,
    isCompletedToday,
    completeOnboarding,
    completeTour,
    markTodayCompleted,
    incrementTasbih,
    resetTasbih,
    addJournalEntry,
    deleteJournalEntry,
    addUserBlessing,
    deleteUserBlessing,
    toggleFavoriteUserBlessing,
    setNotificationsEnabled,
    setNotificationTime,
    setAnalyticsConsent,
    triggerHaptic
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [tasbihSubView, setTasbihSubView] = useState<TasbihSubView>('counter');
  const [hisnCategory, setHisnCategory] = useState<HisnCategoryId | undefined>(undefined);
  const [isReflecting, setIsReflecting] = useState(false);
  const [showCelebrationParticles, setShowCelebrationParticles] = useState(false);
  const [isTasbihOpen, setIsTasbihOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showJourneyPaywall, setShowJourneyPaywall] = useState(false);

  const handleTabChange = (tab: TabId) => {
    if (tab === 'journey' && !getDeveloperPremiumSync()) {
      setShowJourneyPaywall(true);
      return;
    }
    if (tab === 'tasbih') {
      setTasbihSubView('counter');
    }
    setActiveTab(tab);
  };

  // If user hasn't completed onboarding yet, render full Onboarding screen
  if (!onboardingCompleted) {
    return (
      <div className={theme === 'light' ? 'theme-light bg-[#F4EDE3] text-[#2A1F19]' : 'theme-dark bg-[#15152A] text-[#EDEDF5]'}>
        <OnboardingScreen
          onComplete={completeOnboarding}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={setNotificationsEnabled}
          analyticsConsent={analyticsConsent}
          onToggleAnalytics={setAnalyticsConsent}
        />
      </div>
    );
  }

  const handleReflectionComplete = (journalText?: string) => {
    markTodayCompleted();
    if (journalText) {
      addJournalEntry(journalText);
    }
    setIsReflecting(false);
    setShowCelebrationParticles(true);
    setTimeout(() => {
      setShowCelebrationParticles(false);
    }, 3200);
  };

  const textScaleClass = textSize === 'large' 
    ? 'text-scale-large' 
    : textSize === 'xlarge' 
    ? 'text-scale-xlarge' 
    : 'text-scale-normal';

  const themeClass = theme === 'light' 
    ? 'theme-light bg-[#F4EDE3] text-[#2A1F19]' 
    : 'theme-dark bg-[#15152A] text-[#EDEDF5]';

  return (
    <div className={`min-h-screen ${themeClass} ${textScaleClass} font-sans flex flex-col selection:bg-[#C8A951]/30 transition-colors duration-200`} dir="rtl">
      {showCelebrationParticles && <CompletionParticles />}

      {/* Desktop Header Navigation (≥900px) */}
      <div className="hidden md:block">
        <DesktopNavBar
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          onOpenAbout={() => setIsAboutOpen(true)}
        />
      </div>

      {/* Mobile Top Bar (<900px) */}
      <div className="block md:hidden">
        <TopBar
          onOpenSettings={() => setActiveTab('settings')}
          isSettingsActive={activeTab === 'settings'}
          onOpenAbout={() => setIsAboutOpen(true)}
        />
      </div>

      {/* Main Screen Content View */}
      <main className="flex-1 w-full flex flex-col items-center">
        {activeTab === 'home' && (
          <HomeScreen
            blessing={todayBlessing}
            inspiration={todayInspiration}
            isCompletedToday={isCompletedToday}
            tasbihCount={tasbihCount}
            onStartReflection={() => setIsReflecting(true)}
            onOpenTasbih={() => {
              setTasbihSubView('counter');
              setActiveTab('tasbih');
            }}
            onOpenHisn={(category) => {
              setHisnCategory(category);
              setTasbihSubView('hisn');
              setActiveTab('tasbih');
            }}
          />
        )}

        {activeTab === 'journey' && (
          <JourneyPathScreen />
        )}

        {activeTab === 'journal' && (
          <JournalScreen
            entries={entries}
            userBlessings={userBlessings}
            onDeleteEntry={deleteJournalEntry}
            onAddUserBlessing={addUserBlessing}
            onDeleteUserBlessing={deleteUserBlessing}
            onToggleFavoriteBlessing={toggleFavoriteUserBlessing}
          />
        )}

        {activeTab === 'consistency' && (
          <ConsistencyScreen
            completedDays={completedDays}
            notificationsEnabled={notificationsEnabled}
            notificationTime={notificationTime}
            onToggleNotifications={setNotificationsEnabled}
            onChangeNotificationTime={setNotificationTime}
          />
        )}

        {activeTab === 'tasbih' && (
          <TasbihModal
            inline={true}
            tasbihCount={tasbihCount}
            onIncrementTasbih={incrementTasbih}
            onResetTasbih={resetTasbih}
            triggerHaptic={triggerHaptic}
            initialSubView={tasbihSubView}
            initialHisnCategory={hisnCategory}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="block md:hidden">
        <BottomTabBar
          activeTab={activeTab}
          onChangeTab={handleTabChange}
        />
      </div>

      {/* Paywall Modal when clicking رحلتي without Developer Mode enabled */}
      {showJourneyPaywall && (
        <PremiumPaywallScreen
          triggerReason="preview"
          onClose={() => setShowJourneyPaywall(false)}
          onUnlocked={() => {
            setShowJourneyPaywall(false);
            setActiveTab('journey');
          }}
        />
      )}

      {/* 5-Step Reflection Modal */}
      {isReflecting && (
        <ReflectionModal
          blessing={todayBlessing}
          onClose={() => setIsReflecting(false)}
          onComplete={handleReflectionComplete}
          triggerHaptic={triggerHaptic}
        />
      )}

      {/* Tasbih Modal (fallback if triggered as modal) */}
      {isTasbihOpen && (
        <TasbihModal
          onClose={() => setIsTasbihOpen(false)}
          tasbihCount={tasbihCount}
          onIncrementTasbih={incrementTasbih}
          onResetTasbih={resetTasbih}
          triggerHaptic={triggerHaptic}
        />
      )}

      {/* About Modal */}
      {isAboutOpen && (
        <AboutModal
          onClose={() => setIsAboutOpen(false)}
          onOpenContentReview={() => setIsReviewOpen(true)}
          onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
        />
      )}

      {/* Content & Scientific Review Status Modal */}
      {isReviewOpen && (
        <ContentReviewModal onClose={() => setIsReviewOpen(false)} />
      )}

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
        <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} />
      )}

      {/* 4-Step Spotlight Feature Tour on First App Launch */}
      {!tourCompleted && activeTab === 'home' && (
        <SpotlightTour onComplete={completeTour} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
