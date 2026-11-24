/**
 * Renders the reels from kit/kit.html: frames in parallel, then sound and encoding (tools/encode_reel.py).
 *
 *   node tools/render-reels.cjs                    # every reel, every format, both themes
 *   node tools/render-reels.cjs --ids NR-15,RL-01  # some (prefix match: --ids NR)
 *   node tools/render-reels.cjs --themes layl --formats story --at 0.5,3,6   # stills at those seconds (checking)
 *
 * Writes out/reels/<id>/<id>_<theme>_<format>.mp4 (1080 wide, 30 fps, sound design, no voice),
 * a 360p preview (…_preview.mp4), a poster (….jpg) and out/reels/meta.json.
 */
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : def; };
const OUT = path.resolve(root, arg('out', 'out/reels'));
const WORKERS = Number(arg('workers', 6));
const SCALE = Number(arg('scale', 1)); // 0.6667 renders 720×1280 frames (quicker; for review)
const ids = arg('ids', null), onlyF = arg('formats', null), onlyT = arg('themes', null), at = arg('at', null);
const skipDone = process.argv.includes('--skip-done');
const url = `file://${path.join(root, 'kit', 'kit.html')}`;

(async () => {
  const browser = await chromium.launch();
  const open = async () => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: SCALE });
    page.on('pageerror', (e) => console.error('page error:', e.message));
    await page.goto(url);
    await page.waitForFunction(() => window.KIT && window.KIT.setupReel && Object.keys(window.KIT.REG).length > 0);
    return page;
  };
  const pages = await Promise.all(Array.from({ length: WORKERS }, open));
  const reg = await pages[0].evaluate(() => Object.values(window.KIT.REG).filter((r) => r.kind === 'reel').map(({ id, name, group, family, pillar, formats, themes, alt, review }) => ({ id, name, group, family, pillar, formats, themes, alt, review })));
  const want = ids ? ids.split(',') : null;
  const jobs = [];
  for (const r of reg) {
    if (want && !want.some((w) => r.id === w || r.id.startsWith(w))) continue;
    for (const th of r.themes) for (const f of r.formats) {
      if (onlyT && !onlyT.split(',').includes(th)) continue;
      if (onlyF && !onlyF.split(',').includes(f)) continue;
      jobs.push({ ...r, th, f });
    }
  }
  const metaFile = path.join(OUT, 'meta.json');
  fs.mkdirSync(OUT, { recursive: true });
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
  console.log(`${jobs.length} videos, ${WORKERS} workers`);
  const t0 = Date.now();
  for (const j of jobs) {
    const key = `${j.id}_${j.th}_${j.f}`;
    const dir = path.join(OUT, j.id);
    const mp4 = path.join(dir, `${key}.mp4`);
    if (skipDone && !at && fs.existsSync(mp4)) continue;
    const infos = await Promise.all(pages.map((p) => p.evaluate((x) => window.KIT.setupReel(x), { id: j.id, f: j.f, th: j.th })));
    const info = infos[0];
    await Promise.all(pages.map((p) => p.setViewportSize({ width: info.w, height: info.h })));
    fs.mkdirSync(dir, { recursive: true });
    if (at) {
      for (const s of at.split(',').map(Number)) {
        await pages[0].evaluate((T) => { window.KIT.seek(T); return window.KIT.frame(); }, s);
        await pages[0].screenshot({ path: path.join(dir, `${key}_at${s.toFixed(1)}.png`) });
      }
      console.log(`${key}: ${info.total.toFixed(1)} s (stills)`);
      continue;
    }
    const frames = path.join(OUT, '_frames', key);
    fs.rmSync(frames, { recursive: true, force: true });
    fs.mkdirSync(frames, { recursive: true });
    const FPS = info.fps || 30;
    const n = Math.ceil(info.total * FPS);
    const t1 = Date.now();
    await Promise.all(pages.map(async (p, w) => {
      for (let k = w; k < n; k += WORKERS) {
        await p.evaluate((T) => { window.KIT.seek(T); return new Promise((r) => requestAnimationFrame(() => r())); }, k / FPS);
        await p.screenshot({ path: path.join(frames, `${String(k).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
      }
    }));
    fs.writeFileSync(path.join(frames, 'job.json'), JSON.stringify({ ...info, key, out: mp4 }));
    execFileSync('python3', [path.join(root, 'tools', 'encode_reel.py'), frames], { stdio: 'inherit' });
    meta[key] = { id: j.id, name: j.name, group: j.group, family: j.family, pillar: j.pillar, alt: j.alt, review: !!j.review, theme: j.th, format: j.f, w: info.w, h: info.h, seconds: info.total };
    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 1));
    console.log(`${key}: ${info.total.toFixed(1)} s, ${n} frames in ${((Date.now() - t1) / 1000).toFixed(0)} s · total ${((Date.now() - t0) / 60000).toFixed(1)} min`);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
