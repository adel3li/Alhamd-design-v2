/*
 * Alhamd promo video — line-art illustrations.
 * Gold strokes on night, round caps, one stroke weight family.
 * Every function returns an <svg> string; `state` is one of:
 *   'lit'      the blessing is present (gold, filled light)
 *   'dim'      unnoticed: same drawing, grey and flat
 *   'gone'     absent: broken dashed outline, no light
 *   'dissolve' disappearing (hook frame only)
 */
(function () {
  const C = {
    gold: '#E4C368',
    goldDeep: '#C8A951',
    goldSoft: '#F0D48A',
    dim: '#3B3B5E',
    dimmer: '#2A2A44',
    text: '#EDEDF5',
    muted: '#AEAECB',
    night: '#111126',
    hole: '#0A0A16',
    ink: '#2A1F19',
  };

  const stroke = (color, w, extra = '') =>
    `fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}`;
  const svg = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const colorFor = (state) => (state === 'lit' || state === 'dissolve' ? C.gold : state === 'dim' ? C.dim : C.dimmer);
  const dashFor = (state) => (state === 'gone' ? 'stroke-dasharray="12 20"' : state === 'dissolve' ? 'stroke-dasharray="30 26"' : '');
  let uidCounter = 0;
  const uid = (p) => `${p}${++uidCounter}`;

  /* ---------- Arched window at sunrise (نعمة البصر) ---------- */
  function windowArt(state = 'lit', opts = {}) {
    const id = uid('win');
    const lit = state === 'lit';
    const c = opts.color || colorFor(state);
    const sunC = opts.sunColor || C.gold;
    const holeC = opts.hole || C.night;
    const d = dashFor(state);
    const arch = 'M150,600 L150,318 A172,172 0 0 1 300,150 A172,172 0 0 1 450,318 L450,600 Z';
    let s = `<defs>
      <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.gold}" stop-opacity="0.02"/>
        <stop offset="0.65" stop-color="${C.gold}" stop-opacity="0.16"/>
        <stop offset="1" stop-color="${C.gold}" stop-opacity="0.34"/>
      </linearGradient>
      <radialGradient id="${id}sun" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="${C.goldSoft}" stop-opacity="0.65"/>
        <stop offset="1" stop-color="${C.gold}" stop-opacity="0.12"/>
      </radialGradient>
      <clipPath id="${id}clip"><path d="${arch}"/></clipPath>
    </defs>`;
    s += `<path d="${arch}" fill="${lit ? `url(#${id}sky)` : C.hole}"/>`;
    s += `<g clip-path="url(#${id}clip)">`;
    if (lit) {
      s += `<g class="sun"><circle cx="300" cy="514" r="72" fill="url(#${id}sun)" ${stroke(sunC, 6)}/>`;
      [150, 120, 90, 60, 30].forEach((deg) => {
        const a = (deg * Math.PI) / 180;
        const x1 = 300 + 98 * Math.cos(a), y1 = 514 - 98 * Math.sin(a);
        const x2 = 300 + 142 * Math.cos(a), y2 = 514 - 142 * Math.sin(a);
        s += `<path class="ray" d="M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}" ${stroke(sunC, 6)}/>`;
      });
      s += `</g>`;
    } else if (state === 'dim') {
      s += `<circle cx="300" cy="514" r="72" ${stroke(C.dim, 5)}/>`;
    }
    s += `<path d="M136,550 C205,506 255,522 300,538 C352,556 400,514 464,530 L464,612 L136,612 Z" fill="${lit ? holeC : C.hole}" ${stroke(c, 6, d)}/>`;
    s += `</g>`;
    s += `<path d="M120,624 L120,300 A200,200 0 0 1 300,101 A200,200 0 0 1 480,300 L480,624" ${stroke(c, 6.5, d)}/>`;
    s += `<path d="${arch}" ${stroke(c, 5, d)}/>`;
    s += `<path d="M84,624 L516,624" ${stroke(c, 6.5, d)}/>`;
    s += `<path d="M110,656 L490,656" ${stroke(c, 5, d + ' opacity="0.7"')}/>`;
    if (lit) {
      s += `<path class="bird" d="M202,268 q12,-12 24,0 q12,-12 24,0" ${stroke(c, 4.5)}/>`;
      s += `<path class="bird" d="M262,236 q9,-9 18,0 q9,-9 18,0" ${stroke(c, 4, 'opacity="0.8"')}/>`;
    }
    return svg('0 0 600 700', s);
  }

  /* ---------- Glass of cold water (نعمة الماء) ---------- */
  function glassArt(state = 'lit', opts = {}) {
    const lit = state === 'lit';
    const c = opts.color || colorFor(state);
    const d = dashFor(state);
    let s = '';
    if (lit || state === 'dissolve') {
      const o = state === 'dissolve' ? 0.06 : 0.17;
      s += `<path d="M161,300 A139,22 0 0 1 439,300 L410,598 A110,18 0 0 1 190,598 Z" fill="${C.gold}" fill-opacity="${o}"/>`;
      s += `<ellipse cx="300" cy="300" rx="139" ry="22" ${stroke(C.gold, 4.5, `opacity="${state === 'dissolve' ? 0.35 : 0.95}" ${d}`)}/>`;
    }
    if (lit && opts.ripple) {
      s += `<ellipse class="ripple" cx="300" cy="300" rx="54" ry="8" ${stroke(C.goldSoft, 3.5, 'opacity="0.85"')}/>`;
      s += `<ellipse class="ripple" cx="300" cy="300" rx="96" ry="15" ${stroke(C.gold, 3, 'opacity="0.45"')}/>`;
    }
    if (state === 'gone') {
      // a dry ring where the water used to be
      s += `<ellipse cx="300" cy="590" rx="100" ry="15" ${stroke(C.dimmer, 3, 'stroke-dasharray="4 12"')}/>`;
    }
    s += `<ellipse cx="300" cy="180" rx="150" ry="26" ${stroke(c, 6.5, d)}/>`;
    s += `<path d="M150,180 L190,598" ${stroke(c, 6.5, d)}/>`;
    s += `<path d="M450,180 L410,598" ${stroke(c, 6.5, d)}/>`;
    s += `<path d="M190,598 A110,18 0 0 0 410,598" ${stroke(c, 6.5, d)}/>`;
    s += `<path d="M196,618 A104,16 0 0 0 404,618" ${stroke(c, 4.5, d + ' opacity="0.55"')}/>`;
    if (lit) {
      s += `<path d="M198,226 L222,540" ${stroke('#FFF3CF', 5, 'opacity="0.35"')}/>`;
      if (opts.cold !== false) {
        [[171, 352, 4.5], [178, 420, 3.5], [170, 480, 3], [428, 372, 4.5], [421, 446, 3.5], [430, 512, 3]].forEach(([x, y, r]) => {
          s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.goldSoft}" opacity="0.7"/>`;
        });
      }
      if (opts.drop) {
        s += `<g class="drop"><path d="M300,24 C300,24 271,68 271,90 A29,29 0 0 0 329,90 C329,68 300,24 300,24 Z" fill="${C.gold}" fill-opacity="0.28" ${stroke(C.gold, 5.5)}/>`;
        s += `<path d="M289,86 Q291,100 302,106" ${stroke('#FFF3CF', 3.5, 'opacity="0.6"')}/></g>`;
      }
    }
    return svg('0 0 600 700', s);
  }

  /* ---------- Phone ringing: "أمّي" (نعمة السمع) ---------- */
  function callArt(state = 'lit', opts = {}) {
    const lit = state === 'lit';
    const c = opts.color || colorFor(state);
    const d = dashFor(state);
    const tc = lit ? C.text : state === 'dim' ? '#55557A' : C.dimmer;
    let s = '';
    if (lit) {
      [[152, 0.95], [200, 0.6], [248, 0.3]].forEach(([r, o]) => {
        const dx = r * Math.cos((35 * Math.PI) / 180);
        const dy = r * Math.sin((35 * Math.PI) / 180);
        const k = [152, 200, 248].indexOf(r);
        s += `<path class="arc" data-k="${k}" d="M${(300 + dx).toFixed(1)},${(330 - dy).toFixed(1)} A${r},${r} 0 0 1 ${(300 + dx).toFixed(1)},${(330 + dy).toFixed(1)}" ${stroke(C.gold, 6.5, `opacity="${o}"`)}/>`;
        s += `<path class="arc" data-k="${k}" d="M${(300 - dx).toFixed(1)},${(330 - dy).toFixed(1)} A${r},${r} 0 0 0 ${(300 - dx).toFixed(1)},${(330 + dy).toFixed(1)}" ${stroke(C.gold, 6.5, `opacity="${o}"`)}/>`;
      });
    }
    s += `<rect x="190" y="110" width="220" height="440" rx="42" ${stroke(c, 6.5, d)} fill="${lit ? 'rgba(228,195,104,0.06)' : 'none'}"/>`;
    s += `<path d="M274,140 L326,140" ${stroke(c, 5, d)}/>`;
    s += `<circle cx="300" cy="248" r="54" ${stroke(c, 5, d)}/>`;
    s += `<circle cx="300" cy="236" r="17" ${stroke(c, 4.5, d)}/>`;
    s += `<path d="M268,284 C274,262 326,262 332,284" ${stroke(c, 4.5, d)}/>`;
    s += `<text x="300" y="362" text-anchor="middle" font-family="Amiri, serif" font-weight="700" font-size="46" fill="${tc}">أمّي</text>`;
    if (lit) s += `<text x="300" y="400" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-size="23" fill="${C.muted}">تتّصل بك…</text>`;
    s += `<circle cx="300" cy="484" r="34" fill="${lit ? C.gold : 'none'}" ${stroke(c, lit ? 0 : 5, d)}/>`;
    const hs = lit ? C.night : c;
    s += `<g transform="translate(284.5,468.5) scale(1.3)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="none" stroke="${hs}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    return svg('0 0 600 700', s);
  }

  /* ---------- Footsteps on the way to the mosque (نعمة اليدين والقدمين) ---------- */
  const bez = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ];
  };
  const bezD = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return [
      3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
      3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
    ];
  };

  function mosque(c, d, w = 6) {
    let s = '';
    s += `<path d="M140,380 L476,380" ${stroke(c, w, d)}/>`;
    s += `<rect x="206" y="262" width="188" height="118" ${stroke(c, w, d)}/>`;
    s += `<path d="M216,262 C198,212 248,176 300,146 C352,176 402,212 384,262" ${stroke(c, w, d)}/>`;
    s += `<path d="M300,146 L300,118" ${stroke(c, w - 1, d)}/>`;
    s += `<path d="M309,92 A15,15 0 1 0 309,116 A11,11 0 1 1 309,92 Z" fill="${c}" stroke="none"/>`;
    s += `<path d="M278,380 L278,336 A22,22 0 0 1 322,336 L322,380" ${stroke(c, w - 1, d)}/>`;
    s += `<path d="M230,332 L230,306 A9,9 0 0 1 248,306 L248,332 Z" ${stroke(c, w - 2, d)}/>`;
    s += `<path d="M352,332 L352,306 A9,9 0 0 1 370,306 L370,332 Z" ${stroke(c, w - 2, d)}/>`;
    s += `<rect x="424" y="172" width="30" height="208" ${stroke(c, w - 1, d)}/>`;
    s += `<path d="M414,214 L464,214" ${stroke(c, w - 1, d)}/>`;
    s += `<path d="M424,172 L439,130 L454,172" ${stroke(c, w - 1, d)}/>`;
    s += `<path d="M439,130 L439,112" ${stroke(c, w - 2, d)}/>`;
    return s;
  }

  function stepsArt(state = 'lit', opts = {}) {
    const lit = state === 'lit';
    const c = opts.color || colorFor(state);
    const d = dashFor(state);
    let s = '';
    const segs = [
      [[300, 744], [432, 690], [422, 600], [300, 566]],
      [[300, 566], [178, 532], [186, 446], [300, 404]],
    ];
    const pathD = `M300,744 C432,690 422,600 300,566 C178,532 186,446 300,404`;
    if (lit) {
      s += `<path d="${pathD}" ${stroke(C.goldDeep, 5, 'stroke-dasharray="1 20" opacity="0.8"')}/>`;
    } else {
      s += `<path d="${pathD}" ${stroke(c, 4, 'stroke-dasharray="1 34"')}/>`;
    }
    s += mosque(c, d);
    if (lit || opts.prints) {
      const ts = [0.14, 0.38, 0.62, 0.86];
      let k = 0;
      const total = ts.length * segs.length;
      segs.forEach((seg) => {
        ts.forEach((t) => {
          const [x, y] = bez(...seg, t);
          const [dx, dy] = bezD(...seg, t);
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len, ny = dx / len;
          const side = k % 2 === 0 ? 1 : -1;
          const px = x + nx * 13 * side, py = y + ny * 13 * side;
          const ang = (Math.atan2(dx, -dy) * 180) / Math.PI;
          const op = (0.35 + 0.65 * (k / (total - 1))).toFixed(2);
          s += `<g class="foot" data-k="${k}" transform="translate(${px.toFixed(1)},${py.toFixed(1)}) rotate(${ang.toFixed(1)})" opacity="${op}">
            <ellipse cx="0" cy="-8" rx="7.5" ry="12" fill="${C.gold}"/>
            <ellipse cx="0" cy="12.5" rx="5.5" ry="6.5" fill="${C.gold}"/>
          </g>`;
          k += 1;
        });
      });
    }
    return svg('0 0 600 760', s);
  }

  /* ---------- Breath / air (alt hook) ---------- */
  function breathArt(state = 'lit') {
    const c = colorFor(state);
    let s = '';
    s += `<path d="M40,250 C190,250 250,190 340,190 C430,190 446,282 380,292 C334,299 318,256 346,240" ${stroke(c, 6.5)}/>`;
    s += `<path d="M90,350 L500,350" ${stroke(c, 6.5, 'opacity="0.75"')}/>`;
    s += `<path d="M20,450 C170,450 300,510 430,492 C506,481 516,418 466,412 C432,408 424,442 446,452" ${stroke(c, 6.5)}/>`;
    s += `<path d="M130,560 C230,560 300,540 380,546" ${stroke(c, 5, 'opacity="0.5"')}/>`;
    return svg('0 0 600 700', s);
  }

  /* ---------- Shield with check (privacy) ---------- */
  function shieldArt(color = C.gold) {
    let s = '';
    s += `<path d="M60,14 L104,30 L104,62 C104,92 84,112 60,122 C36,112 16,92 16,62 L16,30 Z" ${stroke(color, 5)}/>`;
    s += `<path d="M40,66 L54,80 L82,50" ${stroke(color, 5.5)}/>`;
    return svg('0 0 120 136', s);
  }

  function lockArt(color = C.gold) {
    let s = '';
    s += `<rect x="14" y="44" width="72" height="56" rx="12" ${stroke(color, 6)}/>`;
    s += `<path d="M30,44 L30,32 A20,20 0 0 1 70,32 L70,44" ${stroke(color, 6)}/>`;
    s += `<circle cx="50" cy="70" r="5" fill="${color}"/>`;
    return svg('0 0 100 110', s);
  }

  /* ---------- Seeded particles ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Gold dust as one full-stage SVG.
   * box: [x, y, w, h]; drift: optional [dx, dy] to bias positions (dissolve trails).
   */
  function particles({ n = 40, seed = 1, box = [0, 0, 1080, 1920], rmin = 2, rmax = 7, omin = 0.2, omax = 0.9, color = C.gold, stageH = 1920, stageW = 1080, cluster = null } = {}) {
    const r = rng(seed);
    let s = '';
    for (let i = 0; i < n; i++) {
      let x, y;
      if (cluster) {
        // gaussian-ish cloud around a point, stretched along a direction
        const g = () => (r() + r() + r() - 1.5) / 1.5;
        x = cluster.x + g() * cluster.sx;
        y = cluster.y + g() * cluster.sy;
      } else {
        x = box[0] + r() * box[2];
        y = box[1] + r() * box[3];
      }
      const rad = rmin + Math.pow(r(), 2.2) * (rmax - rmin);
      const op = omin + r() * (omax - omin);
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="${color}" opacity="${op.toFixed(2)}"/>`;
    }
    return `<svg class="abs particles" style="left:0;top:0;width:${stageW}px;height:${stageH}px;overflow:visible;filter:drop-shadow(0 0 6px rgba(228,195,104,0.55))" viewBox="0 0 ${stageW} ${stageH}">${s}</svg>`;
  }

  /* ---------- Crescent and stars (نعمة النوم) ---------- */
  const sparkle = (x, y, s, color, o = 1) =>
    `<path d="M${x},${y - s} Q${x},${y} ${x + s},${y} Q${x},${y} ${x},${y + s} Q${x},${y} ${x - s},${y} Q${x},${y} ${x},${y - s} Z" fill="${color}" opacity="${o}"/>`;
  function moonArt(state = 'lit') {
    const c = colorFor(state);
    let s = '';
    s += `<path d="M360,162 A150,150 0 1 0 360,438 A175,175 0 0 1 360,162 Z" fill="${c}" fill-opacity="${state === 'lit' ? 0.16 : 0}" ${stroke(c, 6.5, dashFor(state))}/>`;
    if (state === 'lit') {
      [[470, 180, 24, 1], [520, 330, 15, 0.8], [445, 470, 17, 0.9], [175, 540, 12, 0.7], [150, 150, 11, 0.6], [560, 520, 9, 0.6]].forEach(([x, y, z, o]) => { s += sparkle(x, y, z, C.goldSoft, o); });
      s += `<path d="M120,610 C200,575 270,600 330,590 C400,578 450,600 500,592" ${stroke(c, 5, 'opacity="0.55"')}/>`;
    }
    return svg('0 0 600 700', s);
  }

  /* ---------- A home with a lit window (نعمة البيت والمأوى) ---------- */
  function houseArt(state = 'lit') {
    const lit = state === 'lit';
    const c = colorFor(state);
    const d = dashFor(state);
    let s = '';
    s += `<path d="M70,600 L530,600" ${stroke(c, 6.5, d)}/>`;
    s += `<path d="M128,332 L472,332 L472,312 L128,312 Z" ${stroke(c, 6, d)}/>`;
    s += `<rect x="150" y="332" width="300" height="268" ${stroke(c, 6.5, d)}/>`;
    [[195, 245], [355, 405]].forEach(([a, b]) => {
      s += `<path d="M${a},472 L${a},424 A25,25 0 0 1 ${b},424 L${b},472 Z" fill="${C.gold}" fill-opacity="${lit ? 0.42 : 0}" ${stroke(c, 5, d)}/>`;
      s += `<path d="M${(a + b) / 2},399 L${(a + b) / 2},472" ${stroke(c, 3.5, d + ' opacity="0.7"')}/>`;
    });
    s += `<path d="M265,600 L265,506 A35,35 0 0 1 335,506 L335,600" ${stroke(c, 6, d)}/>`;
    s += `<circle cx="322" cy="556" r="4.5" fill="${c}"/>`;
    s += `<path d="M300,332 L300,356" ${stroke(c, 3.5, d)}/>`;
    s += `<rect x="288" y="356" width="24" height="30" rx="6" fill="${C.gold}" fill-opacity="${lit ? 0.55 : 0}" ${stroke(c, 4, d)}/>`;
    if (lit) {
      s += `<path d="M482,172 A40,40 0 1 0 482,252 A48,48 0 0 1 482,172 Z" fill="${C.gold}" fill-opacity="0.2" ${stroke(c, 5)}/>`;
      s += sparkle(140, 196, 14, C.goldSoft, 0.85) + sparkle(210, 140, 9, C.goldSoft, 0.6) + sparkle(560, 290, 8, C.goldSoft, 0.6);
    }
    return svg('0 0 600 700', s);
  }

  /* ---------- Prayer beads, 33 (المسبحة) ---------- */
  function beadsArt(state = 'lit', lit = 33) {
    const c = colorFor(state);
    let s = `<circle cx="300" cy="290" r="175" ${stroke(c, 3, 'opacity="0.5"')}/>`;
    for (let i = 0; i < 33; i++) {
      const a = Math.PI / 2 + (i + 1) * ((2 * Math.PI - 0.5) / 34) + 0.25;
      const x = 300 + 175 * Math.cos(a), y = 290 + 175 * Math.sin(a);
      const on = i < lit;
      s += `<circle class="bead-dot" data-k="${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12.5" fill="${C.gold}" fill-opacity="${on ? 0.32 : 0}" ${stroke(c, 4, on ? '' : 'opacity="0.45"')}/>`;
    }
    s += `<path d="M300,465 C286,482 286,512 300,530 C314,512 314,482 300,465 Z" fill="${C.gold}" fill-opacity="0.3" ${stroke(c, 4.5)}/>`;
    s += `<path d="M300,530 L300,556 M300,556 L268,650 M300,556 L286,656 M300,556 L300,660 M300,556 L314,656 M300,556 L332,650" ${stroke(c, 4)}/>`;
    return svg('0 0 600 700', s);
  }

  /* ---------- The app's icons (from src/landing/icons.tsx) ---------- */
  const ICONS = {
    home: '<path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    book: '<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    beads: '<circle cx="12" cy="4" r="1.6"/><circle cx="17.7" cy="6.3" r="1.6"/><circle cx="20" cy="12" r="1.6"/><circle cx="17.7" cy="17.7" r="1.6"/><circle cx="12" cy="20" r="1.6"/><circle cx="6.3" cy="17.7" r="1.6"/><circle cx="4" cy="12" r="1.6"/><circle cx="6.3" cy="6.3" r="1.6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    timer: '<circle cx="12" cy="14" r="7"/><path d="M12 14l2-3M10 2h4"/>',
  };
  const icon = (name, color = C.gold, size = 64, sw = 1.5) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  /* ---------- «نهار»: the light theme of the landing page and the app icon ---------- */
  const THEMES = {
    nahar: { gold: '#B9573B', goldDeep: '#9E4A30', goldSoft: '#D4704F', dim: '#C9B8A6', dimmer: '#DCCFBE', text: '#2A1F19', muted: '#6B5A4E', night: '#F7F0E6', hole: '#EFE6D9' },
  };
  /** Runs fn with the art palette swapped, so the same drawings serve both themes. */
  function withTheme(name, fn) {
    if (!THEMES[name]) return fn();
    const saved = { ...C };
    Object.assign(C, THEMES[name]);
    try { return fn(); } finally { Object.assign(C, saved); }
  }

  window.ART = { C, windowArt, glassArt, callArt, stepsArt, breathArt, shieldArt, lockArt, moonArt, houseArt, beadsArt, icon, sparkle, withTheme, particles, rng, bez, bezD, stroke };
})();
