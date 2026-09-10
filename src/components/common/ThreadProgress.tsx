import React from 'react';

interface ThreadProgressProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
  className?: string;
  width?: number | string;
}

export const ThreadProgress: React.FC<ThreadProgressProps> = ({
  currentStep,
  totalSteps,
  className = '',
  width = 140
}) => {
  // Clamp progress fraction between 0.15 and 1.0
  const progressRatio = Math.min(Math.max(currentStep / totalSteps, 0.15), 1.0);
  const percentage = progressRatio * 100;

  return (
    <div
      className={`relative flex items-center justify-end ${className}`}
      style={{ width: typeof width === 'number' ? `${width}px` : width, height: '16px' }}
      dir="rtl"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      {/* Background track */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#2E2E4A]/80 rounded-full" />

      {/* Active filling thread growing leftward from the right dot */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 h-[2.5px] bg-gradient-to-l from-[#E4C368] via-[#C8A951] to-[#E4C368]/50 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />

      {/* Origin dot on the RIGHT */}
      <div className="relative z-10 w-[7px] h-[7px] rounded-full bg-[#E4C368] shadow-[0_0_8px_rgba(228,195,104,0.8)]" />

      {/* Leading indicator glow at the head of the growing thread */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-[#E4C368] transition-all duration-500"
        style={{ right: `calc(${percentage}% - 2.5px)` }}
      />
    </div>
  );
};
