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

  /** A cloud whose flat base runs from x0 to x1 at y; h is its height. */
  const cloud = (x0, x1, y, h) => {
    const w = x1 - x0, X = (t) => f(x0 + t * w), Y = (t) => f(y - t * h);
    return P(`M${X(0.12)} ${f(y)} C${X(-0.04)} ${f(y)} ${X(-0.06)} ${Y(0.55)} ${X(0.14)} ${Y(0.55)} C${X(0.14)} ${Y(0.95)} ${X(0.42)} ${Y(1.12)} ${X(0.55)} ${Y(0.8)} C${X(0.66)} ${Y(1.02)} ${X(0.92)} ${Y(0.92)} ${X(0.88)} ${Y(0.55)} C${X(1.06)} ${Y(0.55)} ${X(1.06)} ${f(y)} ${X(0.88)} ${f(y)} Z`);
  };

  Object.assign(I, {
    rahmawasia: [ // a wide arc of mercy over a small heart
      P('M5 33 A19 19 0 0 1 43 33'), P('M10.5 33 A13.5 13.5 0 0 1 37.5 33'), heart(24, 34, 6.4), P('M5 41 L43 41'),
      spark(24, 7, 2.6), spark(9, 18, 1.5), spark(39, 18, 1.5),
    ],
    mudaafa: [ // one good deed, and the many it grows into
      P('M9 42 C16 40 22 33 25 24 C27.5 16.5 32 11 39 8'), spark(10, 36, 2.2), spark(19, 30.5, 3), spark(27, 19.5, 4), spark(38.5, 9, 5.2), P('M7 44 L41 44'),
    ],
    dhulhijja: [ // the mount of Arafat with its pillar, under the young moon
      P('M5 42 L43 42'), P('M8 42 C13 35 17 30 21 27.5 C23 26.4 25 26.4 27 27.5 C31 30 35 35 40 42'), P('M22.6 27 L22.6 17.5 L25.4 17.5 L25.4 27'), P('M21.6 17.5 L26.4 17.5'),
      P('M33.5 6 A6.4 6.4 0 1 0 39.9 15.6 A5 5 0 1 1 33.5 6 Z'), spark(12, 12, 2), spark(16, 22, 1.3),
    ],
    nasiha: [ // a word given in care: two speech bubbles, a heart in one
      P('M6.5 11 L30.5 11 Q33 11 33 13.5 L33 27.5 Q33 30 30.5 30 L16 30 L10 35.5 L10.6 30 L9 30 Q6.5 30 6.5 27.5 L6.5 13.5 Q6.5 11 9 11 Z'), heart(19.8, 21.4, 6),
      P('M37 22 L39.5 22 Q41.5 22 41.5 24 L41.5 34 Q41.5 36 39.5 36 L38.6 36 L39 40.5 L34 36 L25 36 Q23 36 23 34 L23 33'), P('M28 30.5 L36 30.5 M28 25.5 L33 25.5'),
    ],
    rusul: [ // a message sent down: the unrolled scroll, light above it
      P('M12 19 L36 19 L36 38 L12 38 Z'), P('M12 19 C9 19 9 23.5 12 23.5'), P('M36 38 C39 38 39 33.5 36 33.5'), P('M9.6 21.2 L9.6 40.2 L12 38'), P('M17 25 L31 25 M17 29 L31 29 M17 33 L26 33'),
      P('M24 5 L24 13'), P('M16.5 8 L19 13.5'), P('M31.5 8 L29 13.5'),
    ],
    samamahfuza: [ // the sky, a roof kept over the earth
      P('M5 38 A19 19 0 0 1 43 38'), P('M9 38 A15 15 0 0 1 39 38'), P('M4 38 L44 38'), P('M14 43 L34 43'),
      spark(24, 26, 2.8), spark(16.5, 31, 1.6), spark(31.5, 30.5, 1.8), C(20, 33.5, 0.7), C(28, 34, 0.7),
    ],
    anhar: [ // a spring, and the river that runs from it
      C(14, 9.5, 3.4), P('M11 14 C9 22 22 23 21 30 C20 36 14 38 9 43'), P('M17 14 C17.5 20 28 22.5 28.5 30 C29 36.5 24 40 21 43'),
      P('M30 43 C33.6 39.5 38.5 39.5 42 43'), drop(14, 5.2, 0.55), P('M33 18 C35.6 16.6 38.4 16.6 41 18 M33 23 C35.6 21.6 38.4 21.6 41 23'),
    ],
    sahab: [ // clouds drifting, heavy with what they carry
      cloud(8, 34, 26, 15), cloud(22, 42, 36, 10.5), drop(14, 34.5, 0.65), drop(18.5, 39.5, 0.65), drop(13, 43.5, 0.65), spark(38, 11, 2),
    ],
    fajr: [ // the sun rising out of the horizon
      P('M4 33 L44 33'), P('M14 33 A10 10 0 0 1 34 33'), P('M9.5 38.5 L38.5 38.5'), P('M15.5 43.5 L32.5 43.5'),
      P('M24 13.5 L24 18.5'), P('M11 20.5 L14.4 23.9'), P('M37 20.5 L33.6 23.9'), P('M5.8 28 L10.5 29'), P('M42.2 28 L37.5 29'), spark(40, 9.5, 1.6),
    ],
    fusul: [ // the year's wheel: leaf, sun, rain and frost each in its turn
      C(24, 24, 17.5), P('M24 6.5 L24 41.5 M6.5 24 L41.5 24'),
      P('M15.5 19 C14.6 14.6 17 11.6 20.4 11.4 C20.6 15.4 18.6 18.4 15.5 19 Z'), P('M15.5 19 L18.4 14.4'),
      C(32, 16, 3), P('M32 10.2 L32 11 M37.8 16 L37 16 M26.2 16 L27 16 M32 21.8 L32 21'),
      drop(16, 32, 1.05), P('M32 27.5 L32 36.5 M28.1 29.75 L35.9 34.25 M28.1 34.25 L35.9 29.75'),
    ],
  });

  /** A palm: trunk from (x, base) to (x+lean, top), fronds of length r. */
  const palm = (x, base, top, r, lean = 0) => {
    const tx = x + lean;
    let s = P(`M${f(x)} ${f(base)} C${f(x + lean * 0.2)} ${f(base - (base - top) * 0.5)} ${f(tx)} ${f(top + (base - top) * 0.2)} ${f(tx)} ${f(top)}`);
    for (const [dx, dy, cx, cy] of [[-1, 0.45, -0.55, -0.35], [1, 0.45, 0.55, -0.35], [-0.8, -0.35, -0.5, -0.7], [0.8, -0.35, 0.5, -0.7], [-0.15, -0.95, -0.25, -0.75]]) {
      s += P(`M${f(tx)} ${f(top)} Q${f(tx + cx * r)} ${f(top + cy * r)} ${f(tx + dx * r)} ${f(top + dy * r)}`);
    }
    return s;
  };
  /** A leaf from (x0,y0) to (x1,y1), width w; one side bulges by w, the other by w*k. */
  const leaf = (x0, y0, x1, y1, w, k = 1) => {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const m = (t, s) => `${f(x0 + dx * t + nx * s)} ${f(y0 + dy * t + ny * s)}`;
    return P(`M${f(x0)} ${f(y0)} Q${m(0.5, w)} ${f(x1)} ${f(y1)} Q${m(0.5, -w * k)} ${f(x0)} ${f(y0)} Z`);
  };

  Object.assign(I, {
    nakhl: [ // a palm, its dates hanging under the fronds
      palm(24, 43, 15, 13, -1), C(20, 19.5, 1.4), C(22.6, 20.6, 1.4), C(20.6, 22.6, 1.4), P('M12 43 L36 43'), spark(38, 33, 1.8),
    ],
    zaytun: [ // an olive branch, the fruit among its leaves
      P('M8 40 C16 33 26 22 40 9'), leaf(13.5, 35, 9, 27.5, 3.2), leaf(15.5, 33, 23, 36, 3.2), leaf(21.5, 27, 17.5, 19, 3.2), leaf(23.5, 25, 31.5, 27.5, 3.2),
      leaf(30, 18.5, 27.5, 10.5, 3.2), leaf(32.5, 16, 40, 17.5, 3), E(20.4, 31.4, 1.7, 2.3), E(28.6, 22.8, 1.7, 2.3), E(35.2, 12.8, 1.6, 2.1),
    ],
    alwan: [ // three petals overlapping, each its own colour
      leaf(24, 26, 24, 7, 6.5), leaf(24, 26, 7.5, 36, 6.5), leaf(24, 26, 40.5, 36, 6.5), C(24, 26, 2.2), spark(38.5, 9.5, 2), spark(10, 12, 1.4),
    ],
    zawjiyya: [ // two leaves, a pair, from the same stem
      P('M24 44 L24 23'), leaf(24, 25, 9, 9.5, 5.6), leaf(24, 25, 39, 9.5, 5.6), P('M24 25 L14 14.5 M24 25 L34 14.5'), P('M15 44 L33 44'),
    ],
    maaadhb: [ // a glass of sweet water, a drop above it
      P('M13.5 16 L16.5 42 L31.5 42 L34.5 16'), P('M15 26 C19 24.4 22 27.6 24 26 C26 24.4 29 27.6 33.3 26'), drop(24, 8.5, 1.3), P('M19 36 L19.6 31'), spark(39, 26, 1.6),
    ],
    shajar: [ // two green trees side by side
      tree(17, 7, 17, 22, 42), tree(33, 15, 13, 16, 42), P('M8 42 L40 42'), P('M17 22 L13.5 18.5 M17 26 L21 22.5'),
    ],
    barq: [ // a cloud, lightning breaking from it
      cloud(7, 41, 24, 15), P('M25 24 L20 33 L26 33 L21.5 43'), P('M13 30 L11.5 34 M33 30 L31.5 34 M37.5 30 L36 34'),
    ],
    ikhwa: [ // two shoots from one seed
      E(24, 38.5, 4.2, 2.8), P('M24 36 C22 30 19 26 15.5 22'), P('M24 36 C26 30 29 26 32.5 22'), leaf(15.5, 22, 9.5, 14, 3), leaf(32.5, 22, 38.5, 14, 3), P('M10 43 L38 43'),
    ],
    ajdad: [ // an old tree, its wide shade over a young shoot
      P('M17 43 C18 37 18 31 17 26 M23 43 C22 37 22.4 31 23.6 26'), P('M7 24 C4 17 10 9 18 10 C21 5 30 5 33 10 C40 9 45 17 41 24 C38 28 30 27 27 25 C24 28 14 29 7 24 Z'),
      P('M20 26 L16 21 M20.4 26 L26 20'), P('M35 43 L35 37'), leaf(35, 38, 30.5, 33.5, 1.8), leaf(35, 38, 39.5, 34, 1.8), P('M11 43 L41 43'),
    ],
    ahfad: [ // a tree, a sapling and a seedling: what grows on after you
      tree(12, 11, 13, 17, 41), P('M26 41 L26 27'), leaf(26, 29, 21, 23, 2.2), leaf(26, 28, 31, 22, 2.2), P('M37 41 L37 35'), leaf(37, 36, 34, 32.5, 1.5), leaf(37, 36, 40, 32.5, 1.5),
      P('M5 41 L43 41'), spark(36, 13, 1.8),
    ],
  });

  Object.assign(I, {
    diyafa: [ // the coffee pot and a small cup, set out for the guest
      P('M14 41 L28 41 C29 36 28.5 31 26.5 27 L26.5 22 L15.5 22 L15.5 27 C13.5 31 13 36 14 41 Z'), P('M15.5 22 C15.5 18 17.6 16 21 16 C24.4 16 26.5 18 26.5 22'), C(21, 14, 1.6),
      P('M26.5 25 C31 24.5 33.5 21 34 16 L37 13'), P('M14.5 27 C10.5 27.5 9.5 33 13.6 35'), P('M31 41 L39 41 L38 35 L32 35 Z'), P('M8 44 L41 44'), P('M35 31 C34.2 29.6 35.8 28.4 35 27'),
    ],
    hadiyya: [ // a gift, tied with its ribbon
      R(10, 22, 28, 20, 1.5), R(8, 16.5, 32, 5.5, 1.5), P('M24 16.5 L24 42'), P('M24 16.5 C19 7 11 10 15 15 C17 17 21 16.5 24 16.5 C27 16.5 31 17 33 15 C37 10 29 7 24 16.5 Z'), spark(41, 8, 1.8),
    ],
    salam: [ // a dove carrying the greeting
      P('M10 27 C14 23 20 22.5 25 24 L33 17 C35 15.4 38 16 38.4 18.4 L42 19 L38.4 21 C38 26 34 32 26 33.5 C20 34.5 14 32.5 10 27 Z'), P('M25 24 C24 18 21 13 15 10 C17 17 19 21.5 22 24'),
      P('M10 27 L5 31 L13 30.8'), C(35.6, 19.2, 0.6), P('M14 41 C20 37 30 37 36 41'), spark(40, 34, 1.6),
    ],
    kalima: [ // a good word: a flower opening from the speech bubble
      P('M8 16 L32 16 Q35 16 35 19 L35 33 Q35 36 32 36 L18 36 L11.5 42 L12.3 36 L11 36 Q8 36 8 33 L8 19 Q8 16 11 16 Z'),
      P('M21.5 32 L21.5 27'), leaf(21.5, 27.5, 21.5, 19, 2.6), leaf(21.5, 27.5, 14.5, 21.5, 2.3), leaf(21.5, 27.5, 28.5, 21.5, 2.3), spark(40.5, 11, 1.8),
    ],
    khuluq: [ // a rose: what is fair, and gentle to hold
      P('M24 44 C24 37 24 32 24 27'), leaf(24, 37, 15, 32, 2.8), leaf(24, 34, 33, 30, 2.8),
      P('M24 27 C16 27 14 20 15.5 13 C19 15 21 15 24 11 C27 15 29 15 32.5 13 C34 20 32 27 24 27 Z'), P('M24 11 C22 14 21 18 24 21 C27 18 26 14 24 11'), spark(9, 10, 1.6),
    ],
    jamaa: [ // houses set close together, one neighbourhood
      P('M5 42 L43 42'), P('M8 42 L8 28 L15 22 L22 28 L22 42'), P('M22 42 L22 21 L30 14 L38 21 L38 42'), P('M38 42 L38 30 L43 30'), P('M12.5 42 L12.5 35 L17.5 35 L17.5 42'),
      R(27, 25, 6, 6, 1), P('M30 25 L30 31'), R(26.5, 35, 7, 7, 0.5), C(15, 29.5, 1.4),
    ],
    muwasat: [ // a shelter held over a heart in the rain
      P('M7 24 C9 14 17 9 24 9 C31 9 39 14 41 24 C38 21.5 34.5 21.5 32.5 24 C30 21.5 26.5 21.5 24 24 C21.5 21.5 18 21.5 15.5 24 C13.5 21.5 10 21.5 7 24 Z'), P('M24 9 L24 6.5'),
      heart(24, 36.5, 7.2), drop(9, 32, 0.7), drop(39, 32, 0.7), drop(12, 41, 0.6), drop(36, 41.5, 0.6),
    ],
    qudwa: [ // a lantern ahead, and the path it lights
      lantern(24, 4, 0.78), P('M24 31.5 L24 33.5'), P('M17 44 C20 39 22 36 23.2 35 M31 44 C28 39 26 36 24.8 35'), P('M20.5 41 L27.5 41'),
      P('M14 17 L10 15.5 M14 22 L9.5 22 M34 17 L38 15.5 M34 22 L38.5 22'),
    ],
    maruf: [ // a hand held open, giving what is good
      P('M6 33 L13 33 C17 33 21 31 25 31 L31 31 C33 31 33 34 31 34 L24 34 M25 34 L35 34 L41.5 28.5 C43 27.2 45 29 43.5 30.7 L37 38 C35.6 39.4 34 40 32 40 L13 40 L6 40'), P('M13 33 L13 40'),
      heart(28, 20, 7), spark(38, 12, 1.8), spark(18, 13, 1.4),
    ],
    rahmaqalb: [ // a heart that holds a softer heart inside
      heart(24, 26, 16), heart(24, 25, 7.4), P('M7 40 C11 38 13 42 17 40'), P('M31 40 C35 38 37 42 41 40'), spark(39, 9, 1.8),
    ],
  });

  Object.assign(I, {
    hubb: [ // two hearts, one leaning into the other
      heart(19, 25, 11), heart(30, 28, 9), spark(39, 11, 2), spark(9, 39, 1.4),
    ],
    tawadu: [ // the full ear of wheat bows its head
      P('M14 44 C14 32 18 22 28 17 C32 15 35 15.5 37 18'), leaf(29, 17.2, 33.5, 22.5, 1.9), leaf(32, 17, 37.5, 20.5, 1.9), leaf(34.5, 17.6, 39.5, 24, 1.8), leaf(31, 19, 34, 26, 1.8), leaf(37, 18, 41, 26.5, 1.6),
      leaf(16, 33, 9, 26, 2.2), P('M8 44 L24 44'),
    ],
    anah: [ // an hourglass, the sand falling slowly
      P('M13 7 L35 7 M13 41 L35 41'), P('M15.5 7 C15.5 16 22 19 22 24 C22 29 15.5 32 15.5 41 M32.5 7 C32.5 16 26 19 26 24 C26 29 32.5 32 32.5 41'),
      P('M19 15 L29 15 C28 18 25.5 20 24 21 C22.5 20 20 18 19 15 Z'), P('M24 25.5 L24 33.5'), P('M18.5 41 C19.5 37.5 22 35.5 24 35.5 C26 35.5 28.5 37.5 29.5 41'),
    ],
    shajaa: [ // a shield held steady
      P('M24 6 C19 9 13 10 9 10 C9 26 14 36 24 42 C34 36 39 26 39 10 C35 10 29 9 24 6 Z'), P('M24 11.5 C21 13 17.5 14 14.5 14.3 C15 25.5 18.5 32.5 24 36.5 C29.5 32.5 33 25.5 33.5 14.3 C30.5 14 27 13 24 11.5 Z'), spark(24, 24, 4),
    ],
    hubbkhayr: [ // a heart whose good reaches out to others
      heart(24, 25, 9.5), heart(9, 12, 3.6), heart(39, 12, 3.6), heart(9, 38, 3.6), heart(39, 38, 3.6),
      P('M15.5 19 L12 15.4 M32.5 19 L36 15.4 M15.5 31 L12 34.6 M32.5 31 L36 34.6'),
    ],
    injaz: [ // the flag set on the summit
      P('M4 42 L44 42'), P('M7 42 L19 25 L24 31 L29 24 L41 42'), P('M29 24 L29 7'), P('M29 7.5 L39 10.5 L29 14.5'), P('M15.5 30 L19 25 L22 28.6'), spark(12, 12, 2), spark(40, 22, 1.4),
    ],
    huzn: [ // soft rain on the earth, and what grows from it
      cloud(10, 38, 17, 11), drop(16, 24, 0.75), drop(23, 27, 0.75), drop(30, 23.5, 0.75), P('M6 43 L42 43'), P('M24 43 L24 36.5'), leaf(24, 37.5, 18.5, 32, 2.2), leaf(24, 37.5, 29.5, 32, 2.2),
    ],
    salamasadr: [ // still water, nothing stirring under the sky
      C(24, 24, 15), P('M9 26 L39 26'), P('M13 31 C17 30 19 32 24 31 C29 30 31 32 35 31'), P('M17 36 C20 35.3 22 36.7 24 36 C26 35.3 28 36.7 31 36'),
      P('M17 20 A7 7 0 0 1 31 20'), spark(36, 13, 1.6), spark(12, 14, 1.2),
    ],
    dahsha: [ // a spyglass turned up to the stars
      P('M8 40 L28 24 L31.6 28.6 L11.6 44.6 Z'), P('M28 24 L33 20 L36.6 24.6 L31.6 28.6'), P('M19 32.5 L14 42 M20 33.2 L27 42'), P('M10 44 L31 44'),
      spark(38, 9, 3), spark(28, 9, 1.6), spark(42, 18, 1.4), C(20, 13, 0.8),
    ],
    sidq: [ // the plumb line: true and straight
      P('M10 7 L38 7'), P('M24 7 L24 30'), P('M24 30 L20 36 L24 42 L28 36 Z'), P('M15 7 L15 11 M33 7 L33 11'), spark(36, 32, 2), spark(12, 26, 1.4),
    ],
  });

  Object.assign(I, {
    wafa: [ // two rings, linked and kept
      C(18.5, 25, 10), C(29.5, 25, 10), P('M24 16.8 L24 19 M24 31 L24 33.2'), spark(38.5, 9.5, 2), spark(9, 40, 1.4),
    ],
    shifa: [ // a leaf that mends, and the sign of healing on it
      leaf(10, 40, 37, 11, 9, 1), P('M10 40 L28 22'), P('M27 12 L27 22 M22 17 L32 17'), spark(39, 30, 1.8), spark(13, 13, 1.4),
    ],
    dawa: [ // the mortar and its pestle, and the herb ground in it
      P('M9 25 L39 25 C39 34 32.5 40 24 40 C15.5 40 9 34 9 25 Z'), P('M17 43 L31 43 M20 40 L19 43 M28 40 L29 43'), P('M26 25 L37 8.5'), P('M35.2 7.4 C36.6 6.2 39 7.7 38.6 9.6'),
      leaf(15, 25, 11, 16, 2), leaf(20, 25, 21.5, 15.5, 2), spark(9, 10, 1.6),
    ],
    lams: [ // a feather, light enough to be felt
      P('M12 40 C16 30 22 19 36 8'), P('M36 8 C38 16 36 24 28 30 C24 33 20 34 16.5 34.5'), P('M36 8 C29 9 22 13 18 20 C16 24 15.5 28 15 32'),
      P('M30 15 L33.5 17.5 M26 20 L30.8 22.4 M22 25 L26.4 27.2 M27 13.8 L25 17 M23 18.4 L21 22'), P('M28 40 C31 38 33 42 36 40'), P('M30 44 C33 42 35 46 38 44'),
    ],
    shamm: [ // a flower, and its scent rising
      P('M18 44 L18 30'), leaf(18, 38, 11, 34, 2.2), C(18, 24.5, 2.6), leaf(18, 22, 18, 14.5, 2.6), leaf(20.5, 24.5, 27.5, 22, 2.6), leaf(15.5, 24.5, 8.5, 22, 2.6), leaf(19.5, 27, 24.5, 31.5, 2.4), leaf(16.5, 27, 11.5, 31.5, 2.4),
      P('M28 16 C26 13 30 11 28 8 M33 19 C31 16 35 14 33 11 M38 22 C36 19 40 17 38 14'),
    ],
    asnan: [ // a tooth, sound and whole
      P('M14 10 C18 8 21 11 24 11 C27 11 30 8 34 10 C39 12.5 38.5 20 36 25 C34.5 28 34 32 33 37 C32.3 40.5 29.5 41 28.8 37.5 C28 33 27 29 24 29 C21 29 20 33 19.2 37.5 C18.5 41 15.7 40.5 15 37 C14 32 13.5 28 12 25 C9.5 20 9 12.5 14 10 Z'),
      P('M17.5 14.5 C18.5 13.6 19.8 13.6 21 14.3'), spark(40, 34, 1.8), spark(8, 32, 1.4),
    ],
    izam: [ // a bone, the frame that holds you
      P('M15.5 30.5 L30.5 15.5'), P('M15.5 30.5 C13.5 32.5 13.6 35 12 36 C9.5 37.5 7.5 34.5 9.5 32.8 C7 33.5 6 30 8.5 29 C10.2 28.3 12 30 13.6 28.4'),
      P('M30.5 15.5 C32.5 13.5 32.4 11 34 10 C36.5 8.5 38.5 11.5 36.5 13.2 C39 12.5 40 16 37.5 17 C35.8 17.7 34 16 32.4 17.6'), P('M17.6 32.6 L32.6 17.6 M13.6 28.4 L28.4 13.6'),
      spark(38, 34, 2), spark(11, 13, 1.4),
    ],
    dam: [ // the heart, and the flow that goes out from it and returns
      heart(24, 26, 9), P('M24 37 C24 41 28 43 33 43 C40 43 43 37 43 30 C43 21 39 13 32 10'), P('M32 10 L35.2 8 M32 10 L33.2 13.6'),
      P('M24 15 C24 11 20 7 15 7 C8 7 5 13 5 20 C5 29 9 35 16 38'), P('M16 38 L12.6 39.4 M16 38 L15.2 34.4'),
    ],
    hadm: [ // a bowl, and the slow turn that makes food strength
      P('M8 22 L40 22 C40 31 33 37 24 37 C15 37 8 31 8 22 Z'), P('M16 40.5 L32 40.5'), P('M18 30 C18 26 22 25.5 24 27.5 C26 29.5 30 29 30 26'),
      P('M19 17 C17 14 21 12 19 9 M24 17 C22 14 26 12 24 9 M29 17 C27 14 31 12 29 9'),
    ],
    manaa: [ // a ring of guards around the heart
      heart(24, 25.5, 9.5), ring(24, 25, 16, 12, 1.3), spark(39.5, 8.5, 1.6),
    ],
  });

  Object.assign(I, {
    jild: [ // the sun's heat stopped at a soft, layered cover
      C(24, 11, 4), P('M24 3.5 L24 4.5 M16.5 11 L17.5 11 M31.5 11 L30.5 11 M18.6 5.6 L19.4 6.4 M29.4 5.6 L28.6 6.4'), P('M18 18 L16 22 M24 18 L24 22 M30 18 L32 22'),
      P('M5 28 C11 24 17 24 24 28 C31 32 37 32 43 28'), P('M5 34 C11 30 17 30 24 34 C31 38 37 38 43 34'), P('M5 40 C11 36 17 36 24 40 C31 44 37 44 43 40'),
    ],
    sawt: [ // a voice carried out as waves
      P('M6 24 L9 24 M10.5 19 L10.5 29 M15 14 L15 34 M19.5 18 L19.5 30 M24 10 L24 38 M28.5 16 L28.5 32 M33 20 L33 28 M37.5 15 L37.5 33 M42 23 L42 25'), spark(40, 8, 1.8),
    ],
    tawazun: [ // stones resting one on another, each in balance
      P('M6 42 L42 42'), E(24, 37.5, 11, 4.5), E(23, 28.5, 8, 3.8), E(25, 20.8, 6, 3.2), E(24, 14.2, 4, 2.6), spark(36, 11, 2), spark(11, 18, 1.4),
    ],
    tufula: [ // a kite climbing, its tail of bows behind
      P('M30 6 L40 16 L30 30 L20 16 Z'), P('M30 6 L30 30 M20 16 L40 16'), P('M30 30 C27 35 22 33 19 38 C16.5 42 12 41 9 44'),
      P('M24.5 33.5 L22 31 M24.5 33.5 L22 36 M15.6 40.6 L13 38.4 M15.6 40.6 L14 43.4'), spark(10, 10, 2),
    ],
    shabab: [ // a young tree, straight and rising
      P('M24 44 L24 12'), leaf(24, 20, 14, 12, 3.2), leaf(24, 20, 34, 12, 3.2), leaf(24, 28, 13, 23, 3), leaf(24, 28, 35, 23, 3), leaf(24, 13, 24, 4, 2.8), P('M15 44 L33 44'), spark(40, 34, 1.8),
    ],
    umr: [ // the rings of a tree: year upon year
      C(24, 24, 17), C(24.6, 24.4, 13), C(25, 25, 9.4), C(25.4, 25.4, 5.8), C(25.6, 25.6, 2.4), P('M33 10 L30 16.4'), spark(42, 6.5, 1.6),
    ],
    libas: [ // a garment on its hanger
      P('M24 9.5 C24 6.5 27.5 6.5 27.5 8.6 C27.5 10.4 24 10.6 24 13'), P('M24 13 L9 21 M24 13 L39 21'),
      P('M17 17 L10 22 L13 27 L16 25.5 L16 43 L32 43 L32 25.5 L35 27 L38 22 L31 17 C29 19 19 19 17 17 Z'), P('M24 19 L24 30'), C(24, 23, 0.6), C(24, 27, 0.6),
    ],
    istiqaz: [ // a window opened on the new morning
      R(9, 9, 30, 33, 1.5), P('M24 9 L24 42 M9 26 L39 26'), P('M12 26 A7 7 0 0 1 26 26'), P('M13 20 L11.4 18.6 M19 16.5 L19 14.5'), P('M28 35 L36 35 M29 31 L35 31'), P('M6 42 L42 42'),
    ],
    raha: [ // a warm cup, and time to sit with it
      P('M11 22 L33 22 L31 37 C30.6 39.5 29 41 26.5 41 L17.5 41 C15 41 13.4 39.5 13 37 Z'), P('M33 25 C38 25 39 30 35.5 32.5 C34.5 33.2 33 33.4 31.8 33.3'), P('M7 44 L37 44'),
      P('M17 17 C15 14 19 12 17 9 M22 17 C20 14 24 12 22 9 M27 17 C25 14 29 12 27 9'), spark(40, 12, 1.6),
    ],
    irada: [ // a signpost at the fork: the choice is yours
      P('M24 44 L24 9'), P('M24 12 L37 12 L41 16 L37 20 L24 20'), P('M24 24 L11 24 L7 28 L11 32 L24 32'), C(24, 7.5, 1.5), P('M15 44 L33 44'),
    ],
  });

  Object.assign(BY_BLESSING, {
    blessing_161: 'jild', blessing_162: 'sawt', blessing_163: 'tawazun', blessing_164: 'tufula', blessing_165: 'shabab',
    blessing_166: 'umr', blessing_167: 'libas', blessing_168: 'istiqaz', blessing_169: 'raha', blessing_170: 'irada',
  });

  Object.assign(BY_BLESSING, {
    blessing_151: 'wafa', blessing_152: 'shifa', blessing_153: 'dawa', blessing_154: 'lams', blessing_155: 'shamm',
    blessing_156: 'asnan', blessing_157: 'izam', blessing_158: 'dam', blessing_159: 'hadm', blessing_160: 'manaa',
  });

  Object.assign(BY_BLESSING, {
    blessing_141: 'hubb', blessing_142: 'tawadu', blessing_143: 'anah', blessing_144: 'shajaa', blessing_145: 'hubbkhayr',
    blessing_146: 'injaz', blessing_147: 'huzn', blessing_148: 'salamasadr', blessing_149: 'dahsha', blessing_150: 'sidq',
  });

  Object.assign(BY_BLESSING, {
    blessing_131: 'diyafa', blessing_132: 'hadiyya', blessing_133: 'salam', blessing_134: 'kalima', blessing_135: 'khuluq',
    blessing_136: 'jamaa', blessing_137: 'muwasat', blessing_138: 'qudwa', blessing_139: 'maruf', blessing_140: 'rahmaqalb',
  });

  Object.assign(BY_BLESSING, {
    blessing_121: 'nakhl', blessing_122: 'zaytun', blessing_123: 'alwan', blessing_124: 'zawjiyya', blessing_125: 'maaadhb',
    blessing_126: 'shajar', blessing_127: 'barq', blessing_128: 'ikhwa', blessing_129: 'ajdad', blessing_130: 'ahfad',
  });

  Object.assign(BY_BLESSING, {
    blessing_111: 'rahmawasia', blessing_112: 'mudaafa', blessing_113: 'dhulhijja', blessing_114: 'nasiha', blessing_115: 'rusul',
    blessing_116: 'samamahfuza', blessing_117: 'anhar', blessing_118: 'sahab', blessing_119: 'fajr', blessing_120: 'fusul',
  });

  Object.assign(BY_BLESSING, {
    blessing_101: 'tahara', blessing_102: 'adhan', blessing_103: 'siyam', blessing_104: 'sadaqa', blessing_105: 'qiyam', blessing_106: 'istighfar',
    blessing_107: 'salatnabi', blessing_108: 'eid', blessing_109: 'haya', blessing_110: 'khushu',
  });
})();
