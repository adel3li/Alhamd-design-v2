/*
 * Alhamd organic kit — a blessing package: every format for one blessing, built from the app's own card.
 * The blessings come from CONTENT.bundle (tools/build_content.py → BUNDLE); voice timings from VOICE (tools/voice.py).
 *
 * IDs (nn = the blessing's order)
 *   GH-nn-1..2   «غابت… ثم عادت»: the absence, then the return (2 slides)
 *   HS-nn-1..6   «من الشاشة الرئيسية»: the blessing card as the app shows it (cover, verse, hadith, tadabbur, quote, app)
 *   JR-nn-1..10  «الرحلة كاملة»: the card, then the five pauses, the duaa and the journal (10 slides)
 *   SQ-nn        story question with room for the question sticker
 *   AY-nn        verse card (Uthmani, checked against a second source)
 *   PC-nn        podcast episode cover
 *   JM-<stage>-1..9  «رحلتي»: the journey stage that holds the blessing (cover, seven stations, call)
 *   AN-nn        animated reel (line art, no voice)
 *   VV-nn        the five pauses, voiced, on the app's clock (needs kit/voice.js)
 *   VW-nn        the same reel without voice, at reading pace
 *
 * Creatives that print the hadith or the scholar's words, or any verse, carry review: true. The hadith and the
 * quote are still pending review in the app; nothing marked review is posted before a named reviewer approves it.
 */
