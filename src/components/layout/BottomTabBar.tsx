import React from 'react';
import { Home, Compass, BookOpen, Calendar } from 'lucide-react';
import { APP_STRINGS } from '../../constants/strings';

export type TabId = 'home' | 'journey' | 'journal' | 'consistency' | 'tasbih' | 'settings';

export const TasbihIcon: React.FC<{ size?: number; strokeWidth?: number; className?: string }> = ({
  size = 22,
  strokeWidth = 1.7,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Imam bead & tassel at top */}
    <path d="M12 2v3" />
    <circle cx="12" cy="6.5" r="1.3" fill="currentColor" stroke="none" />
    {/* Prayer beads arranged in a circle */}
    <circle cx="16.5" cy="8" r="1.25" />
    <circle cx="18.5" cy="12.2" r="1.25" />
    <circle cx="17" cy="16.6" r="1.25" />
    <circle cx="13.8" cy="19.5" r="1.25" />
    <circle cx="10.2" cy="19.5" r="1.25" />
    <circle cx="7" cy="16.6" r="1.25" />
    <circle cx="5.5" cy="12.2" r="1.25" />
    <circle cx="7.5" cy="8" r="1.25" />
  </svg>
);

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
    { id: 'journey' as TabId, label: APP_STRINGS.tabs.journey, icon: Compass },
    { id: 'journal' as TabId, label: APP_STRINGS.tabs.journal, icon: BookOpen },
    { id: 'consistency' as TabId, label: APP_STRINGS.tabs.consistency, icon: Calendar },
    { id: 'tasbih' as TabId, label: APP_STRINGS.tabs.tasbih, icon: TasbihIcon }
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
              className="relative flex flex-col items-center justify-center flex-1 min-h-[52px] py-1 transition-all group cursor-pointer"
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
