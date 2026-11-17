/**
 * Captures the real app screens used inside the phone mockups (3× scale, 390×844 viewport).
 *
 *   bun run dev                                   # in the repo root, serves the app on :3000
 *   node marketing/promo-video/tools/capture-app-screens.cjs                 # «ليل» → scenes/app/
 *   node marketing/promo-video/tools/capture-app-screens.cjs --theme light   # «نهار» → scenes/app-light/
 *
 * The clock is fixed to 13 Dec 2026 (4 Rajab 1448), the day the app shows «نعمة الماء»,
 * so the story in the film and the app screens talk about the same blessing.
 */
const { chromium } = require('playwright');
const path = require('node:path');

const LIGHT = process.argv.includes('--theme') && process.argv[process.argv.indexOf('--theme') + 1] === 'light';
const OUT = path.resolve(__dirname, '..', 'scenes', LIGHT ? 'app-light' : 'app');
require('node:fs').mkdirSync(OUT, { recursive: true });
const DAY = '2026-12-13T09:30:00';
const JOURNAL = [
  { id: 'e1', date: '2026-12-13', displayDate: 'الأحد ٤ رجب', blessingId: 'blessing_015', shortTitle: 'الماء', categoryLabel: 'نعم الحياة والنفس', text: 'شربتُ اليوم كوب ماءٍ بارد بعد عطش، فتذكّرتُ أن هذه الشربة وحدها نعمةٌ لا أملك منها شيئًا.', offsetDays: 0 },
  { id: 'e2', date: '2026-12-12', displayDate: 'السبت ٣ رجب', blessingId: 'blessing_022', shortTitle: 'الأم', categoryLabel: 'نعم الأهل', text: 'اتصلتُ بها اليوم لأشكرها فقط، فدعت لي دعوةً أذابت قلبي.', offsetDays: 1 },
  { id: 'e3', date: '2026-12-11', displayDate: 'الجمعة ٢ رجب', blessingId: 'blessing_037', shortTitle: 'البصر', categoryLabel: 'نعم العافية', text: 'رأيتُ الفجر من نافذتي، فحمدتُ الله أن أراني إيّاه.', offsetDays: 2 },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'ar' });
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(DAY) });
  await page.addInitScript(([journal, day, theme]) => {
    localStorage.setItem('alhamd_onboarded', 'true');
    localStorage.setItem('alhamd_welcome_seen', 'true');
    localStorage.setItem('alhamd:tourComplete', 'true');
    localStorage.setItem('alhamd:analytics_consent', 'false');
    localStorage.setItem('alhamd_theme_v2', theme);
    localStorage.setItem('alhamd:dev_premium', 'true');
    const base = new Date(day).getTime();
    localStorage.setItem('alhamd_journal', JSON.stringify(journal.map(({ offsetDays, ...e }) => ({ ...e, createdAt: base - offsetDays * 86400000 }))));
  }, [JOURNAL, DAY, LIGHT ? 'light' : 'dark']);

  // Fake time drives the app's timers; real waits let CSS transitions finish before each shot.
  const settle = async (ms = 1500) => { await page.clock.runFor(ms); await page.waitForTimeout(700); };
  const shot = async (name) => { await settle(1200); await page.screenshot({ path: path.join(OUT, `${name}.png`) }); console.log(name); };

  await page.goto('http://localhost:3000/', { waitUntil: 'load' });
  await settle(3000);
  await page.evaluate(() => document.fonts.ready);

  await shot('home_top');
  await page.evaluate(() => window.scrollTo(0, 250));
  await shot('home_card');
  await page.evaluate(() => window.scrollTo(0, 0));

  // The guided reflection: five pauses, then the journal step.
  await page.getByText('استشعر النعمة', { exact: true }).first().click();
  const steps = ['reflect_1_ground', 'reflect_2_visualize', 'reflect_3_deepen', 'reflect_4_return', 'reflect_5_hamd'];
  for (let i = 0; i < steps.length; i++) {
    await page.clock.runFor(26000);
    if (['reflect_2_visualize', 'reflect_4_return', 'reflect_5_hamd'].includes(steps[i])) await shot(steps[i]);
    await page.getByRole('button', { name: i === steps.length - 1 ? 'الحمد لله' : 'التالي', exact: true }).last().click();
  }
  await settle(1500);
  await page.locator('textarea').fill('شربتُ اليوم كوب ماءٍ بارد بعد عطش، فتذكّرتُ أن هذه الشربة وحدها نعمةٌ لا أملك منها شيئًا.');
  for (let k = 0; k < 33; k++) await page.getByRole('button', { name: /الحمد لله/ }).last().click();
  await shot('reflect_6_journal');
  await page.getByRole('button', { name: 'لاحقًا' }).click();
  await settle(4000);

  for (const [id, name] of [['journal', 'tab_journal'], ['consistency', 'tab_consistency'], ['tasbih', 'tab_tasbih'], ['journey', 'tab_journey']]) {
    await page.locator(`#tab-btn-${id}`).click();
    await settle(2500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(name);
  }

  // Share sheet: full card, story size.
  await page.locator('#tab-btn-home').click();
  await settle(2500);
  await page.getByRole('button', { name: 'مشاركة النعمة' }).first().click();
  await settle(1200);
  await page.getByText('شاملة مع الدعاء').first().click();
  await page.getByText('قصة (٩:١٦)').first().click();
  await shot('share_modal_story');

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
