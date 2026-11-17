/*
 * Alhamd — silent videos (no voice-over): extra scenes and their motion.
 * Loaded by loops.html after motion.js; videos.json says which scenes each video strings together.
 */
(function () {
  const K = window.SCENE_KIT;
  const A = window.ART;
  const M = window.MOTION_KIT;
  const { P, out3, inOut, back, lerp, $, $$, mv, enter, pop, words, reveal, drawArt, drift } = M;
  const { glassArt, windowArt } = A;

  const gold = (s) => `<span class="goldtext" style="display:inline-block;padding:0.32em 0.12em;margin:-0.32em -0.12em;background:linear-gradient(180deg,#F8E3A3 0%,#E4C368 52%,#C29E45 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 28px rgba(228,195,104,0.45))">${s}</span>`;
  const H = K.H, SUB = K.SUB, ART = K.ART;
  const chip = (t, top) => `<div class="chip" style="top:${top}px">${t}</div>`;
  const rings = (cy, list) => `<svg class="abs rings" style="left:0;top:0;width:1080px;height:1920px" viewBox="0 0 1080 1920">${list.map(([r, o]) => `<circle cx="540" cy="${cy}" r="${r}" fill="none" stroke="#E4C368" stroke-opacity="${o}" stroke-width="2"/>`).join('')}</svg>`;
  const url = (top, size = 40) => `<div class="abs url" style="left:0;right:0;top:${top}px;text-align:center;font-family:var(--sans);font-weight:600;font-size:${size}px;color:var(--text);direction:ltr">alhamd.app</div>`;
  const ctaPill = (t, top) => `<div class="btn-cta" style="top:${top}px;width:620px;height:116px;font-size:46px">${t}</div>`;

  /* ---------------- scenes ---------------- */
  const S = {
    // V1 — the absence loop: the cup comes back
    L1D: () => K.bg({ cone: 0.08, warm: 0.08, warmAt: '50% 52%' }) +
      rings(980, [[260, 0.14], [340, 0.08], [430, 0.05]]) +
      K.particles({ n: 60, seed: 61, box: [80, 500, 920, 1000], rmax: 6, omin: 0.15, omax: 0.85 }) +
      H(gold('الحمدُ لله'), 250, 150, 'line-height:1.35') +
      ART(glassArt('lit', { ripple: true }), { x: 250, y: 640, w: 580, h: 677 }) +
      K.wordmark({ size: 84, top: 1440 }),
    // end card shared by several videos
    L2C: () => K.bg({ cone: 0.09, coneAt: '50% 40%' }) +
      K.wordmark({ size: 220, top: 560 }) +
      SUB('نعمةٌ كلَّ يوم… ودقيقتان من التأمّل', 920, 52, 'font-family:var(--serif);color:var(--text)') +
      url(1060),
    // V3 — one blessing as an episode (the series template)
    B1: () => K.bg({ cone: 0.08 }) + chip('نعمة اليوم', 300) +
      H('نعمة الماء', 400, 124) +
      SUB('أرخصُ شيءٍ في بيتك… وأول شيءٍ يسأل عنه القرآنُ سؤالَ التحدي: من يأتيكم به؟', 610, 44, 'color:var(--body)') +
      ART(glassArt('lit', { cold: false }), { x: 330, y: 860, w: 420, h: 490 }),
    B2: () => K.bg({ tone: 'deep', pat: 0.02, cone: 0.02 }) + chip('تخيّل الغياب', 300) +
      H('تخيَّل أنك أصبحتَ والصنبور جاف…<br>ولا قطرة في المدينة كلها.', 420, 78, 'font-weight:400;line-height:1.7') +
      ART(glassArt('gone'), { x: 330, y: 860, w: 420, h: 490, cls: '' }),
    B3: () => K.bg({ cone: 0.08, warm: 0.06, warmAt: '50% 60%' }) + chip('العودة', 300) +
      H('ثم عُد…<br><span class="g">الماء يجري بأمر الله،<br>عذبًا باردًا.</span>', 420, 76, 'font-weight:400;line-height:1.7') +
      ART(glassArt('lit', { ripple: true, drop: true }), { x: 330, y: 860, w: 420, h: 490 }),
    B4: () => K.bg({ cone: 0.1, coneAt: '50% 40%', warm: 0.13, warmAt: '50% 45%' }) +
      rings(860, [[250, 0.2], [330, 0.13], [420, 0.08], [520, 0.05]]) +
      K.particles({ n: 90, seed: 21, box: [40, 300, 1000, 1200], rmax: 7, omin: 0.15, omax: 0.9 }) +
      H(gold('الحمدُ لله'), 690, 210, 'line-height:1.3') +
      SUB('على كلِّ شربةِ ماء.', 1060, 58, 'font-family:var(--serif);color:var(--body)'),
    B5: () => K.bg({ cone: 0.09, coneAt: '50% 34%' }) +
      H('كلَّ يومٍ نعمةٌ جديدة…<br><span class="g">في «الحمد»</span>', 380, 96) +
      ctaPill('ابدأ بنعمة اليوم', 820) + url(990) + K.wordmark({ size: 110, top: 1200 }),
    // V4 — the tasbih counter
    T1: () => K.bg({ cone: 0.07, coneAt: '50% 44%' }) + chip('المسبحة', 300) +
      `<svg class="abs tsvg" style="left:0;top:0;width:1080px;height:1920px" viewBox="0 0 1080 1920">
        <circle cx="540" cy="900" r="300" fill="#16162C" stroke="#2E2E4A" stroke-width="10"/>
        <circle class="tring" cx="540" cy="900" r="300" fill="none" stroke="#E4C368" stroke-width="14" stroke-linecap="round" pathLength="1" stroke-dasharray="0.64 1" transform="rotate(-90 540 900)" style="filter:drop-shadow(0 0 14px rgba(228,195,104,0.6))"/>
        <circle class="tripple" cx="540" cy="900" r="300" fill="none" stroke="#E4C368" stroke-width="4" opacity="0"/>
      </svg>` +
      H(gold('الحمدُ لله'), 700, 92, 'line-height:1.3') +
      `<div class="abs tcount" style="left:0;right:0;top:880px;text-align:center;font-family:var(--sans);font-weight:700;font-size:150px;line-height:1;color:var(--text)">٢١</div>` +
      SUB('ثلاثٌ وثلاثون', 1250, 60, 'font-family:var(--serif);font-weight:700;color:var(--gold)') +
      SUB('تسبيحٌ بلمسة… واهتزازٌ خفيف عند كلّ ثلاثٍ وثلاثين', 1360, 40, 'color:var(--muted)'),
    T2: () => K.bg({ cone: 0.09, coneAt: '50% 40%' }) +
      K.wordmark({ size: 200, top: 560 }) +
      SUB('المسبحة وحصن المسلم… في «الحمد»', 900, 52, 'font-family:var(--serif);color:var(--text)') + url(1040),
    // V5 — the five pauses
    FP1: () => {
      const steps = [['التهيئة والحضور', 'خذ نفسًا عميقًا… وأحضر قلبك لحظة.'], ['تخيّل الغياب', 'تتخيّل يومك وقد غابت النعمة عنه.'], ['التعمّق', 'ما الذي كان سيتغيّر في قلبك وفي من حولك؟'], ['العودة', 'تفتح عينيك… فتجدها ما زالت بين يديك.'], ['الحمد', 'تحمد الله عليها بقلبٍ حاضر.']];
      let s = K.bg({ cone: 0.07 }) + H('دقيقتان… <span class="g">وخمس وقفات</span>', 260, 92);
      s += `<div class="abs fthread" style="right:150px;top:560px;width:3px;height:${4 * 200}px;background:var(--gold-deep);transform-origin:top center"></div>`;
      steps.forEach(([name, line], i) => {
        const y = 540 + i * 200, last = i === 4;
        s += `<div class="abs fdot" data-i="${i}" style="right:${last ? 140 : 143}px;top:${y + 12}px;width:${last ? 24 : 17}px;height:${last ? 24 : 17}px;border-radius:50%;background:${last ? 'var(--gold)' : 'var(--gold-deep)'};${last ? 'box-shadow:0 0 0 9px rgba(200,169,81,0.18),0 0 26px rgba(228,195,104,0.6)' : ''}"></div>`;
        s += `<div class="abs fname" data-i="${i}" style="right:200px;left:90px;top:${y - 14}px;text-align:right;font-family:var(--serif);font-weight:700;font-size:62px;line-height:1.3;color:${last ? 'var(--gold)' : 'var(--text)'}">${name}</div>`;
        s += `<div class="abs fline" data-i="${i}" style="right:200px;left:90px;top:${y + 76}px;text-align:right;font-family:var(--sans);font-size:38px;line-height:1.5;color:var(--body)">${line}</div>`;
      });
      return s;
    },
    // V7 — launch teaser
    TZ: () => K.bg({ cone: 0.09, coneAt: '50% 36%' }) +
      K.particles({ n: 60, seed: 77, box: [40, 300, 1000, 1200], rmax: 6, omin: 0.15, omax: 0.8 }) +
      K.wordmark({ size: 230, top: 600 }) +
      H('<span class="g">قريبًا</span>', 960, 120) +
      SUB('على <span style="direction:ltr;unicode-bidi:isolate">Google Play</span>', 1170, 50, 'color:var(--text);font-weight:500'),
  };

  /* ---------------- motion ---------------- */
  const wordmarkIn = (c, t, s0 = 0.1) => {
    enter($(c, '.wordmark .word'), t, s0, 0.7, 22);
    const line = $(c, '.wordmark .line i');
    if (line) { line.style.transformOrigin = 'right center'; line.style.transform = `scaleX(${inOut(P(t, s0 + 0.4, 0.7)).toFixed(4)})`; }
    pop($(c, '.wordmark .line b'), t, s0 + 0.3, 0.45, 0.2);
  };
  const dropAndRipples = (svg, t, t0) => {
    const drop = svg && $(svg, '.drop');
    if (drop) {
      const fall = P(t, t0, 0.5), sink = P(t, t0 + 0.5, 0.25);
      const y = t < t0 + 0.5 ? lerp(-150, 0, fall * fall) : lerp(0, 205, sink * sink);
      drop.style.transform = `translate(0px, ${y.toFixed(2)}px)`;
      drop.style.opacity = String(P(t, t0, 0.15) * (1 - P(t, t0 + 0.65, 0.12)));
    }
    $$(svg, '.ripple').forEach((r, k) => {
      r.style.transformOrigin = '300px 300px';
      if (t < t0 + 0.75) { r.style.opacity = '0'; return; }
      const q = ((t - t0 - 0.75) * 0.75 + k * 0.45) % 1;
      r.style.transform = `scale(${(0.35 + 0.9 * q).toFixed(3)})`;
      r.style.opacity = String((1 - q) * 0.9);
    });
  };
  const AN = {
    L1D(c, t) {
      const h = $(c, '.headline');
      mv(h, { o: out3(P(t, 0.25, 0.8)), s: lerp(0.94, 1, out3(P(t, 0.25, 1.3))) });
      drawArt($(c, '.art svg'), P(t, 0, 0.9));
      const r = $(c, '.rings');
      if (r) { r.style.transformOrigin = '540px 980px'; mv(r, { o: P(t, 0.2, 0.8), s: lerp(0.9, 1.05, P(t, 0, 3)) }); }
      drift($(c, '.particles'), t, { fade: [0.3, 0.8], vy: -18, twinkle: 0.4 });
      enter($(c, '.wordmark'), t, 1.0, 0.6, 10);
    },
    L2C(c, t) {
      wordmarkIn(c, t);
      enter($(c, '.sub'), t, 0.8, 0.6, 14);
      enter($(c, '.url'), t, 1.1, 0.5, 10);
    },
    HB1(c, t, d) {
      const [h1, h2] = $$(c, '.headline');
      reveal(words(h1), t, 0.15, 0.2, 0.6);
      const ring = $$(c, 'svg circle')[1];
      const steps = [0.7, 1.7, 2.7];
      let prog = 0;
      steps.forEach((s, i) => { if (t >= s) prog = i / 3 + (1 / 3) * inOut(P(t, s, 0.5)); });
      if (ring) ring.setAttribute('stroke-dasharray', `${prog.toFixed(4)} 1`);
      const n = t < 1.7 ? '٣' : t < 2.7 ? '٢' : '١';
      const span = h2 && $(h2, '.goldtext, span');
      if (span && span.textContent !== n) span.textContent = n;
      const since = t < 1.7 ? t - 0.6 : t < 2.7 ? t - 1.7 : t - 2.7;
      mv(h2, { o: P(t, 0.5, 0.3), s: lerp(1.18, 1, out3(clamp01(since / 0.35))) });
      enter($(c, '.sub'), t, 0.4, 0.6, 12);
      mv($(c, '.blackout'), { o: P(t, d - 0.45, 0.45) });
    },
    HB2(c, t) {
      mv($(c, '.flash'), { o: 1 - P(t, 0, 0.7) });
      const [h1, h2] = $$(c, '.headline');
      enter(h1, t, 0.2, 0.7, 18);
      drawArt($(c, '.art svg'), P(t, 0.15, 1.1));
      enter(h2, t, 1.0, 0.7, 18);
    },
    B1(c, t) {
      enter($(c, '.chip'), t, 0.05, 0.5, -14);
      reveal(words($(c, '.headline')), t, 0.3, 0.18, 0.6);
      enter($(c, '.sub'), t, 0.9, 0.7, 14);
      drawArt($(c, '.art svg'), P(t, 0.2, 1.2));
    },
    B2(c, t) {
      enter($(c, '.chip'), t, 0.05, 0.5, -14);
      reveal(words($(c, '.headline')), t, 0.3, 0.16, 0.7);
      mv($(c, '.art'), { o: lerp(1, 0.55, P(t, 0, 3)) });
    },
    B3(c, t) {
      enter($(c, '.chip'), t, 0.05, 0.5, -14);
      reveal(words($(c, '.headline')), t, 0.3, 0.13, 0.6);
      const svg = $(c, '.art svg');
      drawArt(svg, P(t, 0, 0.9));
      dropAndRipples(svg, t, 0.6);
    },
    B4(c, t, d) {
      const h = $(c, '.headline');
      mv(h, { o: out3(P(t, 0.15, 0.9)), s: lerp(0.93, 1, out3(P(t, 0.15, 1.6))) });
      const r = $(c, '.rings');
      if (r) { r.style.transformOrigin = '540px 860px'; mv(r, { o: P(t, 0, 0.9), s: lerp(0.88, 1.06, P(t, 0, d + 0.4)) }); }
      drift($(c, '.particles'), t, { fade: [0.1, 1.0], vy: -22, twinkle: 0.45 });
      enter($(c, '.sub'), t, 1.0, 0.7, 16);
    },
    B5(c, t) {
      reveal(words($(c, '.headline')), t, 0.15, 0.14, 0.55);
      pop($(c, '.btn-cta'), t, 0.9, 0.55, 0.85);
      enter($(c, '.url'), t, 1.2, 0.5, 10);
      enter($(c, '.wordmark'), t, 1.4, 0.6, 10);
    },
    T1(c, t) {
      enter($(c, '.chip'), t, 0.05, 0.5, -14);
      const taps = 12, t0 = 0.6, gap = 0.38;
      const k = Math.max(0, Math.min(taps, Math.floor((t - t0) / gap) + 1));
      const count = 21 + (t < t0 ? 0 : k);
      const cnt = $(c, '.tcount');
      const ar = String(count).replace(/\d/g, (x) => '٠١٢٣٤٥٦٧٨٩'[x]);
      if (cnt && cnt.textContent !== ar) cnt.textContent = ar;
      const since = t < t0 ? 1 : (t - t0) % gap;
      mv(cnt, { s: t >= t0 && k <= taps ? lerp(1.12, 1, out3(Math.min(1, since / 0.2))) : 1 });
      const ring = $(c, '.tring');
      const prev = 21 + Math.max(0, k - 1), frac = out3(Math.min(1, since / 0.18));
      if (ring) ring.setAttribute('stroke-dasharray', `${(lerp(t < t0 ? 21 : prev, count, t < t0 ? 1 : frac) / 33).toFixed(4)} 1`);
      const rp = $(c, '.tripple');
      if (rp) {
        rp.style.transformOrigin = '540px 900px';
        const q = t >= t0 ? Math.min(1, since / 0.35) : 1;
        rp.style.transform = `scale(${lerp(0.9, 1.22, out3(q)).toFixed(4)})`;
        rp.style.opacity = String(t >= t0 ? (1 - q) * 0.6 : 0);
      }
      const done = t0 + (taps - 1) * gap;
      const svg = $(c, '.tsvg');
      const shake = t > done && t < done + 0.5 ? Math.sin((t - done) * 70) * 10 * (1 - (t - done) / 0.5) : 0;
      if (svg) svg.style.transform = `translate(${shake.toFixed(2)}px, 0px)`;
      if (ring) ring.style.filter = `drop-shadow(0 0 ${t > done ? 30 : 14}px rgba(228,195,104,${t > done ? 0.9 : 0.6}))`;
      const subs = $$(c, '.sub');
      enter(subs[0], t, done + 0.15, 0.6, 14);
      enter(subs[1], t, done + 0.6, 0.6, 10);
      enter($(c, '.headline'), t, 0.2, 0.6, 12);
    },
    T2(c, t) { AN.L2C(c, t); },
    FP1(c, t) {
      reveal(words($(c, '.headline')), t, 0.15, 0.13, 0.5);
      const per = 1.75, s0 = 0.8;
      const th = $(c, '.fthread');
      if (th) th.style.transform = `scaleY(${inOut(P(t, s0, per * 4)).toFixed(4)})`;
      $$(c, '.fdot').forEach((el) => pop(el, t, s0 + Number(el.dataset.i) * per, 0.45, 0.2));
      $$(c, '.fname').forEach((el) => enter(el, t, s0 + Number(el.dataset.i) * per + 0.05, 0.5, 14));
      $$(c, '.fline').forEach((el) => enter(el, t, s0 + Number(el.dataset.i) * per + 0.35, 0.6, 10));
    },
    TZ(c, t) {
      wordmarkIn(c, t, 0.15);
      enter($(c, '.headline'), t, 1.2, 0.6, 18);
      enter($(c, '.sub'), t, 1.6, 0.6, 12);
      drift($(c, '.particles'), t, { fade: [0.2, 1.0], vy: -14, twinkle: 0.45 });
    },
  };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  const INIT = {
    HB1(c) { c.insertAdjacentHTML('beforeend', '<div class="blackout" style="position:absolute;inset:0;background:#000;opacity:0;z-index:20"></div>'); },
    HB2(c) { c.insertAdjacentHTML('beforeend', '<div class="flash" style="position:absolute;inset:0;background:#FFFDF6;z-index:20"></div>'); },
  };

  window.EXTRA_SCENES = S;
  window.EXTRA_ANIM = AN;
  window.EXTRA_INIT = INIT;
  window.EXTRA_CAM = { T1: 0, FP1: 0.01, HB1: 0.01, B4: 0.035, L1D: 0.03 };
})();
