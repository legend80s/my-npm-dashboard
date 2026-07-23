# Insight Ranking Page Design

Package insight ranking page for my-npm-dashboard (pkg-marmot).

## URL

`insight.html?username=legend80s&rank=weekly-downloads`

- `username` — npm username whose packages to rank.
- `rank` — which ranking to show on first load (default: first tab).

## Architecture

### Data Layer: `src/utils/data-loader.js` (new)

Shared data fetching + caching module used by both `src/index.js` (dashboard) and `src/insight.html` (ranking page).

```
loadData(username, forceRefresh = false)
  → { packages: PackageDetail[], username, timestamp }
```

Single cache per username, always fetches up to 250 packages (MAX_SIZE from search API). Callers slice to their own limit after receiving data.

Behavior:
1. Check localStorage cache (key `pkg-marmot-cache`, 12h TTL).
2. Cache hit → parse restore Date objects, return.
3. Cache miss or `forceRefresh` → call `fetchRaw()` + write to cache + return.

```
fetchRaw(username)
  → { packages: PackageDetail[], username }
```

Pure API fetching, no cache side-effect. Always fetches full 250-package dataset.

### Configuration

```js
// data-loader.js
export const MAX_SEARCH_SIZE = 250    // npm search API page size
export const RANKING_TOP_N = 5        // chart visible bar count
```

Dashboard config (in `index.js`):
```js
const config = { pkgLimit: 4 }  // display limit, adjustable via URL/input
```

Insight page uses all 250 for ranking; only top N shown in chart.

### API Changes: `src/utils/api.js`

- `fetchUserPackages(username)` — remove `limit` param; always fetches MAX_SEARCH_SIZE. Also extract `dependents` (parse string → number) from search response `Object.dependents`. Return `{ packages: Package[], dependents: Record<string, number> }`.
- `fetchPackageMetadata` — unchanged.
- `fetchYearlyWeeklyDownloads` — unchanged.

### Type Changes: `src/index.type.ts`

`FreshPackageDetail` / `PackageDetail` gets 4 new optional fields:

| Field | Type | Source |
|---|---|---|
| `unpackedSize` | `number \| null` | `meta.versions[latest].dist.unpackedSize` (bytes) |
| `dependencyCount` | `number` | `Object.keys(meta.versions[latest].dependencies \|\| {}).length` |
| `versionCount` | `number` | `Object.keys(meta.versions \|\| {}).length` |
| `dependents` | `number` | `Object.dependents` from search API (parsed from string) |

Zero extra network requests.

### Cache Design

Single key per username, stores all 250 packages. No per-limit distinction.

```
Cache key: pkg-marmot-cache
TTL: 12 hours
Format: { username, packages: PackageDetail[], timestamp }
```

Cache lookup: match `username` + TTL only. No `limit` field.

Dashboard loads → caches all 250 → slices to 4 for display.
Insight loads → reads same cache → ranks all 250 → shows top N in chart.

### Dashboard Changes: `src/index.js`

- `loadPackages(username, limit, forceRefresh)` → calls `loadData(username, forceRefresh)`, then slices to `limit` for rendering.
- Inline fetch loop (lines ~386-488) replaced with `loadData()`.
- `limit` parameter now only controls display count, not fetch size.
- Cache timestamp/setCache logic moved into `loadData()`.

## Ranking Page Layout

```
┌─────────────────────────────────────────────┐
│  ← 返回仪表板          📊 包排行榜 · username  │  header
├─────────────────────────────────────────────┤
│  8 ranking tabs (horizontal bar)             │  tabs
├─────────────────────────────────────────────┤
│  🏆 #1 Hero Card (HTML)                     │  hero
│  - pkg-name (bold, large)                    │
│  - tab-specific primary metric               │
│  - secondary metrics row                     │
├─────────────────────────────────────────────┤
│  Chart.js vertical bar chart (Top N)         │  chart
│  - Y: metric value, X: [pkg1…pkgN]          │
│  - #1 bar highlighted                        │
│  - click bar → npmjs.com/package/{name}      │
└─────────────────────────────────────────────┘
```

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

`&rank=` param auto-selects tab on load. Default to first tab if omitted/invalid.

## Edge Cases

1. **No cache, direct URL access** — insight page calls `loadData()`, fetches from APIs, writes cache, renders.
2. **Cache expired** — re-fetch.
3. **Empty packages** — show "用户 **{username}** 没有找到任何包".
4. **All-zero values for a tab** — chart shows flat line, hero says "暂无数据".
5. **Fewer than N packages** — chart renders whatever exists.
6. **API errors** — per-package error shown inline; non-error packages ranked normally.
7. **Rank param invalid** — fall back to first tab.

## Out of Scope (v1)

- Pagination beyond 250 packages
- Custom cache TTL
- Export / share rankings
- Light theme toggle
