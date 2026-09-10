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
          <pattern id="islamic-star-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* Center 8-point star */}
            <path
              d="M40,24 L44,34 L54,34 L46,40 L49,50 L40,44 L31,50 L34,40 L26,34 L36,34 Z"
              fill="none"
              stroke="#EDEDF5"
              strokeWidth="1.2"
            />
            {/* Connecting octagram lines */}
            <path
              d="M40,10 L50,10 L50,0 M40,70 L50,70 L50,80 M10,40 L10,50 L0,50 M70,40 L70,50 L80,50"
              fill="none"
              stroke="#EDEDF5"
              strokeWidth="1"
            />
            {/* Outer geometry */}
            <polygon
              points="40,6 64,16 74,40 64,64 40,74 16,64 6,40 16,16"
              fill="none"
              stroke="#EDEDF5"
              strokeWidth="0.8"
            />
            {/* Corner interlock stars */}
            <path
              d="M0,0 L8,8 M80,0 L72,8 M0,80 L8,72 M80,80 L72,72"
              fill="none"
              stroke="#EDEDF5"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
      </svg>
    </div>
  );
};
