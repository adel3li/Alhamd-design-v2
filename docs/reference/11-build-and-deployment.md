# Build and deployment

## 1. Commands

Defined in `package.json:6`–`12`. Bun is the package manager (`bun.lock`); npm works too.

| Command | What it runs | Notes |
|---|---|---|
| `bun install` | Installs 252 packages | About 6 s on a clean machine |
| `bun run dev` | `vite --port=3000 --host=0.0.0.0` | App at `http://localhost:3000/`, landing page at `http://localhost:3000/landing/` |
| `bun run build` | `vite build && mv dist/index.html dist/app.html` | About 4 s. The rename is what makes host routing work, see section 4 |
| `bun run preview` | `vite preview` | Serves `dist/`. Because of the rename, `/` returns 404 locally; open `/app.html` and `/landing/index.html` |
| `bun run lint` | `tsc --noEmit` | Type check only. Passes with no errors at `68e723a` |
| `bun run clean` | `rm -rf dist server.js` | `server.js` is an AI Studio template leftover; no such file exists |

There is no `test` script.

## 2. Configuration files

### `vite.config.ts`

- Plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`.
- Alias `@` → repository root (`vite.config.ts:11`). No source file uses it.
- Two Rollup inputs: `main` → `index.html`, `landing` → `landing/index.html` (`vite.config.ts:15`–`20`).
- `server.hmr` and `server.watch` are switched off when the env var `DISABLE_HMR` is `'true'`. That is how Google AI Studio runs the project; unset, HMR works normally.

### `tsconfig.json`

Target and lib ES2022 with DOM; `module: ESNext`; `moduleResolution: bundler`; `jsx: react-jsx`; `isolatedModules`; `allowJs`; `allowImportingTsExtensions`; `noEmit`; `skipLibCheck`; `experimentalDecorators` and `useDefineForClassFields: false` (template defaults, nothing uses decorators). `include: ["src"]`, `exclude: ["legacy", "node_modules", "dist"]`. `strict` is off, so `null`/`undefined` mistakes and implicit `any` are not reported by `bun run lint`.

### Environment

The app reads no environment variables. `.env.example` (`GEMINI_API_KEY`, `APP_URL`) and `metadata.json` (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`) come from the AI Studio template; no code calls Gemini.

### `.gitignore`

`node_modules/`, `build/`, `dist/`, `coverage/`, `.DS_Store`, `*.log`, `.env*` except `.env.example`.

## 3. Build output

Measured on `68e723a` with Vite 6.4.4:

| File | Size | Gzip |
|---|---:|---:|
| `dist/app.html` (renamed from `index.html`) | 1.64 kB | 0.78 kB |
| `dist/landing/index.html` | 1.72 kB | 0.83 kB |
| `dist/assets/main-*.js` (the whole app) | 1,031.60 kB | 280.27 kB |
| `dist/assets/client-*.js` (React DOM, shared by both pages) | 224.37 kB | 69.71 kB |
| `dist/assets/landing-*.js` | 26.29 kB | 7.40 kB |
| `dist/assets/main-*.css` | 87.89 kB | 15.01 kB |
| `dist/assets/landing-*.css` | 20.26 kB | 5.25 kB |
| `dist/assets/aistudio/*` | 13 files, about 0.73 MB | copied from `public/` |

Vite warns that `main-*.js` exceeds 500 kB. Nothing is code-split: recharts, motion, every screen, the journey feature and all JSON content load before first paint. The app page needs about 350 kB of gzipped JavaScript; the landing page needs about 77 kB.

Everything in `public/assets/aistudio/` (design sheets, screenshots, the icon palette) is deployed and publicly reachable, for example at `/assets/aistudio/design-sheet-layl-dark_f2b4cff4.html`. No app code references these files.

## 4. Hosting and routing

Hosted on Vercel as a static site. Project `alhamd`, framework preset Vite, Node 26.x, connected to the GitHub repository `adel3li/Alhamd-design-v2`. Pushes to `main` deploy to production; pushes to any other branch create preview deployments. Vercel Authentication is enabled for everything except custom domains, so preview URLs require a Vercel login.

Domains on the project: `alhamd.app`, `app.alhamd.app`, `www.alhamd.app` (308 redirect to the apex), `alhamd-wheat.vercel.app`, and Vercel's generated aliases.

`vercel.json`:

```jsonc
{
  "redirects": [
    // www.alhamd.app/anything → https://alhamd.app/anything (permanent)
  ],
  "rewrites": [
    { "source": "/", "has": [{ "type": "host", "value": "alhamd.app" }], "destination": "/landing/index.html" },
    { "source": "/", "destination": "/app.html" }
  ]
}
```

| Request | Served |
|---|---|
| `https://alhamd.app/` | Landing page |
| `https://app.alhamd.app/` and any `*.vercel.app/` | The app |
| `https://www.alhamd.app/*` | 308 to `https://alhamd.app/*` |

Why the build renames `index.html`: Vercel serves an existing file before it applies rewrites. With `dist/index.html` present, `/` would always return the app and the apex domain could never show the landing page. Shipping the app as `app.html` leaves `/` free for the rewrites (commit `e7dfbbe`).

Consequences of this setup, checked against production on 2026-11-17:

- Only `/` is routed by host. `https://alhamd.app/app.html` serves the app and `https://app.alhamd.app/landing/` serves the landing page.
- Browser storage is per origin, so data entered at `alhamd.app/app.html` is invisible at `app.alhamd.app`.
- Any other path returns 404. The app has no client-side routes, so nothing depends on a catch-all.
- HTML is served with `cache-control: public, max-age=0, must-revalidate`; hashed assets are cached by Vercel's defaults.
- Response headers: `strict-transport-security` only. There is no `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` or `Permissions-Policy`. `vercel.json` has no `headers` block.

## 5. Third-party requests at run time

| Host | When | What |
|---|---|---|
| `fonts.googleapis.com`, `fonts.gstatic.com` | Every page load | Font CSS and files (`index.html:12`–`14`, `landing/index.html`) |
| `everyayah.com` | User plays a recitation | MP3 per verse (`TasbihAudioPlayer.tsx`) |
| `cdn.islamic.network` | Fallback audio source | MP3 per verse (`TasbihAudioPlayer.tsx`) |
| `wa.me`, `twitter.com`, `t.me` | User taps a share button | Opens with the share text in the URL (`ShareCardModal.tsx`) |

The app makes no `fetch`, XHR, beacon or WebSocket call of its own.

## 6. What is not set up

| Missing | Effect |
|---|---|
| Tests and a test runner | No automated check of any behaviour |
| ESLint / Prettier | Style and common-bug rules are not enforced |
| CI (no `.github/`) | Type check and build only run on Vercel's build |
| Web app manifest, service worker, icons | Not installable, no offline use, no favicon |
| Error boundary and error reporting | A render error blanks the page with no report |
| Open Graph image | `twitter:card` is `summary_large_image` but no `og:image` is defined |
| Security headers | See section 4 |
