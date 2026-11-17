/**
 * Renders the animated film from scenes/motion.html.
 *
 *   node tools/render-motion.cjs                         # full film → out/promo.mp4
 *   node tools/render-motion.cjs --at 0.4,2.1,13.5       # stills at those seconds → out/motion/at_*.png
 *   node tools/render-motion.cjs --timing out/final-timings.json --audio out/voice-track.wav --out out/alhamd-promo.mp4
 *
 * The timing file is the one build_animatic.py (temp voice) or align_voice.py (real voice) writes:
 *   { slots: [{ id, start, len }] } — each scene starts when its cross-fade begins.
 * Audio defaults to the temp-voice track inside out/animatic.mp4, which matches out/timings.json.
 */
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const FPS = Number(arg('fps', 30));
const FADE = 0.4;
const WORKERS = Number(arg('workers', 3));
const timingFile = path.resolve(root, arg('timing', 'out/timings.json'));
const outFile = path.resolve(root, arg('out', 'out/promo.mp4'));
const at = arg('at', null);

const timing = JSON.parse(fs.readFileSync(timingFile, 'utf8'));
const slots = timing.slots.map(({ id, start, len }) => ({ id, start, len }));
const last = slots[slots.length - 1];
const total = last.start + last.len + FADE;
const plan = { fade: FADE, slots };
const url = `file://${path.join(root, 'scenes', arg('page', 'motion.html'))}`;

async function openPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.error('page error:', e.message); });
  await page.goto(url);
  await page.waitForFunction(() => typeof window.setupMotion === 'function');
  await page.evaluate((p) => window.setupMotion(p), plan);
  return page;
}

async function frameAt(page, T, file) {
  await page.evaluate((t) => { window.renderAt(t); return new Promise((r) => requestAnimationFrame(() => r())); }, T);
  await page.screenshot({ path: file, type: 'png' });
}

(async () => {
  const browser = await chromium.launch();
  const motionDir = path.join(root, 'out', 'motion');
  fs.mkdirSync(motionDir, { recursive: true });

  if (at) {
    const page = await openPage(browser);
    for (const s of at.split(',').map(Number)) {
      const file = path.join(motionDir, `at_${s.toFixed(2)}.png`);
      await frameAt(page, s, file);
      console.log(file);
    }
    await browser.close();
    return;
  }

  const framesDir = path.resolve(root, arg('frames', 'out/motion/frames'));
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  const n = Math.ceil(total * FPS);
  console.log(`${slots.length} scenes, ${total.toFixed(2)} s, ${n} frames, ${WORKERS} workers`);
  const t0 = Date.now();
  let done = 0;
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const page = await openPage(browser);
    for (let k = w; k < n; k += WORKERS) {
      await frameAt(page, k / FPS, path.join(framesDir, `${String(k).padStart(5, '0')}.png`));
      done += 1;
      if (done % 150 === 0) console.log(`${done}/${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  }));
  await browser.close();

  let audio = arg('audio', null);
  if (!audio) {
    audio = path.join(motionDir, 'temp-voice.wav');
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(root, 'out', 'animatic.mp4'), '-vn', '-ac', '2', '-ar', '48000', audio]);
  }
  execFileSync('ffmpeg', [
    '-y', '-v', 'error',
    '-framerate', String(FPS), '-i', path.join(framesDir, '%05d.png'),
    '-i', path.resolve(root, audio),
    '-map', '0:v', '-map', '1:a',
    // a touch of temporal grain keeps the dark gradients from banding after compression
    '-vf', 'noise=alls=3:allf=t,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '192k',
    '-t', total.toFixed(3), '-movflags', '+faststart', outFile,
  ]);
  console.log(`${path.relative(root, outFile)}: ${total.toFixed(1)} s in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})().catch((e) => { console.error(e); process.exit(1); });
