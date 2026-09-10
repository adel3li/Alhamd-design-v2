import React from 'react';

interface BrandMarkProps {
  size?: number; // approx font size in px (e.g. 24, 28, 36)
  showThread?: boolean;
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 28,
  showThread = true,
  className = ''
}) => {
  // Proportions vs font size S:
  // thread thickness: 0.02 * S (min 1.5px)
  // dot diameter: 0.075 * S (min 4px)
  // gap: 0.20 * S (approx 4-8px)
  const threadHeight = Math.max(1.75, size * 0.04);
  const dotSize = Math.max(4.5, size * 0.12);
  const gap = Math.max(4, size * 0.18);

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`} dir="rtl">
      <span
        style={{ fontSize: `${size}px`, lineHeight: 1.05 }}
        className="font-serif font-bold tracking-tight text-[#EDEDF5] dark:text-[#EDEDF5] text-inherit"
      >
        الحمد
      </span>
      {showThread && (
        <div
          className="relative w-full flex items-center"
          style={{ marginTop: `${gap}px`, height: `${dotSize}px` }}
        >
          {/* The thread line */}
          <div
            className="flex-1 bg-gradient-to-l from-[#C8A951] via-[#C8A951]/70 to-transparent rounded-full"
            style={{ height: `${threadHeight}px` }}
          />
          {/* The signature dot on the RIGHT end */}
          <div
            className="rounded-full bg-[#E4C368] shadow-[0_0_8px_rgba(228,195,104,0.7)] flex-shrink-0"
            style={{ width: `${dotSize}px`, height: `${dotSize}px` }}
          />
        </div>
      )}
    </div>
  );
};
