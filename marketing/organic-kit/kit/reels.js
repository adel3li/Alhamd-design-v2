/*
 * Alhamd organic kit — reels (no voice-over: on-screen words, motion and quiet sound).
 * Every reel renders at 9:16 in «ليل» and «نهار»; the hero reels also at 1:1.
 *
 * IDs  NR blessing reel (one per blessing) · RL brand and feature reels
 */
(function () {
  const K = window.KIT;
  const { def } = K;
  const { bg, title, display, quote, body, kick, small, verseT, acc, ltr, gold, gap, chip, medal, glyph, uicon, art, wm, sig, cta, thread, phone, particles, fadeB, page } = K.C;
  const M = K.M;
  const { $, $$, P, clamp, out3, inOut, mv, enter, fadeOut, pop, reveal, readTime, draw, drift, breathe } = M;
  const AR = K.AR;
  const CT = window.CONTENT;
  const B = CT.blessings;
  const BY = Object.fromEntries(B.map((b) => [b.n, b]));
  const ICON = window.ICONS.BY_BLESSING;
  const A = window.ART;
  const pad2 = (n) => String(n).padStart(2, '0');
  const F_REEL = ['story'];
  const F_HERO = ['story', 'square'];

  /* ---------- shared scenes ---------- */
  const deepBg = (c) => ({ tone: 'deep', pat: 0.022, cone: 0.02 });
  /** The closing card every reel shares: wordmark, the promise, the address. */
  function endScene(c, { line = 'نعمةٌ كلَّ يوم', sub = 'دقيقتان من التأمّل… في تطبيق «الحمد»', extra = '', len = 2.8 } = {}) {
    return {
      len,
      html: page(c, { bg: { cone: 0.1, coneAt: '50% 40%', warm: 0.06, warmAt: '50% 44%' }, mid: `<div class="e-wm">${wm(c, c.pick({ square: 170 }, 210))}</div>` + gap(c, 18) + `<div class="e-l">${title(c, line, c.pick({ square: 76 }, 88))}</div><div class="e-s">${body(c, sub, 40)}</div>${extra ? `<div class="e-x">${extra}</div>` : ''}<div class="e-u">${kick(c, ltr('alhamd.app'), 36)}</div>`, gap: 24 }),
      anim(t, L) { enter($(L, '.e-wm'), t, 0.1, 0.7, 24); enter($(L, '.e-l'), t, 0.55); enter($(L, '.e-s'), t, 0.85); enter($(L, '.e-x'), t, 1.1); enter($(L, '.e-u'), t, 1.25); },
      sfx: [[0.15, 'pop', -30]],
    };
  }

  /* ===================== NR — the blessing reel (one per blessing) ===================== */
  B.forEach((b) => {
    const ic = ICON[b.id];
    def(`NR-${pad2(b.n)}`, {
      kind: 'reel', name: `ريل نعمة اليوم: ${b.title}`, group: 'NR', family: 'ريلز نعمة اليوم', pillar: 'نعمة اليوم', formats: F_REEL,
      alt: `ريل بلا تعليق صوتي: تخيّل غياب ${b.short}… ثم العودة إليها، ثم الحمد. من تطبيق الحمد.`,
      scenes(c) {
        const vis = b.steps[1];
        const s1len = Math.max(4.4, readTime(vis, 1.6, 2.6) + 0.6);
        return [
          { // 1 — imagine it gone (the hook)
            len: s1len,
            html: page(c, { bg: deepBg(c), top: chip(c, 'تخيّل…', { size: 34, cls: 'ghost' }), mid: `<div class="m1">${medal(c, ic, { size: 300, state: 'gone' })}</div>` + gap(c, 20) + `<div class="q1">${quote(c, vis, c.pick({ square: 62 }, 74), { w: 920 })}</div>`, gap: 30 }),
            anim(t, L) { enter($(L, '.chip'), t, 0.05, 0.6, 16); const m = $(L, '.m1'); mv(m, { o: 0.75 * out3(P(t, 0.1, 1.2)), s: 1 - 0.04 * P(t, 0, s1len) }); reveal($(L, '.q1 .t-quote'), t, 0.55, { stagger: Math.min(0.22, (s1len - 2.2) / Math.max(1, M.wordCount(vis))) }); breathe($(L, '.safe'), t, s1len, 0.02); },
            sfx: [[0.1, 'wind', -27, { dur: Math.min(4.5, s1len) }], [0.3, 'heartbeat', -26]],
          },
          { // 2 — and then open your eyes
            len: 3.8,
            html: page(c, { bg: { cone: 0.09, coneAt: '50% 30%', warm: 0.08, warmAt: '50% 36%' }, under: c.th === 'layl' ? `<div class="parts" style="position:absolute;inset:0">${particles(c, { n: 34, seed: 11 + b.n, box: [c.W * 0.2, c.H * 0.18, c.W * 0.8, c.H * 0.5], rmax: 6, omin: 0.15, omax: 0.85 })}</div>` : '', mid: `<div class="m2">${medal(c, ic, { size: 330 })}</div>` + gap(c, 20) + `<div class="q2">${quote(c, `ثم افتح عينيك…<br><span class="acc">إنها ما زالت بين يديك.</span>`, c.pick({ square: 66 }, 78))}</div>`, gap: 30 }),
            anim(t, L) { draw($(L, '.m2 svg'), P(t, 0.15, 1.7)); mv($(L, '.m2'), { o: 1, s: 0.94 + 0.06 * out3(P(t, 0.1, 1.6)) }); reveal($(L, '.q2 .t-quote'), t, 0.9, { stagger: 0.17 }); breathe($(L, '.safe'), t, 3.8, 0.025); drift($(L, '.parts svg'), t, { fade: [0.4, 1.0] }); },
            sfx: [[0.35, 'glint', -30], [1.25, 'drop', -21]],
          },
          { // 3 — name it, and praise
            len: 3.4,
            html: page(c, { bg: { cone: 0.08, coneAt: '50% 28%', warm: 0.1, warmAt: '50% 52%' }, top: chip(c, 'نعمة اليوم', { size: 34 }), mid: `<div class="k3">${kick(c, b.catLabel, 34)}</div><div class="t3">${title(c, b.title, c.pick({ square: 104 }, 128))}</div>` + gap(c, 10) + `<div class="g3">${display(c, gold('الحمدُ لله'), c.pick({ square: 120 }, 150))}</div>`, gap: 22 }),
            anim(t, L) { enter($(L, '.chip'), t, 0.05, 0.5, 14); enter($(L, '.k3'), t, 0.2); reveal($(L, '.t3 .t-title'), t, 0.3, { stagger: 0.18, dy: 26 }); pop($(L, '.g3'), t, 1.25, 0.8, 0.85); breathe($(L, '.safe'), t, 3.4, 0.02); },
            sfx: [[0.25, 'pop', -31], [1.2, 'breath', -27, { dur: 1.3 }]],
          },
          endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
        ];
      },
    });
  });

  /* ===================== RL — brand and feature reels ===================== */
  const reel = (id, name, pillar, formats, scenes, { alt = name, review = false } = {}) =>
    def(id, { kind: 'reel', name, group: 'RL', family: 'ريلز', pillar, formats, alt, review, scenes });
  const partsLayer = (c, seed, n = 40, box) => (c.th === 'layl' ? `<div class="parts" style="position:absolute;inset:0">${particles(c, { n, seed, box: box || [0, c.H * 0.18, c.W, c.H * 0.5], rmax: 6, omin: 0.15, omax: 0.85 })}</div>` : '');
  const ART_S = (c, fn, w, extra = '') => art(c, fn, { w, extra });
  const textScene = (c, { lines, size = 92, len, bgo, chipText, sfx = [], stagger = 0.16, visual = '' }) => ({
    len,
    html: page(c, { bg: bgo || { cone: 0.08, coneAt: '50% 34%', warm: 0.05 }, top: chipText ? chip(c, chipText, { size: 34 }) : '', mid: visual + `<div class="tx">${title(c, lines, c.pick({ square: size * 0.82 }, size))}</div>`, gap: 30 }),
    anim(t, L) { if (chipText) enter($(L, '.chip'), t, 0.05, 0.5, 14); if (visual) enter($(L, '.vis'), t, 0.05, 0.7, 20); reveal($(L, '.tx .t-title'), t, 0.3, { stagger }); breathe($(L, '.safe'), t, len, 0.02); },
    sfx,
  });

  // RL-01 — the loop of absence (the brand idea in ten seconds)
  reel('RL-01', 'النعمة لا تُرى… حتى تغيب', 'الفكرة', F_HERO, (c) => {
    const W = c.pick({ square: 300 }, 420);
    const glass = (st) => ART_S(c, () => A.glassArt(st, { ripple: st === 'lit' }), W);
    return [
      { len: 3.2, html: page(c, { bg: { cone: 0.08, coneAt: '50% 30%', warm: 0.06, warmAt: '50% 38%' }, mid: `<div class="g1">${glass('lit')}</div>` + `<div class="tx">${title(c, 'النعمةُ لا تُرى…', c.pick({ square: 92 }, 112))}</div>`, gap: 40 }),
        anim(t, L) { draw($(L, '.g1 svg'), P(t, 0.1, 1.6)); reveal($(L, '.tx .t-title'), t, 1.0, { stagger: 0.22 }); }, sfx: [[0.5, 'drop', -21]] },
      { len: 2.8, html: page(c, { bg: deepBg(c), mid: `<div class="g2">${glass('gone')}</div>` + `<div class="tx">${title(c, acc('حتى تغيب.'), c.pick({ square: 100 }, 124))}</div>`, gap: 40 }),
        anim(t, L) { mv($(L, '.g2'), { o: 0.8 * out3(P(t, 0, 0.8)), s: 1 - 0.05 * P(t, 0, 3) }); reveal($(L, '.tx .t-title'), t, 0.5, { stagger: 0.3 }); }, sfx: [[0.2, 'whoosh', -25, { dur: 1.6, from: 2600, to: 500 }]] },
      { len: 3.0, html: page(c, { bg: { cone: 0.1, coneAt: '50% 30%', warm: 0.1, warmAt: '50% 36%' }, under: partsLayer(c, 5), mid: `<div class="g3">${glass('lit')}</div>` + `<div class="tx">${title(c, `«الحمد»… ${acc('يُعيد إليك النظر.')}`, c.pick({ square: 76 }, 92))}</div>`, gap: 40 }),
        anim(t, L) { mv($(L, '.g3'), { o: 1, s: 0.92 + 0.08 * out3(P(t, 0, 1)) }); reveal($(L, '.tx .t-title'), t, 0.6, { stagger: 0.2 }); drift($(L, '.parts svg'), t, { fade: [0.2, 0.8] }); }, sfx: [[0.15, 'glint', -29], [0.4, 'breath', -27]] },
      endScene(c),
    ];
  });

  // RL-02 — close your eyes (interactive)
  reel('RL-02', 'أغمض عينيك ثلاث ثوانٍ', 'الفكرة', F_REEL, (c) => [
    { len: 4.2, html: page(c, { bg: { cone: 0.06 }, top: chip(c, 'جرّب معنا', { size: 34 }), mid: `<div class="tx">${title(c, 'أغمض عينيك… ثلاث ثوانٍ', 88)}</div>` + `<div class="num" style="position:relative;height:${c.px(330)}px;width:100%">${[3, 2, 1].map((d) => `<div class="t-num n${d}" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${c.px(300)}px;opacity:0">${AR(d)}</div>`).join('')}</div>`, gap: 30 }),
      anim(t, L) { enter($(L, '.chip'), t, 0.05, 0.5, 14); reveal($(L, '.tx .t-title'), t, 0.15, { stagger: 0.12 }); [3, 2, 1].forEach((d, i) => { const s = 1.0 + i * 1.0; const e = $(L, `.n${d}`); const p = P(t, s, 0.25) * (1 - P(t, s + 0.75, 0.25)); mv(e, { o: p, s: 0.8 + 0.2 * out3(P(t, s, 0.4)) }); }); L.style.filter = `brightness(${(1 - 0.75 * P(t, 3.5, 0.6)).toFixed(3)})`; },
      sfx: [[1.0, 'tick', -24], [2.0, 'tick', -24], [3.0, 'tick', -24]] },
    { len: 3.6, html: page(c, { bg: { cone: 0.22, coneAt: '50% 36%', warm: 0.16, warmAt: '50% 40%' }, under: partsLayer(c, 9, 70, [0, c.H * 0.1, c.W, c.H * 0.7]), mid: `<div class="tx">${title(c, `افتح عينيك…<br>${gold('هذا الضوءُ نعمة.')}`, 104)}</div>`, gap: 30 }),
      anim(t, L) { L.style.filter = `brightness(${(1.6 - 0.6 * out3(P(t, 0, 1.2))).toFixed(3)})`; reveal($(L, '.tx .t-title'), t, 0.4, { stagger: 0.2 }); drift($(L, '.parts svg'), t, { fade: [0, 0.6] }); },
      sfx: [[0.0, 'breath', -23, { dur: 1.2 }], [0.4, 'birds', -31]] },
    endScene(c),
  ]);

  // RL-03 — the tasbih: 33 beads, a click each, a buzz at the end
  reel('RL-03', 'المسبحة: ثلاثٌ وثلاثون', 'داخل التطبيق', F_REEL, (c) => {
    const N = 33, t0 = 0.6, dt = 0.17;
    const clicks = Array.from({ length: N }, (_, k) => [t0 + k * dt, 'click', k === N - 1 ? -21 : -23, { seed: 40 + (k % 9) }]);
    return [
      { len: t0 + N * dt + 1.6, html: page(c, { bg: { cone: 0.07, coneAt: '50% 30%' }, top: chip(c, 'المسبحة', { size: 34 }), mid: `<div class="bd">${art(c, () => A.beadsArt('lit', 0), { w: 560 })}</div>` + `<div class="cnt t-num" style="font-size:${c.px(150)}px">${AR(0)}</div>` + `<div class="tx">${title(c, 'سبحان الله', 84)}</div>`, gap: 18 }),
        anim(t, L) {
          const n = Math.max(0, Math.min(N, Math.floor((t - t0) / dt) + 1));
          $$(L, '.bead-dot').forEach((e) => { const on = +e.dataset.k < n; e.setAttribute('fill-opacity', on ? '0.34' : '0'); e.style.opacity = on ? '1' : '0.4'; });
          const cnt = $(L, '.cnt'); if (cnt) cnt.textContent = AR(t < t0 ? 0 : n);
          enter($(L, '.chip'), t, 0.05, 0.5, 14); enter($(L, '.tx'), t, 0.2);
          const done = P(t, t0 + N * dt, 0.3); const sh = done > 0 && done < 1 ? Math.sin(done * Math.PI * 10) * 6 : 0; mv($(L, '.bd'), { o: 1, x: sh });
        },
        sfx: [...clicks, [t0 + N * dt + 0.05, 'vibrate', -24]] },
      textScene(c, { lines: `تسبيحٌ بلمسة…<br>${acc('واهتزازٌ خفيف عند كلّ ثلاثٍ وثلاثين.')}`, size: 80, len: 3.2, chipText: 'في «الحمد»' }),
      endScene(c),
    ];
  });

  // RL-04 — five pauses on the thread
  const STEPS5 = [['التهيئة والحضور', '١٠ ثوانٍ'], ['تخيّل الغياب', '٢٠ ثانية'], ['التعمّق', '٢٠ ثانية'], ['العودة', '١٥ ثانية'], ['الحمد', '١٥ ثانية']];
  reel('RL-04', 'دقيقتان… وخمس وقفات', 'الفكرة', F_REEL, (c) => {
    const rowH = c.px(150), dot = c.px(24);
    const rows = STEPS5.map(([n, tm], i) => `<div class="row r${i}" style="position:relative;height:${rowH}px;display:flex;align-items:center;gap:${c.px(26)}px;padding-right:${c.px(70)}px;direction:rtl"><div class="dot" style="position:absolute;right:${c.px(24) - dot / 2}px;top:${rowH / 2 - dot / 2}px;width:${dot}px;height:${dot}px;border-radius:50%;background:${i === 4 ? 'var(--accent)' : 'var(--line)'}"></div><div class="t-title" style="font-size:${c.px(70)}px;text-align:right">${i === 4 ? acc(n) : n}</div><div class="t-small" style="font-size:${c.px(34)}px">${tm}</div></div>`).join('');
    const list = `<div class="lst" style="position:relative;width:${c.px(780)}px"><div class="ln" style="position:absolute;right:${c.px(24) - 1.5}px;top:${rowH / 2}px;width:3px;height:${rowH * 4}px;background:var(--line);transform-origin:top"></div>${rows}</div>`;
    const at = (i) => 1.6 + i * 1.25;
    return [
      { len: at(4) + 2.2, html: page(c, { bg: { cone: 0.07 }, top: chip(c, 'استشعر النعمة', { size: 34 }), mid: `<div class="tx">${title(c, `دقيقتان… ${acc('وخمس وقفات')}`, 96)}</div>` + list, gap: 50 }),
        anim(t, L) { enter($(L, '.chip'), t, 0.05, 0.5, 14); reveal($(L, '.tx .t-title'), t, 0.2, { stagger: 0.18 }); const ln = $(L, '.ln'); if (ln) ln.style.transform = `scaleY(${inOut(P(t, at(0), at(4) - at(0))).toFixed(3)})`; STEPS5.forEach((_, i) => enter($(L, `.r${i}`), t, at(i), 0.6, 24)); },
        sfx: STEPS5.map((_, i) => [at(i) + 0.05, 'pop', i === 4 ? -29 : -31]) },
      endScene(c, { line: 'دقيقتان كلَّ يوم', sub: 'تُعيدان إليك النظر' }),
    ];
  });

  // RL-05 — question of the day: points of light that connect
  reel('RL-05', 'كم نعمةً مرّت بك اليوم؟', 'شاركنا', F_REEL, (c) => {
    const pts = [[0.24, 0.3], [0.42, 0.21], [0.63, 0.27], [0.78, 0.17], [0.7, 0.4], [0.5, 0.45], [0.3, 0.42], [0.18, 0.52]].map(([x, y]) => [x * c.W, y * c.H]);
    const svg = `<svg class="cn" style="position:absolute;left:0;top:0;width:${c.W}px;height:${c.H}px;overflow:visible;color:var(--accent)" viewBox="0 0 ${c.W} ${c.H}">${pts.slice(1).map(([x, y], i) => `<line class="ln" pathLength="1" x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${x}" y2="${y}" stroke="currentColor" stroke-width="2" stroke-opacity="0.55" style="stroke-dasharray:1 1;stroke-dashoffset:1"/>`).join('')}${pts.map(([x, y]) => `<circle class="pt" cx="${x}" cy="${y}" r="${c.px(10)}" fill="currentColor" style="opacity:0;filter:drop-shadow(0 0 12px currentColor)"/>`).join('')}</svg>`;
    const ti = (i) => 0.3 + i * 0.42;
    return [
      { len: 6.4, html: bg(c, { cone: 0.05 }) + svg + page(c, { bg: '', mid: gap(c, c.H * 0.32) + `<div class="tx">${title(c, `كم نعمةً<br>${acc('مرّت بك اليوم؟')}`, 112)}</div>` + `<div class="nt">${kick(c, 'عُدَّها… واكتب واحدةً في التعليقات', 34, { extra: 'color:var(--accent)' })}</div>`, gap: 30 }),
        anim(t, L) { $$(L, '.pt').forEach((e, i) => { e.style.opacity = String(out3(P(t, ti(i), 0.4))); }); $$(L, '.ln').forEach((e, i) => { e.style.strokeDashoffset = String(1 - inOut(P(t, ti(i) + 0.15, 0.45))); }); reveal($(L, '.tx .t-title'), t, 3.0, { stagger: 0.2 }); enter($(L, '.nt'), t, 4.6); },
        sfx: [...pts.slice(0, 6).map((_, i) => [ti(i), 'glint', -32, { seed: 61 + i }]), [3.6, 'breath', -28]] },
      endScene(c, { sub: 'ابدأ بواحدة… مع «الحمد»' }),
    ];
  });

  // RL-06 — coming soon: a point becomes a thread, the thread becomes the name
  reel('RL-06', 'قريبًا على Google Play', 'الإطلاق', F_HERO, (c) => [
    { len: 1.6, html: bg(c, { tone: 'black', pat: 0.012, cone: 0 }) + `<div class="safe" style="justify-content:center"><div class="pd" style="width:${c.px(26)}px;height:${c.px(26)}px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 ${c.px(14)}px var(--halo),0 0 50px var(--accent)"></div></div>`,
      anim(t, L) { const b = Math.sin(P(t, 0.2, 1.2) * Math.PI); mv($(L, '.pd'), { o: out3(P(t, 0, 0.5)), s: 1 + 0.25 * b }); }, sfx: [[0.3, 'heartbeat', -24]] },
    { len: 4.6, html: page(c, { bg: { cone: 0.1, coneAt: '50% 40%', warm: 0.06 }, under: partsLayer(c, 77, 60), mid: `<div class="w">${wm(c, c.pick({ square: 190 }, 240))}</div>` + gap(c, 30) + `<div class="q">${display(c, gold('قريبًا'), c.pick({ square: 110 }, 136))}</div><div class="s">${body(c, `على ${ltr('Google Play')}`, 50)}</div>`, gap: 18 }),
      anim(t, L) { enter($(L, '.w'), t, 0.1, 0.9, 20); pop($(L, '.q'), t, 0.9, 0.8, 0.85); enter($(L, '.s'), t, 1.4); drift($(L, '.parts svg'), t, { fade: [0.3, 1] }); breathe($(L, '.safe'), t, 4.6, 0.03); },
      sfx: [[0.2, 'breath', -27], [0.9, 'drop', -20]] },
  ]);

  // RL-07 — a tour of the app (real screens)
  const TOUR = [['home_top', 'نعمةٌ واحدة كلَّ يوم'], ['reflect_2_visualize', 'دقيقتان من التأمّل'], ['reflect_5_hamd', 'تحمد الله بقلبٍ حاضر'], ['tab_journal', 'سجلّك… على جهازك وحده'], ['tab_tasbih', 'المسبحة وحصن المسلم'], ['tab_consistency', 'المداومة بلا عدّاد']];
  reel('RL-07', 'جولة في التطبيق', 'داخل التطبيق', F_HERO, (c) => [
    ...TOUR.map(([src, h], i) => ({
      len: 2.5,
      html: bg(c, { cone: 0.06, coneAt: '50% 18%' }) + `<div class="safe" style="padding:${c.safe[0]}px ${c.safe[1]}px 0 ${c.safe[3]}px;gap:${c.px(30)}px"><div class="slot top tx">${title(c, h, c.pick({ square: 70 }, 88), { fit: false })}</div><div class="slot ph" style="flex:1 1 auto;justify-content:flex-start">${phone(c, src, { w: c.pick({ square: 470 }, 760) })}</div></div>` + fadeB(c, c.pick({ square: 200 }, 380), null, 0.7),
      anim(t, L) { enter($(L, '.tx'), t, 0.05, 0.5, 18); const p = out3(P(t, 0, 0.8)); mv($(L, '.ph'), { o: 1, y: (1 - p) * c.px(140) }); },
      sfx: i === 0 ? [[0.05, 'whoosh', -33, { dur: 0.9, from: 1800, to: 700 }]] : [[0.1, 'tap', -26]],
    })),
    endScene(c, { line: 'مجّانًا… وبلا إعلانات', sub: 'نعمةٌ كلَّ يوم في «الحمد»' }),
  ]);

  // RL-08 — available now (launch)
  reel('RL-08', 'متاح الآن على Google Play', 'الإطلاق', F_HERO, (c) => [
    { len: 1.4, html: bg(c, { tone: 'black', pat: 0.012, cone: 0 }) + `<div class="safe" style="justify-content:center"><div class="pd" style="width:${c.px(26)}px;height:${c.px(26)}px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 ${c.px(14)}px var(--halo),0 0 50px var(--accent)"></div></div>`,
      anim(t, L) { mv($(L, '.pd'), { o: out3(P(t, 0, 0.4)), s: 1 + 0.3 * Math.sin(P(t, 0.2, 1) * Math.PI) }); }, sfx: [[0.25, 'heartbeat', -24]] },
    { len: 2.8, html: page(c, { bg: { cone: 0.1, coneAt: '50% 40%', warm: 0.08 }, under: partsLayer(c, 31, 60), mid: `<div class="w">${wm(c, c.pick({ square: 190 }, 240))}</div>` + gap(c, 20) + `<div class="q">${chip(c, 'متاح الآن', { size: 44, cls: 'solid' })}</div>`, gap: 20 }),
      anim(t, L) { enter($(L, '.w'), t, 0.05, 0.8, 20); pop($(L, '.q'), t, 0.8, 0.6, 0.7); drift($(L, '.parts svg'), t); }, sfx: [[0.1, 'breath', -27], [0.8, 'drop', -20]] },
    { len: 3.4, html: bg(c, { cone: 0.07, coneAt: '50% 18%', warm: 0.05, warmAt: '50% 70%' }) + `<div class="safe" style="padding:${c.safe[0]}px ${c.safe[1]}px 0 ${c.safe[3]}px;gap:${c.px(26)}px"><div class="slot top tx" style="gap:${c.px(14)}px">${title(c, `«الحمد» ${acc(`على ${ltr('Google Play')}`)}`, c.pick({ square: 74 }, 92), { fit: false })}${body(c, 'مجّانًا · بلا حساب · بلا إعلانات', 42, { fit: false })}</div><div class="slot ph" style="flex:1 1 auto;justify-content:flex-start">${phone(c, 'home_top', { w: c.pick({ square: 440 }, 700) })}</div></div>` + fadeB(c, c.pick({ square: 180 }, 360), null, 0.7),
      anim(t, L) { enter($(L, '.tx'), t, 0.05, 0.6, 18); const p = out3(P(t, 0.1, 1)); mv($(L, '.ph'), { o: 1, y: (1 - p) * c.px(200) }); }, sfx: [[0.1, 'whoosh', -32, { dur: 0.9, from: 1800, to: 700 }]] },
    endScene(c, { line: 'حمّله الآن', sub: `مجّانًا من ${ltr('Google Play')}`, extra: cta(c, 'ابدأ بنعمة اليوم', { size: 40 }) }),
  ]);

  // RL-09 — your journal stays on your phone
  reel('RL-09', 'سجلّك لك: على جهازك وحده', 'وعدنا', F_REEL, (c) => [
    { len: 4.0, html: bg(c, { cone: 0.06, coneAt: '50% 18%' }) + `<div class="safe" style="padding:${c.safe[0]}px ${c.safe[1]}px 0 ${c.safe[3]}px;gap:${c.px(30)}px"><div class="slot top tx">${title(c, 'سجلّ الحمد', 96, { fit: false })}${body(c, 'دفترك الخاص… تكتب فيه ما وجدته في نفسك', 40, { fit: false })}</div><div class="slot ph" style="flex:1 1 auto;justify-content:flex-start">${phone(c, 'tab_journal', { w: 740 })}</div></div>` + fadeB(c, 360, null, 0.7) +
      `<div class="abs bdg" style="left:${c.W * 0.08}px;top:${c.H * 0.52}px;display:flex;align-items:center;gap:${c.px(14)}px;padding:${c.px(18)}px ${c.px(30)}px ${c.px(20)}px;border-radius:999px;background:var(--chip-bg);border:2px solid var(--chip-b);box-shadow:var(--card-shadow);transform:rotate(-4deg);z-index:5;font-family:var(--sans);font-weight:600;font-size:${c.px(38)}px;color:var(--accent)">${uicon(c, 'shield', 42, 1.8, 'var(--accent)')}<span>على جهازك فقط</span></div>`,
      anim(t, L) { enter($(L, '.tx'), t, 0.05, 0.6, 18); mv($(L, '.ph'), { o: 1, y: (1 - out3(P(t, 0.1, 1))) * c.px(160) }); pop($(L, '.bdg'), t, 1.6, 0.6, 0.6); }, sfx: [[0.1, 'whoosh', -33, { dur: 0.9, from: 1800, to: 700 }], [1.65, 'pop', -28]] },
    textScene(c, { lines: `ما تكتبه…<br>${acc('لا يغادر جهازك.')}`, size: 104, len: 3.0, visual: `<div class="vis" style="color:var(--stroke)">${uicon(c, 'shield', 150, 1.2)}</div>`, sfx: [[0.3, 'breath', -28]] }),
    endScene(c),
  ]);

  // RL-10 — the promise, three lines
  reel('RL-10', 'بلا حساب. بلا إعلانات. بلا ضغط.', 'وعدنا', F_REEL, (c) => {
    const L3 = ['بلا حساب.', 'بلا إعلانات.', 'بلا سلاسل ولا ضغط.'];
    return [
      { len: 4.8, html: page(c, { bg: { cone: 0.08 }, mid: L3.map((l, i) => `<div class="l${i}">${title(c, acc(l), 112)}</div>`).join(''), gap: 26 }),
        anim(t, L) { L3.forEach((_, i) => enter($(L, `.l${i}`), t, 0.3 + i * 1.1, 0.6, 26)); breathe($(L, '.safe'), t, 4.8, 0.03); }, sfx: L3.map((_, i) => [0.3 + i * 1.1, 'pop', -29]) },
      textScene(c, { lines: `فقط…<br>${acc('نعمةٌ كلَّ يوم.')}`, size: 112, len: 2.6 }),
      endScene(c),
    ];
  });

  // RL-11 — twenty thousand breaths
  reel('RL-11', 'عشرون ألف نَفَس كلَّ يوم', 'الفكرة', F_REEL, (c) => [
    { len: 4.6, html: page(c, { bg: { cone: 0.07, warm: 0.05 }, mid: `<div class="m">${medal(c, 'nafas', { size: 220 })}</div><div class="cnt t-num" style="font-size:${c.px(210)}px;direction:rtl">٠</div><div class="tx">${title(c, 'نَفَسٍ تأخذه كلَّ يوم…', 92)}</div>`, gap: 26 }),
      anim(t, L) { draw($(L, '.m svg'), P(t, 0, 1.4)); const p = inOut(P(t, 0.4, 2.6)); const e = $(L, '.cnt'); if (e) e.textContent = Math.round(p * 20000 / 10) * 10 === 0 ? '٠' : (Math.round(p * 20000 / 10) * 10).toLocaleString('ar-EG'); reveal($(L, '.tx .t-title'), t, 2.6, { stagger: 0.18 }); },
      sfx: [[0.3, 'breath', -26, { dur: 1.3 }], [2.2, 'breath', -27, { dur: 1.3 }]] },
    textScene(c, { lines: `كم واحدًا منها…<br>${acc('حمدتَ اللهَ عليه؟')}`, size: 104, len: 3.2 }),
    endScene(c),
  ]);

  // RL-12 — before you sleep: count three
  reel('RL-12', 'قبل أن تنام: عُدَّ ثلاثًا', 'نعمة اليوم', F_REEL, (c) => [
    { len: 2.8, html: page(c, { bg: { tone: 'ground', cone: 0.05 }, mid: `<div class="m">${medal(c, 'nawm', { size: 340 })}</div><div class="tx">${title(c, 'قبل أن تنام…', 110)}</div>`, gap: 36 }),
      anim(t, L) { draw($(L, '.m svg'), P(t, 0, 1.6)); reveal($(L, '.tx .t-title'), t, 0.9, { stagger: 0.22 }); }, sfx: [[0.3, 'breath', -27]] },
    { len: 4.8, html: page(c, { bg: { tone: 'ground', cone: 0.05 }, mid: `<div class="tx">${title(c, `عُدَّ ثلاثَ نِعَمٍ<br>${acc('من يومك')}`, 100)}</div><div style="display:flex;gap:${c.px(70)}px;direction:rtl">${['واحدة', 'اثنتان', 'ثلاث'].map((w, i) => `<div class="c${i}" style="display:flex;flex-direction:column;align-items:center;gap:${c.px(18)}px"><div style="width:${c.px(70)}px;height:${c.px(70)}px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 ${c.px(14)}px var(--halo),0 0 40px var(--accent)"></div>${kick(c, w, 40, { extra: 'color:var(--text)' })}</div>`).join('')}</div>`, gap: 60 }),
      anim(t, L) { reveal($(L, '.tx .t-title'), t, 0.1, { stagger: 0.16 }); [0, 1, 2].forEach((i) => pop($(L, `.c${i}`), t, 1.4 + i * 0.9, 0.5, 0.5)); }, sfx: [0, 1, 2].map((i) => [1.4 + i * 0.9, 'glint', -30, { seed: 70 + i }]) },
    textScene(c, { lines: `ثم نَم…<br>${gold('الحمدُ لله.')}`, size: 112, len: 2.8, bgo: { tone: 'ground', cone: 0.05, warm: 0.06 } }),
    endScene(c),
  ]);

  // RL-13 — seven blessings we walk past
  const SEV = [37, 15, 36, 17, 38, 14, 33];
  reel('RL-13', 'سبع نِعَم تمرّ بها كلَّ يوم', 'الفكرة', F_REEL, (c) => {
    const at = (i) => 0.4 + i * 0.85;
    return [
      textScene(c, { lines: `سبعُ نِعَمٍ…<br>${acc('تمرّ بها كلَّ يوم')}`, size: 108, len: 2.4 }),
      { len: at(6) + 1.8, html: page(c, { bg: { cone: 0.07 }, mid: `<div style="display:grid;grid-template-columns:repeat(3,auto);gap:${c.px(40)}px ${c.px(50)}px;justify-content:center;direction:rtl">${SEV.map((n, i) => `<div class="b${i}" style="display:flex;flex-direction:column;align-items:center;gap:${c.px(12)}px;${i === 6 ? 'grid-column:2' : ''}">${medal(c, ICON[BY[n].id], { size: 200 })}${kick(c, BY[n].short, 34, { extra: 'color:var(--text)' })}</div>`).join('')}</div>` }),
        anim(t, L) { SEV.forEach((_, i) => pop($(L, `.b${i}`), t, at(i), 0.55, 0.6)); }, sfx: SEV.map((_, i) => [at(i), 'pop', -31]) },
      textScene(c, { lines: acc('ولا تلتفت.'), size: 140, len: 2.4, bgo: deepBg(c) }),
      endScene(c, { sub: 'واحدةٌ منها كلَّ يوم… في «الحمد»' }),
    ];
  });

  // RL-14 — Ramadan: the fasting verse ends in gratitude
  const V13 = (CT.verses.find((v) => v.id === 'SV-13') || { text: '' }).text;
  reel('RL-14', 'رمضان: آيةٌ تُختم بالشكر', 'المواسم', F_REEL, (c) => [
    { len: 3.2, html: page(c, { bg: { cone: 0.08, warm: 0.1, warmAt: '50% 36%' }, under: partsLayer(c, 48, 50), mid: `<div class="m">${medal(c, 'ramadan', { size: 360 })}</div><div class="g">${display(c, gold('رمضانُ مبارك'), 128)}</div>`, gap: 40 }),
      anim(t, L) { draw($(L, '.m svg'), P(t, 0, 1.6)); pop($(L, '.g'), t, 1.2, 0.8, 0.85); drift($(L, '.parts svg'), t, { fade: [0.4, 1] }); }, sfx: [[0.2, 'glint', -30], [1.2, 'breath', -27]] },
    { len: 5.0, html: page(c, { bg: { cone: 0.07 }, mid: `<div class="v">${verseT(c, `<span class="acc">﴿</span>${V13}<span class="acc">﴾</span>`, 84, { w: 940 })}</div><div class="r">${kick(c, `[البقرة: ${AR(185)}]`, 34)}</div>`, gap: 30 }),
      anim(t, L) { enter($(L, '.v'), t, 0.2, 1.2, 20); enter($(L, '.r'), t, 1.2); } },
    textScene(c, { lines: `آيةُ شهر رمضان…<br>${acc('تُختم بالشكر.')}`, size: 104, len: 2.8 }),
    endScene(c, { sub: 'رمضان مع «الحمد»: نعمةٌ كلَّ يوم' }),
  ], { review: true });

  // RL-15 — the seven-day challenge
  const CH7 = [37, 15, 36, 22, 16, 14, 27];
  reel('RL-15', 'تحدّي الحمد: سبعة أيام', 'شاركنا', F_REEL, (c) => {
    const at = (i) => 0.3 + i * 0.6;
    return [
      textScene(c, { lines: `سبعةُ أيام…<br>${acc('سبعُ نِعَم')}`, size: 116, len: 2.6, chipText: '#تحدي_الحمد' }),
      { len: at(6) + 2.0, html: page(c, { bg: { cone: 0.06 }, mid: `<div style="display:flex;flex-direction:column;gap:${c.px(16)}px;width:${c.px(760)}px">${CH7.map((n, i) => `<div class="d${i}" style="display:flex;align-items:center;gap:${c.px(26)}px;direction:rtl"><div class="t-num" style="font-size:${c.px(64)}px;width:${c.px(80)}px;text-align:center">${AR(i + 1)}</div>${medal(c, ICON[BY[n].id], { size: 104 })}<div class="t-title" style="font-size:${c.px(58)}px;text-align:right">${BY[n].title}</div></div>`).join('')}</div>` }),
        anim(t, L) { CH7.forEach((_, i) => enter($(L, `.d${i}`), t, at(i), 0.5, 20)); }, sfx: CH7.map((_, i) => [at(i), 'pop', -32]) },
      textScene(c, { lines: `دقيقةٌ كلَّ يوم…<br>${acc('ابدأ معنا غدًا.')}`, size: 100, len: 2.6 }),
      endScene(c, { sub: 'شارك يومك مع #تحدي_الحمد' }),
    ];
  });

  // RL-16 — night or day
  reel('RL-16', '«ليل» أم «نهار»؟', 'الهوية', F_REEL, (c) => [
    { len: 4.2, html: `<div class="bgl" style="background:linear-gradient(180deg,#0C0C1C,#111126 55%,#0B0B1A)"></div>` +
        `<div class="abs ll" style="left:0;top:0;width:50%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:${c.px(130)}px;color:#E4C368">ليل</div>` +
        `<div class="dayp abs" style="right:0;top:0;width:50%;height:100%;background:linear-gradient(180deg,#F8F2E9,#ECE1D1);clip-path:inset(0 0 0 100%)"><div class="nh" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:${c.px(130)}px;color:#2A1F19">نهار</div></div>` +
        `<div class="abs q" style="left:0;right:0;bottom:${c.safe[2] + c.px(60)}px;display:flex;justify-content:center"><span class="chip" style="font-size:${c.px(40)}px;padding:${c.px(16)}px ${c.px(44)}px ${c.px(20)}px;background:rgba(17,17,38,0.85);color:#E4C368;border-color:rgba(200,169,81,0.6)">أيّهما يشبهك؟</span></div>`,
      anim(t, L) { const p = inOut(P(t, 0.5, 1.4)); const d = $(L, '.dayp'); if (d) d.style.clipPath = `inset(0 0 0 ${(100 - 100 * p).toFixed(2)}%)`; enter($(L, '.ll'), t, 0.1, 0.6, 20); enter($(L, '.nh'), t, 1.0, 0.6, 20); enter($(L, '.q'), t, 2.1); },
      sfx: [[0.5, 'whoosh', -31, { dur: 1.4, from: 2000, to: 600 }]] },
    textScene(c, { lines: `في «الحمد» ثيمان…<br>${acc('اكتب في التعليقات: ليل أم نهار؟')}`, size: 84, len: 3.0 }),
    endScene(c),
  ]);
})();
