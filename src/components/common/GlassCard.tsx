import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  raised?: boolean;
  borderAccent?: boolean;
  padding?: string;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  raised = false,
  borderAccent = false,
  padding = 'p-5 sm:p-6',
  id
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        relative rounded-[24px] overflow-hidden backdrop-blur-xl transition-all duration-200
        ${raised 
          ? 'bg-[#25232E]/85 dark:bg-[#25232E]/85 bg-white/90 shadow-lg' 
          : 'bg-[#1E1E38]/80 dark:bg-[#1E1E38]/80 bg-white/80 shadow-md'
        }
        border ${borderAccent 
          ? 'border-[#C8A951]/40 shadow-[0_4px_20px_rgba(200,169,81,0.08)]' 
          : 'border-[#2E2E4A]/80 dark:border-[#2E2E4A]/80 border-slate-200/80'
        }
        ${onClick ? 'cursor-pointer active:scale-[0.99] hover:border-[#C8A951]/30' : ''}
        ${padding}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
