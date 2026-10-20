import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface CompletionParticlesProps {
  count?: number;
  className?: string;
}

interface ParticleConfig {
  id: number;
  x: number; // percentage 5..95
  startY: number; // percentage 25..95
  travelY: number; // upward drift in px
  driftX: number; // gentle horizontal sway in px
  size: number; // px
  delay: number; // seconds
  duration: number; // seconds
  shape: 'orb' | 'star' | 'ring';
  isAccent: boolean;
}

export const CompletionParticles: React.FC<CompletionParticlesProps> = ({
  count = 32,
  className = '',
}) => {
  const particles = useMemo<ParticleConfig[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      // Deterministic pseudo-random distribution for smooth, balanced visual harmony
      const seed1 = ((i * 37 + 13) % 100) / 100;
      const seed2 = ((i * 61 + 29) % 100) / 100;
      const seed3 = ((i * 83 + 7) % 100) / 100;

      const shape: ParticleConfig['shape'] =
        i % 5 === 0 ? 'star' : i % 7 === 0 ? 'ring' : 'orb';

      return {
        id: i,
        x: 6 + seed1 * 88,
        startY: 30 + seed2 * 62,
        travelY: -(110 + seed3 * 160),
        driftX: (seed1 - 0.5) * 48,
        size: shape === 'star' ? 9 + (i % 4) * 2 : shape === 'ring' ? 10 + (i % 3) * 3 : 4 + (i % 4) * 2,
        delay: (i % 10) * 0.12,
        duration: 2.2 + seed3 * 1.4,
        shape,
        isAccent: i % 3 !== 0,
      };
    });
  }, [count]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Soft central ambient radial glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: [0, 0.35, 0], scale: [0.8, 1.15, 1.3] }}
        transition={{ duration: 2.6, ease: 'easeOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl"
        style={{ backgroundColor: 'var(--ayah-border)' }}
      />

      {particles.map((p) => {
        const colorVar = p.isAccent ? 'var(--accent-stroke)' : 'var(--cta-bg)';

        return (
          <motion.div
            key={p.id}
            initial={{
              opacity: 0,
              y: 0,
              x: 0,
              scale: 0.3,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 0.85, 0.7, 0],
              y: p.travelY,
              x: [0, p.driftX * 0.5, p.driftX],
              scale: [0.4, 1.05, 0.85, 0.2],
              rotate: p.shape === 'star' ? [0, 45, 90] : 0,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.startY}%`,
              width: p.size,
              height: p.size,
            }}
          >
            {p.shape === 'star' ? (
              <svg
                viewBox="0 0 24 24"
                width={p.size}
                height={p.size}
                style={{ color: colorVar, filter: 'drop-shadow(0 0 6px var(--ayah-border))' }}
              >
                <path
                  fill="currentColor"
                  d="M12 1L14.8 9.2L23 12L14.8 14.8L12 23L9.2 14.8L1 12L9.2 9.2L12 1Z"
                />
              </svg>
            ) : p.shape === 'ring' ? (
              <div
                className="w-full h-full rounded-full border"
                style={{
                  borderColor: colorVar,
                  boxShadow: '0 0 8px var(--ayah-border)',
                }}
              />
            ) : (
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: colorVar,
                  boxShadow: '0 0 10px var(--accent-stroke)',
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
