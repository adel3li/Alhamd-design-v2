/*
 * Alhamd — social, store, profile, shareable and print designs (no voice-over needed).
 * Open social.html?d=PST1 to see one design at its real size.
 * Two looks from the app itself: «ليل» (night: navy and gold) and «نهار» (day: cream, ink and terracotta).
 */
(function () {
  const A = window.ART;
  const K = window.SCENE_KIT;
  const { icon, sparkle, withTheme } = A;
  const stage = document.getElementById('stage');
  const q = new URLSearchParams(location.search);
  const AR = (s) => String(s).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

  const PAL = {
    layl: { text: '#EDEDF5', body: '#C7C4D8', muted: '#AEAECB', accent: '#E4C368', stroke: '#C8A951', hair: '#2E2E4A', card: 'rgba(30,30,56,0.72)', cardBorder: 'rgba(200,169,81,0.55)', cta: '#6C63FF', word: '#E4C368', line: '#C8A951', track: '#2E2E4A' },
    nahar: { text: '#2A1F19', body: '#4A3B32', muted: '#6B5A4E', accent: '#9E4A30', stroke: '#B9573B', hair: '#DCCFBE', card: '#FBF8F3', cardBorder: 'rgba(185,87,59,0.35)', cta: '#B9573B', word: '#2A1F19', line: '#B9573B', track: '#DCCFBE' },
  };
  let W = 1080, H = 1350, TH = 'layl';
  const p = () => PAL[TH];

  /* ---------------- backgrounds ---------------- */
  let pid = 0;
  function lattice(op, ink, size = 168) {
    const id = `sp${++pid}`;
    const a = size * 0.28, w = size * 0.44, m = size / 2;
    return `<svg class="bg-pattern" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><g fill="none" stroke="rgba(${ink},${op})" stroke-width="1.6"><rect x="${a}" y="${a}" width="${w}" height="${w}"/><rect x="${a}" y="${a}" width="${w}" height="${w}" transform="rotate(45 ${m} ${m})"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
  }
  function bgNahar({ pat = 0.055, glowAt = '50% 26%', warm = 0 } = {}) {
    return `<div class="bg-base" style="background:linear-gradient(180deg,#F8F2E9 0%,#F4EDE3 55%,#ECE1D1 100%)"></div>` +
      lattice(pat, '42,31,25') +
      `<div class="bg-base" style="background:radial-gradient(ellipse 60% 38% at ${glowAt}, rgba(255,255,255,0.6), transparent 72%)"></div>` +
      (warm ? `<div class="bg-base" style="background:radial-gradient(ellipse 55% 34% at 50% 50%, rgba(212,112,79,${warm}), transparent 72%)"></div>` : '') +
      `<div class="bg-base" style="background:radial-gradient(ellipse 80% 70% at 50% 50%, transparent 60%, rgba(110,80,50,0.12) 100%)"></div>`;
  }
  const bg = (o = {}) => (TH === 'layl' ? K.bg(o) : bgNahar(o));

  /* ---------------- type ---------------- */
  function tx(html, { x = 90, y = 0, w, size = 48, serif = true, weight, color, align = 'center', lh, extra = '' } = {}) {
    const width = w ?? W - 2 * x;
    return `<div class="tx" style="left:${x}px;top:${y}px;width:${width}px;font-family:${serif ? 'var(--serif)' : 'var(--sans)'};font-weight:${weight ?? (serif ? 700 : 400)};font-size:${size}px;line-height:${lh ?? (serif ? 1.48 : 1.7)};color:${color ?? p().text};text-align:${align};${extra}">${html}</div>`;
  }
  const acc = (s) => `<span style="color:${p().accent}">${s}</span>`;
  const mut = (s) => `<span style="color:${p().muted}">${s}</span>`;
  const ltr = (s) => `<span style="direction:ltr;unicode-bidi:isolate">${s}</span>`;

  /* ---------------- pieces ---------------- */
  function chip(text, y, { size = 34, x = null } = {}) {
    const pos = x === null ? 'left:50%;transform:translateX(-50%)' : `right:${x}px;transform:none`;
    return `<div class="chip" style="top:${y}px;${pos};font-size:${size}px">${text}</div>`;
  }
  function art(fn, { x, y, w, h, glow = true, o = 1 }) {
    const svg = withTheme(TH === 'nahar' ? 'nahar' : 'layl', fn);
    return `<div class="art ${TH === 'layl' && glow ? 'glow' : ''}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;opacity:${o}">${svg}</div>`;
  }
  const artC = (fn, { y, w, ratio = 700 / 600, glow, o }) => art(fn, { x: (W - w) / 2, y, w, h: w * ratio, glow, o });
  /** Wordmark with its thread; dot on the right end (RTL start), per the icon spec. */
  function wm(size, y, { cx = W / 2, word, line } = {}) {
    const th = Math.max(3, size * 0.022), dot = size * 0.075, gap = size * 0.1;
    return `<div class="abs" style="left:${cx}px;top:${y}px;transform:translateX(-50%);display:inline-flex;flex-direction:column;align-items:stretch">
      <div style="font-family:var(--serif);font-weight:700;font-size:${size}px;line-height:1;height:${size * 0.8}px;color:${word ?? p().word};white-space:nowrap">الحمد</div>
      <div style="position:relative;height:${dot}px;margin-top:${gap}px;margin-inline:${size * 0.05}px ${size * 0.03}px">
        <i style="position:absolute;left:0;right:0;top:${(dot - th) / 2}px;height:${th}px;border-radius:4px;background:${line ?? p().line}"></i>
        <b style="position:absolute;right:${-dot * 0.15}px;top:0;width:${dot}px;height:${dot}px;border-radius:50%;background:${line ?? p().line}"></b>
      </div></div>`;
  }
  /** Signature at the foot of a post: wordmark and the address. */
  const sig = (y, size = 56) => wm(size, y) + tx(ltr('alhamd.app'), { y: y + size * 1.05, size: 26, serif: false, weight: 500, color: p().muted });
  function cta(text, y, w = 640, size = 44) {
    return `<div class="abs" style="left:${(W - w) / 2}px;top:${y}px;width:${w}px;height:${size * 2.5}px;border-radius:${size * 0.75}px;background:${p().cta};color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--sans);font-weight:700;font-size:${size}px;box-shadow:0 22px 50px ${TH === 'layl' ? 'rgba(108,99,255,0.35)' : 'rgba(185,87,59,0.28)'}">${text}</div>`;
  }
  function qr(x, y, size, { fg = '#2A1F19', bgc = '#FBF8F3', quiet = 2 } = {}) {
    const n = window.QR.size, vb = n + quiet * 2;
    return `<svg class="abs" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:${size * 0.06}px" viewBox="${-quiet} ${-quiet} ${vb} ${vb}" shape-rendering="crispEdges"><rect x="${-quiet}" y="${-quiet}" width="${vb}" height="${vb}" fill="${bgc}"/><path d="${window.QR.path}" fill="${fg}"/></svg>`;
  }
  /** The app's progress thread, growing leftward from the right dot. */
  function thread(y, pct, { x1 = 150, x2 = W - 150 } = {}) {
    const w = x2 - x1, g = w * pct;
    return `<div class="abs" style="left:${x1}px;top:${y + 6}px;width:${w}px;height:2px;background:${p().track}"></div>` +
      `<div class="abs" style="left:${x2 - g}px;top:${y + 5}px;width:${g}px;height:4px;border-radius:4px;background:${p().line}"></div>` +
      `<div class="abs" style="left:${x2 - 7}px;top:${y}px;width:14px;height:14px;border-radius:50%;background:${p().line}"></div>` +
      (pct > 0 ? `<div class="abs" style="left:${x2 - g - 8}px;top:${y - 1}px;width:16px;height:16px;border-radius:50%;background:${p().accent};box-shadow:0 0 0 7px ${TH === 'layl' ? 'rgba(200,169,81,0.18)' : 'rgba(185,87,59,0.14)'}"></div>` : '');
  }
  /** Carousel furniture: page count at the top, thread progress at the foot. */
  const pager = (i, n) => tx(`${AR(i)} / ${AR(n)}`, { x: 70, y: 64, w: 200, size: 30, serif: false, weight: 600, color: p().muted, align: 'left', extra: 'direction:ltr' }) + thread(H - 92, i / n);
  const swipe = (y = H - 190) => tx(`اسحب <span style="font-family:var(--sans)">←</span>`, { x: 70, y, w: 300, size: 34, serif: false, weight: 600, color: p().accent, align: 'left' });
  const phone = (src, o) => K.phone({ src, ...o });
  const fade = (h, color) => `<div class="fade-bottom" style="height:${h}px;background:linear-gradient(to bottom, rgba(0,0,0,0), ${color} 85%)"></div>`;
  const panel = (x, y, w, h, r = 44) => `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;background:${p().card};border:2px solid ${p().cardBorder};box-shadow:${TH === 'layl' ? '0 30px 80px rgba(0,0,0,0.45)' : '0 24px 60px rgba(90,60,30,0.12)'}"></div>`;
  const pill = (text, x, y, w, { filled = false, size = 38 } = {}) =>
    `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${size * 2.3}px;border-radius:999px;border:2.5px solid ${p().stroke};background:${filled ? p().stroke : 'transparent'};color:${filled ? '#fff' : p().text};display:flex;align-items:center;justify-content:center;font-family:var(--sans);font-weight:600;font-size:${size}px">${text}</div>`;
  const dashed = (x, y, w, h, label) =>
    `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:36px;border:3px dashed ${p().stroke};display:flex;align-items:center;justify-content:center;font-family:var(--sans);font-weight:500;font-size:30px;color:${p().muted};background:${TH === 'layl' ? 'rgba(17,17,38,0.4)' : 'rgba(255,255,255,0.4)'}">${label}</div>`;
  const parts = (o) => (TH === 'layl' ? A.particles({ stageW: W, stageH: H, ...o }) : withTheme('nahar', () => A.particles({ stageW: W, stageH: H, ...o })).replace(/drop-shadow\([^)]*\)/, 'none'));
  const gold = (s) => `<span style="display:inline-block;padding:0.32em 0.12em;margin:-0.32em -0.12em;background:linear-gradient(180deg,#F8E3A3 0%,#E4C368 52%,#C29E45 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 28px rgba(228,195,104,0.45))">${s}</span>`;

  /* ---------------- registry ---------------- */
  const D = {};
  const def = (id, w, h, theme, build, meta = {}) => { D[id] = { w, h, theme, build, ...meta }; };

  const { windowArt, glassArt, callArt, stepsArt, breathArt, moonArt, houseArt, beadsArt, shieldArt } = A;
  const STEPS = [
    ['التهيئة والحضور', '١٠ ثوانٍ', 'خذ نفسًا عميقًا… وأحضر قلبك لحظة.'],
    ['تخيّل الغياب', '٢٠ ثانية', 'تتخيّل يومك وقد غابت النعمة عنه، لحظةً بلحظة.'],
    ['التعمّق', '٢٠ ثانية', 'تمضي أبعد: ما الذي كان سيتغيّر في قلبك وفي من حولك؟'],
    ['العودة', '١٥ ثانية', 'تفتح عينيك… فتجدها ما زالت بين يديك.'],
    ['الحمد', '١٥ ثانية', 'تحمد الله عليها بقلبٍ حاضر، لا بلسانٍ معتاد.'],
  ];
  const WATER = [
    ['التهيئة والحضور', 'اهدأ… وتذكَّر آخر شربة ماءٍ شربتها اليوم.', 'lit'],
    ['تخيّل الغياب', 'تخيَّل أنك أصبحتَ والصنبور جاف… والآبار غارت، ولا قطرة في المدينة كلها.', 'gone'],
    ['التعمّق', 'العطش يشتد ساعةً بعد ساعة… ومالُك كلُّه لا يشتري كوبًا واحدًا.', 'gone'],
    ['العودة', 'ثم عُد… افتح صنبورك الآن، الماء يجري بأمر الله، عذبًا باردًا.', 'lit'],
    ['الحمد', 'فقل من قلبك:<br>الحمدُ لله.', 'lit'],
  ];
  const SEVEN = [
    ['نعمة البصر', 'نافذتان صغيرتان… يدخل منهما العالمُ كلُّه إليك.', (s) => windowArt(s), 700 / 600],
    ['نعمة الماء', 'أرخصُ شيءٍ في بيتك… ولو غاب، ما اشتراه مالُك كلُّه.', (s) => glassArt(s, { cold: false }), 700 / 600],
    ['نعمة السمع', 'أولُ حاسةٍ تعمل فيك وأنت جنين… وبها وصلك صوتُ أمك وأذانُ الفجر.', (s) => callArt(s), 700 / 600],
    ['نعمة التنفّس', 'في كل دقيقةٍ تأخذ من الهواء ما لا تدفع فيه شيئًا… وفي كل نَفَسٍ نعمتان.', (s) => breathArt(s), 700 / 600],
    ['نعمة اليدين والقدمين', 'ثلاثمئةٌ وستون مفصلًا تتحرك بأمرك… وعلى كلِّ واحدٍ منها صدقة.', (s) => stepsArt(s), 760 / 600],
    ['نعمة النوم', 'كلَّ ليلةٍ تموت موتةً صغرى… ويردُّك اللهُ مع الفجر، كأن شيئًا لم يكن.', (s) => moonArt(s), 700 / 600],
    ['نعمة البيت والمأوى', 'أربعةُ جدرانٍ وسقف… سمّاها اللهُ سَكَنًا.', (s) => houseArt(s), 700 / 600],
  ];

  /* ===================== POSTS ===================== */
  def('PST1', 1080, 1350, 'layl', () =>
    bg({ cone: 0.08 }) + chip('نعمة اليوم', 96) +
    panel(70, 200, 940, 960) +
    chip('نعم الحياة والنفس', 250, { size: 30 }) +
    tx('نعمة الماء', { y: 330, size: 104 }) +
    tx('أرخصُ شيءٍ في بيتك… وأول شيءٍ يسأل عنه القرآنُ سؤالَ التحدي: من يأتيكم به؟', { x: 150, y: 500, size: 40, serif: false, color: p().body }) +
    artC((s) => glassArt('lit', { ripple: true, drop: true }), { y: 690, w: 360 }) +
    sig(1200), { name: 'بطاقة نعمة اليوم', fmt: '٤:٥' });

  def('PST2', 1080, 1080, 'nahar', () =>
    bg() +
    tx(`متى آخرُ مرّةٍ<br>حمدتَ اللهَ…<br>${acc('على كوبِ ماء؟')}`, { y: 96, size: 92, lh: 1.42 }) +
    artC(() => glassArt('lit', { ripple: true }), { y: 560, w: 270, glow: false }) +
    tx('اكتبها في التعليقات', { y: 896, size: 32, serif: false, weight: 500, color: p().muted }) +
    wm(52, 968), { name: 'سؤال', fmt: '١:١' });

  def('PST3', 1080, 1350, 'layl', () =>
    bg({ cone: 0.07 }) +
    art(() => shieldArt(), { x: 480, y: 150, w: 120, h: 136 }) +
    tx(`${acc('بلا حساب.')}<br>${acc('بلا إعلانات.')}<br>${acc('بلا سلاسل ولا ضغط.')}`, { y: 360, size: 104, lh: 1.6 }) +
    thread(880, 1, { x1: 420, x2: 660 }) +
    tx('وما تكتبه في سجلّك… لا يغادر جهازك.', { y: 940, size: 46, serif: false, weight: 500 }) +
    sig(1180), { name: 'الوعد', fmt: '٤:٥' });

  def('PST4', 1080, 1350, 'nahar', () => {
    let s = bg() + chip('استشعر النعمة', 80) + tx(`دقيقتان… ${acc('وخمس وقفات')}`, { y: 170, size: 86 });
    const top = 360, gap = 172, xr = W - 150;
    s += `<div class="abs" style="left:${xr - 1}px;top:${top + 18}px;width:3px;height:${gap * 4}px;background:${p().line}"></div>`;
    STEPS.forEach(([name, time, line], i) => {
      const y = top + i * gap, last = i === 4;
      s += `<div class="abs" style="left:${xr - (last ? 12 : 9)}px;top:${y + 10}px;width:${last ? 24 : 18}px;height:${last ? 24 : 18}px;border-radius:50%;background:${last ? p().accent : p().line};${last ? `box-shadow:0 0 0 8px rgba(185,87,59,0.14)` : ''}"></div>`;
      s += tx(`${last ? acc(name) : name} <span style="font-family:var(--sans);font-weight:500;font-size:28px;color:${p().muted}">${time}</span>`, { x: 120, y: y - 8, w: xr - 160, size: 50, align: 'right' });
      s += tx(line, { x: 120, y: y + 70, w: xr - 160, size: 34, serif: false, color: p().body, align: 'right', lh: 1.55 });
    });
    return s + sig(1210, 50);
  }, { name: 'الطريقة: خمس وقفات', fmt: '٤:٥' });

  def('PST5', 1080, 1350, 'layl', () =>
    bg({ cone: 0.06 }) +
    tx('سجلّ الحمد', { y: 90, size: 100 }) +
    tx('ما تكتبه يبقى على جهازك وحدك', { y: 250, size: 42, serif: false, color: p().muted }) +
    phone('tab_journal', { top: 380, width: 600 }) +
    `<div class="abs" style="left:96px;top:760px;display:flex;align-items:center;gap:14px;padding:16px 26px 18px;border-radius:999px;background:rgba(17,17,38,0.94);border:2px solid rgba(200,169,81,0.55);box-shadow:0 20px 50px rgba(0,0,0,0.5);transform:rotate(-4deg);z-index:5"><div style="width:34px;height:38px">${A.lockArt()}</div><span style="font-family:var(--sans);font-weight:600;font-size:32px;color:#E4C368">على جهازك فقط</span></div>` +
    fade(360, '#0B0B1A') + `<div style="position:absolute;inset:0;z-index:9">${sig(1222, 50)}</div>`, { name: 'ميزة: سجلّ الحمد', fmt: '٤:٥' });

  def('PST6', 1080, 1080, 'nahar', () =>
    bg() +
    artC(() => windowArt('lit', { color: '#2A1F19', sunColor: '#B9573B', hole: '#F7EEDC' }), { y: 70, w: 330, glow: false }) +
    tx(`نافذتان صغيرتان…<br>${acc('يدخل منهما العالمُ كلُّه إليك.')}`, { y: 500, size: 66, lh: 1.55 }) +
    tx('من «نعمة البصر» في تطبيق الحمد', { y: 760, size: 32, serif: false, color: p().muted }) +
    sig(880, 50), { name: 'اقتباس من التطبيق', fmt: '١:١' });

  /* ===================== CAROUSELS ===================== */
  // CA1 — the method, explained (day theme)
  def('CA1-1', 1080, 1350, 'nahar', () => {
    let s = bg() + chip('استشعر النعمة', 140) + tx(`ماذا يحدث في<br>${acc('دقيقتين')} مع «الحمد»؟`, { y: 250, size: 100, lh: 1.42 });
    s += tx('خمس وقفات… تأخذك كلَّ يوم إلى نعمةٍ واحدة.', { y: 560, size: 42, serif: false, color: p().body });
    const x2 = 930, x1 = 150, g = (x2 - x1) / 4;
    s += `<div class="abs" style="left:${x1}px;top:${812}px;width:${x2 - x1}px;height:3px;background:${p().line}"></div>`;
    STEPS.forEach(([n], i) => {
      const x = x2 - g * i;
      s += `<div class="abs" style="left:${x - 11}px;top:802px;width:22px;height:22px;border-radius:50%;background:${i === 4 ? p().accent : p().line}"></div>`;
      s += tx(n.split(' ')[0], { x: x - 100, y: 846, w: 200, size: 28, serif: false, weight: 600, color: p().body });
    });
    return s + swipe() + pager(1, 7);
  }, { name: 'الطريقة', fmt: '٤:٥', group: 'CA1' });
  STEPS.forEach(([name, time, line], i) => def(`CA1-${i + 2}`, 1080, 1350, 'nahar', () =>
    bg() +
    tx(AR(i + 1), { x: 640, y: 120, w: 340, size: 260, align: 'right', color: p().accent, lh: 1.1, extra: 'opacity:0.9' }) +
    tx(name, { y: 470, size: 96, x: 100, align: 'right' }) +
    `<div class="chip" style="top:640px;right:100px;left:auto;transform:none;font-size:32px">${time}</div>` +
    tx(line, { x: 100, y: 760, size: 66, align: 'right', weight: 400, lh: 1.6 }) +
    pager(i + 2, 7), { name: 'الطريقة', fmt: '٤:٥', group: 'CA1' }));
  def('CA1-7', 1080, 1350, 'nahar', () =>
    bg({ warm: 0.06 }) +
    tx(`كلَّ يومٍ نعمةٌ جديدة…<br>${acc('ودقيقتان تكفي.')}`, { y: 300, size: 92 }) +
    cta('ابدأ بنعمة اليوم', 640) +
    tx(ltr('alhamd.app'), { y: 800, size: 40, serif: false, weight: 600 }) +
    wm(80, 980) + pager(7, 7), { name: 'الطريقة', fmt: '٤:٥', group: 'CA1' });

  // CA2 — seven blessings we walk past (day theme)
  def('CA2-1', 1080, 1350, 'nahar', () => {
    let s = bg() + tx(`سبعُ نِعَمٍ…<br>تمرّ بها كلَّ يوم<br>${acc('ولا تلتفت.')}`, { y: 150, size: 98, lh: 1.42 });
    SEVEN.forEach(([, , fn, ratio], i) => {
      const row = i < 4 ? 0 : 1, col = row === 0 ? i : i - 4, perRow = row === 0 ? 4 : 3;
      const w = 150, gapX = 70, total = perRow * w + (perRow - 1) * gapX;
      const x = W - (W - total) / 2 - (col + 1) * w - col * gapX;
      s += art(() => fn('lit'), { x, y: 700 + row * 220, w, h: w * ratio, glow: false });
    });
    return s + swipe() + pager(1, 9);
  }, { name: 'سبع نِعَم', fmt: '٤:٥', group: 'CA2' });
  SEVEN.forEach(([name, line, fn, ratio], i) => def(`CA2-${i + 2}`, 1080, 1350, 'nahar', () =>
    bg() +
    tx(AR(i + 1), { x: 70, y: 120, w: 200, size: 120, align: 'left', color: p().accent, extra: 'opacity:0.35' }) +
    art(() => fn('lit'), { x: (W - 470) / 2, y: 170, w: 470, h: 470 * ratio, glow: false }) +
    tx(name, { y: 760, size: 96 }) +
    tx(line, { x: 130, y: 920, size: 44, serif: false, color: p().body, lh: 1.65 }) +
    pager(i + 2, 9), { name: 'سبع نِعَم', fmt: '٤:٥', group: 'CA2' }));
  def('CA2-9', 1080, 1350, 'nahar', () =>
    bg({ warm: 0.06 }) +
    tx(`واحدةٌ منها…<br>${acc('كلَّ يوم.')}`, { y: 230, size: 110 }) +
    tx('في «الحمد» نعمةٌ واحدة كلَّ يوم، ودقيقتان من التأمّل.', { y: 560, size: 42, serif: false, color: p().body }) +
    cta('ابدأ بنعمة اليوم', 720) +
    tx(ltr('alhamd.app'), { y: 880, size: 40, serif: false, weight: 600 }) +
    wm(76, 1040) + pager(9, 9), { name: 'سبع نِعَم', fmt: '٤:٥', group: 'CA2' });

  // CA3 — try it now: the five pauses of «نعمة الماء», one per slide (night theme)
  def('CA3-1', 1080, 1350, 'layl', () =>
    bg({ cone: 0.08 }) + chip('جرّبها الآن', 140) +
    tx(`دقيقتان…<br>${acc('مع نعمة الماء')}`, { y: 250, size: 108 }) +
    tx('اقرأ كل صفحة ببطء، ثم اسحب.', { y: 600, size: 42, serif: false, color: p().muted }) +
    artC(() => glassArt('lit', { ripple: true }), { y: 730, w: 330 }) +
    swipe() + pager(1, 7), { name: 'جرّبها الآن', fmt: '٤:٥', group: 'CA3' });
  WATER.forEach(([name, line, st], i) => def(`CA3-${i + 2}`, 1080, 1350, 'layl', () =>
    K.bg({ tone: st === 'gone' ? 'deep' : 'night', pat: st === 'gone' ? 0.022 : 0.05, cone: st === 'gone' ? 0.02 : 0.07, warm: i === 4 ? 0.1 : 0 }) +
    chip(name, 150) +
    tx(line, { x: 110, y: i === 4 ? 360 : 330, size: i === 4 ? 92 : 70, weight: i === 4 ? 700 : 400, lh: 1.7, color: i === 4 ? '#E4C368' : '#EDEDF5' }) +
    artC(() => glassArt(st === 'gone' ? 'gone' : 'lit', { ripple: i === 3 || i === 4 }), { y: 800, w: 260, glow: st !== 'gone' }) +
    (i === 4 ? parts({ n: 50, seed: 41, box: [80, 260, 920, 900], rmax: 6, omin: 0.15, omax: 0.8 }) : '') +
    pager(i + 2, 7), { name: 'جرّبها الآن', fmt: '٤:٥', group: 'CA3' }));
  def('CA3-7', 1080, 1350, 'layl', () =>
    bg({ cone: 0.08 }) +
    tx(`هذه دقيقتان من «الحمد»…<br>${acc('كلَّ يوم مع نعمةٍ جديدة.')}`, { y: 260, size: 80 }) +
    cta('ابدأ بنعمة اليوم', 640) +
    tx(ltr('alhamd.app'), { y: 800, size: 40, serif: false, weight: 600 }) +
    wm(80, 980) + pager(7, 7), { name: 'جرّبها الآن', fmt: '٤:٥', group: 'CA3' });

  // CA4 — a tour of the app (night theme, real screens)
  def('CA4-1', 1080, 1350, 'layl', () =>
    bg({ cone: 0.07 }) +
    tx(`خمسة أبواب…<br>${acc('وغايةٌ واحدة')}`, { y: 150, size: 104 }) +
    tx('جولة في تطبيق «الحمد»', { y: 480, size: 42, serif: false, color: p().muted }) +
    phone('home_top', { top: 640, width: 560 }) + fade(240, '#0B0B1A') + `<div style="position:absolute;inset:0;z-index:9">${swipe()}${pager(1, 6)}</div>`,
  { name: 'جولة في التطبيق', fmt: '٤:٥', group: 'CA4' });
  [['home_top', 'نعمة اليوم', 'نعمةٌ واحدة كلَّ يوم، بآيتها وتدبّرها.'],
    ['reflect_2_visualize', 'استشعر النعمة', 'دقيقتان من التأمّل، جملةً بعد جملة.'],
    ['tab_journal', 'سجلّ الحمد', 'دوِّن ما وجدته في قلبك… يبقى على جهازك.'],
    ['tab_tasbih', 'المسبحة وحصن المسلم', 'تسبيحٌ بلمسة، وأذكارٌ موثّقة.']].forEach(([src, title, line], i) => def(`CA4-${i + 2}`, 1080, 1350, 'layl', () =>
    bg({ cone: 0.06 }) +
    tx(title, { y: 110, size: 88 }) +
    tx(line, { y: 250, size: 40, serif: false, color: p().muted }) +
    phone(src, { top: 380, width: 600 }) + fade(260, '#0B0B1A') + `<div style="position:absolute;inset:0;z-index:9">${pager(i + 2, 6)}</div>`,
  { name: 'جولة في التطبيق', fmt: '٤:٥', group: 'CA4' }));
  def('CA4-6', 1080, 1350, 'layl', () =>
    bg({ cone: 0.08 }) +
    tx(`مجّانًا…<br>${acc('وبلا إعلانات.')}`, { y: 220, size: 110 }) +
    tx('نعمة اليوم والأذكار والتسبيح مجّانية دائمًا.', { y: 560, size: 42, serif: false, color: p().body }) +
    cta('جرّب «الحمد»', 720) +
    tx(ltr('alhamd.app'), { y: 880, size: 40, serif: false, weight: 600 }) +
    wm(76, 1040) + pager(6, 6), { name: 'جولة في التطبيق', fmt: '٤:٥', group: 'CA4' });

  // CA5 — why no streaks (day theme)
  const CA5 = [
    () => tx(`لماذا لا يعدّ<br>${acc('«الحمد» أيامك؟')}`, { y: 260, size: 108 }) + `<div class="abs" style="left:${(W - 150) / 2}px;top:640px">${icon('calendar', p().stroke, 150, 1.2)}</div>` + swipe(),
    () => tx(`لأن الشكر<br>عبادةُ قلب…<br>${acc('لا سباق.')}`, { y: 300, size: 110, lh: 1.45 }),
    () => tx(`لا نقاط، ولا شارات،<br>${acc('ولا أيامٌ «فائتة».')}`, { y: 380, size: 92 }),
    () => tx(`المداومة عندنا<br>${acc('محاسبةٌ للنفس')}`, { y: 330, size: 100 }) + tx('في تقويمٍ هجريٍّ هادئ، بلا عدّادٍ يلاحقك.', { y: 680, size: 42, serif: false, color: p().body }),
    () => tx(`ابدأ متى شئت…<br>${acc('بنعمة اليوم.')}`, { y: 260, size: 104 }) + cta('ابدأ بنعمة اليوم', 640) + tx(ltr('alhamd.app'), { y: 800, size: 40, serif: false, weight: 600 }) + wm(76, 980),
  ];
  CA5.forEach((f, i) => def(`CA5-${i + 1}`, 1080, 1350, 'nahar', () => bg() + f() + pager(i + 1, 5), { name: 'لماذا بلا سلاسل؟', fmt: '٤:٥', group: 'CA5' }));

  /* ===================== STORIES ===================== */
  def('ST1', 1080, 1920, 'layl', () =>
    bg({ cone: 0.07 }) + chip('سؤال اليوم', 300) +
    tx(`متى آخرُ مرّةٍ<br>حمدتَ اللهَ<br>${acc('على الماء؟')}`, { y: 420, size: 100, lh: 1.42 }) +
    artC(() => glassArt('lit', { ripple: true }), { y: 900, w: 280 }) +
    dashed(160, 1270, 760, 210, 'ملصق الاستطلاع: «اليوم» / «لا أذكر»') +
    wm(56, 1580), { name: 'استطلاع', fmt: '٩:١٦' });
  def('ST2', 1080, 1920, 'nahar', () =>
    bg() + chip('اختبار سريع', 300) +
    tx(`كم مرّةً<br>${acc('تتنفّس في اليوم؟')}`, { y: 420, size: 104 }) +
    artC(() => breathArt('lit'), { y: 700, w: 320, glow: false }) +
    pill('ألفي مرّة', 190, 1110, 700) + pill('عشرين ألف مرّة', 190, 1240, 700) + pill('مئتي ألف مرّة', 190, 1370, 700) +
    tx('الإجابة في القصة التالية', { y: 1530, size: 32, serif: false, color: p().muted }), { name: 'اختبار', fmt: '٩:١٦' });
  def('ST3', 1080, 1920, 'nahar', () => {
    let s = bg() + chip('#نعمة_اليوم', 300) + tx('نعمتي اليوم:', { x: 120, y: 430, size: 110, align: 'right' });
    for (let i = 0; i < 5; i++) s += `<div class="abs" style="left:120px;right:120px;top:${700 + i * 130}px;height:2px;background:${p().hair}"></div>`;
    s += `<div class="abs" style="left:120px;top:${640}px">${sparkle(30, 30, 26, p().stroke, 0.9).replace(/^/, '<svg width="60" height="60" viewBox="0 0 60 60">') + '</svg>'}</div>`;
    return s + tx('صوّرها… واكتب نعمتك في قصتك', { y: 1420, size: 38, serif: false, weight: 500, color: p().body }) + wm(56, 1560);
  }, { name: 'قالب «نعمتي اليوم»', fmt: '٩:١٦' });
  def('ST4', 1080, 1920, 'layl', () =>
    bg({ cone: 0.08 }) + chip('نعمة اليوم', 300) +
    tx('نعمة الماء', { y: 400, size: 116 }) +
    tx('أرخصُ شيءٍ في بيتك… ولو غاب، ما اشتراه مالُك كلُّه.', { x: 130, y: 590, size: 46, serif: false, color: p().body }) +
    artC(() => glassArt('lit', { ripple: true, drop: true }), { y: 800, w: 360 }) +
    `<div class="abs" style="left:${(W - 520) / 2}px;top:1330px;width:520px;height:110px;border-radius:999px;background:#fff;color:#2A2A40;display:flex;align-items:center;justify-content:center;gap:14px;font-family:var(--sans);font-weight:700;font-size:38px;box-shadow:0 20px 50px rgba(0,0,0,0.4)">${icon('share', '#6C63FF', 40, 2)}<span style="direction:ltr">alhamd.app</span></div>` +
    tx('دقيقتان معها في التطبيق', { y: 1470, size: 34, serif: false, color: p().muted }), { name: 'نعمة اليوم + رابط', fmt: '٩:١٦' });
  def('ST5', 1080, 1920, 'layl', () =>
    bg({ cone: 0.09, coneAt: '50% 34%' }) +
    parts({ n: 60, seed: 77, box: [40, 300, 1000, 1200], rmax: 6, omin: 0.15, omax: 0.8 }) +
    wm(220, 540) +
    tx('قريبًا', { y: 860, size: 120, color: '#E4C368' }) +
    tx(`على ${ltr('Google Play')}`, { y: 1050, size: 50, serif: false, weight: 500 }) +
    dashed(190, 1250, 700, 200, 'ملصق العدّ التنازلي'), { name: 'عدّ تنازلي للإطلاق', fmt: '٩:١٦' });

  /* ===================== PROFILE KIT ===================== */
  def('PRO1', 1080, 1080, 'layl', () =>
    `<div class="bg-base" style="background:#2A1F19"></div>` + wm(400, 330, { word: '#F4EDE3', line: '#D4704F' }), { name: 'صورة الحساب (بألوان أيقونة التطبيق)', fmt: '١:١' });
  def('PRO2', 1080, 1080, 'layl', () => bg({ cone: 0.08, coneAt: '50% 40%' }) + wm(400, 330), { name: 'صورة الحساب (ليل)', fmt: '١:١' });
  def('HL', 1800, 620, 'layl', () => {
    let s = bg({ cone: 0.04 });
    [['sparkle', 'نعمة اليوم'], ['compass', 'رحلتي'], ['book', 'سجل الحمد'], ['calendar', 'المداومة'], ['beads', 'المسبحة'], ['shield', 'خصوصيتك']].forEach(([ic, label], i) => {
      const cx = W - 180 - i * 288;
      s += `<div class="abs" style="left:${cx - 120}px;top:110px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle at 50% 40%, #1E1E3A, #111126 70%);border:3px solid #C8A951;display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(228,195,104,0.15)">${icon(ic, '#E4C368', 104, 1.4)}</div>`;
      s += tx(label, { x: cx - 140, y: 390, w: 280, size: 34, serif: false, weight: 600 });
    });
    return s;
  }, { name: 'أغلفة القصص المميزة', fmt: 'ستة أغلفة' });
  def('PRO4', 1500, 500, 'layl', () =>
    bg({ cone: 0.08, coneAt: '50% 40%' }) +
    art(() => windowArt('lit'), { x: 1240, y: 70, w: 230, h: 268, o: 0.45 }) +
    art(() => glassArt('lit', { cold: false }), { x: 40, y: 80, w: 220, h: 257, o: 0.45 }) +
    tx(`النعمة لا تُرى… ${acc('حتى تغيب')}`, { x: 250, y: 120, w: 1000, size: 84 }) +
    thread(285, 1, { x1: 640, x2: 860 }) +
    tx(ltr('alhamd.app'), { x: 250, y: 330, w: 1000, size: 30, serif: false, weight: 600, color: p().muted }), { name: 'غلاف X', fmt: '١٥٠٠×٥٠٠' });
  def('PRO5', 2560, 1440, 'layl', () =>
    bg({ cone: 0.07, coneAt: '50% 45%' }) +
    parts({ n: 90, seed: 9, box: [0, 0, 2560, 1440], rmax: 6, omin: 0.1, omax: 0.6 }) +
    art(() => windowArt('lit'), { x: 2120, y: 300, w: 360, h: 420, o: 0.35 }) +
    art(() => glassArt('lit', { cold: false }), { x: 80, y: 330, w: 340, h: 397, o: 0.35 }) +
    art(() => callArt('lit'), { x: 1840, y: 900, w: 300, h: 350, o: 0.25 }) +
    art(() => stepsArt('lit'), { x: 420, y: 880, w: 300, h: 380, o: 0.25 }) +
    wm(170, 545) +
    tx('نعمةٌ كلَّ يوم… ودقيقتان من التأمّل', { x: 500, y: 790, w: 1560, size: 50 }) +
    tx(ltr('alhamd.app'), { x: 500, y: 880, w: 1560, size: 30, serif: false, weight: 600, color: p().muted }), { name: 'غلاف يوتيوب', fmt: '٢٥٦٠×١٤٤٠' });
  def('PRO6', 1640, 624, 'nahar', () =>
    bg({ glowAt: '50% 40%' }) +
    art(() => houseArt('lit'), { x: 1310, y: 150, w: 280, h: 327, glow: false, o: 0.7 }) +
    art(() => moonArt('lit'), { x: 60, y: 150, w: 270, h: 315, glow: false, o: 0.7 }) +
    tx(`دقيقتان كلَّ يوم… ${acc('تُعيدان إليك النظر.')}`, { x: 330, y: 190, w: 980, size: 66 }) +
    wm(54, 360) + tx(ltr('alhamd.app'), { x: 330, y: 440, w: 980, size: 26, serif: false, weight: 600, color: p().muted }), { name: 'غلاف فيسبوك', fmt: '١٦٤٠×٦٢٤' });

  /* ===================== STORE & WEB ===================== */
  def('GP1', 1024, 500, 'layl', () =>
    bg({ cone: 0.08, coneAt: '70% 40%' }) +
    phone('home_top', { cx: 230, top: 60, width: 300, rotate: -6 }) + fade(110, '#0B0B1A') +
    `<div style="position:absolute;inset:0;z-index:9">${wm(120, 110, { cx: 700 })}${tx('نعمةٌ كلَّ يوم', { x: 450, y: 270, w: 500, size: 46 })}${tx('تطبيقٌ هادئ لتأمّل نِعَم الله', { x: 450, y: 350, w: 500, size: 28, serif: false, color: p().muted })}</div>`, { name: 'صورة المتجر الرئيسية', fmt: '١٠٢٤×٥٠٠' });
  [['home_top', 'نعمةٌ واحدة كلَّ يوم', 'بآيتها وتدبّرها'],
    ['reflect_2_visualize', 'دقيقتان من التأمّل', 'جملةً بعد جملة، بلا استعجال'],
    ['reflect_5_hamd', 'تحمد الله بقلبٍ حاضر', 'وتختم بدعاء اليوم'],
    ['tab_journal', 'سجلّ الحمد', 'لك وحدك، على جهازك'],
    ['tab_tasbih', 'المسبحة وحصن المسلم', 'أذكارٌ موثّقة وتلاوات هادئة'],
    ['tab_journey', 'رحلتك مع النِّعَم', 'محطّة بعد محطّة، بلا ضغط']].forEach(([src, title, sub], i) => def(`GP${i + 2}`, 1080, 1920, 'layl', () =>
    bg({ cone: 0.07 }) +
    tx(title, { y: 190, size: 96 }) +
    tx(sub, { y: 350, size: 44, serif: false, color: p().muted }) +
    phone(src, { top: 520, width: 780 }), { name: 'لقطات المتجر', fmt: '٩:١٦', group: 'GP' }));
  def('OG1', 1200, 630, 'layl', () =>
    bg({ cone: 0.08, coneAt: '65% 40%' }) +
    phone('home_top', { cx: 250, top: 70, width: 330, rotate: -5 }) + fade(120, '#0B0B1A') +
    `<div style="position:absolute;inset:0;z-index:9">${wm(130, 120, { cx: 810 })}${tx('نعمةٌ كلَّ يوم', { x: 520, y: 300, w: 580, size: 54 })}${tx('تطبيقٌ هادئ لتأمّل نِعَم الله', { x: 520, y: 395, w: 580, size: 30, serif: false, color: p().muted })}${tx(ltr('alhamd.app'), { x: 520, y: 460, w: 580, size: 28, serif: false, weight: 600 })}</div>`, { name: 'صورة مشاركة الرابط', fmt: '١٢٠٠×٦٣٠' });

  /* ===================== SHAREABLES ===================== */
  def('WP1', 1170, 2532, 'layl', () =>
    bg({ cone: 0.06, coneAt: '50% 58%' }) +
    parts({ n: 40, seed: 5, box: [80, 900, 1010, 1100], rmax: 5, omin: 0.1, omax: 0.6 }) +
    artC(() => glassArt('lit', { ripple: true }), { y: 1180, w: 470 }) +
    tx(`النعمةُ لا تُرى…<br>${acc('حتى تغيب.')}`, { y: 1820, size: 110 }) +
    wm(60, 2260), { name: 'خلفية: النعمة لا تُرى', fmt: 'شاشة قفل' });
  def('WP2', 1170, 2532, 'layl', () =>
    bg({ cone: 0.1, coneAt: '50% 62%', warm: 0.12, warmAt: '50% 62%' }) +
    `<svg class="abs" style="left:0;top:0;width:1170px;height:2532px" viewBox="0 0 1170 2532">${[[260, 0.2], [350, 0.13], [450, 0.08], [560, 0.05]].map(([r, o]) => `<circle cx="585" cy="1580" r="${r}" fill="none" stroke="#E4C368" stroke-opacity="${o}" stroke-width="2"/>`).join('')}</svg>` +
    parts({ n: 90, seed: 21, box: [40, 900, 1090, 1400], rmax: 7, omin: 0.15, omax: 0.9 }) +
    tx(gold('الحمدُ لله'), { y: 1400, size: 230, lh: 1.3 }) +
    tx('بقلبٍ حاضر… لا بلسانٍ معتاد.', { y: 1820, size: 60, weight: 400, color: p().body }) +
    wm(56, 2260), { name: 'خلفية: الحمد لله', fmt: 'شاشة قفل' });
  def('WP3', 1170, 2532, 'nahar', () =>
    bg({ glowAt: '50% 52%' }) +
    artC(() => houseArt('lit'), { y: 1100, w: 600, glow: false }) +
    tx(`كم نعمةً<br>${acc('مرّت بك اليوم؟')}`, { y: 1860, size: 112 }) +
    wm(56, 2290), { name: 'خلفية: كم نعمة؟', fmt: 'شاشة قفل' });
  def('WA1', 1080, 1080, 'layl', () =>
    bg({ cone: 0.08 }) + chip('نعمة اليوم', 70) +
    tx('نعمة البصر', { y: 170, size: 96 }) +
    tx('نافذتان صغيرتان… يدخل منهما العالمُ كلُّه إليك: وجوهُ الأحباب، والمصحف، والسماء.', { x: 130, y: 330, size: 40, serif: false, color: p().body }) +
    artC(() => windowArt('lit'), { y: 500, w: 330 }) +
    tx(`دقيقتان معها في ${ltr('alhamd.app')}`, { y: 920, size: 34, serif: false, weight: 600, color: p().accent }), { name: 'بطاقة واتساب', fmt: '١:١' });
  def('STK', 1600, 640, 'layl', () => {
    const checker = `<div class="bg-base" style="background:#3A3A52;background-image:linear-gradient(45deg,#33334A 25%,transparent 25%),linear-gradient(-45deg,#33334A 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#33334A 75%),linear-gradient(-45deg,transparent 75%,#33334A 75%);background-size:48px 48px;background-position:0 0,0 24px,24px -24px,-24px 0"></div>`;
    const die = (inner, x, y, w, h, r) => `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;background:#fff;box-shadow:0 18px 40px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;padding:14px">${inner}</div>`;
    const word = `<svg width="440" height="200" viewBox="0 0 440 200"><text x="220" y="128" text-anchor="middle" font-family="Amiri" font-weight="700" font-size="120" fill="#E4C368" stroke="#15152A" stroke-width="0" paint-order="stroke">الحمدُ لله</text><path d="M80,170 L350,170" stroke="#C8A951" stroke-width="5" stroke-linecap="round"/><circle cx="356" cy="170" r="9" fill="#C8A951"/></svg>`;
    return checker +
      die(`<div style="width:100%;height:100%;border-radius:40px;background:#15152A;display:flex;align-items:center;justify-content:center">${word}</div>`, 1060, 150, 480, 280, 56) +
      die(`<div style="width:100%;height:100%;border-radius:50%;background:#2A1F19;position:relative">${wm(120, 92, { cx: 140, word: '#F4EDE3', line: '#D4704F' })}</div>`, 700, 140, 300, 300, 150) +
      die(`<div style="width:100%;height:100%;border-radius:36px;background:#F4EDE3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px"><svg width="70" height="70" viewBox="0 0 60 60">${sparkle(30, 30, 26, '#B9573B', 1)}</svg><span style="font-family:var(--serif);font-weight:700;font-size:64px;color:#2A1F19;line-height:1">نعمة</span></div>`, 420, 160, 240, 260, 44) +
      die(`<div style="width:100%;height:100%;border-radius:30px;background:#F4EDE3;position:relative">${qr(30, 22, 180, {})}<div style="position:absolute;left:0;right:0;bottom:16px;text-align:center;font-family:var(--sans);font-weight:700;font-size:24px;color:#2A1F19;direction:ltr">alhamd.app</div></div>`, 120, 150, 240, 280, 40);
  }, { name: 'ملصقات', fmt: 'قصص وطباعة' });

  /* ===================== PRINT ===================== */
  def('PR1', 1240, 1754, 'nahar', () =>
    bg({ glowAt: '50% 30%' }) +
    wm(110, 100) +
    artC(() => windowArt('lit', { color: '#2A1F19', sunColor: '#B9573B', hole: '#F7EEDC' }), { y: 300, w: 470, glow: false }) +
    tx(`دقيقتان كلَّ يوم…<br>${acc('تُعيدان إليك النظر.')}`, { y: 880, size: 92 }) +
    tx('نعمةٌ واحدة كلَّ يوم، وتأمّلٌ هادئ.<br>مجّانًا، بلا حساب ولا إعلانات.', { y: 1140, size: 36, serif: false, color: p().body }) +
    qr((W - 250) / 2, 1320, 250, { bgc: '#FBF8F3' }) +
    tx('امسح وابدأ بنعمة اليوم', { y: 1590, size: 34, serif: false, weight: 600 }) +
    tx(ltr('alhamd.app'), { y: 1648, size: 30, serif: false, weight: 600, color: p().accent }), { name: 'ملصق مسجد / جامعة', fmt: 'A3' });
  def('PR2', 1100, 1900, 'nahar', () => {
    const card = (x, inner) => `<div class="abs" style="left:${x}px;top:120px;width:420px;height:1660px;border-radius:24px;background:#FBF8F3;box-shadow:0 30px 70px rgba(90,60,30,0.22);overflow:hidden">${inner}</div>`;
    const W0 = W; W = 420;
    const front = lattice(0.05, '42,31,25', 120) + wm(96, 110) +
      tx(`النعمةُ<br>لا تُرى…<br>${acc('حتى<br>تغيب.')}`, { x: 40, y: 380, w: 340, size: 86, lh: 1.5 }) +
      art(() => windowArt('lit', { color: '#2A1F19', sunColor: '#B9573B', hole: '#F7EEDC' }), { x: 110, y: 1200, w: 200, h: 233, glow: false });
    const back = lattice(0.05, '42,31,25', 120) +
      tx(`دقيقتان<br>${acc('مع نعمة اليوم')}`, { x: 30, y: 200, w: 360, size: 64 }) +
      qr(80, 560, 260, { bgc: '#FBF8F3' }) +
      tx(ltr('alhamd.app'), { x: 30, y: 850, w: 360, size: 32, serif: false, weight: 700 }) +
      tx('أهدِه لمن تحب', { x: 30, y: 1380, w: 360, size: 34, serif: false, color: p().muted }) + wm(60, 1470, { cx: 210 });
    W = W0;
    return `<div class="bg-base" style="background:#E6DACA"></div>` + card(600, front) + card(80, back) +
      tx('الوجه', { x: 600, y: 1800, w: 420, size: 28, serif: false, color: p().muted }) + tx('الظهر', { x: 80, y: 1800, w: 420, size: 28, serif: false, color: p().muted });
  }, { name: 'فاصل مصحف', fmt: '٥×٢٠ سم' });

  /* ---------------- render ---------------- */
  window.DESIGNS = D;
  window.DESIGN_IDS = Object.keys(D);
  const id = q.get('d') || 'PST1';
  const d = D[id];
  if (!d) { stage.innerHTML = `<div style="padding:40px;font-size:30px;color:#fff">Unknown design ${id}</div>`; return; }
  W = d.w; H = d.h; TH = d.theme;
  stage.style.width = `${W}px`;
  stage.style.height = `${H}px`;
  stage.className = TH;
  stage.innerHTML = d.build();
  const sample = 'الحمدُ لله ٠١٢٣٤٥٦٧٨٩ alhamd';
  const faces = ['700 100px Amiri', '400 100px Amiri', '400 40px "IBM Plex Sans Arabic"', '500 40px "IBM Plex Sans Arabic"', '600 40px "IBM Plex Sans Arabic"', '700 40px "IBM Plex Sans Arabic"'];
  void stage.offsetHeight;
  Promise.all(faces.map((f) => document.fonts.load(f, sample)))
    .then(() => document.fonts.ready)
    .then(() => Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))))
    .then(() => requestAnimationFrame(() => requestAnimationFrame(() => { document.body.dataset.ready = '1'; })));
})();
