/**
 * Captures the app's blessing card for a packaged blessing (the phone in HS-nn and JR-nn).
 *
 *   bun run dev                                                  # in the repo root (:3000)
 *   node marketing/organic-kit/tools/capture-blessing-screens.cjs --n 5 --day 2027-11-28
 *
 * --day must be a date on which the app shows that blessing (its rotation is by calendar day).
 * Writes promo-video/scenes/app/b<nn>_home_card.png («ليل») and app-light/ («نهار»), 390×844 at 3×.
 */
const { chromium } = require('playwright');
const path = require('node:path');

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : def; };
const N = Number(arg('n', 5));
const DAY = `${arg('day', '2027-11-28')}T09:30:00`;
const nn = String(N).padStart(2, '0');

(async () => {
  const browser = await chromium.launch();
  for (const theme of ['dark', 'light']) {
    const out = path.resolve(__dirname, '..', '..', 'promo-video', 'scenes', theme === 'light' ? 'app-light' : 'app');
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'ar' });
    const page = await ctx.newPage();
    await page.clock.install({ time: new Date(DAY) });
    await page.addInitScript((th) => {
      localStorage.setItem('alhamd_onboarded', 'true');
      localStorage.setItem('alhamd_welcome_seen', 'true');
      localStorage.setItem('alhamd:tourComplete', 'true');
      localStorage.setItem('alhamd:analytics_consent', 'false');
      localStorage.setItem('alhamd_theme_v2', th);
    }, theme);
    const settle = async (ms = 1500) => { await page.clock.runFor(ms); await page.waitForTimeout(700); };
    await page.goto('http://localhost:3000/', { waitUntil: 'load' });
    await settle(3000);
    await page.evaluate(() => document.fonts.ready);
    const title = await page.locator('#card-today-blessing h1').innerText();
    console.log(theme, 'blessing on screen:', title);
    const top = await page.locator('#card-today-blessing').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y - 16), top);
    await settle(1200);
    await page.screenshot({ path: path.join(out, `b${nn}_home_card.png`) });
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
