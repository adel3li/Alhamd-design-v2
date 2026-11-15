// Wraps the single-file case study drafts in case-study/ into standalone pages
// under public/story/, which Vite copies into the build as /story/.
import {cpSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  {src: 'alhamd-case-study-v4.html', out: 'story/index.html', base: '/story/'},
  {src: 'alhamd-case-study-v3.html', out: 'story/v3/index.html', base: '/story/v3/'},
  {src: 'alhamd-case-study-v2.html', out: 'story/v2/index.html', base: '/story/v2/'},
  {src: 'alhamd-case-study.html', out: 'story/v1/index.html', base: '/story/v1/'},
];

for (const {src, out, base} of pages) {
  const body = readFileSync(resolve(root, 'case-study', src), 'utf8');
  const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!-- Draft: placeholders are still on this page. Remove once they are filled. -->
<meta name="robots" content="noindex">
<base href="${base}">
<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
${body}
</html>
`;
  const dest = resolve(root, 'public', out);
  mkdirSync(dirname(dest), {recursive: true});
  writeFileSync(dest, html);
}

cpSync(resolve(root, 'case-study/img'), resolve(root, 'public/story/img'), {recursive: true});
console.log(`story: wrote ${pages.length} pages to public/story/`);
