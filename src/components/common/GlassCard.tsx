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
      style={{
        backgroundColor: raised ? 'var(--bg-raised)' : 'var(--bg-glass)',
        borderColor: borderAccent ? 'var(--accent-stroke)' : 'var(--border-hairline)',
        boxShadow: raised ? 'var(--raised-shadow)' : 'var(--card-shadow)',
      }}
      className={`
        relative rounded-[24px] overflow-hidden backdrop-blur-xl transition-all duration-200 border
        ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
        ${padding}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
