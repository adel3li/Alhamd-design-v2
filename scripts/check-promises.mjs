// Fails the build when the code breaks a promise the product makes to its users.
// Each check exists because the promise was once broken without anyone deciding to.
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
const sources = [...walk(join(root, 'src')), join(root, 'landing/index.html')]
  .filter((f) => /\.(tsx?|html)$/.test(f))
  .map((f) => ({file: relative(root, f), text: readFileSync(f, 'utf8')}));

const failures = [];
const forbid = (promise, pattern, {except = []} = {}) => {
  for (const {file, text} of sources) {
    if (except.some((e) => file.startsWith(e))) continue;
    text.split('\n').forEach((line, i) => {
      if (pattern.test(line)) failures.push(`${promise}\n    ${file}:${i + 1}: ${line.trim().slice(0, 120)}`);
    });
  }
};

// 1. «بلا سلاسل» — no streaks, consecutive-day counts or completion percentages.
forbid('No streaks: the app must not count consecutive days.', /streak|المتتالية|متتالية|\bFlame\b/i);

// 2. No borrowed history: a new user starts with nothing pre-filled.
forbid('No seeded history: new users start empty.', /initialSample|id: 'sample_/);

// 3. One true duration: every script in the data is 80 seconds.
forbid('One duration: say 80 seconds, not minutes.', /(دقيقتين|دقيقتان|٣ دقائق|خمس دقائق) (من التأمّل|هادئة)|مدتها ٣ دقائق/, {
  except: ['src/data/'],
});
const {blessings} = JSON.parse(readFileSync(join(root, 'src/data/blessings_ar.json'), 'utf8'));
for (const b of blessings) {
  const total = b.istisharSteps.reduce((sum, s) => sum + s.durationSec, 0);
  if (b.istisharSteps.length !== 5 || total !== 80) {
    failures.push(`One duration: "${b.id}" has ${b.istisharSteps.length} steps totalling ${total}s (expected 5 steps, 80s).`);
  }
}

// 4. No review claim before the review: copy may not say texts were reviewed
//    by scholars while any blessing is still unapproved.
const approved = blessings.filter((b) => b.reviewStatus === 'approved').length;
if (approved < blessings.length) {
  forbid(
    `No unearned review claim: ${approved} of ${blessings.length} blessings are approved.`,
    /يمرّ على أهل العلم قبل نشره|كلها مراجَعة|النعم المعتمدة في التطبيق: \{toArabicNumerals\(\d+\)\}/,
  );
}

// 5. The north star stays instrumented, and stays private.
const analytics = sources.find((s) => s.file === 'src/lib/analytics.ts')?.text ?? '';
const reflection = sources.find((s) => s.file === 'src/components/screens/ReflectionModal.tsx')?.text ?? '';
if (!/trackEvent\('reflection_completed'/.test(reflection)) {
  failures.push('North star: ReflectionModal must record reflection_completed.');
}
if (!/consent !== 'true'/.test(analytics)) {
  failures.push('Privacy: analytics must stay behind the consent check.');
}

if (failures.length) {
  console.error(`\npromises: ${failures.length} broken\n\n  ` + failures.join('\n\n  ') + '\n');
  process.exit(1);
}
console.log(`promises: all kept (${approved}/${blessings.length} blessings approved)`);
