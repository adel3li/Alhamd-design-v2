/*
 * Alhamd organic kit — line icons for blessings 101–200 (hundred 2), in the style of icons.js:
 * 48-unit grid, one thin stroke, round caps, no faces or people. Loaded after icons.js; adds to ICONS.I and ICONS.BY_BLESSING.
 * One file per hundred, so the sessions drawing different hundreds never edit the same file.
 */
(function () {
  const { I, BY_BLESSING, H } = window.ICONS;
  const { f, P, C, E, R, spark, heart, tree, lantern, ring, drop } = H; // eslint-disable-line no-unused-vars

  Object.assign(I, {
    tahara: [ // an ewer for wudu, and the water it pours
      P('M14 23 C10.8 27 10.8 34.5 15 38.5 L27 38.5 C31.2 34.5 31.2 27 28 23 Z'), P('M17.5 23 L17.5 17 L24.5 17 L24.5 23'), P('M16 17 L26 17'), P('M21 17 L21 13'), C(21, 11.6, 1.4),
      P('M29.6 27 C33.6 26 35.6 22.5 37 18.5'), P('M13.2 25 C8.2 25.4 8 33 12.6 34.6'), P('M11 42 L31 42'), drop(38.5, 26, 0.9), drop(37.2, 33.5, 0.7),
    ],
    adhan: [ // a minaret, and the call carried out from it
      P('M11.5 42 L30.5 42'), P('M17 42 L17 21 M25 42 L25 21'), P('M14.5 21 L27.5 21'), P('M15.5 25 L26.5 25'), P('M18 21 L18 15.5 L24 15.5 L24 21'), P('M17 15.5 L21 8 L25 15.5 Z'), C(21, 6.2, 1.2),
      P('M31 13.5 A5.5 5.5 0 0 1 31 22.5'), P('M34.6 10.5 A9.6 9.6 0 0 1 34.6 25.5'), P('M38.2 7.5 A13.8 13.8 0 0 1 38.2 28.5'), P('M19.5 34 L22.5 34 L22.5 38.5 L19.5 38.5 Z'),
    ],
    siyam: [ // the iftar: a bowl of dates under the crescent
      P('M8.5 30 C8.5 37 15.3 41.5 24 41.5 C32.7 41.5 39.5 37 39.5 30 Z'), E(17.5, 26.8, 3.6, 2.1), E(25, 25.6, 3.6, 2.1), E(31.6, 27, 3.2, 1.9), P('M15 44 L33 44'),
      P('M27 5 A8.4 8.4 0 1 0 35.4 17.6 A6.6 6.6 0 1 1 27 5 Z'), spark(14, 11, 2.4), spark(39.5, 7.5, 1.6),
    ],
    sadaqa: [ // a coin on its way into the charity box
      R(10.5, 25, 27, 17, 2), P('M8.5 25 L39.5 25'), R(19, 23.6, 10, 2.8, 1.4), heart(24, 34.2, 6.2),
      C(24, 11.5, 5.2), C(24, 11.5, 2.4), P('M24 18.6 L24 20.6'), spark(35, 8, 2), spark(13, 15, 1.5),
    ],
    qiyam: [ // a prayer rug in the night, the moon above it
      P('M11.5 42 L36.5 42 L31.5 25 L16.5 25 Z'), P('M20.4 39 L20.4 33 C20.4 30.8 22 29.4 24 29 C26 29.4 27.6 30.8 27.6 33 L27.6 39'),
      P('M30 5 A7.6 7.6 0 1 0 37.6 15.6 A5.9 5.9 0 1 1 30 5 Z'), spark(12.5, 9.5, 2.6), spark(20, 16.5, 1.5), spark(41, 22, 1.6),
    ],
    istighfar: [ // a heart, and the drops that wash it
      heart(24, 31.5, 13.5), drop(15, 9.5, 1), drop(24, 6.5, 1.1), drop(33, 9.5, 1), spark(30.5, 28, 2.8), spark(17.5, 33, 1.5),
    ],
    salatnabi: [ // a letter of greeting, sealed with a heart, and light over it
      R(8.5, 17, 31, 22, 2), P('M8.5 19 L24 30 L39.5 19'), P('M8.5 37 L19 28.2 M39.5 37 L29 28.2'), heart(24, 31.6, 4.6),
      spark(24, 8.5, 3), spark(14.5, 10.5, 1.6), spark(33.5, 10.5, 1.6),
    ],
    eid: [ // bunting for the feast, and the new crescent
      P('M5 11 C14.5 17.5 33.5 17.5 43 11'), P('M8.6 13.4 L13.8 15.2 L10.4 20.4 Z'), P('M17.2 16.1 L22.6 16.8 L19.4 22.2 Z'), P('M25.4 16.8 L30.8 16.1 L28.6 22.2 Z'), P('M34.2 15.2 L39.4 13.4 L37.6 20.4 Z'),
      P('M22 24 A9.2 9.2 0 1 0 31.8 38.6 A7.2 7.2 0 1 1 22 24 Z'), spark(14, 32, 2.4), spark(37, 28.5, 1.6),
    ],
    haya: [ // a bud that bows its head
      P('M19.5 43.5 C19.5 31 21.5 19 29.5 14.5 C33.6 12.2 37.4 14.6 37.4 18.8'), P('M37.4 18.8 C34.2 21 33.6 26.2 37.4 29.6 C41.2 26.2 40.6 21 37.4 18.8 Z'), P('M37.4 21.5 L37.4 27.5'),
      P('M20.2 34.5 C14.8 33.6 11.6 29.6 11.2 24.6 C16.4 25.2 19.8 29 20.2 34.5 Z'), P('M14 43.5 L26 43.5'),
    ],
    khushu: [ // a heart standing still in the mihrab
      P('M7.5 42 L40.5 42'), P('M12 42 L12 22 C12 14.5 17.5 9.2 24 7 C30.5 9.2 36 14.5 36 22 L36 42'), heart(24, 28.5, 8.4), P('M17 37 L31 37'),
    ],
  });

  Object.assign(BY_BLESSING, {
    blessing_101: 'tahara', blessing_102: 'adhan', blessing_103: 'siyam', blessing_104: 'sadaqa', blessing_105: 'qiyam', blessing_106: 'istighfar',
    blessing_107: 'salatnabi', blessing_108: 'eid', blessing_109: 'haya', blessing_110: 'khushu',
  });
})();
