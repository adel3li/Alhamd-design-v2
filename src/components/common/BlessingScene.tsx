import React, { useId } from 'react';

/**
 * «المشهد»: the scene behind today's blessing on Home.
 *
 * The brand thread (a rule ending in a dot) comes down from whatever sits in
 * the sky (the verse, or the title when the verse is long) and touches the
 * scene: a drop that sends out ripples on still water, the first light on the
 * horizon at dawn, or a crescent hanging over dunes at night.
 *
 * Every colour is a `--scene-*` variable from `src/index.css`, so the scene
 * follows dark, light, high contrast and night reading without class remaps.
 * Nothing here is text: the sky content is passed in as children.
 */

export type SceneMotif = 'ripples' | 'dawn' | 'night';

const DAWN_IDS = new Set(['islam', 'blessing_041', 'blessing_119', 'blessing_209']);
const NIGHT_IDS = new Set(['blessing_014', 'blessing_018', 'blessing_053', 'blessing_059', 'blessing_068', 'blessing_105', 'blessing_373']);

/** Which scene a blessing gets. Ripples are the default for every blessing not listed. */
export function sceneMotifFor(blessingId: string): SceneMotif {
  if (DAWN_IDS.has(blessingId)) return 'dawn';
  if (NIGHT_IDS.has(blessingId)) return 'night';
  return 'ripples';
}

type Ring = [rx: number, inner: boolean, width: number, opacity: number];

const RINGS_ACTIVE: Ring[] = [
  [11, true, 1.3, 0.95], [27, true, 1.1, 0.7], [48, false, 1, 0.42], [75, false, 0.9, 0.26],
  [108, false, 0.8, 0.15], [148, false, 0.7, 0.08], [194, false, 0.6, 0.045],
];
// After today's reflection the rings have spread and calmed.
const RINGS_SETTLED: Ring[] = [
  [40, true, 1, 0.5], [78, true, 0.9, 0.32], [124, false, 0.8, 0.16], [176, false, 0.7, 0.09], [232, false, 0.6, 0.05],
];

// Star positions as fractions of the sky, kept clear of the top bar's row.
const STARS: [x: number, y: number, r: number, o: number][] = [
  [0.1, 0.05, 0.9, 0.55], [0.24, 0.03, 0.7, 0.4], [0.38, 0.27, 1, 0.5], [0.59, 0.04, 0.8, 0.45],
  [0.77, 0.25, 1.1, 0.6], [0.91, 0.04, 0.7, 0.4], [0.06, 0.5, 0.8, 0.35], [0.95, 0.6, 0.9, 0.4],
  [0.05, 0.86, 0.7, 0.3], [0.94, 0.9, 0.7, 0.3], [0.67, 0.4, 0.6, 0.3], [0.31, 0.66, 0.6, 0.3],
];

const WATER_LINES: [x1: number, x2: number, y: number, o: number][] = [
  [0.06, 0.27, 18, 0.07], [0.67, 0.95, 26, 0.06], [0.15, 0.31, 40, 0.05],
  [0.77, 0.92, 54, 0.05], [0.04, 0.22, 134, 0.05], [0.81, 0.97, 144, 0.05],
];

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

interface BlessingSceneProps {
  motif: SceneMotif;
  /** Today's reflection is done: the ripples have spread and calmed */
  settled?: boolean;
  isLight: boolean;
  /** Content of the sky: the date and the verse, or the title on long-verse days */
  children: React.ReactNode;
}

