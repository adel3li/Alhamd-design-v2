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
    tilawa: [ // an open mushaf, and the voice rising from it
      P('M24 19 C20 16 14 15.5 8 16.5 L8 37 C14 36 20 36.5 24 39.5'), P('M24 19 C28 16 34 15.5 40 16.5 L40 37 C34 36 28 36.5 24 39.5'), P('M24 19 L24 39.5'),
      P('M11.5 22 L20.5 22.8 M11.5 26.5 L20.5 27.2 M11.5 31 L18 31.5'), P('M36.5 22 L27.5 22.8 M36.5 26.5 L27.5 27.2 M36.5 31 L30 31.5'),
      spark(24, 9, 2.8), spark(15, 8, 1.6), spark(33, 8, 1.6), spark(29, 3.5, 1.1),
    ],
    hifzquran: [ // a heart, and the book kept inside it
      heart(24, 28, 15), P('M24 24.5 C21.5 22.8 18.5 22.5 16 23 L16 30.5 C18.5 30 21.5 30.3 24 32'), P('M24 24.5 C26.5 22.8 29.5 22.5 32 23 L32 30.5 C29.5 30 26.5 30.3 24 32'), P('M24 24.5 L24 32'),
      spark(37.5, 9, 2.2), spark(10.5, 9.5, 1.5),
    ],
    sahaba: [ // lamps hung in a row: the light handed on
      P('M5 8 L43 8'), P('M24 8 L24 10'), lantern(24, 10, 0.8), P('M11 8 L11 16'), lantern(11, 16, 0.6), P('M37 8 L37 16'), lantern(37, 16, 0.6),
    ],
    ulama: [ // books stacked, and a lamp set on them
      R(9, 35, 30, 6, 1), R(12, 29, 24, 6, 1), P('M14 38 L34 38'), P('M16 32 L32 32'), lantern(24, 7.5, 0.6),
      P('M14.5 15 L11 13.8'), P('M33.5 15 L37 13.8'), P('M14 21.5 L10.5 22'), P('M34 21.5 L37.5 22'),
    ],
    shafaa: [ // a word spoken for you: a bubble with a heart in it
      P('M10 9 L38 9 C40.8 9 42.5 10.8 42.5 13.5 L42.5 29 C42.5 31.7 40.8 33.5 38 33.5 L22 33.5 L14 40.5 L15.5 33.5 L10 33.5 C7.2 33.5 5.5 31.7 5.5 29 L5.5 13.5 C5.5 10.8 7.2 9 10 9 Z'),
      heart(24, 22.5, 7.5), spark(39, 41, 1.8), spark(32.5, 43, 1.2),
    ],
    afwallah: [ // a heavy cloud that comes apart into light
      P('M8 31 L26 31 C29.5 31 31 27.5 29 25 C28 23.6 26.4 23.2 25 23.6 C24.4 19.5 21 17.5 17.6 18 C14.4 18.5 12.4 21 12.2 23.8 C9.6 23.8 7.6 25.6 7.6 28 C7.6 29.6 7.8 31 8 31 Z'),
      spark(34, 22, 2.4), spark(39.5, 15, 1.8), spark(42.5, 24, 1.3), spark(37, 30, 1.2), spark(31, 13, 1.2), P('M10 38 L38 38'),
    ],
    mahiya: [ // a wave that smooths the marks in the sand
      P('M4 25 C9 21 13.5 21 18 24 C22.5 27 26 27 30 24 C34 21 38.5 21 44 25'), P('M8 31 C12 28.5 15.5 28.5 19 30.5'), P('M5 40 L43 40'),
      C(30, 34.5, 0.9), C(35, 35.5, 0.9), C(40, 34.5, 0.9), spark(24, 11, 3), spark(13, 10, 1.5), spark(35, 9.5, 1.5),
    ],
    qabul: [ // a chest that keeps what is put in it
      R(9.5, 24, 29, 17, 2), P('M9.5 24 C9.5 17.5 14.5 14.5 24 14.5 C33.5 14.5 38.5 17.5 38.5 24'), P('M9.5 30 L38.5 30'), R(21.5, 27.5, 5, 5.5, 1), heart(24, 37.2, 2.6),
      spark(24, 7.5, 2.4), spark(14, 9.5, 1.4), spark(34, 9.5, 1.4),
    ],
    jariya: [ // a tree, and the water that keeps running under it
      tree(24, 6, 26, 21, 37), C(18.5, 15.5, 1.2), C(28.5, 13, 1.2), C(27, 21, 1.2), C(20, 22.5, 1.2), P('M8 37 L40 37'),
      P('M6 42 C9 40.4 12 40.4 15 42 C18 43.6 21 43.6 24 42 C27 40.4 30 40.4 33 42 C36 43.6 39 43.6 42 42'),
    ],
    niyya: [ // a heart set on one direction
      heart(24, 33, 12), P('M24 24.5 L24 13'), spark(24, 8.5, 3.4), spark(34.5, 12, 1.4), spark(13.5, 12, 1.4),
    ],
    udhiya: [ // the ram of the sacrifice, under the feast's crescent
      P('M13.5 31 C11 27.5 13.5 23 17.5 23.8 C18.8 19.8 24.6 19 27 22.2 C30 20 34.5 22.6 33.6 26.6 C36.2 28.6 35 33.6 31.4 33.6 L16 33.6 C12.6 33.6 11.6 31.8 13.5 31 Z'),
      P('M33.8 25.6 C35.4 22.6 40.8 22.8 41.2 26.8 C41.4 29.6 39 31.4 36.6 30.6'), P('M18 33.6 L18 41 M23 33.6 L23 41 M28 33.6 L28 41 M31.8 33.6 L31.8 41'),
      P('M36.4 23.4 C35.6 19.6 39.6 18 41.2 20.4 C42.4 22.2 40.6 24 39.2 23 C38.4 22.4 38.8 21.2 39.6 21.2'),
      P('M14 4.5 A6 6 0 1 0 20.6 12.6 A4.6 4.6 0 1 1 14 4.5 Z'), spark(27, 9, 1.8), spark(34, 13, 1.2),
    ],
    arafa: [ // the mount of mercy, its pillar, and the day's sun
      P('M3 40 L45 40'), P('M4 40 C12 38 15 28.5 20 26.4 C22 25.6 26 25.6 28 26.4 C33 28.5 36 38 44 40'), R(22.6, 15, 2.8, 11, 0.6), P('M21.4 15 L26.6 15'),
      P('M16.5 33 L19 32.4 M29 32.4 L31.5 33 M13 37 L15.5 36.4 M32.5 36.4 L35 37'),
      C(38, 9.5, 3), P('M38 3.5 L38 4.6 M38 14.4 L38 15.5 M32 9.5 L33.1 9.5 M42.9 9.5 L44 9.5'),
    ],
    itikaf: [ // a lamp kept lit in the house of God
      P('M6 42 L42 42'), P('M10 42 L10 20 C10 12 16 7 24 5 C32 7 38 12 38 20 L38 42'), lantern(24, 13, 0.62), P('M24 11 L24 13'),
      P('M15 42 L15 36 M33 42 L33 36'),
    ],
    wara: [ // two paths: the clear one taken, the doubtful one left
      P('M24 43 L24 25 L24 11'), spark(24, 6.5, 2.8), P('M24 27 C27 25 30 23 32 20'), P('M33.5 17.6 L35 15.2'), P('M36.6 12.8 L38 10.6'), P('M39.6 8.4 L40.8 6.6'),
      P('M16 43 L32 43'),
    ],
    tasbih: [ // the heavens, every body swimming in its orbit
      C(24, 24, 3.8), `<ellipse cx="24" cy="24" rx="19" ry="7.5" transform="rotate(-22 24 24)"/>`, `<ellipse cx="24" cy="24" rx="11.5" ry="4.8" transform="rotate(28 24 24)"/>`,
      C(24 + 19 * Math.cos(-22 * Math.PI / 180), 24 + 19 * Math.sin(-22 * Math.PI / 180), 1.8), C(24 - 11.5 * Math.cos(28 * Math.PI / 180), 24 - 11.5 * Math.sin(28 * Math.PI / 180), 1.4),
      spark(9, 9, 1.6), spark(39, 40, 1.4), spark(11, 39, 1.1),
    ],
    hamd: [ // the opening page, its frame and its medallion
      R(11, 6.5, 26, 35, 2), R(14.5, 10, 19, 28, 1.5), E(24, 24, 6.5, 8.6), spark(24, 24, 2.8), P('M16.5 12 L19 12 M29 12 L31.5 12 M16.5 36 L19 36 M29 36 L31.5 36'),
    ],
    qadar: [ // a scroll written and sealed
      P('M13 10.5 L13 37.5'), P('M35 10.5 L35 37.5'), P('M10 10.5 C10 7.5 38 7.5 38 10.5 C38 13.5 10 13.5 10 10.5 Z'), P('M10 37.5 C10 34.5 38 34.5 38 37.5 C38 40.5 10 40.5 10 37.5 Z'),
      P('M17 17.5 L31 17.5 M17 21.5 L31 21.5 M17 25.5 L27 25.5'), C(29.5, 30.5, 2.6), spark(29.5, 30.5, 1.2),
    ],
    ruya: [ // the gate thrown open, and the light beyond it
      P('M6 42 L42 42'), P('M13 42 L13 19 C13 12.5 18 8 24 7 C30 8 35 12.5 35 19 L35 42'), P('M13 19 L6.5 22.5 L6.5 42'), P('M35 19 L41.5 22.5 L41.5 42'),
      P('M24 34 L24 38'), P('M24 25 L24 20'), P('M18.5 29.5 L16 27.5 M29.5 29.5 L32 27.5'), spark(24, 29.5, 3.2), spark(24, 14, 1.6),
    ],
    tawhid: [ // the One stroke, and all around it turned toward it
      P('M24.4 9 C23.6 18 23.4 29 24.6 39.5'), spark(24.4, 5.5, 1.8), ring(24, 24, 15.5, 13, 0.9, 1.2),
    ],
    muhasaba: [ // the scales held up at the day's end
      P('M24 9 L24 40'), P('M16 41 L32 41'), P('M9.5 14 L38.5 14'), C(24, 7.6, 1.4), P('M9.5 14 L5.5 26 M9.5 14 L13.5 26'), P('M4.5 26 C5.5 30.5 13.5 30.5 14.5 26 Z'),
      P('M38.5 14 L34.5 26 M38.5 14 L42.5 26'), P('M33.5 26 C34.5 30.5 42.5 30.5 43.5 26 Z'), spark(15.5, 6.5, 1.4), spark(33, 6, 1.1),
    ],
  });

  Object.assign(BY_BLESSING, {
    blessing_201: 'wahy', blessing_202: 'malaika', blessing_203: 'imanghayb', blessing_204: 'yaqin', blessing_205: 'khashya', blessing_206: 'raja',
    blessing_207: 'hajj', blessing_208: 'umra', blessing_209: 'fajr', blessing_210: 'sujud',
    blessing_211: 'tilawa', blessing_212: 'hifzquran', blessing_213: 'sahaba', blessing_214: 'ulama', blessing_215: 'shafaa', blessing_216: 'afwallah',
    blessing_217: 'qabul', blessing_218: 'mahiya', blessing_219: 'jariya', blessing_220: 'niyya',
    blessing_221: 'udhiya', blessing_222: 'arafa', blessing_223: 'itikaf', blessing_224: 'wara', blessing_225: 'tasbih', blessing_226: 'hamd',
    blessing_227: 'qadar', blessing_228: 'ruya', blessing_229: 'tawhid', blessing_230: 'muhasaba',
  });
})();
