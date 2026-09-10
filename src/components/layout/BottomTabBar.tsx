import React from 'react';
import { Home, BookOpen, Calendar, Settings } from 'lucide-react';
import { APP_STRINGS } from '../../constants/strings';

export type TabId = 'home' | 'journal' | 'consistency' | 'settings';

interface BottomTabBarProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  className?: string;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onChangeTab,
  className = ''
}) => {
  const tabs = [
    { id: 'home' as TabId, label: APP_STRINGS.tabs.home, icon: Home },
    { id: 'journal' as TabId, label: APP_STRINGS.tabs.journal, icon: BookOpen },
    { id: 'consistency' as TabId, label: APP_STRINGS.tabs.consistency, icon: Calendar },
    { id: 'settings' as TabId, label: APP_STRINGS.tabs.settings, icon: Settings }
  ];

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-30 bg-[#15152A]/92 dark:bg-[#15152A]/92 backdrop-blur-xl border-t border-[#2E2E4A] px-2 py-1.5 transition-colors ${className}`}
      dir="rtl"
      aria-label="شريط التنقل السفلي"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 min-h-[52px] py-1 transition-all group"
              aria-selected={isActive}
            >
              {/* Active Tab Accent Bar above the icon (as in ref-01) */}
              {isActive && (
                <div className="absolute top-0 w-8 h-[2.5px] rounded-full bg-[#E4C368] shadow-[0_0_8px_rgba(228,195,104,0.7)]" />
              )}

              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.7}
                className={`transition-colors duration-200 mt-1 ${
                  isActive ? 'text-[#E4C368]' : 'text-[#AEAECB] group-hover:text-white'
                }`}
              />

              <span
                className={`text-[11px] font-medium tracking-wide mt-1 transition-colors duration-200 ${
                  isActive ? 'text-[#E4C368]' : 'text-[#AEAECB] group-hover:text-white'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
