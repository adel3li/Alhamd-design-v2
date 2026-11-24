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
    araq: [ // drops of sweat under a hot sun, the body cooling itself
      C(35, 12, 4.4), P('M35 3.6 L35 5.2 M35 18.8 L35 20.4 M26.6 12 L28.2 12 M41.8 12 L43.4 12 M29.1 6.1 L30.2 7.2 M39.8 16.8 L40.9 17.9 M40.9 6.1 L39.8 7.2 M30.2 16.8 L29.1 17.9'),
      drop(16, 20, 1.7), drop(25, 29, 1.4), drop(15, 37, 1.1), P('M8 43.5 L40 43.5'), spark(33, 36, 1.8),
    ],
    luab: [ // a bowl of food, and the drop that makes it easy to taste
      P('M8.5 27 C8.5 35.5 15.5 40.5 24 40.5 C32.5 40.5 39.5 35.5 39.5 27 Z'), P('M15 44 L33 44'), P('M14 23 C17 19.5 21 22 24 19.5 C27 22 31 19.5 34 23'), drop(24, 10, 1.6), spark(36, 11, 2), spark(12, 13, 1.4),
    ],
    shahiya: [ // a plate set between fork and spoon, waiting
      C(24, 26, 10.5), C(24, 26, 6.6), P('M8.5 10 L8.5 16.5 C8.5 19 12.5 19 12.5 16.5 L12.5 10 M10.5 10 L10.5 42'), E(38.5, 14.5, 2.8, 4.4), P('M38.5 19 L38.5 42'), spark(24, 8, 1.8),
    ],
    iltiam: [ // a bandage over the wound as it closes
      P('M8.5 30.5 L30.5 8.5 C32.5 6.5 36 6.5 38 8.5 L39.5 10 C41.5 12 41.5 15.5 39.5 17.5 L17.5 39.5 C15.5 41.5 12 41.5 10 39.5 L8.5 38 C6.5 36 6.5 32.5 8.5 30.5 Z'),
      P('M18.5 24 L24 18.5 L29.5 24 L24 29.5 Z'), C(22.2, 22.2, 0.5), C(25.8, 25.8, 0.5), C(25.8, 22.2, 0.5), C(22.2, 25.8, 0.5), spark(38.5, 34, 2.4), spark(10, 12, 1.5),
    ],
    haml: [ // a cradle that rocks, and a heart over it
      P('M9 22 C9 31.5 15.5 37 24 37 C32.5 37 39 31.5 39 22 Z'), P('M9 22 C9 16 13 12 18 11.4'), P('M12 43 C19.5 38.5 28.5 38.5 36 43'), P('M17 37 L15.5 40.4 M31 37 L32.5 40.4'),
      heart(30.5, 13, 5.2), spark(39.5, 7, 1.6), spark(21.5, 27, 1.4),
    ],
    numuw: [ // a seedling grown taller beside the marks of its growth
      P('M7.5 42 L40.5 42'), P('M11 42 L11 8 M11 34 L14 34 M11 26 L14 26 M11 18 L14 18 M11 10 L14 10'),
      P('M28 42 L28 14'), P('M28 30 C22.5 30.6 19.4 27 19.6 22.4 C24.6 22.2 28 25.4 28 30 Z'), P('M28 22.5 C33.5 23.1 36.6 19.5 36.4 14.9 C31.4 14.7 28 17.9 28 22.5 Z'), P('M28 14 C26.6 11.4 27 8.6 28.4 6.6'), spark(38, 33, 1.8),
    ],
    nashat: [ // a full battery, charged with light
      R(8.5, 15, 28, 18, 3.4), R(36.5, 20.5, 3.6, 7, 1.2), P('M25 18.5 L18.5 25.2 L24.4 25.2 L21.6 30'), spark(12, 8, 2.2), spark(38, 40, 1.6), P('M14 40 L30 40'),
    ],
    sihhanafs: [ // a heart at peace, a shoot rising in it
      heart(24, 27.5, 15), P('M24 35 L24 23'), P('M24 28.5 C19.6 28.6 17.2 25.6 17.4 22 C21.4 22 24 24.8 24 28.5 Z'), P('M24 25 C28.4 25.1 30.8 22.1 30.6 18.5 C26.6 18.5 24 21.3 24 25 Z'), spark(39.5, 8, 2.2), spark(8.5, 9.5, 1.5),
    ],
    shaar: [ // a comb, and the shine it leaves
      R(7.5, 16, 33, 7.5, 2.4), P('M11 23.5 L11 36 M14.5 23.5 L14.5 36 M18 23.5 L18 36 M21.5 23.5 L21.5 36 M25 23.5 L25 36 M28.5 23.5 L28.5 36 M32 23.5 L32 36 M35.5 23.5 L35.5 36'), spark(36, 8, 2.4), spark(12, 42, 1.5), spark(29, 42.5, 1.2),
    ],
    ism: [ // a name written well on a card, the pen beside it
      R(6.5, 13, 28, 22, 3), P('M11.5 21 C14.5 18.5 17.5 23.5 20.5 21 C23.5 18.5 26.5 23.5 29.5 21'), P('M11.5 28 L22 28'),
      P('M40.5 9 L36.5 13 L31 30.5 L28.6 33 L29.2 29.6 L36.5 13 M38.5 11 L41.5 14'), spark(10.5, 41, 2), spark(40, 38, 1.5),
    ],
    khususiya: [ // a window, its curtains drawn
      P('M6.5 8 L41.5 8'), R(10, 8, 28, 30, 1.5), P('M10 8 C16.5 15.5 17 27 12.5 38'), P('M38 8 C31.5 15.5 31 27 35.5 38'), P('M24 8 L24 38'), P('M7.5 42 L40.5 42'), spark(24, 23, 2.2),
    ],
    hurriya: [ // an open cage, and the bird that has flown it
      P('M5.5 43 L26.5 43'), P('M8 43 L8 24 C8 16.5 12.5 12 16 12 C19.5 12 24 16.5 24 24 L24 30 M24 40 L24 43'), P('M12 43 L12 18.5 M16 43 L16 12 M20 43 L20 18.5'), P('M16 12 L16 7.5'), P('M24 30 L30.5 33 L30.5 41.5 L24 40'),
      P('M30 15 C32.4 12.2 34.6 12.2 36 15 C37.4 12.2 39.6 12.2 42 15'), P('M34 24 C35.6 22.2 37 22.2 38 24 C39 22.2 40.4 22.2 42 24'), spark(36.5, 6.5, 1.6),
    ],
    sukun: [ // still water under the moon
      P('M24 5 A9 9 0 1 0 33 17.6 A7 7 0 1 1 24 5 Z'), P('M7 32 L41 32'), P('M12 37.5 L36 37.5'), P('M17.5 43 L30.5 43'), spark(37, 9, 2), spark(11, 13, 1.4),
    ],
    nazafa: [ // a bar of soap and its bubbles
      R(7.5, 26, 25, 14, 5), P('M13 33 L27 33'), C(31, 16, 4.6), C(38.5, 24, 2.6), C(21.5, 14.5, 2.4), C(26, 7, 1.6), spark(39, 9, 2), P('M7.5 44 L32.5 44'),
    ],
    maadafi: [ // a cup of warm water, its steam rising
      P('M10 20 L12.4 39.6 C12.7 41.8 14.4 43 16.6 43 L28.4 43 C30.6 43 32.3 41.8 32.6 39.6 L35 20 Z'), P('M34.4 25 C40.6 24.6 41 34.4 33.4 34.2'),
      P('M16.5 15.5 C14.5 12.5 18.5 10 16.5 6'), P('M22.5 15.5 C20.5 12.5 24.5 10 22.5 6'), P('M28.5 15.5 C26.5 12.5 30.5 10 28.5 6'), P('M14 27 L31 27'),
    ],
    kuhula: [ // a tree in its full years, heavy with fruit
      tree(24, 6, 30, 25, 42.5), P('M24 34 L18.6 28.6 M24 36.5 L29.6 30.6'), C(16, 16, 1.7), C(29, 13.5, 1.7), C(33, 22, 1.7), C(20.5, 23.5, 1.7), P('M9 42.5 L39 42.5'),
    ],
    shaykhukha: [ // reading glasses resting on an open book
      C(17, 14.5, 5.6), C(31, 14.5, 5.6), P('M22.6 14.5 C23.4 13 24.6 13 25.4 14.5'), P('M11.4 13.5 L7 11.5 M36.6 13.5 L41 11.5'),
      P('M24 28 C20 25.5 13 25 8 26 L8 40 C13 39 20 39.5 24 42 C28 39.5 35 39 40 40 L40 26 C35 25 28 25.5 24 28 Z'), P('M24 28 L24 42'), spark(42, 31, 1.4),
    ],
    ijaza: [ // a sunshade by the sea, the sun overhead
      P('M8 23 C9 14.5 16 9.5 24 9.5 C32 9.5 39 14.5 40 23 C37 21 34 21 32 23 C30 21 26 21 24 23 C22 21 18 21 16 23 C14 21 11 21 8 23 Z'), P('M24 9.5 L24 6.5 M24 23 L24 41'),
      P('M5 41 C9 39 13 43 17 41 C21 39 27 43 31 41 C35 39 39 43 43 41'), C(39.5, 33, 2.4), spark(9, 33, 1.6),
    ],
    hiwaya: [ // a painter's palette, its colours ready
      P('M24 8 C13 8 7 16 7 24 C7 33 14 40 22 40 C26 40 26.4 36.4 24.4 34.2 C22.4 32 23.4 29 27 29 L32 29 C37 29 41 26 41 21 C41 13 33 8 24 8 Z'), C(15.6, 18, 2.2), C(23.6, 14, 2.2), C(31.6, 16.6, 2.2), C(14.6, 27, 2.2),
      P('M43 31 L33.5 40.5'), P('M33.5 40.5 C31.5 40.5 30.6 42.6 29.4 44 C32 44 34.6 43.4 34.6 41.6 Z'), 
    ],
    laib: [ // a kite in the wind, its tail tied with bows
      P('M30 5 L40.5 16 L30 30 L19.5 16 Z'), P('M30 5 L30 30 M19.5 16 L40.5 16'), P('M30 30 C26 33.5 30 37.5 24 39.5 C19.5 41 18 43.5 12 44'),
      P('M26.4 34.2 L23.6 32.6 L24.4 36 Z M20.6 40.4 L18.6 38 L18 41.4 Z'), spark(10, 10, 2.2), spark(41, 35, 1.5),
    ],
  });

  Object.assign(BY_BLESSING, {
    blessing_301: 'kabid', blessing_302: 'kulya', blessing_303: 'dimagh', blessing_304: 'asab', blessing_305: 'adalat', blessing_306: 'mafasil',
    blessing_307: 'asabi', blessing_308: 'basma', blessing_309: 'jufun', blessing_310: 'dumu',
    blessing_311: 'araq', blessing_312: 'luab', blessing_313: 'shahiya', blessing_314: 'iltiam', blessing_315: 'haml', blessing_316: 'numuw',
    blessing_317: 'nashat', blessing_318: 'sihhanafs', blessing_319: 'shaar', blessing_320: 'ism',
    blessing_321: 'khususiya', blessing_322: 'hurriya', blessing_323: 'sukun', blessing_324: 'nazafa', blessing_325: 'maadafi', blessing_326: 'kuhula',
    blessing_327: 'shaykhukha', blessing_328: 'ijaza', blessing_329: 'hiwaya', blessing_330: 'laib',
  });
})();
