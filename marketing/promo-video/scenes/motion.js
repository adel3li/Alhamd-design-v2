/*
 * Alhamd promo video — motion.
 *
 * Every scene from scenes.js becomes a layer; each layer has a pure function of its local
 * time t (seconds since the scene starts) that sets the state of its elements. Rendering a
 * frame is renderAt(T): no state carries over between frames, so frames can be rendered
 * in any order and in parallel.
 *
 *   setupMotion({ fade, slots: [{ id, start, len }] })  → Promise, resolves when fonts and images are ready
 *   renderAt(T)                                          → shows the film at T seconds
 */
(function () {
  const F = window.SCENES;
  const K = window.SCENE_KIT;
  const stage = document.getElementById('stage');

  /* ---------- math ---------- */
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const P = (t, s, d) => clamp((t - s) / d);
  const out3 = (p) => 1 - Math.pow(1 - p, 3);
  const inOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const inQ = (p) => p * p;
  const back = (p) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const lerp = (a, b, p) => a + (b - a) * p;
  const A0 = 0.3; // the voice line starts about here in every scene (after the cross-fade)

  /* ---------- element helpers ---------- */
  const $ = (root, sel) => root.querySelector(sel);
  const $$ = (root, sel) => [...root.querySelectorAll(sel)];

  /** The element's own transform (inline or from CSS), kept so animation adds to it. */
  function baseOf(el) {
    if (el._base === undefined) {
      const tf = getComputedStyle(el).transform;
      el._base = tf && tf !== 'none' ? tf : '';
    }
    return el._base;
  }
  function mv(el, { o, x = 0, y = 0, s = 1, r = 0 } = {}) {
    if (!el) return;
    if (o !== undefined) el.style.opacity = String(o);
    el.style.transform = `${baseOf(el)} translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
  }
  /** Fade + rise, the default entrance. */
  function enter(el, t, start, dur = 0.55, dy = 26) {
    const p = out3(P(t, start, dur));
    mv(el, { o: p, y: (1 - p) * dy });
    return p;
  }
  function pop(el, t, start, dur = 0.5, from = 0.6) {
    const p = P(t, start, dur);
    mv(el, { o: clamp(p * 2.5), s: lerp(from, 1, back(p)) });
    return p;
  }

  /** Splits a headline into word spans (once). Gold-gradient text stays whole. */
  function words(el) {
    if (!el) return [];
    if (el._words) return el._words;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach((tn) => {
      if (!tn.textContent.trim()) return;
      if (tn.parentElement.closest('[style*="background-clip"]')) return;
      const frag = document.createDocumentFragment();
      tn.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
        else {
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = part;
          frag.appendChild(s);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    el._words = $$(el, '.w');
    return el._words;
  }
  function reveal(ws, t, start, stagger = 0.12, dur = 0.5, dy = 22) {
    ws.forEach((w, i) => {
      const p = out3(P(t, start + i * stagger, dur));
      w.style.opacity = String(p);
      w.style.transform = `translateY(${((1 - p) * dy).toFixed(2)}px)`;
    });
  }

  /** Line art: strokes draw themselves, fills and text fade in after them. */
  function prepArt(svg) {
    if (svg._art) return svg._art;
    const strokes = [], fills = [], dashed = [], texts = [];
    $$(svg, 'path,line,ellipse,circle,rect,polyline,polygon').forEach((el) => {
      if (el.closest('defs,clipPath,.foot,.arc')) return;
      const sk = el.getAttribute('stroke');
      const sw = el.getAttribute('stroke-width');
      const fl = el.getAttribute('fill');
      if (sk && sk !== 'none' && sw !== '0') {
        if (el.getAttribute('stroke-dasharray')) dashed.push(el);
        else {
          el.setAttribute('pathLength', '1');
          el.style.strokeDasharray = '1 1';
          strokes.push(el);
        }
      }
      if (fl && fl !== 'none') fills.push({ el, fo: parseFloat(el.getAttribute('fill-opacity') || '1') });
    });
    $$(svg, 'text').forEach((el) => texts.push(el));
    return (svg._art = { strokes, fills, dashed, texts });
  }
  function drawArt(svg, p, stagger = 0.35) {
    if (!svg) return;
    const { strokes, fills, dashed, texts } = prepArt(svg);
    const n = strokes.length;
    strokes.forEach((el, i) => {
      const s = n > 1 ? (i / (n - 1)) * stagger : 0;
      el.style.strokeDashoffset = String(1 - inOut(clamp((p - s) / (1 - stagger))));
    });
    const fp = clamp((p - 0.5) / 0.5);
    fills.forEach(({ el, fo }) => { el.style.fillOpacity = String(fo * fp); });
    dashed.forEach((el) => { el.style.opacity = String(fp); });
    texts.forEach((el) => { el.style.opacity = String(fp); });
  }

  /** Gold dust that drifts and twinkles; positions come from the still frame. */
  function drift(svg, t, { fade = [0, 0.8], vx = 0, vy = -16, twinkle = 0.35, wob = 6, fadeOut = null } = {}) {
    if (!svg) return;
    if (!svg._pp) {
      svg._pp = $$(svg, 'circle').map((c, i) => ({
        c, o: parseFloat(c.getAttribute('opacity') || '1'), ph: (i * 2.399) % 6.283, sp: 0.55 + ((i * 37) % 100) / 110,
      }));
    }
    const fi = P(t, fade[0], fade[1]) * (fadeOut ? 1 - P(t, fadeOut[0], fadeOut[1]) : 1);
    svg._pp.forEach(({ c, o, ph, sp }) => {
      const tw = 1 - twinkle + twinkle * (0.5 + 0.5 * Math.sin(t * 2.3 * sp + ph));
      c.style.opacity = String(o * fi * tw);
      c.style.transform = `translate(${(vx * t * sp + Math.sin(t * 1.3 + ph) * wob).toFixed(2)}px, ${(vy * t * sp).toFixed(2)}px)`;
    });
  }

  /** The progress thread under the blessings: grows leftward from the right dot. */
  function threadTo(c, t, from, to, start = 0.15, dur = 1.0) {
    const th = $(c, '.thread');
    if (!th) return;
    const W = 780;
    const pct = lerp(from, to, inOut(P(t, start, dur)));
    const g = $(th, '.gold'), h = $(th, '.dot.head');
    if (g) g.style.width = `${W * pct}px`;
    if (h) h.style.right = `${W * pct - 7}px`;
  }
  const chipIn = (c, t, start = 0.05) => {
    const el = $(c, '.chip');
    const p = out3(P(t, start, 0.5));
    mv(el, { o: p, y: (p - 1) * 16 });
  };
  const caption = (c, t) => enter($(c, '.caption'), t, A0, 0.4, 14);
  const phoneByImg = (c, src) => $(c, `.phone[data-src="${src}"]`);

  /* ---------- per-scene setup (extra layers the animation needs) ---------- */
  const INIT = {
    F09(c) {
      c.insertAdjacentHTML('beforeend', `<div class="dimgrid">${K.blessingGrid({ top: 590, state: 'dim' })}</div><div class="darken" style="background:#000;opacity:0;z-index:20"></div>`);
    },
  };

  /* ---------- per-scene animation: (layer content, local time, scene length) ---------- */
  const ANIM = {
    F01(c, t) {
      drawArt($(c, '.art svg'), P(t, 0, 1.3));
      mv($(c, '.pool'), { o: P(t, 0.7, 0.8) });
      reveal(words($(c, '.headline')), t, A0, 0.18, 0.6);
    },
    F02(c, t, d) {
      const ws = words($(c, '.headline'));
      ws.forEach((w, i) => { if (i < 3) { w.style.opacity = '1'; w.style.transform = 'none'; } });
      reveal(ws.slice(3), t, A0, 0.16, 0.55);
      mv($(c, '.art'), { o: lerp(0.75, 0.2, inOut(P(t, 0.1, d))) });
      drift($(c, '.particles'), t, { fade: [0, 0.5], vx: -26, vy: -70, twinkle: 0.2, wob: 4 });
    },
    F03(c, t) {
      chipIn(c, t);
      const svg = $(c, '.art svg');
      drawArt(svg, P(t, 0, 1.4));
      const sun = svg && $(svg, '.sun');
      if (sun) sun.style.transform = `translate(0px, ${((1 - out3(P(t, 0.25, 1.8))) * 80).toFixed(2)}px)`;
      $$(svg, '.bird').forEach((b, i) => { b.style.transform = `translate(${(-t * (12 + i * 7)).toFixed(2)}px, ${(Math.sin(t * 3 + i) * 3).toFixed(2)}px)`; });
      mv($(c, '.beams'), { o: P(t, 0.8, 1.0) });
      threadTo(c, t, 0, 0.25);
      caption(c, t);
    },
    F04(c, t) {
      chipIn(c, t);
      const svg = $(c, '.art svg');
      drawArt(svg, P(t, 0, 1.0));
      mv($(c, '.pool'), { o: P(t, 0.5, 0.8) });
      const drop = svg && $(svg, '.drop');
      if (drop) {
        const fall = P(t, 0.25, 0.5), sink = P(t, 0.75, 0.25);
        const y = t < 0.75 ? lerp(-150, 0, inQ(fall)) : lerp(0, 205, inQ(sink));
        drop.style.transform = `translate(0px, ${y.toFixed(2)}px)`;
        drop.style.opacity = String(P(t, 0.25, 0.15) * (1 - P(t, 0.9, 0.12)));
      }
      $$(svg, '.ripple').forEach((r, k) => {
        r.style.transformOrigin = '300px 300px';
        if (t < 1.0) { r.style.opacity = '0'; return; }
        const q = ((t - 1.0) * 0.75 + k * 0.45) % 1;
        r.style.transform = `scale(${(0.35 + 0.9 * q).toFixed(3)})`;
        r.style.opacity = String((1 - q) * 0.9);
      });
      threadTo(c, t, 0.25, 0.5);
      caption(c, t);
    },
    F05(c, t) {
      chipIn(c, t);
      const svg = $(c, '.art svg');
      drawArt(svg, P(t, 0, 1.0));
      $$(svg, '.arc').forEach((a) => {
        const k = Number(a.dataset.k);
        const ph = t * 1.35 - k * 0.24;
        const q = ph - Math.floor(ph);
        a.style.opacity = String((1 - q) * 0.95 * P(t, 0.45, 0.4));
      });
      const btn = svg && $(svg, 'circle[r="34"]');
      if (btn) { btn.style.transformOrigin = '300px 484px'; btn.style.transform = `scale(${(1 + 0.07 * Math.sin(t * 7)).toFixed(3)})`; }
      threadTo(c, t, 0.5, 0.75);
      caption(c, t);
    },
    F06(c, t) {
      chipIn(c, t);
      const svg = $(c, '.art svg');
      drawArt(svg, P(t, 0, 1.1));
      $$(svg, '.foot').forEach((f) => {
        const k = Number(f.dataset.k);
        if (f._o === undefined) f._o = parseFloat(f.getAttribute('opacity') || '1');
        f.style.opacity = String(f._o * out3(P(t, 0.4 + k * 0.2, 0.25)));
      });
      threadTo(c, t, 0.75, 1);
      caption(c, t);
    },
    F07(c, t) {
      reveal(words($(c, '.headline')), t, A0, 0.16, 0.5);
      $$(c, '.tile').forEach((el) => {
        const i = Number(el.dataset.i);
        const p = out3(P(t, 0.05 + i * 0.08, 0.55));
        mv(el, { o: p, s: lerp(1.15, 1, p) });
      });
      $$(c, '.tile-art').forEach((el) => {
        const i = Number(el.dataset.i);
        const p = out3(P(t, 0.05 + i * 0.08, 0.55));
        mv(el, { o: p, s: lerp(1.15, 1, p) });
      });
      mv($(c, '.thread'), { o: P(t, 0.3, 0.6) });
    },
    F08(c, t, d) {
      mv($(c, '.vdot'), { o: P(t, 0, 0.3) });
      const v = $(c, '.vthread');
      if (v) v.style.transform = `scaleY(${inOut(P(t, 0.15, 1.7)).toFixed(4)})`;
      const lines = $$(c, '.story .ln');
      const speech = Math.max(1, d - 0.7);
      [A0, A0 + 0.3 * speech, A0 + 0.55 * speech].forEach((s, i) => enter(lines[i], t, s, 0.6, 20));
    },
    F09(c, t, d) {
      const ws = words($(c, '.headline'));
      const speech = Math.max(1, d - 0.6);
      reveal(ws.slice(0, 1), t, A0, 0.12, 0.5);
      reveal(ws.slice(1), t, A0 + 0.45 * speech, 0.14, 0.5);
      const dim = $(c, '.dimgrid');
      if (dim) {
        $$(dim, '[data-i]').forEach((el) => {
          const i = Number(el.dataset.i);
          el.style.opacity = String(1 - P(t, 0.35 + i * 0.32, 0.4));
        });
      }
      mv($(c, '.darken'), { o: 0.6 * P(t, d - 0.5, 0.9) });
    },
    F10(c, t) {
      const dot = $(c, '.cdot');
      const p = out3(P(t, 0.15, 0.5));
      mv(dot, { o: p, s: p * (1 + 0.12 * Math.sin(t * 3.4)) });
    },
    F11(c, t) {
      reveal(words($(c, '.headline')), t, A0, 0.2, 0.6);
      const upto = lerp(0, 0.3, inOut(P(t, 0, 1.1)));
      $$(c, '.bead-thread path').forEach((p) => p.setAttribute('stroke-dasharray', `${upto.toFixed(4)} 1`));
      [[0, 0.5], [1, 0.85]].forEach(([i, s]) => {
        pop($(c, `.bead[data-i="${i}"]`), t, s, 0.6, 0.7);
        pop($(c, `.bead-art[data-i="${i}"]`), t, s + 0.05, 0.6, 0.7);
      });
      drift($(c, '.particles'), t, { fade: [0.6, 0.8], vy: -10 });
    },
    F12(c, t) {
      reveal(words($(c, '.headline')), t, A0, 0.13, 0.55);
      const upto = lerp(0.3, 1, inOut(P(t, 0, 1.5)));
      $$(c, '.bead-thread path').forEach((p) => p.setAttribute('stroke-dasharray', `${upto.toFixed(4)} 1`));
      [0, 0.35, 0.75, 1.15].forEach((s, i) => {
        if (i === 0) { mv($(c, '.bead[data-i="0"]'), { o: 1 }); mv($(c, '.bead-art[data-i="0"]'), { o: 1 }); return; }
        pop($(c, `.bead[data-i="${i}"]`), t, s, 0.6, 0.6);
        pop($(c, `.bead-art[data-i="${i}"]`), t, s + 0.05, 0.6, 0.6);
      });
      drift($(c, '.particles'), t, { fade: [0.2, 1.0], vy: -12, twinkle: 0.5 });
    },
    F13(c, t, d) {
      const h = $(c, '.headline');
      const p = out3(P(t, A0 - 0.15, 0.9));
      mv(h, { o: p, s: lerp(0.93, 1, out3(P(t, A0 - 0.15, 1.6))) });
      const rings = $(c, '.rings');
      if (rings) { rings.style.transformOrigin = '540px 860px'; mv(rings, { o: P(t, 0, 0.9), s: lerp(0.88, 1.06, P(t, 0, d + 0.4)) }); }
      drift($(c, '.particles'), t, { fade: [0.1, 1.0], vy: -22, twinkle: 0.45 });
      enter($(c, '.sub'), t, A0 + 0.9, 0.7, 16);
    },
    F14(c, t, d) {
      chipIn(c, t);
      const word = $(c, '.wordmark .word');
      enter(word, t, 0.1, 0.7, 24);
      const line = $(c, '.wordmark .line i');
      if (line) { line.style.transformOrigin = 'right center'; line.style.transform = `scaleX(${inOut(P(t, 0.55, 0.8)).toFixed(4)})`; }
      pop($(c, '.wordmark .line b'), t, 0.45, 0.45, 0.2);
      enter($(c, '.sub'), t, A0 + 0.45 * Math.max(1, d - 0.6), 0.6, 16);
    },
    F15(c, t) {
      reveal(words($(c, '.headline')), t, A0, 0.13, 0.5);
      enter($(c, '.sub'), t, A0 + 0.5, 0.5, 14);
      const ph = $(c, '.phone');
      mv(ph, { o: P(t, 0, 0.3), y: lerp(460, 0, out3(P(t, 0, 1.0))) });
    },
    F16(c, t) {
      const ph = $(c, '.phone');
      const p = out3(P(t, 0, 0.9));
      mv(ph, { s: lerp(0.9, 1, p), y: lerp(90, 0, p) });
      const tap = $(c, '.tap');
      mv(tap, { o: P(t, 1.0, 0.1) * (1 - P(t, 1.5, 0.35)), s: lerp(0.45, 1.15, out3(P(t, 1.0, 0.6))) });
    },
    F17(c, t) {
      reveal(words($(c, '.headline')), t, A0, 0.14, 0.5);
      mv($(c, '.st-rail'), { o: P(t, 0.1, 0.4) });
      mv($(c, '.st-done'), { o: P(t, 0.1, 0.4) });
      $$(c, '.st-dot').forEach((el) => {
        const i = Number(el.dataset.i);
        if (el.dataset.state === 'on') pop(el, t, 0.65, 0.5, 0.3);
        else mv(el, { o: P(t, 0.15 + i * 0.06, 0.3) });
      });
      $$(c, '.st-label').forEach((el) => enter(el, t, 0.2 + Number(el.dataset.i) * 0.06, 0.4, 10));
      const ph = $(c, '.phone');
      const p = out3(P(t, 0.1, 0.8));
      mv(ph, { o: p, y: (1 - p) * 70 });
    },
    F18(c, t) {
      reveal(words($(c, '.headline')), t, A0, 0.14, 0.5);
      const done = $(c, '.st-done');
      if (done) done.style.transform = `scaleX(${lerp(0.25, 1, inOut(P(t, 0.25, 1.1))).toFixed(4)})`;
      $$(c, '.st-dot').forEach((el) => {
        const i = Number(el.dataset.i);
        if (el.dataset.state === 'on') pop(el, t, 1.25, 0.5, 0.3);
        else if (i >= 2) mv(el, { o: 0.35 + 0.65 * P(t, 0.25 + (i - 1) * 0.28, 0.2) });
      });
      drift($(c, '.particles'), t, { fade: [0.9, 0.8], vy: -18 });
    },
    F19(c, t) {
      reveal(words($(c, '.headline')), t, A0, 0.14, 0.5);
      enter($(c, '.sub'), t, A0 + 0.4, 0.5, 12);
      const ph = $(c, '.phone');
      const p = out3(P(t, 0, 0.9));
      mv(ph, { o: P(t, 0, 0.35), x: lerp(-260, 0, p) });
      pop($(c, '.pop'), t, 0.8, 0.5);
    },
    F20(c, t) {
      reveal(words($(c, '.headline')), t, A0, 0.13, 0.5);
      enter($(c, '.sub'), t, A0 + 0.5, 0.5, 12);
      const mid = phoneByImg(c, 'tab_tasbih');
      const pm = out3(P(t, 0, 0.8));
      mv(mid, { o: P(t, 0, 0.3), y: lerp(180, 0, pm) });
      const p = out3(P(t, 0.3, 0.9));
      [[phoneByImg(c, 'tab_journey'), -8, 278], [phoneByImg(c, 'tab_consistency'), 8, -278]].forEach(([el, rot, dx]) => {
        if (!el) return;
        el.style.opacity = String(P(t, 0.3, 0.3));
        el.style.transform = `translate(${lerp(dx, 0, p).toFixed(2)}px, ${lerp(-30, 0, p).toFixed(2)}px) rotate(${lerp(0, rot, p).toFixed(3)}deg)`;
      });
    },
    F21(c, t) {
      reveal(words($(c, '.headline')), t, A0, 0.14, 0.5);
      const ph = $(c, '.phone');
      const p = out3(P(t, 0, 0.8));
      mv(ph, { o: P(t, 0, 0.3), y: (1 - p) * 120 });
      pop($(c, '.pop'), t, 0.75, 0.5);
    },
    F22(c, t, d) {
      drawArt($(c, '.art svg'), P(t, 0, 0.9));
      const lines = $$(c, '.headline .ln');
      [A0, A0 + 0.7, A0 + 1.35].forEach((s, i) => enter(lines[i], t, s, 0.55, 22));
      const th = $(c, '.thread');
      if (th) { th.style.transformOrigin = 'right center'; mv(th, { o: P(t, A0 + 1.6, 0.3) }); th.style.transform = `scaleX(${inOut(P(t, A0 + 1.6, 0.6)).toFixed(4)})`; }
      enter($(c, '.sub'), t, A0 + 0.5 * Math.max(1.5, d - 0.6), 0.6, 14);
    },
    F23(c, t, d) {
      const svg = $(c, '.constellation');
      if (svg) {
        const dots = $$(svg, 'circle');
        const lines = $$(svg, 'line');
        dots.forEach((el, i) => {
          if (el._o === undefined) el._o = parseFloat(el.getAttribute('opacity') || '1');
          const p = P(t, 0.05 + (i / dots.length) * 1.8, 0.35);
          el.style.opacity = String(el._o * p * (0.75 + 0.25 * Math.sin(t * 2.5 + i)));
        });
        lines.forEach((el, i) => { el.style.opacity = String(P(t, 0.5 + (i / Math.max(1, lines.length)) * 1.8, 0.5)); });
      }
      const [h1, h2] = $$(c, '.headline');
      reveal(words(h1), t, A0, 0.15, 0.55);
      reveal(words(h2), t, A0 + 0.62 * Math.max(1, d - 0.6), 0.16, 0.55);
    },
    F24(c, t) {
      const chips = $$(c, '.chip');
      enter(chips[0], t, 0.05, 0.5, -12);
      enter($(c, '.wordmark .word'), t, 0.15, 0.7, 22);
      const line = $(c, '.wordmark .line i');
      if (line) { line.style.transformOrigin = 'right center'; line.style.transform = `scaleX(${inOut(P(t, 0.55, 0.7)).toFixed(4)})`; }
      const dot = $(c, '.wordmark .line b');
      const dp = P(t, 0.45, 0.4);
      mv(dot, { o: clamp(dp * 2.5), s: lerp(0.2, 1, back(dp)) * (t > 1.6 ? 1 + 0.12 * Math.sin((t - 1.6) * 3.2) : 1) });
      const subs = $$(c, '.sub');
      enter(subs[0], t, 0.8, 0.55, 14);
      pop($(c, '.btn-cta'), t, 1.15, 0.55, 0.85);
      enter($(c, '.url'), t, 1.45, 0.5, 12);
      enter(subs[1], t, 1.7, 0.5, 10);
      enter(chips[1], t, 1.9, 0.5, 10);
    },
  };
  /** Slow push-in on each scene (scale gained over the whole scene). */
  const CAM = { F10: 0, F16: 0, F24: 0.012, F13: 0.035 };

  /* ---------- timeline ---------- */
  let plan = null;
  const layers = [];

  async function ready() {
    const sample = 'الحمدُ لله ٠١٢٣٤٥٦٧٨٩ alhamd';
    const faces = [
      '700 100px Amiri', '400 100px Amiri', '400 60px "Amiri Quran"',
      '300 40px "IBM Plex Sans Arabic"', '400 40px "IBM Plex Sans Arabic"', '500 40px "IBM Plex Sans Arabic"',
      '600 40px "IBM Plex Sans Arabic"', '700 40px "IBM Plex Sans Arabic"',
    ];
    await Promise.all(faces.map((f) => document.fonts.load(f, sample)));
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return true;
  }

  window.setupMotion = (p) => {
    plan = p;
    stage.innerHTML = '';
    layers.length = 0;
    plan.slots.forEach((s, i) => {
      const L = document.createElement('div');
      L.className = 'layer';
      L.dataset.id = s.id;
      const cam = document.createElement('div');
      cam.className = 'cam';
      cam.innerHTML = F[s.id]();
      L.appendChild(cam);
      stage.appendChild(L);
      if (INIT[s.id]) INIT[s.id](cam);
      layers.push({ L, cam, s, i });
    });
    return ready();
  };

  window.renderAt = (T) => {
    const fade = plan.fade;
    const lastI = layers.length - 1;
    layers.forEach(({ L, cam, s, i }) => {
      const t = T - s.start;
      // the incoming scene fades in on top; the outgoing one stays solid underneath until covered
      let o = 0;
      if (t >= 0 && (i === lastI || t <= s.len + fade)) o = i === 0 ? 1 : P(t, 0, fade);
      L.style.opacity = String(o);
      L.style.visibility = o > 0 ? 'visible' : 'hidden';
      if (o <= 0) return;
      const fn = ANIM[s.id];
      if (fn) fn(cam, t, s.len);
      const cz = CAM[s.id] ?? 0.022;
      cam.style.transform = `scale(${(1 + cz * clamp(t / (s.len + fade))).toFixed(5)})`;
    });
  };
})();
