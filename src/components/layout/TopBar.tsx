import React from 'react';
import { Calendar } from 'lucide-react';
import { BrandMark } from '../common/BrandMark';

interface TopBarProps {
  onOpenCalendar: () => void;
  onOpenAbout: () => void;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCalendar,
  onOpenAbout,
  className = ''
}) => {
  return (
    <header
      className={`sticky top-0 z-30 w-full px-5 py-3.5 flex items-center justify-between backdrop-blur-md bg-[#15152A]/85 dark:bg-[#15152A]/85 border-b border-[#2E2E4A]/50 transition-colors ${className}`}
      dir="rtl"
    >
      {/* Right item: «ح» avatar button (Opens About modal) */}
      <button
        id="btn-topbar-about"
        onClick={onOpenAbout}
        className="w-10 h-10 rounded-full bg-[#1E1E38]/90 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#EDEDF5] font-serif font-bold text-lg shadow-sm active:scale-95 transition-all"
        title="عن التطبيق"
        aria-label="عن التطبيق"
      >
        ح
      </button>

      {/* Center item: Signature Wordmark + Thread */}
      <div className="flex items-center justify-center">
        <BrandMark size={28} showThread={true} />
      </div>

      {/* Left item: Calendar Icon (Opens Consistency / Calendar tab) */}
      <button
        id="btn-topbar-calendar"
        onClick={onOpenCalendar}
        className="w-10 h-10 rounded-full bg-[#1E1E38]/90 hover:bg-[#25232E] border border-[#2E2E4A] flex items-center justify-center text-[#E4C368] shadow-sm active:scale-95 transition-all"
        title="المداومة"
        aria-label="المداومة"
      >
        <Calendar size={19} strokeWidth={1.8} />
      </button>
    </header>
  );
};