export const BlessingScene: React.FC<BlessingSceneProps> = ({ motif, settled = false, isLight, children }) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `scene-${uid}-${name}`;

  const skyBackground =
    motif === 'dawn'
      ? 'radial-gradient(ellipse 70% 42% at 50% 100%, var(--scene-sun), transparent 72%), ' +
        'linear-gradient(to bottom, var(--scene-dawn-1), var(--scene-dawn-2) 45%, var(--scene-dawn-3) 74%, var(--scene-dawn-4) 90%, var(--scene-dawn-5))'
      : 'linear-gradient(to bottom, var(--scene-sky-1), var(--scene-sky-2) 62%, var(--scene-sky-3))';

  const threadGradient = `linear-gradient(to bottom, transparent, var(--scene-thread))`;

  return (
    <div className="relative w-full flex flex-col">
      {/* Sky */}
      <div className="relative w-full flex flex-col" style={{ background: skyBackground }}>
        {!isLight && (
          <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {STARS.filter(([, y]) => motif !== 'dawn' || y < 0.55).map(([x, y, r, o], i) => (
              <circle key={i} cx={pct(x)} cy={pct(y)} r={r} style={{ fill: 'var(--scene-light)', opacity: o }} />
            ))}
          </svg>
        )}

        <div className="relative z-10 w-full flex flex-col">{children}</div>

        {/* The thread, from the sky content down to the scene */}
        <div className="relative w-full" style={{ height: motif === 'night' ? 150 : 72 }} aria-hidden="true">
          <span
            className="absolute top-2 w-px"
            style={{ left: 'calc(50% - 0.5px)', bottom: motif === 'night' ? 92 : 0, background: threadGradient }}
          />
          {motif === 'night' && (
            <>
              <span
                className="absolute pointer-events-none"
                style={{
                  left: 'calc(50% - 90px)', bottom: -12, width: 180, height: 156,
                  background: 'radial-gradient(closest-side, var(--scene-glow), transparent)',
                  opacity: 'var(--scene-glow-opacity)',
                }}
              />
              <span
                className="absolute rounded-full"
                style={{ left: 'calc(50% - 2.6px)', bottom: 89, width: 5.2, height: 5.2, background: 'var(--scene-ripple)' }}
              />
              <svg className="absolute" width="56" height="56" viewBox="0 0 56 56" style={{ left: 'calc(50% - 28px)', bottom: 26 }}>
                <defs>
                  <mask id={id('moon')}>
                    <rect width="56" height="56" fill="#fff" />
                    <circle cx="28" cy="23.5" r="22" fill="#000" />
                  </mask>
                </defs>
                <circle cx="28" cy="29" r="23" mask={`url(#${id('moon')})`} style={{ fill: 'var(--scene-ripple)' }} />
              </svg>
            </>
          )}
        </div>
      </div>

      {/* Ground */}
      {motif === 'ripples' && (
        <svg aria-hidden="true" className="block w-full" height="190">
          <defs>
            <linearGradient id={id('water')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--scene-water-1)' }} />
              <stop offset="0.55" style={{ stopColor: 'var(--scene-water-2)' }} />
              <stop offset="1" style={{ stopColor: 'var(--scene-base)' }} />
            </linearGradient>
            <linearGradient id={id('band')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--scene-band)', stopOpacity: 'var(--scene-band-opacity)' }} />
              <stop offset="1" style={{ stopColor: 'var(--scene-band)', stopOpacity: 0 }} />
            </linearGradient>
            <radialGradient id={id('glow')} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" style={{ stopColor: 'var(--scene-glow)', stopOpacity: 'var(--scene-glow-opacity)' }} />
              <stop offset="1" style={{ stopColor: 'var(--scene-glow)', stopOpacity: 0 }} />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="190" fill={`url(#${id('water')})`} />
          <rect x="0" y="0" width="100%" height="18" fill={`url(#${id('band')})`} />
          <line x1="0" y1="0.5" x2="100%" y2="0.5" style={{ stroke: 'var(--scene-light)', strokeOpacity: 0.07 }} />
          {WATER_LINES.map(([x1, x2, y, o], i) => (
            <line key={i} x1={pct(x1)} x2={pct(x2)} y1={y} y2={y} strokeLinecap="round" style={{ stroke: 'var(--scene-light)', strokeOpacity: o }} />
          ))}
          <ellipse cx="50%" cy="90" rx={settled ? 150 : 120} ry={settled ? 40 : 34} fill={`url(#${id('glow')})`} />
          {(settled ? RINGS_SETTLED : RINGS_ACTIVE).map(([rx, inner, width, opacity], i) => (
            <ellipse
              key={i}
              cx="50%"
              cy="90"
              rx={rx}
              ry={+(rx * 0.226).toFixed(1)}
              fill="none"
              style={{
                stroke: inner ? 'var(--scene-ripple)' : 'var(--scene-light)',
                strokeWidth: width,
                strokeOpacity: inner || !isLight ? opacity : opacity * 0.62,
              }}
            />
          ))}
          <line x1="50%" x2="50%" y1="0" y2="87" style={{ stroke: 'var(--scene-thread)', strokeOpacity: settled ? 1 : 0.85 }} />
          <circle cx="50%" cy="90" r="3.2" style={{ fill: 'var(--scene-ripple)' }} />
        </svg>
      )}

      {motif === 'dawn' && (
        <svg aria-hidden="true" className="block w-full" height="150" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={id('land')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--scene-land-1)' }} />
              <stop offset="0.6" style={{ stopColor: 'var(--scene-land-2)' }} />
              <stop offset="1" style={{ stopColor: 'var(--scene-base)' }} />
            </linearGradient>
            <linearGradient id={id('rim')} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" style={{ stopColor: 'var(--scene-sunline)', stopOpacity: 0 }} />
              <stop offset="0.5" style={{ stopColor: 'var(--scene-sunline)', stopOpacity: 0.9 }} />
              <stop offset="1" style={{ stopColor: 'var(--scene-sunline)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="150" fill={`url(#${id('land')})`} />
          <rect x="10%" y="-0.75" width="80%" height="1.5" fill={`url(#${id('rim')})`} />
          {([[0.31, 0.69, 10, 0.18], [0.2, 0.8, 24, 0.09], [0.08, 0.92, 46, 0.05], [0, 1, 78, 0.03]] as const).map(([x1, x2, y, o], i) => (
            <line key={i} x1={pct(x1)} x2={pct(x2)} y1={y} y2={y} strokeLinecap="round" style={{ stroke: 'var(--scene-sunline)', strokeOpacity: o }} />
          ))}
          <circle cx="50%" cy="0" r={settled ? 4.4 : 3.6} style={{ fill: 'var(--scene-sunline)' }} />
        </svg>
      )}

      {motif === 'night' && (
        <svg aria-hidden="true" className="block w-full" height="150" viewBox="0 0 390 150" preserveAspectRatio="none" style={{ marginTop: -36 }}>
          <defs>
            <linearGradient id={id('fade')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--scene-base)', stopOpacity: 0 }} />
              <stop offset="1" style={{ stopColor: 'var(--scene-base)', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path d="M0 26 C52 10 104 6 160 16 C214 26 262 4 318 0 C350 -2 372 4 390 10 V150 H0 Z" style={{ fill: 'var(--scene-dune-1)' }} />
          <path d="M0 62 C70 40 132 44 196 58 C252 70 306 48 390 42 V150 H0 Z" style={{ fill: 'var(--scene-dune-2)' }} />
          <path d="M0 106 C84 84 168 90 236 106 C300 120 346 102 390 94 V150 H0 Z" style={{ fill: 'var(--scene-dune-3)' }} />
          <rect x="0" y="90" width="390" height="60" fill={`url(#${id('fade')})`} />
        </svg>
      )}
    </div>
  );
};
