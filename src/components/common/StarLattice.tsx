import React from 'react';

interface StarLatticeProps {
  opacity?: number; // default 0.04 (4%)
  className?: string;
}

export const StarLattice: React.FC<StarLatticeProps> = ({
  opacity = 0.045,
  className = ''
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-star-pattern" width="140" height="140" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="var(--text-primary)" strokeWidth="1.2">
              <rect x="35" y="35" width="70" height="70" />
              <rect x="35" y="35" width="70" height="70" transform="rotate(45 70 70)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
      </svg>
    </div>
  );
};
