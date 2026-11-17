/*
 * Alhamd organic kit — reels runtime.
 *
 * A reel is a list of scenes: { len, html, anim(t, el, c), sfx: [[t, sound, peakDb, params]] }.
 * Scene k starts at slots[k].start and stays on screen len + FADE seconds; the next scene
 * cross-fades in on top of it. Every frame is a pure function of time (seek(T)), so frames
 * render in any order and in parallel. Sounds come from promo-video/tools/sfx.py.
 */
(function () {
  const K = window.KIT;
  const FADE = 0.4;

  /* ---------- math ---------- */
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const P = (t, s, d) => clamp((t - s) / d);
  const out3 = (p) => 1 - Math.pow(1 - p, 3);
  const inOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const back = (p) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const lerp = (a, b, p) => a + (b - a) * p;
  const $ = (root, sel) => root.querySelector(sel);
  const $$ = (root, sel) => [...root.querySelectorAll(sel)];

  /* ---------- element helpers ---------- */
  function mv(el, { o, x = 0, y = 0, s = 1, r = 0 } = {}) {
    if (!el) return;
    if (el._base === undefined) { const tf = getComputedStyle(el).transform; el._base = tf && tf !== 'none' ? tf : ''; }
    if (o !== undefined) el.style.opacity = String(o);
    el.style.transform = `${el._base} translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
  }
  function enter(el, t, start, dur = 0.6, dy = 30) { const p = out3(P(t, start, dur)); mv(el, { o: p, y: (1 - p) * dy }); return p; }
  function fadeOut(el, t, start, dur = 0.5) { if (!el) return; el.style.opacity = String(1 - P(t, start, dur)); }
  function pop(el, t, start, dur = 0.5, from = 0.6) { const p = P(t, start, dur); mv(el, { o: clamp(p * 2.5), s: lerp(from, 1, back(p)) }); return p; }
  /** Splits an element's text into word spans once (gold gradient text stays whole). */
  function words(el) {
    if (!el) return [];
    if (el._words) return el._words;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach((tn) => {
      if (!tn.textContent.trim()) return;
      if (tn.parentElement.closest('.gold')) return;
      const frag = document.createDocumentFragment();
      tn.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
        else { const s = document.createElement('span'); s.className = 'word-s'; s.textContent = part; frag.appendChild(s); }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    el._words = [...$$(el, '.word-s'), ...$$(el, '.gold')];
    return el._words;
  }
  /** Word-by-word reveal; returns when the last word lands. */
  function reveal(el, t, start, { stagger = 0.16, dur = 0.5, dy = 18 } = {}) {
    const ws = words(el);
    ws.forEach((w, i) => { const p = out3(P(t, start + i * stagger, dur)); w.style.opacity = String(p); w.style.transform = `translateY(${((1 - p) * dy).toFixed(2)}px)`; });
    return start + ws.length * stagger + dur;
  }
  const wordCount = (html) => String(html).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  /** Seconds a viewer needs for a line: a beat to settle plus ~2.7 words a second. */
  const readTime = (html, base = 1.1, wps = 2.7) => base + wordCount(html) / wps;

  /** Strokes draw themselves (elements with pathLength="1"); fills fade in at the end. */
  function draw(svg, p, stagger = 0.4) {
    if (!svg) return;
    if (!svg._d) {
      const strokes = $$(svg, '[pathLength]').filter((e) => !e.closest('.m-halo'));
      strokes.forEach((e) => { if (!e.getAttribute('stroke-dasharray') && !e.closest('[stroke-dasharray]')) e.style.strokeDasharray = '1 1'; });
      svg._d = { strokes: strokes.filter((e) => !e.getAttribute('stroke-dasharray') && !e.closest('[stroke-dasharray]')), fills: $$(svg, '.fill'), halo: $$(svg, '.m-halo') };
    }
    const { strokes, fills, halo } = svg._d;
    const n = strokes.length;
    strokes.forEach((e, i) => { const s = n > 1 ? (i / (n - 1)) * stagger : 0; e.style.strokeDashoffset = String(1 - inOut(clamp((p - s) / (1 - stagger)))); });
    const fp = clamp((p - 0.6) / 0.4);
    fills.forEach((e) => { e.style.opacity = String(fp); });
    halo.forEach((e) => { e.style.opacity = String(0.35 * fp); });
  }
  /** Gold dust that drifts and twinkles. */
  function drift(svg, t, { fade = [0, 0.8], vy = -14, twinkle = 0.35, wob = 6, out = null } = {}) {
    if (!svg) return;
    if (!svg._pp) svg._pp = $$(svg, 'circle').map((c, i) => ({ c, o: parseFloat(c.getAttribute('opacity') || '1'), ph: (i * 2.399) % 6.283, sp: 0.55 + ((i * 37) % 100) / 110 }));
    const fi = P(t, fade[0], fade[1]) * (out ? 1 - P(t, out[0], out[1]) : 1);
    svg._pp.forEach(({ c, o, ph, sp }) => {
      const tw = 1 - twinkle + twinkle * (0.5 + 0.5 * Math.sin(t * 2.3 * sp + ph));
      c.style.opacity = String(o * fi * tw);
      c.style.transform = `translate(${(Math.sin(t * 1.3 + ph) * wob).toFixed(2)}px, ${(vy * t * sp).toFixed(2)}px)`;
    });
  }
  /** A slow push-in on a whole layer so still scenes breathe. */
  const breathe = (el, t, len, amt = 0.035) => { if (el) el.style.transform = `scale(${(1 + amt * clamp(t / (len + FADE))).toFixed(4)})`; };

  /* ---------- runtime ---------- */
  let R = null; // { c, scenes, slots, layers, total }
  async function setupReel({ id, f, th }) {
    const spec = K.REG[id];
    if (!spec || spec.kind !== 'reel') throw new Error(`not a reel: ${id}`);
    const c = K.makeCtx(f, th, { id, spec, reel: true });
    await K.loadFonts();
    const scenes = spec.scenes(c);
    let t = 0;
    const slots = scenes.map((s, k) => { const slot = { id: `s${k}`, start: +t.toFixed(3), len: +s.len.toFixed(3) }; t += s.len; return slot; });
    const total = +(t + FADE).toFixed(3);
    const root = K.mount(c, scenes.map((s, k) => `<div class="layer" data-k="${k}" style="display:none">${s.html}</div>`).join(''));
    const layers = $$(root, '.layer');
    await K.imagesReady(root);
    // fit each scene on its own (layers must be displayed to measure)
    for (const L of layers) { L.style.display = 'block'; K.fit(L); L.style.display = 'none'; }
    const cues = [];
    scenes.forEach((s, k) => (s.sfx || []).forEach((q) => cues.push([`s${k}`, ...q])));
    R = { c, scenes, slots, layers, total };
    return { w: c.W, h: c.H, total, slots, cues, fps: 30 };
  }
  function seek(T) {
    if (!R) return;
    const { scenes, slots, layers, c } = R;
    scenes.forEach((s, k) => {
      const L = layers[k];
      const lt = T - slots[k].start;
      const on = lt >= 0 && lt <= s.len + FADE + 1e-6;
      if (!on) { L.style.display = 'none'; return; }
      L.style.display = 'block';
      L.style.zIndex = String(k + 1);
      L.style.opacity = k === 0 ? '1' : String(inOut(P(lt, 0, FADE)));
      s.anim && s.anim(lt, L, c);
    });
  }

  Object.assign(K, { setupReel, seek, FADE });
  K.M = { clamp, P, out3, inOut, back, lerp, $, $$, mv, enter, fadeOut, pop, words, reveal, wordCount, readTime, draw, drift, breathe, FADE };
})();
