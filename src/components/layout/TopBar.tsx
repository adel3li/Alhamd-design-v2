import React from 'react';
import { Settings } from 'lucide-react';
import { BrandMark } from '../common/BrandMark';

interface TopBarProps {
  onOpenSettings: () => void;
  isSettingsActive?: boolean;
  onOpenAbout: () => void;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSettings,
  isSettingsActive = false,
  onOpenAbout,
  className = ''
}) => {
  return (
    <header
      className={`sticky top-0 z-30 w-full px-5 py-3.5 flex items-center justify-between backdrop-blur-md bg-[#15152A]/85 border-b border-[#2E2E4A]/50 transition-colors ${className}`}
      dir="rtl"
    >
      {/* Right item: «ح» avatar button (Opens About modal) */}
      <button
        id="btn-topbar-about"
        onClick={onOpenAbout}
        className="w-9 h-9 rounded-full border border-[#C8A951] flex items-center justify-center text-[#E4C368] font-serif text-lg active:scale-95 transition-all cursor-pointer"
        title="عن التطبيق"
        aria-label="عن التطبيق"
      >
        ح
      </button>

      {/* Center item: Signature Wordmark (wordmark alone in top bar per design sheet section 5 & 6) */}
      <div className="flex items-center justify-center">
        <BrandMark size={24} showThread={false} />
      </div>

      {/* Left item: Settings Icon */}
      <button
        id="btn-topbar-settings"
        onClick={onOpenSettings}
        className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
          isSettingsActive
            ? 'bg-[#C8A951]/15 text-[#E4C368] border border-[#C8A951]/40'
            : 'text-[#C7C4D8] hover:text-[#E4C368]'
        }`}
        title="الإعدادات"
        aria-label="الإعدادات"
      >
        <Settings size={22} strokeWidth={isSettingsActive ? 2.1 : 1.6} />
      </button>
    </header>
  );
};
