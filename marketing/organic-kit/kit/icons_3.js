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
    hawa: [ // the air moving, and a leaf carried on it
      P('M6 19 L30 19 C34 19 36 16 34.5 13.5 C33 11 29 11.5 29 14.5'), P('M6 27 L38 27 C42 27 43.5 31 41.5 33.5 C39.5 36 35.5 35 35.5 32'), P('M10 35 L24 35 C27.5 35 29 38.5 27 40.5 C25.5 42 23 41.5 22.6 39.5'),
      P('M12 10 C14 6.8 18.2 6.6 20.4 8.6 C18.4 11.4 14.2 11.8 12 10 Z'), P('M12 10 L17.5 8.8'),
    ],
    turab: [ // a mound of earth, and what grows from it
      P('M5 41 L43 41'), P('M7 41 C11 32 17 27 24 27 C31 27 37 32 41 41'), C(15, 36.5, 0.8), C(21, 33.5, 0.8), C(27, 34.5, 0.8), C(33, 37, 0.8), C(23, 38.5, 0.8), C(29, 39.2, 0.6), C(18, 39.5, 0.6),
      P('M24 27 L24 18'), P('M24 22 C20.5 22 18.4 19.8 18 16.6 C21.4 16.6 23.6 18.8 24 22 Z'), P('M24 19.5 C27.5 19.5 29.6 17.3 30 14 C26.6 14 24.4 16.3 24 19.5 Z'),
    ],
    hijara: [ // stones set one on another
      P('M4 42 L44 42'), E(24, 37, 13, 4.6), E(23, 28.4, 9.6, 4), E(24.6, 20.8, 7, 3.5), E(23.6, 14.4, 4.6, 2.9), spark(36, 9, 1.8), spark(11, 13, 1.3),
    ],
    sahra: [ // dunes under the sun
      P('M3 42 L45 42'), P('M3 37 C10 29.5 18 29.5 26 36'), P('M18 32 C26 24.5 36 24.5 45 32'), P('M30 42 C34 38.5 39 38 44 40'),
      C(14, 14, 4.2), P('M14 6 L14 7.5 M14 20.5 L14 22 M6 14 L7.5 14 M20.5 14 L22 14 M8.3 8.3 L9.4 9.4 M18.6 18.6 L19.7 19.7 M19.7 8.3 L18.6 9.4 M9.4 18.6 L8.3 19.7'),
    ],
    widyan: [ // a valley, and the stream that runs down it
      P('M3 11 C10 17 16 29 21.5 39'), P('M45 11 C38 17 32 29 26.5 39'), P('M21.5 39 C23.2 40.2 24.8 40.2 26.5 39'), P('M24 13 C21 18 27 22 24 27 C21.6 31 26 34.4 24 38.5'),
      P('M10 9 L15.5 4.5 L21 9'), P('M28 8 L32 5 L36 8'),
    ],
    thalj: [ // a snowflake, and hail beneath it
      ...Array.from({ length: 6 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a), x = (r) => f(24 + r * c), y = (r) => f(20 + r * s);
        const b = (r, d) => { const t = a + d; return `L${f(24 + r * c + 4 * Math.cos(t))} ${f(20 + r * s + 4 * Math.sin(t))}`; };
        return P(`M24 20 L${x(13)} ${y(13)} M${x(8)} ${y(8)} ${b(8, Math.PI / 4)} M${x(8)} ${y(8)} ${b(8, -Math.PI / 4)}`); }),
      C(24, 20, 2), C(13, 40.5, 1.6), C(24, 42.5, 1.6), C(35, 40.5, 1.6),
    ],
    nada: [ // a leaf in the morning, and the dew on it
      P('M8 41 C8 25 20 11 41 8 C41 27 28 39.5 8 41 Z'), P('M8 41 L33.5 15.5'), C(27.5, 27, 1.7), C(21, 33.5, 1.3), C(32.5, 21.5, 1.2), C(17, 26, 1.1), spark(12, 10, 2.2), spark(19, 6, 1.3),
    ],
    duha: [ // the sun climbed high, and a short shadow
      P('M4 41 L44 41'), C(30, 15, 5.5), P('M30 5 L30 6.8 M30 23.2 L30 25 M20 15 L21.8 15 M38.2 15 L40 15 M22.9 7.9 L24.2 9.2 M35.8 20.8 L37.1 22.1 M37.1 7.9 L35.8 9.2 M24.2 20.8 L22.9 22.1'),
      P('M13 41 L13 32'), C(13, 27.5, 5),
    ],
    ghurub: [ // the sun going down into the water, birds going home
      P('M4 32 L44 32'), P('M14 32 A10 10 0 0 1 34 32'), P('M16 36 L32 36'), P('M19.5 40 L28.5 40'), P('M22.5 44 L25.5 44'),
      P('M7 13 C8.6 11.4 10.4 11.4 11.5 13 C12.6 11.4 14.4 11.4 16 13'), P('M30 8 C31.2 6.8 32.6 6.8 33.4 8 C34.2 6.8 35.6 6.8 36.8 8'), P('M36 15 C37 14 38.2 14 38.8 15 C39.4 14 40.6 14 41.6 15'),
    ],
    nahl: [ // a bee on its way
      E(24, 29, 7, 10), P('M17.4 26 L30.6 26 M17.2 31 L30.8 31 M18.6 36 L29.4 36'), C(24, 15.6, 3.6), P('M22.6 12.6 C21.6 9.6 19.6 8.4 17.6 8.8'), P('M25.4 12.6 C26.4 9.6 28.4 8.4 30.4 8.8'),
      `<ellipse cx="12.5" cy="21" rx="7.5" ry="4.2" transform="rotate(-28 12.5 21)"/>`, `<ellipse cx="35.5" cy="21" rx="7.5" ry="4.2" transform="rotate(28 35.5 21)"/>`, P('M24 39 L24 42'),
    ],
    naml: [ // an ant on the ground
      C(12.5, 23.5, 3), E(19.8, 24.6, 3.6, 2.6), E(31, 25, 6.8, 4.6), P('M10.8 21.2 C9.8 17.8 8 16.4 6 16.4'), P('M13.6 20.8 C13.8 17.2 12.8 15.2 11.2 14.2'),
      P('M18.2 26.8 L15 32.5 L12.6 37'), P('M20 27.2 L20.4 33 L19.2 37'), P('M21.6 26.8 L25.6 32 L27.4 37'), P('M4 37.5 L44 37.5'), C(38, 34.6, 1.2), C(41, 35.2, 0.8),
    ],
    khayl: [ // a horse's head, its mane in the wind
      P('M37.5 42 C38.5 34 39.5 27 39 21 C38.5 14 34.5 9.5 30.5 8 L28.5 4.5 L27.2 8.6 C24.4 10.6 22.6 13.6 21.6 17 L11.6 27.4 C10.2 28.8 10.4 31.4 12 32.6 C13.4 33.6 15.4 33.4 16.8 32.4 L25.6 27 C27.6 30.4 28 35 27 42'),
      P('M30.5 8 C33.4 11 34.4 15 34 19.5'), P('M33.4 10.4 C37.2 12.6 38.6 16.4 38.4 20.4'), P('M29.6 20.6 L33 25.8'), C(26.4, 15.8, 0.9), P('M13.8 30.4 L15 29.6'),
    ],
    ibil: [ // a camel, the ship of the desert
      P('M6 16.5 C7.5 14.8 10 14.6 11.3 15.6 C12.6 16.8 12.8 19.4 13.6 21.6 C14.6 24.2 16.6 25.6 18.6 25.4 C19.6 18.8 23 15 26.6 15 C30.4 15 33 18.2 34 22 C36.8 22.6 38.6 25 38.6 28 C38.6 30.4 37 32 34.6 32 L19.4 32 C17.6 32 16.8 30.6 17.4 28.8'),
      P('M6 16.5 L6.4 18.2 C8 18.6 9.6 18 10.6 17.4'), P('M20.5 32 L20 41 M24 32 L24.5 41 M31 32 L31.5 41 M35 32 L35 41'), P('M38.6 27 C40.5 28.5 41 31 40.4 33'), P('M4 42 L44 42'), C(41, 9, 2.6),
    ],
    samak: [ // a fish in the water
      P('M7 24 C12 16 22 14 30 18 C33 19.5 35.5 21.5 37 24 C35.5 26.5 33 28.5 30 30 C22 34 12 32 7 24 Z'), P('M37 24 L43 18 L42 24 L43 30 Z'), C(12.6, 22.6, 1), P('M17 19.5 C19 22.5 19 25.5 17 28.5'),
      P('M22 21 C23.6 22.6 23.6 25.4 22 27 M27 21.4 C28.4 22.8 28.4 25.2 27 26.6'), C(9, 12, 1.3), C(13, 8, 0.9), P('M6 40 C10 37.5 14 37.5 18 40 C22 42.5 26 42.5 30 40 C34 37.5 38 37.5 42 40'),
    ],
    azhar: [ // a flower open, and a bud beside it
      ...Array.from({ length: 5 }, (_, i) => { const a = i * 72; return `<ellipse cx="24" cy="11.6" rx="3.2" ry="5.2" transform="rotate(${a} 24 17)"/>`; }), C(24, 17, 2.4),
      P('M24 23.4 C24 30 23.5 36 24 43'), P('M24 34 C28 34 31 31.5 32 27.5 C28 27.5 25 30 24 34 Z'), P('M15 43 C15 37 14 33 13 30'), P('M13 30 C10.5 28 10.5 24.5 13 22.5 C15.5 24.5 15.5 28 13 30 Z'), P('M8 43 L40 43'),
    ],
    inab: [ // a bunch of grapes on the vine
      ...[[14.25, 18], [20.75, 18], [27.25, 18], [33.75, 18], [17.5, 23.6], [24, 23.6], [30.5, 23.6], [20.75, 29.2], [27.25, 29.2], [24, 34.8]].map(([x, y]) => C(x, y + 3, 3.2)),
      P('M24 17.8 C24 13 26 9.5 29 7.5'), P('M24 12.4 C20 7.4 13 7.9 11 11.9 C14 14.9 20 14.9 24 12.4 Z'), P('M24 12.4 L15.5 11.4'), P('M29 7.5 C32 6 34 8 33 10 C32 11.5 30.5 10.5 31.2 9.5'),
    ],
    rumman: [ // a pomegranate broken open, its seeds set in rows
      C(24, 27, 15), P('M19 12.8 L18 8 L21.8 10.2 L24 7 L26.2 10.2 L30 8 L29 12.8'), C(24, 27, 11.5),
      ...(() => { const o = []; for (let j = -2; j <= 2; j++) for (let i = -3; i <= 3; i++) { const x = 24 + i * 4.6 + (j % 2 ? 2.3 : 0), y = 27 + j * 4; if (Math.hypot(x - 24, y - 27) < 9) o.push(C(x, y, 1.5)); } return o; })(),
    ],
    tin: [ // a fig, its stem and its leaf
      P('M24 12 C22 16 14 21 14 30 C14 37 18.5 42 24 42 C29.5 42 34 37 34 30 C34 21 26 16 24 12 Z'), P('M24 12 L24 8 C24 6.5 25 5.5 26.5 5'),
      P('M26 10 C28.5 5.5 34.5 4.2 39 6.4 C37.4 9.6 35 9.4 36.4 11.6 C33 13 30 11 30 12.6 C28.4 12.4 27 11.4 26 10 Z'), P('M26 10 L35 7.5'), P('M20 28 C20 32 21.5 35.5 24 37.5'), P('M22.6 41.6 L25.4 41.6'),
    ],
    sanabil: [ // an ear of wheat, full of its grains
      P('M24 43 L24 13.5'), P('M24 13.5 C22.8 11 23 8.5 24 6.5 C25 8.5 25.2 11 24 13.5 Z'),
      ...[15, 20.5, 26, 31.5].flatMap((y) => [P(`M24 ${y} C21 ${y - 1} 19.5 ${y - 3.5} 19.5 ${y - 6} C22 ${y - 5} 23.5 ${y - 3} 24 ${y} Z`), P(`M24 ${y} C27 ${y - 1} 28.5 ${y - 3.5} 28.5 ${y - 6} C26 ${y - 5} 24.5 ${y - 3} 24 ${y} Z`)]),
      P('M24 41 C20 38 17 34 16 29'), P('M24 38 C28 35.5 31 32 32 27'), spark(37, 10, 1.8), spark(11, 13, 1.3),
    ],
    basatin: [ // an orchard, its trees in a row
      tree(24, 8, 16, 17, 38), tree(10.5, 17, 11, 11, 38), tree(37.5, 17, 11, 11, 38), C(20, 16, 1.1), C(27.5, 14.5, 1.1), C(26, 21, 1.1), C(9, 22, 0.9), C(38.5, 21.5, 0.9),
      P('M3 38 L45 38'), P('M6 42.5 C9 41 12 41 15 42.5 C18 44 21 44 24 42.5 C27 41 30 41 33 42.5 C36 44 39 44 42 42.5'),
    ],
    marai: [ // green hills, and a sheep grazing on them
      P('M3 34 C12 26 22 26 30 32'), P('M18 30 C27 23.5 37 23.5 45 30'), P('M3 42 L45 42'), P('M9 41 L10 38 L11 41 M17 41 L18 38.5 L19 41 M30 41 L31 37.5 L32 41 M38 41 L39 38 L40 41'),
      P('M27 21 C26 19 27.5 17.2 29.5 17.6 C30.2 15.8 33 15.6 34 17.2 C35.5 16.4 37.4 17.8 37 19.6 C38.4 20.4 38 22.6 36.2 22.6 L28.4 22.6 C27 22.6 26.4 21.6 27 21 Z'), C(39.4, 19, 1.6), P('M29.5 22.6 L29.5 24.6 M35 22.6 L35 24.4'),
      spark(11, 11, 2), spark(18, 6.5, 1.2),
    ],
    saat: [ // a galaxy turning, and stars beyond counting
      P('M24 24 C24 20 30 19 31 24 C32 30 24 33 18 30 C11 26 13 15 21 12 C29 9 38 14 39 22'), P('M24 24 C24 28 18 29 17 24 C16 18 24 15 30 18 C37 22 35 33 27 36 C19 39 10 34 9 26'), C(24, 24, 1.6),
      spark(40, 8, 2), spark(8, 40, 1.6), spark(41, 37, 1.2), spark(7, 9, 1.2), spark(34, 43, 1),
    ],
    dawab: [ // tracks of every kind: on the belly, on two feet, on four
      P('M6 12 C10 8 14 16 18 12 C22 8 26 16 30 12 C34 8 38 16 42 12'),
      ...[[11, 24], [19, 21]].map(([x, y]) => P(`M${x} ${y} L${x} ${y + 4.5} M${x} ${y + 4.5} L${x - 2.6} ${y + 1} M${x} ${y + 4.5} L${x + 2.6} ${y + 1} M${x} ${y + 4.5} L${x} ${y + 6.5}`)),
      ...[[30, 32], [38, 27]].flatMap(([x, y]) => [E(x, y + 2, 2.6, 2.1), C(x - 3, y - 1.4, 0.9), C(x - 1, y - 2.8, 0.9), C(x + 1.2, y - 2.8, 0.9), C(x + 3.1, y - 1.4, 0.9)]),
      drop(14, 39, 1),
    ],
    jawfi: [ // a well dug down to the water held under the earth
      P('M4 18 L44 18'), P('M19 18 L19 9 M29 18 L29 9'), P('M17 9 L31 9'), P('M24 9 L24 25'), R(21.8, 25, 4.4, 3.6, 0.8), P('M19 18 L19 33 M29 18 L29 33'),
      P('M4 36 C8 34 12 34 16 36 C20 38 24 38 28 36 C32 34 36 34 40 36 C41.5 36.8 43 37 44 36.6'), P('M6 41 L42 41'), C(9, 24, 1), C(38, 25, 1), C(12, 30, 0.8), C(35, 31, 0.8), C(40, 21.5, 0.7),
    ],
    khasiba: [ // good earth: the rain above, the roots below, the shoots between
      P('M4 27 L44 27'), ...[14, 24, 34].flatMap((x) => [P(`M${x} 27 L${x} 19`), P(`M${x} 22.4 C${x - 3.4} 22.4 ${x - 5} 20.4 ${x - 5.2} 17.6 C${x - 2} 17.6 ${x - 0.4} 19.6 ${x} 22.4 Z`), P(`M${x} 20.4 C${x + 3.2} 20.4 ${x + 4.8} 18.4 ${x + 5} 15.6 C${x + 2} 15.6 ${x + 0.4} 17.6 ${x} 20.4 Z`),
        P(`M${x} 27 C${x - 0.6} 31 ${x + 0.6} 34 ${x} 38 M${x} 31 C${x - 2} 32.4 ${x - 3} 34.4 ${x - 3.2} 36.4 M${x} 32 C${x + 2} 33.4 ${x + 3} 35.4 ${x + 3.2} 37.4`)]),
      P('M10 5.5 L9 8.5 M20 4.5 L19 7.5 M30 5.5 L29 8.5 M40 4.5 L39 7.5'),
    ],
    qaraba: [ // one family tree, its branches spread wide
      P('M24 43 L24 28'), P('M24 28 C20 24 15 22.5 11 21.6'), P('M24 28 C28 24 33 22.5 37 21.6'), P('M24 28 L24 15'), P('M17 24 L15 28.4'), P('M31 24 L33 28.4'),
      C(8.4, 20.6, 3), C(39.6, 20.6, 3), C(24, 11.6, 3.4), C(14.2, 31, 2.4), C(33.8, 31, 2.4), P('M16 43 L32 43'),
    ],
    ashar: [ // two houses, joined by the love between them
      P('M4 26 L12 19 L20 26'), P('M6 24.5 L6 38 L18 38 L18 24.5'), P('M10 38 L10 32 L14 32 L14 38'), P('M28 26 L36 19 L44 26'), P('M30 24.5 L30 38 L42 38 L42 24.5'), P('M34 38 L34 32 L38 32 L38 38'),
      heart(24, 21, 4.6), P('M18 35 C21 32.5 27 32.5 30 35'), P('M2 41 L46 41'),
    ],
    rafiq: [ // one road, and two stars travelling over it together
      P('M4 18 L44 18'), P('M8 43 L22.6 18.5'), P('M40 43 L25.4 18.5'), P('M24 42 L24 38 M24 34.5 L24 31.5 M24 28.5 L24 26.5 M24 23.5 L24 22'),
      spark(19.5, 10, 2.4), spark(28.5, 10, 2.4), P('M6 22 L12 22 M36 22 L42 22'),
    ],
    sadiq: [ // two cups set down side by side, the steam of them still rising
      P('M9 26 L22 26 L20.6 36 C20.4 37.4 19.3 38 18 38 L13 38 C11.7 38 10.6 37.4 10.4 36 Z'), P('M9.4 28.5 C6.4 28.5 6.4 33 10 33'), P('M26 26 L39 26 L37.6 36 C37.4 37.4 36.3 38 35 38 L30 38 C28.7 38 27.6 37.4 27.4 36 Z'), P('M38.6 28.5 C41.6 28.5 41.6 33 38 33'),
      P('M6 41 L25 41 M23 41 L42 41'), P('M14 22.5 C13 20 16 18.5 15 16 M18 22.5 C17 20 20 18.5 19 16'), P('M31 22.5 C30 20 33 18.5 32 16 M35 22.5 C34 20 37 18.5 36 16'), heart(24.5, 10.5, 3.6),
    ],
    banat: [ // a tulip standing in the gate of the garden
      P('M6 42 L42 42'), P('M10 42 L10 18 C10 11 16 6.5 24 6 C32 6.5 38 11 38 18 L38 42'), P('M24 42 L24 27'), P('M19 18 C19 24 21 27 24 27 C27 27 29 24 29 18 L26.5 20.5 L24 16.5 L21.5 20.5 Z'),
      P('M24 36 C20 36 17.5 33.5 17 30 C20.5 30 23.4 32.4 24 36 Z'), spark(31.5, 13, 1.4),
    ],
    birr: [ // the staff of old age, and the love that leans on it
      P('M29 43 L29 17 C29 11.5 21.5 10.5 20.5 15.5'), heart(17, 29, 7.5), P('M25 43 L33 43'), spark(38, 12, 2), spark(36, 22, 1.3),
    ],
    yatim: [ // a roof held over a small heart
      P('M6 22 L24 9 L42 22'), P('M10 19.2 L10 23 M38 19.2 L38 23'), heart(24, 32, 8.5), P('M5 30 L4 33 M43 30 L42 33 M7 37 L6 40 M41 37 L40 40'), spark(24, 4.5, 1.6),
    ],
    kibar: [ // reading glasses laid on an open book
      C(16, 18, 5.5), C(32, 18, 5.5), P('M21.5 18 C23 16.6 25 16.6 26.5 18'), P('M10.5 17 L6 14.5 M37.5 17 L42 14.5'),
      P('M24 30 C20 27.5 13 27 7 28 L7 40 C13 39 20 39.5 24 42'), P('M24 30 C28 27.5 35 27 41 28 L41 40 C35 39 28 39.5 24 42'), P('M24 30 L24 42'),
    ],
    zumala: [ // two wheels that turn each other
      ...[[18, 19, 8.5, 9], [31.5, 31, 7, 7]].map(([x, y, r, n]) => { let d = ''; for (let i = 0; i < n * 4; i++) { const a = (i * Math.PI * 2) / (n * 4), rr = i % 4 < 2 ? r + 2.4 : r; d += `${i ? 'L' : 'M'}${f(x + rr * Math.cos(a))} ${f(y + rr * Math.sin(a))} `; } return P(d + 'Z'); }),
      C(18, 19, 3), C(31.5, 31, 2.4),
    ],
    talamidh: [ // one candle that lights the others
      R(20, 22, 8, 19, 1), drop(24, 15.4, 1.6), P('M24 22 L24 20'), R(8, 30, 5, 11, 1), drop(10.5, 25.4, 1), R(35, 30, 5, 11, 1), drop(37.5, 25.4, 1), P('M4 41 L44 41'),
      P('M17.5 13 L14.5 15.5 M30.5 13 L33.5 15.5'),
    ],
    imam: [ // the minbar, its steps and its dome
      P('M4 42 L44 42'), P('M7 42 L7 37 L12 37 L12 32 L17 32 L17 27 L22 27 L22 22 L24 22'), P('M7 37 L24 22'), P('M24 22 L36 22 L36 42'), P('M24 22 L24 12 M36 22 L36 12'),
      P('M23 12 C23 7.5 26.5 5.5 30 4.5 C33.5 5.5 37 7.5 37 12 Z'), P('M30 4.5 L30 2.5'), P('M26.5 42 L26.5 32 C26.5 29.6 28.2 28 30 28 C31.8 28 33.5 29.6 33.5 32 L33.5 42'),
    ],
    khadim: [ // a tray brought in, and tea poured on it
      P('M5 34 L43 34'), P('M8 34 C8 36.8 10.6 38.4 13.4 38.4 L34.6 38.4 C37.4 38.4 40 36.8 40 34'),
      P('M14 33 C11 28 13 22 20 22 C27 22 29 28 26 33 Z'), P('M17 22 C17 19.5 23 19.5 23 22'), C(20, 18.6, 1), P('M27.5 27 C31 26 31.6 23 33 21'), P('M12.6 25 C9 25 8.6 30 12 31.6'),
      P('M31 28.5 L39 28.5 L38 33 L32 33 Z'), P('M33.5 25.5 C33 24 34.4 23 34 21.5 M36.5 25.5 C36 24 37.4 23 37 21.5'),
    ],
    itidhar: [ // a heart cracked, and stitched back
      heart(24, 28, 15), P('M24 17 L21.2 22.4 L26.2 27.4 L22.4 33.4 L24 38'), P('M19 20.6 L23.6 24 M22.4 26.4 L28 28.6 M20.2 31.6 L25 34.6'),
    ],
    sulh: [ // an olive branch held out
      P('M8 40 L40 10'),
      ...[0.2, 0.33, 0.46, 0.59, 0.72, 0.85].map((t, i) => { const s = i % 2 ? 1 : -1, bx = 8 + 32 * t, by = 40 - 30 * t, dx = 0.73, dy = -0.68, px = 0.68 * s, py = 0.73 * s;
        const tx = bx + px * 6.5 + dx * 3, ty = by + py * 6.5 + dy * 3, mx = (bx + tx) / 2, my = (by + ty) / 2, lx = -(ty - by) / 4.2, ly = (tx - bx) / 4.2;
        return P(`M${f(bx)} ${f(by)} Q${f(mx + lx)} ${f(my + ly)} ${f(tx)} ${f(ty)} Q${f(mx - lx)} ${f(my - ly)} ${f(bx)} ${f(by)} Z`); }),
      spark(12, 12, 2.2), spark(37, 36, 1.6),
    ],
    ziyara: [ // a door knocked on, a heart above it
      P('M6 42 L42 42'), P('M13 42 L13 14 C13 10 17.5 7.5 24 7.5 C30.5 7.5 35 10 35 14 L35 42'), P('M24 7.5 L24 42'), C(20.6, 26, 1.6), C(27.4, 26, 1.6), heart(24, 16.5, 3.4),
      P('M38 20 L42.5 18.5 M38 26 L43 26 M38 32 L42.5 33.5'),
    ],
    iyada: [ // flowers and a glass of water at the bedside
      P('M6 42 L42 42'), P('M16 42 C12.5 40 12.5 33 15.5 30 L15.5 27 L21.5 27 L21.5 30 C24.5 33 24.5 40 21 42'), P('M18.5 27 L15.5 17.5 M18.5 27 L18.5 14.4 M18.5 27 L22.6 18.4'),
      C(15, 15.4, 2.2), C(18.5, 12, 2.2), C(23.4, 16.2, 2.2), P('M29 29 L37 29 L36 42 L30 42 Z'), P('M29.4 33.5 L36.6 33.5'), heart(33, 20.5, 3.4),
    ],
    taziya: [ // a grieving heart, held on both sides
      heart(24, 28, 9.5), drop(24, 11, 1.3), P('M10 17 C4.6 25 6.6 35.4 14.6 40'), P('M38 17 C43.4 25 41.4 35.4 33.4 40'), P('M14.6 14 C12.4 16 11 18.6 10.4 21 M33.4 14 C35.6 16 37 18.6 37.6 21'),
    ],
    ibtisama: [ // a daisy opening, gladness handed out
      ...Array.from({ length: 10 }, (_, i) => `<ellipse cx="24" cy="12.4" rx="2.4" ry="4.6" transform="rotate(${i * 36} 24 21)"/>`), C(24, 21, 3.6),
      P('M24 30.6 L24 43'), P('M24 38 C20 38 17.6 35.8 17 32.6 C20.6 32.6 23.4 34.8 24 38 Z'), P('M18 43 L30 43'), spark(39, 33, 1.8), spark(9, 33, 1.4),
    ],
    mashura: [ // a signpost that shows the way
      P('M24 43 L24 7'), P('M24 10 L36 10 L39.5 13.5 L36 17 L24 17'), P('M24 22 L12 22 L8.5 25.5 L12 29 L24 29'), P('M16 43 L32 43'), spark(24, 4, 1.6), spark(40, 33, 1.8), spark(36, 38.5, 1.1),
    ],
    ijtima: [ // a full table, every place laid
      C(24, 24, 16), C(24, 24, 3.8), ...Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7; return C(24 + 10.6 * Math.cos(a), 24 + 10.6 * Math.sin(a), 2.6); }),
    ],
    dhikra: [ // a heart, and prayers going up from it to those gone ahead
      heart(24, 35, 8), C(24, 22.5, 0.9), C(24, 17.5, 0.9), C(24, 12.8, 0.9), spark(24, 6.5, 2.6), spark(14, 12, 1.5), spark(34, 12, 1.5), spark(11, 22, 1), spark(37, 22, 1),
    ],
    shukrnas: [ // a gift given back, with its bow
      R(10, 22, 28, 20, 1.5), R(8, 16, 32, 6, 1), P('M24 16 L24 42'), P('M24 16 C20 9 13 10 15 14 C16.5 16.5 21 16 24 16 C27 16 31.5 16.5 33 14 C35 10 28 9 24 16'), heart(31, 32.5, 3.2),
    ],
    hanin: [ // an old key, its bow a heart
      heart(16, 18, 9), P('M21.8 23.8 L40 42'), P('M33.4 35.4 L36.8 32 M37 39 L40.4 35.6'), P('M13 15.5 C13.6 13.8 15 13 16.4 13.2'), spark(38, 9, 2), spark(32, 15, 1.2),
    ],
    shawq: [ // a bird flying out toward the light
      P('M5 36 C9 30 14 30 17 34.5 C20 27.5 26.5 24 32.5 25.6'), P('M17 34.5 L18.2 38.4 L21 36.6'), C(23.5, 21, 0.8), C(27.5, 17.5, 0.8), C(31.5, 14, 0.8), spark(37.5, 9, 3.4), spark(42, 16, 1.2), spark(32, 5, 1.1),
    ],
    hudu: [ // a feather settling slowly, and still water under it
      P('M14 38 C20 28 27 18 36 7'), P('M36 7 C40.5 13 37.5 22.5 28 28 C23 31 18 33.5 16.2 36'), P('M36 7 C28 8 22 14 19.6 21 C18.2 25.4 16.6 30 15.4 34'),
      P('M23.6 22 L31.8 20.2 M20.6 27 L28 26 M27 16.8 L34.4 14'), P('M28 40.5 L42 40.5'), P('M31.5 44.5 L38.5 44.5'),
    ],
  });

  Object.assign(BY_BLESSING, {
    blessing_201: 'wahy', blessing_202: 'malaika', blessing_203: 'imanghayb', blessing_204: 'yaqin', blessing_205: 'khashya', blessing_206: 'raja',
    blessing_207: 'hajj', blessing_208: 'umra', blessing_209: 'fajr', blessing_210: 'sujud',
    blessing_211: 'tilawa', blessing_212: 'hifzquran', blessing_213: 'sahaba', blessing_214: 'ulama', blessing_215: 'shafaa', blessing_216: 'afwallah',
    blessing_217: 'qabul', blessing_218: 'mahiya', blessing_219: 'jariya', blessing_220: 'niyya',
    blessing_221: 'udhiya', blessing_222: 'arafa', blessing_223: 'itikaf', blessing_224: 'wara', blessing_225: 'tasbih', blessing_226: 'hamd',
    blessing_227: 'qadar', blessing_228: 'ruya', blessing_229: 'tawhid', blessing_230: 'muhasaba',
    blessing_231: 'hawa', blessing_232: 'turab', blessing_233: 'hijara', blessing_234: 'sahra', blessing_235: 'widyan', blessing_236: 'thalj',
    blessing_237: 'nada', blessing_238: 'duha', blessing_239: 'ghurub', blessing_240: 'nahl',
    blessing_241: 'naml', blessing_242: 'khayl', blessing_243: 'ibil', blessing_244: 'samak', blessing_245: 'azhar', blessing_246: 'inab',
    blessing_247: 'rumman', blessing_248: 'tin', blessing_249: 'sanabil', blessing_250: 'basatin',
    blessing_251: 'marai', blessing_252: 'saat', blessing_253: 'dawab', blessing_254: 'jawfi', blessing_255: 'khasiba', blessing_256: 'qaraba',
    blessing_257: 'ashar', blessing_258: 'rafiq', blessing_259: 'sadiq', blessing_260: 'banat',
    blessing_261: 'birr', blessing_262: 'yatim', blessing_263: 'kibar', blessing_264: 'zumala', blessing_265: 'talamidh', blessing_266: 'imam',
    blessing_267: 'khadim', blessing_268: 'itidhar', blessing_269: 'sulh', blessing_270: 'ziyara',
    blessing_271: 'iyada', blessing_272: 'taziya', blessing_273: 'ibtisama', blessing_274: 'mashura', blessing_275: 'ijtima', blessing_276: 'dhikra',
    blessing_277: 'shukrnas', blessing_278: 'hanin', blessing_279: 'shawq', blessing_280: 'hudu',
  });
})();
