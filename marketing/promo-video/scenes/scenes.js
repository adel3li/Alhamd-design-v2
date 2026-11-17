/*
 * Alhamd promo video — storyboard frames.
 * Open index.html?f=F01 to see one frame at full size (1080×1920, or 1080×1350 for 4:5).
 * Add &guides=1 to see the platform safe zones.
 */
(function () {
  const { C, windowArt, glassArt, callArt, stepsArt, breathArt, shieldArt, lockArt, particles, bez, rng } = window.ART;
  const stage = document.getElementById('stage');
  const q = new URLSearchParams(location.search);
  const fid = q.get('f') || 'F01';

  /* ---------------- building blocks ---------------- */
  let pid = 0;
  const pattern = (op = 0.05, size = 168) => {
    const id = `pat${++pid}`;
    const a = size * 0.28, w = size * 0.44, m = size / 2;
    return `<svg class="bg-pattern" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><g fill="none" stroke="rgba(237,237,245,${op})" stroke-width="1.6"><rect x="${a}" y="${a}" width="${w}" height="${w}"/><rect x="${a}" y="${a}" width="${w}" height="${w}" transform="rotate(45 ${m} ${m})"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
  };

  const TONES = {
    night: 'linear-gradient(180deg, #0C0C1C 0%, #111126 52%, #0B0B1A 100%)',
    ground: 'linear-gradient(180deg, #15152A 0%, #121228 60%, #0E0E20 100%)',
    deep: 'linear-gradient(180deg, #08080F 0%, #0B0B18 50%, #060609 100%)',
    black: 'linear-gradient(180deg, #040407 0%, #06060B 100%)',
  };

  function bg({ tone = 'night', pat = 0.05, cone = 0.075, coneAt = '50% 24%', warm = 0, warmAt = '50% 42%', vignette = true } = {}) {
    let s = `<div class="bg-base" style="background:${TONES[tone] || tone}"></div>`;
    if (pat) s += pattern(pat);
    if (cone) s += `<div class="bg-base" style="background:radial-gradient(ellipse 62% 36% at ${coneAt}, rgba(237,237,245,${cone}), transparent 72%)"></div>`;
    if (warm) s += `<div class="bg-base" style="background:radial-gradient(ellipse 58% 32% at ${warmAt}, rgba(228,195,104,${warm}), transparent 72%)"></div>`;
    if (vignette) s += `<div class="bg-vignette"></div>`;
    return s;
  }

  const H = (html, top, size, extra = '') => `<div class="headline" style="top:${top}px;font-size:${size}px;${extra}">${html}</div>`;
  const SUB = (html, top, size = 40, extra = '') => `<div class="sub" style="top:${top}px;font-size:${size}px;${extra}">${html}</div>`;
  const CAP = (html, top) => `<div class="caption"${top ? ` style="top:${top}px"` : ''}>${html}</div>`;
  const CHIP = (text, top, cls = '', extra = '') => `<div class="chip ${cls}" style="top:${top}px;${extra}">${text}</div>`;
  const ART = (svgStr, { x, y, w, h, cls = 'glow', extra = '' }) =>
    `<div class="art ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}">${svgStr}</div>`;
  const pool = (cx, cy, w = 520, h = 90, a = 0.22) =>
    `<div class="abs" style="left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px;background:radial-gradient(ellipse at center, rgba(228,195,104,${a}), transparent 70%)"></div>`;
  const FADE = (h = 460, color = '#0B0B1A') =>
    `<div class="fade-bottom" style="height:${h}px;background:linear-gradient(to bottom, rgba(11,11,26,0), ${color} 82%)"></div>`;
  // inline-block + padding so the gradient also covers harakat that sit above/below the line box
  const goldText = (txt) =>
    `<span style="display:inline-block;padding:0.32em 0.12em;margin:-0.32em -0.12em;background:linear-gradient(180deg,#F8E3A3 0%,#E4C368 52%,#C29E45 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 28px rgba(228,195,104,0.45))">${txt}</span>`;

  /** Progress thread: grows leftward from the right dot, like the app's ThreadProgress. */
  function threadBar({ y, x1 = 150, x2 = 930, pct = 0.5, dim = false }) {
    const w = x2 - x1;
    const gw = w * pct;
    let s = `<div class="thread" style="left:${x1}px;top:${y}px;width:${w}px">`;
    s += `<div class="track"${dim ? ' style="background:#24243C"' : ''}></div>`;
    if (!dim && pct > 0) s += `<div class="gold" style="width:${gw}px"></div>`;
    s += `<div class="dot" style="right:-7px;${dim ? 'background:#3B3B5E' : ''}"></div>`;
    if (!dim && pct > 0) s += `<div class="dot head" style="right:${gw - 7}px"></div>`;
    s += `</div>`;
    return s;
  }

  /** The five pauses of the reflection, as a labelled thread (RTL: step 1 on the right). */
  function stepsThread({ y, active = 1 }) {
    const labels = ['التهيئة', 'تخيّل الغياب', 'التعمّق', 'العودة', 'الحمد'];
    const x2 = 930, x1 = 150, gap = (x2 - x1) / 4;
    let s = `<div class="abs" style="left:${x1}px;top:${y + 6}px;width:${x2 - x1}px;height:2px;background:#2E2E4A"></div>`;
    const doneW = gap * (active - 1);
    if (doneW > 0) s += `<div class="abs" style="left:${x2 - doneW}px;top:${y + 5}px;width:${doneW}px;height:4px;border-radius:4px;background:var(--gold-deep)"></div>`;
    labels.forEach((t, i) => {
      const x = x2 - gap * i;
      const state = i + 1 < active ? 'done' : i + 1 === active ? 'on' : 'todo';
      const size = state === 'on' ? 22 : 14;
      const bgc = state === 'todo' ? '#15152A' : state === 'on' ? 'var(--gold)' : 'var(--gold-deep)';
      const border = state === 'todo' ? '2px solid #3B3B5E' : 'none';
      const glow = state === 'on' ? 'box-shadow:0 0 0 9px rgba(200,169,81,0.18),0 0 26px rgba(228,195,104,0.6);' : '';
      s += `<div class="abs" style="left:${x - size / 2}px;top:${y + 7 - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;background:${bgc};border:${border};${glow}"></div>`;
      const color = state === 'on' ? 'var(--gold)' : state === 'done' ? 'var(--body)' : '#6E6E92';
      s += `<div class="abs" style="left:${x - 110}px;width:220px;top:${y + 34}px;text-align:center;font-family:var(--sans);font-weight:${state === 'on' ? 700 : 500};font-size:28px;color:${color}">${t}</div>`;
    });
    return s;
  }

  /** Wordmark + thread, per the icon spec: thread 0.02·S, dot 0.075·S, thread ~0.2·S below the baseline. */
  function wordmark({ size = 240, top = 700, color = 'var(--gold)', line = 'var(--gold-deep)', gapK = 0.1 }) {
    const th = Math.max(3, size * 0.022);
    const dot = size * 0.075;
    const gap = size * gapK;
    return `<div class="wordmark" style="top:${top}px"><div class="wm">
      <div class="word" style="font-size:${size}px;color:${color};height:${size * 0.8}px">الحمد</div>
      <div class="line" style="height:${dot}px;margin-top:${gap}px;margin-inline:${size * 0.05}px ${size * 0.03}px">
        <i style="top:${(dot - th) / 2}px;height:${th}px;background:${line}"></i>
        <b style="right:${-dot * 0.15}px;top:0;width:${dot}px;height:${dot}px;background:${line}"></b>
      </div></div></div>`;
  }

  function phone({ src, cx = 540, top = 640, width = 600, rotate = 0, scroll = 0, z = 1, extra = '' }) {
    const pad = Math.round(width * 0.026);
    const screenW = width - pad * 2 - 4;
    const k = screenW / 390;
    return `<div class="phone" style="left:${cx - width / 2}px;top:${top}px;width:${width}px;padding:${pad}px;border-radius:${Math.round(width * 0.155)}px;transform:rotate(${rotate}deg);z-index:${z};${extra}">
      <div class="screen" style="border-radius:${Math.round(width * 0.13)}px"><img src="app/${src}.png" style="transform:translateY(${(-scroll * k).toFixed(1)}px)" alt=""></div>
    </div>`;
  }

  const TAP = (x, y) => `<div class="tap" style="left:${x - 75}px;top:${y - 75}px;transform:none"></div>`;

  /** 2×2 grid of the four everyday blessings (RTL order: start top-right). */
  function blessingGrid({ top = 560, state = 'dim', tile = 'on', fades = [1, 1, 1, 1] }) {
    const T = 360, G = 40, left = (1080 - (T * 2 + G)) / 2;
    const cells = [
      { x: left + T + G, y: top, art: (s) => windowArt(s), w: 270, h: 315 },
      { x: left, y: top, art: (s) => glassArt(s, { cold: false }), w: 270, h: 315 },
      { x: left + T + G, y: top + T + G, art: (s) => callArt(s), w: 280, h: 327 },
      { x: left, y: top + T + G, art: (s) => stepsArt(s), w: 262, h: 332 },
    ];
    return cells
      .map((c, i) => {
        const st = Array.isArray(state) ? state[i] : state;
        const o = fades[i];
        return `<div class="tile ${tile === 'off' ? 'off' : ''}" style="left:${c.x}px;top:${c.y}px;width:${T}px;height:${T}px;opacity:${o}"></div>` +
          ART(c.art(st), { x: c.x + (T - c.w) / 2, y: c.y + (T - c.h) / 2 + 4, w: c.w, h: c.h, cls: st === 'lit' ? 'glow-soft' : '', extra: `opacity:${o}` });
      })
      .join('');
  }

  /** The thread of beads: four blessings strung on one golden thread. */
  const BEAD_CURVE = [[1130, 690], [700, 560], [380, 1400], [-50, 1250]];
  function beads({ upto = 1, lit = [1, 1, 1, 1], r = 122, glowAll = true }) {
    const [p0, p1, p2, p3] = BEAD_CURVE;
    const d = `M${p0} C${p1} ${p2} ${p3}`;
    let s = `<svg class="abs" style="left:0;top:0;width:1080px;height:1920px;overflow:visible" viewBox="0 0 1080 1920">
      <path d="${d}" fill="none" stroke="rgba(228,195,104,0.18)" stroke-width="16" stroke-linecap="round" pathLength="1" stroke-dasharray="${upto} 1" style="filter:blur(6px)"/>
      <path d="${d}" fill="none" stroke="#E4C368" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="${upto} 1"/>
    </svg>`;
    const arts = [
      (st) => windowArt(st), (st) => glassArt(st, { cold: false }), (st) => callArt(st), (st) => stepsArt(st),
    ];
    [0.2, 0.4, 0.6, 0.8].forEach((t, i) => {
      const [x, y] = bez(p0, p1, p2, p3, t);
      const on = lit[i];
      if (on === 0) return;
      const st = on === 1 ? 'lit' : 'dim';
      const ring = on === 1 ? `border:4px solid #E4C368;box-shadow:0 0 0 10px rgba(200,169,81,0.10), 0 0 60px rgba(228,195,104,${glowAll ? 0.35 : 0.2}), inset 0 0 40px rgba(228,195,104,0.10)` : 'border:3px solid #3B3B5E';
      s += `<div class="abs" style="left:${x - r}px;top:${y - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;background:radial-gradient(circle at 50% 40%, #1C1C38, #111126 70%);${ring}"></div>`;
      const aw = i === 3 ? 150 : 162, ah = i === 3 ? 190 : 189;
      s += ART(arts[i](st), { x: x - aw / 2, y: y - ah / 2 + 2, w: aw, h: ah, cls: on === 1 ? 'glow-soft' : '' });
    });
    return s;
  }

  function constellation({ n = 54, seed = 7, H = 1920, avoid = null }) {
    const r = rng(seed);
    const pts = [];
    while (pts.length < n) {
      const x = 40 + r() * 1000, y = 120 + r() * (H - 240);
      if (avoid && x > avoid[0] && x < avoid[0] + avoid[2] && y > avoid[1] && y < avoid[1] + avoid[3]) continue;
      pts.push([x, y, 2 + Math.pow(r(), 2.4) * 7, 0.25 + r() * 0.7]);
    }
    let lines = '';
    pts.forEach((p, i) => {
      let best = null, bd = 1e9;
      pts.forEach((q2, j) => {
        if (j <= i) return;
        const dd = Math.hypot(p[0] - q2[0], p[1] - q2[1]);
        if (dd < bd) { bd = dd; best = q2; }
      });
      if (best && bd < 190) lines += `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${best[0].toFixed(1)}" y2="${best[1].toFixed(1)}" stroke="#C8A951" stroke-opacity="0.16" stroke-width="2"/>`;
    });
    const dots = pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${p[2].toFixed(1)}" fill="#E4C368" opacity="${p[3].toFixed(2)}"/>`).join('');
    return `<svg class="abs" style="left:0;top:0;width:1080px;height:${H}px;filter:drop-shadow(0 0 6px rgba(228,195,104,0.5))" viewBox="0 0 1080 ${H}">${lines}${dots}</svg>`;
  }

  const rings = (cx, cy, list) =>
    `<svg class="abs" style="left:0;top:0;width:1080px;height:1920px" viewBox="0 0 1080 1920">${list
      .map(([r, o, w = 2]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E4C368" stroke-opacity="${o}" stroke-width="${w}"/>`)
      .join('')}</svg>`;

  const beams = (top, h = 300) =>
    `<div class="abs" style="left:0;top:${top}px;width:1080px;height:${h}px;background:linear-gradient(180deg, rgba(228,195,104,0.16), rgba(228,195,104,0) 88%);clip-path:polygon(35% 0, 65% 0, 80% 100%, 20% 100%)"></div>`;

  /* ---------------- frames ---------------- */
  const F = {};

  // ===== Act 1 — The hook =====
  F.F01 = () =>
    bg({ cone: 0.08 }) +
    H('النعمةُ لا تُرى…', 250, 118) +
    pool(540, 1300, 560, 110, 0.2) +
    ART(glassArt('lit', { ripple: false }), { x: 250, y: 640, w: 580, h: 677 });

  F.F02 = () =>
    bg({ cone: 0.06 }) +
    H('<span class="m" style="opacity:0.5">النعمةُ لا تُرى…</span><br><span class="g">حتى تغيب.</span>', 250, 118) +
    ART(glassArt('dissolve'), { x: 250, y: 640, w: 580, h: 677, cls: 'glow-soft', extra: 'opacity:0.75' }) +
    particles({ n: 130, seed: 11, cluster: { x: 470, y: 790, sx: 330, sy: 300 }, rmin: 2, rmax: 9, omin: 0.15, omax: 0.95 });

  // ===== Act 2 — A day full of blessings =====
  F.F03 = () =>
    bg({ warm: 0.11, warmAt: '50% 44%' }) +
    CHIP('نعمة البصر', 290) +
    beams(1070, 250) +
    ART(windowArt('lit'), { x: 240, y: 430, w: 600, h: 700 }) +
    threadBar({ y: 1290, pct: 0.25 }) +
    CAP('تستيقظُ كلَّ صباحٍ فترى النور،');

  F.F04 = () =>
    bg({ warm: 0.06, warmAt: '50% 46%' }) +
    CHIP('نعمة الماء', 290) +
    pool(540, 1100, 560, 100, 0.22) +
    ART(glassArt('lit', { ripple: true, drop: true }), { x: 250, y: 410, w: 580, h: 677 }) +
    threadBar({ y: 1290, pct: 0.5 }) +
    CAP('وتشربُ ماءً باردًا،');

  F.F05 = () =>
    bg({ warm: 0.05, warmAt: '50% 40%' }) +
    CHIP('نعمة السمع', 290) +
    ART(callArt('lit'), { x: 240, y: 420, w: 600, h: 700 }) +
    threadBar({ y: 1290, pct: 0.75 }) +
    CAP('وتسمعُ صوتًا تحبّه،');

  F.F06 = () =>
    bg({ warm: 0.05, warmAt: '50% 36%' }) +
    CHIP('نعمة اليدين والقدمين', 290) +
    ART(stepsArt('lit'), { x: 250, y: 400, w: 580, h: 735 }) +
    threadBar({ y: 1290, pct: 1 }) +
    CAP('وتمشي على قدميك إلى حيث تشاء.');

  F.F07 = () =>
    bg({ cone: 0.04 }) +
    H('<span class="m">ولا تلتفت.</span>', 330, 116) +
    blessingGrid({ top: 590, state: 'dim' }) +
    threadBar({ y: 1440, dim: true });

  // ===== Act 3 — The insight =====
  F.F08 = () =>
    bg({ cone: 0.05 }) +
    `<div class="abs" style="right:200px;top:746px;width:3px;height:560px;background:var(--gold-deep);border-radius:3px"></div>
     <div class="abs" style="right:194px;top:746px;width:15px;height:15px;border-radius:50%;background:var(--gold-deep)"></div>
     <div class="abs" style="right:250px;left:90px;top:710px;text-align:right;font-family:var(--serif);font-weight:700;font-size:96px;line-height:1.6;color:var(--text)">
       فالنعمةُ إذا دامت<br>صارت عادة…
       <div style="height:40px"></div>
       <span style="color:var(--muted)">والعادةُ لا تُشكر.</span>
     </div>`;

  // ===== Act 4 — Absence =====
  F.F09 = () =>
    bg({ tone: 'deep', pat: 0.022, cone: 0.02 }) +
    H('فتخيّل… <span class="m">لو غابت.</span>', 330, 112) +
    blessingGrid({ top: 590, state: ['gone', 'gone', 'gone', 'dim'], tile: 'off', fades: [1, 1, 1, 0.55] });

  F.F10 = () =>
    bg({ tone: 'black', pat: 0.012, cone: 0, vignette: true }) +
    `<div class="abs" style="left:530px;top:950px;width:20px;height:20px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 12px rgba(200,169,81,0.10),0 0 46px rgba(228,195,104,0.55)"></div>`;

  // ===== Act 5 — Return, and Alhamd =====
  F.F11 = () =>
    bg({ cone: 0.05, warm: 0.05, warmAt: '70% 40%' }) +
    H('<span class="g">ثم عُد…</span>', 300, 130) +
    beads({ upto: 0.3, lit: [1, 2, 0, 0] }) +
    particles({ n: 26, seed: 5, cluster: { x: 860, y: 720, sx: 260, sy: 200 }, rmax: 6, omin: 0.2, omax: 0.8 });

  F.F12 = () =>
    bg({ cone: 0.07, warm: 0.07, warmAt: '50% 52%' }) +
    H('فتجدها<br><span class="g">ما زالت بين يديك.</span>', 250, 98) +
    beads({ upto: 1, lit: [1, 1, 1, 1] }) +
    particles({ n: 60, seed: 9, box: [60, 560, 960, 900], rmax: 6, omin: 0.15, omax: 0.8 });

  F.F13 = () =>
    bg({ cone: 0.1, coneAt: '50% 40%', warm: 0.13, warmAt: '50% 45%' }) +
    rings(540, 860, [[250, 0.2], [330, 0.13], [420, 0.08], [520, 0.05]]) +
    particles({ n: 90, seed: 21, box: [40, 300, 1000, 1200], rmax: 7, omin: 0.15, omax: 0.9 }) +
    H(goldText('الحمدُ لله'), 690, 210, 'line-height:1.3') +
    SUB('بقلبٍ حاضر… لا بلسانٍ معتاد.', 1060, 58, 'font-family:var(--serif);color:var(--body)');

  F.F14 = () =>
    bg({ cone: 0.08, coneAt: '50% 40%', warm: 0.05, warmAt: '50% 44%' }) +
    CHIP('نعمةٌ كلَّ يوم', 520) +
    wordmark({ size: 250, top: 680 }) +
    SUB('يُعيدُ إليك النظر.', 1150, 62, 'font-family:var(--serif);color:var(--text)');

  // ===== Act 6 — Inside the app =====
  F.F15 = () =>
    bg({ cone: 0.06 }) +
    H('كلَّ يومٍ… <span class="g">نعمةٌ واحدة</span>', 280, 94) +
    SUB('بآيتها، وتدبّرها، ودقيقتين من التأمّل', 440, 40, 'color:var(--muted)') +
    phone({ src: 'home_top', top: 590, width: 620 }) +
    FADE(430);

  F.F16 = () =>
    bg({ cone: 0.05 }) +
    phone({ src: 'home_card', top: 150, width: 800 }) +
    TAP(540, 1474) +
    FADE(330);

  F.F17 = () =>
    bg({ tone: 'deep', cone: 0.05 }) +
    H('دقيقتان… <span class="g">وخمس وقفات</span>', 250, 88) +
    stepsThread({ y: 430, active: 2 }) +
    phone({ src: 'reflect_2_visualize', top: 600, width: 620 }) +
    FADE(420, '#08080F');

  F.F18 = () =>
    bg({ cone: 0.06, warm: 0.08, warmAt: '50% 70%' }) +
    H('تحمدُ بعدها… <span class="g">بقلبٍ حاضر</span>', 250, 88) +
    stepsThread({ y: 430, active: 5 }) +
    phone({ src: 'reflect_5_hamd', top: 600, width: 620 }) +
    particles({ n: 40, seed: 33, box: [60, 620, 960, 900], rmax: 6, omin: 0.2, omax: 0.85 }) +
    FADE(420);

  F.F19 = () =>
    bg({ cone: 0.06 }) +
    H('سجلّ الحمد', 270, 100) +
    SUB('دوِّن ما وجدته في قلبك… يبقى لك وحدك', 430, 40, 'color:var(--muted)') +
    phone({ src: 'tab_journal', top: 580, width: 620 }) +
    `<div class="abs" style="left:96px;top:1030px;display:flex;align-items:center;gap:14px;padding:16px 26px 18px;border-radius:999px;background:rgba(17,17,38,0.92);border:2px solid rgba(200,169,81,0.55);box-shadow:0 20px 50px rgba(0,0,0,0.5);transform:rotate(-4deg);z-index:5">
       <div style="width:34px;height:38px">${lockArt()}</div>
       <span style="font-family:var(--sans);font-weight:600;font-size:32px;color:var(--gold)">على جهازك فقط</span>
     </div>` +
    FADE(400);

  F.F20 = () =>
    bg({ cone: 0.06 }) +
    H('مسبحةٌ وأذكار…<br><span class="g">ورحلةٌ مع النِّعم</span>', 210, 84) +
    SUB('المسبحة · حصن المسلم · رحلتي · المداومة', 470, 36, 'color:var(--muted)') +
    phone({ src: 'tab_journey', cx: 262, top: 700, width: 470, rotate: -8, z: 1 }) +
    phone({ src: 'tab_consistency', cx: 818, top: 700, width: 470, rotate: 8, z: 1 }) +
    phone({ src: 'tab_tasbih', cx: 540, top: 590, width: 560, z: 3 }) +
    FADE(420);

  F.F21 = () =>
    bg({ cone: 0.07, warm: 0.05, warmAt: '50% 60%' }) +
    H('وشارِكها…<br><span class="g">بصورةٍ جاهزة</span>', 220, 88) +
    phone({ src: 'share_modal_story', top: 590, width: 620 }) +
    `<div class="abs" style="left:610px;top:1040px;display:flex;align-items:center;gap:12px;padding:16px 28px 18px;border-radius:999px;background:var(--violet);box-shadow:0 20px 50px rgba(108,99,255,0.45);transform:rotate(4deg);z-index:6">
       <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/></svg>
       <span style="font-family:var(--sans);font-weight:700;font-size:32px;color:#fff">للقصص والمنشورات</span>
     </div>` +
    FADE(400);

  // ===== Act 7 — The promise and the call =====
  F.F22 = () =>
    bg({ cone: 0.06 }) +
    ART(shieldArt(), { x: 480, y: 330, w: 120, h: 136, cls: 'glow-soft' }) +
    H('<span class="g">بلا حساب.<br>بلا إعلانات.<br>بلا سلاسل ولا ضغط.</span>', 520, 100, 'line-height:1.62') +
    threadBar({ y: 1060, x1: 420, x2: 660, pct: 1 }) +
    SUB('وما تكتبه في سجلّك… لا يغادر جهازك.', 1120, 48, 'color:var(--text)');

  F.F23 = () =>
    bg({ cone: 0.06, coneAt: '50% 45%' }) +
    constellation({ n: 64, seed: 4, avoid: [120, 600, 840, 700] }) +
    H('كم نعمةً<br>مرّت بك اليوم؟', 640, 124, 'line-height:1.42') +
    H('<span class="g">ابدأ بواحدة.</span>', 1060, 96);

  F.F24 = () =>
    bg({ cone: 0.09, coneAt: '50% 34%', warm: 0.04, warmAt: '50% 36%' }) +
    CHIP('نعمةٌ كلَّ يوم', 400) +
    wordmark({ size: 220, top: 530 }) +
    SUB('تطبيقٌ هادئ لتأمّل نِعَم الله', 940, 52, 'font-family:var(--serif);color:var(--body)') +
    `<div class="btn-cta" style="top:1060px;width:700px;height:130px;font-size:52px">ابدأ بنعمة اليوم</div>` +
    `<div class="abs ltr" style="left:0;right:0;top:1236px;text-align:center;font-family:var(--sans);font-weight:600;font-size:58px;letter-spacing:1px;color:var(--text)">alhamd.app</div>` +
    SUB('مجّانًا · بالعربية الفصحى · بلا حساب', 1330, 34, 'color:var(--muted)') +
    CHIP('قريبًا على Google Play', 1410, 'muted', 'font-size:28px');

  // ===== Alternative hooks =====
  F.HB1 = () =>
    bg({ tone: 'black', pat: 0.015, cone: 0.03 }) +
    H('أغمض عينيك…', 400, 120) +
    `<svg class="abs" style="left:290px;top:710px;width:500px;height:500px" viewBox="0 0 500 500">
       <circle cx="250" cy="250" r="210" fill="none" stroke="#2E2E4A" stroke-width="7"/>
       <circle cx="250" cy="250" r="210" fill="none" stroke="#E4C368" stroke-width="9" stroke-linecap="round" pathLength="1" stroke-dasharray="0.333 1" transform="rotate(-90 250 250)" style="filter:drop-shadow(0 0 12px rgba(228,195,104,0.6))"/>
     </svg>` +
    H(goldText('٣'), 790, 230, 'line-height:1.25') +
    SUB('ثلاث ثوانٍ فقط… ثم افتحهما.', 1290, 46, 'color:var(--muted)');

  F.HB2 = () =>
    `<div class="bg-base" style="background:radial-gradient(circle at 50% 42%, #FFF8E8 0%, #F4EDE3 34%, #E8D3A6 60%, #B98F57 84%, #5A4330 100%)"></div>` +
    H('افتح عينيك…', 280, 112, 'color:#2A1F19') +
    ART(windowArt('lit', { color: '#2A1F19', sunColor: '#B9573B', hole: '#F7EEDC' }), { x: 240, y: 470, w: 600, h: 700, cls: '' }) +
    H('<span style="color:#9E4A30">هذا الضوءُ نعمة.</span>', 1240, 100);

  F.HC1 = () =>
    bg({ warm: 0.06, warmAt: '50% 70%' }) +
    H('متى آخرُ مرّةٍ<br>حمدتَ اللهَ…<br><span class="g">على كوبِ ماء؟</span>', 250, 98, 'line-height:1.5') +
    pool(540, 1345, 520, 100, 0.2) +
    ART(glassArt('lit', { ripple: true, drop: true }), { x: 280, y: 760, w: 520, h: 607 });

  F.HC2 = () =>
    bg({ warm: 0.05, warmAt: '50% 50%' }) +
    H('أرخصُ شيءٍ في بيتك…', 300, 100) +
    pool(540, 1080, 520, 100, 0.2) +
    ART(glassArt('lit', { ripple: false }), { x: 280, y: 500, w: 520, h: 607 }) +
    H('<span class="g">ولو غاب…<br>ما اشتراه مالُك كلُّه.</span>', 1180, 84, 'line-height:1.55');

  F.HD1 = () =>
    bg({ cone: 0.07, coneAt: '50% 38%' }) +
    rings(540, 760, [[260, 0.1], [360, 0.06]]) +
    // Amiri mis-places the harakat of «نَفَسٍ» at display sizes, so the line is phrased with «مرّة» / «تتنفّس».
    H(goldText('عشرون ألف مرّة'), 600, 136, 'line-height:1.3') +
    H('تتنفّس كلَّ يوم…', 860, 96) +
    ART(breathArt('lit'), { x: 360, y: 1160, w: 360, h: 420, cls: 'glow-soft', extra: 'opacity:0.5' });

  F.HD2 = () =>
    bg({ cone: 0.06, warm: 0.05 }) +
    ART(breathArt('lit'), { x: 200, y: 360, w: 680, h: 793, cls: 'glow' }) +
    H('بلا ثمن…<br><span class="g">كم مرّةً حمدتَ الله عليها؟</span>', 1060, 84, 'line-height:1.55');

  // ===== Formats =====
  F.COVER = () =>
    bg({ cone: 0.08, coneAt: '50% 30%' }) +
    H('النعمةُ لا تُرى…<br><span class="g">حتى تغيب.</span>', 380, 128, 'line-height:1.45') +
    ART(glassArt('dissolve'), { x: 300, y: 820, w: 480, h: 560, cls: 'glow-soft', extra: 'opacity:0.8' }) +
    particles({ n: 90, seed: 12, cluster: { x: 450, y: 900, sx: 280, sy: 240 }, rmax: 8, omin: 0.15, omax: 0.9 }) +
    wordmark({ size: 96, top: 1440 });

  F.P45A = () =>
    bg({ cone: 0.1, coneAt: '50% 38%', warm: 0.13, warmAt: '50% 40%' }) +
    rings(540, 560, [[240, 0.2], [320, 0.12], [410, 0.07], [510, 0.04]]) +
    particles({ n: 70, seed: 22, box: [40, 120, 1000, 900], rmax: 7, omin: 0.15, omax: 0.9, stageH: 1350 }) +
    H(goldText('الحمدُ لله'), 400, 200, 'line-height:1.3') +
    SUB('بقلبٍ حاضر… لا بلسانٍ معتاد.', 760, 56, 'font-family:var(--serif);color:var(--body)') +
    wordmark({ size: 84, top: 1090 });

  F.P45B = () =>
    bg({ cone: 0.06 }) +
    H('كلَّ يومٍ… <span class="g">نعمةٌ واحدة</span>', 110, 84) +
    SUB('بآيتها، وتدبّرها، ودقيقتين من التأمّل', 250, 38, 'color:var(--muted)') +
    phone({ src: 'home_top', top: 370, width: 560 }) +
    FADE(330);

  /* ---------------- render ---------------- */
  const build = F[fid];
  if (!build) {
    stage.innerHTML = `<div style="padding:80px;font-size:40px">Unknown frame ${fid}</div>`;
    return;
  }
  if (['P45A', 'P45B'].includes(fid)) stage.classList.add('r45');
  stage.innerHTML = build();

  if (q.get('guides') === '1') {
    const h = stage.offsetHeight;
    stage.insertAdjacentHTML('beforeend', `<div class="guides">
      <div class="g-top" style="left:0;right:0;top:0;height:220px"></div>
      <div class="g-bottom" style="left:0;right:0;bottom:0;height:${h > 1400 ? 380 : 120}px"></div>
      <div class="g-side" style="right:0;top:220px;width:120px;bottom:${h > 1400 ? 380 : 120}px"></div></div>`);
  }
  window.FRAME_IDS = Object.keys(F);
  // Google Fonts ships Arabic as a unicode-range subset, so load each face with Arabic sample text.
  const sample = 'الحمدُ لله ٠١٢٣٤٥٦٧٨٩ alhamd';
  const faces = [
    '700 100px Amiri', '400 100px Amiri', '400 60px "Amiri Quran"',
    '300 40px "IBM Plex Sans Arabic"', '400 40px "IBM Plex Sans Arabic"', '500 40px "IBM Plex Sans Arabic"',
    '600 40px "IBM Plex Sans Arabic"', '700 40px "IBM Plex Sans Arabic"',
  ];
  void stage.offsetHeight;
  Promise.all(faces.map((f) => document.fonts.load(f, sample)))
    .then(() => document.fonts.ready)
    .then(() => requestAnimationFrame(() => requestAnimationFrame(() => { document.body.dataset.ready = '1'; })));
})();
