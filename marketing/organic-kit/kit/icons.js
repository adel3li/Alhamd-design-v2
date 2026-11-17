/*
 * Alhamd organic kit — one line icon per blessing (48-unit grid, round caps, one stroke weight).
 * Every icon is a list of SVG elements that use currentColor, so the same drawing serves
 * «ليل» (gold) and «نهار» (terracotta). `medal()` sets an icon inside the brand's ring.
 * Elements carry pathLength="1" so reels can draw them stroke by stroke.
 */
(function () {
  const f = (n) => +n.toFixed(2);
  const P = (d) => `<path d="${d}"/>`;
  const C = (x, y, r) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
  const E = (x, y, rx, ry) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}"/>`;
  const R = (x, y, w, h, r = 0) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}"/>`;
  /** Four-point sparkle (filled), the brand's star. */
  const spark = (x, y, s) => `<path class="fill" d="M${f(x)} ${f(y - s)} Q${f(x)} ${f(y)} ${f(x + s)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y + s)} Q${f(x)} ${f(y)} ${f(x - s)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y - s)} Z"/>`;
  /** Heart centred on (cx, cy), width ≈ 2s. */
  const heart = (cx, cy, s) => {
    const k = s / 16;
    const p = (x, y) => `${f(cx + x * k)} ${f(cy + y * k)}`;
    return P(`M${p(0, 13)} C${p(-10, 6)} ${p(-16, 0)} ${p(-16, -7.5)} C${p(-16, -12.5)} ${p(-12, -16)} ${p(-7.5, -16)} C${p(-4, -16)} ${p(-1.4, -14)} ${p(0, -11)} C${p(1.4, -14)} ${p(4, -16)} ${p(7.5, -16)} C${p(12, -16)} ${p(16, -12.5)} ${p(16, -7.5)} C${p(16, 0)} ${p(10, 6)} ${p(0, 13)} Z`);
  };
  /** Rounded tree crown + trunk. */
  const tree = (cx, top, w, h, trunkTo) => {
    const x0 = cx - w / 2, x1 = cx + w / 2, y1 = top + h;
    return P(`M${f(cx)} ${f(y1)} C${f(x0 - w * 0.05)} ${f(y1)} ${f(x0 - w * 0.1)} ${f(top + h * 0.55)} ${f(x0 + w * 0.12)} ${f(top + h * 0.3)} C${f(x0 + w * 0.25)} ${f(top + h * 0.05)} ${f(cx - w * 0.12)} ${f(top - h * 0.04)} ${f(cx)} ${f(top)} C${f(cx + w * 0.12)} ${f(top - h * 0.04)} ${f(x1 - w * 0.25)} ${f(top + h * 0.05)} ${f(x1 - w * 0.12)} ${f(top + h * 0.3)} C${f(x1 + w * 0.1)} ${f(top + h * 0.55)} ${f(x1 + w * 0.05)} ${f(y1)} ${f(cx)} ${f(y1)} Z`) +
      P(`M${f(cx)} ${f(y1)} L${f(cx)} ${f(trunkTo)}`);
  };
  /** A small hanging lantern centred on cx. */
  const lantern = (cx, top, s = 1) => {
    const X = (d) => f(cx + d * s), Y = (d) => f(top + d * s);
    return C(cx, top + 2 * s, 2 * s) +
      P(`M${X(-6.5)} ${Y(10)} L${X(0)} ${Y(4)} L${X(6.5)} ${Y(10)} Z`) +
      P(`M${X(-8)} ${Y(10)} L${X(8)} ${Y(10)} L${X(6)} ${Y(28)} L${X(-6)} ${Y(28)} Z`) +
      P(`M${X(-3.4)} ${Y(25)} L${X(-3.4)} ${Y(17)} C${X(-3.4)} ${Y(15)} ${X(-1.8)} ${Y(13.6)} ${X(0)} ${Y(13.2)} C${X(1.8)} ${Y(13.6)} ${X(3.4)} ${Y(15)} ${X(3.4)} ${Y(17)} L${X(3.4)} ${Y(25)} Z`) +
      P(`M${X(-6)} ${Y(28)} L${X(-4)} ${Y(32)} L${X(4)} ${Y(32)} L${X(6)} ${Y(28)}`) +
      P(`M${X(0)} ${Y(32)} L${X(0)} ${Y(35.5)}`);
  };
  const ring = (cx, cy, r, n, rb, skip = 0) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = Math.PI / 2 + skip / 2 + (i * (2 * Math.PI - skip)) / (n - 1);
      s += C(cx + r * Math.cos(a), cy + r * Math.sin(a), rb);
    }
    return s;
  };

  const I = {
    // ——— نعم الدين ———
    islam: [ // the Kaaba with its band and door
      P('M10 17 L24 11 L38 17 L38 35 L24 41 L10 35 Z'), P('M10 17 L24 23 L38 17'), P('M24 23 L24 41'),
      P('M10 22.5 L24 28.5 L38 22.5'), P('M28.5 30.4 L32.5 28.7 L32.5 34.4 L28.5 36.1 Z'),
    ],
    marifa: [ // light: the eight-point star of the lattice
      P('M14 14 L34 14 L34 34 L14 34 Z'), P('M24 9.86 L38.14 24 L24 38.14 L9.86 24 Z'), C(24, 24, 4.2),
    ],
    quran: [ // an open mushaf on its stand
      P('M24 15.5 C20 12.5 14 12 8.5 13 L8.5 29.5 C14 28.5 20 29 24 32'), P('M24 15.5 C28 12.5 34 12 39.5 13 L39.5 29.5 C34 28.5 28 29 24 32'),
      P('M24 15.5 L24 32'), P('M15.5 31.2 L32.5 42'), P('M32.5 31.2 L15.5 42'),
    ],
    nabi: [ // the green dome
      P('M9 40.5 L39 40.5'), P('M13 40.5 L13 31 L35 31 L35 40.5'), P('M14.5 31 C14.5 22.5 19 18 24 16.8 C29 18 33.5 22.5 33.5 31'),
      P('M24 16.8 L24 11.5'), C(24, 9.3, 1.9), P('M18.5 40.5 L18.5 36.6 A2.2 2.2 0 0 1 22.9 36.6 L22.9 40.5'), P('M25.1 40.5 L25.1 36.6 A2.2 2.2 0 0 1 29.5 36.6 L29.5 40.5'),
    ],
    salah: [ // a prayer rug with its niche
      P('M15 7.5 L33 7.5 L33 40.5 L15 40.5 Z'), P('M19 36.5 L19 19.5 C19 15.5 21.5 13 24 12 C26.5 13 29 15.5 29 19.5 L29 36.5 Z'),
      P('M18 7.5 L18 4.5 M22 7.5 L22 4.5 M26 7.5 L26 4.5 M30 7.5 L30 4.5'), P('M18 40.5 L18 43.5 M22 40.5 L22 43.5 M26 40.5 L26 43.5 M30 40.5 L30 43.5'),
    ],
    duaa: [ // cupped hands, and light rising
      P('M8 25 C10 34.5 16 39.5 24 39.5 C32 39.5 38 34.5 40 25'), P('M8 25 C14 28.6 19.5 29.6 24 29.6 C28.5 29.6 34 28.6 40 25'), P('M24 29.6 L24 39.5'),
      P('M8 25 C6.8 22.6 7.3 20.4 9.2 19.4'), P('M40 25 C41.2 22.6 40.7 20.4 38.8 19.4'),
      P('M24 7 L24 18'), P('M15.2 10.4 L18.6 18.6'), P('M32.8 10.4 L29.4 18.6'),
    ],
    tawba: [ // a door left open, light coming through
      P('M7.5 41 L40.5 41'), P('M13 41 L13 8.5 L35 8.5 L35 41'), P('M13 8.5 L23 12.2 L23 38.5 L13 41'), C(20.4, 26, 0.9),
      P('M27.5 17.5 L32.5 15.5'), P('M27.5 25 L33.5 25'), P('M27.5 32.5 L32.5 34.5'),
    ],
    thabat: [ // a tree, its roots held fast
      tree(24, 7.5, 25, 21, 35.5), P('M24 35.5 C22.5 38.5 19 40 14.5 40.6'), P('M24 35.5 C25.5 38.5 29 40 33.5 40.6'), P('M24 35.5 C23.6 38.8 24.4 41 24 43.5'),
      P('M20.6 39.4 C19.8 41 18.4 42.2 16.6 43'), P('M27.4 39.4 C28.2 41 29.6 42.2 31.4 43'),
    ],
    dhikr: [ // a string of beads
      ring(24, 20.5, 12.5, 12, 2.2, 1.1), P('M24 33 L24 37.5'), P('M24 37.5 L20.8 44'), P('M24 37.5 L24 44.5'), P('M24 37.5 L27.2 44'),
    ],
    satr: [ // a garment that covers
      P('M17 8.5 L21 7 C22 9.7 26 9.7 27 7 L31 8.5 L40 18.5 L35.4 22.6 L32.4 19.6 L34 42 L14 42 L15.6 19.6 L12.6 22.6 L8 18.5 Z'), P('M24 11.5 L24 20'), P('M19 42 L19.8 30 M29 42 L28.2 30'),
    ],
    fitra: [ // a seedling
      P('M12 40.5 L36 40.5'), P('M24 40.5 L24 22.5'), P('M24 29 C18 29 13 25 12 18 C19 18 23 22 24 29 Z'), P('M24 23.5 C25 16.5 30 12.5 37 12.5 C36 19.5 31 23.5 24 23.5 Z'),
    ],
    ramadan: [ // a lantern
      lantern(24, 4.5, 1.08), spark(36.5, 13, 2.6), spark(11.5, 21, 2),
    ],
    // ——— نعم الحياة والنفس ———
    hayat: [ // a heartbeat
      P('M5.5 25 L15 25 L18.5 18 L23 34 L27.5 13 L31 25 L42.5 25'),
    ],
    nawm: [ // a crescent and stars
      P('M22.88 11.16 A14 14 0 1 0 38.23 29.58 A12 12 0 0 1 22.88 11.16 Z'), spark(36, 11, 2.8), spark(40.5, 20.5, 1.8),
    ],
    maa: [ // a drop of water
      P('M24 7 C24 7 13 20 13 28 C13 34.5 18 39 24 39 C30 39 35 34.5 35 28 C35 20 24 7 24 7 Z'), P('M18.5 28.5 C18.5 31.5 20.5 33.8 23 34.2'),
    ],
    taam: [ // a bowl, still warm
      P('M9 25 L39 25 C39 33 32.5 39 24 39 C15.5 39 9 33 9 25 Z'), P('M19.5 39 L18.5 42 L29.5 42 L28.5 39'),
      P('M18 20.5 C16 18 20 16 18 12.5'), P('M24 20.5 C22 17.5 26 15 24 11.5'), P('M30 20.5 C28 18 32 16 30 12.5'),
    ],
    nafas: [ // breath, as wind
      P('M8 18 L28 18 C32 18 34 15.5 34 13 C34 10.3 31.8 8.5 29.5 8.5 C27.3 8.5 25.6 10 25.4 12'),
      P('M8 25 L36 25 C39.5 25 41.5 27.5 41.5 30.5 C41.5 33.5 39 35.5 36.5 35.5 C34 35.5 32.2 33.8 32 31.5'),
      P('M8 32 L21 32 C24 32 26 34 26 36.5 C26 38.8 24.3 40.5 22 40.5'),
    ],
    laylnahar: [ // the sun, and the moon after it
      C(16, 17, 5.5), P('M16 7.5 L16 9.5 M16 24.5 L16 26.5 M6.5 17 L8.5 17 M23.5 17 L25.5 17 M9.3 10.3 L10.7 11.7 M21.3 22.3 L22.7 23.7 M22.7 10.3 L21.3 11.7 M10.7 22.3 L9.3 23.7'),
      P('M33.2 23.1 A9 9 0 1 0 40.6 37.4 A7.6 7.6 0 0 1 33.2 23.1 Z'),
    ],
    // ——— نعم العقل ———
    aql: [ // a lamp, lit
      P('M24 9.5 C17.6 9.5 13.2 14.2 13.2 19.8 C13.2 23.7 15.1 26.4 17.5 28.5 C18.9 29.8 19.6 31.2 19.6 32.8 L28.4 32.8 C28.4 31.2 29.1 29.8 30.5 28.5 C32.9 26.4 34.8 23.7 34.8 19.8 C34.8 14.2 30.4 9.5 24 9.5 Z'),
      P('M20 36.3 L28 36.3'), P('M21.4 39.8 L26.6 39.8'), P('M21 27 C21 24.2 22.2 22.6 24 22.6 C25.8 22.6 27 24.2 27 27 L27 32.8 M21 27 L21 32.8'),
      P('M24 3.5 L24 5.5 M9 9 L10.6 10.6 M39 9 L37.4 10.6 M5.6 20 L7.8 20 M42.4 20 L40.2 20'),
    ],
    ilm: [ // a pen, and the line it writes
      P('M26.2 33.8 L39.2 12.6 C39.9 11.4 41.6 11.2 42.6 12.1 C43.5 12.9 43.6 14.4 42.8 15.4 L29.6 35.9 Z'), P('M26.2 33.8 L25 39.4 L29.6 35.9'),
      P('M6.5 39.5 C10.5 36.4 13.4 42.4 17.4 39.4 C20.4 37.1 22.2 40.6 24.2 40'),
    ],
    bayan: [ // speech
      P('M10.5 11.5 L37.5 11.5 C39.7 11.5 41 12.8 41 15 L41 28.5 C41 30.7 39.7 32 37.5 32 L22 32 L14 38.8 L15 32 L10.5 32 C8.3 32 7 30.7 7 28.5 L7 15 C7 12.8 8.3 11.5 10.5 11.5 Z'),
      P('M14 19 L34 19'), P('M14 25 L27.5 25'),
    ],
    // ——— نعم الأهل ———
    umm: [ // a heart that holds a smaller one
      heart(24, 24.5, 17), heart(24, 26.6, 6.6),
    ],
    ab: [ // a tall tree beside a young one
      tree(19, 10.5, 15, 15.5, 41), tree(32.5, 24.5, 9.5, 8.8, 41), P('M8.5 41 L39.5 41'),
    ],
    zawj: [ // two rings, joined
      C(19, 27, 9.2), C(29, 27, 9.2), P('M29 13.4 L31.4 15.8 L29 18.2 L26.6 15.8 Z'),
    ],
    awlad: [ // three flowers
      P('M17 41.5 C17 35 15.2 31 13 27.4'), P('M24 41.5 L24 23.2'), P('M31 41.5 C31 35 32.8 31 35 27.4'),
      C(12.4, 24.2, 3.3), C(24, 19.4, 3.8), C(35.6, 24.2, 3.3), P('M24 34 C27 31.8 30.3 31.8 32.4 33.2 C30.3 35.2 27 35.6 24 34 Z'),
    ],
    arham: [ // links of one chain
      R(5.5, 19, 15.5, 10, 5), R(16.25, 19, 15.5, 10, 5), R(27, 19, 15.5, 10, 5),
    ],
    suhba: [ // two lanterns side by side
      lantern(16.5, 6, 0.86), lantern(31.5, 9.5, 0.86),
    ],
    // ——— نعم الرزق والمال ———
    rizq: [ // an ear of wheat
      P('M24 43 L24 12.5'), P('M24 12.5 C22.4 10 22.4 7.2 24 5 C25.6 7.2 25.6 10 24 12.5 Z'),
      ...[16, 22, 28, 34].map((y) => P(`M24 ${y} C20.2 ${y - 0.8} 17.8 ${y - 3.8} 17.6 ${y - 7.2} C20.8 ${y - 6.4} 23.4 ${y - 4.2} 24 ${y} Z`) + P(`M24 ${y} C27.8 ${y - 0.8} 30.2 ${y - 3.8} 30.4 ${y - 7.2} C27.2 ${y - 6.4} 24.6 ${y - 4.2} 24 ${y} Z`)),
    ],
    mal: [ // a stack of coins
      E(24, 13.5, 11, 4), P('M13 13.5 L13 19.5 C13 21.7 18 23.5 24 23.5 C30 23.5 35 21.7 35 19.5 L35 13.5'),
      P('M13 19.5 L13 25.5 C13 27.7 18 29.5 24 29.5 C30 29.5 35 27.7 35 25.5 L35 19.5'), P('M13 25.5 L13 31.5 C13 33.7 18 35.5 24 35.5 C30 35.5 35 33.7 35 31.5 L35 25.5'),
      spark(39.5, 38.5, 2.6),
    ],
    amal: [ // a work bag
      R(8, 17, 32, 22, 3.2), P('M18 17 L18 13.2 C18 12 19 11 20.2 11 L27.8 11 C29 11 30 12 30 13.2 L30 17'), P('M8 26.5 L40 26.5'), R(21.5, 24, 5, 5, 1),
    ],
    qanaa: [ // a chest: contentment is a treasure
      P('M8.5 22 L8.5 18.5 C8.5 12 15 9 24 9 C33 9 39.5 12 39.5 18.5 L39.5 22 Z'), R(8.5, 22, 31, 17.5, 1.6), P('M15 10.4 L15 39.5'), P('M33 10.4 L33 39.5'),
      R(21.4, 19.4, 5.2, 7, 1.2), spark(41.5, 6.5, 2.6), spark(6.5, 9, 1.8),
    ],
    // ——— نعم الأمن ———
    amn: [ // a gate between two towers
      P('M5 41 L43 41'), P('M8 41 L8 16 L16 16 L16 41'), P('M32 41 L32 16 L40 16 L40 41'),
      P('M8 16 L8 12.5 L10.7 12.5 L10.7 16 M13.3 16 L13.3 12.5 L16 12.5 L16 16'), P('M32 16 L32 12.5 L34.7 12.5 L34.7 16 M37.3 16 L37.3 12.5 L40 12.5 L40 16'),
      P('M16 22 L32 22'), P('M19.5 41 L19.5 30.5 C19.5 27.6 21.5 25.6 24 25.6 C26.5 25.6 28.5 27.6 28.5 30.5 L28.5 41'),
    ],
    bayt: [ // a home with a lit window
      P('M8 23 L24 10 L40 23'), P('M12 20 L12 40 L36 40 L36 20'), P('M20.5 40 L20.5 31.5 C20.5 29.5 22 28 24 28 C26 28 27.5 29.5 27.5 31.5 L27.5 40'),
      `<rect class="fill soft" x="15" y="24" width="4.6" height="4.6" rx="0.8"/>`, R(15, 24, 4.6, 4.6, 0.8),
    ],
    hifz: [ // a shield with light in it
      P('M24 41.5 C24 41.5 38 35 38 23 L38 12.5 L24 7.5 L10 12.5 L10 23 C10 35 24 41.5 24 41.5 Z'), spark(24, 24, 6.5),
    ],
    // ——— نعم العافية ———
    afiya: [ // a leaf in health
      P('M10 38 C10 22 20 10 39 9 C39 28 28 38 10 38 Z'), P('M10 38 C18 30 25.5 22 33 15'), P('M19.2 28.6 L18.4 22.8'), P('M24.6 22.8 L30.2 23.4'),
    ],
    sam: [ // an ear, and the sound reaching it
      P('M30 37 C27 41 21.5 40.5 20.5 36 C19.8 33 22 31 22.5 28.5 C23 26 20 24.5 19 22 C17 17.5 19.5 10 26.5 9.5 C33 9 36.5 14 36 19.5 C35.7 23 33.5 24.5 33 27'),
      P('M24 21.5 C24 17.5 26 15.5 28.5 15.5 C31 15.5 32 17.5 31.6 19.8 C31.2 22 29 22.6 28.5 24.5'),
      P('M13 18 C11 21 11 25 13 28'), P('M9 14.5 C6 20 6 26 9 31.5'),
    ],
    basar: [ // an eye
      P('M5 24 C10 15 17 11.5 24 11.5 C31 11.5 38 15 43 24 C38 33 31 36.5 24 36.5 C17 36.5 10 33 5 24 Z'), C(24, 24, 7), C(24, 24, 2.4),
    ],
    haraka: [ // two footsteps
      P('M14 38 C11.5 38 10.5 35.5 11 32.5 C11.6 29 13.5 26.5 16 26.5 C18.6 26.5 19.8 29 19.5 32 C19.2 35.5 17 38 14 38 Z'),
      C(11.9, 23.6, 1.1), C(14.1, 22.6, 1.25), C(16.5, 22.8, 1.2), C(18.6, 23.9, 1.05),
      P('M30 26 C27.5 26 26.5 23.5 27 20.5 C27.6 17 29.5 14.5 32 14.5 C34.6 14.5 35.8 17 35.5 20 C35.2 23.5 33 26 30 26 Z'),
      C(27.9, 11.6, 1.1), C(30.1, 10.6, 1.25), C(32.5, 10.8, 1.2), C(34.6, 11.9, 1.05),
    ],
    // ——— الوقت والجنة ———
    waqt: [ // an hourglass
      P('M13 8 L35 8'), P('M13 40 L35 40'), P('M15.5 8 C15.5 16 21 19.5 22.5 24 C21 28.5 15.5 32 15.5 40'), P('M32.5 8 C32.5 16 27 19.5 25.5 24 C27 28.5 32.5 32 32.5 40'),
      P('M18.6 37.6 C20 34.2 22.4 32.6 24 32.6 C25.6 32.6 28 34.2 29.4 37.6 Z'), P('M24 24.5 L24 31.6'), P('M19.4 14 L28.6 14'),
    ],
    janna: [ // a garden gate, a tree within
      P('M10 41 L10 20 C10 12 16.5 7 24 7 C31.5 7 38 12 38 20 L38 41'), P('M15 41 L15 21 C15 15.5 19 12 24 12 C29 12 33 15.5 33 21 L33 41'),
      tree(24, 21.5, 10, 8.5, 41), P('M6.5 41 L41.5 41'),
    ],
  };

  /** blessing id (from src/data/blessings_ar.json) → icon name */
  const BY_BLESSING = {
    islam: 'islam', blessing_002: 'marifa', blessing_003: 'quran', blessing_004: 'nabi', blessing_005: 'salah', blessing_006: 'duaa',
    blessing_007: 'tawba', blessing_008: 'thabat', blessing_009: 'dhikr', blessing_010: 'satr', blessing_011: 'fitra', blessing_012: 'ramadan',
    blessing_013: 'hayat', blessing_014: 'nawm', blessing_015: 'maa', blessing_016: 'taam', blessing_017: 'nafas', blessing_018: 'laylnahar',
    blessing_019: 'aql', blessing_020: 'ilm', blessing_021: 'bayan', blessing_022: 'umm', blessing_023: 'ab', blessing_024: 'zawj',
    blessing_025: 'awlad', blessing_026: 'arham', blessing_027: 'suhba', blessing_028: 'rizq', blessing_029: 'mal', blessing_030: 'amal',
    blessing_031: 'qanaa', blessing_032: 'amn', blessing_033: 'bayt', blessing_034: 'hifz', blessing_035: 'afiya', blessing_036: 'sam',
    blessing_037: 'basar', blessing_038: 'haraka', blessing_039: 'waqt', blessing_040: 'janna',
  };

  /** The icon alone: <svg viewBox="0 0 48 48">. */
  function glyph(name, { sw = 1.6, cls = '' } = {}) {
    const els = (I[name] || I.marifa).join('').replace(/<(path|circle|ellipse|rect)(?![^>]*class="fill)/g, '<$1 pathLength="1"');
    return `<svg class="glyph ${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${els}</svg>`;
  }

  /** The icon in the brand's ring: <svg viewBox="0 0 100 100">. state: lit | dim | gone. */
  function medal(name, { sw = 1.55, state = 'lit', ring = true } = {}) {
    const els = (I[name] || I.marifa).join('').replace(/<(path|circle|ellipse|rect)(?![^>]*class="fill)/g, '<$1 pathLength="1"');
    const dash = state === 'gone' ? ' stroke-dasharray="0.035 0.05"' : '';
    return `<svg class="medal-svg ${state}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
      (ring ? `<circle class="m-halo" cx="50" cy="50" r="47" stroke-width="0.7" opacity="0.35"/><circle class="m-ring" pathLength="1" cx="50" cy="50" r="43.5" stroke-width="1.15"${dash}/>` : '') +
      `<g class="m-icon" transform="translate(21 21) scale(1.2083)" stroke-width="${sw}"${dash}>${els}</g></svg>`;
  }

  window.ICONS = { I, BY_BLESSING, glyph, medal, names: Object.keys(I) };
})();
