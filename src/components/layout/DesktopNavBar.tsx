import React from 'react';
import { Home, Compass, BookOpen, Calendar, Settings } from 'lucide-react';
import { TabId, TasbihIcon } from './BottomTabBar';
import { BrandMark } from '../common/BrandMark';
import { APP_STRINGS } from '../../constants/strings';

interface DesktopNavBarProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  onOpenAbout: () => void;
}

export const DesktopNavBar: React.FC<DesktopNavBarProps> = ({
  activeTab,
  onChangeTab,
  onOpenAbout
}) => {
  const tabs = [
    { id: 'home' as TabId, label: APP_STRINGS.tabs.home, icon: Home },
    { id: 'journey' as TabId, label: APP_STRINGS.tabs.journey, icon: Compass },
    { id: 'journal' as TabId, label: APP_STRINGS.tabs.journal, icon: BookOpen },
    { id: 'consistency' as TabId, label: APP_STRINGS.tabs.consistency, icon: Calendar },
    { id: 'tasbih' as TabId, label: APP_STRINGS.tabs.tasbih, icon: TasbihIcon }
  ];

  return (
    <header className="w-full sticky top-0 z-40 bg-[#15152A]/90 dark:bg-[#15152A]/90 backdrop-blur-xl border-b border-[#2E2E4A]/80 py-3.5 px-8" dir="rtl">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Right side: Brand mark */}
        <div className="flex items-center gap-3">
          <BrandMark size={32} showThread={true} />
        </div>

        {/* Center: Tabs with active indicators */}
        <nav className="flex items-center gap-1 bg-[#1E1E38]/80 p-1.5 rounded-2xl border border-[#2E2E4A]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                id={`desktop-tab-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#25232E] text-[#E4C368] shadow-sm border border-[#C8A951]/30 font-semibold'
                    : 'text-[#AEAECB] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Left side: Settings + Avatar button */}
        <div className="flex items-center gap-2.5">
          <button
            id="desktop-btn-settings"
            onClick={() => onChangeTab('settings')}
            className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-sm transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#25232E] border-[#C8A951] text-[#E4C368]'
                : 'bg-[#1E1E38] hover:bg-[#25232E] border-[#2E2E4A] text-[#C7C4D8] hover:text-[#E4C368]'
            }`}
            title="الإعدادات"
            aria-label="الإعدادات"
          >
            <Settings size={18} strokeWidth={activeTab === 'settings' ? 2.2 : 1.8} />
          </button>

          <button
            id="desktop-btn-about"
            onClick={onOpenAbout}
            className="w-10 h-10 rounded-full bg-[#1E1E38] hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] font-serif font-bold text-base shadow-sm transition-all cursor-pointer"
            title="عن التطبيق"
          >
            ح
          </button>
        </div>
      </div>
    </header>
  );
};
