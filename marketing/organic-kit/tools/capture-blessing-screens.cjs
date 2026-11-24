/**
 * Captures the app's blessing card (the phone on the last slide of HS-nn), «ليل» and «نهار».
 *
 *   bun run dev                                                              # in the repo root (:3000)
 *   node marketing/organic-kit/tools/capture-blessing-screens.cjs --from 1 --to 10
 *   node marketing/organic-kit/tools/capture-blessing-screens.cjs --n 5 --day 2027-11-28   # one blessing on a given day
 *
 * The app shows one blessing per calendar day (src/lib/dailyLogic.ts): the pool is every blessing but «نعمة الإسلام»,
 * in order, indexed by the day number modulo the pool size. So the day of blessing n is found from its place in the
 * pool; «نعمة الإسلام» (n = 1) is the welcome blessing, shown before the welcome is finished. The title on screen is
 * checked against the blessing, and a mismatch stops the run.
 * Writes ../../promo-video/scenes/app/b<nn>_home_card.png («ليل») and app-light/ («نهار»), 390×844 at 3×.
 * Existing files are kept unless --force.
 */
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : def; };
const REPO = path.resolve(__dirname, '..', '..', '..');
const blessings = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'blessings_ar.json'), 'utf8')).blessings;
const pool = blessings.filter((b) => b.id !== 'islam').sort((a, b) => a.order - b.order);
const byOrder = Object.fromEntries(blessings.map((b) => [b.order, b]));
const force = process.argv.includes('--force');

/** The first local day from 2027-01-01 on which the app shows blessing n ("YYYY-MM-DD"). */
function dayFor(n) {
  if (n === 1) return '2027-01-01';
  const idx = pool.findIndex((b) => b.order === n);
  const start = Math.floor(Date.UTC(2027, 0, 1) / 86400000);
  let d = start;
  while (((d % pool.length) + pool.length) % pool.length !== idx) d += 1;
  return new Date(d * 86400000).toISOString().slice(0, 10); // a UTC day number back to its calendar date, not "today"
}

const single = arg('n', null);
const list = single ? [Number(single)] : Array.from({ length: Number(arg('to', 10)) - Number(arg('from', 1)) + 1 }, (_, k) => Number(arg('from', 1)) + k);

(async () => {
  // PW_CHANNEL=chrome uses the computer's installed Google Chrome instead of Playwright's own download
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  for (const n of list) {
    const nn = String(n).padStart(2, '0');
    const day = arg('day', null) || dayFor(n);
    for (const theme of ['dark', 'light']) {
      const out = path.resolve(__dirname, '..', '..', 'promo-video', 'scenes', theme === 'light' ? 'app-light' : 'app');
      const file = path.join(out, `b${nn}_home_card.png`);
      if (fs.existsSync(file) && !force) continue;
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'ar' });
      const page = await ctx.newPage();
      await page.clock.install({ time: new Date(`${day}T09:30:00`) });
      await page.addInitScript(([th, welcome]) => {
        localStorage.setItem('alhamd_onboarded', 'true');
        if (welcome) localStorage.setItem('alhamd_welcome_seen', 'true');
        localStorage.setItem('alhamd:tourComplete', 'true');
        localStorage.setItem('alhamd:analytics_consent', 'false');
        localStorage.setItem('alhamd_theme_v2', th);
      }, [theme, n !== 1]);
      const settle = async (ms = 1500) => { await page.clock.runFor(ms); await page.waitForTimeout(700); };
      await page.goto('http://localhost:3000/', { waitUntil: 'load' });
      await settle(3000);
      await page.evaluate(() => document.fonts.ready);
      const title = (await page.locator('#card-today-blessing h1').innerText()).trim();
      if (title !== byOrder[n].title.trim()) throw new Error(`blessing ${n} on ${day} (${theme}): the app shows «${title}», not «${byOrder[n].title}»`);
      const top = await page.locator('#card-today-blessing').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
      await page.evaluate((y) => window.scrollTo(0, y - 16), top);
      await settle(1200);
      fs.mkdirSync(out, { recursive: true });
      await page.screenshot({ path: file });
      await ctx.close();
    }
    console.log(`b${nn} ${day} ${byOrder[n].title}`);
  }
  await browser.close();
})().catch((e) => { console.error(e.message || e); process.exit(1); });
