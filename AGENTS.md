# AGENTS.md

## Project: my-npm-dashboard (pkg-marmot)

npm package download dashboard. Vanilla JS frontend + optional Tauri desktop wrapper.

## Modes

- **CLI**: `npm run dev` — Node.js static server serving `src/` on `localhost:3000`. Hot-reload via `--watch`.
- **Desktop**: Tauri v2 wrapper. Run `npx tauri dev`. Points `frontendDist` at `src/`.

Both modes serve the same frontend. The frontend (`src/index.js`) makes all API calls directly from the browser (CORS to npm registry + GitHub API). No backend proxy.

## Commands

| Command | What |
|---|---|
| `npm run dev` | Start dev server at `localhost:3000` with live-server (auto-reload) |
| `npm start` | Start without auto-reload (node) |
| `PORT=8080 npm run dev` | Custom port |
| `npm run tauri` | Tauri CLI passthrough |
| `marmot` | Runs `src/bin/index.js` (registered in package.json bin) |
| `npx biome check --write src/` | Lint + format |

## Architecture

- `src/index.js` — main frontend app logic (~720 lines, DOM + Chart.js rendering)
- `src/insight.html` + `src/insight.js` — ranking page (tabs, hero card, Chart.js bar chart, 8 metrics)
- `src/bin/index.js` — CLI entrypoint (imports `startServer` from `src/server/index.js`)
- `src/server/index.js` — static file server (path traversal-safe, auto-opens browser)
- `src/utils/api.js` — browser-side npm/GitHub API calls
- `src/utils/data-loader.js` — shared fetch + cache module (used by dashboard + insight)
- `src/utils/cache.js` — legacy localStorage cache (TTL constants still used by dashboard)
- `src/index.html` — frontend HTML (`zh-CN` locale, importmap for CDN Chart.js)
- `src/index.css` — actual dashboard styles
- `src/index.type.ts` + `src/utils/npmjs.type.ts` — JSDoc type definitions

**Unused template files** (Tauri scaffold leftovers, not used by the dashboard):
- `src/styles.css`, `src/main.js`, `src/assets/`

## Key details

- **No build step**. Source files served directly. Chart.js loaded via importmap from `https://esm.sh/chart.js@4.5.1` (despite being in package.json dependencies).
- **No test framework** configured. No CI workflows.
- **npm API** (`registry.npmjs.org`): search by maintainer, fetch package metadata, download ranges.
- **GitHub API** (`api.github.com`): stars, latest commit. Public endpoints, rate-limited.
- **Cache**: single `localStorage` entry `pkg-marmot-cache`, keyed by username, stores up to 250 packages, 12h TTL. Date objects are serialized as ISO strings and restored on read via `new Date()`.
- **URL state**: query params `?username=X&limit=Y` (dashboard), `?username=X&rank=weekly-downloads` (insight).
- **Locale**: `zh-CN`. Comments mix Chinese and English.
- `import.meta.dirname` used in `src/bin/index.js` (requires Node.js 21+).
