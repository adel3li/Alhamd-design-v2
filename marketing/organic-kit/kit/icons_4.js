/*
 * Alhamd organic kit — line icons for blessings 301–400 (hundred 4), in the style of icons.js:
 * 48-unit grid, one thin stroke, round caps, no faces or people. Loaded after icons.js; adds to ICONS.I and ICONS.BY_BLESSING.
 * One file per hundred, so the sessions drawing different hundreds never edit the same file.
 */
(function () {
  const { I, BY_BLESSING, H } = window.ICONS;
  const { f, P, C, E, R, spark, heart, tree, lantern, ring, drop } = H; // eslint-disable-line no-unused-vars

  Object.assign(I, {
    kabid: [ // the liver, its two lobes, and the gallbladder beneath
      P('M7.5 21 C7.5 14.5 13.5 11.5 22 11.5 C30 11.5 37.5 12.5 40.8 15.6 C42.2 17.4 40.6 19.8 37.2 21 C31.2 23.2 26.4 27.4 22.6 33 C19.6 37.2 14.4 38.2 11.2 35.2 C8.6 32.4 7.5 27.2 7.5 21 Z'),
      P('M27.5 11.8 C26.6 17.4 24.6 21.6 21.2 25'), P('M22.5 28.5 C24 31.5 26.6 33.4 29.6 33.2 C31.6 33 32.4 31 31.2 29.4'), spark(36, 30.5, 2.4), spark(13, 42, 1.5),
    ],
    kulya: [ // the two kidneys, their ducts, and the bladder they fill
      P('M14 8.5 C9 8.5 6.8 12.8 6.8 18 C6.8 23.2 9 27.5 14 27.5 C17 27.5 18.2 25.4 17.2 22.4 C16.2 20 16.2 16 17.2 13.6 C18.2 10.8 17 8.5 14 8.5 Z'),
      P('M34 8.5 C39 8.5 41.2 12.8 41.2 18 C41.2 23.2 39 27.5 34 27.5 C31 27.5 29.8 25.4 30.8 22.4 C31.8 20 31.8 16 30.8 13.6 C29.8 10.8 31 8.5 34 8.5 Z'),
      P('M16.6 21 C19.4 26 21 31 21.6 36.2'), P('M31.4 21 C28.6 26 27 31 26.4 36.2'), P('M19.6 36.2 L28.4 36.2 C31 39.6 29 43.4 24 43.4 C19 43.4 17 39.6 19.6 36.2 Z'), drop(24, 31, 0.8),
    ],
    dimagh: [ // the brain in profile, its folds, and the stem that carries it
      P('M10 26 C8 19 13 11 21 10 C25 7 32 8 35 12 C40 13 42.4 19 40.4 24 C41.4 29 37 33 32 33 L28 33 C26 36 22 36.4 20 34.4 C15 35.4 11 31.4 10 26 Z'),
      P('M18 15 C21 17 21 21 18 23'), P('M26 13 C24 17 27 20 30.4 19'), P('M34 21 C31 23 31 27 34 28.4'), P('M14.6 27.4 C18.6 26.4 22 28 23.2 31.4'), P('M28 33 C28 37 29 40 31 42.5'), spark(9, 9, 2.2), spark(42, 37, 1.5),
    ],
    asab: [ // a nerve cell: its branches, and the long fibre that carries the signal
      C(15, 15, 4.2), P('M12 12 L7.6 7.6 M7.6 7.6 L4.6 8.2 M7.6 7.6 L7.8 4.6'), P('M11 17.4 L5.2 19.6'), P('M15.6 10.8 L16.6 5.4'), P('M19 12.6 L23.4 9'),
      P('M18.2 18.2 C23 23 25.8 27.4 32 32.6'), P('M32 32.6 L39 33.4 M32 32.6 L35 39.4 M32 32.6 L39.4 39.4'), C(40.2, 33.5, 1), C(35.4, 40.4, 1), C(40.2, 40.2, 1), spark(30, 20, 2.4),
    ],
    adalat: [ // a flexed arm: the muscle gathered, ready to lift
      P('M6 26 C9 23 12.5 22 15.6 22 C17.8 15.6 26.4 14.8 29.4 21 L31.2 20 L30.2 12 C29.8 9 31.2 7 34 7 L38 7 C40.6 7 41.6 9 41.2 12 L40.2 30 C39.6 36 35 39 29 39 L6 38'),
      P('M30.6 12.6 L41 12.6'), P('M17 25.6 C19.4 28.4 23.6 28.6 26.6 26.6'), spark(13, 11, 2.4), spark(22, 44, 1.5),
    ],
    mafasil: [ // the knee: two bones that meet, the gap between them, and the cap in front
      P('M20 4 L20 15.5 C16 16.4 15.6 21.6 19.4 22.4 L28.6 22.4 C32.4 21.6 32 16.4 28 15.5 L28 4'),
      P('M20 44 L20 32.6 C16 32 16 27 19.6 26.6 L28.4 26.6 C32 27 32 32 28 32.6 L28 44'), E(36, 24.5, 2.4, 3.2), spark(10, 24.5, 2.2), spark(39.5, 10, 1.5),
    ],
    asabi: [ // an open hand, its fingers spread
      P('M20 43 C19 39 16.5 36 14 33 L10.5 28 C9.4 26.4 11.4 24.6 13 25.8 L18 30 L18 12.7 A1.7 1.7 0 0 1 21.4 12.7 L21.4 24 M21.4 24 L21.4 10.2 A1.7 1.7 0 0 1 24.8 10.2 L24.8 24 M24.8 24 L24.8 11.7 A1.7 1.7 0 0 1 28.2 11.7 L28.2 24.5 M28.2 24.5 L28.2 15.7 A1.7 1.7 0 0 1 31.6 15.7 L31.6 31 C31.6 36 30 40 29 43'),
      spark(37.5, 9.5, 2.4), spark(10, 15, 1.5),
    ],
    basma: [ // a fingerprint, no two the same
      P('M10 32 C9 24 11 16 17 12 C22 9 28 9 32 12'), P('M36 16 C38.5 20 39 26 38 31'), P('M14 36 C12 30 12 22 16 17 C20 12 28 12 32 17 C36 22 36 30 34 36'),
      P('M18 38.5 C16 32 16 24 19.5 20.5 C22 18 26 18 28.5 20.5 C32 24 31.5 31 30 37.5'), P('M22 39.5 C20.5 33 20 27 22 24.5 C23 23.3 25 23.3 26 24.5 C27.5 27 27.5 33 26 39.5'), P('M24 28 L24.4 35'),
    ],
    jufun: [ // a closed eye: the lid and its lashes
      P('M8 22 C14 30 34 30 40 22'), P('M11 18 C17 13 31 13 37 18'), P('M14.7 26.5 L12.5 30.8'), P('M19.2 27.6 L18.2 32.3'), P('M24 28 L24 33'), P('M28.8 27.6 L29.8 32.3'), P('M33.3 26.5 L35.5 30.8'),
      spark(24, 6.5, 2.4), spark(40, 38, 1.5),
    ],
    dumu: [ // an eye, and the tears that wash it
      P('M7 20 C13 11 35 11 41 20 C35 29 13 29 7 20 Z'), C(24, 20, 5), C(24, 20, 1.8), drop(20, 34, 1.2), drop(16.5, 41.5, 0.9), spark(37, 36, 2.2),
    ],
  });

  Object.assign(BY_BLESSING, {
    blessing_301: 'kabid', blessing_302: 'kulya', blessing_303: 'dimagh', blessing_304: 'asab', blessing_305: 'adalat', blessing_306: 'mafasil',
    blessing_307: 'asabi', blessing_308: 'basma', blessing_309: 'jufun', blessing_310: 'dumu',
  });
})();
