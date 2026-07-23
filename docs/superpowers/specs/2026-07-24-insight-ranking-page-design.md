# Insight Ranking Page Design

Package insight ranking page for my-npm-dashboard (pkg-marmot).

## URL

`insight.html?username=legend80s&rank=weekly-downloads`

- `username` — npm username whose packages to rank.
- `rank` — which ranking to show on first load (default: first tab). See rank values below.

## Architecture

### Data Layer: `src/utils/data-loader.js` (new)

Shared data fetching + caching module used by both `src/index.js` (dashboard) and `src/insight.html` (ranking page).

```
loadData(username, limit, forceRefresh = false)
  → { packages: PackageDetail[], username: string, limit: number, timestamp: number }
```

Behavior:
1. Check localStorage cache (key `pkg-marmot-cache`, 12h TTL).
2. Cache hit → parse restore Date objects, return.
3. Cache miss or `forceRefresh` → call `fetchRaw()` + write to cache + return.

```
fetchRaw(username, limit)
  → { packages: PackageDetail[], username, limit }
```

Pure API fetching, no cache side-effect. Can be called independently.

### API Changes: `src/utils/api.js`

- `fetchUserPackages` — also extract `dependents` (string → number) from search response `Object.dependents`.
- `fetchPackageMetadata` — already returns full metadata. New fields extracted in data-loader.

### Type Changes: `src/index.type.ts`

`FreshPackageDetail` (same for `PackageDetail` in cache) gets 4 new optional fields:

| Field | Type | Source |
|---|---|---|
| `unpackedSize` | `number \| null` | `meta.versions[latest].dist.unpackedSize` (bytes) |
| `dependencyCount` | `number` | `Object.keys(meta.versions[latest].dependencies \|\| {}).length` |
| `versionCount` | `number` | `Object.keys(meta.versions \|\| {}).length` |
| `dependents` | `number` | `Object.dependents` from search API (parsed from string) |

These require zero extra network requests — all available in existing API responses.

### Dashboard Changes: `src/index.js`

Replace inline fetch loop (lines ~386-488) with:
```js
const result = await loadData(username, limit, forceRefresh)
pkgDetails = result.packages
```
All downstream rendering logic (renderFromData, renderCards) unchanged.

## Ranking Page Layout

```
┌─────────────────────────────────────────────┐
│  ← 返回仪表板          📊 包排行榜 · username  │  header
├─────────────────────────────────────────────┤
│  8 ranking tabs (horizontal bar)             │  tabs
│  [🔥 最热] [🚀 势头] [📥 总下载] [⭐ Stars]   │
│  [📦 体积] [🔗 依赖] [👥 被依赖] [🔢 版本数] │
├─────────────────────────────────────────────┤
│  🏆 #1 Hero Card (HTML)                     │  hero
│  - pkg-name (bold, large)                    │
│  - core metric (tab-specific)                │
│  - secondary metrics (downloads, stars,      │
│    size, deps, versions)                     │
│  - links to npmjs.com                        │
├─────────────────────────────────────────────┤
│  Chart.js vertical bar chart (Top 5)         │  chart
│  - Y: metric value, X: [pkgA…pkgE]          │
│  - #1 bar highlighted (matching hero)        │
│  - click bar → npmjs.com/package/{name}      │
└─────────────────────────────────────────────┘
```

### Components

1. **Header** — back link (`history.back()` fallback `/`), page title "📊 包排行榜 · {username}".
2. **Tabs** — horizontal row, one per rank. Active tab underlined/highlighted. Clicking re-sorts data in-memory, updates hero + chart.
3. **Hero Card** — #1 package displayed as a rich HTML card. Shows package name, tab-specific primary metric, and a row of key secondary metrics (downloads, stars, size, deps, versions).
4. **Chart** — Chart.js vertical bar chart, Top 5 packages. #1 bar in distinct color. Bar click → opens `https://npmjs.com/package/{name}` in new tab.

### Tabs / Rankings (8)

| `rank` value | Label | Sort Key |
|---|---|---|
| `weekly-downloads` | 🔥 最热包 | `weeklyData.at(-1)?.total \|\| 0` |
| `trend` | 🚀 势头最猛 | `trend` |
| `total-downloads` | 📥 下载总量 | `totalDownloads` |
| `stars` | ⭐ GitHub Stars | `github.stars \|\| 0` |
| `unpacked-size` | 📦 包体积 | `unpackedSize \|\| 0` |
| `dependencies` | 🔗 依赖数 | `dependencyCount` |
| `dependents` | 👥 被依赖数 | `dependents` |
| `versions` | 🔢 版本数 | `versionCount` |

When `&rank=` param is present on page load, scroll to and activate that tab. Default to first tab if omitted or invalid.

## Caching

Single localStorage key `pkg-marmot-cache`, shared between dashboard and insight page.

- **Key**: `pkg-marmot-cache`
- **TTL**: 12 hours
- **Format**: `{ username, limit, packages: PackageDetail[], timestamp }`
- Both pages read/write the same cache. First load from either page populates it; subsequent loads from either page hit cache.

## Edge Cases

1. **No cache, direct URL access** — insight page calls `loadData()`, which fetches from npm/GitHub APIs, writes cache, returns data. Works standalone.
2. **Cache expired** — same as above; re-fetch.
3. **Empty packages** — show "用户 **{username}** 没有找到任何包".
4. **Tab with all-zero values** (e.g. no GitHub Stars) — bar chart shows flat line, hero says "暂无数据", list shows all at 0.
5. **Rank param invalid** — fall back to first tab.
6. **API errors** — per-package errors shown inline (error badge in hero/list), non-error packages still ranked normally.
7. **Fewer than 5 packages** — bar chart renders whatever exists (1-4 bars).

## Out of Scope (v1)

- Pagination / show more than `limit` packages
- Custom cache TTL per user
- Export / share rankings
- Dark/light theme toggle
