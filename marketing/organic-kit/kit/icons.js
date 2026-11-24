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

  /** A drop of water, tip up, centred on (x, y). */
  const drop = (x, y, s = 1) => P(`M${f(x)} ${f(y - 3.2 * s)} C${f(x - 1.2 * s)} ${f(y - 1.4 * s)} ${f(x - 2.3 * s)} ${f(y)} ${f(x - 2.3 * s)} ${f(y + 1.1 * s)} A${f(2.3 * s)} ${f(2.3 * s)} 0 0 0 ${f(x + 2.3 * s)} ${f(y + 1.1 * s)} C${f(x + 2.3 * s)} ${f(y)} ${f(x + 1.2 * s)} ${f(y - 1.4 * s)} ${f(x)} ${f(y - 3.2 * s)} Z`);

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
    // ——— blessings 41–100 (the packages of the first hundred) ———
    hidaya: [ // a compass, and the star it points to
      C(24, 27, 13.5), P('M24 16.5 L27.6 27 L24 37.5 L20.4 27 Z'), P('M20.4 27 L27.6 27'), spark(36.5, 9, 2.8), spark(10.5, 11, 1.8),
    ],
    sunna: [ // a scroll
      P('M13 11 C13 9.2 14.6 8 16.4 8 L35 8 C33.4 8 32 9.2 32 11 L32 37 C32 38.8 30.6 40 28.8 40 L10.4 40 C12 40 13 38.8 13 37 Z'),
      P('M32 11 C32 12.8 33.4 14 35 14 C36.6 14 38 12.8 38 11 C38 9.2 36.6 8 35 8'), P('M17.5 17 L27.5 17 M17.5 22.5 L27.5 22.5 M17.5 28 L23.5 28'),
    ],
    masajid: [ // a mosque, its dome and minaret
      P('M6.5 41 L41.5 41'), P('M10 41 L10 28.5 L29 28.5 L29 41'), P('M11 28.5 C11 21.5 15 17.4 19.5 15.6 C24 17.4 28 21.5 28 28.5'), P('M19.5 15.6 L19.5 11.8'), C(19.5, 10.2, 1.4),
      P('M33.5 41 L33.5 17.5 M38.5 41 L38.5 17.5'), P('M32.5 17.5 L39.5 17.5 L36 10.5 Z'), P('M33 25 L39 25'), P('M16.5 41 L16.5 35.5 C16.5 34 17.8 33 19.5 33 C21.2 33 22.5 34 22.5 35.5 L22.5 41'),
    ],
    ukhuwwa: [ // two hearts, side by side
      heart(18.2, 25.5, 9.8), heart(29.8, 25.5, 9.8),
    ],
    asma: [ // ninety-nine: a ring of beads around a star
      ring(24, 24, 15.5, 17, 1.25, (2 * Math.PI) / 17), spark(24, 24, 6.5),
    ],
    mahabba: [ // a heart, and light rising from it
      heart(24, 28, 12.5), P('M24 6 L24 10.5 M14.5 9.2 L16.6 13 M33.5 9.2 L31.4 13 M8.2 16.4 L11.8 18.4 M39.8 16.4 L36.2 18.4'),
    ],
    sabr: [ // a palm that stands in the wind
      P('M24 42 C23 34 23 26 24 17.5'), P('M24 17.5 C20 13.5 14.5 13.5 10 16.5'), P('M24 17.5 C28 13.5 33.5 13.5 38 16.5'), P('M24 17.5 C21 16.5 16.5 18.5 14.5 23'),
      P('M24 17.5 C27 16.5 31.5 18.5 33.5 23'), P('M24 17.5 C23 13.5 21 10 17.5 8'), P('M24 17.5 C25 13.5 27 10 30.5 8'), P('M22.6 29 L25.4 29 M22.8 35.5 L25.6 35.5'), P('M15 42 L33 42'),
    ],
    shukr: [ // a cup that overflows
      P('M14.5 19 L33.5 19 L30.8 38 C30.6 39.8 29.2 41 27.4 41 L20.6 41 C18.8 41 17.4 39.8 17.2 38 Z'), P('M14.5 19 C14.5 22 12.5 23.5 12.5 25.5 C12.5 26.8 13.4 27.6 14.4 27.6'),
      P('M33.5 19 C33.5 21 35 22.5 35 24'), spark(24, 10, 3.4), spark(33.5, 8.5, 1.9), spark(14.5, 10.5, 1.6),
    ],
    tawakkul: [ // a bird in flight, provided for
      P('M6 28 C11 21.5 17 21.5 22.5 27'), P('M22.5 27 C27 19 34 16.5 42 18.2'), P('M22.5 27 L24.6 31.2'), C(36, 33, 1.3), C(31, 37, 1.1), spark(11.5, 12.5, 2.6),
    ],
    ikhlas: [ // a single gem
      P('M11 18.5 L17.5 10 L30.5 10 L37 18.5 L24 40 Z'), P('M11 18.5 L37 18.5'), P('M17.5 10 L21 18.5 L24 40 L27 18.5 L30.5 10'),
    ],
    jumua: [ // a minaret under the noon sun
      P('M19.5 42 L19.5 19 M28.5 42 L28.5 19'), P('M17.5 19 L30.5 19'), P('M18.5 19 C18.5 14 21 10.6 24 8.8 C27 10.6 29.5 14 29.5 19'), P('M18 27.5 L30 27.5'), P('M22 42 L22 36.5 C22 35.4 22.9 34.5 24 34.5 C25.1 34.5 26 35.4 26 36.5 L26 42'),
      C(38.5, 10.5, 3.2), P('M38.5 4.6 L38.5 5.8 M38.5 15.2 L38.5 16.4 M32.6 10.5 L33.8 10.5 M43.2 10.5 L44.4 10.5'), P('M12 42 L36 42'),
    ],
    kaaba: [ // the House, and the circling around it
      P('M16.5 20.5 L24 17.5 L31.5 20.5 L31.5 31.5 L24 34.5 L16.5 31.5 Z'), P('M16.5 23.8 L24 26.8 L31.5 23.8'), P('M24 26.8 L24 34.5'),
      ...Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (0.05 + (i * 0.9) / 10); return C(24 + 18 * Math.cos(Math.PI + a), 33 + 7.5 * Math.sin(a), 1.15); }),
    ],
    qadr: [ // light coming down on a night of peace
      P('M14 6 L14 19 M24 4 L24 25 M34 6 L34 17'), spark(14, 23.5, 2.8), spark(24, 30.5, 3.6), spark(34, 21.5, 2.3), P('M7 41.5 L41 41.5'), P('M12 37 C16 34.6 20 34.6 24 37 C28 39.4 32 39.4 36 37'),
    ],
    yusr: [ // an easy road
      P('M7 39 C17 39 17 25 27 25 C33 25 35 19 39.5 13'), P('M34.2 12.4 L39.8 12.6 L39.6 18.2'), P('M7 43 L41 43'), C(12, 33, 1), C(19, 29, 1), C(27.5, 21, 1),
    ],
    qalb: [ // a heart that beats
      heart(24, 25, 16), P('M12.5 24 L17.5 24 L20 19 L24 30 L27 21.5 L29.2 24 L35.5 24'),
    ],
    dhawq: [ // a slice of citrus
      C(24, 25, 14.5), C(24, 25, 11.5), C(24, 25, 1.6),
      ...[0, 60, 120, 180, 240, 300].map((d) => { const a = (d * Math.PI) / 180; return P(`M${f(24 + 2.6 * Math.cos(a))} ${f(25 + 2.6 * Math.sin(a))} L${f(24 + 10.8 * Math.cos(a))} ${f(25 + 10.8 * Math.sin(a))}`); }),
    ],
    taqwim: [ // a balance, level
      P('M24 9 L24 39'), P('M15 40.5 L33 40.5'), P('M9 15 L39 15'), C(24, 9, 1.6),
      P('M9 15 L5 27 M9 15 L13 27'), P('M4 27 C4 31 14 31 14 27 Z'), P('M39 15 L35 27 M39 15 L43 27'), P('M34 27 C34 31 44 31 44 27 Z'),
    ],
    shams: [ // the sun
      C(24, 24, 8.5),
      ...Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return P(`M${f(24 + 12.5 * Math.cos(a))} ${f(24 + 12.5 * Math.sin(a))} L${f(24 + 17 * Math.cos(a))} ${f(24 + 17 * Math.sin(a))}`); }),
    ],
    qamar: [ // the full moon
      C(24, 24, 14.5), C(18.5, 19, 2.6), C(29, 27.5, 3.6), C(20.5, 31, 1.8), C(30, 16.5, 1.3),
    ],
    riyah: [ // a banner in the wind
      P('M12 42 L12 7.5'), P('M12 9 C18 5.8 22 13 28 10 C32 8 35 9 39 10.5 L39 23.5 C35 22 32 21 28 23 C22 26 18 19 12 22'), P('M17 33 L25 33 M20 37.5 L31 37.5'),
    ],
    ghayth: [ // a cloud, and rain from it
      P('M13 27 C9 27 7 24.5 7 21.5 C7 18.2 9.6 16 12.8 16.2 C13.8 11.6 17.6 8.5 22.4 8.5 C27.6 8.5 31.6 12.2 32.2 17 C35.6 16.4 39.5 18.6 39.5 22.4 C39.5 25.2 37.4 27 34.6 27 Z'),
      P('M14 32 L12 37 M21 32 L19 37 M28 32 L26 37 M35 32 L33 37'), P('M17.5 39.5 L16.5 42 M24.5 39.5 L23.5 42 M31.5 39.5 L30.5 42'),
    ],
    ard: [ // a plain spread out, and its furrows
      P('M5 30 L43 30'), P('M24 30 L20 42 M24 30 L28 42 M24 30 L13 42 M24 30 L35 42 M24 30 L7 41 M24 30 L41 41'), P('M15 30 A9 9 0 0 1 33 30'), P('M24 15.5 L24 12.5 M14.2 19.6 L12.2 17.6 M33.8 19.6 L35.8 17.6'),
    ],
    jibal: [ // mountains, as pegs
      P('M5 39 L17 17.5 L25 30 L31 21.5 L43 39 Z'), P('M13.2 24.2 L17 17.5 L20.8 23.6 C19.4 22.6 18.2 24.4 17 23.4 C15.8 24.4 14.6 22.8 13.2 24.2 Z'), P('M27.6 26.4 L31 21.5 L34.2 26.2'),
    ],
    bahr: [ // the sea
      P('M5 18 C9 14.5 13 14.5 17 18 C21 21.5 25 21.5 29 18 C33 14.5 37 14.5 41 18'), P('M5 27 C9 23.5 13 23.5 17 27 C21 30.5 25 30.5 29 27 C33 23.5 37 23.5 41 27'),
      P('M5 36 C9 32.5 13 32.5 17 36 C21 39.5 25 39.5 29 36 C33 32.5 37 32.5 41 36'),
    ],
    nabat: [ // a plant in leaf
      P('M24 42 L24 12'), P('M24 34 C19 34 15 31 14 26 C19 26 23 29 24 34 Z'), P('M24 27 C29 27 33 24 34 19 C29 19 25 22 24 27 Z'), P('M24 20 C20 20 17 17.5 16.5 13.5 C20.5 13.5 23.4 16 24 20 Z'),
      P('M24 12 C22.4 9.6 22.6 7.2 24 5.5 C25.4 7.2 25.6 9.6 24 12 Z'), P('M16 42 L32 42'),
    ],
    anam: [ // a sheep
      P('M13.5 27 C11 23.5 13.5 19 17.5 19.8 C18.8 15.8 24.6 15 27 18.2 C30 16 34.5 18.6 33.6 22.6 C36.2 24.6 35 29.6 31.4 29.6 L16 29.6 C12.6 29.6 11.6 27.8 13.5 27 Z'),
      P('M33.8 21.6 C35.4 18.6 40.8 18.8 41.2 22.8 C41.4 25.6 39 27.4 36.6 26.6'), P('M18 29.6 L18 37 M23 29.6 L23 37 M28 29.6 L28 37 M31.8 29.6 L31.8 37'), C(39, 22.4, 0.8),
    ],
    tayr: [ // birds held up in the sky
      P('M7 23 C10 19 13.6 19 15.8 22 C18 18 22 17 25.5 18.8'), P('M21 34 C24 30 27.6 30 29.8 33 C32 29 36 28 40 29.8'), P('M27.5 13.5 C29.5 10.8 31.8 10.8 33.3 12.8 C34.8 10.4 37.6 9.8 40.2 11.2'),
    ],
    nujum: [ // stars to guide by
      spark(20, 22, 7.5), spark(34.5, 12, 3.6), spark(33, 34, 2.8), C(11, 36, 1.2), C(40.5, 25, 1), C(10, 10, 1),
    ],
    zill: [ // a tree, and its shade
      tree(25, 7.5, 24, 19, 34.5), E(25.5, 37.5, 14.5, 3.2), C(9, 9, 2.6), P('M9 4.2 L9 5 M9 13 L9 13.8 M4.2 9 L5 9 M13 9 L13.8 9'),
    ],
    nar: [ // a flame
      P('M24 42 C16 42 12 36.5 13 30.5 C14 24.5 19 22.5 19 15.5 C24 18.5 26 22.5 25 27 C28 25 29 22.5 29 19.5 C34 23.5 36 28.5 35 33.5 C34 38.5 30 42 24 42 Z'),
      P('M24 42 C21 42 19.6 39.6 20 37.2 C20.5 34.6 23 33.2 23 30.4 C26 32.4 28 35.2 27.5 38.2 C27 40.6 26 42 24 42 Z'),
    ],
    laban: [ // a jug of milk
      P('M16 14 L30 14 L31 19 C35 22 35.5 26 35.5 30 L35.5 39.5 C35.5 40.9 34.4 42 33 42 L13 42 C11.6 42 10.5 40.9 10.5 39.5 L10.5 30 C10.5 26 11 22 15 19 Z'),
      P('M30 14 L34 11.5'), P('M15 19 L31 19'), P('M35.5 23 C40 23 41.5 26 41.5 29 C41.5 32 40 34.5 35.5 34.5'), P('M10.5 30 C15 28 20 32 24 30 C28 28 32 32 35.5 30'),
    ],
    asal: [ // honeycomb, and a drop of honey
      ...[[16, 15], [27, 15], [21.5, 24.5], [32.5, 24.5], [16, 34]].map(([x, y]) => P(`M${x - 5.2} ${y} L${x - 2.6} ${f(y - 4.5)} L${x + 2.6} ${f(y - 4.5)} L${x + 5.2} ${y} L${x + 2.6} ${f(y + 4.5)} L${x - 2.6} ${f(y + 4.5)} Z`)),
      P('M30 33 C30 33 26.5 37.4 26.5 40 C26.5 42 28.1 43.4 30 43.4 C31.9 43.4 33.5 42 33.5 40 C33.5 37.4 30 33 30 33 Z'),
    ],
    itqan: [ // orbits, each in its course
      C(24, 24, 4.2), `<ellipse cx="24" cy="24" rx="18.5" ry="7" transform="rotate(-28 24 24)"/>`, `<ellipse cx="24" cy="24" rx="18.5" ry="7" transform="rotate(28 24 24)"/>`,
      `<circle class="fill" cx="38.6" cy="16.6" r="1.8"/>`, `<circle class="fill" cx="10.8" cy="34.2" r="1.4"/>`,
    ],
    imsak: [ // the earth, held under the heavens
      C(24, 29, 11), P('M13 29 L35 29'), P('M24 18 C19.5 22 19.5 36 24 40 C28.5 36 28.5 22 24 18'), P('M14.6 23.5 L33.4 23.5 M14.6 34.5 L33.4 34.5'),
      P('M6 27 A18 18 0 0 1 42 27'), P('M6 27 L4 31 M42 27 L44 31'),
    ],
    taskhir: [ // sun, moon and stars on one arc
      P('M5 39 A19 19 0 0 1 43 39'), C(11.5, 25, 3.2), P('M24.6 13.2 A5.6 5.6 0 1 0 28.4 21.6 A4.6 4.6 0 0 1 24.6 13.2 Z'), spark(37, 25.5, 3), P('M14 39 L34 39'),
    ],
    baraka: [ // a jar, and blessing in it
      P('M16.5 13.5 L31.5 13.5'), P('M18 13.5 C18 17.5 12 19.5 12 28 C12 36 17 41.5 24 41.5 C31 41.5 36 36 36 28 C36 19.5 30 17.5 30 13.5'), P('M18 9.5 L30 9.5 L30 13.5 L18 13.5 Z'),
      spark(24, 28.5, 5.2), spark(39.5, 8.5, 2.2), spark(8.5, 14.5, 1.6),
    ],
    yusrbaad: [ // after the night, the sunrise
      P('M5 36 L43 36'), P('M14.5 36 A9.5 9.5 0 0 1 33.5 36'), P('M24 22 L24 18 M13.4 26 L10.8 23.4 M34.6 26 L37.2 23.4 M9.2 32 L6 31 M38.8 32 L42 31'), P('M12 41 L36 41'),
    ],
    ghina: [ // a bowl, full
      P('M8 26 L40 26 C40 34 33 40.5 24 40.5 C15 40.5 8 34 8 26 Z'), C(16.5, 21, 4.6), C(25, 18.8, 5.4), C(33, 21.6, 4), P('M25 13.4 C25.6 11.4 27.4 10.4 29.4 10.6'), P('M19 40.5 L18 43 L30 43 L29 40.5'),
    ],
    jar: [ // two homes, side by side
      P('M4.5 25 L14 17 L23.5 25'), P('M7 23 L7 40 L23.5 40'), P('M24.5 25 L34 17 L43.5 25'), P('M23.5 25 L23.5 40 L41 40 L41 23'), P('M12 40 L12 33.5 L16 33.5 L16 40'), P('M30.5 40 L30.5 33.5 L34.5 33.5 L34.5 40'),
      R(9.6, 26.5, 3.4, 3.4, 0.6), R(36, 26.5, 3.4, 3.4, 0.6), P('M3 40 L45 40'),
    ],
    muallim: [ // a board on its stand
      R(8.5, 8.5, 31, 20.5, 2), P('M14 29 L10 41.5 M34 29 L38 41.5 M24 29 L24 36'), P('M14 15 L27 15 M14 20.5 L23 20.5'), spark(33, 18.5, 2.4),
    ],
    afw: [ // an olive branch
      P('M9 40 L39 10'),
      ...[0.2, 0.36, 0.52, 0.68, 0.84].map((t, k) => { const x = 9 + 30 * t, y = 40 - 30 * t, d = (-45 + (k % 2 ? 52 : -52)) * Math.PI / 180, cx = x + 4.6 * Math.cos(d), cy = y + 4.6 * Math.sin(d);
        return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="4.4" ry="1.8" transform="rotate(${f((d * 180) / Math.PI)} ${f(cx)} ${f(cy)})"/>`; }),
      C(19, 34.6, 1.5), C(31.6, 22.4, 1.4),
    ],
    taawun: [ // two gears that turn together
      C(18, 21, 6.5), C(18, 21, 2),
      ...Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return P(`M${f(18 + 6.5 * Math.cos(a))} ${f(21 + 6.5 * Math.sin(a))} L${f(18 + 9.3 * Math.cos(a))} ${f(21 + 9.3 * Math.sin(a))}`); }),
      C(31.5, 31.5, 5.2), C(31.5, 31.5, 1.6),
      ...Array.from({ length: 7 }, (_, i) => { const a = (i * 2 * Math.PI) / 7 + 0.2; return P(`M${f(31.5 + 5.2 * Math.cos(a))} ${f(31.5 + 5.2 * Math.sin(a))} L${f(31.5 + 7.8 * Math.cos(a))} ${f(31.5 + 7.8 * Math.sin(a))}`); }),
    ],
    ghayb: [ // hands raised, and someone held in them
      P('M8 27 C10 36.5 16 41.5 24 41.5 C32 41.5 38 36.5 40 27'), P('M8 27 C14 30.6 19.5 31.6 24 31.6 C28.5 31.6 34 30.6 40 27'), P('M24 31.6 L24 41.5'), heart(24, 16.5, 7.6), spark(36.5, 9, 2), spark(11.5, 10, 1.6),
    ],
    sakina: [ // still water, and the moon in it
      C(24, 15.5, 6.5), P('M6 28 L42 28'), P('M13.5 33.5 L34.5 33.5 M17.5 38.5 L30.5 38.5 M21.5 43 L26.5 43'),
    ],
    farah: [ // a flower in bloom
      C(24, 19, 3.4), ...Array.from({ length: 6 }, (_, i) => { const a = (i * Math.PI) / 3 - Math.PI / 2; return C(24 + 7 * Math.cos(a), 19 + 7 * Math.sin(a), 3.8); }),
      P('M24 30 L24 43'), P('M24 37 C27.5 34.4 31.5 34.6 33.6 36.6 C31.2 38.8 27.4 39 24 37 Z'), spark(39.5, 9, 2.2), spark(8.5, 13, 1.7),
    ],
    hope: [ // a window lit in the night
      P('M15 41 L15 22.5 C15 16.5 19 12.5 24 12.5 C29 12.5 33 16.5 33 22.5 L33 41 Z'), P('M24 12.5 L24 41 M15 28.5 L33 28.5'),
      `<path class="fill soft" d="M24.8 13.4 C28.6 14 32.2 17.4 32.2 22.5 L32.2 27.7 L24.8 27.7 Z"/>`, P('M24 4 L24 7.5 M36.5 9.5 L34.4 12 M11.5 9.5 L13.6 12 M42 22 L38.6 22 M6 22 L9.4 22'), P('M10 41 L38 41'),
    ],
    rida: [ // a heart at rest, within a circle
      C(24, 24, 15.5), heart(24, 25, 8.4),
    ],
    uns: [ // a lamp in a niche
      P('M12 42 L12 20.5 C12 13.5 17.5 8 24 8 C30.5 8 36 13.5 36 20.5 L36 42'), P('M17.5 33 C17.5 37 30.5 37 30.5 33 Z'), P('M24 30.5 C21.4 27.4 22.8 23.6 24 21.4 C25.2 23.6 26.6 27.4 24 30.5 Z'), P('M24 36 L24 39.5 M19 39.5 L29 39.5'), P('M8 42 L40 42'),
    ],
    dahik: [ // a tear, and a sparkle of joy
      P('M16 13 C16 13 9 21.6 9 26.4 C9 30.4 12.2 33.6 16 33.6 C19.8 33.6 23 30.4 23 26.4 C23 21.6 16 13 16 13 Z'), P('M12.6 26.6 C12.6 28.6 13.8 30.2 15.6 30.6'),
      spark(33, 22, 7), spark(38.5, 36.5, 2.4), spark(28.5, 9.5, 1.8),
    ],
    batina: [ // a gift, closed, with light in it
      R(10, 22, 28, 19, 1.6), R(8, 16, 32, 6, 1.6), P('M24 16 L24 41'), P('M24 16 C20.5 9.5 13.6 11 16.4 16 M24 16 C27.5 9.5 34.4 11 31.6 16'), spark(16.5, 31.5, 2.4), spark(32, 30, 1.8),
    ],
    halawa: [ // a heart with light in it
      heart(24, 26.5, 15.5), spark(24, 25.5, 5.4),
    ],
    inshirah: [ // a chest that opens
      P('M14 31 A10 10 0 0 1 34 31'), P('M9 31 A15 15 0 0 1 39 31'), P('M4.5 31 A19.5 19.5 0 0 1 43.5 31'), `<circle class="fill" cx="24" cy="31" r="2.6"/>`, P('M10 38 L38 38'),
    ],
    hilm: [ // a clock: time given, and given again
      C(24, 25, 15.5), P('M24 25 L24 15 M24 25 L31 29'), C(24, 25, 1.4), P('M24 11.2 L24 13 M37.8 25 L36 25 M24 38.8 L24 37 M10.2 25 L12 25'), P('M17 6 L31 6'), P('M24 6 L24 9.5'),
    ],
    qalam: [ // an inkwell, and a reed pen in it
      P('M14 30 L34 30 L36.4 41.5 L11.6 41.5 Z'), R(18.5, 25, 11, 5, 1.2), P('M25.5 25 L36.5 6.5'), P('M36.5 6.5 L38.6 5.6 L38 7.8 Z'), P('M15 36 L33 36'),
    ],
    dhakira: [ // a spiral, kept
      P(Array.from({ length: 121 }, (_, k) => { const t = (k / 120) * Math.PI * 2 * 2.6, r = 1.2 + (t / (Math.PI * 2 * 2.6)) * 13.8; return `${k ? 'L' : 'M'}${f(24 + r * Math.cos(t))} ${f(25 + r * Math.sin(t))}`; }).join(' ')),
      spark(39.5, 8.5, 2.2),
    ],
    fulk: [ // a ship under sail
      P('M8 31.5 L40 31.5 L35 38.5 L13 38.5 Z'), P('M24 31.5 L24 7.5'), P('M24 9.5 L24 28 L37 28 Z'), P('M24 13 L14.5 28 L24 28'),
      P('M5 42.5 C8.5 40.5 12 40.5 15.5 42.5 C19 44.5 22.5 44.5 26 42.5 C29.5 40.5 33 40.5 36.5 42.5 C38.5 43.6 40.8 43.8 43 43'),
    ],
    rukub: [ // a wheel on the road
      C(24, 24, 13), C(24, 24, 2.6), ...Array.from({ length: 6 }, (_, i) => { const a = (i * Math.PI) / 3; return P(`M${f(24 + 2.6 * Math.cos(a))} ${f(24 + 2.6 * Math.sin(a))} L${f(24 + 13 * Math.cos(a))} ${f(24 + 13 * Math.sin(a))}`); }),
      P('M5 41.5 L43 41.5'), P('M7 37 L12 37 M36 37 L41 37'),
    ],
    thimar: [ // a pomegranate
      C(24, 28, 13), P('M19.6 15.6 L18.6 10.2 L22.2 12.4 L24 9.2 L25.8 12.4 L29.4 10.2 L28.4 15.6'), P('M30.5 13.5 C33.4 9.6 37.4 9.4 39.8 11.6 C36.8 14.8 33.4 15 30.5 13.5 Z'), P('M17 28 C17 23.5 20 20.5 23.5 20'),
    ],
    zina: [ // an open shell, and its pearl
      P('M8 28 C8 36 15 41.5 24 41.5 C33 41.5 40 36 40 28 Z'), P('M15 29.5 L17 39 M24 29.5 L24 41.5 M33 29.5 L31 39'), P('M9 23 C10 13.5 16.6 8.5 24 8.5 C31.4 8.5 38 13.5 39 23'),
      C(24, 23.5, 4.4), spark(28.2, 20, 1.4),
    ],
    hadid: [ // an anvil, and a spark from it
      P('M7 15 L33 15 C33 19 36.5 21 42 21 L42 23.5 L32 23.5 C30.2 23.5 29 24.8 29 26.6 L29 31.5 L33 36 L15 36 L19 31.5 L19 26.6 C19 24.8 17.8 23.5 16 23.5 L13.5 23.5 C9.6 23.5 7 20 7 15 Z'),
      P('M12 40.5 L36 40.5'), spark(15.5, 8, 2.6), spark(23, 5.5, 1.6),
    ],
    // ——— 101–110: drawn for the «الرحلة كاملة» carousels ———
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
    // 41–100: drawn for the blessing packages
    blessing_041: 'hidaya', blessing_042: 'sunna', blessing_043: 'masajid', blessing_044: 'ukhuwwa', blessing_045: 'asma', blessing_046: 'mahabba',
    blessing_047: 'sabr', blessing_048: 'shukr', blessing_049: 'tawakkul', blessing_050: 'ikhlas', blessing_051: 'jumua', blessing_052: 'kaaba',
    blessing_053: 'qadr', blessing_054: 'yusr', blessing_055: 'qalb', blessing_056: 'dhawq', blessing_057: 'taqwim', blessing_058: 'shams',
    blessing_059: 'qamar', blessing_060: 'riyah', blessing_061: 'ghayth', blessing_062: 'ard', blessing_063: 'jibal', blessing_064: 'bahr',
    blessing_065: 'nabat', blessing_066: 'anam', blessing_067: 'tayr', blessing_068: 'nujum', blessing_069: 'zill', blessing_070: 'nar',
    blessing_071: 'laban', blessing_072: 'asal', blessing_073: 'itqan', blessing_074: 'imsak', blessing_075: 'taskhir', blessing_076: 'baraka',
    blessing_077: 'yusrbaad', blessing_078: 'ghina', blessing_079: 'jar', blessing_080: 'muallim', blessing_081: 'afw', blessing_082: 'taawun',
    blessing_083: 'ghayb', blessing_084: 'sakina', blessing_085: 'farah', blessing_086: 'hope', blessing_087: 'rida', blessing_088: 'uns',
    blessing_089: 'dahik', blessing_090: 'batina', blessing_091: 'halawa', blessing_092: 'inshirah', blessing_093: 'hilm', blessing_094: 'qalam',
    blessing_095: 'dhakira', blessing_096: 'fulk', blessing_097: 'rukub', blessing_098: 'thimar', blessing_099: 'zina', blessing_100: 'hadid',
    // 101–400: drawn batch by batch for the «الرحلة كاملة» carousels
    blessing_101: 'tahara', blessing_102: 'adhan', blessing_103: 'siyam', blessing_104: 'sadaqa', blessing_105: 'qiyam', blessing_106: 'istighfar',
    blessing_107: 'salatnabi', blessing_108: 'eid', blessing_109: 'haya', blessing_110: 'khushu',
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
