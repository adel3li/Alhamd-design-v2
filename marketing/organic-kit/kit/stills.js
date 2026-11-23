/*
 * Alhamd organic kit — still creatives (posts, carousels, stories, brand, store, wallpapers, stickers).
 * Every creative is defined once and renders at each of its formats in «ليل» and «نهار».
 *
 * IDs  NB blessing card · NP reflection question · ND duaa · PS single post · SV verse card ·
 *      CR carousel slide · TR "try it" carousel · ST story · CH challenge · CD countdown ·
 *      BR brand · GP store · WP wallpaper · SK sticker
 */
(function () {
  const K = window.KIT;
  const { def } = K;
  const { bg, title, display, quote, body, kick, small, verseT, acc, mut, ltr, gold, gap, chip, medal, glyph, uicon, art, wm, sig, cta, thread, pager, swipe, phone, sticker, opt, particles, fadeB, page, T } = K.C;
  const AR = K.AR;
  const CT = window.CONTENT;
  const B = CT.blessings;
  const BY = Object.fromEntries(B.map((b) => [b.n, b]));
  const ICON = window.ICONS.BY_BLESSING;
  const A = window.ART;
  const pad2 = (n) => String(n).padStart(2, '0');
  const iconOf = (n) => ICON[BY[n].id];

  /* ---------- formats per family ---------- */
  const F_POST = ['portrait', 'square', 'grid', 'story', 'pin', 'wide', 'link'];
  const F_CARD = ['story', 'square', 'portrait', 'grid', 'pin', 'wide'];
  const F_DAILY = ['story', 'square', 'portrait'];
  const F_SLIDE = ['portrait', 'story', 'square'];
  const F_STORY = ['story'];

  /* ---------- shared blocks ---------- */
  const medalSize = (c, m = 1) => c.pick({ story: 400, portrait: 290, grid: 330, square: 220, pin: 300, wide: 520, link: 300 }, 280) * m;
  const sideArt = (inner) => `<div class="slot" style="height:100%;justify-content:center">${inner}</div>`;
  const headSize = (c, base = 96) => c.pick({ story: base * 1.14, square: base * 0.9, pin: base * 0.96 }, base);
  const sigSize = (c) => c.pick({ story: 62, square: 50, link: 54 }, 56);

  /**
   * The workhorse single post: chip / visual / headline / sub / signature.
   * visual: { medal: name } | { glyph: name } | { art: fn, ratio } | { ui: iconName } | html string
   */
  function post(c, { chipText, visual, head, hs = 96, sub, ss = 42, note, foot, bgo, gapK = 1, visualSize = 1, footSig = true } = {}) {
    let vis = '';
    if (visual && visual.medal) vis = medal(c, visual.medal, { size: medalSize(c, 0.82 * visualSize) });
    else if (visual && visual.glyph) vis = glyph(c, visual.glyph, { size: medalSize(c, 0.62 * visualSize) });
    else if (visual && visual.art) vis = art(c, visual.art, { w: medalSize(c, 1.1 * visualSize), ratio: visual.ratio || 700 / 600, glow: visual.glow !== false });
    else if (visual && visual.ui) vis = `<div class="medal" data-sz="${c.px(medalSize(c, 0.62 * visualSize))}" style="width:${c.px(medalSize(c, 0.62 * visualSize))}px;height:${c.px(medalSize(c, 0.62 * visualSize))}px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:${Math.max(2, c.px(3))}px solid var(--stroke);box-shadow:0 0 0 ${c.px(12)}px var(--halo)">${uicon(c, visual.ui, medalSize(c, 0.3 * visualSize), 1.4, 'var(--accent)')}</div>`;
    else if (typeof visual === 'string') vis = visual;
    const words = (head ? title(c, head, headSize(c, hs)) : '') + (sub ? body(c, sub, c.pick({ story: ss * 1.1, square: ss * 0.92 }, ss), { w: 900 }) : '') + (note ? kick(c, note, 32, { extra: 'color:var(--accent)' }) : '');
    const top = chipText ? chip(c, chipText, { size: 32 }) : '';
    const ft = foot !== undefined ? foot : footSig ? sig(c, { size: sigSize(c) }) : '';
    if (c.row && vis) {
      return page(c, { bg: bgo || { cone: 0.06, coneAt: '62% 30%', warm: 0.06, warmAt: '24% 50%' }, top, mid: words, foot: ft, side: sideArt(vis), sideW: 0.36, gap: 26 * gapK });
    }
    return page(c, { bg: bgo || { cone: 0.07, coneAt: '50% 24%', warm: vis ? 0.06 : 0, warmAt: '50% 40%' }, top, foot: ft, mid: vis + words, gap: c.pick({ story: 40, square: 24 }, 30) * gapK });
  }

  /** Phone feature: headline at the top, the real app screen rising from the bottom edge. */
  function feature(c, { chipText, head, sub, screen, badge = '', scroll = 0, after = '' }) {
    const [t, r, b, l] = c.safe;
    const fadeTo = c.th === 'nahar' ? '#ECE1D1' : '#0B0B1A';
    if (c.row) {
      const pw = c.pick({ wide: 600, link: 560 }, 560);
      return bg(c, { cone: 0.06, coneAt: '62% 30%', warm: 0.06, warmAt: '24% 60%' }) +
        `<div class="safe row" style="padding:${t}px ${r}px 0 ${l}px;gap:${c.px(80)}px">` +
        `<div class="side" style="flex:1 1 auto;padding-bottom:${b}px;gap:${c.px(26)}px"><div class="box fitbox"><div class="inner" style="gap:${c.px(26)}px">${chipText ? chip(c, chipText) : ''}${title(c, head, 100)}${sub ? body(c, sub, 42, { w: 900 }) : ''}</div></div>${sig(c, { size: 54 })}</div>` +
        `<div class="side" style="flex:0 0 ${c.px(pw)}px;justify-content:flex-start;overflow:visible">${phone(c, screen, { w: pw, scroll })}</div></div>` + fadeB(c, 160, fadeTo) + badge;
    }
    const pw = c.pick({ story: 800, portrait: 610, grid: 660, square: 480, pin: 640 }, 600);
    const hs = c.pick({ story: 104, square: 80 }, 92);
    return bg(c, { cone: 0.06, coneAt: '50% 20%', warm: 0.05, warmAt: '50% 70%' }) +
      `<div class="safe" style="padding:${t}px ${r}px 0 ${l}px;gap:${c.px(c.pick({ story: 50, square: 22 }, 34))}px">` +
      `<div class="slot top" style="gap:${c.px(18)}px">${chipText ? chip(c, chipText) : ''}${title(c, head, hs, { fit: false })}${sub ? body(c, sub, c.pick({ square: 36 }, 40), { w: 900, fit: false }) : ''}${after}</div>` +
      `<div class="slot" style="flex:1 1 auto;min-height:0;justify-content:flex-start">${phone(c, screen, { w: pw, scroll })}</div></div>` +
      fadeB(c, c.pick({ story: 820, square: 330, pin: 560 }, 480), fadeTo, 0.6) + badge +
      `<div class="abs" style="left:0;right:0;bottom:${Math.max(b, c.px(60))}px;display:flex;justify-content:center">${sig(c, { size: sigSize(c) })}</div>`;
  }
  /** A pill that sits on top of a phone (e.g. «على جهازك فقط»). */
  const badgePill = (c, text, ic, { x = 0.1, y = 0.56, rot = -4 } = {}) =>
    `<div class="abs" style="left:${c.W * x}px;top:${c.H * y}px;display:flex;align-items:center;gap:${c.px(14)}px;padding:${c.px(16)}px ${c.px(26)}px ${c.px(18)}px;border-radius:999px;background:var(--chip-bg);border:2px solid var(--chip-b);box-shadow:var(--card-shadow);transform:rotate(${rot}deg);z-index:5;font-family:var(--sans);font-weight:600;font-size:${c.px(32)}px;color:var(--accent)">${uicon(c, ic, 36, 1.8, 'var(--accent)')}<span>${text}</span></div>`;

  /* ===================== NB — «نعمة اليوم» (40) ===================== */
  B.forEach((b) => {
    def(`NB-${pad2(b.n)}`, {
      name: `نعمة اليوم: ${b.title}`, group: 'NB', family: 'نعمة اليوم', formats: F_CARD,
      alt: `بطاقة «نعمة اليوم» من تطبيق الحمد: ${b.title}. ${b.opening}`,
      build(c) {
        const ic = ICON[b.id];
        const top = chip(c, 'نعمة اليوم', { size: c.pick({ story: 36 }, 32) });
        const words = kick(c, b.catLabel, c.pick({ story: 34 }, 30)) + title(c, b.title, c.pick({ story: 132, square: 96 }, 108)) + body(c, b.opening, c.pick({ story: 54, square: 42 }, 46), { w: 900 });
        if (c.row) {
          return page(c, { bg: { cone: 0.06, coneAt: '62% 30%', warm: 0.07, warmAt: '24% 50%' }, top, mid: words, foot: sig(c, { size: 54 }), gap: 26, side: sideArt(medal(c, ic, { size: medalSize(c) })), sideW: 0.36 });
        }
        return page(c, {
          bg: { cone: 0.07, coneAt: '50% 22%', warm: 0.07, warmAt: '50% 38%' },
          top, foot: sig(c, { size: sigSize(c) }),
          mid: medal(c, ic, { size: c.pick({ story: 470 }, medalSize(c)) }) + gap(c, c.pick({ story: 30, square: 0 }, 12)) + words,
          gap: c.pick({ story: 34, square: 18 }, 24),
        });
      },
    });
  });

  /* ===================== NP — reflection question of each blessing (40) ===================== */
  B.forEach((b) => {
    const q = b.prompt.replace(/^اكتب:\s*/, '');
    def(`NP-${pad2(b.n)}`, {
      name: `سؤال للتأمّل: ${b.title}`, group: 'NP', family: 'سؤال للتأمّل', formats: F_DAILY,
      alt: `سؤال للتأمّل من «${b.title}» في تطبيق الحمد: ${q}`,
      build(c) {
        return post(c, {
          chipText: 'سؤالٌ للتأمّل', visual: { medal: ICON[b.id] }, visualSize: 0.62,
          head: q, hs: c.pick({ story: 70 }, 64), note: `من «${b.title}» · اكتبها في دفترك أو في التعليقات`,
          bgo: { tone: 'ground', cone: 0.06, coneAt: '50% 26%' },
        });
      },
    });
  });

  /* ===================== ND — duaa of each blessing (40) ===================== */
  B.forEach((b) => {
    def(`ND-${pad2(b.n)}`, {
      name: `دعاء: ${b.title}`, group: 'ND', family: 'دعاء النعمة', formats: F_DAILY,
      alt: `دعاء «${b.title}» من تطبيق الحمد: ${b.duaa}`,
      build(c) {
        const top = chip(c, 'دعاء اليوم', { size: 32 });
        const mid = glyph(c, ICON[b.id], { size: c.pick({ story: 150, square: 96 }, 120) }) +
          quote(c, b.duaa, c.pick({ story: 70, square: 56 }, 62), { w: 920 }) +
          kick(c, `من «${b.title}»`, 30);
        return page(c, { bg: { cone: 0.08, coneAt: '50% 30%', warm: 0.05, warmAt: '50% 45%' }, top, mid, foot: sig(c, { size: sigSize(c) }), gap: c.pick({ story: 44, square: 22 }, 32) });
      },
    });
  });

  /* ===================== SV — verse cards (Fridays, Ramadan) ===================== */
  CT.verses.filter((v) => v.id.startsWith('SV-')).forEach((v) => {
    def(v.id, {
      name: `آية: ${v.ref}`, group: 'SV', family: 'آية الجمعة', formats: ['square', 'portrait', 'story', 'wide'],
      review: true,
      alt: `﴿${v.text}﴾ [${v.surahName}: ${AR(v.ayah)}]`,
      build(c) {
        const vs = v.text.length > 70 ? 0.82 : v.text.length > 45 ? 0.92 : 1;
        const orn = `<span style="color:var(--accent)">﴿</span>`, orn2 = `<span style="color:var(--accent)">﴾</span>`;
        const words = verseT(c, `${orn}${v.text}${orn2}`, c.pick({ story: 92, square: 74, wide: 86 }, 82) * vs, { w: 940 }) +
          `<div class="slot" style="gap:${c.px(14)}px">${thread(c, { w: 150 })}${kick(c, `[${v.surahName}: ${AR(v.ayah)}]`, 32)}</div>`;
        return page(c, { bg: { cone: 0.08, coneAt: '50% 30%', warm: 0.07, warmAt: '50% 48%' }, top: chip(c, v.id === 'SV-13' ? 'رمضان مبارك' : 'جمعةٌ مباركة', { size: 32 }), mid: words, foot: sig(c, { size: sigSize(c) }), gap: c.pick({ story: 56, square: 30 }, 40) });
      },
    });
  });

  /* ===================== PS — single posts ===================== */
  const PS = [
    // — the idea —
    { id: 'PS-01', name: 'النعمة لا تُرى', pillar: 'الفكرة', head: `النعمةُ لا تُرى…<br>${acc('حتى تغيب.')}`, hs: 116, sub: '«الحمد» يضع بين يديك كلَّ يومٍ نعمةً واحدة… ثم يُعيدك إليها.', visual: { art: () => A.glassArt('lit', { ripple: true }) } },
    { id: 'PS-02', name: 'العادة لا تُشكر', pillar: 'الفكرة', head: `النعمةُ إذا دامت<br>صارت عادة…<br>${acc('والعادةُ لا تُشكر.')}`, hs: 104 },
    { id: 'PS-03', name: 'تخيّل فقده', pillar: 'الفكرة', head: `لا تعرف قدرَ الشيء…<br>${acc('حتى تتخيّل فقده.')}`, hs: 100, sub: 'تتخيّل… ثم تعود إليه فتجده بين يديك… فيخرج الحمد من قلبك قبل لسانك.', visual: { glyph: 'basar' } },
    { id: 'PS-04', name: 'سؤال: كوب الماء', pillar: 'شاركنا', chipText: 'سؤال اليوم', head: `متى آخرُ مرّةٍ<br>حمدتَ اللهَ…<br>${acc('على كوبِ ماء؟')}`, hs: 100, note: 'اكتبها في التعليقات', visual: { medal: 'maa' }, visualSize: 0.8 },
    { id: 'PS-05', name: 'سؤال: كم نعمة', pillar: 'شاركنا', chipText: 'سؤال اليوم', head: `كم نعمةً مرّت بك اليوم…<br>${acc('ولم تلتفت إليها؟')}`, hs: 96, note: 'اذكر واحدةً في التعليقات' },
    { id: 'PS-06', name: 'ولا تلتفت', pillar: 'الفكرة', head: `تستيقظ فترى النور.<br>تشرب ماءً باردًا.<br>تمشي على قدميك…<br>${acc('ولا تلتفت.')}`, hs: 92 },
    { id: 'PS-07', name: 'بقلب حاضر', pillar: 'الفكرة', head: `${gold('الحمدُ لله')}`, hs: 150, sub: 'بقلبٍ حاضر… لا بلسانٍ معتاد.', ss: 50, visual: { glyph: 'duaa' } },
    { id: 'PS-08', name: 'دقيقتان', pillar: 'الفكرة', head: `دقيقتان كلَّ يوم…<br>${acc('تُعيدان إليك النظر.')}`, hs: 100, visual: { ui: 'timer' } },
    { id: 'PS-09', name: 'عشرون ألف نَفَس', pillar: 'الفكرة', head: `<span class="t-num" style="font-size:1.6em">٢٠٬٠٠٠</span><br>نَفَسٍ تأخذه كلَّ يوم…`, hs: 92, sub: 'كم واحدًا منها حمدتَ الله عليه؟', ss: 46, visual: { medal: 'nafas' }, visualSize: 0.7 },
    // — inside the app —
    { id: 'PS-11', kind: 'feature', name: 'ميزة: نعمة اليوم', pillar: 'داخل التطبيق', chipText: 'نعمة اليوم', head: 'نعمةٌ واحدة كلَّ يوم', sub: 'يتأمّلها الجميع في اليوم نفسه… معها آيتها وتدبّرها.', screen: 'home_top' },
    { id: 'PS-12', kind: 'feature', name: 'ميزة: استشعر النعمة', pillar: 'داخل التطبيق', chipText: 'استشعر النعمة', head: 'دقيقتان… وخمس وقفات', sub: 'جملةٌ بعد جملة، على خلفيةٍ ساكنة. لا شيء يستعجلك.', screen: 'reflect_2_visualize' },
    { id: 'PS-13', kind: 'feature', name: 'ميزة: سجلّ الحمد', pillar: 'داخل التطبيق', chipText: 'سجلّ الحمد', head: 'دفترك الخاص', sub: 'تكتب فيه ما وجدته في نفسك… ويبقى على جهازك وحده.', screen: 'tab_journal', badge: ['على جهازك فقط', 'shield'] },
    { id: 'PS-14', kind: 'feature', name: 'ميزة: المداومة', pillar: 'داخل التطبيق', chipText: 'المداومة', head: 'أيّامك مع النِّعَم', sub: 'في تقويمٍ هجري… بلا عدّادٍ ولا أيّامٍ «فائتة».', screen: 'tab_consistency' },
    { id: 'PS-15', kind: 'feature', name: 'ميزة: المسبحة', pillar: 'داخل التطبيق', chipText: 'المسبحة وحصن المسلم', head: 'تسبيحٌ بلمسة', sub: 'واهتزازٌ خفيف عند كلّ ثلاثٍ وثلاثين.', screen: 'tab_tasbih' },
    { id: 'PS-16', kind: 'feature', name: 'ميزة: رحلتي', pillar: 'داخل التطبيق', chipText: 'رحلتي', head: 'مسارك أنت مع النِّعَم', sub: 'تمضي فيه نعمةً بعد نعمة… بالسرعة التي تناسبك.', screen: 'tab_journey' },
    { id: 'PS-17', kind: 'feature', name: 'ميزة: المشاركة', pillar: 'داخل التطبيق', chipText: 'شارك النعمة', head: 'بطاقةٌ جاهزة لقصّتك', sub: 'شارك نعمة اليوم مع من تحب… بضغطةٍ واحدة.', screen: 'share_modal_story' },
    { id: 'PS-18', kind: 'steps', name: 'الطريقة: خمس وقفات', pillar: 'الفكرة' },
    // — our promise —
    { id: 'PS-19', name: 'الوعد', pillar: 'وعدنا', head: `${acc('بلا حساب.')}<br>${acc('بلا إعلانات.')}<br>${acc('بلا سلاسل ولا ضغط.')}`, hs: 100, sub: 'وما تكتبه في سجلّك… لا يغادر جهازك.', visual: { ui: 'shield' }, visualSize: 0.8 },
    { id: 'PS-20', name: 'بلا حساب', pillar: 'وعدنا', head: `بلا حساب.`, hs: 120, sub: 'تفتح التطبيق فتبدأ. لا تسجيل، ولا بريد، ولا كلمة مرور.', ss: 46, visual: { ui: 'home' } },
    { id: 'PS-21', name: 'بلا أرقام تلاحقك', pillar: 'وعدنا', head: `بلا أرقامٍ تلاحقك.`, hs: 110, sub: 'لا نقاط ولا شارات ولا سلاسل أيّام. المداومة عندنا محاسبةٌ للنفس، لا سباق.', ss: 44, visual: { ui: 'calendar' } },
    { id: 'PS-22', name: 'سجلّك لك', pillar: 'وعدنا', head: `سجلّك لك.`, hs: 120, sub: 'نصّ سجلّك لا يغادر جهازك… والإحصاءات بإذنك، ولا تتضمّن حرفًا ممّا كتبت.', ss: 44, visual: { ui: 'book' } },
    { id: 'PS-23', name: 'بالعربية الفصحى', pillar: 'وعدنا', head: `بالعربية الفصحى.`, hs: 110, sub: 'تطبيقٌ عربيٌّ من أوّل حرفٍ إلى آخره… بلغةٍ هادئةٍ تليق بالشكر.', ss: 44, visual: { glyph: 'bayan' } },
    { id: 'PS-24', name: 'مجّانًا', pillar: 'وعدنا', head: `مجّانًا…<br>${acc('وبلا إعلانات.')}`, hs: 110, sub: 'نعمة اليوم والتأمّل والسجلّ والمسبحة… مجّانيةٌ دائمًا.', ss: 44, visual: { glyph: 'qanaa' } },
    { id: 'PS-25', name: 'نصوص موثّقة', pillar: 'وعدنا', review: true, head: `نصوصٌ موثّقة.`, hs: 110, sub: 'الآيات بالرسم العثماني، والأحاديث بدرجتها، وكلّ نصٍّ يمرّ على أهل العلم قبل نشره.', ss: 42, visual: { glyph: 'quran' } },
    // — share with us —
    { id: 'PS-26', name: 'سؤال: أيّها تفتقد', pillar: 'شاركنا', chipText: 'سؤال اليوم', head: `لو غابت عنك نعمةٌ واحدة غدًا…<br>${acc('أيّها ستفتقد أولًا؟')}`, hs: 88, note: 'اكتبها في التعليقات' },
    { id: 'PS-27', name: 'سؤال: نعمة صغيرة', pillar: 'شاركنا', chipText: 'سؤال اليوم', head: `اذكر نعمةً صغيرة…<br>${acc('لا ينتبه لها أحد.')}`, hs: 96, note: 'وسنقرأ كلَّ تعليق', visual: { glyph: 'fitra' } },
    { id: 'PS-28', kind: 'fill', name: 'أكمل: الحمد لله على', pillar: 'شاركنا' },
    { id: 'PS-29', kind: 'pick', name: 'الصباح أم المساء', pillar: 'شاركنا' },
    { id: 'PS-30', name: 'سؤال: من تحمد الله عليه', pillar: 'شاركنا', chipText: 'سؤال اليوم', head: `من الشخص الذي تحمد اللهَ عليه…<br>${acc('ولم تخبره بذلك؟')}`, hs: 88, note: 'اذكره في التعليقات… ليقرأها', visual: { glyph: 'suhba' } },
    { id: 'PS-31', name: 'سؤال: عرفت قدرها بعد غيابها', pillar: 'شاركنا', chipText: 'سؤال اليوم', head: `ما النعمة التي لم تعرف قدرها…<br>${acc('إلا بعد أن غابت؟')}`, hs: 88, note: 'شاركنا قصتك في سطرين' },
    { id: 'PS-32', name: 'أرسلها لمن تحب', pillar: 'شاركنا', chipText: 'أرسلها لمن تحب', head: `تذكّرتُك اليوم…<br>${acc('فحمدتُ اللهَ عليك.')}`, hs: 104, visual: { glyph: 'umm' }, note: 'أرسلها لشخصٍ هو نعمةٌ في حياتك' },
    // — launch —
    { id: 'PS-33', kind: 'teaser', name: 'قريبًا', pillar: 'الإطلاق' },
    { id: 'PS-34', kind: 'launch', name: 'متاح الآن', pillar: 'الإطلاق' },
    { id: 'PS-36', name: 'شكرًا لكم', pillar: 'الإطلاق', head: `شكرًا لكلّ من جرّب…<br>${acc('وشارك، ودعا.')}`, hs: 100, sub: 'أسبوعنا الأول مع «الحمد»… والحمد لله أولًا وآخرًا.', visual: { glyph: 'duaa' } },
    { id: 'PS-37', name: 'قيّمنا', pillar: 'الإطلاق', chipText: 'Google Play', head: `إن نفعك «الحمد»…<br>${acc('فقيّمه على Google Play.')}`, hs: 96, sub: 'تقييمك يوصله لمن يحتاجه… ويساعدنا أن نُحسن.', visual: { glyph: 'marifa' } },
    { id: 'PS-38', name: 'ماذا نضيف؟', pillar: 'الإطلاق', chipText: 'رأيك يصنع «الحمد»', head: `ماذا تتمنّى أن نضيف<br>${acc('إلى «الحمد»؟')}`, hs: 100, note: 'نقرأ كلَّ تعليق', visual: { glyph: 'bayan' } },
    // — seasons —
    { id: 'PS-39', kind: 'ramadan', name: 'رمضان مبارك', pillar: 'المواسم' },
    { id: 'PS-40', name: 'نعمة المطر', pillar: 'المواسم', chipText: 'نعمةٌ من السماء', head: `صوتُ المطر…<br>${acc('رحمةٌ تسمعها.')}`, hs: 104, sub: 'إذا نزل المطر اليوم… فلا تنسَ أن تقول: الحمد لله.', visual: { medal: 'maa' }, visualSize: 0.8 },
  ];

  const steps = [['التهيئة والحضور', '١٠ ثوانٍ', 'خذ نفسًا عميقًا… وأحضر قلبك لحظة.'], ['تخيّل الغياب', '٢٠ ثانية', 'تتخيّل يومك وقد غابت النعمة عنه، لحظةً بلحظة.'], ['التعمّق', '٢٠ ثانية', 'تمضي أبعد: ما الذي كان سيتغيّر في قلبك وفي من حولك؟'], ['العودة', '١٥ ثانية', 'تفتح عينيك… فتجدها ما زالت بين يديك.'], ['الحمد', '١٥ ثانية', 'تحمد الله عليها بقلبٍ حاضر، لا بلسانٍ معتاد.']];
  /** The five pauses on the app's thread (RTL: the thread runs down the right edge of the list). */
  function stepsList(c, { size = 1 } = {}) {
    const ns = c.px(46 * size), ls = c.px(32 * size), dot = c.px(18), g = c.px(26 * size);
    let s = `<div class="slot" style="align-items:stretch;gap:${g}px;position:relative;padding-right:${c.px(54)}px;width:auto;max-width:${c.px(900)}px">`;
    s += `<div class="abs" style="right:${c.px(16)}px;top:${ns * 0.7}px;bottom:${ls * 2}px;width:3px;background:var(--line)"></div>`;
    steps.forEach(([n, t, l], i) => {
      const last = i === 4;
      s += `<div style="position:relative;text-align:right">` +
        `<div class="abs" style="right:${-c.px(54) + c.px(16) - dot / 2 + 1.5}px;top:${ns * 0.42}px;width:${dot}px;height:${dot}px;border-radius:50%;background:${last ? 'var(--accent)' : 'var(--line)'};${last ? 'box-shadow:0 0 0 8px var(--halo)' : ''}"></div>` +
        `<div class="t-title fit" data-fs="${ns}" style="font-size:${ns}px;text-align:right;line-height:1.3">${last ? acc(n) : n} <span style="font-family:var(--sans);font-weight:500;font-size:0.6em;color:var(--muted)">${t}</span></div>` +
        `<div class="t-body fit" data-fs="${ls}" style="font-size:${ls}px;text-align:right;line-height:1.55">${l}</div></div>`;
    });
    return s + '</div>';
  }

  PS.forEach((p) => {
    const spec = { name: p.name, group: 'PS', family: p.pillar, pillar: p.pillar, formats: F_POST, review: !!p.review, alt: '' };
    if (p.kind === 'feature') {
      spec.alt = `${p.head}: ${p.sub} — لقطة من تطبيق الحمد`;
      spec.build = (c) => feature(c, { chipText: p.chipText, head: p.head, sub: p.sub, screen: p.screen, badge: p.badge ? badgePill(c, p.badge[0], p.badge[1], { x: c.row ? 0.06 : 0.08, y: c.row ? 0.62 : 0.6 }) : '' });
    } else if (p.kind === 'steps') {
      spec.alt = 'الطريقة في تطبيق الحمد: خمس وقفات في دقيقتين — التهيئة، تخيّل الغياب، التعمّق، العودة، الحمد.';
      spec.build = (c) => page(c, {
        bg: { cone: 0.06 }, top: chip(c, 'استشعر النعمة'),
        mid: title(c, `دقيقتان… ${acc('وخمس وقفات')}`, c.pick({ story: 96, square: 72 }, 84)) + stepsList(c, { size: c.pick({ story: 1.12, square: 0.84, wide: 0.9, link: 0.9 }, 1) }),
        foot: sig(c, { size: sigSize(c) * 0.9 }), gap: c.pick({ story: 50, square: 20 }, 32),
      });
    } else if (p.kind === 'fill') {
      spec.alt = 'أكمل الجملة: الحمد لله على…';
      spec.build = (c) => post(c, { chipText: 'أكمل الجملة', head: `${gold('الحمدُ لله')}<br>على <span style="display:inline-block;width:5.5em;border-bottom:${Math.max(3, c.px(4))}px dotted var(--stroke);transform:translateY(-0.25em)"></span>`, hs: 118, note: 'أكملها في التعليقات… وسنقرأ كلَّ جملة' });
    } else if (p.kind === 'pick') {
      spec.alt = 'سؤال: متى تجد قلبك أحضر للحمد، في الصباح أم في المساء؟';
      spec.build = (c) => {
        const half = (th, label, ic) => `<div class="card" style="flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${c.px(18)}px;padding:${c.px(34)}px ${c.px(20)}px;border-radius:${c.px(40)}px;${th === 'n' ? 'background:#F4EDE3;color:#2A1F19;border-color:rgba(185,87,59,0.4)' : 'background:#111126;color:#EDEDF5;border-color:rgba(200,169,81,0.5)'}">` +
          `<div style="width:${c.px(110)}px;height:${c.px(110)}px;color:${th === 'n' ? '#B9573B' : '#E4C368'}">${window.ICONS.glyph(ic, { sw: 1.6 })}</div><div class="t-title fit" data-fs="${c.px(58)}" style="font-size:${c.px(58)}px;color:inherit">${label}</div></div>`;
        const pair = `<div style="display:flex;gap:${c.px(28)}px;width:100%;max-width:${c.px(860)}px">${half('n', 'الصباح', 'laylnahar')}${half('l', 'المساء', 'nawm')}</div>`;
        return post(c, { chipText: 'اختر واحدًا', head: `متى تجد قلبك<br>${acc('أحضرَ للحمد؟')}`, hs: 90, visual: pair, note: 'أجب في التعليقات: صباح أم مساء؟' });
      };
    } else if (p.kind === 'teaser') {
      spec.alt = 'تطبيق الحمد قريبًا على Google Play.';
      spec.build = (c) => page(c, {
        bg: { cone: 0.1, coneAt: '50% 38%', warm: 0.06, warmAt: '50% 42%' },
        under: c.th === 'layl' ? particles(c, { n: 60, seed: 77, box: [0, c.H * 0.15, c.W, c.H * 0.6], rmax: 6, omin: 0.15, omax: 0.8 }) : '',
        mid: wm(c, c.pick({ story: 250, square: 190, wide: 220, link: 220 }, 220)) + gap(c, 30) + display(c, gold('قريبًا'), c.pick({ story: 130, square: 100 }, 116)) + body(c, `على ${ltr('Google Play')}`, 46) + kick(c, 'تطبيقٌ هادئ لتأمّل نِعَم الله… نعمةٌ كلَّ يوم', 32),
        gap: 22,
      });
    } else if (p.kind === 'launch') {
      spec.alt = 'تطبيق الحمد متاح الآن على Google Play: مجّانًا، بلا حساب، بلا إعلانات.';
      spec.build = (c) => {
        const head = chip(c, 'متاح الآن', { size: 34, cls: 'solid' }) + title(c, `«الحمد»<br>${acc(`على ${ltr('Google Play')}`)}`, c.pick({ story: 116, square: 84 }, 98)) + body(c, 'مجّانًا · بلا حساب · بلا إعلانات', 42);
        const act = cta(c, 'حمّله الآن', { size: 40 }) + kick(c, ltr('alhamd.app'), 32);
        if (c.row) return page(c, { bg: { cone: 0.08, coneAt: '62% 30%', warm: 0.06, warmAt: '24% 60%' }, mid: head + act, side: sideArt(phone(c, 'home_top', { w: c.pick({ link: 330 }, 470), rotate: -4 })), sideW: 0.38, gap: 24 });
        return feature(c, { chipText: 'متاح الآن', head: `«الحمد» ${acc(`على ${ltr('Google Play')}`)}`, sub: 'مجّانًا · بلا حساب · بلا إعلانات', screen: 'home_top', after: gap(c, 8) + cta(c, 'حمّله الآن', { size: 40 }) });
      };
    } else if (p.kind === 'ramadan') {
      spec.alt = 'رمضان مبارك من تطبيق الحمد: شهرٌ تُختم آيتُه بالشكر.';
      spec.build = (c) => post(c, { chipText: '١٤٤٨ هـ', visual: { medal: 'ramadan' }, head: `${gold('رمضانُ مبارك')}`, hs: 130, sub: `شهرٌ تُختم آيتُه بقوله: <span style="font-family:var(--quran)">﴿${(CT.verses.find((v) => v.id === 'SV-13') || { text: '' }).text.split(' ').slice(-2).join(' ')}﴾</span>`, ss: 46, bgo: { cone: 0.08, coneAt: '50% 26%', warm: 0.1, warmAt: '50% 40%' } });
    } else {
      spec.alt = `${p.head.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}${p.sub ? ` — ${p.sub}` : ''}`;
      spec.build = (c) => post(c, { chipText: p.chipText, visual: p.visual, visualSize: p.visualSize || 1, head: p.head, hs: p.hs, sub: p.sub, ss: p.ss || 42, note: p.note });
    }
    def(p.id, spec);
  });

  /* ===================== CR — carousels ===================== */
  const slide = (c, i, n, inner, { bgo, sw = i === 1 } = {}) => page(c, { bg: bgo || { cone: 0.06 }, mid: inner, gap: c.pick({ story: 40, square: 22 }, 30), over: pager(c, i, n) + (sw ? swipe(c) : '') });
  const ctaSlide = (c, i, n, head, btn = 'ابدأ بنعمة اليوم') => slide(c, i, n, title(c, head, c.pick({ story: 100, square: 80 }, 92)) + cta(c, btn) + kick(c, ltr('alhamd.app'), 34) + gap(c, 20) + wm(c, 80), { bgo: { cone: 0.08, warm: 0.06, warmAt: '50% 55%' } });
  /** Register a carousel: slides is a list of (c, i, n) => html */
  function carousel(id, name, pillar, slides, alts = []) {
    slides.forEach((fn, k) => def(`${id}-${k + 1}`, { name, group: id, family: 'كاروسيل', pillar, formats: F_SLIDE, slide: k + 1, slides: slides.length, alt: alts[k] || name, build: (c) => fn(c, k + 1, slides.length) }));
  }
  const bigNum = (c, k) => `<div class="t-num" style="font-size:${c.px(c.pick({ story: 230, square: 150 }, 190))}px;opacity:0.9">${AR(k)}</div>`;

  // CR-01 — the method
  carousel('CR-01', 'الطريقة: ماذا يحدث في دقيقتين؟', 'الفكرة', [
    (c, i, n) => slide(c, i, n, chip(c, 'استشعر النعمة') + title(c, `ماذا يحدث في<br>${acc('دقيقتين')} مع «الحمد»؟`, c.pick({ story: 110, square: 84 }, 100)) + body(c, 'خمس وقفات… تأخذك كلَّ يوم إلى نعمةٍ واحدة.', 42)),
    ...steps.map(([nm, t, l], k) => (c, i, n) => slide(c, i, n, bigNum(c, k + 1) + title(c, nm, c.pick({ story: 104, square: 80 }, 96)) + chip(c, t, { size: 30, cls: 'ghost' }) + quote(c, l, c.pick({ story: 70, square: 54 }, 62), { w: 900 }))),
    (c, i, n) => ctaSlide(c, i, n, `كلَّ يومٍ نعمةٌ جديدة…<br>${acc('ودقيقتان تكفي.')}`),
  ]);

  // CR-02 — seven blessings we walk past
  const SEVEN = [[37, 'نافذتان صغيرتان… يدخل منهما العالمُ كلُّه إليك.'], [15, 'أرخصُ شيءٍ في بيتك… ولو غاب، ما اشتراه مالُك كلُّه.'], [36, 'بها وصلك صوتُ أمك… وأذانُ الفجر.'], [17, 'في كل دقيقةٍ تأخذ من الهواء ما لا تدفع فيه شيئًا.'], [38, 'تمشي إلى حيث تشاء… ولا تفكّر في خطوةٍ واحدة.'], [14, 'كلَّ ليلةٍ تنام… ويردُّك اللهُ مع الفجر.'], [33, 'أربعةُ جدرانٍ وسقف… تأوي إليها كلَّ مساء.']];
  carousel('CR-02', 'سبعُ نِعَمٍ تمرّ بها كلَّ يوم', 'الفكرة', [
    (c, i, n) => slide(c, i, n, title(c, `سبعُ نِعَمٍ…<br>تمرّ بها كلَّ يوم<br>${acc('ولا تلتفت.')}`, c.pick({ story: 112, square: 82 }, 100)) + `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:${c.px(22)}px;max-width:${c.px(820)}px">${SEVEN.map(([nn]) => medal(c, iconOf(nn), { size: c.pick({ story: 150, square: 104 }, 128) })).join('')}</div>`),
    ...SEVEN.map(([nn, l], k) => (c, i, n) => slide(c, i, n, medal(c, iconOf(nn), { size: c.pick({ story: 380, square: 220 }, 300) }) + title(c, BY[nn].title, c.pick({ story: 110, square: 84 }, 100)) + body(c, l, c.pick({ story: 50, square: 40 }, 44), { w: 860 }))),
    (c, i, n) => ctaSlide(c, i, n, `واحدةٌ منها…<br>${acc('كلَّ يوم.')}`),
  ]);

  // CR-04 — a tour of the app (real screens)
  const TOUR = [['home_top', 'نعمة اليوم', 'نعمةٌ واحدة كلَّ يوم، بآيتها وتدبّرها.'], ['reflect_2_visualize', 'استشعر النعمة', 'دقيقتان من التأمّل، جملةً بعد جملة.'], ['tab_journal', 'سجلّ الحمد', 'دوِّن ما وجدته في قلبك… يبقى على جهازك.'], ['tab_tasbih', 'المسبحة وحصن المسلم', 'تسبيحٌ بلمسة، وأذكارٌ وتلاواتٌ هادئة.'], ['tab_consistency', 'المداومة', 'تقويمٌ هجريٌّ هادئ… بلا عدّادٍ يلاحقك.']];
  const screenSlide = (c, i, n, src, head, sub) => {
    const [t, r, b, l] = c.safe;
    const pw = c.pick({ story: 760, portrait: 560, square: 400 }, 560);
    return bg(c, { cone: 0.06, coneAt: '50% 20%' }) +
      `<div class="safe" style="padding:${t}px ${r}px 0 ${l}px;gap:${c.px(c.pick({ square: 18 }, 30))}px"><div class="slot top" style="gap:${c.px(14)}px">${title(c, head, c.pick({ story: 100, square: 72 }, 88), { fit: false })}${body(c, sub, c.pick({ square: 34 }, 40), { fit: false, w: 900 })}</div>` +
      `<div class="slot" style="flex:1 1 auto;min-height:0;justify-content:flex-start">${phone(c, src, { w: pw })}</div></div>` + fadeB(c, c.pick({ story: 520, square: 240 }, 340)) + pager(c, i, n);
  };
  carousel('CR-04', 'جولة في التطبيق: خمسة أبواب', 'داخل التطبيق', [
    (c, i, n) => slide(c, i, n, title(c, `خمسة أبواب…<br>${acc('وغايةٌ واحدة')}`, c.pick({ story: 118, square: 86 }, 104)) + body(c, 'كلّ ما في «الحمد» يعينك على الشكر… ولا شيء فيه يشغلك عنه.', 42) + `<div style="display:flex;gap:${c.px(26)}px;color:var(--accent)">${['sparkle', 'book', 'beads', 'calendar', 'compass'].map((x) => uicon(c, x, 72, 1.4)).join('')}</div>`),
    ...TOUR.map(([src, h, s]) => (c, i, n) => screenSlide(c, i, n, src, h, s)),
    (c, i, n) => ctaSlide(c, i, n, `مجّانًا…<br>${acc('وبلا إعلانات.')}`, 'جرّب «الحمد»'),
  ]);

  // CR-05 — why no streaks
  carousel('CR-05', 'لماذا لا يعدّ «الحمد» أيامك؟', 'وعدنا', [
    (c, i, n) => slide(c, i, n, title(c, `لماذا لا يعدّ<br>${acc('«الحمد» أيامك؟')}`, c.pick({ story: 118, square: 88 }, 106)) + `<div style="color:var(--stroke)">${uicon(c, 'calendar', c.pick({ story: 170, square: 110 }, 140), 1.2)}</div>`),
    (c, i, n) => slide(c, i, n, title(c, `لأن الشكر<br>عبادةُ قلب…<br>${acc('لا سباق.')}`, c.pick({ story: 120, square: 90 }, 108))),
    (c, i, n) => slide(c, i, n, title(c, `لا نقاط، ولا شارات،<br>${acc('ولا أيامٌ «فائتة».')}`, c.pick({ story: 104, square: 80 }, 94))),
    (c, i, n) => slide(c, i, n, title(c, `المداومة عندنا<br>${acc('محاسبةٌ للنفس')}`, c.pick({ story: 110, square: 84 }, 100)) + body(c, 'في تقويمٍ هجريٍّ هادئ، بلا عدّادٍ يلاحقك.', 42)),
    (c, i, n) => ctaSlide(c, i, n, `ابدأ متى شئت…<br>${acc('بنعمة اليوم.')}`),
  ]);

  // CR-06 — getting started in a minute (soft launch)
  carousel('CR-06', 'كيف تبدأ في دقيقة؟', 'داخل التطبيق', [
    (c, i, n) => slide(c, i, n, chip(c, 'دليل سريع') + title(c, `كيف تبدأ مع «الحمد»<br>${acc('في دقيقة؟')}`, c.pick({ story: 112, square: 84 }, 100)) + body(c, 'خمس خطواتٍ… والسادسة غدًا.', 42)),
    (c, i, n) => slide(c, i, n, bigNum(c, 1) + title(c, `حمّله من ${ltr('Google Play')}`, c.pick({ story: 96, square: 74 }, 88)) + body(c, 'أو ابدأ من alhamd.app — مجّانًا.', 42)),
    (c, i, n) => screenSlide(c, i, n, 'home_top', '٢ · افتح… وابدأ', 'لا حساب، ولا بريد، ولا كلمة مرور.'),
    (c, i, n) => screenSlide(c, i, n, 'home_card', '٣ · اقرأ نعمة اليوم', 'نعمةٌ واحدة… مع آيتها وتدبّرها.'),
    (c, i, n) => screenSlide(c, i, n, 'reflect_2_visualize', '٤ · استشعرها دقيقتين', 'خمس وقفات… جملةً بعد جملة.'),
    (c, i, n) => screenSlide(c, i, n, 'reflect_6_journal', '٥ · دوِّن ما وجدت', 'في سجلّك… على جهازك وحده.'),
    (c, i, n) => ctaSlide(c, i, n, `والسادسة؟<br>${acc('عُد غدًا… لنعمةٍ جديدة.')}`),
  ]);

  // CR-07 — why «الحمد» (manifesto, from the landing page)
  carousel('CR-07', 'لماذا «الحمد»؟', 'الفكرة', [
    (c, i, n) => slide(c, i, n, wm(c, c.pick({ story: 200, square: 140 }, 170)) + gap(c, 30) + title(c, `لماذا صنعنا<br>${acc('«الحمد»؟')}`, c.pick({ story: 112, square: 84 }, 100)), { bgo: { cone: 0.09, coneAt: '50% 40%' } }),
    (c, i, n) => slide(c, i, n, quote(c, 'تستيقظ كلَّ صباحٍ…<br>فترى النور.', c.pick({ story: 96, square: 74 }, 86))),
    (c, i, n) => slide(c, i, n, quote(c, 'تشرب ماءً باردًا،<br>وتسمع صوتًا تحبّه،<br>وتمشي على قدميك<br>إلى حيث تشاء.', c.pick({ story: 86, square: 66 }, 78))),
    (c, i, n) => slide(c, i, n, title(c, acc('ولا تلتفت.'), c.pick({ story: 140, square: 104 }, 124)), { bgo: { tone: 'deep', cone: 0.02, pat: 0.025 } }),
    (c, i, n) => slide(c, i, n, title(c, `فالنعمة إذا دامت صارت عادة…<br>${acc('والعادةُ لا تُشكر.')}`, c.pick({ story: 96, square: 72 }, 86))),
    (c, i, n) => slide(c, i, n, title(c, `و«الحمد»…<br>${acc('يُعيد إليك النظر.')}`, c.pick({ story: 112, square: 84 }, 100)) + body(c, 'نعمةٌ واحدة كلَّ يوم، ودقيقتان من التأمّل: تتخيّل يومك لو غابت… ثم تعود إليها فتحمد الله.', 42, { w: 880 })),
    (c, i, n) => ctaSlide(c, i, n, `كم نعمةً مرّت بك اليوم؟<br>${acc('ابدأ بواحدة.')}`),
  ]);

  // CR-08 — five questions before you sleep
  const NIGHTQ = ['ما أجملُ ما رأته عيناك اليوم؟', 'من الذي أحسن إليك اليوم… ولو بكلمة؟', 'أيُّ ألمٍ لم يُصبك اليوم؟', 'ما اللقمة التي أكلتها… ولم تفكّر فيها؟', 'على أيّ شيءٍ تحمد الله الآن؟'];
  carousel('CR-08', 'خمسة أسئلة قبل النوم', 'شاركنا', [
    (c, i, n) => slide(c, i, n, medal(c, 'nawm', { size: c.pick({ story: 300, square: 170 }, 230) }) + title(c, `قبل أن تنام…<br>${acc('خمسة أسئلة')}`, c.pick({ story: 114, square: 86 }, 102)) + body(c, 'احفظ المنشور… وارجع إليه الليلة.', 42), { bgo: { tone: 'ground', cone: 0.05 } }),
    ...NIGHTQ.map((q, k) => (c, i, n) => slide(c, i, n, bigNum(c, k + 1) + quote(c, q, c.pick({ story: 92, square: 70 }, 82), { w: 900 }), { bgo: { tone: 'ground', cone: 0.05 } })),
    (c, i, n) => ctaSlide(c, i, n, `دوِّن إجاباتك…<br>${acc('في سجلّ الحمد.')}`, 'ابدأ سجلّك'),
  ]);

  // CR-09 — small blessings no one counts
  const SMALL = [['أن تجد من تشكو إليه.', 'suhba'], ['أن تعرف طريق بيتك.', 'bayt'], ['أن تتذوّق ما تأكل.', 'taam'], ['أن تنسى بعض الأذى.', 'afiya'], ['ليلةٌ تمرّ بلا ألم.', 'nawm'], ['دعوةٌ من أمّك… وأنت لا تدري.', 'umm']];
  carousel('CR-09', 'نِعَمٌ صغيرة لا يعدّها أحد', 'الفكرة', [
    (c, i, n) => slide(c, i, n, title(c, `نِعَمٌ صغيرة…<br>${acc('لا يعدّها أحد')}`, c.pick({ story: 118, square: 88 }, 106)) + body(c, 'ستّ نِعَمٍ… كم واحدةً منها عندك الآن؟', 42)),
    ...SMALL.map(([t, ic]) => (c, i, n) => slide(c, i, n, glyph(c, ic, { size: c.pick({ story: 220, square: 130 }, 170) }) + quote(c, t, c.pick({ story: 100, square: 76 }, 88), { w: 900 }))),
    (c, i, n) => slide(c, i, n, title(c, `أكمل القائمة…<br>${acc('في التعليقات.')}`, c.pick({ story: 110, square: 84 }, 100)) + body(c, 'وكلَّ يومٍ نعمةٌ تتأمّلها في «الحمد».', 42) + gap(c, 20) + wm(c, 80), { bgo: { cone: 0.08, warm: 0.06 } }),
  ]);

  // CR-12 — behind the design
  carousel('CR-12', 'خلف التصميم', 'الهوية', [
    (c, i, n) => slide(c, i, n, chip(c, 'خلف التصميم') + title(c, `لماذا يبدو «الحمد»<br>${acc('هكذا؟')}`, c.pick({ story: 112, square: 84 }, 100)) + body(c, 'ستّ قراراتٍ صغيرة… لها معنى.', 42)),
    (c, i, n) => slide(c, i, n, `<div style="display:flex;width:${c.px(760)}px;height:${c.px(260)}px;border-radius:${c.px(40)}px;overflow:hidden;box-shadow:var(--card-shadow)"><div style="flex:1;background:#F4EDE3;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:${c.px(64)}px;color:#2A1F19">نهار</div><div style="flex:1;background:#111126;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:${c.px(64)}px;color:#E4C368">ليل</div></div>` + title(c, `ثيمان…<br>${acc('ليلٌ ونهار')}`, c.pick({ story: 100, square: 78 }, 92)) + body(c, 'لليل سكونُه، وللنهار صفاؤه… فاخترنا لكلٍّ منهما لونه.', 42, { w: 880 })),
    (c, i, n) => slide(c, i, n, `<div style="display:flex;gap:${c.px(20)}px">${['#0C0C1C', '#15152A', '#E4C368', '#C8A951', '#6C63FF'].map((x) => `<div style="width:${c.px(110)}px;height:${c.px(110)}px;border-radius:50%;background:${x};box-shadow:0 0 0 3px rgba(255,255,255,0.12)"></div>`).join('')}</div>` + title(c, `«ليل»: كحليٌّ وذهب`, c.pick({ story: 96, square: 74 }, 88)) + body(c, 'لهدوء الليل… وللذين يقرؤون قبل النوم.', 42)),
    (c, i, n) => slide(c, i, n, `<div style="display:flex;gap:${c.px(20)}px">${['#F4EDE3', '#FBF8F3', '#2A1F19', '#B9573B', '#9E4A30'].map((x) => `<div style="width:${c.px(110)}px;height:${c.px(110)}px;border-radius:50%;background:${x};box-shadow:0 0 0 3px rgba(0,0,0,0.08)"></div>`).join('')}</div>` + title(c, `«نهار»: ورقٌ دافئ وحبر`, c.pick({ story: 96, square: 74 }, 88)) + body(c, 'لصفاء الصباح… كأنك تقرأ من دفترٍ قديم.', 42)),
    (c, i, n) => slide(c, i, n, thread(c, { w: 620, pct: 0.62 }) + gap(c, 30) + title(c, `الخيطُ الذهبي`, c.pick({ story: 104, square: 80 }, 94)) + body(c, 'كلُّ نعمةٍ حبّةٌ في خيطٍ واحد… والنقطة في أوّله: أنت تبدأ من هنا.', 42, { w: 860 })),
    (c, i, n) => slide(c, i, n, display(c, 'الحمد', c.pick({ story: 230, square: 170 }, 200)) + title(c, `خطُّ «أميري»`, c.pick({ story: 96, square: 74 }, 88)) + body(c, 'إحياءٌ لحروف المطبعة الأميرية في بولاق… من أعرق مطابع العربية.', 42, { w: 860 })),
    (c, i, n) => slide(c, i, n, `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:${c.px(16)}px;max-width:${c.px(820)}px">${['islam', 'quran', 'salah', 'maa', 'basar', 'umm', 'rizq', 'janna'].map((x) => medal(c, x, { size: c.pick({ story: 150, square: 96 }, 120) })).join('')}</div>` + title(c, `أربعون نعمة…<br>${acc('أربعون رمزًا')}`, c.pick({ story: 100, square: 76 }, 90)) + body(c, 'رُسمت كلُّها بخطٍّ واحدٍ رفيع… كي لا يعلو شيءٌ على النعمة.', 42, { w: 860 })),
    (c, i, n) => ctaSlide(c, i, n, `ليلًا أو نهارًا…<br>${acc('نعمةٌ كلَّ يوم.')}`),
  ]);

  // CR-13 — questions people ask (soft launch)
  const FAQ = [['هل أحتاج إلى حساب؟', 'لا. تفتح التطبيق فتبدأ… بلا تسجيلٍ ولا بريدٍ ولا كلمة مرور.'], ['هل فيه إعلانات؟', 'لا. ولن يكون… فالشكر عبادة قلب، لا نزاحمه بشيء.'], ['أين يُحفظ ما أكتبه؟', 'على جهازك وحده. ويمكنك أن تحفظ نسخةً احتياطية في ملفٍّ تحتفظ به أنت.'], ['هل هو مجّاني؟', 'نعمة اليوم والتأمّل والسجلّ والمسبحة مجّانيةٌ دائمًا. و«رحلتي» إضافةٌ لمن أرادها.'], ['هل يعدّ أيامي ويحاسبني؟', 'لا سلاسل ولا نقاط. تقويمٌ هجريٌّ هادئ تحاسب فيه نفسك… إن شئت.']];
  carousel('CR-13', 'أسئلة يسألها الناس', 'وعدنا', [
    (c, i, n) => slide(c, i, n, chip(c, 'سؤال وجواب') + title(c, `خمسة أسئلة…<br>${acc('يسألها الناس عن «الحمد»')}`, c.pick({ story: 104, square: 78 }, 94))),
    ...FAQ.map(([q, a]) => (c, i, n) => slide(c, i, n, title(c, q, c.pick({ story: 100, square: 78 }, 90)) + `<div class="rule" style="max-width:${c.px(160)}px;background:var(--line)"></div>` + body(c, a, c.pick({ story: 52, square: 42 }, 46), { w: 880 }))),
    (c, i, n) => ctaSlide(c, i, n, `سؤالٌ آخر؟<br>${acc('اكتبه في التعليقات.')}`, 'جرّب «الحمد»'),
  ]);

  // CR-14 — Ramadan: you learn the worth of what you had
  carousel('CR-14', 'رمضان… شهرُ الشكر', 'المواسم', [
    (c, i, n) => slide(c, i, n, medal(c, 'ramadan', { size: c.pick({ story: 320, square: 180 }, 250) }) + title(c, `رمضان…<br>${acc('مدرسةُ الشكر')}`, c.pick({ story: 116, square: 86 }, 104)), { bgo: { cone: 0.08, warm: 0.1, warmAt: '50% 40%' } }),
    (c, i, n) => slide(c, i, n, glyph(c, 'taam', { size: c.pick({ story: 200, square: 120 }, 160) }) + quote(c, `تجوع…<br>${acc('فتعرف قدرَ اللقمة.')}`, c.pick({ story: 104, square: 78 }, 92))),
    (c, i, n) => slide(c, i, n, glyph(c, 'maa', { size: c.pick({ story: 200, square: 120 }, 160) }) + quote(c, `تعطش…<br>${acc('فتعرف قدرَ الماء.')}`, c.pick({ story: 104, square: 78 }, 92))),
    (c, i, n) => slide(c, i, n, glyph(c, 'nawm', { size: c.pick({ story: 200, square: 120 }, 160) }) + quote(c, `تسهر…<br>${acc('فتعرف قدرَ النوم.')}`, c.pick({ story: 104, square: 78 }, 92))),
    (c, i, n) => slide(c, i, n, verseT(c, `<span class="acc">﴿</span>${(CT.verses.find((v) => v.id === 'SV-13') || {}).text || ''}<span class="acc">﴾</span>`, c.pick({ story: 86, square: 64 }, 76), { w: 900 }) + kick(c, '[البقرة: ١٨٥]', 32) + body(c, 'آيةُ شهر رمضان… تُختم بالشكر.', 44)),
    (c, i, n) => ctaSlide(c, i, n, `في رمضان…<br>${acc('نعمةٌ كلَّ يوم.')}`),
  ]);

  /* ===================== TR — «جرّبها الآن»: the five pauses of one blessing ===================== */
  const TRY = [15, 37, 22, 14, 17, 33, 36, 13, 28, 32, 39, 5];
  const STEP_NAMES = ['التهيئة والحضور', 'تخيّل الغياب', 'التعمّق', 'العودة', 'الحمد'];
  TRY.forEach((nn) => {
    const b = BY[nn], ic = ICON[b.id];
    const st = (k) => (k === 1 || k === 2 ? 'gone' : 'lit');
    carousel(`TR-${pad2(nn)}`, `جرّبها الآن: ${b.title}`, 'داخل التطبيق', [
      (c, i, n) => slide(c, i, n, chip(c, 'جرّبها الآن') + title(c, `دقيقتان…<br>${acc(`مع ${b.title}`)}`, c.pick({ story: 116, square: 86 }, 104)) + body(c, 'اقرأ كلَّ صفحةٍ ببطء… ثم اسحب.', 42) + medal(c, ic, { size: c.pick({ story: 320, square: 170 }, 250) }), { bgo: { cone: 0.08 } }),
      ...b.steps.map((line, k) => (c, i, n) => slide(c, i, n,
        chip(c, STEP_NAMES[k], { size: 32, cls: k === 4 ? 'solid' : '' }) +
        quote(c, line.replace(/الحمدُ لله/, (m) => (k === 4 ? `<span class="acc">${m}</span>` : m)), c.pick({ story: 80, square: 60 }, 70), { w: 920 }) +
        medal(c, ic, { size: c.pick({ story: 260, square: 130 }, 190), state: st(k) }),
      { bgo: k === 1 || k === 2 ? { tone: 'deep', pat: 0.022, cone: 0.02 } : { cone: 0.07, warm: k === 4 ? 0.1 : 0, warmAt: '50% 70%' } })),
      (c, i, n) => ctaSlide(c, i, n, `هذه دقيقتان من «الحمد»…<br>${acc('كلَّ يومٍ مع نعمةٍ جديدة.')}`),
    ]);
  });

  /* ===================== ST — stories (9:16) ===================== */
  const zone = (c, h = 230) => `<div style="width:${c.px(800)}px;height:${c.px(h)}px;border:2px dashed var(--stroke);opacity:0.35;border-radius:${c.px(40)}px;flex:0 0 auto"></div>`;
  const STORIES = [
    ['ST-01', 'استطلاع: كوب الماء', 'شاركنا', (c) => post(c, { chipText: 'صوّت', visual: { medal: 'maa' }, visualSize: 0.75, head: `متى آخرُ مرّةٍ<br>حمدتَ اللهَ<br>${acc('على الماء؟')}`, hs: 100, foot: zone(c) + gap(c, 40) + wm(c, 56) })],
    ['ST-02', 'اختبار: كم مرّة تتنفّس', 'شاركنا', (c) => post(c, { chipText: 'اختبار سريع', visual: { medal: 'nafas' }, visualSize: 0.7, head: `كم مرّةً<br>${acc('تتنفّس في اليوم؟')}`, hs: 104, foot: zone(c, 360) + gap(c, 30) + kick(c, 'الجواب في القصة التالية', 30) })],
    ['ST-03', 'جواب: عشرون ألف مرّة', 'شاركنا', (c) => post(c, { chipText: 'الجواب', head: `<span class="t-num" style="font-size:1.5em">٢٠٬٠٠٠</span><br>مرّةٍ تقريبًا`, hs: 110, sub: 'كلُّ نَفَسٍ منها نعمة… كم واحدًا حمدتَ الله عليه؟', ss: 48 })],
    ['ST-04', 'قالب: نعمتي اليوم', 'شاركنا', (c) => page(c, { bg: { cone: 0.06 }, top: chip(c, '#نعمة_اليوم'), mid: title(c, 'نعمتي اليوم:', 120, { extra: 'align-self:stretch;text-align:right' }) + `<div style="align-self:stretch;display:flex;flex-direction:column;gap:${c.px(120)}px;margin-top:${c.px(60)}px">${'<div class="rule"></div>'.repeat(5)}</div>`, foot: body(c, 'صوّرها… واكتب نعمتك، ثم شاركها وأشِر إلينا', 36) + gap(c, 20) + wm(c, 56) })],
    ['ST-05', 'رابط: نعمة اليوم في التطبيق', 'داخل التطبيق', (c) => post(c, { chipText: 'نعمة اليوم', visual: { glyph: 'marifa' }, visualSize: 0.8, head: `نعمةٌ جديدة…<br>${acc('تنتظرك الآن')}`, hs: 104, sub: 'ادخل وتأمّلها في دقيقتين.', foot: zone(c, 140) + gap(c, 20) + kick(c, 'ضع ملصق الرابط هنا', 26, { extra: 'opacity:0.6' }) })],
    ['ST-06', 'عدّ تنازلي: قريبًا', 'الإطلاق', (c) => page(c, { bg: { cone: 0.1, coneAt: '50% 34%' }, under: c.th === 'layl' ? particles(c, { n: 60, seed: 77, box: [40, 300, 1000, 1200], rmax: 6, omin: 0.15, omax: 0.8 }) : '', mid: wm(c, 230) + gap(c, 40) + display(c, gold('قريبًا'), 130) + body(c, `على ${ltr('Google Play')}`, 50), foot: zone(c, 220) })],
    ['ST-07', 'اسألنا', 'شاركنا', (c) => post(c, { chipText: 'اسألنا', visual: { glyph: 'bayan' }, visualSize: 0.8, head: `اسألنا<br>${acc('عن «الحمد»')}`, hs: 112, sub: 'عن الفكرة، أو الطريقة، أو أيّ شيء…', foot: zone(c, 300) })],
    ['ST-08', 'منزلق: كم نعمة لاحظت', 'شاركنا', (c) => post(c, { chipText: 'حرّك المؤشّر', visual: { glyph: 'hayat' }, visualSize: 0.8, head: `كم نعمةً لاحظتَ<br>${acc('اليوم؟')}`, hs: 108, foot: zone(c, 200) + gap(c, 30) + wm(c, 56) })],
    ['ST-09', 'ليل أم نهار', 'الهوية', (c) => {
      const half = (n) => `<div style="flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${c.px(26)}px;border-radius:${c.px(48)}px;padding:${c.px(40)}px 0;${n ? 'background:#F4EDE3;color:#2A1F19;border:2px solid rgba(185,87,59,0.35)' : 'background:#111126;color:#EDEDF5;border:2px solid rgba(200,169,81,0.5)'}"><div style="width:${c.px(150)}px;height:${c.px(150)}px;color:${n ? '#B9573B' : '#E4C368'}">${window.ICONS.glyph(n ? 'laylnahar' : 'nawm', { sw: 1.5 })}</div><div style="font-family:var(--serif);font-weight:700;font-size:${c.px(78)}px">${n ? 'نهار' : 'ليل'}</div></div>`;
      return post(c, { chipText: 'اختر', head: `«ليل» أم «نهار»؟`, hs: 104, sub: 'في «الحمد» ثيمان… أيّهما يشبهك؟', visual: `<div style="display:flex;gap:${c.px(26)}px;width:${c.px(860)}px;height:${c.px(520)}px">${half(1)}${half(0)}</div>`, foot: zone(c, 200) });
    }],
    ['ST-10', 'أضف نعمتك', 'شاركنا', (c) => post(c, { chipText: 'أضِف نعمتك', visual: { glyph: 'fitra' }, visualSize: 0.8, head: `نعمةٌ لاحظتها اليوم…<br>${acc('أضِفها هنا')}`, hs: 100, foot: zone(c, 260) + gap(c, 30) + kick(c, 'ثم مرِّرها لغيرك', 30) })],
    ['ST-11', 'من داخل التطبيق', 'داخل التطبيق', (c) => feature(c, { chipText: 'من داخل التطبيق', head: 'لمحةٌ أولى…', sub: 'هكذا تبدأ «نعمة اليوم» في «الحمد».', screen: 'home_top' })],
    ['ST-12', 'رأيك يصنع الحمد', 'الإطلاق', (c) => post(c, { chipText: 'رأيك يصنع «الحمد»', visual: { glyph: 'bayan' }, visualSize: 0.8, head: `ما الذي أعجبك؟<br>${acc('وما الذي ينقصه؟')}`, hs: 100, foot: zone(c, 300) })],
    ['ST-13', 'قيّمنا على Google Play', 'الإطلاق', (c) => post(c, { chipText: 'Google Play', visual: { glyph: 'marifa' }, visualSize: 0.8, head: `دقيقةٌ منك…<br>${acc('توصله لغيرك')}`, hs: 104, sub: 'إن نفعك «الحمد»، فقيّمه على Google Play.', foot: zone(c, 140) + gap(c, 20) + kick(c, 'ضع ملصق الرابط هنا', 26, { extra: 'opacity:0.6' }) })],
    ['ST-14', 'متاح الآن (قصة)', 'الإطلاق', (c) => page(c, { bg: { cone: 0.08, coneAt: '50% 24%', warm: 0.06, warmAt: '50% 60%' }, mid: chip(c, 'متاح الآن', { size: 36, cls: 'solid' }) + title(c, `«الحمد»<br>${acc(`على ${ltr('Google Play')}`)}`, 124) + phone(c, 'home_top', { w: 470, rotate: -4 }), foot: zone(c, 140) + gap(c, 16) + kick(c, 'ضع ملصق الرابط هنا', 26, { extra: 'opacity:0.6' }), gap: 34 })],
    ['ST-15', 'صباح النِّعَم', 'نعمة اليوم', (c) => post(c, { chipText: 'صباحُ النِّعَم', visual: { glyph: 'laylnahar' }, visualSize: 0.9, head: `صباحُ الخير…<br>${acc('ما أوّلُ نعمةٍ رأيتها اليوم؟')}`, hs: 96, foot: zone(c, 220) + gap(c, 30) + wm(c, 56), bgo: { cone: 0.1, coneAt: '50% 30%', warm: 0.08, warmAt: '50% 34%' } })],
    ['ST-16', 'قبل أن تنام', 'نعمة اليوم', (c) => post(c, { chipText: 'قبل أن تنام', visual: { medal: 'nawm' }, visualSize: 0.8, head: `عُدَّ ثلاثَ نِعَمٍ من يومك…<br>${acc('ثم نَم.')}`, hs: 100, sub: 'واحدة… اثنتان… ثلاث. الحمد لله.', bgo: { tone: 'ground', cone: 0.05 } })],
    ['ST-17', 'جمعة مباركة (قصة)', 'المواسم', (c) => post(c, { chipText: 'جمعةٌ مباركة', visual: { medal: 'salah' }, visualSize: 0.85, head: `اجعل جمعتك…<br>${acc('جمعةَ حمد.')}`, hs: 110, sub: 'عُدَّ نِعَم أسبوعك… واحمد الله على كلٍّ منها.' })],
    ['ST-18', 'رمضان مبارك (قصة)', 'المواسم', (c) => post(c, { chipText: '١٤٤٨ هـ', visual: { medal: 'ramadan' }, head: gold('رمضانُ مبارك'), hs: 130, sub: 'تقبّل الله منّا ومنكم… ونعمةٌ كلَّ يومٍ مع «الحمد».', bgo: { cone: 0.08, warm: 0.1, warmAt: '50% 40%' } })],
    ['ST-19', 'شاركنا نعمتك', 'شاركنا', (c) => post(c, { chipText: 'نعيد نشرها', head: `شاركنا نعمتك…<br>${acc('ونعيد نشرها هنا')}`, hs: 104, sub: 'اكتبها في قصتك مع #نعمة_اليوم وأشِر إلينا.', foot: zone(c, 420) })],
    ['ST-20', 'سؤال للتأمّل (فارغ)', 'شاركنا', (c) => post(c, { chipText: 'سؤال الليلة', visual: { glyph: 'nawm' }, visualSize: 0.8, head: `بماذا أنعم اللهُ عليك اليوم…<br>${acc('ولم تشكره بعد؟')}`, hs: 96, foot: zone(c, 300), bgo: { tone: 'ground', cone: 0.05 } })],
  ];
  STORIES.forEach(([id, name, pillar, build]) => def(id, { name, group: 'ST', family: 'قصص تفاعلية', pillar, formats: F_STORY, alt: name, build }));

  /* ===================== CH — 7-day challenge ===================== */
  const CHALLENGE = [[37, 'انظر إلى السماء دقيقةً كاملة… ثم قل: الحمد لله.'], [15, 'اشرب كوبَ ماءٍ ببطء… واستشعر كلَّ رشفة.'], [36, 'أغمض عينيك واستمع دقيقة… كم صوتًا تسمع؟'], [22, 'اتّصل بأمّك أو أبيك… لتشكره فقط.'], [16, 'قبل أن تأكل… تذكّر من زرع ومن طبخ، واحمد الله.'], [14, 'قبل أن تنام… عُدَّ ثلاثَ نِعَمٍ من يومك.'], [27, 'أرسل لصديقٍ صالح: «أحمد اللهَ عليك».']];
  def('CH-00', { name: 'تحدّي ٧ أيام: الإعلان', group: 'CH', family: 'تحدّي الحمد', pillar: 'شاركنا', formats: F_POST, alt: 'تحدّي سبعة أيام مع النِّعَم من تطبيق الحمد.', build: (c) => post(c, { chipText: '#تحدي_الحمد', head: `سبعةُ أيام…<br>${acc('سبعُ نِعَم')}`, hs: 116, sub: 'كلَّ يومٍ نعمةٌ وفعلٌ صغير، دقيقةٌ واحدة. ابدأ معنا غدًا.', visual: `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:${c.px(14)}px;max-width:${c.px(760)}px">${CHALLENGE.map(([nn]) => medal(c, iconOf(nn), { size: c.pick({ story: 130, square: 84, link: 84, wide: 110 }, 104) })).join('')}</div>` }) });
  CHALLENGE.forEach(([nn, task], k) => def(`CH-0${k + 1}`, {
    name: `تحدّي الحمد: اليوم ${k + 1}`, group: 'CH', family: 'تحدّي الحمد', pillar: 'شاركنا', formats: F_DAILY, alt: `تحدّي الحمد، اليوم ${k + 1}: ${BY[nn].title}. ${task}`,
    build: (c) => post(c, { chipText: `#تحدي_الحمد · اليوم ${AR(k + 1)} من ${AR(7)}`, visual: { medal: iconOf(nn) }, visualSize: 0.85, head: BY[nn].title, hs: 110, sub: task, ss: 48, note: 'صوّر لحظتك وشاركها في قصتك' }),
  }));

  /* ===================== CD — countdown to launch ===================== */
  [7, 6, 5, 4, 3, 2, 1, 0].forEach((d) => def(`CD-${d}`, {
    name: d ? `عدّ تنازلي: ${d}` : 'عدّ تنازلي: اليوم', group: 'CD', family: 'العدّ التنازلي', pillar: 'الإطلاق', formats: ['story', 'square', 'portrait'],
    alt: d ? `بقي ${d} على إطلاق تطبيق الحمد على Google Play.` : 'اليوم يصل تطبيق الحمد إلى Google Play.',
    build(c) {
      const unit = d === 1 ? 'يومٌ واحد' : d === 2 ? 'يومان' : `أيام`;
      const big = d ? `<div class="t-num" data-fs="${c.px(c.pick({ story: 420, square: 260 }, 330))}" style="font-size:${c.px(c.pick({ story: 420, square: 260 }, 330))}px;line-height:1.1">${AR(d)}</div>` : display(c, gold('اليوم'), c.pick({ story: 220, square: 150 }, 180));
      const pct = (7 - d) / 7;
      return page(c, {
        bg: { cone: 0.09, coneAt: '50% 36%', warm: 0.06 + (7 - d) * 0.01, warmAt: '50% 42%' },
        under: c.th === 'layl' ? particles(c, { n: 30 + (7 - d) * 6, seed: 70 + d, box: [0, c.H * 0.2, c.W, c.H * 0.55], rmax: 6, omin: 0.12, omax: 0.75 }) : '',
        top: chip(c, d ? 'العدّ التنازلي' : 'وصل «الحمد»'),
        mid: big + title(c, d ? (d > 2 ? `${unit}… ${acc('ويصل «الحمد»')}` : `${unit}… ${acc('ويصل «الحمد»')}`) : `«الحمد» ${acc(`على ${ltr('Google Play')}`)}`, c.pick({ story: 84, square: 64 }, 74)) + thread(c, { w: 520, pct: d ? pct : 1 }),
        foot: d ? sig(c, { size: sigSize(c) }) : cta(c, 'حمّله الآن', { size: 40 }) + gap(c, 14) + kick(c, ltr('alhamd.app'), 30),
        gap: c.pick({ story: 40, square: 16 }, 28),
      });
    },
  }));

  /* ===================== BR — brand kit ===================== */
  def('BR-01', { name: 'صورة الحساب', group: 'BR', family: 'الهوية', formats: ['avatar'], alt: 'شعار الحمد', build: (c) => `${bg(c, { cone: 0.1, coneAt: '50% 42%', vignette: false })}<div class="safe" style="justify-content:center">${wm(c, 420)}</div>` });
  def('BR-02', { name: 'صورة الحساب (ألوان الأيقونة)', group: 'BR', family: 'الهوية', formats: ['avatar'], themes: ['nahar'], alt: 'شعار الحمد بألوان أيقونة التطبيق', build: (c) => `<div class="bgl" style="background:#2A1F19"></div><div class="safe" style="justify-content:center">${wm(c, 420, { word: '#F4EDE3', line: '#D4704F' })}</div>` });
  const HL = [['sparkle', 'نعمة اليوم'], ['home', 'التطبيق'], ['book', 'سجلّ الحمد'], ['calendar', 'المداومة'], ['beads', 'المسبحة'], ['shield', 'خصوصيتك'], ['compass', 'رحلتي'], ['share', 'شاركونا']];
  HL.forEach(([ic, label], k) => def(`BR-HL-${k + 1}`, { name: `غلاف القصص المميزة: ${label}`, group: 'BR-HL', family: 'الهوية', formats: ['hl'], alt: label, build: (c) => `${bg(c, { cone: 0.06, coneAt: '50% 50%', vignette: false })}<div class="safe" style="justify-content:center;gap:${c.px(40)}px"><div style="width:${c.px(560)}px;height:${c.px(560)}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:${c.px(5)}px solid var(--stroke);box-shadow:0 0 0 ${c.px(22)}px var(--halo);color:var(--accent)">${uicon(c, ic, 260, 1.3)}</div></div>` }));
  const bannerArt = (c, names) => `<div style="display:flex;gap:${c.px(22)}px;opacity:0.9">${names.map((x) => medal(c, x, { size: 150 })).join('')}</div>`;
  const banner = (c, line, { live = false, art: withArt = true } = {}) => page(c, {
    bg: { cone: 0.08, coneAt: '50% 40%', warm: 0.05, warmAt: '50% 50%' },
    mid: wm(c, 150) + gap(c, 10) + title(c, line, 64, { extra: 'white-space:nowrap' }) + kick(c, live ? `متاح الآن على ${ltr('Google Play')} · ${ltr('alhamd.app')}` : `قريبًا على ${ltr('Google Play')} · ${ltr('alhamd.app')}`, 34),
    side: withArt ? sideArt(bannerArt(c, ['maa', 'basar', 'nawm'])) : '', sideW: 0.34, gap: 16,
  });
  [['xhead', 'X'], ['fbcover', 'فيسبوك'], ['ytban', 'يوتيوب'], ['licover', 'لينكدإن']].forEach(([f, label], k) => {
    def(`BR-0${3 + k}`, { name: `غلاف ${label} (قبل الإطلاق)`, group: 'BR', family: 'الهوية', formats: [f], alt: `غلاف ${label}: الحمد — نعمةٌ كلَّ يوم، قريبًا على Google Play`, build: (c) => banner(c, `نعمةٌ كلَّ يوم… ${acc('ودقيقتان من التأمّل')}`, { art: f !== 'licover' }) });
    def(`BR-0${3 + k}L`, { name: `غلاف ${label} (بعد الإطلاق)`, group: 'BR', family: 'الهوية', formats: [f], alt: `غلاف ${label}: الحمد — متاح الآن على Google Play`, build: (c) => banner(c, `نعمةٌ كلَّ يوم… ${acc('ودقيقتان من التأمّل')}`, { live: true, art: f !== 'licover' }) });
  });
  def('BR-07', { name: 'صورة مشاركة الرابط', group: 'BR', family: 'الهوية', formats: ['link'], alt: 'الحمد: نعمةٌ كلَّ يوم — تطبيقٌ هادئ لتأمّل نِعَم الله', build: (c) => page(c, { bg: { cone: 0.08, coneAt: '62% 40%', warm: 0.05, warmAt: '24% 60%' }, mid: wm(c, 190) + gap(c, 8) + title(c, 'نعمةٌ كلَّ يوم', 84) + body(c, 'تطبيقٌ هادئ لتأمّل نِعَم الله', 44) + kick(c, ltr('alhamd.app'), 38), side: sideArt(phone(c, 'home_top', { w: 470, rotate: -5 })), sideW: 0.4, gap: 16 }) });

  /* ===================== GP — Google Play ===================== */
  def('GP-01', { name: 'صورة المتجر الرئيسية', group: 'GP', family: 'المتجر', formats: ['gpfeat'], alt: 'الحمد: نعمةٌ كلَّ يوم', build: (c) => page(c, { bg: { cone: 0.08, coneAt: '62% 40%', warm: 0.06, warmAt: '24% 60%' }, mid: wm(c, 200) + gap(c, 10) + title(c, 'نعمةٌ كلَّ يوم', 90) + body(c, 'تطبيقٌ هادئ لتأمّل نِعَم الله', 48), side: sideArt(phone(c, 'home_top', { w: 470, rotate: -6 })), sideW: 0.38, gap: 18 }) });
  [['home_top', 'نعمةٌ واحدة كلَّ يوم', 'بآيتها وتدبّرها'], ['reflect_2_visualize', 'دقيقتان من التأمّل', 'جملةً بعد جملة، بلا استعجال'], ['reflect_5_hamd', 'تحمد الله بقلبٍ حاضر', 'وتختم بدعاء اليوم'], ['tab_journal', 'سجلّ الحمد', 'لك وحدك، على جهازك'], ['tab_tasbih', 'المسبحة وحصن المسلم', 'أذكارٌ وتلاواتٌ هادئة'], ['tab_journey', 'رحلتك مع النِّعَم', 'محطّة بعد محطّة، بلا ضغط']].forEach(([src, h, s], k) => def(`GP-0${k + 2}`, {
    name: `لقطة المتجر ${k + 1}: ${h}`, group: 'GP', family: 'المتجر', formats: ['gpshot'], alt: `${h} — ${s}`,
    build: (c) => bg(c, { cone: 0.07, coneAt: '50% 16%' }) + `<div class="safe" style="padding:${c.safe[0]}px ${c.safe[1]}px 0 ${c.safe[3]}px;gap:${c.px(24)}px"><div class="slot top" style="gap:${c.px(16)}px">${title(c, h, 100, { fit: false })}${body(c, s, 46, { fit: false })}</div><div class="slot" style="flex:1 1 auto;justify-content:flex-start;margin-top:${c.px(40)}px">${phone(c, src, { w: 800 })}</div></div>`,
  }));

  /* ===================== WP — wallpapers ===================== */
  const F_WP = ['wphone', 'wand', 'wdesk'];
  def('WP-01', { name: 'خلفية: الحمد لله', group: 'WP', family: 'خلفيات', formats: F_WP, alt: 'خلفية: الحمد لله، بقلبٍ حاضر', build: (c) => page(c, { bg: { cone: 0.1, coneAt: '50% 55%', warm: 0.12, warmAt: '50% 55%' }, under: c.th === 'layl' ? particles(c, { n: 90, seed: 21, box: [0, c.H * 0.3, c.W, c.H * 0.45], rmax: 7, omin: 0.15, omax: 0.9 }) : '', mid: display(c, gold('الحمدُ لله'), 210) + quote(c, 'بقلبٍ حاضر… لا بلسانٍ معتاد.', 58), foot: wm(c, 56), gap: 20 }) });
  def('WP-02', { name: 'خلفية: النعمة لا تُرى', group: 'WP', family: 'خلفيات', formats: F_WP, alt: 'خلفية: النعمة لا تُرى حتى تغيب', build: (c) => page(c, { bg: { cone: 0.06, coneAt: '50% 50%', warm: 0.06 }, mid: art(c, () => A.glassArt('lit', { ripple: true }), { w: c.pick({ wdesk: 360 }, 440) }) + gap(c, 30) + title(c, `النعمةُ لا تُرى…<br>${acc('حتى تغيب.')}`, 104), foot: wm(c, 56), side: '', gap: 20 }) });
  def('WP-03', { name: 'خلفية: كم نعمة؟', group: 'WP', family: 'خلفيات', formats: F_WP, alt: 'خلفية: كم نعمةً مرّت بك اليوم؟', build: (c) => page(c, { bg: { cone: 0.06, coneAt: '50% 50%' }, mid: art(c, () => A.houseArt('lit'), { w: c.pick({ wdesk: 380 }, 520), glow: true }) + gap(c, 20) + title(c, `كم نعمةً<br>${acc('مرّت بك اليوم؟')}`, 108), foot: wm(c, 56), gap: 20 }) });
  def('WP-04', {
    name: 'خلفية: أربعون نعمة', group: 'WP', family: 'خلفيات', formats: F_WP, alt: 'خلفية: رموز النِّعَم الأربعين',
    build(c) {
      const cols = c.W > c.H ? 10 : 5, size = (c.W - c.px(160)) / cols / c.k * (c.W > c.H ? 0.82 : 0.66);
      const grid = `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${c.px(26)}px ${c.px(18)}px;justify-items:center;opacity:0.85">${B.map((b) => medal(c, ICON[b.id], { size, sw: 1.4 })).join('')}</div>`;
      return page(c, { bg: { cone: 0.05, coneAt: '50% 50%' }, mid: grid, foot: wm(c, 56), gap: 30 });
    },
  });

  /* ===================== SK — WhatsApp stickers (transparent, 512×512) ===================== */
  const STK = [['الحمدُ لله', 'duaa'], ['اللهمّ لك الحمد', 'marifa'], ['الحمدُ لله على كلّ حال', 'hifz'], ['نعمة', 'fitra'], ['سبحان الله', 'dhikr'], ['ما شاء الله', 'janna'], ['جزاك الله خيرًا', 'umm'], ['بارك الله فيك', 'rizq'], ['جمعةٌ مباركة', 'salah'], ['رمضانُ مبارك', 'ramadan'], ['تقبّل الله', 'quran'], ['آمين', 'duaa']];
  STK.forEach(([t, ic], k) => def(`SK-${pad2(k + 1)}`, {
    name: `ملصق: ${t}`, group: 'SK', family: 'ملصقات', formats: ['sticker'], transparent: true, alt: t,
    build(c) {
      const S = c.W;
      return `<div class="abs" style="left:${S * 0.04}px;top:${S * 0.04}px;width:${S * 0.92}px;height:${S * 0.92}px;border-radius:${S * 0.2}px;background:#fff;box-shadow:0 ${S * 0.02}px ${S * 0.04}px rgba(0,0,0,0.18)"></div>` +
        `<div class="abs" style="left:${S * 0.075}px;top:${S * 0.075}px;width:${S * 0.85}px;height:${S * 0.85}px;border-radius:${S * 0.17}px;overflow:hidden">${bg(c, { cone: 0.1, coneAt: '50% 40%', vignette: false, pat: 0.07 })}</div>` +
        `<div class="safe" style="justify-content:center;gap:${S * 0.03}px;padding:${S * 0.12}px"><div style="width:${S * 0.24}px;height:${S * 0.24}px;color:var(--accent)">${window.ICONS.glyph(ic, { sw: 1.8 })}</div>` +
        `<div class="t-title fit" data-fs="${S * (t.length > 16 ? 0.1 : t.length > 9 ? 0.125 : 0.165)}" style="font-size:${S * (t.length > 16 ? 0.1 : t.length > 9 ? 0.125 : 0.165)}px;line-height:1.3;color:var(--text)">${t}</div></div>`;
    },
  }));
  def('SK-TRAY', { name: 'أيقونة حزمة الملصقات', group: 'SK', family: 'ملصقات', formats: ['tray'], themes: ['layl'], transparent: true, alt: 'الحمد', build: (c) => `<div class="abs" style="inset:4px;border-radius:22px;background:#15152A"></div><div class="safe" style="justify-content:center">${wm(c, 420)}</div>` });
})();
