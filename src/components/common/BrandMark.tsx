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
  // Exact design system proportions vs font size S:
  // thread thickness: 0.02 * S (min 1.5px)
  // dot diameter: 0.075 * S (min 4px) on the RIGHT end
  // gap: 0.20 * S
  const threadHeight = Math.max(1.5, size * 0.025);
  const dotSize = Math.max(4, size * 0.075);
  const gap = Math.max(4, size * 0.2);

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`} dir="rtl">
      <span
        style={{ fontSize: `${size}px`, lineHeight: 1, color: 'var(--text-primary)' }}
        className="font-serif font-bold tracking-tight"
      >
        الحمد
      </span>
      {showThread && (
        <div
          className="relative w-full flex items-center"
          style={{ marginTop: `${gap}px`, height: `${dotSize}px` }}
        >
          {/* The signature dot on the RIGHT end (first child in RTL flex row) */}
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              backgroundColor: 'var(--accent-stroke)'
            }}
          />
          {/* The thread line spanning leftward */}
          <div
            className="flex-1 rounded-full"
            style={{
              height: `${threadHeight}px`,
              backgroundColor: 'var(--accent-stroke)'
            }}
          />
        </div>
      )}
    </div>
  );
};
