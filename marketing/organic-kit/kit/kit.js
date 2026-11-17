/*
 * Alhamd organic kit — the engine.
 *
 * One definition per creative renders at every format and in both themes:
 *   kit.html?id=NB-15&f=story&th=layl        (one still)
 *   kit.html?id=NR-15&f=story&th=nahar&t=3.2 (one frame of a reel)
 * The renderers drive window.KIT.renderStill / setupReel / seek directly.
 *
 * Sizes are written for a 1080-wide canvas and scaled per format (c.px); text that does not
 * fit its box shrinks until it does (fit), so long blessings and small formats stay tidy.
 */
(function () {
  const A = window.ART;
  const IC = window.ICONS;
  const AR = (s) => String(s).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const stage = document.getElementById('stage');
  const Q = new URLSearchParams(location.search);

  /* ================= formats ================= */
  // safe: [top, right, bottom, left] in px — UI chrome of the platforms stays clear of text.
  const FORMATS = {
    story: { w: 1080, h: 1920, k: 1, safe: [250, 100, 330, 100], kind: 'tall', label: '٩:١٦', use: 'ستوري · حالة واتساب · صور تيك توك · ريلز' },
    portrait: { w: 1080, h: 1350, k: 1, safe: [100, 96, 96, 96], kind: 'portrait', label: '٤:٥', use: 'إنستجرام · فيسبوك · ثريدز · لينكدإن · X' },
    grid: { w: 1080, h: 1440, k: 1, safe: [110, 96, 110, 96], kind: 'portrait', label: '٣:٤', use: 'شبكة إنستجرام الجديدة' },
    square: { w: 1080, h: 1080, k: 0.9, safe: [78, 86, 78, 86], kind: 'square', label: '١:١', use: 'كل المنصات · قناة واتساب · تيليجرام' },
    pin: { w: 1000, h: 1500, k: 0.95, safe: [100, 86, 100, 86], kind: 'portrait', label: '٢:٣', use: 'بنترست' },
    wide: { w: 1920, h: 1080, k: 1, safe: [96, 150, 96, 150], kind: 'wide', row: true, label: '١٦:٩', use: 'X · يوتيوب · تيليجرام · لينكدإن' },
    link: { w: 1200, h: 630, k: 0.62, safe: [54, 76, 54, 76], kind: 'wide', row: true, label: '١٫٩١:١', use: 'معاينة الروابط · فيسبوك · لينكدإن' },
    // brand, store, wallpapers, stickers
    avatar: { w: 1080, h: 1080, k: 1, safe: [0, 0, 0, 0], kind: 'square', label: '١:١', use: 'صورة الحساب (كل المنصات)' },
    hl: { w: 1080, h: 1920, k: 1, safe: [0, 0, 0, 0], kind: 'tall', label: '٩:١٦', use: 'غلاف القصص المميزة' },
    xhead: { w: 1500, h: 500, k: 0.62, safe: [40, 120, 40, 120], kind: 'banner', row: true, label: '١٥٠٠×٥٠٠', use: 'غلاف X' },
    fbcover: { w: 1640, h: 624, k: 0.72, safe: [60, 220, 60, 220], kind: 'banner', row: true, label: '١٦٤٠×٦٢٤', use: 'غلاف فيسبوك' },
    ytban: { w: 2560, h: 1440, k: 0.8, safe: [508, 507, 508, 507], kind: 'banner', row: true, label: '٢٥٦٠×١٤٤٠', use: 'غلاف يوتيوب (المنطقة الآمنة في الوسط)' },
    licover: { w: 1584, h: 396, k: 0.5, safe: [40, 160, 40, 160], kind: 'banner', row: true, label: '١٥٨٤×٣٩٦', use: 'غلاف لينكدإن' },
    tgcover: { w: 1280, h: 720, k: 0.66, safe: [60, 90, 60, 90], kind: 'wide', row: true, label: '١٢٨٠×٧٢٠', use: 'صورة مصغّرة ليوتيوب' },
    gpfeat: { w: 1024, h: 500, k: 0.56, safe: [44, 64, 44, 64], kind: 'banner', row: true, label: '١٠٢٤×٥٠٠', use: 'صورة المتجر الرئيسية' },
    gpshot: { w: 1080, h: 1920, k: 1, safe: [150, 80, 0, 80], kind: 'tall', label: '٩:١٦', use: 'لقطات Google Play' },
    wphone: { w: 1170, h: 2532, k: 1.08, safe: [700, 110, 380, 110], kind: 'tall', label: '١١٧٠×٢٥٣٢', use: 'خلفية آيفون' },
    wand: { w: 1080, h: 2400, k: 1, safe: [620, 100, 360, 100], kind: 'tall', label: '١٠٨٠×٢٤٠٠', use: 'خلفية أندرويد' },
    wdesk: { w: 2560, h: 1440, k: 1.1, safe: [160, 260, 220, 260], kind: 'wide', row: true, label: '٢٥٦٠×١٤٤٠', use: 'خلفية كمبيوتر' },
    sticker: { w: 512, h: 512, k: 0.474, safe: [16, 16, 16, 16], kind: 'square', label: '٥١٢×٥١٢', use: 'ملصق واتساب' },
    tray: { w: 96, h: 96, k: 0.09, safe: [0, 0, 0, 0], kind: 'square', label: '٩٦×٩٦', use: 'أيقونة حزمة الملصقات' },
  };

  /* ================= context ================= */
  function makeCtx(f, th, extra = {}) {
    const F = FORMATS[f];
    if (!F) throw new Error(`unknown format ${f}`);
    const c = { f, F, W: F.w, H: F.h, k: F.k, th, row: !!F.row, kind: F.kind, nahar: th === 'nahar', ...extra };
    c.px = (n) => Math.round(n * c.k * 10) / 10;
    /** pick({ story: 360, square: 220, portrait: 280 }, fallback) — by format, then kind, then fallback */
    c.pick = (map, def) => (map[f] !== undefined ? map[f] : map[F.kind] !== undefined ? map[F.kind] : def);
    c.safe = F.safe;
    return c;
  }

  /* ================= backgrounds ================= */
  let pid = 0;
  function lattice(op, ink, size) {
    const id = `lp${++pid}`;
    const a = size * 0.28, w = size * 0.44, m = size / 2;
    return `<svg xmlns="http://www.w3.org/2000/svg"><defs><pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><g fill="none" stroke="rgba(${ink},${op})" stroke-width="1.6"><rect x="${a}" y="${a}" width="${w}" height="${w}"/><rect x="${a}" y="${a}" width="${w}" height="${w}" transform="rotate(45 ${m} ${m})"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
  }
  const TONES = {
    layl: {
      night: 'linear-gradient(180deg, #0C0C1C 0%, #111126 52%, #0B0B1A 100%)',
      ground: 'linear-gradient(180deg, #15152A 0%, #121228 60%, #0E0E20 100%)',
      deep: 'linear-gradient(180deg, #08080F 0%, #0B0B18 50%, #060609 100%)',
      black: 'linear-gradient(180deg, #040407 0%, #06060B 100%)',
    },
    nahar: {
      night: 'linear-gradient(180deg, #F8F2E9 0%, #F4EDE3 55%, #ECE1D1 100%)',
      ground: 'linear-gradient(180deg, #F6EFE5 0%, #F1E8DB 60%, #E9DDCB 100%)',
      deep: 'linear-gradient(180deg, #E4DACC 0%, #DCD1C1 55%, #D3C6B4 100%)',
      black: 'linear-gradient(180deg, #D7CCBC 0%, #CFC3B1 100%)',
    },
  };
  /**
   * bg(c, { tone, pat, cone, coneAt, warm, warmAt, vignette })
   * tone: night | ground | deep | black — deep/black are the «absence» rooms.
   */
  function bg(c, { tone = 'night', pat = 0.05, cone = 0.075, coneAt = '50% 24%', warm = 0, warmAt = '50% 45%', vignette = true } = {}) {
    const size = Math.round(168 * Math.max(0.6, c.k));
    let s = `<div class="bgl" style="background:${TONES[c.th][tone] || tone}"></div>`;
    if (c.th === 'layl') {
      if (pat) s += `<div class="bgl">${lattice(pat, '237,237,245', size)}</div>`;
      if (cone) s += `<div class="bgl" style="background:radial-gradient(ellipse 62% 36% at ${coneAt}, rgba(237,237,245,${cone}), transparent 72%)"></div>`;
      if (warm) s += `<div class="bgl" style="background:radial-gradient(ellipse 58% 32% at ${warmAt}, rgba(228,195,104,${warm}), transparent 72%)"></div>`;
      if (vignette) s += `<div class="bgl" style="background:radial-gradient(ellipse 75% 60% at 50% 48%, transparent 55%, rgba(0,0,0,0.5) 100%)"></div>`;
    } else {
      const deep = tone === 'deep' || tone === 'black';
      if (pat) s += `<div class="bgl">${lattice(pat * (deep ? 0.8 : 1.1), '42,31,25', size)}</div>`;
      if (cone && !deep) s += `<div class="bgl" style="background:radial-gradient(ellipse 60% 38% at ${coneAt}, rgba(255,255,255,${Math.min(0.75, cone * 8)}), transparent 72%)"></div>`;
      if (warm) s += `<div class="bgl" style="background:radial-gradient(ellipse 55% 34% at ${warmAt}, rgba(212,112,79,${warm * 0.75}), transparent 72%)"></div>`;
      if (vignette) s += `<div class="bgl" style="background:radial-gradient(ellipse 80% 70% at 50% 50%, transparent 60%, rgba(110,80,50,${deep ? 0.2 : 0.12}) 100%)"></div>`;
    }
    return s;
  }

  /* ================= type ================= */
  const fs = (c, size) => c.px(size);
  /** A text element that shrinks with its box. */
  function T(c, cls, html, size, { extra = '', fit = true, tag = 'div', w } = {}) {
    const px = fs(c, size);
    return `<${tag} class="${cls}${fit ? ' fit' : ''}" data-fs="${px}" style="font-size:${px}px;${w ? `max-width:${c.px(w)}px;` : ''}${extra}">${html}</${tag}>`;
  }
  const title = (c, html, size = 100, o = {}) => T(c, 't-title', html, size, o);
  const display = (c, html, size = 140, o = {}) => T(c, 't-display', html, size, o);
  const quote = (c, html, size = 64, o = {}) => T(c, 't-quote', html, size, o);
  const body = (c, html, size = 44, o = {}) => T(c, 't-body', html, size, o);
  const kick = (c, html, size = 32, o = {}) => T(c, 't-kick', html, size, o);
  const small = (c, html, size = 28, o = {}) => T(c, 't-small', html, size, o);
  const verseT = (c, html, size = 76, o = {}) => T(c, 't-verse', html, size, o);
  const acc = (s) => `<span class="acc">${s}</span>`;
  const mut = (s) => `<span class="mut">${s}</span>`;
  const ltr = (s) => `<span class="ltr">${s}</span>`;
  const gold = (s) => `<span class="gold">${s}</span>`;
  const gap = (c, n) => `<div style="flex:0 0 auto;height:${c.px(n)}px;width:1px"></div>`;
  const grow = () => '<div style="flex:1 1 0;min-height:0"></div>';

  /* ================= pieces ================= */
  function chip(c, text, { size = 32, cls = '', extra = '' } = {}) {
    const p = c.px(size);
    return `<span class="chip ${cls} fit" data-fs="${p}" style="font-size:${p}px;padding:${(p * 0.36).toFixed(1)}px ${(p * 1.05).toFixed(1)}px ${(p * 0.46).toFixed(1)}px;${extra}">${text}</span>`;
  }
  /** Blessing icon in its ring. size in design px (scaled). */
  function medal(c, name, { size = 280, state = 'lit', sw, ring = true, cls = '', extra = '' } = {}) {
    const p = c.px(size);
    return `<div class="medal ${cls}" data-sz="${p}" style="width:${p}px;height:${p}px;${extra}">${IC.medal(name, { state, sw, ring })}</div>`;
  }
  function glyph(c, name, { size = 120, sw = 1.6, color = 'var(--accent)', extra = '' } = {}) {
    const p = c.px(size);
    return `<div class="glyph-w" data-sz="${p}" style="width:${p}px;height:${p}px;color:${color};flex:0 0 auto;${extra}">${IC.glyph(name, { sw })}</div>`;
  }
  /** UI icon from the app (home, compass, book, calendar, beads, shield, sparkle, share, timer). */
  const uicon = (c, name, size = 64, sw = 1.5, color = 'currentColor') => A.icon(name, color, c.px(size), sw);
  /** One of the large line-art drawings from the film (ART), in the current theme. */
  function art(c, fn, { w = 420, ratio = 700 / 600, glow = true, extra = '' } = {}) {
    const pw = c.px(w), ph = pw * ratio;
    const svg = A.withTheme(c.th === 'nahar' ? 'nahar' : 'layl', fn);
    return `<div class="art-w ${glow ? 'glow' : ''}" data-w="${pw}" data-h="${ph}" style="width:${pw}px;height:${ph}px;flex:0 0 auto;${extra}">${svg}</div>`;
  }
  const withTheme = (c, fn) => A.withTheme(c.th === 'nahar' ? 'nahar' : 'layl', fn);
  /** The wordmark and its thread; the dot sits on the right end (RTL start), per the icon spec. */
  function wm(c, size = 60, { word, line, abs = '' } = {}) {
    const S = c.px(size);
    const th = Math.max(2.5, S * 0.022), dot = S * 0.075, g = S * 0.1;
    return `<div class="wm" style="${abs}"><div class="w" style="font-size:${S}px;height:${S * 0.8}px;${word ? `color:${word}` : ''}">الحمد</div>` +
      `<div class="l" style="height:${dot}px;margin-top:${g}px;margin-inline:${S * 0.05}px ${S * 0.03}px"><i style="top:${(dot - th) / 2}px;height:${th}px;${line ? `background:${line}` : ''}"></i><b style="right:${-dot * 0.15}px;top:0;width:${dot}px;height:${dot}px;${line ? `background:${line}` : ''}"></b></div></div>`;
  }
  /** Signature: wordmark + address under it. */
  function sig(c, { size = 58, url = true, gapK = 0.36 } = {}) {
    return `<div class="slot" style="gap:${c.px(size * gapK)}px">${wm(c, size)}${url ? `<div class="t-small" style="font-size:${c.px(Math.max(24, size * 0.46))}px;font-weight:600"><span class="ltr">alhamd.app</span></div>` : ''}</div>`;
  }
  function cta(c, text, { size = 42, ghost = false, w, icon } = {}) {
    const p = c.px(size);
    return `<div class="cta ${ghost ? 'ghost' : ''} fit" data-fs="${p}" style="font-size:${p}px;height:${p * 2.45}px;padding:0 ${p * 1.25}px;${w ? `min-width:${c.px(w)}px;` : ''}">${icon ? uicon(c, icon, size * 0.95, 2, 'currentColor') : ''}<span>${text}</span></div>`;
  }
  /** The app's progress thread, growing leftward from the right dot. */
  function thread(c, { w = 420, pct = 1, head = true } = {}) {
    const W = c.px(w), d = Math.max(9, c.px(14)), g = W * pct;
    return `<div class="thread" style="width:${W}px;height:${d}px">` +
      `<div class="tr" style="top:${(d - 2) / 2}px"></div>` +
      (pct > 0 ? `<div class="go" style="width:${g}px;top:${(d - 4) / 2}px"></div>` : '') +
      `<div class="d0" style="width:${d}px;height:${d}px;top:0;right:${-d / 2}px"></div>` +
      (pct > 0 && head ? `<div class="hd" style="width:${d * 1.15}px;height:${d * 1.15}px;top:${-d * 0.075}px;right:${g - d * 0.575}px"></div>` : '') +
      `</div>`;
  }
  /** Carousel furniture: page number (top-left) and the thread (bottom). */
  function pager(c, i, n) {
    const [t, r, b, l] = c.safe;
    const num = `<div class="abs t-small" style="left:${l * 0.75}px;top:${Math.max(36, t * 0.55)}px;font-size:${c.px(30)}px;font-weight:600;direction:ltr">${AR(i)} / ${AR(n)}</div>`;
    const tw = c.W - l - r;
    const th = `<div class="abs" style="left:${l}px;bottom:${Math.max(30, b * 0.42)}px">${thread(c, { w: tw / c.k, pct: i / n })}</div>`;
    return num + th;
  }
  function swipe(c, text = 'اسحب') {
    const [t, r, b, l] = c.safe;
    return `<div class="abs t-kick" style="left:${l}px;bottom:${Math.max(70, b * 0.42 + c.px(44))}px;font-size:${c.px(34)}px;color:var(--accent)">${text} <span style="font-family:var(--sans)">←</span></div>`;
  }
  /** Phone mockup around a real app screen (dark screens in «ليل», light screens in «نهار»). */
  function phone(c, src, { w = 560, rotate = 0, scroll = 0, extra = '', cls = '' } = {}) {
    const W = c.px(w), pad = Math.round(W * 0.026), sw = W - pad * 2, sh = sw * (844 / 390), H = sh + pad * 2;
    const dir = c.th === 'nahar' ? 'app-light' : 'app';
    const k = sw / 390;
    // the outer box takes part in layout (and shrinks with fit); the drawing inside scales with it
    return `<div class="phone ${cls}" data-w="${W}" data-h="${H}" data-scale="1" style="width:${W}px;height:${H}px;transform:rotate(${rotate}deg);${extra}">` +
      `<div class="ph-in" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0;transform:scale(var(--ps,1))">` +
      `<div class="body" style="border-radius:${W * 0.155}px"></div>` +
      `<div class="screen" style="left:${pad}px;top:${pad}px;width:${sw}px;height:${sh}px;border-radius:${W * 0.13}px"><img src="../../promo-video/scenes/${dir}/${src}.png" style="transform:translateY(${(-scroll * k).toFixed(1)}px)" alt=""></div></div></div>`;
  }
  function sticker(c, label, { w = 760, h = 200, size = 30 } = {}) {
    return `<div class="sticker" style="width:${c.px(w)}px;height:${c.px(h)}px;font-size:${c.px(size)}px;padding:0 ${c.px(30)}px">${label}</div>`;
  }
  function opt(c, text, { w = 700, size = 38, filled = false } = {}) {
    const p = c.px(size);
    return `<div class="opt" style="width:${c.px(w)}px;height:${p * 2.3}px;font-size:${p}px;${filled ? 'background:var(--stroke);color:#fff;' : ''}">${text}</div>`;
  }
  function particles(c, o = {}) {
    const svg = withTheme(c, () => A.particles({ stageW: c.W, stageH: c.H, ...o }));
    return c.th === 'nahar' ? svg.replace(/drop-shadow\([^)]*\)/g, 'none') : svg;
  }
  const fadeB = (c, h, color, solid = 0.55) => { const col = color || (c.th === 'nahar' ? '#ECE1D1' : '#0B0B1A'); return `<div class="fade-b" style="height:${c.px(h)}px;background:linear-gradient(to bottom, ${col}00 0%, ${col} ${Math.round(solid * 100)}%, ${col} 100%)"></div>`; };

  /* ================= page layouts ================= */
  /**
   * page(c, { bg, top, mid, foot, side, sideW, over, under, gap, pad })
   *  column formats: top / mid (fit box) / foot, padded to the safe zone
   *  row formats:    text column (top, mid, foot) on the right, `side` (art) on the left
   */
  function page(c, { bg: bgo = {}, top = '', mid = '', foot = '', side = '', sideW = 0.4, over = '', under = '', gap: g = 40, pad, align = '' } = {}) {
    const [t, r, b, l] = pad || c.safe;
    const G = c.px(g);
    let s = (typeof bgo === 'string' ? bgo : bg(c, bgo)) + under;
    const col = (topH, midH, footH, extraCls = '') =>
      (topH ? `<div class="slot top">${topH}</div>` : '') +
      `<div class="box fitbox ${extraCls}"><div class="inner ${align}" style="gap:${G}px">${midH}</div></div>` +
      (footH ? `<div class="slot foot">${footH}</div>` : '');
    if (c.row && side) {
      const sw = Math.round((c.W - l - r) * sideW);
      s += `<div class="safe row" style="padding:${t}px ${r}px ${b}px ${l}px;gap:${c.px(70)}px">` +
        `<div class="side" style="flex:1 1 auto;gap:${G}px">${col(top, mid, foot)}</div>` +
        `<div class="side" style="flex:0 0 ${sw}px">${side}</div></div>`;
    } else {
      s += `<div class="safe" style="padding:${t}px ${r}px ${b}px ${l}px;gap:${G}px">${col(top, mid + (side && !c.row ? side : ''), foot)}</div>`;
    }
    return s + over;
  }

  /* ================= fitting ================= */
  function fitBox(box) {
    const inner = box.firstElementChild;
    if (!inner) return 1;
    const items = [...inner.querySelectorAll('[data-fs]'), ...(inner.matches('[data-fs]') ? [inner] : [])];
    const media = [...inner.querySelectorAll('[data-sz],[data-w]')];
    const apply = (s) => {
      items.forEach((el) => { el.style.fontSize = `${(+el.dataset.fs * s).toFixed(2)}px`; });
      media.forEach((el) => {
        const m = Math.max(s, 0.62);
        if (el.dataset.sz) { el.style.width = el.style.height = `${(+el.dataset.sz * m).toFixed(1)}px`; }
        if (el.dataset.w) { el.style.width = `${(+el.dataset.w * m).toFixed(1)}px`; el.style.height = `${(+el.dataset.h * m).toFixed(1)}px`; if (el.dataset.scale) el.style.setProperty('--ps', m.toFixed(4)); }
      });
    };
    const over = () => inner.scrollHeight > box.clientHeight + 1 || inner.scrollWidth > box.clientWidth + 1;
    let s = 1;
    apply(s);
    while (over() && s > 0.42) { s *= 0.95; apply(s); }
    return s;
  }
  function fit(root) {
    const out = [];
    root.querySelectorAll('.fitbox').forEach((b) => out.push(fitBox(b)));
    // single-line elements that must not wrap (chips, buttons) shrink to their container
    root.querySelectorAll('.chip.fit, .cta.fit').forEach((el) => {
      const host = el.parentElement;
      let s = 1;
      while (el.scrollWidth > host.clientWidth + 1 && s > 0.5) { s *= 0.95; el.style.fontSize = `${(+el.dataset.fs * s).toFixed(2)}px`; }
    });
    return out;
  }

  /* ================= registry & rendering ================= */
  const REG = {};
  /** def(id, { name, group, kind: 'still'|'reel', formats, themes, build(c) | scenes(c) }) */
  function def(id, spec) { REG[id] = { id, kind: 'still', themes: ['layl', 'nahar'], ...spec }; }

  let fontsReady = null;
  function loadFonts() {
    if (fontsReady) return fontsReady;
    const sample = 'الحمدُ لله ﴿بِسْمِ اللَّهِ﴾ ٠١٢٣٤٥٦٧٨٩ alhamd.app ←';
    const faces = ['700 100px Amiri', '400 100px Amiri', '400 80px "Amiri Quran"', '300 40px "IBM Plex Sans Arabic"', '400 40px "IBM Plex Sans Arabic"', '500 40px "IBM Plex Sans Arabic"', '600 40px "IBM Plex Sans Arabic"', '700 40px "IBM Plex Sans Arabic"'];
    fontsReady = Promise.all(faces.map((f) => document.fonts.load(f, sample))).then(() => document.fonts.ready);
    return fontsReady;
  }
  const imagesReady = (root) => Promise.all([...root.querySelectorAll('img')].map((i) => (i.complete && i.naturalWidth ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))));
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  function mount(c, inner, cls = '', clear = false) {
    stage.style.width = `${c.W}px`;
    stage.style.height = `${c.H}px`;
    document.documentElement.style.background = document.body.style.background = clear ? 'transparent' : '';
    stage.innerHTML = `<div class="cv th-${c.th} f-${c.f} ${cls}" style="width:${c.W}px;height:${c.H}px;${clear ? 'background:transparent' : ''}">${inner}</div>`;
    return stage.firstElementChild;
  }

  async function renderStill({ id, f, th }) {
    const spec = REG[id];
    if (!spec) throw new Error(`unknown creative ${id}`);
    const c = makeCtx(f, th, { id, spec });
    await loadFonts();
    const root = mount(c, spec.build(c), '', !!spec.transparent);
    await imagesReady(root);
    await frame();
    const scales = fit(root);
    await frame();
    return { w: c.W, h: c.H, scales };
  }

  window.KIT = {
    FORMATS, REG, def, makeCtx, renderStill, mount, fit, loadFonts, imagesReady, frame, AR,
    C: { bg, lattice, title, display, quote, body, kick, small, verseT, acc, mut, ltr, gold, gap, grow, chip, medal, glyph, uicon, art, withTheme, wm, sig, cta, thread, pager, swipe, phone, sticker, opt, particles, fadeB, page, T },
  };

  // URL mode, after every template file has registered its creatives
  window.addEventListener('load', async () => {
    const id = Q.get('id');
    if (!id) return;
    const f = Q.get('f') || 'portrait', th = Q.get('th') || 'layl';
    try {
      if (REG[id] && REG[id].kind === 'reel' && window.KIT.setupReel) {
        await window.KIT.setupReel({ id, f, th });
        window.KIT.seek(+(Q.get('t') || 0));
      } else {
        await renderStill({ id, f, th });
      }
    } catch (e) {
      stage.innerHTML = `<pre style="color:#f66;font-size:24px;padding:30px">${e.stack || e}</pre>`;
    }
    document.body.dataset.ready = '1';
  });
})();