(function () {
  const K = window.KIT;
  const { def } = K;
  const { bg, title, display, quote, body, kick, verseT, acc, ltr, gold, gap, chip, medal, glyph, wm, sig, cta, pager, swipe, phone, particles, page, T } = K.C;
  const AR = K.AR;
  const CT = window.CONTENT;
  const ICON = window.ICONS.BY_BLESSING;
  const VOICE = window.VOICE || {};
  const BY_ID = Object.fromEntries(CT.blessings.map((b) => [b.id, b]));
  const pad2 = (n) => String(n).padStart(2, '0');
  const F_SLIDE = ['portrait', 'story', 'square'];
  const STEP_LABEL = { ground: 'التهيئة والحضور', visualize: 'تخيّل الغياب', deepen: 'إدراك أثر النعمة', return: 'العودة بالحمد', hamd: 'الحمد والشكر' };
  const ABSENT = (type) => type === 'visualize' || type === 'deepen';
  const sigSize = (c) => c.pick({ story: 62, square: 50 }, 56);
  const deep = { tone: 'deep', pat: 0.022, cone: 0.02 };
  const CUSTOM_FPS = { 5: 1, 37: 1, 15: 1, 22: 1, 19: 1 }; // the first packages, rendered at 30 fps before the slow voiced reel moved to 15

  /* ---------- shared slide furniture ---------- */
  const slide = (c, i, n, inner, { bgo, sw = i === 1, under = '', top = '', foot = '', g } = {}) =>
    page(c, { bg: bgo || { cone: 0.06 }, under, top, foot, mid: inner, gap: g !== undefined ? g : c.pick({ story: 40, square: 20 }, 30), over: pager(c, i, n) + (sw ? swipe(c) : '') });
  const label = (c, text, size = 34) => `<div class="lbl fit" data-fs="${c.px(size)}" style="font-size:${c.px(size)}px">${text}</div>`;
  const ref = (v) => `[${v.surahName}: ${AR(v.ayah)}]`;
  const orn = (s) => `<span class="acc">${s}</span>`;
  const hadithSource = (h) => `${h.source}${h.number ? ` ${AR(h.number)}` : ''}${h.grade ? ` (${h.grade})` : ''}`;
  // a named scholar gets «بتصرّف» when the app marks the words as a paraphrase; an unnamed one shows the app's own note (e.g. «مستفاد من شرح الحديث»)
  const quoteBy = (q) => (q.scholar ? `— ${q.scholar}${q.work ? ` («${q.work}»)` : ''}${q.paraphrase ? '، بتصرّف' : ''}` : q.note ? `— ${q.note}` : (q.paraphrase ? 'بتصرّف' : ''));
  const lit = (c) => (c.th === 'layl' ? particles(c, { n: 36, seed: 31, box: [c.W * 0.15, c.H * 0.12, c.W * 0.85, c.H * 0.55], rmax: 6, omin: 0.15, omax: 0.8 }) : '');
  /** The verse in the app's sunken ayah block. */
  const ayah = (c, v, size) => `<div class="sunken" style="width:100%;max-width:${c.px(940)}px;padding:${c.px(46)}px ${c.px(40)}px ${c.px(34)}px;display:flex;flex-direction:column;align-items:center;gap:${c.px(18)}px">` +
    verseT(c, `${orn('﴿')}${v.text}${orn('﴾')}`, size, { w: 880 }) + kick(c, ref(v), 30) + '</div>';

  /* ---------- the slides the carousels share (each returns (c, i, n) => html) ---------- */
  const S = {
    cover: (b) => (c, i, n) => slide(c, i, n,
      chip(c, 'نعمة اليوم', { size: 32 }) + gap(c, 6) + medal(c, ICON[b.id], { size: c.pick({ story: 360, square: 200 }, 260) }) +
      kick(c, b.catLabel, 30) + title(c, b.title, c.pick({ story: 130, square: 96 }, 112)) + body(c, b.opening, c.pick({ story: 52, square: 40 }, 46), { w: 880 }),
      { bgo: { cone: 0.08, coneAt: '50% 24%', warm: 0.07, warmAt: '50% 36%' } }),
    verse: (b) => (c, i, n) => slide(c, i, n,
      label(c, 'آيةُ النعمة') + ayah(c, b.verse, c.pick({ story: 84, square: 64 }, 74)),
      { bgo: { cone: 0.08, coneAt: '50% 34%', warm: 0.06, warmAt: '50% 46%' } }),
    hadith: (b) => (c, i, n) => slide(c, i, n,
      label(c, 'الحديث الشريف') + quote(c, `«${b.hadith.text}»`, c.pick({ story: 66, square: 50 }, 58), { w: 920 }) +
      `<div class="rule" style="max-width:${c.px(140)}px;background:var(--line)"></div>` + kick(c, hadithSource(b.hadith), 30)),
    tadabbur: (b) => (c, i, n) => slide(c, i, n,
      `<div style="width:${c.px(90)}px;height:${c.px(90)}px;color:var(--stroke)">${window.ART.icon('sparkle', 'currentColor', c.px(90), 1.4)}</div>` +
      label(c, 'وقفاتٌ في أثر النعمة') +
      quote(c, b.tadabbur.replace(/([^.؛]*…[^.]*\.)\s*$/, (m) => acc(m)), c.pick({ story: 60, square: 44 }, 52), { w: 920 }),
      { bgo: { tone: 'ground', cone: 0.06 } }),
    quote: (b) => (c, i, n) => slide(c, i, n,
      `<div class="qm" style="font-size:${c.px(220)}px;height:${c.px(110)}px">”</div>` +
      quote(c, b.quote.text, c.pick({ story: 74, square: 54 }, 64), { w: 900, extra: 'font-style:italic' }) +
      kick(c, quoteBy(b.quote), 32, { extra: 'color:var(--accent)' })),
    step: (b, k, { withGround = false } = {}) => (c, i, n) => {
      const type = b.stepTypes[k], absent = ABSENT(type), hamd = type === 'hamd';
      const line = hamd ? b.steps[k].replace(/الحمد لله/, (m) => acc(m)) : b.steps[k];
      return slide(c, i, n,
        (withGround ? kick(c, b.steps[0], c.pick({ story: 36 }, 32), { w: 880, extra: 'opacity:0.85' }) + gap(c, 6) : '') +
        chip(c, STEP_LABEL[type], { size: 32, cls: hamd ? 'solid' : absent ? 'ghost' : '' }) +
        quote(c, line, c.pick({ story: 82, square: 60 }, 70), { w: 920 }) +
        medal(c, ICON[b.id], { size: c.pick({ story: 250, square: 120 }, 180), state: absent ? 'gone' : 'lit' }),
        { bgo: absent ? deep : { cone: 0.07, warm: hamd || type === 'return' ? 0.1 : 0, warmAt: '50% 70%' }, under: type === 'return' ? lit(c) : '' });
    },
    hamd: (b, k) => (c, i, n) => slide(c, i, n,
      chip(c, STEP_LABEL.hamd, { size: 32, cls: 'solid' }) +
      quote(c, b.steps[k].replace(/الحمد لله/, (m) => acc(m)), c.pick({ story: 74, square: 54 }, 62), { w: 920 }) +
      `<div class="card" style="width:100%;max-width:${c.px(900)}px;border-radius:${c.px(36)}px;padding:${c.px(34)}px ${c.px(40)}px;display:flex;flex-direction:column;gap:${c.px(10)}px;align-items:center">` +
      label(c, 'دعاء اليوم', 30) + quote(c, `«${b.duaa}»`, c.pick({ story: 58, square: 44 }, 50), { w: 840 }) + '</div>',
      { bgo: { cone: 0.08, warm: 0.1, warmAt: '50% 62%' } }),
    journal: (b) => (c, i, n) => slide(c, i, n,
      `<div style="color:var(--stroke)">${window.ART.icon('book', 'currentColor', c.px(c.pick({ story: 120 }, 96)), 1.4)}</div>` +
      title(c, 'سجلّ الحمد', c.pick({ story: 104, square: 76 }, 90)) +
      quote(c, b.prompt.replace(/^اكتب:\s*/, ''), c.pick({ story: 70, square: 52 }, 60), { w: 900 }) +
      kick(c, 'اكتبها في دفترك… أو في التعليقات', 30, { extra: 'color:var(--accent)' }) + gap(c, 14) +
      cta(c, 'استشعر النعمة في «الحمد»', { size: 38 }) + kick(c, ltr('alhamd.app'), 30),
      { bgo: { cone: 0.08, warm: 0.06, warmAt: '50% 60%' } }),
    app: (b) => (c, i, n) => {
      const [t, r, bb, l] = c.safe;
      const pw = c.pick({ story: 700, portrait: 540, square: 400 }, 540);
      return bg(c, { cone: 0.07, coneAt: '50% 18%', warm: 0.05, warmAt: '50% 70%' }) +
        `<div class="safe" style="padding:${t}px ${r}px 0 ${l}px;gap:${c.px(c.pick({ square: 14 }, 24))}px"><div class="slot top" style="gap:${c.px(14)}px">` +
        title(c, `دقيقتان معها…<br>${acc('في «الحمد»')}`, c.pick({ story: 100, square: 70 }, 84), { fit: false }) +
        body(c, 'تتخيّل غيابها… ثم تعود إليها فتحمد الله.', c.pick({ square: 34 }, 40), { fit: false, w: 900 }) + '</div>' +
        `<div class="slot" style="flex:1 1 auto;min-height:0;justify-content:flex-start">${phone(c, `b${pad2(b.n)}_home_card`, { w: pw })}</div></div>` +
        K.C.fadeB(c, c.pick({ story: 640, square: 260 }, 380)) +
        `<div class="abs" style="left:0;right:0;bottom:${Math.max(bb, c.px(70))}px;display:flex;flex-direction:column;align-items:center;gap:${c.px(12)}px">${cta(c, 'استشعر النعمة', { size: 38 })}${kick(c, ltr('alhamd.app'), 30)}</div>` +
        pager(c, i, n);
    },
  };

  function carousel(id, name, family, slides, { review = false, alt = name } = {}) {
    slides.forEach((s, k) => def(`${id}-${k + 1}`, {
      name, group: id, family, pillar: 'باقة النعمة', formats: F_SLIDE, slide: k + 1, slides: slides.length,
      review: typeof review === 'function' ? review(k) : review, alt, build: (c) => s(c, k + 1, slides.length),
    }));
  }

  Object.values(CT.bundle || {}).forEach((pk) => {
    const base = CT.blessings.find((x) => x.n === pk.n) || {};
    const b = { ...pk, steps: base.steps, duaa: base.duaa, prompt: base.prompt };
    const nn = pad2(b.n);
    const ic = ICON[b.id];
    const hamdK = b.stepTypes.indexOf('hamd');

    /* ===== GH — «غابت… ثم عادت» ===== */
    const vis = b.stepTypes.indexOf('visualize'), ret = b.stepTypes.indexOf('return');
    carousel(`GH-${nn}`, `غابت… ثم عادت: ${b.title}`, 'كاروسيل صغير', [
      (c, i, n) => slide(c, i, n,
        chip(c, 'تخيّل…', { size: 34, cls: 'ghost' }) + medal(c, ic, { size: c.pick({ story: 360, square: 190 }, 270), state: 'gone' }) +
        quote(c, b.steps[vis], c.pick({ story: 86, square: 64 }, 76), { w: 920 }),
        { bgo: deep, sw: false, foot: kick(c, `اسحب… ثم عُد ${'<span style="font-family:var(--sans)">←</span>'}`, 34, { extra: 'color:var(--accent)' }) }),
      (c, i, n) => slide(c, i, n,
        medal(c, ic, { size: c.pick({ story: 340, square: 170 }, 240) }) +
        quote(c, b.steps[ret].replace(/(حيَّ على الصلاة)/, (m) => acc(m)), c.pick({ story: 80, square: 58 }, 68), { w: 920 }) +
        display(c, gold('الحمدُ لله'), c.pick({ story: 130, square: 90 }, 110)),
        { bgo: { cone: 0.1, coneAt: '50% 26%', warm: 0.1, warmAt: '50% 40%' }, under: lit(c), foot: sig(c, { size: sigSize(c) * 0.9 }), g: c.pick({ story: 34, square: 14 }, 22) }),
    ], { alt: `كاروسيل من شريحتين: تخيّل غياب ${b.short}، ثم العودة إليها والحمد.` });

    /* ===== HS — «من الشاشة الرئيسية» ===== */
    const hs = [S.cover(b), S.verse(b)];
    if (b.hadith) hs.push(S.hadith(b));
    hs.push(S.tadabbur(b));
    if (b.quote) hs.push(S.quote(b));
    hs.push(S.app(b));
    carousel(`HS-${nn}`, `من الشاشة الرئيسية: ${b.title}`, 'كاروسيل الشاشة الرئيسية', hs, { review: true, alt: `${b.title} كما تظهر في تطبيق الحمد: الآية، الحديث، التدبّر، وقول العالم.` });

    /* ===== JR — «الرحلة كاملة» (≤ 10 slides) ===== */
    const jr = [S.cover(b), S.verse(b)];
    if (b.hadith) jr.push(S.hadith(b));
    jr.push(S.tadabbur(b));
    if (b.quote) jr.push(S.quote(b));
    b.stepTypes.forEach((type, k) => {
      if (type === 'ground') return; // folded into the first absence slide
      if (type === 'hamd') jr.push(S.hamd(b, k));
      else jr.push(S.step(b, k, { withGround: type === 'visualize' }));
    });
    jr.push(S.journal(b));
    carousel(`JR-${nn}`, `الرحلة كاملة: ${b.title}`, 'كاروسيل الرحلة كاملة', jr.slice(0, 10), { review: true, alt: `${b.title} كما يعيشها المستخدم في تطبيق الحمد، من البطاقة إلى سجلّ الحمد.` });

    /* ===== SQ — story question ===== */
    def(`SQ-${nn}`, {
      name: `ستوري سؤال: ${b.title}`, group: 'SQ', family: 'ستوري تفاعلية', pillar: 'باقة النعمة', formats: ['story'],
      alt: `سؤال للتأمّل من «${b.title}»: ${b.prompt.replace(/^اكتب:\s*/, '')}`,
      build: (c) => page(c, {
        bg: { tone: 'ground', cone: 0.07, coneAt: '50% 26%' },
        top: chip(c, 'سؤال الليلة', { size: 36 }),
        mid: medal(c, ic, { size: 230 }) + title(c, b.prompt.replace(/^اكتب:\s*/, '').replace(/…\s*/, `…<br>${''}`), 92) + kick(c, `من «${b.title}»`, 32),
        foot: `<div class="sticker" style="width:${c.px(820)}px;height:${c.px(300)}px;font-size:${c.px(32)}px">ضع ملصق «سؤال» هنا… ليكتب الناس إجاباتهم</div>` + gap(c, 36) + wm(c, 56),
        gap: 36,
      }),
    });

    /* ===== AY — verse card ===== */
    def(`AY-${nn}`, {
      name: `آية النعمة: ${b.verse.surahName} ${b.verse.ayah}`, group: 'AY', family: 'بطاقة آية', pillar: 'باقة النعمة', formats: ['portrait', 'story', 'square'], review: true,
      alt: `﴿${b.verse.text}﴾ ${ref(b.verse)}`,
      build: (c) => page(c, {
        bg: { cone: 0.08, coneAt: '50% 30%', warm: 0.07, warmAt: '50% 48%' },
        top: chip(c, b.title, { size: 32 }),
        mid: glyph(c, ic, { size: c.pick({ story: 150, square: 90 }, 120) }) + verseT(c, `${orn('﴿')}${b.verse.text}${orn('﴾')}`, c.pick({ story: 92, square: 70 }, 80), { w: 940 }) +
          `<div class="slot" style="gap:${c.px(14)}px">${K.C.thread(c, { w: 150 })}${kick(c, ref(b.verse), 32)}</div>`,
        foot: sig(c, { size: sigSize(c) }), gap: c.pick({ story: 54, square: 26 }, 38),
      }),
    });

    /* ===== PC — podcast episode cover ===== */
    def(`PC-${nn}`, {
      name: `غلاف حلقة البودكاست: ${b.title}`, group: 'PC', family: 'بودكاست', pillar: 'باقة النعمة', formats: ['square'], themes: ['layl', 'nahar'],
      alt: `وقفات في أثر النعمة — حلقة ${b.title}، من تطبيق الحمد`,
      build: (c) => page(c, {
        bg: { cone: 0.1, coneAt: '50% 40%', warm: 0.08, warmAt: '50% 44%' }, under: lit(c),
        top: chip(c, 'بودكاست', { size: 30 }),
        mid: title(c, 'وقفات في أثر النعمة', 64, { extra: 'color:var(--muted)' }) + medal(c, ic, { size: 280 }) + display(c, b.title, 120),
        foot: wm(c, 60), gap: 18,
      }),
    });

    /* ===== JM — «رحلتي»: the stage that holds this blessing ===== */
    const st = b.stage;
    if (st && !K.REG[`JM-${st.id}-1`]) {
      const sts = st.stations.map((x, k) => ({ ...x, k, b: BY_ID[x.id] }));
      const path = (c, size, at = -1) => `<div style="display:flex;flex-direction:row-reverse;align-items:center;justify-content:center;gap:0;max-width:${c.px(980)}px">` +
        sts.map((x, k) => (k ? `<div style="width:${c.px(size * 0.22)}px;height:3px;background:var(--line);opacity:${at >= 0 && k > at ? 0.35 : 0.9}"></div>` : '') +
          `<div style="opacity:${at >= 0 && k > at ? 0.4 : 1}">${medal(c, ICON[x.id], { size: k === at ? size * 1.25 : size })}</div>`).join('') + '</div>';
      const slides = [
        (c, i, n) => slide(c, i, n,
          chip(c, 'رحلتي', { size: 32 }) + kick(c, st.focus, 32) + title(c, st.title, c.pick({ story: 124, square: 88 }, 106)) +
          body(c, st.intention, c.pick({ story: 50, square: 38 }, 44), { w: 860 }) + gap(c, 14) + path(c, c.pick({ story: 104, square: 70 }, 86)) +
          kick(c, `سبعُ محطّات… محطّةٌ كلَّ يوم`, 30, { extra: 'color:var(--accent)' }),
          { bgo: { cone: 0.08, coneAt: '50% 30%', warm: 0.06 } }),
        ...sts.map((x) => (c, i, n) => slide(c, i, n,
          kick(c, `المحطّة ${AR(x.k + 1)} من ${AR(sts.length)}`, 32, { extra: 'color:var(--accent)' }) +
          medal(c, ICON[x.id], { size: c.pick({ story: 320, square: 160 }, 230) }) +
          title(c, x.b.title, c.pick({ story: 116, square: 84 }, 100)) + body(c, x.b.opening, c.pick({ story: 46, square: 36 }, 40), { w: 860 }) +
          `<div class="card" style="width:100%;max-width:${c.px(900)}px;border-radius:${c.px(36)}px;padding:${c.px(30)}px ${c.px(40)}px;display:flex;flex-direction:column;gap:${c.px(8)}px;align-items:center">` +
          label(c, 'عملُ اليوم', 30) + quote(c, x.action, c.pick({ story: 54, square: 42 }, 48), { w: 840 }) + '</div>',
          { bgo: { cone: 0.07, warm: x.id === b.id ? 0.1 : 0.03, warmAt: '50% 40%' } })),
        (c, i, n) => slide(c, i, n,
          path(c, c.pick({ story: 104, square: 70 }, 86)) + gap(c, 10) +
          title(c, `امضِ في رحلتك…<br>${acc('بالسرعة التي تناسبك.')}`, c.pick({ story: 104, square: 76 }, 92)) +
          body(c, '«رحلتي» في تطبيق «الحمد»: أربعةُ منازل، ومحطّةٌ كلَّ يوم… مجّانًا.', c.pick({ square: 36 }, 42), { w: 860 }) +
          cta(c, 'ابدأ رحلتك', { size: 40 }) + kick(c, ltr('alhamd.app'), 30),
          { bgo: { cone: 0.08, warm: 0.07, warmAt: '50% 50%' } }),
      ];
      carousel(`JM-${st.id}`, `رحلتي: ${st.title}`, 'كاروسيل رحلتي', slides, { alt: `${st.title} من «رحلتي» في تطبيق الحمد: سبع محطات، لكلٍّ منها عملٌ لليوم.` });
    }

    /* ===== reels ===== */
    const anim = animFor(b.n); // the animated reel is drawn for each blessing; a package without one skips it
    if (anim) def(`AN-${nn}`, { kind: 'reel', name: `ريل أنيميشن: ${b.title}`, group: 'AN', family: 'ريل أنيميشن', pillar: 'باقة النعمة', formats: ['story'], alt: `ريل متحرّك بلا تعليق صوتي: ${b.opening}`, scenes: (c) => anim(c, b) });
    def(`VW-${nn}`, { kind: 'reel', name: `الوقفات الخمس (بلا صوت): ${b.title}`, group: 'VW', family: 'ريل الوقفات', pillar: 'باقة النعمة', formats: ['story'], alt: `الوقفات الخمس من «${b.title}» في تطبيق الحمد.`, scenes: (c) => waqfaScenes(c, b, null) });
    const vt = VOICE[String(b.n)] && VOICE[String(b.n)].waqfa;
    if (vt) def(`VV-${nn}`, { kind: 'reel', name: `وقفة صوتية (فيديو): ${b.title}`, group: 'VV', family: 'وقفة صوتية', pillar: 'باقة النعمة', formats: ['story'], fps: b.n in CUSTOM_FPS ? 30 : 15, audio: vt.audio, poster: vt.steps[1].start + 6, alt: `الوقفات الخمس من «${b.title}» بصوتٍ هادئ، على توقيت التطبيق.`, scenes: (c) => waqfaScenes(c, b, vt) });
  });

  /* ================= reels ================= */
  const M = K.M;
  const { $, $$, P, clamp, out3, inOut, mv, enter, pop, reveal, readTime, draw, drift, breathe } = M;

  function endScene(c, { line = 'نعمةٌ كلَّ يوم', sub = 'دقيقتان من التأمّل… في تطبيق «الحمد»', len = 2.8 } = {}) {
    return {
      len,
      html: page(c, { bg: { cone: 0.1, coneAt: '50% 40%', warm: 0.06, warmAt: '50% 44%' }, mid: `<div class="e-wm">${wm(c, 210)}</div>` + gap(c, 18) + `<div class="e-l">${title(c, line, 88)}</div><div class="e-s">${body(c, sub, 40)}</div><div class="e-u">${kick(c, ltr('alhamd.app'), 36)}</div>`, gap: 24 }),
      anim(t, L) { enter($(L, '.e-wm'), t, 0.1, 0.7, 24); enter($(L, '.e-l'), t, 0.55); enter($(L, '.e-s'), t, 0.85); enter($(L, '.e-u'), t, 1.2); },
      sfx: [[0.15, 'pop', -30]],
    };
  }
  /** Words appear when the voice says them (times in seconds from the line's start). */
  function revealAt(el, t, start, times) {
    const ws = M.words(el);
    // the voice times words only; a lone dash or mark keeps the time of the word before it
    const real = ws.filter((w) => /[ء-ي]/.test(w.textContent));
    if (!times || times.length !== real.length) return reveal(el, t, start, { stagger: 0.2 });
    const at = new Map(real.map((w, i) => [w, times[i]]));
    let last = 0;
    ws.forEach((w) => { if (at.has(w)) last = at.get(w); const p = out3(P(t, start + last - 0.05, 0.45)); w.style.opacity = String(p); w.style.transform = `translateY(${((1 - p) * 16).toFixed(2)}px)`; });
    return start + times[times.length - 1] + 0.45;
  }
  const progress = (c, w = 640) => `<div class="prog" style="width:${c.px(w)}px"><i></i><b></b></div>`;
  function setProg(L, p) { const pr = $(L, '.prog'); if (!pr) return; pr.querySelector('i').style.width = `${(p * 100).toFixed(2)}%`; pr.querySelector('b').style.right = `${(p * 100).toFixed(2)}%`; }

  /** The five pauses. With timing (from tools/voice.py) the scenes follow the voice; without, reading pace. */
  function waqfaScenes(c, b, vt) {
    const ic = ICON[b.id];
    const n = b.steps.length;
    const STEP_FX = { ground: [[0.2, 'breath', -27, { dur: 1.6 }]], visualize: [[0.1, 'wind', -28, { dur: 5 }]], deepen: [[0.5, 'heartbeat', -27]], return: [[0.1, 'birds', -31, { dur: 2.4 }], [0.3, 'glint', -30]], hamd: [[0.2, 'glint', -30]] };
    const scenes = [{
      len: vt ? vt.intro.start + vt.intro.len : 3.6,
      html: page(c, { bg: { cone: 0.08, coneAt: '50% 28%', warm: 0.06, warmAt: '50% 40%' }, top: chip(c, 'استشعر النعمة', { size: 34 }), mid: `<div class="m0">${medal(c, ic, { size: 380 })}</div>` + `<div class="t0">${title(c, b.title, 128)}</div><div class="s0">${body(c, 'خمسُ وقفات… على مهل', 46)}</div>`, gap: 30 }),
      anim(t, L) { enter($(L, '.chip'), t, 0.05, 0.5, 14); draw($(L, '.m0 svg'), P(t, 0.1, 1.8)); enter($(L, '.t0'), t, 0.5); enter($(L, '.s0'), t, 0.9); breathe($(L, '.safe'), t, 6, 0.02); },
      sfx: [[0.1, 'breath', -28, { dur: 1.4 }]],
    }];
    b.stepTypes.forEach((type, k) => {
      const seg = vt && vt.steps[k];
      const absent = ABSENT(type), hamd = type === 'hamd';
      const text = b.steps[k];
      const len = seg ? seg.len : Math.max(4.2, readTime(text, 1.4, 2.4) + 1.2);
      const html = hamd ? text.replace(/الحمد لله/, (m) => acc(m)) : type === 'return' ? text.replace(/(حيَّ على الصلاة)/, (m) => acc(m)) : text;
      scenes.push({
        len,
        html: page(c, {
          bg: absent ? deep : { cone: 0.08, coneAt: '50% 28%', warm: hamd || type === 'return' ? 0.1 : 0.03, warmAt: '50% 40%' },
          under: type === 'return' || hamd ? `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>` : '',
          top: chip(c, STEP_LABEL[type], { size: 34, cls: hamd ? 'solid' : absent ? 'ghost' : '' }),
          mid: `<div class="mk">${medal(c, ic, { size: 300, state: absent ? 'gone' : 'lit' })}</div>` + gap(c, 10) + `<div class="qk">${quote(c, html, 80, { w: 920 })}</div>`,
          foot: `<div class="pk" style="display:flex;flex-direction:column;align-items:center;gap:${c.px(22)}px">${kick(c, `${AR(k + 1)} / ${AR(n)}`, 30)}${progress(c)}</div>`,
          gap: 34,
        }),
        anim(t, L) {
          enter($(L, '.chip'), t, 0.05, 0.6, 14);
          const m = $(L, '.mk');
          if (absent) mv(m, { o: 0.7 * out3(P(t, 0.1, 1.2)), s: 1 - 0.04 * P(t, 0, len) });
          else { mv(m, { o: 1, s: 0.95 + 0.05 * out3(P(t, 0, 1.4)) }); if (type === 'return') draw($(L, '.mk svg'), P(t, 0.1, 1.8)); }
          const q = $(L, '.qk .t-quote');
          if (seg) revealAt(q, t, 0, seg.words.map((w) => w[0]));
          else reveal(q, t, 0.5, { stagger: Math.min(0.24, (len - 2.4) / Math.max(1, M.wordCount(text))) });
          setProg(L, (k + out3(P(t, 0.2, Math.min(len - 0.5, 4)))) / n);
          drift($(L, '.parts svg'), t, { fade: [0.3, 1.0] });
          breathe($(L, '.safe'), t, len, 0.018);
        },
        sfx: STEP_FX[type] || [],
      });
    });
    scenes.push(endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»`, len: vt ? vt.end.len : 2.8 }));
    return scenes;
  }

  /* ---------- line art for the animated reel ---------- */
  const TIMES = [['الفجر', 14], ['الظهر', 86], ['العصر', 128], ['المغرب', 172], ['العشاء', 196]];
  /** The sun's path over a horizon with the five prayer times on it (RTL: the day starts on the right). */
  function arcArt(c) {
    const W = 1000, H = 600, cx = 500, cy = 470, R = 390;
    const pt = (deg) => [cx + R * Math.cos((deg * Math.PI) / 180), cy - R * Math.sin((deg * Math.PI) / 180)];
    const dots = TIMES.map(([name, deg], k) => {
      const [x, y] = pt(deg);
      const ly = deg > 180 ? y + 58 : y - 34, lx = deg < 30 ? x - 10 : deg > 160 ? x + 10 : x;
      return `<g class="pt pt${k}"><circle cx="${x}" cy="${y}" r="13" fill="var(--bg)" stroke="currentColor" stroke-width="3"/><circle class="core" cx="${x}" cy="${y}" r="7" fill="currentColor" opacity="0"/>` +
        `<text x="${lx}" y="${ly}" text-anchor="middle" font-family="IBM Plex Sans Arabic" font-weight="600" font-size="38" fill="currentColor" opacity="0.9">${name}</text></g>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" style="overflow:visible;color:var(--accent)" fill="none">` +
      `<path class="hz" pathLength="1" d="M40 ${cy} L960 ${cy}" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity="0.6"/>` +
      `<path class="arc" pathLength="1" d="M${cx + R} ${cy} A${R} ${R} 0 1 0 ${pt(200)[0]} ${pt(200)[1]}" stroke="currentColor" stroke-width="2" stroke-dasharray="0.006 0.012" opacity="0.75"/>` +
      `${dots}<g class="sun"><circle r="34" fill="currentColor" opacity="0.18"/><circle r="17" fill="currentColor"/></g></svg>`;
  }
  /** An arched door with two leaves; light behind it. */
  let doorN = 0;
  function doorArt(c) {
    const W = 600, H = 820, uid = `d${++doorN}`;
    const arch = (x0, x1, top, y0) => { const m = (x0 + x1) / 2; return `M${x0} ${H - 40} L${x0} ${y0} C${x0} ${top + 70} ${m - 40} ${top + 20} ${m} ${top} C${m + 40} ${top + 20} ${x1} ${top + 70} ${x1} ${y0} L${x1} ${H - 40}`; };
    const lightC = c.th === 'nahar' ? '#E9A866' : '#F0D48A';
    const leaf = (side) => {
      const x0 = side === 'r' ? 300 : 120, x1 = side === 'r' ? 480 : 300;
      const ox = side === 'r' ? 480 : 120;
      const curve = side === 'r' ? `M300 ${H - 40} L300 150 C345 168 480 205 480 340 L480 ${H - 40} Z` : `M300 ${H - 40} L300 150 C255 168 120 205 120 340 L120 ${H - 40} Z`;
      const inset = side === 'r' ? 'M325 760 L325 360 L455 360 L455 760 Z M325 330 C360 300 430 285 455 300' : 'M275 760 L275 360 L145 360 L145 760 Z M275 330 C240 300 170 285 145 300';
      const star = side === 'r' ? [390, 560] : [210, 560];
      return `<g class="leaf leaf-${side}" style="transform-box:view-box;transform-origin:${ox}px 50%">` +
        `<path d="${curve}" fill="var(--bg)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="${inset}" stroke="currentColor" stroke-width="1.8" opacity="0.7"/>` +
        `<g transform="translate(${star[0]} ${star[1]})" stroke="currentColor" stroke-width="1.8" opacity="0.8"><rect x="-34" y="-34" width="68" height="68"/><rect x="-34" y="-34" width="68" height="68" transform="rotate(45)"/></g>` +
        `<circle cx="${side === 'r' ? 314 : 286}" cy="470" r="6" fill="currentColor"/></g>`;
    };
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" style="overflow:visible;color:var(--accent)" fill="none">` +
      `<defs><radialGradient id="${uid}l" cx="50%" cy="62%" r="60%"><stop offset="0" stop-color="${lightC}" stop-opacity="0.95"/><stop offset="0.55" stop-color="${lightC}" stop-opacity="0.35"/><stop offset="1" stop-color="${lightC}" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="${uid}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lightC}" stop-opacity="0.45"/><stop offset="1" stop-color="${lightC}" stop-opacity="0"/></linearGradient></defs>` +
      `<path class="floor" d="M120 ${H - 40} L480 ${H - 40} L600 ${H + 120} L0 ${H + 120} Z" fill="url(#${uid}f)" opacity="0"/>` +
      `<path class="glow" d="${arch(120, 480, 150, 340)} Z" fill="url(#${uid}l)" opacity="0"/>` +
      leaf('l') + leaf('r') +
      `<path class="frame" pathLength="1" d="${arch(92, 508, 112, 330)}" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>` +
      `<path class="frame" pathLength="1" d="${arch(120, 480, 150, 340)}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity="0.8"/>` +
      `<path class="frame" pathLength="1" d="M40 ${H - 40} L560 ${H - 40}" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/></svg>`;
  }
  /** door state: open 0..1 (leaf folded → shut), light 0..1 */
  function setDoor(L, open, light) {
    const sc = (1 - open) * 0.94 + 0.06;
    $$(L, '.leaf').forEach((g) => { g.style.transform = `scaleX(${(1 - open * 0.94).toFixed(4)})`; });
    $$(L, '.glow').forEach((g) => g.setAttribute('opacity', (light * 0.95).toFixed(3)));
    $$(L, '.floor').forEach((g) => g.setAttribute('opacity', (light * 0.8).toFixed(3)));
    return sc;
  }
  const splitLine = (s) => { const i = s.indexOf('…'); return i > 0 ? [s.slice(0, i + 1), s.slice(i + 1).trim()] : [s, '']; };

  /** «نعمة الصلاة»: the day's five appointments on the sun's path, then a door that shuts… and opens. */
  function animSalah(c, b) {
    const [o1, o2] = splitLine(b.opening);
    const [v1, v2] = splitLine(b.steps[b.stepTypes.indexOf('visualize')]);
    const deepen = b.steps[b.stepTypes.indexOf('deepen')];
    const ret = b.steps[b.stepTypes.indexOf('return')];
    const glowF = c.th === 'layl' ? 'filter:drop-shadow(0 0 18px rgba(228,195,104,0.45));' : '';
    const artBox = (cls, inner, w, h) => `<div class="${cls}" data-w="${c.px(w)}" data-h="${c.px(h)}" style="width:${c.px(w)}px;height:${c.px(h)}px;flex:0 0 auto;position:relative;${glowF}">${inner}</div>`;
    return [
      { // 1 — five appointments a day
        len: 6.4,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 40%', warm: 0.05, warmAt: '50% 48%' }, mid: `<div class="tx1">${title(c, o1, 104)}</div>` + gap(c, 20) + artBox('arcw', arcArt(c), 860, 516) + gap(c, 10) + `<div class="tx2">${title(c, acc(o2), 84)}</div>`, gap: 24 }),
        anim(t, L) {
          reveal($(L, '.tx1 .t-title'), t, 0.25, { stagger: 0.16 });
          const svg = $(L, '.arcw svg');
          draw(svg, P(t, 0.0, 1.3), 0.2);
          const sun = $(L, '.sun');
          const p = inOut(P(t, 1.1, 3.6)), deg = 14 + (196 - 14) * p;
          const R = 390, x = 500 + R * Math.cos((deg * Math.PI) / 180), y = 470 - R * Math.sin((deg * Math.PI) / 180);
          sun.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          sun.style.opacity = String(P(t, 0.9, 0.4) * (deg > 180 ? 1 - (deg - 180) / 30 : 1));
          TIMES.forEach(([, d], k) => { const on = deg >= d - 0.5 ? 1 : 0; const pp = $(L, `.pt${k} .core`); pp.setAttribute('opacity', String(on)); $(L, `.pt${k}`).style.opacity = String(0.45 + 0.55 * on); });
          reveal($(L, '.tx2 .t-title'), t, 4.0, { stagger: 0.18 });
        },
        sfx: TIMES.map(([, d], k) => [1.1 + 3.6 * ((d - 14) / 182) ** 0.85, 'glint', -30, { seed: 33 + k }]).concat([[0.2, 'breath', -30, { dur: 1.3 }]]),
      },
      { // 2 — imagine the door shut
        len: 6.6,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 40%' }, under: `<div class="dark" style="position:absolute;inset:0;background:#000;opacity:0"></div>`, mid: `<div class="tx1">${title(c, v1, 92)}</div>` + artBox('dw', doorArt(c), 470, 640) + `<div class="tx2">${quote(c, v2, 60, { w: 900 })}</div>`, gap: 30 }),
        anim(t, L) {
          const shut = inOut(P(t, 2.4, 1.6));
          setDoor(L, 1 - shut, 1 - shut);
          draw($(L, '.dw svg'), P(t, 0, 1.0), 0.1);
          reveal($(L, '.tx1 .t-title'), t, 0.3, { stagger: 0.17 });
          reveal($(L, '.tx2 .t-quote'), t, 4.1, { stagger: 0.16 });
          $(L, '.dark').style.opacity = String(0.55 * P(t, 2.6, 1.8));
          const dw = $(L, '.dw'); dw.style.opacity = String(1 - 0.45 * P(t, 3.4, 1.4));
        },
        sfx: [[2.4, 'whoosh', -27, { dur: 1.5, from: 1600, to: 300 }], [3.95, 'step', -20, { seed: 22 }], [4.1, 'wind', -31, { dur: 2.5 }]],
      },
      { // 3 — the absence
        len: 5.6,
        html: page(c, { bg: deep, mid: artBox('dw', doorArt(c), 300, 410) + `<div class="tx">${quote(c, deepen, 70, { w: 920 })}</div>`, gap: 40 }),
        anim(t, L) { setDoor(L, 0, 0); const dw = $(L, '.dw'); dw.style.opacity = '0.5'; dw.style.filter = 'none'; $(L, '.dw svg').style.color = c.th === 'layl' ? '#5A5A84' : '#B7A592'; reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.22 }); breathe($(L, '.safe'), t, 5.6, 0.02); },
        sfx: [[0.4, 'heartbeat', -26], [2.4, 'heartbeat', -28]],
      },
      { // 4 — then come back: the door opens
        len: 7.2,
        html: page(c, { bg: { cone: 0.1, coneAt: '50% 40%', warm: 0.12, warmAt: '50% 46%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: artBox('dw', doorArt(c), 470, 640) + `<div class="tx">${quote(c, ret.replace(/(حيَّ على الصلاة)/, (m) => `<br><span class="gold" style="font-weight:700">${m}</span>`), 66, { w: 920 })}</div>`, gap: 30 }),
        anim(t, L) {
          const o = inOut(P(t, 0.3, 1.8));
          setDoor(L, o, o);
          const dw = $(L, '.dw'); mv(dw, { o: 1, s: 0.96 + 0.04 * out3(P(t, 0, 2)) });
          reveal($(L, '.tx .t-quote'), t, 1.6, { stagger: 0.2 });
          drift($(L, '.parts svg'), t, { fade: [0.8, 1.4] });
        },
        sfx: [[0.3, 'whoosh', -30, { dur: 1.8, from: 400, to: 2200 }], [1.0, 'birds', -30, { dur: 2.6 }], [1.4, 'glint', -29]],
      },
      { // 5 — name it, and praise
        len: 4.2,
        html: page(c, { bg: { cone: 0.09, coneAt: '50% 30%', warm: 0.1, warmAt: '50% 50%' }, top: chip(c, b.title, { size: 34 }), mid: `<div class="m5">${medal(c, ICON[b.id], { size: 360 })}</div>` + gap(c, 10) + `<div class="g5">${display(c, gold('الحمدُ لله'), 150)}</div>`, gap: 26 }),
        anim(t, L) { enter($(L, '.chip'), t, 0.05, 0.5, 14); draw($(L, '.m5 svg'), P(t, 0.1, 1.6)); pop($(L, '.g5'), t, 1.4, 0.8, 0.85); breathe($(L, '.safe'), t, 4.2, 0.02); },
        sfx: [[0.2, 'drop', -24], [1.4, 'breath', -27, { dur: 1.3 }]],
      },
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }

  /* ---------- «نعمة البصر»: an eye that closes… and opens ---------- */
  let eyeN = 0;
  /** An eye in one line; setEye() moves the lids (0 shut … 1 open) and the light around it. */
  function eyeArt(c) {
    const uid = `e${++eyeN}`;
    const lightC = c.th === 'nahar' ? '#E9A866' : '#F0D48A';
    const pupil = c.th === 'nahar' ? '#2A1F19' : 'var(--bg)', glint = c.th === 'nahar' ? '#F4EDE3' : 'currentColor';
    const rays = Array.from({ length: 14 }, (_, k) => { const a = (k / 14) * Math.PI * 2, r0 = 232, r1 = 282; return `<path d="M${(300 + r0 * Math.cos(a)).toFixed(1)} ${(200 + r0 * 0.78 * Math.sin(a)).toFixed(1)} L${(300 + r1 * Math.cos(a)).toFixed(1)} ${(200 + r1 * 0.78 * Math.sin(a)).toFixed(1)}"/>`; }).join('');
    const lashes = [-150, -90, -30, 30, 90, 150].map((dx) => `<path class="lash" data-dx="${dx}" d=""/>`).join('');
    return `<svg viewBox="0 0 600 400" width="100%" height="100%" style="overflow:visible;color:var(--accent)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" data-uid="${uid}">` +
      `<defs><radialGradient id="${uid}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${lightC}" stop-opacity="0.75"/><stop offset="1" stop-color="${lightC}" stop-opacity="0"/></radialGradient>` +
      `<clipPath id="${uid}c"><path class="clip" d=""/></clipPath></defs>` +
      `<ellipse class="eglow" cx="300" cy="200" rx="300" ry="230" fill="url(#${uid}g)" stroke="none" opacity="0"/>` +
      `<g class="rays" stroke-width="3" opacity="0">${rays}</g>` +
      `<g clip-path="url(#${uid}c)"><circle cx="300" cy="200" r="92" fill="currentColor" opacity="0.16" stroke="none"/><circle class="iris" pathLength="1" cx="300" cy="200" r="92" stroke-width="3.4"/><circle cx="300" cy="200" r="64" stroke-width="1.6" opacity="0.55"/>` +
      `<circle cx="300" cy="200" r="40" fill="${pupil}" stroke="currentColor" stroke-width="2.4"/><circle cx="318" cy="182" r="11" fill="${glint}" stroke="none"/></g>` +
      `<path class="lid-u" pathLength="1" stroke-width="4" d=""/><path class="lid-l" pathLength="1" stroke-width="3" d=""/><g class="lashes" stroke-width="3">${lashes}</g></svg>`;
  }
  function setEye(L, open, light = 0) {
    const u = 210 - 175 * open, l = 230 + 120 * open; // control points; shut, both lids meet in one soft curve
    $$(L, 'svg[data-uid]').forEach((svg) => {
      svg.querySelector('.lid-u').setAttribute('d', `M60 200 Q300 ${u.toFixed(1)} 540 200`);
      svg.querySelector('.lid-l').setAttribute('d', `M60 200 Q300 ${l.toFixed(1)} 540 200`);
      svg.querySelector('.clip').setAttribute('d', `M60 200 Q300 ${u.toFixed(1)} 540 200 Q300 ${l.toFixed(1)} 60 200 Z`);
      svg.querySelectorAll('.lash').forEach((p) => { // lashes hang from the lid when it is down
        const dx = +p.dataset.dx, x = 300 + dx, tq = (x - 60) / 480, y = (1 - tq) * (1 - tq) * 200 + 2 * (1 - tq) * tq * u + tq * tq * 200;
        p.setAttribute('d', `M${x} ${y.toFixed(1)} L${(x + dx * 0.08).toFixed(1)} ${(y + 26).toFixed(1)}`);
        p.style.opacity = String(Math.max(0, 1 - open * 2.2));
      });
      svg.querySelector('.eglow').setAttribute('opacity', (light * 0.9).toFixed(3));
      svg.querySelector('.rays').setAttribute('opacity', (light * 0.8).toFixed(3));
    });
  }
  /** «نعمة البصر»: two small windows; close your eyes, really; the dark that does not lift; open them. */
  function animBasar(c, b) {
    const [o1, o2] = splitLine(b.opening);
    const [v1, v2] = splitLine(b.steps[b.stepTypes.indexOf('visualize')]);
    const deepen = b.steps[b.stepTypes.indexOf('deepen')];
    const [r1, r2] = splitLine(b.steps[b.stepTypes.indexOf('return')]);
    const glowF = c.th === 'layl' ? 'filter:drop-shadow(0 0 16px rgba(228,195,104,0.4));' : '';
    const eye = (w = 760) => `<div class="ew" data-w="${c.px(w)}" data-h="${c.px(w * 2 / 3)}" style="width:${c.px(w)}px;height:${c.px(w * 2 / 3)}px;flex:0 0 auto;${glowF}">${eyeArt(c)}</div>`;
    const dark = '<div class="dark" style="position:absolute;inset:0;background:#000;opacity:0"></div>';
    return [
      { // 1 — two small windows
        len: 6.6,
        html: page(c, { bg: { cone: 0.08, coneAt: '50% 44%', warm: 0.06, warmAt: '50% 46%' }, mid: `<div class="tx1">${title(c, o1, 110)}</div>` + eye() + `<div class="tx2">${quote(c, acc(o2), 62, { w: 900 })}</div>`, gap: 40 }),
        anim(t, L) { draw($(L, '.ew svg'), P(t, 0, 1.2), 0.15); setEye(L, inOut(P(t, 0.9, 1.4)), 0.35 * P(t, 1.4, 1.2)); reveal($(L, '.tx1 .t-title'), t, 0.3, { stagger: 0.2 }); reveal($(L, '.tx2 .t-quote'), t, 2.6, { stagger: 0.17 }); breathe($(L, '.safe'), t, 6.6, 0.02); },
        sfx: [[0.9, 'breath', -29, { dur: 1.3 }], [2.2, 'glint', -30]],
      },
      { // 2 — close your eyes, really
        len: 6.6,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 44%' }, under: dark, mid: `<div class="tx1">${title(c, v1, 104)}</div>` + eye() + `<div class="tx2">${quote(c, v2, 68, { w: 900 })}</div>`, gap: 40 }),
        anim(t, L) {
          const shut = inOut(P(t, 2.0, 1.2));
          setEye(L, 1 - shut, 0.35 * (1 - shut));
          $(L, '.dark').style.opacity = String(0.88 * P(t, 2.2, 1.4));
          reveal($(L, '.tx1 .t-title'), t, 0.3, { stagger: 0.2 });
          reveal($(L, '.tx2 .t-quote'), t, 3.6, { stagger: 0.18 });
          $(L, '.ew').style.opacity = String(1 - 0.6 * P(t, 2.6, 1.2));
        },
        sfx: [[2.0, 'whoosh', -29, { dur: 1.2, from: 1400, to: 300 }], [3.3, 'wind', -31, { dur: 3.0 }]],
      },
      { // 3 — the dark that does not lift
        len: 6.0,
        html: page(c, { bg: { tone: 'black', pat: 0, cone: 0, vignette: false }, mid: `<div class="ew0" style="opacity:0.28">${eye(520)}</div><div class="tx">${quote(c, deepen, 74, { w: 920 })}</div>`, gap: 50 }),
        anim(t, L) { setEye(L, 0, 0); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.22 }); breathe($(L, '.safe'), t, 6.0, 0.02); },
        sfx: [[0.4, 'heartbeat', -26], [2.6, 'heartbeat', -28]],
      },
      { // 4 — now open your eyes
        len: 7.6,
        html: page(c, { bg: { cone: 0.14, coneAt: '50% 44%', warm: 0.14, warmAt: '50% 44%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: `<div class="tx1">${title(c, gold(r1), 112)}</div>` + eye() + `<div class="tx2">${quote(c, r2, 64, { w: 920 })}</div>`, gap: 40 }),
        anim(t, L) {
          const o = inOut(P(t, 0.5, 1.2));
          setEye(L, o, o);
          L.style.filter = `brightness(${(1 + 0.6 * P(t, 0.8, 0.4) * (1 - P(t, 1.2, 1.4))).toFixed(3)})`;
          pop($(L, '.tx1'), t, 0.1, 0.7, 0.9);
          reveal($(L, '.tx2 .t-quote'), t, 2.0, { stagger: 0.17 });
          drift($(L, '.parts svg'), t, { fade: [0.8, 1.2] });
        },
        sfx: [[0.5, 'breath', -26, { dur: 1.2 }], [0.9, 'glint', -28], [1.2, 'birds', -30, { dur: 2.6 }]],
      },
      { // 5 — name it, and praise
        len: 4.2,
        html: page(c, { bg: { cone: 0.09, coneAt: '50% 30%', warm: 0.1, warmAt: '50% 50%' }, top: chip(c, b.title, { size: 34 }), mid: `<div class="m5">${medal(c, ICON[b.id], { size: 360 })}</div>` + gap(c, 10) + `<div class="g5">${display(c, gold('الحمدُ لله'), 150)}</div>`, gap: 26 }),
        anim(t, L) { enter($(L, '.chip'), t, 0.05, 0.5, 14); draw($(L, '.m5 svg'), P(t, 0.1, 1.6)); pop($(L, '.g5'), t, 1.4, 0.8, 0.85); breathe($(L, '.safe'), t, 4.2, 0.02); },
        sfx: [[0.2, 'drop', -24], [1.4, 'breath', -27, { dur: 1.3 }]],
      },
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }


  /* ---------- shared: one drawing in two states (lit / gone), cross-faded ---------- */
  const sized = (svg) => svg.replace('<svg ', '<svg width="100%" height="100%" style="display:block;overflow:visible" ');
  function stack(c, cls, w, ratio, lit, gone) {
    const W = c.px(w), H = W * ratio;
    return `<div class="${cls}" data-w="${W}" data-h="${H}" style="position:relative;width:${W}px;height:${H}px;flex:0 0 auto">` +
      `<div class="st-gone" style="position:absolute;inset:0">${sized(K.C.withTheme(c, gone))}</div>` +
      `<div class="st-lit glow" style="position:absolute;inset:0">${sized(K.C.withTheme(c, lit))}</div></div>`;
  }
  /** 1 = the blessing is there, 0 = gone */
  function setStack(L, cls, on) {
    const st = $(L, cls);
    if (!st) return;
    st.querySelector('.st-lit').style.opacity = String(on);
    st.querySelector('.st-gone').style.opacity = String(0.25 + 0.75 * (1 - on));
  }
  const ripples = (L, t, start) => $$(L, '.st-lit .ripple').forEach((r, k) => {
    const p = P(t, start + k * 0.25, 1.4);
    r.style.transformBox = 'fill-box'; r.style.transformOrigin = 'center';
    r.style.transform = `scale(${(0.4 + 1.1 * out3(p)).toFixed(3)})`;
    r.style.opacity = String(p > 0 && p < 1 ? 0.9 * (1 - p) : 0);
  });
  const fifth = (c, b) => ({ // name it, and praise (shared last scene)
    len: 4.2,
    html: page(c, { bg: { cone: 0.09, coneAt: '50% 30%', warm: 0.1, warmAt: '50% 50%' }, top: chip(c, b.title, { size: 34 }), mid: `<div class="m5">${medal(c, ICON[b.id], { size: 360 })}</div>` + gap(c, 10) + `<div class="g5">${display(c, gold('الحمدُ لله'), 150)}</div>`, gap: 26 }),
    anim(t, L) { enter($(L, '.chip'), t, 0.05, 0.5, 14); draw($(L, '.m5 svg'), P(t, 0.1, 1.6)); pop($(L, '.g5'), t, 1.4, 0.8, 0.85); breathe($(L, '.safe'), t, 4.2, 0.02); },
    sfx: [[0.2, 'drop', -24], [1.4, 'breath', -27, { dur: 1.3 }]],
  });
  const lines = (b) => ({
    o: splitLine(b.opening), v: splitLine(b.steps[b.stepTypes.indexOf('visualize')]),
    d: b.steps[b.stepTypes.indexOf('deepen')], r: splitLine(b.steps[b.stepTypes.indexOf('return')]),
  });
  const darkLayer = '<div class="dark" style="position:absolute;inset:0;background:#000;opacity:0"></div>';

  /** «نعمة الماء»: a glass and a falling drop; the glass runs dry; then it fills again. */
  function animMaa(c, b) {
    const { o: [o1, o2], v: [v1, v2], d, r: [r1, r2] } = lines(b);
    const A = window.ART;
    const glass = (cls = 'gl', w = 480) => stack(c, cls, w, 700 / 600, () => A.glassArt('lit', { ripple: true, drop: true }), () => A.glassArt('gone'));
    return [
      { // 1 — the cheapest thing in your house
        len: 6.8,
        html: page(c, { bg: { cone: 0.08, coneAt: '50% 44%', warm: 0.06, warmAt: '50% 50%' }, mid: `<div class="tx1">${title(c, o1, 108)}</div>` + glass() + `<div class="tx2">${quote(c, acc(o2), 62, { w: 900 })}</div>`, gap: 36 }),
        anim(t, L) {
          setStack(L, '.gl', 1);
          const dp = $(L, '.st-lit .drop'); const fall = P(t, 0.8, 0.7);
          if (dp) { dp.style.transform = `translateY(${(fall * fall * 230).toFixed(1)}px)`; dp.style.opacity = String(fall < 1 ? 1 : 0); }
          ripples(L, t, 1.5);
          reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.18 }); reveal($(L, '.tx2 .t-quote'), t, 2.4, { stagger: 0.16 }); breathe($(L, '.safe'), t, 6.8, 0.02);
        },
        sfx: [[1.5, 'drop', -22], [2.0, 'glint', -31]],
      },
      { // 2 — the tap runs dry
        len: 6.6,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 44%' }, under: darkLayer, mid: `<div class="tx1">${title(c, v1, 96)}</div>` + glass() + `<div class="tx2">${quote(c, v2, 66, { w: 900 })}</div>`, gap: 36 }),
        anim(t, L) {
          setStack(L, '.gl', 1 - inOut(P(t, 2.0, 1.8)));
          const dp = $(L, '.st-lit .drop'); if (dp) dp.style.opacity = '0';
          $(L, '.dark').style.opacity = String(0.6 * P(t, 2.2, 1.6));
          reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.17 }); reveal($(L, '.tx2 .t-quote'), t, 3.4, { stagger: 0.18 });
        },
        sfx: [[2.0, 'whoosh', -29, { dur: 1.4, from: 1200, to: 260 }], [3.4, 'wind', -30, { dur: 3.0 }]],
      },
      { // 3 — thirst
        len: 6.4,
        html: page(c, { bg: deep, mid: `${glass('gl0', 280)}<div class="tx">${quote(c, d, 68, { w: 920 })}</div>`, gap: 46 }),
        anim(t, L) { setStack(L, '.gl0', 0); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.2 }); breathe($(L, '.safe'), t, 6.4, 0.02); },
        sfx: [[0.4, 'heartbeat', -26], [2.8, 'heartbeat', -28]],
      },
      { // 4 — then come back: open your tap
        len: 7.6,
        html: page(c, { bg: { cone: 0.12, coneAt: '50% 44%', warm: 0.12, warmAt: '50% 46%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: `<div class="tx1">${title(c, gold(r1), 112)}</div>` + glass() + `<div class="tx2">${quote(c, r2, 62, { w: 920 })}</div>`, gap: 36 }),
        anim(t, L) {
          setStack(L, '.gl', inOut(P(t, 0.4, 1.6)));
          const dp = $(L, '.st-lit .drop'); if (dp) dp.style.opacity = '0';
          ripples(L, t, 1.4);
          pop($(L, '.tx1'), t, 0.1, 0.7, 0.9); reveal($(L, '.tx2 .t-quote'), t, 1.8, { stagger: 0.16 }); drift($(L, '.parts svg'), t, { fade: [0.8, 1.2] });
        },
        sfx: [[0.3, 'pour', -24, { dur: 2.2 }], [1.4, 'drop', -26], [1.8, 'glint', -29]],
      },
      fifth(c, b),
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }

  /** «نعمة الأم»: her house at night, its windows lit; the light goes out; then it comes back. */
  function animUmm(c, b) {
    const { o: [o1, o2], v: [v1, v2], d, r: [r1, r2] } = lines(b);
    const A = window.ART;
    const house = (cls = 'hs', w = 540) => stack(c, cls, w, 700 / 600, () => A.houseArt('lit'), () => A.houseArt('gone'));
    return [
      { // 1 — she carried you
        len: 6.8,
        html: page(c, { bg: { cone: 0.08, coneAt: '50% 44%', warm: 0.06, warmAt: '50% 50%' }, mid: `<div class="tx1">${title(c, o1, 104)}</div>` + house() + `<div class="tx2">${quote(c, acc(o2), 62, { w: 900 })}</div>`, gap: 32 }),
        anim(t, L) { setStack(L, '.hs', inOut(P(t, 0.4, 1.4))); reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.2 }); reveal($(L, '.tx2 .t-quote'), t, 2.4, { stagger: 0.17 }); breathe($(L, '.safe'), t, 6.8, 0.02); },
        sfx: [[0.6, 'breath', -29, { dur: 1.3 }], [1.6, 'glint', -31]],
      },
      { // 2 — the phone rings
        len: 6.8,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 44%' }, under: darkLayer, mid: `<div class="tx1">${title(c, v1, 92)}</div>` + house() + `<div class="tx2">${quote(c, v2, 64, { w: 900 })}</div>`, gap: 32 }),
        anim(t, L) {
          setStack(L, '.hs', 1 - inOut(P(t, 2.6, 1.8)));
          $(L, '.dark').style.opacity = String(0.55 * P(t, 2.8, 1.6));
          reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.17 }); reveal($(L, '.tx2 .t-quote'), t, 3.6, { stagger: 0.18 });
        },
        sfx: [[0.7, 'vibrate', -26], [2.6, 'whoosh', -31, { dur: 1.6, from: 900, to: 260 }]],
      },
      { // 3 — her door no longer waits
        len: 6.4,
        html: page(c, { bg: deep, mid: `${house('hs0', 320)}<div class="tx">${quote(c, d, 68, { w: 920 })}</div>`, gap: 44 }),
        anim(t, L) { setStack(L, '.hs0', 0); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.2 }); breathe($(L, '.safe'), t, 6.4, 0.02); },
        sfx: [[0.5, 'heartbeat', -27], [3.0, 'wind', -32, { dur: 3.0 }]],
      },
      { // 4 — then come back
        len: 9.4,
        html: page(c, { bg: { cone: 0.12, coneAt: '50% 44%', warm: 0.12, warmAt: '50% 46%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: `<div class="tx1">${title(c, gold(r1), 112)}</div>` + house('hs', 460) + `<div class="tx2">${quote(c, r2, 58, { w: 920 })}</div>`, gap: 30 }),
        anim(t, L) {
          setStack(L, '.hs', inOut(P(t, 0.4, 2.0)));
          pop($(L, '.tx1'), t, 0.1, 0.7, 0.9); reveal($(L, '.tx2 .t-quote'), t, 1.8, { stagger: 0.19 }); drift($(L, '.parts svg'), t, { fade: [0.8, 1.2] });
        },
        sfx: [[0.4, 'breath', -27, { dur: 1.3 }], [1.0, 'glint', -29], [1.4, 'birds', -32, { dur: 2.4 }]],
      },
      fifth(c, b),
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }

  /* ---------- «نعمة العقل»: a web of points that connects, scatters, and connects again ---------- */
  function netArt() {
    const R = A0.rng(19), N = 24, W = 760, H = 520, pts = [];
    while (pts.length < N) {
      const x = 60 + R() * (W - 120), y = 50 + R() * (H - 100);
      if (((x - W / 2) / (W / 2 - 40)) ** 2 + ((y - H / 2) / (H / 2 - 30)) ** 2 > 1) continue; // inside an oval
      if (pts.some((p) => Math.hypot(p.x - x, p.y - y) < 70)) continue;
      const a = R() * Math.PI * 2, m = 160 + R() * 260;
      pts.push({ x, y, dx: Math.cos(a) * m, dy: Math.sin(a) * m });
    }
    const edges = [];
    pts.forEach((p, i) => pts.forEach((q, j) => { if (j > i && Math.hypot(p.x - q.x, p.y - q.y) < 150) edges.push([i, j]); }));
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" style="overflow:visible;color:var(--accent)" fill="none" stroke="currentColor" stroke-linecap="round">` +
      edges.map(([i, j], k) => `<line class="ed" data-i="${i}" data-j="${j}" data-k="${k}" stroke-width="2" x1="${pts[i].x}" y1="${pts[i].y}" x2="${pts[j].x}" y2="${pts[j].y}"/>`).join('') +
      pts.map((p, i) => `<circle class="nd" data-i="${i}" data-x="${p.x}" data-y="${p.y}" data-dx="${p.dx.toFixed(1)}" data-dy="${p.dy.toFixed(1)}" cx="${p.x}" cy="${p.y}" r="${7 + (i % 3) * 2}" fill="currentColor" stroke="none"/>`).join('') +
      [0, 1, 2].map((k) => `<circle class="pl" data-k="${k}" r="6" fill="currentColor" stroke="none" opacity="0"/>`).join('') + '</svg>';
  }
  const A0 = window.ART;
  /** conn: edges shown 0..1, scatter: points thrown apart 0..1, t: time (for the pulses) */
  function setNet(L, conn, scatter, t = 0) {
    $$(L, 'svg').forEach((svg) => {
      const nd = [...svg.querySelectorAll('.nd')];
      if (!nd.length) return;
      const pos = nd.map((n) => ({ x: +n.dataset.x + scatter * +n.dataset.dx, y: +n.dataset.y + scatter * +n.dataset.dy }));
      nd.forEach((n, i) => { n.setAttribute('cx', pos[i].x.toFixed(1)); n.setAttribute('cy', pos[i].y.toFixed(1)); n.style.opacity = String(1 - 0.6 * scatter); });
      const ed = [...svg.querySelectorAll('.ed')];
      ed.forEach((e) => {
        const i = +e.dataset.i, j = +e.dataset.j, k = +e.dataset.k;
        e.setAttribute('x1', pos[i].x.toFixed(1)); e.setAttribute('y1', pos[i].y.toFixed(1)); e.setAttribute('x2', pos[j].x.toFixed(1)); e.setAttribute('y2', pos[j].y.toFixed(1));
        const show = clamp(conn * 1.6 - (k / ed.length) * 0.6);
        e.style.opacity = String(0.55 * show * (1 - scatter));
      });
      svg.querySelectorAll('.pl').forEach((pl) => { // light travelling along the web while it is whole
        const k = +pl.dataset.k, e = ed[(k * 7 + Math.floor(t * 1.2 + k)) % ed.length];
        if (!e) return;
        const f = (t * 1.2 + k) % 1, i = +e.dataset.i, j = +e.dataset.j;
        pl.setAttribute('cx', (pos[i].x + (pos[j].x - pos[i].x) * f).toFixed(1)); pl.setAttribute('cy', (pos[i].y + (pos[j].y - pos[i].y) * f).toFixed(1));
        pl.setAttribute('opacity', (conn * (1 - scatter) * Math.sin(Math.PI * f)).toFixed(3));
      });
    });
  }
  /** Words fly apart and fade (the scattered words of «تخيّل الغياب»). */
  function scatterWords(el, p, seed = 7) {
    const R = A0.rng(seed);
    M.words(el).forEach((w) => { const a = R() * Math.PI * 2, m = 60 + R() * 160, rot = (R() - 0.5) * 40; w.style.transform = `translate(${(Math.cos(a) * m * p).toFixed(1)}px, ${(Math.sin(a) * m * p).toFixed(1)}px) rotate(${(rot * p).toFixed(1)}deg)`; w.style.opacity = String(1 - 0.85 * p); });
  }
  function animAql(c, b) {
    const { o: [o1, o2], v: [v1, v2], d, r: [r1, r2] } = lines(b);
    const glowF = c.th === 'layl' ? 'filter:drop-shadow(0 0 14px rgba(228,195,104,0.4));' : '';
    const net = (w = 760) => `<div class="nw" data-w="${c.px(w)}" data-h="${c.px(w * 520 / 760)}" style="width:${c.px(w)}px;height:${c.px(w * 520 / 760)}px;flex:0 0 auto;${glowF}">${netArt()}</div>`;
    return [
      { // 1 — a crown you cannot see
        len: 6.8,
        html: page(c, { bg: { cone: 0.08, coneAt: '50% 44%', warm: 0.05, warmAt: '50% 46%' }, mid: `<div class="tx1">${title(c, o1, 108)}</div>` + net() + `<div class="tx2">${quote(c, acc(o2), 62, { w: 900 })}</div>`, gap: 36 }),
        anim(t, L) {
          setNet(L, P(t, 0.4, 2.0), 0, t);
          $$(L, '.nd').forEach((n, i) => { n.style.opacity = String(out3(P(t, 0.1 + i * 0.03, 0.4))); });
          reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.18 }); reveal($(L, '.tx2 .t-quote'), t, 2.4, { stagger: 0.17 }); breathe($(L, '.safe'), t, 6.8, 0.02);
        },
        sfx: [[0.4, 'glint', -30], [1.4, 'glint', -32, { seed: 40 }], [2.2, 'glint', -33, { seed: 41 }]],
      },
      { // 2 — it begins to go; the words scatter
        len: 7.4,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 44%' }, under: darkLayer, mid: `<div class="tx1">${title(c, v1, 96)}</div>` + net() + `<div class="tx2">${quote(c, v2, 64, { w: 900 })}</div>`, gap: 36 }),
        anim(t, L) {
          const s = inOut(P(t, 1.8, 2.2));
          setNet(L, 1, s, t);
          $(L, '.dark').style.opacity = String(0.5 * P(t, 2.0, 2.0));
          reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.17 });
          const tx = $(L, '.tx2 .t-quote');
          if (t < 5.4) reveal(tx, t, 2.6, { stagger: 0.15 }); else scatterWords(tx, inOut(P(t, 5.4, 1.6)));
        },
        sfx: [[1.8, 'whoosh', -29, { dur: 2.0, from: 2400, to: 400 }], [5.4, 'wind', -31, { dur: 2.0 }]],
      },
      { // 3 — present in body, absent in mind
        len: 6.6,
        html: page(c, { bg: deep, mid: `<div style="opacity:0.35">${net(520)}</div><div class="tx">${quote(c, d, 66, { w: 920 })}</div>`, gap: 40 }),
        anim(t, L) { setNet(L, 0.3, 0.85, t); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.2 }); breathe($(L, '.safe'), t, 6.6, 0.02); },
        sfx: [[0.5, 'heartbeat', -27], [3.0, 'heartbeat', -29]],
      },
      { // 4 — then come back
        len: 8.0,
        html: page(c, { bg: { cone: 0.12, coneAt: '50% 44%', warm: 0.1, warmAt: '50% 46%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: `<div class="tx1">${title(c, gold(r1), 112)}</div>` + net() + `<div class="tx2">${quote(c, r2, 60, { w: 920 })}</div>`, gap: 34 }),
        anim(t, L) {
          setNet(L, P(t, 0.6, 1.6), 1 - inOut(P(t, 0.2, 1.6)), t);
          pop($(L, '.tx1'), t, 0.1, 0.7, 0.9); reveal($(L, '.tx2 .t-quote'), t, 1.9, { stagger: 0.17 }); drift($(L, '.parts svg'), t, { fade: [0.8, 1.2] });
        },
        sfx: [[0.2, 'whoosh', -30, { dur: 1.6, from: 400, to: 2200 }], [1.2, 'glint', -28], [1.6, 'birds', -32, { dur: 2.2 }]],
      },
      fifth(c, b),
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }


  /* ---------- every other blessing: its own icon, drawn, lost, and drawn again ---------- */
  /** The blessing's icon at full size, lit over its «gone» ghost, so the two can cross-fade. */
  function iconStack(c, b, cls = 'ic', size = 520) {
    const p = c.px(size), name = ICON[b.id];
    const glowF = c.th === 'layl' ? 'filter:drop-shadow(0 0 18px rgba(228,195,104,0.42));' : '';
    return `<div class="${cls}" data-sz="${p}" style="position:relative;width:${p}px;height:${p}px;flex:0 0 auto;color:var(--accent)">` +
      `<div class="ic-gone" style="position:absolute;inset:0;opacity:0">${window.ICONS.medal(name, { state: 'gone' })}</div>` +
      `<div class="ic-lit" style="position:absolute;inset:0;${glowF}">${window.ICONS.medal(name)}</div>` +
      `<div class="ic-rays" style="position:absolute;inset:-14%;opacity:0">${raysSvg()}</div></div>`;
  }
  function raysSvg() {
    const r = Array.from({ length: 16 }, (_, k) => { const a = (k / 16) * Math.PI * 2, r0 = 41, r1 = k % 2 ? 47 : 50; return `<path d="M${(50 + r0 * Math.cos(a)).toFixed(1)} ${(50 + r0 * Math.sin(a)).toFixed(1)} L${(50 + r1 * Math.cos(a)).toFixed(1)} ${(50 + r1 * Math.sin(a)).toFixed(1)}"/>`; }).join('');
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round">${r}</svg>`;
  }
  /** on: 1 the blessing is there, 0 it is gone; rays: light around it */
  function setIcon(L, cls, on, rays = 0) {
    const el = $(L, cls);
    if (!el) return;
    el.querySelector('.ic-lit').style.opacity = String(on);
    el.querySelector('.ic-gone').style.opacity = String(0.85 * (1 - on));
    el.querySelector('.ic-rays').style.opacity = String(rays);
    el.querySelector('.ic-rays').style.transform = `rotate(${(rays * 12).toFixed(2)}deg) scale(${(0.94 + 0.06 * rays).toFixed(3)})`;
  }
  function animIcon(c, b) {
    const { o: [o1, o2], v: [v1, v2], d, r: [r1, r2] } = lines(b);
    const two = (a, bb, sa, sb) => `<div class="tx1">${title(c, a, sa)}</div>` + (bb ? `<div class="tx2">${quote(c, bb, sb, { w: 900 })}</div>` : '');
    return [
      { // 1 — the blessing, drawn
        len: 6.6,
        html: page(c, { bg: { cone: 0.08, coneAt: '50% 40%', warm: 0.07, warmAt: '50% 44%' }, mid: `<div class="tx1">${title(c, o1, 104)}</div>` + iconStack(c, b) + (o2 ? `<div class="tx2">${quote(c, acc(o2), 60, { w: 900 })}</div>` : ''), gap: 34 }),
        anim(t, L) { setIcon(L, '.ic', 1, 0.5 * P(t, 1.6, 1.2)); draw($(L, '.ic-lit svg'), P(t, 0.1, 1.8)); reveal($(L, '.tx1 .t-title'), t, 0.3, { stagger: 0.18 }); if (o2) reveal($(L, '.tx2 .t-quote'), t, 2.4, { stagger: 0.16 }); breathe($(L, '.safe'), t, 6.6, 0.02); },
        sfx: [[0.3, 'breath', -29, { dur: 1.3 }], [1.7, 'glint', -30]],
      },
      { // 2 — imagine it gone
        len: 6.8,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 40%' }, under: darkLayer, mid: two(v1, v2, 94, 62).replace('</div><div class="tx2">', `</div>${iconStack(c, b)}<div class="tx2">`), gap: 34 }),
        anim(t, L) {
          const g = inOut(P(t, 2.0, 1.8));
          setIcon(L, '.ic', 1 - g, 0);
          $(L, '.dark').style.opacity = String(0.6 * P(t, 2.2, 1.6));
          mv($(L, '.ic'), { s: 1 - 0.06 * g });
          reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.17 }); if (v2) reveal($(L, '.tx2 .t-quote'), t, 3.5, { stagger: 0.17 });
        },
        sfx: [[2.0, 'whoosh', -29, { dur: 1.6, from: 1600, to: 300 }], [3.6, 'wind', -31, { dur: 3.0 }]],
      },
      { // 3 — the absence
        len: 6.4,
        html: page(c, { bg: deep, mid: `<div style="opacity:0.45">${iconStack(c, b, 'ic0', 320)}</div><div class="tx">${quote(c, d, 68, { w: 920 })}</div>`, gap: 44 }),
        anim(t, L) { setIcon(L, '.ic0', 0, 0); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.2 }); breathe($(L, '.safe'), t, 6.4, 0.02); },
        sfx: [[0.5, 'heartbeat', -27], [2.8, 'heartbeat', -29]],
      },
      { // 4 — then come back
        len: 8.0,
        html: page(c, { bg: { cone: 0.12, coneAt: '50% 40%', warm: 0.12, warmAt: '50% 44%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: `<div class="tx1">${title(c, gold(r1), 110)}</div>` + iconStack(c, b) + (r2 ? `<div class="tx2">${quote(c, r2, 58, { w: 920 })}</div>` : ''), gap: 32 }),
        anim(t, L) {
          setIcon(L, '.ic', 1, out3(P(t, 0.6, 1.6)));
          draw($(L, '.ic-lit svg'), P(t, 0.2, 1.6));
          L.style.filter = `brightness(${(1 + 0.4 * P(t, 0.6, 0.4) * (1 - P(t, 1.0, 1.4))).toFixed(3)})`;
          pop($(L, '.tx1'), t, 0.1, 0.7, 0.9); if (r2) reveal($(L, '.tx2 .t-quote'), t, 1.9, { stagger: 0.17 }); drift($(L, '.parts svg'), t, { fade: [0.8, 1.2] });
        },
        sfx: [[0.3, 'whoosh', -30, { dur: 1.6, from: 400, to: 2200 }], [1.0, 'glint', -28], [1.4, 'birds', -32, { dur: 2.2 }]],
      },
      fifth(c, b),
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }


  /* ---------- the second five: الرزق، المال، حفظ الله، السمع، النوم ---------- */
  const glowL = (c) => (c.th === 'layl' ? 'filter:drop-shadow(0 0 14px rgba(228,195,104,0.42));' : '');
  /** A drawing box that the page's fitting can scale. */
  const box = (c, cls, w, h, inner, extra = '') => `<div class="${cls}" data-w="${c.px(w)}" data-h="${c.px(h)}" style="position:relative;width:${c.px(w)}px;height:${c.px(h)}px;flex:0 0 auto;${glowL(c)}${extra}">${inner}</div>`;
  const svgOpen = (W, H) => `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" style="overflow:visible;color:var(--accent)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">`;
  const twoLines = (c, a, b, sa, sb, mid) => `<div class="tx1">${title(c, a, sa)}</div>${mid}${b ? `<div class="tx2">${quote(c, b, sb, { w: 900 })}</div>` : ''}`;

  /* الرزق: birds, and doors */
  function birdsArt() {
    const birds = [0, 1, 2].map((k) => `<g class="bird" data-k="${k}"><path class="wing" stroke-width="4" d="M-34 0 Q-17 -16 0 0 Q17 -16 34 0"/></g>`).join('');
    return `${svgOpen(800, 300)}<path d="M40 280 L760 280" stroke-width="2" opacity="0.5"/>${birds}</svg>`;
  }
  /** p: 0..1 along the flight (right to left, the way the day goes in Arabic); flap from t */
  function setBirds(L, p, t, alpha = 1) {
    $$(L, '.bird').forEach((g) => {
      const k = +g.dataset.k, q = clamp(p - k * 0.06);
      const x = 760 - 720 * q, y = 150 - 90 * Math.sin(Math.PI * q) + k * 34 - 20;
      g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(0.9 + 0.15 * (k % 2)).toFixed(2)})`);
      const f = Math.sin(t * 9 + k * 1.7) * 14;
      g.querySelector('.wing').setAttribute('d', `M-34 ${(-f * 0.3).toFixed(1)} Q-17 ${(-16 + f).toFixed(1)} 0 0 Q17 ${(-16 + f).toFixed(1)} 34 ${(-f * 0.3).toFixed(1)}`);
      g.style.opacity = String(alpha * (q > 0 && q < 1 ? 1 : 0));
    });
  }
  function setDoorIn(el, open, light) {
    if (!el) return;
    el.querySelectorAll('.leaf').forEach((g) => { g.style.transform = `scaleX(${(1 - open * 0.94).toFixed(4)})`; });
    el.querySelectorAll('.glow').forEach((g) => g.setAttribute('opacity', (light * 0.95).toFixed(3)));
    el.querySelectorAll('.floor').forEach((g) => g.setAttribute('opacity', (light * 0.8).toFixed(3)));
  }
  function animRizq(c, b) {
    const { o: [o1, o2], v: [v1, v2], d, r: [r1, r2] } = lines(b);
    const doors = (w = 250) => `<div class="drs" style="display:flex;gap:${c.px(26)}px;flex:0 0 auto">${[1, 2, 3].map((k) => box(c, `dr dr${k}`, w, w * 820 / 600, doorArt(c))).join('')}</div>`;
    const birds = (w = 860) => box(c, 'bw', w, w * 300 / 800, birdsArt());
    return [
      { // 1 — your provision is written
        len: 6.6,
        html: page(c, { bg: { cone: 0.08, coneAt: '50% 40%', warm: 0.06, warmAt: '50% 46%' }, mid: twoLines(c, o1, acc(o2), 104, 64, birds()), gap: 40 }),
        anim(t, L) { setBirds(L, 0.05 + 0.5 * inOut(P(t, 0.2, 5.6)), t); reveal($(L, '.tx1 .t-title'), t, 0.3, { stagger: 0.18 }); reveal($(L, '.tx2 .t-quote'), t, 2.6, { stagger: 0.17 }); breathe($(L, '.safe'), t, 6.6, 0.02); },
        sfx: [[0.4, 'birds', -30, { dur: 2.4 }], [3.0, 'breath', -30, { dur: 1.2 }]],
      },
      { // 2 — every door shut
        len: 7.0,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 44%' }, under: darkLayer, mid: twoLines(c, v1, v2, 92, 62, doors()), gap: 40 }),
        anim(t, L) {
          [1, 2, 3].forEach((k) => { const s = inOut(P(t, 1.6 + k * 0.75, 0.7)); setDoorIn($(L, `.dr${k}`), 1 - s, 1 - s); });
          draw($(L, '.drs'), P(t, 0, 0.9), 0.1);
          $(L, '.dark').style.opacity = String(0.55 * P(t, 2.4, 2.4));
          reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.17 }); reveal($(L, '.tx2 .t-quote'), t, 4.4, { stagger: 0.16 });
        },
        sfx: [[2.3, 'step', -22, { seed: 21 }], [3.05, 'step', -22, { seed: 22 }], [3.8, 'step', -21, { seed: 23 }], [4.2, 'wind', -31, { dur: 2.6 }]],
      },
      { // 3 — tomorrow's worry
        len: 6.4,
        html: page(c, { bg: deep, mid: `<div style="opacity:0.35">${doors(170)}</div><div class="tx">${quote(c, d, 68, { w: 920 })}</div>`, gap: 46 }),
        anim(t, L) { [1, 2, 3].forEach((k) => setDoorIn($(L, `.dr${k}`), 0, 0)); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.2 }); breathe($(L, '.safe'), t, 6.4, 0.02); },
        sfx: [[0.5, 'heartbeat', -27], [2.8, 'heartbeat', -29]],
      },
      { // 4 — then come back: the doors open, the birds come home
        len: 8.4,
        html: page(c, { bg: { cone: 0.12, coneAt: '50% 40%', warm: 0.12, warmAt: '50% 44%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: `<div class="tx1">${title(c, gold(r1), 110)}</div>` + birds(760) + doors(200) + `<div class="tx2">${quote(c, r2, 54, { w: 920 })}</div>`, gap: 26 }),
        anim(t, L) {
          const o = inOut(P(t, 0.3, 1.6));
          [1, 2, 3].forEach((k) => setDoorIn($(L, `.dr${k}`), o, o));
          setBirds(L, 0.5 + 0.5 * inOut(P(t, 0.6, 6.6)), t);
          pop($(L, '.tx1'), t, 0.1, 0.7, 0.9); reveal($(L, '.tx2 .t-quote'), t, 1.9, { stagger: 0.16 }); drift($(L, '.parts svg'), t, { fade: [0.8, 1.2] });
        },
        sfx: [[0.3, 'whoosh', -30, { dur: 1.6, from: 400, to: 2200 }], [0.9, 'birds', -29, { dur: 2.6 }], [1.3, 'glint', -29]],
      },
      fifth(c, b),
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }

  /* المال: a stack of coins */
  const COINS = 7;
  function coinsArt() {
    const coin = (k) => { const y = 380 - k * 34; return `<g class="coin" data-k="${k}"><path d="M200 ${y} L200 ${y + 16} A100 26 0 0 0 400 ${y + 16} L400 ${y}" stroke-width="3.2" fill="var(--bg)"/><ellipse cx="300" cy="${y}" rx="100" ry="26" stroke-width="3.2" fill="var(--bg)"/><ellipse cx="300" cy="${y}" rx="62" ry="15" stroke-width="1.6" opacity="0.6"/></g>`; };
    return `${svgOpen(600, 460)}<ellipse class="base" cx="300" cy="400" rx="118" ry="30" stroke-width="2" stroke-dasharray="6 10" opacity="0.5"/>${Array.from({ length: COINS }, (_, k) => coin(k)).join('')}` +
      `<g class="gift" opacity="0"><ellipse cx="300" cy="0" rx="100" ry="26" stroke-width="3.2" fill="currentColor" fill-opacity="0.25"/><ellipse cx="300" cy="0" rx="62" ry="15" stroke-width="1.6" opacity="0.6"/></g></svg>`;
  }
  /** n coins showing (fractional: the top one fades in or out) */
  function setCoins(L, n) {
    $$(L, '.coin').forEach((g) => { const k = +g.dataset.k; const o = clamp(n - k); g.style.opacity = String(o); g.style.transform = `translateY(${((1 - o) * -40).toFixed(1)}px)`; });
  }
  function animMal(c, b) {
    const { o: [o1, o2], v: [v1, v2], d, r: [r1, r2] } = lines(b);
    const coins = (w = 700) => box(c, 'cn', w, w * 460 / 600, coinsArt());
    return [
      { // 1 — a trust, and a test
        len: 7.0,
        html: page(c, { bg: { cone: 0.08, coneAt: '50% 40%', warm: 0.06, warmAt: '50% 46%' }, mid: twoLines(c, o1, acc(o2), 86, 64, coins()), gap: 36 }),
        anim(t, L) { setCoins(L, COINS * P(t, 0.4, 2.4)); reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.14 }); reveal($(L, '.tx2 .t-quote'), t, 3.4, { stagger: 0.18 }); breathe($(L, '.safe'), t, 7.0, 0.02); },
        sfx: Array.from({ length: COINS }, (_, k) => [0.4 + (k + 1) * (2.4 / COINS) - 0.15, 'click', -27, { seed: 50 + k }]),
      },
      { // 2 — gone in one night, and the debts knock
        len: 7.2,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 44%' }, under: darkLayer, mid: twoLines(c, v1, v2, 92, 62, coins()), gap: 36 }),
        anim(t, L) {
          setCoins(L, COINS * (1 - inOut(P(t, 1.8, 2.0))));
          $(L, '.dark').style.opacity = String(0.55 * P(t, 2.0, 2.0));
          reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.17 }); reveal($(L, '.tx2 .t-quote'), t, 3.8, { stagger: 0.17 });
        },
        sfx: [[1.8, 'whoosh', -29, { dur: 1.8, from: 1800, to: 300 }], [5.2, 'step', -23, { seed: 31 }], [5.55, 'step', -23, { seed: 32 }], [5.9, 'step', -23, { seed: 33 }]],
      },
      { // 3 — need, and shame
        len: 6.4,
        html: page(c, { bg: deep, mid: `<div style="opacity:0.5">${coins(480)}</div><div class="tx">${quote(c, d, 66, { w: 920 })}</div>`, gap: 44 }),
        anim(t, L) { setCoins(L, 0); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.2 }); breathe($(L, '.safe'), t, 6.4, 0.02); },
        sfx: [[0.5, 'heartbeat', -27], [2.8, 'heartbeat', -29]],
      },
      { // 4 — then come back: enough, and something to give
        len: 8.6,
        html: page(c, { bg: { cone: 0.12, coneAt: '50% 40%', warm: 0.12, warmAt: '50% 44%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: twoLines(c, gold(r1), r2, 110, 56, coins()), gap: 32 }),
        anim(t, L) {
          setCoins(L, COINS * inOut(P(t, 0.3, 1.6)));
          const gp = P(t, 3.0, 1.6), g = $(L, '.gift'); // the top coin given away… and replaced
          if (g) { g.setAttribute('opacity', String(gp > 0 && gp < 1 ? Math.sin(Math.PI * gp) : 0)); g.setAttribute('transform', `translate(${(gp * 230).toFixed(1)} ${(380 - (COINS - 1) * 34 - gp * 150).toFixed(1)})`); }
          if (t > 3.0) { const top = $(L, `.coin[data-k="${COINS - 1}"]`); if (top) { const back = P(t, 4.6, 0.6); top.style.opacity = String(back); top.style.transform = `translateY(${((1 - back) * -40).toFixed(1)}px)`; } }
          pop($(L, '.tx1'), t, 0.1, 0.7, 0.9); reveal($(L, '.tx2 .t-quote'), t, 1.9, { stagger: 0.16 }); drift($(L, '.parts svg'), t, { fade: [0.8, 1.2] });
        },
        sfx: [[0.3, 'whoosh', -30, { dur: 1.6, from: 400, to: 2200 }], [3.1, 'glint', -27], [4.7, 'click', -25, { seed: 60 }], [4.8, 'glint', -29, { seed: 61 }]],
      },
      fifth(c, b),
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }

  /* حفظ الله: a point on its way, rings around it */
  const HAZ = 7;
  function guardArt() {
    const haz = Array.from({ length: HAZ }, (_, k) => `<path class="hz" data-k="${k}" d="M-9 -9 L9 9 M9 -9 L-9 9" stroke-width="3" opacity="0"/>`).join('');
    return `${svgOpen(700, 520)}<path class="road" d="M40 470 C220 430 300 330 360 260 C420 190 520 120 660 60" stroke-width="2" stroke-dasharray="4 14" opacity="0.6"/>` +
      `<g class="me"><circle class="ring r1" r="62" stroke-width="2.6"/><circle class="ring r2" r="92" stroke-width="1.8" opacity="0.6"/><circle r="14" fill="currentColor" stroke="none"/></g>${haz}</svg>`;
  }
  const roadAt = (p) => { // a point on the road (cubic pieces approximated by two quadratic-ish blends)
    const P0 = [40, 470], P1 = [220, 430], P2 = [300, 330], P3 = [360, 260], P4 = [420, 190], P5 = [520, 120], P6 = [660, 60];
    const cub = (a, b, cc, dd, u) => [0, 1].map((i) => (1 - u) ** 3 * a[i] + 3 * (1 - u) ** 2 * u * b[i] + 3 * (1 - u) * u * u * cc[i] + u ** 3 * dd[i]);
    return p < 0.5 ? cub(P0, P1, P2, P3, p * 2) : cub(P3, P4, P5, P6, (p - 0.5) * 2);
  };
  /** walk 0..1 along the road; guard 0..1 the rings; t for the hazards' rhythm */
  function setGuard(L, walk, guard, t) {
    const [x, y] = roadAt(walk);
    const me = $(L, '.me'); if (!me) return;
    me.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    $$(L, '.ring').forEach((r, k) => { r.style.opacity = String(guard * (k ? 0.6 : 1)); r.setAttribute('stroke-dasharray', guard < 0.98 ? `${(14 * guard + 2).toFixed(1)} ${(14 * (1 - guard) + 4).toFixed(1)}` : 'none'); });
    $$(L, '.hz').forEach((h) => {
      const k = +h.dataset.k, ph = ((t * 0.55 + k / HAZ) % 1), a = k * 2.399 + 0.4;
      const stop = 70, far = 300; // with the rings up, nothing comes nearer than the ring
      const r = guard > 0.5 ? (ph < 0.5 ? far - (far - stop - 70) * (ph / 0.5) : stop + 70 + (far - stop - 70) * ((ph - 0.5) / 0.5)) : far - (far - 120) * ph;
      h.setAttribute('transform', `translate(${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)}) rotate(${(t * 40 + k * 30).toFixed(0)})`);
      h.setAttribute('opacity', (0.75 * Math.sin(Math.PI * ph)).toFixed(3));
    });
  }
  function animHifz(c, b) {
    const { o: [o1, o2], v: [v1, v2], d, r: [r1, r2] } = lines(b);
    const guard = (w = 700) => box(c, 'gd', w, w * 520 / 700, guardArt());
    return [
      { // 1 — how many dangers passed you by
        len: 6.8,
        html: page(c, { bg: { cone: 0.08, coneAt: '50% 40%', warm: 0.05, warmAt: '50% 46%' }, mid: twoLines(c, o1, acc(o2), 100, 64, guard()), gap: 36 }),
        anim(t, L) { setGuard(L, 0.08 + 0.28 * P(t, 0, 6.8), out3(P(t, 0.2, 1.0)), t); reveal($(L, '.tx1 .t-title'), t, 0.3, { stagger: 0.18 }); reveal($(L, '.tx2 .t-quote'), t, 2.6, { stagger: 0.17 }); },
        sfx: [[1.4, 'glint', -31], [3.2, 'glint', -32, { seed: 44 }], [5.0, 'glint', -32, { seed: 45 }]],
      },
      { // 2 — the keeping lifted
        len: 7.0,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 44%' }, under: darkLayer, mid: twoLines(c, v1, v2, 92, 60, guard()), gap: 36 }),
        anim(t, L) {
          setGuard(L, 0.36 + 0.2 * P(t, 0, 7.0), 1 - inOut(P(t, 1.8, 1.6)), t);
          $(L, '.dark').style.opacity = String(0.5 * P(t, 2.0, 2.0));
          reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.17 }); reveal($(L, '.tx2 .t-quote'), t, 3.6, { stagger: 0.15 });
        },
        sfx: [[1.8, 'whoosh', -29, { dur: 1.6, from: 1600, to: 300 }], [3.4, 'wind', -31, { dur: 3.0 }], [3.6, 'heartbeat', -29]],
      },
      { // 3 — how many near misses
        len: 6.6,
        html: page(c, { bg: deep, mid: `<div style="opacity:0.45">${guard(460)}</div><div class="tx">${quote(c, d, 64, { w: 920 })}</div>`, gap: 40 }),
        anim(t, L) { setGuard(L, 0.56, 0, t * 0.6); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.2 }); breathe($(L, '.safe'), t, 6.6, 0.02); },
        sfx: [[0.5, 'heartbeat', -27], [2.9, 'heartbeat', -29]],
      },
      { // 4 — then come back: kept, before and behind
        len: 8.0,
        html: page(c, { bg: { cone: 0.12, coneAt: '50% 40%', warm: 0.12, warmAt: '50% 44%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: twoLines(c, gold(r1), r2, 110, 58, guard()), gap: 32 }),
        anim(t, L) {
          setGuard(L, 0.56 + 0.4 * P(t, 0, 8.0), inOut(P(t, 0.3, 1.4)), t);
          pop($(L, '.tx1'), t, 0.1, 0.7, 0.9); reveal($(L, '.tx2 .t-quote'), t, 1.9, { stagger: 0.17 }); drift($(L, '.parts svg'), t, { fade: [0.8, 1.2] });
        },
        sfx: [[0.3, 'whoosh', -30, { dur: 1.6, from: 400, to: 2200 }], [1.0, 'glint', -28], [1.4, 'birds', -32, { dur: 2.2 }]],
      },
      fifth(c, b),
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }

  /* السمع: waves, and a line that carries sound */
  function soundArt() {
    const rings = [0, 1, 2, 3].map((k) => `<circle class="wv" data-k="${k}" cx="380" cy="190" r="80" stroke-width="2.4" opacity="0"/>`).join('');
    return `${svgOpen(760, 500)}${rings}<path class="line" d="M40 430 L720 430" stroke-width="3"/></svg>`;
  }
  /** amp: 0 silence … 1 the world's sound */
  function setSound(L, amp, t) {
    $$(L, '.wv').forEach((w) => { const k = +w.dataset.k, ph = (t * 0.45 + k / 4) % 1; w.setAttribute('r', (80 + 230 * ph).toFixed(1)); w.setAttribute('opacity', (amp * 0.7 * (1 - ph)).toFixed(3)); });
    const ln = $(L, '.line'); if (!ln) return;
    let dd = 'M40 430';
    for (let x = 40; x <= 720; x += 8) {
      const u = (x - 40) / 680, env = Math.sin(Math.PI * u);
      const yv = 430 - amp * env * (34 * Math.sin(x * 0.045 + t * 7) + 18 * Math.sin(x * 0.11 - t * 11) + 8 * Math.sin(x * 0.23 + t * 17));
      dd += ` L${x} ${yv.toFixed(1)}`;
    }
    ln.setAttribute('d', dd);
  }
  function animSam(c, b) {
    const { o: [o1, o2], v: [v1, v2], d, r: [r1, r2] } = lines(b);
    const ear = (w = 680) => box(c, 'sw', w, w * 500 / 760, soundArt() + `<div style="position:absolute;left:50%;top:38%;width:24%;aspect-ratio:1;transform:translate(-50%,-50%);color:var(--accent)">${window.ICONS.medal(ICON[b.id])}</div>`);
    return [
      { // 1 — the first sense
        len: 6.8,
        html: page(c, { bg: { cone: 0.08, coneAt: '50% 40%', warm: 0.06, warmAt: '50% 46%' }, mid: twoLines(c, o1, acc(o2), 100, 62, ear()), gap: 36 }),
        anim(t, L) { setSound(L, out3(P(t, 0.3, 1.4)), t); reveal($(L, '.tx1 .t-title'), t, 0.3, { stagger: 0.18 }); reveal($(L, '.tx2 .t-quote'), t, 2.6, { stagger: 0.17 }); },
        sfx: [[0.3, 'birds', -30, { dur: 2.6 }], [3.2, 'drop', -28]],
      },
      { // 2 — every sound goes out
        len: 7.0,
        html: page(c, { bg: { cone: 0.06, coneAt: '50% 44%' }, under: darkLayer, mid: twoLines(c, v1, v2, 92, 60, ear()), gap: 36 }),
        anim(t, L) { setSound(L, 1 - inOut(P(t, 1.8, 1.4)), t); $(L, '.dark').style.opacity = String(0.55 * P(t, 2.0, 2.0)); reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.17 }); reveal($(L, '.tx2 .t-quote'), t, 3.6, { stagger: 0.17 }); },
        sfx: [[0.2, 'birds', -31, { dur: 1.6 }]], // and then nothing at all
      },
      { // 3 — no recitation, no laughter, no call to prayer
        len: 6.8,
        html: page(c, { bg: deep, mid: `<div style="opacity:0.45">${ear(460)}</div><div class="tx">${quote(c, d, 62, { w: 920 })}</div>`, gap: 40 }),
        anim(t, L) { setSound(L, 0, t); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.2 }); breathe($(L, '.safe'), t, 6.8, 0.02); },
        sfx: [],
      },
      { // 4 — then come back: listen
        len: 8.0,
        html: page(c, { bg: { cone: 0.12, coneAt: '50% 40%', warm: 0.12, warmAt: '50% 44%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: twoLines(c, gold(r1), r2, 110, 58, ear()), gap: 32 }),
        anim(t, L) { setSound(L, inOut(P(t, 0.4, 1.4)), t); pop($(L, '.tx1'), t, 0.1, 0.7, 0.9); reveal($(L, '.tx2 .t-quote'), t, 1.9, { stagger: 0.17 }); drift($(L, '.parts svg'), t, { fade: [0.8, 1.2] }); },
        sfx: [[0.5, 'breath', -27, { dur: 1.2 }], [0.8, 'birds', -28, { dur: 3.0 }], [1.6, 'drop', -27], [2.6, 'glint', -30]],
      },
      fifth(c, b),
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }

  /* النوم: the moon, three sleepless nights, and the dawn */
  let nightN = 0;
  function nightArt(c) {
    const R = A0.rng(14), uid = `nt${++nightN}`;
    const stars = Array.from({ length: 16 }, (_, k) => `<circle class="st" data-k="${k}" cx="${(40 + R() * 680).toFixed(0)}" cy="${(20 + R() * 260).toFixed(0)}" r="${(1.6 + R() * 2.4).toFixed(1)}" fill="currentColor" stroke="none"/>`).join('');
    const moons = [0, 1, 2].map((k) => `<path class="mn" data-k="${k}" transform="translate(${250 + k * 130} 340)" d="M14 -24 A26 26 0 1 0 14 24 A20 20 0 1 1 14 -24 Z" stroke-width="2.6" fill="currentColor" fill-opacity="0.15" opacity="0"/>`).join('');
    const sunC = c.th === 'nahar' ? '#D4704F' : '#F0D48A';
    return `${svgOpen(760, 460)}<defs><clipPath id="${uid}"><rect x="0" y="-200" width="760" height="632"/></clipPath></defs>${stars}<path class="moon" d="M600 60 A62 62 0 1 0 600 184 A48 48 0 1 1 600 60 Z" stroke-width="3.2" fill="currentColor" fill-opacity="0.18"/>` + moons +
      `<g clip-path="url(#${uid})"><g class="sun" opacity="0"><circle cx="380" cy="430" r="58" fill="${sunC}" fill-opacity="0.35" stroke="currentColor" stroke-width="3"/>${Array.from({ length: 9 }, (_, k) => { const a = Math.PI + (k / 8) * Math.PI; return `<path d="M${(380 + 76 * Math.cos(a)).toFixed(1)} ${(430 + 76 * Math.sin(a)).toFixed(1)} L${(380 + 104 * Math.cos(a)).toFixed(1)} ${(430 + 104 * Math.sin(a)).toFixed(1)}" stroke-width="3"/>`; }).join('')}</g></g>` +
      `<path d="M30 432 L730 432" stroke-width="2.4" opacity="0.7"/></svg>`;
  }
  function setNight(L, t, { moon = 1, nights = 0, sun = 0 } = {}) {
    $$(L, '.st').forEach((s) => { const k = +s.dataset.k; s.style.opacity = String((1 - sun) * (0.45 + 0.55 * Math.abs(Math.sin(t * 1.3 + k)))); });
    const m = $(L, '.moon'); if (m) { m.style.opacity = String(moon); m.style.transform = `translateY(${(sun * 90).toFixed(1)}px)`; }
    $$(L, '.mn').forEach((n) => { const k = +n.dataset.k; n.setAttribute('opacity', String(clamp(nights - k))); });
    const s = $(L, '.sun'); if (s) { s.setAttribute('opacity', String(sun)); s.setAttribute('transform', `translate(0 ${((1 - sun) * 90).toFixed(1)})`); }
  }
  function animNawm(c, b) {
    const { o: [o1, o2], v: [v1, v2], d, r: [r1, r2] } = lines(b);
    const night = (w = 760) => box(c, 'nt', w, w * 460 / 760, nightArt(c));
    return [
      { // 1 — a small death every night
        len: 6.8,
        html: page(c, { bg: { tone: 'ground', cone: 0.06, coneAt: '50% 34%' }, mid: twoLines(c, o1, acc(o2), 100, 62, night()), gap: 36 }),
        anim(t, L) { setNight(L, t, { moon: out3(P(t, 0.2, 1.2)) }); reveal($(L, '.tx1 .t-title'), t, 0.3, { stagger: 0.18 }); reveal($(L, '.tx2 .t-quote'), t, 2.6, { stagger: 0.17 }); breathe($(L, '.safe'), t, 6.8, 0.02); },
        sfx: [[0.3, 'breath', -29, { dur: 1.6 }], [2.8, 'glint', -32]],
      },
      { // 2 — the first night, the second, the third
        len: 7.4,
        html: page(c, { bg: { tone: 'deep', cone: 0.04, coneAt: '50% 44%' }, mid: twoLines(c, v1, v2, 92, 62, night()), gap: 36 }),
        anim(t, L) { setNight(L, t, { moon: 1, nights: 3 * P(t, 2.0, 2.6) }); reveal($(L, '.tx1 .t-title'), t, 0.2, { stagger: 0.17 }); reveal($(L, '.tx2 .t-quote'), t, 2.0, { stagger: 0.3 }); },
        sfx: [[2.0, 'tick', -24], [2.9, 'tick', -24], [3.8, 'tick', -23], [4.6, 'heartbeat', -29]],
      },
      { // 3 — all you want is to sleep
        len: 6.4,
        html: page(c, { bg: deep, mid: `<div style="opacity:0.45">${night(460)}</div><div class="tx">${quote(c, d, 64, { w: 920 })}</div>`, gap: 40 }),
        anim(t, L) { setNight(L, t * 3, { moon: 1, nights: 3 }); reveal($(L, '.tx .t-quote'), t, 0.3, { stagger: 0.2 }); breathe($(L, '.safe'), t, 6.4, 0.02); },
        sfx: [[0.5, 'heartbeat', -27], [2.8, 'heartbeat', -29]],
      },
      { // 4 — then come back: tonight, sleep comes; and with the dawn, He returns you
        len: 8.2,
        html: page(c, { bg: { cone: 0.12, coneAt: '50% 44%', warm: 0.14, warmAt: '50% 50%' }, under: `<div class="parts" style="position:absolute;inset:0">${lit(c)}</div>`, mid: twoLines(c, gold(r1), r2, 110, 56, night()), gap: 32 }),
        anim(t, L) { setNight(L, t, { moon: 1 - P(t, 2.4, 2.0), sun: inOut(P(t, 2.6, 2.6)) }); pop($(L, '.tx1'), t, 0.1, 0.7, 0.9); reveal($(L, '.tx2 .t-quote'), t, 1.9, { stagger: 0.17 }); drift($(L, '.parts svg'), t, { fade: [1.8, 1.4] }); },
        sfx: [[0.4, 'breath', -27, { dur: 1.6 }], [3.0, 'birds', -29, { dur: 3.0 }], [3.6, 'glint', -29]],
      },
      fifth(c, b),
      endScene(c, { sub: `${b.title}… ودقيقتان معها في «الحمد»` }),
    ];
  }

  /** The animated reel of each packaged blessing: ten are drawn for their blessing; every other one animates its icon. */
  function animFor(n) { return { 5: animSalah, 37: animBasar, 15: animMaa, 22: animUmm, 19: animAql, 28: animRizq, 29: animMal, 34: animHifz, 36: animSam, 14: animNawm }[n] || animIcon; }
})();
