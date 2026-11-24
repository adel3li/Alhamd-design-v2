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
    nisyan: [ // an eraser lifting what weighed on the mind
      P('M18 30.5 L31.5 17 L40.5 26 L27 39.5 Z'), P('M22.6 26 L31.6 35'), P('M6.5 39.5 L22 39.5'), P('M6.5 34 L12 34'), C(15, 34, 0.5), C(18, 34, 0.4), spark(13, 13, 2.4), spark(38, 9, 1.5),
    ],
    ruya: [ // a cloud of sleep, the moon and stars over it
      P('M12.5 40 C7.5 40 6.4 33 10.8 31.4 C10.2 25 17.2 22.4 20.8 26 C22.8 20 32.2 20 33.2 27 C38.8 26.4 41.6 32 39.2 36 C40.2 39 38.2 40 36.2 40 Z'),
      P('M17 5 A6.6 6.6 0 1 0 23.6 14.4 A5.1 5.1 0 1 1 17 5 Z'), spark(32, 9, 2.4), spark(39.5, 17, 1.5), spark(27, 33, 1.5),
    ],
    qaylula: [ // a pillow at midday, the sun high, sleep coming
      P('M7.5 33 C7.5 27.8 11.6 27 24 27 C36.4 27 40.5 27.8 40.5 33 C40.5 38.2 36.4 39 24 39 C11.6 39 7.5 38.2 7.5 33 Z'), P('M7.5 33 L5 31 M7.5 33 L5 35 M40.5 33 L43 31 M40.5 33 L43 35'),
      C(14, 13, 3.8), P('M14 5.6 L14 7 M14 19 L14 20.4 M6.6 13 L8 13 M20 13 L21.4 13 M8.8 7.8 L9.8 8.8 M18.2 17.2 L19.2 18.2 M19.2 7.8 L18.2 8.8 M9.8 17.2 L8.8 18.2'),
      P('M28 8 L33.5 8 L28 14 L33.5 14'), P('M36 16 L39.5 16 L36 20 L39.5 20'),
    ],
    mashy: [ // footsteps on the way
      P('M16 24 C11.6 24 10 31 11.4 36.4 C12.8 42 20 42 20.8 36.4 C21.6 31 20.6 24 16 24 Z'), C(12.4, 19.6, 1.3), C(15.8, 18.4, 1.4), C(19.2, 19.8, 1.3),
      P('M32 10.5 C27.6 10.5 26 17.5 27.4 22.9 C28.8 28.5 36 28.5 36.8 22.9 C37.6 17.5 36.6 10.5 32 10.5 Z'), C(28.4, 6.1, 1.3), C(31.8, 4.9, 1.4), C(35.2, 6.3, 1.3), spark(38.5, 37, 2), spark(8, 10, 1.4),
    ],
    daw: [ // a lamp lit, its light spreading
      P('M18.4 29 C14 25.6 13.6 17 17.6 13.4 C21.4 10 26.6 10 30.4 13.4 C34.4 17 34 25.6 29.6 29 C28.4 30.2 28 31.6 28 33.4 L20 33.4 C20 31.6 19.6 30.2 18.4 29 Z'), P('M20.4 37 L27.6 37'), P('M21.8 40.6 L26.2 40.6'),
      P('M24 2.5 L24 6 M10.6 8.6 L13 11 M37.4 8.6 L35 11 M5.5 21.5 L9 21.5 M42.5 21.5 L39 21.5'), P('M21.4 22 C21.4 19.6 23 18 24.6 18'),
    ],
    samt: [ // a word held back: an empty bubble, a calm line
      P('M10 11 L38 11 C40 11 41 12 41 14 L41 28 C41 30 40 31 38 31 L22 31 L15.4 37.4 L16 31 L10 31 C8 31 7 30 7 28 L7 14 C7 12 8 11 10 11 Z'), P('M17 21 L31 21'), spark(36, 41, 2), spark(29, 44, 1.2),
    ],
    khalwa: [ // a niche alone, a single lamp in it
      P('M12 42 L12 20 C12 12 18 7 24 6 C30 7 36 12 36 20 L36 42'), P('M8 42 L40 42'), lantern(24, 14, 0.62), spark(42, 9, 1.6), spark(6, 14, 1.3),
    ],
    nudj: [ // a fruit grown full on its branch
      P('M5 10 C15 12.5 27 10.5 42 6'), P('M24 10.8 L24 16'), C(24, 27.5, 10.4), P('M20.6 17.6 L22.4 15.6 L24 17.2 L25.6 15.6 L27.4 17.6'),
      P('M32.5 8.4 C33.6 12.6 37.6 14.4 41 13.2 C40 9.2 36.4 7.4 32.5 8.4 Z'), P('M19 25 C19.8 22.6 21.6 21.4 23.4 21.2'), spark(39, 34, 2), spark(9, 34, 1.4),
    ],
    nizam: [ // a list, each thing in its place and done
      R(11, 9, 26, 34, 2.5), R(18, 6, 12, 5.6, 1.6), P('M16 19.6 L18 21.6 L21.6 17.6 M24.6 19.6 L32 19.6'), P('M16 27.6 L18 29.6 L21.6 25.6 M24.6 27.6 L32 27.6'), P('M16 35.6 L18 37.6 L21.6 33.6 M24.6 35.6 L32 35.6'), spark(41.5, 15, 1.8),
    ],
    lahm: [ // a cut of meat on its bone
      P('M9.5 22.5 C9.5 14.5 19.5 10 28.5 11 C36.5 12 41 18 40 25 C39 33 31 38.5 22 37.5 C14 36.5 9.5 30.5 9.5 22.5 Z'), C(30.6, 22.6, 3.6), P('M13.6 22.6 C13.6 17.4 19.6 14.2 26.6 14.6'), P('M7 43 L41 43'), spark(41, 6, 2),
    ],
    bayd: [ // eggs warm in their nest
      E(18.5, 23, 5.4, 7), E(29.5, 23.6, 5.4, 7), P('M7 27 C8 36 15 40.5 24 40.5 C33 40.5 40 36 41 27'), P('M7 27 C12 30.5 36 30.5 41 27'), P('M10 34 L16 32.6 M32 32.6 L38 34 M19 37.6 L25 35.8'), spark(39, 10, 2), spark(9, 13, 1.4),
    ],
    maabarid: [ // a glass of cold water, ice in it, drops on the side
      P('M12 9 L15 42.5 L33 42.5 L36 9'), P('M13 19.5 L35 19.5'), P('M17.4 24.4 L22.4 22.8 L24 27.8 L19 29.4 Z'), P('M25 30 L30 29 L31 34 L26 35 Z'), drop(40.5, 26, 0.9), drop(8, 33, 0.8), spark(41, 9, 1.8),
    ],
    halwa: [ // a sweet in its twisted wrapper
      E(24, 24, 8.4, 6.6), P('M15.8 22.4 L7.5 16.5 L7.5 31.5 L15.8 25.6'), P('M32.2 22.4 L40.5 16.5 L40.5 31.5 L32.2 25.6'), P('M21.6 17.8 C19.8 21.6 19.8 26.4 21.6 30.2'), P('M27.2 17.8 C25.4 21.6 25.4 26.4 27.2 30.2'), spark(35, 8, 2.2), spark(13, 40, 1.5),
    ],
    tawabil: [ // a mortar and pestle, the spices ground fresh
      P('M8 25 L40 25 C40 34.4 33 40.6 24 40.6 C15 40.6 8 34.4 8 25 Z'), P('M16.5 44 L31.5 44'), P('M26 25 L34.6 8.6 C35.6 6.6 38.8 7.8 37.9 10 L30.4 25'), C(14, 20.5, 1.1), C(19.5, 21.5, 1.1), C(16.8, 17, 1.1), spark(9, 9, 1.8),
    ],
    tahy: [ // a pot on the flame, steam rising from it
      R(9, 22, 30, 16, 3), P('M6.5 22 L41.5 22'), P('M21 22 C21 18.4 27 18.4 27 22'), P('M9 26.5 L5 26.5 M39 26.5 L43 26.5'),
      P('M18 44 C15.8 42.4 17 40 18 39.4 C19 40.6 20.4 42.2 18 44 Z M30 44 C27.8 42.4 29 40 30 39.4 C31 40.6 32.4 42.2 30 44 Z'), P('M16 15 C14 12 18 10 16 6.5'), P('M32 15 C30 12 34 10 32 6.5'),
    ],
    rizqwasi: [ // a basket full past its brim
      P('M8 25 L40 25 L36 41.5 L12 41.5 Z'), P('M10 31.5 L38 31.5 M18 25 L19.4 41.5 M30 25 L28.6 41.5'), C(16, 19.8, 4.8), C(25, 17.4, 5.6), C(33.6, 20.2, 4.4), P('M25 11.8 C25 9.4 26.6 7.6 28.6 7.2'), spark(42, 11, 2), spark(7, 11, 1.5),
    ],
    dakhl: [ // the month turning, and the wage that comes with it
      R(7, 11, 26, 25, 2.5), P('M13 7.5 L13 14 M27 7.5 L27 14'), P('M7 18.5 L33 18.5'), C(13, 24, 0.9), C(20, 24, 0.9), C(27, 24, 0.9), C(13, 30, 0.9), C(20, 30, 0.9),
      C(34, 33.5, 7.6), C(34, 33.5, 4.4),
    ],
    aswaq: [ // a market stall under its awning, goods laid out
      P('M9 10 L39 10 L42 18 L6 18 Z'), P('M6 18 C6 22 12 22 12 18 C12 22 18 22 18 18 C18 22 24 22 24 18 C24 22 30 22 30 18 C30 22 36 22 36 18 C36 22 42 22 42 18'),
      P('M9 21 L9 42 M39 21 L39 42'), P('M6 34 L42 34'), C(16, 31, 2.6), C(23.5, 31, 2.6), C(31, 31, 2.6), P('M5 42 L43 42'),
    ],
    hirfa: [ // a hammer at its work, a nail driven home
      P('M22 17 L26 13 L35 22 L31 26 Z'), P('M26.5 21.5 L10.5 37.5 C9.5 38.5 9.5 40 10.5 41 C11.5 42 13 42 14 41 L29 26'), P('M37.5 34 L37.5 43 M34.5 34 L40.5 34'), spark(41, 10, 2), spark(10, 12, 1.5),
    ],
    ziraa: [ // furrows sown, the shoots up, the sun over them
      P('M4.5 41 C15 37 33 37 43.5 41'), P('M8 34 C17 31 31 31 40 34'), P('M16 32.2 L16 26 M16 28.8 C13.4 28.8 12 26.8 12.2 24.6 C14.6 24.6 16 26.4 16 28.8 Z'), P('M32 32.2 L32 26 M32 28.8 C34.6 28.8 36 26.8 35.8 24.6 C33.4 24.6 32 26.4 32 28.8 Z'),
      P('M24 31 L24 22.6 M24 25.6 C21.2 25.6 19.6 23.4 19.8 21 C22.4 21 24 23 24 25.6 Z M24 25.6 C26.8 25.6 28.4 23.4 28.2 21 C25.6 21 24 23 24 25.6 Z'), C(24, 10, 3.6), P('M24 3 L24 4.4 M17 10 L18.4 10 M29.6 10 L31 10 M19 5 L20 6 M29 5 L28 6'),
    ],
    sayd: [ // a fish rising to the line
      P('M8 27 C14 19 26 19 32 27 C26 35 14 35 8 27 Z'), P('M32 27 L40 21 L40 33 Z'), C(14, 26, 1), P('M30 4 L30 12.5 C30 16 25.6 16 25.6 12.6'), P('M5 42 C9 40 13 44 17 42 C21 40 27 44 31 42 C35 40 39 44 43 42'), spark(40, 9, 1.8),
    ],
    rai: [ // a sheep at pasture
      P('M13 31 C9 31 8 26 11 24.5 C10.5 20 15.5 18 18 20.5 C20 16.5 27 16.5 28.5 20.5 C32 19 36 22 34.5 25.5 C37 27.5 35.5 31.5 32 31 Z'), E(37.6, 22.4, 3.2, 4.4),
      P('M15 31 L15 37.5 M20 31 L20 37.5 M26 31 L26 37.5 M31 31 L31 37.5'), P('M5 41.5 L43 41.5'), P('M9 41.5 L8 38.5 M10.5 41.5 L11 38.2 M38 41.5 L37 38.5 M39.5 41.5 L40 38.2'), spark(9, 10, 1.8), spark(40, 10, 1.4),
    ],
    iftar: [ // the sun going down, the cup and the dates ready
      P('M6 29 L42 29'), P('M14.5 29 A9.5 9.5 0 0 1 33.5 29'), P('M24 14 L24 16.5 M13.6 18.6 L15.4 20.4 M34.4 18.6 L32.6 20.4 M8.6 24.4 L11 25.2 M39.4 24.4 L37 25.2'),
      P('M11 33 L12.4 43 L19.6 43 L21 33 Z'), E(28.6, 40, 3.6, 2.2), E(36, 39, 3.6, 2.2),
    ],
    suhur: [ // a bowl before dawn, the stars still out
      P('M9 29 C9 36 15.5 41 24 41 C32.5 41 39 36 39 29 Z'), P('M15 44 L33 44'), P('M29 29 L36 19'), E(37.4, 17, 1.8, 2.8), 
      P('M20 5 A7 7 0 1 0 27 15 A5.4 5.4 0 1 1 20 5 Z'), spark(9, 12, 2), spark(36, 7, 1.6), spark(14, 21, 1.3),
    ],
    hifzni: [ // a jar sealed, what was given kept with care
      R(14, 8.5, 20, 5.5, 1.6), P('M16 14 C10.5 18 10.5 38 16 42 L32 42 C37.5 38 37.5 18 32 14'), P('M13.6 20 L34.4 20'), heart(24, 31, 6.4), spark(41, 9, 1.8),
    ],
    maabayt: [ // a house, and water coming into it from the tap
      P('M7 22 L24 8.5 L41 22'), P('M11 19 L11 42 L37 42 L37 19'), P('M16 26 L28 26 C30.2 26 31 27 31 29 L31 30.6'), P('M28.4 30.6 L33.6 30.6'), P('M20.6 22.6 L20.6 26'), drop(31, 36.4, 1.1), P('M5 42 L43 42'),
    ],
    idrak: [ // a mind taking in the world: a point, and the rings that reach it
      C(24, 24, 3.2), P('M17.6 17.6 A9 9 0 0 0 17.6 30.4 M30.4 17.6 A9 9 0 0 1 30.4 30.4'), P('M13.4 13.4 A15 15 0 0 0 13.4 34.6 M34.6 13.4 A15 15 0 0 1 34.6 34.6'), spark(24, 7, 2.4), spark(24, 41, 1.6),
    ],
    intibah: [ // the arrow on the mark
      C(21, 27, 14), C(21, 27, 9), C(21, 27, 4), P('M21 27 L38 10'), P('M38 10 L38 4.5 M38 10 L43.5 10 M35 13 L35 7.5 M35 13 L40.5 13'),
    ],
    hisab: [ // an abacus, its beads counted
      R(8, 9, 32, 30, 2), P('M8 17 L40 17 M8 24 L40 24 M8 31 L40 31'), C(13, 17, 2), C(17.4, 17, 2), C(32, 17, 2), C(13, 24, 2), C(28, 24, 2), C(32.4, 24, 2), C(13, 31, 2), C(17.4, 31, 2), C(21.8, 31, 2), C(32.4, 31, 2), P('M11 39 L9 44 M37 39 L39 44'),
    ],
    lughat: [ // two voices, two scripts, one meaning
      P('M8 7 L26 7 C27.7 7 29 8.3 29 10 L29 18 C29 19.7 27.7 21 26 21 L14 21 L9.6 25.4 L10 21 L8 21 C6.3 21 5 19.7 5 18 L5 10 C5 8.3 6.3 7 8 7 Z'), P('M10 14 L13 14 M15.5 11 L15.5 17 M18.5 14 L24 14'),
      P('M40 25 L22 25 C20.3 25 19 26.3 19 28 L19 36 C19 37.7 20.3 39 22 39 L34 39 L38.4 43.4 L38 39 L40 39 C41.7 39 43 37.7 43 36 L43 28 C43 26.3 41.7 25 40 25 Z'), P('M24 32 C26 29.5 28 34.5 30 32 C32 29.5 34 34.5 36 32 L38 30'),
    ],
    kutub: [ // books stacked, one open on top
      R(7.5, 35, 31, 7, 1.5), R(10.5, 28, 29, 7, 1.5), R(8.5, 21, 27, 7, 1.5), P('M12.5 35 L12.5 42 M35.5 28 L35.5 35 M13 21 L13 28'),
      P('M23 15 C20 12.6 15.6 12.4 12 13.2 L12 21 M23 15 C26 12.6 30.4 12.4 34 13.2 L34 21 M23 15 L23 21'), spark(40, 9, 1.8), spark(42, 22, 1.2),
    ],
    ibda: [ // a pencil, and the spark it draws
      P('M14 34 L31 17 L36.6 22.6 L19.6 39.6 Z'), P('M14 34 L10.6 43 L19.6 39.6'), P('M28.4 19.6 L34 25.2'), P('M11.6 39.6 L14 42'),
      spark(15, 13, 3.4), spark(39, 37, 2), spark(24, 6, 1.6),
    ],
    hall: [ // the piece that fits
      P('M9 13 L18.5 13 C18.5 8.6 25.5 8.6 25.5 13 L35 13 L35 22.5 C39.4 22.5 39.4 29.5 35 29.5 L35 39 L25.5 39 C25.5 34.6 18.5 34.6 18.5 39 L9 39 L9 29.5 C13.4 29.5 13.4 22.5 9 22.5 Z'), spark(22, 26, 3), spark(41, 9, 1.6),
    ],
    talum: [ // steps that keep going up, a light at the top
      P('M6 41 L14 41 L14 34 L22 34 L22 27 L30 27 L30 20 L38 20 L38 13'), P('M6 41 L42 41'), P('M10 24 L22 12 M22 12 L16.6 12 M22 12 L22 17.4'), spark(38, 6.5, 2.6), spark(42.5, 26, 1.4),
    ],
    fitna: [ // a key that finds its lock
      C(14, 24, 6.4), C(14, 24, 2.4), P('M20.4 24 L41 24'), P('M34.5 24 L34.5 29.5 M39 24 L39 31'), spark(28, 13, 2.6), spark(38, 10, 1.5), spark(10, 37, 1.4),
    ],
    hiwar: [ // two voices turned toward each other, listening
      P('M17 7 C10.4 7 5.5 11.2 5.5 16.6 C5.5 19.6 7 22.2 9.4 24 L8.4 29 L13.6 26 C14.7 26.2 15.8 26.3 17 26.3 C23.6 26.3 28.5 22 28.5 16.6 C28.5 11.2 23.6 7 17 7 Z'),
      P('M31 21.7 C37.6 21.7 42.5 25.9 42.5 31.3 C42.5 34.3 41 36.9 38.6 38.7 L39.6 43.7 L34.4 40.7 C33.3 40.9 32.2 41 31 41 C24.4 41 19.5 36.7 19.5 31.3'),
      C(12.4, 16.6, 1), C(17, 16.6, 1), C(21.6, 16.6, 1), C(26.4, 31.3, 0.8), C(31, 31.3, 0.8), C(35.6, 31.3, 0.8),
    ],
    basira: [ // a heart that sees
      heart(24, 26, 15.5), P('M14.6 22.4 C18.6 17.4 29.4 17.4 33.4 22.4 C29.4 27.4 18.6 27.4 14.6 22.4 Z'), C(24, 22.4, 2.4), spark(40, 7, 2), spark(8, 8, 1.4),
    ],
    takhtit: [ // a route drawn from here to the flag
      C(10, 37, 2.6), P('M12.4 35.6 C19 31 13.6 24.4 21.6 21.6 C29 19 28.6 14.6 33.6 12.4'), P('M35 13 L35 4.5 L42 7 L35 9.6'), P('M33 13 L37 13'),
      P('M21 37 L25 41 M25 37 L21 41'), P('M33.4 29 L37.4 33 M37.4 29 L33.4 33'), P('M6 44 L42 44'),
    ],
    iktishaf: [ // a lens, and the star found under it
      C(20, 20, 11), P('M27.8 27.8 L38.4 38.4 C39.4 39.4 41 39.4 42 38.4 C43 37.4 43 35.8 42 34.8 L31.4 24.2'), spark(20, 20, 5), spark(9, 39, 1.8), spark(40, 9, 1.5),
    ],
    tadris: [ // a board on its easel, the lesson on it
      R(7.5, 7, 33, 23, 2), P('M13 30 L9.5 43 M35 30 L38.5 43 M24 30 L24 40'), P('M12.5 14.5 L25 14.5 M12.5 20.5 L21 20.5'), spark(33, 18, 3.2), P('M5.5 30 L42.5 30'),
    ],
  });

  Object.assign(BY_BLESSING, {
    blessing_301: 'kabid', blessing_302: 'kulya', blessing_303: 'dimagh', blessing_304: 'asab', blessing_305: 'adalat', blessing_306: 'mafasil',
    blessing_307: 'asabi', blessing_308: 'basma', blessing_309: 'jufun', blessing_310: 'dumu',
    blessing_311: 'araq', blessing_312: 'luab', blessing_313: 'shahiya', blessing_314: 'iltiam', blessing_315: 'haml', blessing_316: 'numuw',
    blessing_317: 'nashat', blessing_318: 'sihhanafs', blessing_319: 'shaar', blessing_320: 'ism',
    blessing_321: 'khususiya', blessing_322: 'hurriya', blessing_323: 'sukun', blessing_324: 'nazafa', blessing_325: 'maadafi', blessing_326: 'kuhula',
    blessing_327: 'shaykhukha', blessing_328: 'ijaza', blessing_329: 'hiwaya', blessing_330: 'laib',
    blessing_331: 'nisyan', blessing_332: 'ruya', blessing_333: 'qaylula', blessing_334: 'mashy', blessing_335: 'daw', blessing_336: 'samt',
    blessing_337: 'khalwa', blessing_338: 'nudj', blessing_339: 'nizam', blessing_340: 'lahm',
    blessing_341: 'bayd', blessing_342: 'maabarid', blessing_343: 'halwa', blessing_344: 'tawabil', blessing_345: 'tahy', blessing_346: 'rizqwasi',
    blessing_347: 'dakhl', blessing_348: 'aswaq', blessing_349: 'hirfa', blessing_350: 'ziraa',
    blessing_351: 'sayd', blessing_352: 'rai', blessing_353: 'iftar', blessing_354: 'suhur', blessing_355: 'hifzni', blessing_356: 'maabayt',
    blessing_357: 'idrak', blessing_358: 'intibah', blessing_359: 'hisab', blessing_360: 'lughat',
    blessing_361: 'kutub', blessing_362: 'ibda', blessing_363: 'hall', blessing_364: 'talum', blessing_365: 'fitna', blessing_366: 'hiwar',
    blessing_367: 'basira', blessing_368: 'takhtit', blessing_369: 'iktishaf', blessing_370: 'tadris',
  });
})();
