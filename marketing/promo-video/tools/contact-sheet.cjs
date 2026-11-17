/**
 * Contact sheets: every frame on one page, with its scene number, name and draft voice-over.
 *
 *   node tools/contact-sheet.cjs
 *
 * Output: out/contact-sheet-main.png (the 24 frames of the film)
 *         out/contact-sheet-alt.png  (alternative hooks and other formats)
 */
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const sb = JSON.parse(fs.readFileSync(path.join(root, 'storyboard.json'), 'utf8'));
const frameUrl = (id) => `file://${path.join(root, 'out', 'frames', `${id}.png`)}`;
const ar = (n) => String(n).padStart(2, '0').replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

const css = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #0C0C1C; color: #EDEDF5; font-family: 'IBM Plex Sans Arabic', sans-serif; }
  .sheet { width: 1920px; padding: 64px 56px 72px; direction: rtl; background:
    radial-gradient(ellipse 60% 18% at 50% 0%, rgba(237,237,245,0.06), transparent 70%), #0C0C1C; }
  header { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; margin-bottom: 44px;
    padding-bottom: 28px; border-bottom: 1px solid #2E2E4A; }
  .wm { display: inline-flex; flex-direction: column; gap: 10px; }
  .wm b { font-family: Amiri, serif; font-weight: 700; font-size: 64px; line-height: 1; color: #E4C368; }
  .wm i { position: relative; display: block; height: 3px; background: #C8A951; border-radius: 3px; margin-right: 2px; }
  .wm i::after { content: ""; position: absolute; right: -4px; top: -4px; width: 11px; height: 11px; border-radius: 50%; background: #C8A951; }
  h1 { margin: 0; font-family: Amiri, serif; font-weight: 700; font-size: 54px; line-height: 1.3; }
  h1 span { color: #E4C368; }
  .meta { color: #AEAECB; font-size: 24px; margin-top: 8px; }
  .grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 40px 28px; }
  .cell { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  .cell img { width: 100%; display: block; border-radius: 22px; border: 1px solid #2E2E4A; }
  .cell.r45 img { aspect-ratio: 4 / 5; object-fit: cover; }
  .lab { display: flex; align-items: baseline; gap: 10px; }
  .num { font-weight: 700; color: #E4C368; font-size: 26px; }
  .nm { font-weight: 600; font-size: 25px; }
  .act { font-size: 18px; color: #8E8EB0; margin-inline-start: auto; }
  .vo { font-family: Amiri, serif; font-size: 25px; line-height: 1.55; color: #C7C4D8; border-right: 3px solid #C8A951; padding-right: 12px; }
  .vo.silent { border-right-color: #2E2E4A; }
  .vo.silent { color: #6E6E92; font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 21px; }
  h2 { font-family: Amiri, serif; font-weight: 700; font-size: 40px; margin: 0 0 6px; }
  .note { color: #AEAECB; font-size: 22px; margin: 0 0 24px; }
  .row { display: grid; gap: 28px; margin-bottom: 52px; }
  .hook { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: rgba(30,30,56,0.5);
    border: 1px solid #2E2E4A; border-radius: 28px; padding: 22px; }
  .hook h3 { grid-column: 1 / -1; margin: 0; font-family: Amiri, serif; font-size: 34px; color: #E4C368; }
  .hook p { grid-column: 1 / -1; margin: 0; color: #AEAECB; font-size: 21px; line-height: 1.6; }
`;

function page(body) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=block" rel="stylesheet">
  <style>${css}</style></head><body>${body}</body></html>`;
}

const actOf = {};
sb.acts.forEach((a) => a.frames.forEach((f) => { actOf[f] = a.name; }));

function mainSheet() {
  let n = 0;
  const cells = sb.acts.flatMap((a) => a.frames).map((id) => {
    n += 1;
    const fr = sb.frames[id];
    // a line that spans frames is shown on its first frame; later frames say so
    const covered = !fr.vo && id !== 'F10';
    const vo = fr.vo
      ? `<div class="vo">${fr.vo}</div>`
      : `<div class="vo silent">${id === 'F10' ? 'صمت' : 'يكمل الجملة السابقة'}</div>`;
    return `<div class="cell"><img src="${frameUrl(id)}"><div class="lab"><span class="num">${ar(n)}</span><span class="nm">${fr.name}</span><span class="act">${actOf[id]}</span></div>${covered ? vo : vo}</div>`;
  });
  return page(`<div class="sheet">
    <header>
      <div><h1>ستوري بورد · <span>${sb.title}</span></h1>
      <div class="meta">فيديو طولي ٩:١٦ للريلز وتيك توك وشورتس · ٢٤ مشهدًا · حوالي ٥٠ ثانية · التعليق الصوتي مسودة</div></div>
      <div class="wm"><b>الحمد</b><i></i></div>
    </header>
    <div class="grid">${cells.join('')}</div></div>`);
}

function altSheet() {
  const hooks = sb.hooks.map((h) => `<div class="hook">
      <h3>بداية بديلة: ${h.name}</h3>
      ${h.frames.map((f, i) => `<div class="cell"><img src="${frameUrl(f)}"><div class="vo">${h.vo[i]}</div></div>`).join('')}
      <p>${h.why} ${h.then}</p></div>`).join('');
  const formats = sb.formats.map((f) => `<div class="cell ${f.id.startsWith('P45') ? 'r45' : ''}"><img src="${frameUrl(f.id)}">
      <div class="lab"><span class="nm">${f.name}</span></div><div class="vo silent">${f.note}</div></div>`).join('');
  return page(`<div class="sheet">
    <header>
      <div><h1>بدايات بديلة · <span>ومقاسات أخرى</span></h1>
      <div class="meta">أول ثلاث ثوانٍ تحدد إن كان المشاهد سيكمل؛ نختار واحدة أو نجرّب اثنتين</div></div>
      <div class="wm"><b>الحمد</b><i></i></div>
    </header>
    <div class="row" style="grid-template-columns: repeat(3, 1fr)">${hooks}</div>
    <h2>الغلاف ومنشورات الفيد</h2>
    <p class="note">غلاف للريلز/تيك توك، ونسختان ٤:٥ للمنشورات العادية.</p>
    <div class="row" style="grid-template-columns: 0.75fr 1fr 1fr; align-items: start">${formats}</div>
  </div>`);
}

(async () => {
  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 1920, height: 1200 }, deviceScaleFactor: 1 });
  for (const [name, html] of [['contact-sheet-main', mainSheet()], ['contact-sheet-alt', altSheet()]]) {
    const file = path.join(root, 'out', `${name}.html`);
    fs.writeFileSync(file, html);
    await pg.goto(`file://${file}`);
    await pg.evaluate(() => Promise.all([
      document.fonts.load('700 50px Amiri', 'الحمد'), document.fonts.load('400 25px Amiri', 'الحمد'),
      document.fonts.load('600 25px "IBM Plex Sans Arabic"', 'الحمد'), document.fonts.load('400 25px "IBM Plex Sans Arabic"', 'الحمد'),
    ]));
    await pg.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))));
    await pg.waitForTimeout(300);
    await pg.locator('.sheet').screenshot({ path: path.join(root, 'out', `${name}.png`) });
    fs.unlinkSync(file);
    console.log(name);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
