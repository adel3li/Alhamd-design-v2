/**
 * Renders still creatives from kit/kit.html.
 *
 *   node tools/render-stills.cjs                       # everything: every format × both themes
 *   node tools/render-stills.cjs --ids NB-15,PS-03     # some creatives (prefix match: --ids NB)
 *   node tools/render-stills.cjs --formats story --themes layl
 *   node tools/render-stills.cjs --ids JR-05- --formats portrait --scale 2 --out out/stills-4k   # 4K: 2160×2700 for a 4:5 slide
 *
 * Writes out/stills/<id>/<id>_<theme>_<format>.png and out/stills/meta.json
 * (one row per file: id, name, group, theme, format, size, and how much the text had to shrink).
 */
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : def; };
const OUT = path.resolve(root, arg('out', 'out/stills'));
const WORKERS = Number(arg('workers', 6));
const ids = arg('ids', null);
const onlyF = arg('formats', null);
const onlyT = arg('themes', null);
const SCALE = Number(arg('scale', 1)); // device pixels per CSS pixel: 2 renders a 1080×1350 slide at 2160×2700
const url = `file://${path.join(root, 'kit', 'kit.html')}`;

(async () => {
  const browser = await chromium.launch();
  const open = async () => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: SCALE });
    page.on('pageerror', (e) => console.error('page error:', e.message));
    await page.goto(url);
    await page.waitForFunction(() => window.KIT && window.KIT.REG && Object.keys(window.KIT.REG).length > 0);
    await page.evaluate(() => window.KIT.loadFonts());
    return page;
  };
  const first = await open();
  const reg = await first.evaluate(() => Object.values(window.KIT.REG).filter((r) => r.kind === 'still').map(({ id, name, group, family, pillar, formats, themes, alt, review, transparent, slide, slides }) => ({ id, name, group, family, pillar, formats, themes, alt, review, transparent, slide, slides })));
  const want = ids ? ids.split(',') : null;
  const jobs = [];
  for (const r of reg) {
    if (want && !want.some((w) => r.id === w || r.id.startsWith(w))) continue;
    for (const th of r.themes) {
      if (onlyT && !onlyT.split(',').includes(th)) continue;
      for (const f of r.formats) {
        if (onlyF && !onlyF.split(',').includes(f)) continue;
        jobs.push({ ...r, th, f });
      }
    }
  }
  console.log(`${jobs.length} files from ${new Set(jobs.map((j) => j.id)).size} creatives, ${WORKERS} workers`);
  const metaFile = path.join(OUT, 'meta.json');
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
  const t0 = Date.now();
  let done = 0, k = 0;
  const pages = [first, ...(await Promise.all(Array.from({ length: WORKERS - 1 }, open)))];
  await Promise.all(pages.map(async (page) => {
    while (k < jobs.length) {
      const j = jobs[k++];
      const res = await page.evaluate((x) => window.KIT.renderStill(x).then((r) => r), { id: j.id, f: j.f, th: j.th });
      await page.setViewportSize({ width: res.w, height: res.h });
      await page.evaluate(() => window.KIT.frame());
      const dir = path.join(OUT, j.id);
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `${j.id}_${j.th}_${j.f}.png`);
      await page.screenshot({ path: file, clip: { x: 0, y: 0, width: res.w, height: res.h }, omitBackground: !!j.transparent });
      meta[`${j.id}_${j.th}_${j.f}`] = { id: j.id, name: j.name, group: j.group, family: j.family, pillar: j.pillar, alt: j.alt, review: !!j.review, slide: j.slide, slides: j.slides, theme: j.th, format: j.f, w: res.w * SCALE, h: res.h * SCALE, shrink: Math.min(1, ...(res.scales.length ? res.scales : [1])) };
      done += 1;
      if (done % 50 === 0) console.log(`${done}/${jobs.length} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  }));
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 1));
  await browser.close();
  const tight = Object.values(meta).filter((m) => m.shrink < 0.8);
  console.log(`done: ${done} files in ${((Date.now() - t0) / 1000).toFixed(0)} s` + (tight.length ? ` · ${tight.length} shrank below 80%: ${tight.slice(0, 12).map((m) => `${m.id}/${m.theme}/${m.format} ${(m.shrink * 100).toFixed(0)}%`).join(', ')}` : ''));
})().catch((e) => { console.error(e); process.exit(1); });
