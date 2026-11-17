/**
 * Renders storyboard frames from scenes/index.html to PNG.
 *
 *   node tools/render-frames.cjs            # every frame
 *   node tools/render-frames.cjs F01 F13    # only these
 *
 * Output: out/frames/<ID>.png at 1080×1920 (4:5 frames at 1080×1350).
 */
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'out', 'frames');
fs.mkdirSync(outDir, { recursive: true });

const url = (id, extra = '') => `file://${path.join(root, 'scenes', 'index.html')}?f=${id}${extra}`;

async function waitReady(page) {
  await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  await page.evaluate(() =>
    Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))),
  );
  const ok = await page.evaluate(() =>
    document.fonts.check('700 100px Amiri', 'الحمد') && document.fonts.check('500 40px "IBM Plex Sans Arabic"', 'الحمد'),
  );
  if (!ok) throw new Error('Fonts did not load (Amiri / IBM Plex Sans Arabic)');
  await page.waitForTimeout(120);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(url('F01'));
  await waitReady(page);
  const wanted = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const guides = process.argv.includes('--guides') ? '&guides=1' : '';
  const ids = wanted.length ? wanted : await page.evaluate(() => window.FRAME_IDS);
  for (const id of ids) {
    await page.goto(url(id, guides));
    await waitReady(page);
    const stage = await page.$('#stage');
    await stage.screenshot({ path: path.join(outDir, `${id}${guides ? '_guides' : ''}.png`) });
    process.stdout.write(`${id} `);
  }
  process.stdout.write('\n');
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
