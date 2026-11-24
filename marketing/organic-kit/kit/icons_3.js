/*
 * Alhamd organic kit — line icons for blessings 201–300 (hundred 3), in the style of icons.js:
 * 48-unit grid, one thin stroke, round caps, no faces or people. Loaded after icons.js; adds to ICONS.I and ICONS.BY_BLESSING.
 * One file per hundred, so the sessions drawing different hundreds never edit the same file.
 */
(function () {
  const { I, BY_BLESSING, H } = window.ICONS;
  const { f, P, C, E, R, spark, heart, tree, lantern, ring, drop } = H; // eslint-disable-line no-unused-vars

  Object.assign(I, {
    wahy: [ // the cave on the mountain, and light coming down on it
      P('M4 41 L16 20 L21 25 L29 12 L44 41'), P('M2.5 41 L45.5 41'), P('M23.5 41 L23.5 36.5 C23.5 34 25 32.5 26.75 32.5 C28.5 32.5 30 34 30 36.5 L30 41'),
      P('M29 3.5 L29 8'), P('M22.5 5.5 L25 9'), P('M35.5 5.5 L33 9'),
    ],
    malaika: [ // a pair of wings, and light between them
      P('M23 28 C19 18 12 12.5 5 11.5 C6.5 15 8 17 10 18.5 C8 19.5 8 22 9.5 23.5 C9 25.5 10 27.5 12 28.5 C15 30.2 19.5 30 23 28 Z'),
      P('M25 28 C29 18 36 12.5 43 11.5 C41.5 15 40 17 38 18.5 C40 19.5 40 22 38.5 23.5 C39 25.5 38 27.5 36 28.5 C33 30.2 28.5 30 25 28 Z'),
      P('M10 18.5 C14 19.5 18 22.5 21 26'), P('M38 18.5 C34 19.5 30 22.5 27 26'), P('M9.5 23.5 C13.5 24.8 17 26.5 20 28.4'), P('M38.5 23.5 C34.5 24.8 31 26.5 28 28.4'),
      spark(24, 13, 3), spark(24, 38, 2), spark(15, 37, 1.3), spark(33, 37, 1.3),
    ],
    imanghayb: [ // a curtain drawn shut, and light through its parting
      P('M5.5 9 L42.5 9'), P('M8.5 9 L8.5 41 L22.6 41 C21 30 21 20 22.6 9'), P('M39.5 9 L39.5 41 L25.4 41 C27 30 27 20 25.4 9'),
      P('M15.5 9 C14.5 20 16.5 30 15 41'), P('M32.5 9 C33.5 20 31.5 30 33 41'),
      `<path class="fill soft" d="M24 11 C25.3 20 25.3 30 24 39 C22.7 30 22.7 20 24 11 Z"/>`, spark(24, 25, 3),
    ],
    yaqin: [ // a lamp whose flame stands straight
      P('M14 32 L38 32'), P('M14 32 C14 37.5 19 40.5 26 40.5 C33 40.5 38 37.5 38 32'), P('M19 32 C16.5 29.5 12.5 28.5 8.5 28 C10.5 30 12 31.5 14 32'),
      P('M25 32 C25 30.2 31 30.2 31 32'), P('M38 33 C42.5 33 43 27.5 39.5 27.5 C38.5 27.5 37.8 28.6 37.6 30'), P('M20 40 L19 43.5 L33 43.5 L32 40'),
      drop(8.5, 21.5, 1.7), P('M8.5 9 L8.5 12'), P('M3 14 L5 15.5'), P('M14 14 L12 15.5'),
    ],
    khashya: [ // a tear, and a heart held in it
      drop(24, 25, 5), heart(24, 30.5, 6), P('M8.5 20 C7 23 7 27 8.5 30'), P('M39.5 20 C41 23 41 27 39.5 30'), P('M4.5 17.5 C2.5 22 2.5 28 4.5 32.5'), P('M43.5 17.5 C45.5 22 45.5 28 43.5 32.5'),
    ],
    raja: [ // a shoot under the cloud it waits on
      P('M8 40 L40 40'), P('M24 40 C24 35 24 31 24 27'), P('M24 32 C19 32 15.5 29 15 24 C20 24 23.5 27 24 32 Z'), P('M24 27.5 C24.5 23 27.5 20.5 32 20.5 C31.5 24.5 28.5 27.5 24 27.5 Z'),
      P('M27 15 L41 15 C43.5 15 44.5 12.5 43 10.6 C42 9.4 40.6 9.2 39.6 9.6 C39 6.6 36.4 5 33.6 5.4 C31 5.8 29.4 7.8 29.2 10 C27.4 10 26 11.5 26 13 C26 14.2 26.5 15 27 15 Z'),
      drop(35.5, 19.5, 0.75), drop(40.5, 21, 0.75), spark(12, 12, 1.8),
    ],
    hajj: [ // the tents of the pilgrims
      P('M3 41 L45 41'), P('M16 41 L24 25 L32 41'), P('M21.5 41 L24 36 L26.5 41'), P('M24 25 L24 21.5'), C(24, 20.2, 1.2),
      P('M4 41 L10 30.5 L16 41'), P('M10 30.5 L10 28'), P('M32 41 L38 30.5 L44 41'), P('M38 30.5 L38 28'),
      spark(36.5, 13, 2.2), spark(12, 16, 1.5), spark(28, 9, 1.3),
    ],
    umra: [ // the House, and the circling around it with its turn
      P('M17 19 L24 16 L31 19 L31 30 L24 33 L17 30 Z'), P('M17 19 L24 22 L31 19'), P('M24 22 L24 33'), P('M17 22 L24 25 L31 22'),
      P('M7 31 A17 7 0 0 0 41 31'), P('M38.4 32.2 L41 29.2 L43.4 32.4'), spark(24, 7.5, 2.6), spark(10, 13, 1.4), spark(38, 12, 1.4),
    ],
    fajr: [ // the sun at the edge of the earth, the last stars going
      P('M5 36 L43 36'), P('M15 36 A9 9 0 0 1 33 36'), P('M24 22.5 L24 18.5'), P('M14.5 26.5 L11.8 23.8'), P('M33.5 26.5 L36.2 23.8'), P('M10.5 32.2 L7 31'), P('M37.5 32.2 L41 31'),
      P('M12 40.5 L36 40.5'), P('M18 44.5 L30 44.5'), spark(10, 11, 1.8), spark(38, 8, 1.4), spark(28, 6, 1),
    ],
    sujud: [ // the place of prostration, and the nearness rising from it
      P('M6 41 L42 41 L37.5 34.5 L10.5 34.5 Z'), P('M19 41 L20.2 38.2 C21 36.8 22.4 36.2 24 36 C25.6 36.2 27 36.8 27.8 38.2 L29 41'),
      P('M24 30 L24 22'), P('M17.5 30.5 L14 24'), P('M30.5 30.5 L34 24'), spark(24, 14.5, 3.2), spark(12.5, 16, 1.5), spark(35.5, 16, 1.5),
    ],
  });

  Object.assign(BY_BLESSING, {
    blessing_201: 'wahy', blessing_202: 'malaika', blessing_203: 'imanghayb', blessing_204: 'yaqin', blessing_205: 'khashya', blessing_206: 'raja',
    blessing_207: 'hajj', blessing_208: 'umra', blessing_209: 'fajr', blessing_210: 'sujud',
  });
})();
