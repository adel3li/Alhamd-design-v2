/**
 * Renders the social / store / profile / shareable / print designs from scenes/social.html.
 *
 *   node tools/render-social.cjs              # every design → out/social/<ID>.png at its real size
 *   node tools/render-social.cjs PST1 CA2-1   # only these
 *   node tools/render-social.cjs --scale 2.5 PR1   # print resolution (A3 at 300 dpi needs about 2.83)
 */
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'out', 'social');
fs.mkdirSync(outDir, { recursive: true });
const url = (id) => `file://${path.join(root, 'scenes', 'social.html')}?d=${encodeURIComponent(id)}`;
const scaleArg = process.argv.indexOf('--scale');
const scale = scaleArg > -1 ? Number(process.argv[scaleArg + 1]) : 1;
const wanted = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--scale');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(url('PST1'));
  await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  const sizes = await page.evaluate(() => Object.fromEntries(Object.entries(window.DESIGNS).map(([k, v]) => [k, [v.w, v.h]])));
  const meta = await page.evaluate(() => Object.fromEntries(Object.entries(window.DESIGNS).map(([k, v]) => [k, { w: v.w, h: v.h, theme: v.theme, name: v.name, fmt: v.fmt, group: v.group || null }])));
  fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 1));
  if (process.argv.includes('--meta')) { await browser.close(); return; }
  const ids = wanted.length ? wanted : Object.keys(sizes);
  for (const id of ids) {
    const [w, h] = sizes[id];
    await page.setViewportSize({ width: w, height: h });
    await page.goto(url(id));
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
    await page.locator('#stage').screenshot({ path: path.join(outDir, `${id}${scale !== 1 ? `@${scale}x` : ''}.png`) });
    process.stdout.write(`${id} `);
  }
  process.stdout.write(`\n${ids.length} designs → ${path.relative(root, outDir)}\n`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
