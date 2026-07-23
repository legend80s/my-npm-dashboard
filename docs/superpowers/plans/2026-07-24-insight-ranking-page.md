# Insight Ranking Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a package ranking page (insight.html) with 8 ranking tabs, Chart.js vertical bar chart (Top N), and a shared data-loading module used by both dashboard and insight page.

**Architecture:** Extract fetch logic from index.js into `src/utils/data-loader.js`. Single localStorage cache per username stores all 250 packages. Dashboard and insight each slice to their own display limit. Insight page uses Chart.js vertical bar chart for Top N visualization per ranking.

**Tech Stack:** Vanilla JS (ES modules), Chart.js 4.5.1 (via importmap CDN), localStorage cache.

---

## File Changes

| File | Action | Purpose |
|---|---|---|
| `src/index.type.ts` | Modify | Add 4 new rank fields to `PackageDetail` |
| `src/utils/api.js` | Modify | `fetchUserPackages` always fetches 250, returns `dependents` map |
| `src/utils/data-loader.js` | Create | `fetchRaw()` + `loadData()` + cache functions |
| `src/index.js` | Modify | Replace inline fetch loop with `loadData()`, remove limit from cache key |
| `src/insight.html` | Rewrite | Ranking page HTML + importmap + styles |
| `src/insight.js` | Create | Ranking page JS (tabs, chart, hero card) |
| `src/index.html` | No change | Already has stats-bar links to insight |

---

### Task 1: Extend types with 4 new rank fields

**Files:**
- Modify: `src/index.type.ts`

- [ ] **Step 1: Add new fields to `PackageDetail`**

Current `PackageDetail` at line ~115. Add 4 fields after `trend`:

```typescript
  /** 打包后体积（字节），null 表示获取失败 */
  unpackedSize: number | null
  /** 生产依赖数量 */
  dependencyCount: number
  /** 版本总数 */
  versionCount: number
  /** 被依赖数 */
  dependents: number
```

- [ ] **Step 2: Add same 4 fields to `Case1` type (line ~27)** used by `FreshPackageDetail`:

```typescript
type Case1 = {
  // ... existing fields ...
  unpackedSize: number | null
  dependencyCount: number
  versionCount: number
  dependents: number
}
```

- [ ] **Step 3: Add same 4 fields to `CaseError` type (Omit version)**:

`CaseError` currently `Omit<Case1, "publishedAt" | "createdAt" | "weeklyData">`. No change needed — Omit won't strip new fields since they're not in the omit list. But verify the error path in data-loader fills them with 0/null.

- [ ] **Step 4: Commit**

```bash
git add src/index.type.ts
git commit -m "feat: add rank fields (unpackedSize, dependencyCount, versionCount, dependents)"
```

---

### Task 2: Update `fetchUserPackages` to always fetch 250 + return dependents

**Files:**
- Modify: `src/utils/api.js:14-40`

- [ ] **Step 1: Change `fetchUserPackages` signature and return value**

Remove `limit` param; always use MAX_SIZE=250. Return both packages and dependents:

```javascript
const MAX_SEARCH_SIZE = 250

/**
 * 搜索用户维护的所有包（最多250个），按发布时间排序
 * @param {string} username - npm 用户名
 * @returns {Promise<{ packages: Array<NpmPkgSearchResp['objects'][number]['package']>, dependents: Record<string, number> }>}
 */
export async function fetchUserPackages(username) {
  const url =
    `https://registry.npmjs.org/-/v1/search?` +
    `text=maintainer:${encodeURIComponent(username)}&` +
    `size=${MAX_SEARCH_SIZE}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`npm search 失败: ${res.status}`)
  }
  /** @type {NpmPkgSearchResp} */
  const data = await res.json()

  const packages = data.objects.map((o) => o.package)

  // Extract dependents map: package name → numeric dependents
  /** @type {Record<string, number>} */
  const dependents = {}
  for (const obj of data.objects) {
    dependents[obj.package.name] = Number(obj.dependents) || 0
  }

  // 客户端按发布时间排序（最新在前）
  packages.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })

  return { packages, dependents }
}
```

Remove the `limit` param and internal `const MAX_SIZE = 250`. The `MAX_SEARCH_SIZE` constant will be shared with `data-loader.js`.

- [ ] **Step 2: Update callers of `fetchUserPackages` in index.js**

Will be handled in Task 4 when we replace the inline fetch loop.

- [ ] **Step 3: Commit**

```bash
git add src/utils/api.js
git commit -m "refactor: fetchUserPackages always fetches 250, returns dependents map"
```

---

### Task 3: Create `src/utils/data-loader.js` — shared fetch + cache

**Files:**
- Create: `src/utils/data-loader.js`

- [ ] **Step 1: Write data-loader.js**

```javascript
/** @import { NpmPkgResp } from './npmjs.type.js' */
/** @import { FreshPackageDetail, PackageDetail } from '../index.type.js' */

import { fetchUserPackages, fetchPackageMetadata, fetchYearlyWeeklyDownloads, fetchGitHubStars, fetchGitHubLastCommit } from "./api.js"

export const MAX_SEARCH_SIZE = 250
export const RANKING_TOP_N = 5

const CACHE_KEY = "pkg-marmot-cache"
const CACHE_TTL_IN_MS = 12 * 60 * 60 * 1000

/**
 * 从 npm registry 解析 GitHub repo 信息
 */
function parseGitHubRepo(pkgMeta) {
  const repo = pkgMeta.repository
  if (!repo) return null
  if (typeof repo === "string") {
    const match = repo.match(/github\.com[:/]([^/]+)\/([^/.]+)/)
    if (match) return { owner: match[1], repo: match[2] }
    return null
  }
  if (repo.url) {
    const match = repo.url.match(/github\.com[:/]([^/]+)\/([^/.]+)/)
    if (match) return { owner: match[1], repo: match[2] }
  }
  return null
}

/**
 * 从缓存中读取数据
 * @param {string} username
 * @returns {{ packages: FreshPackageDetail[], timestamp: number } | null}
 */
export function readCache(username) {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.username !== username) return null
    if (Date.now() - data.timestamp > CACHE_TTL_IN_MS) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    // Restore Date objects from ISO strings
    /** @type {FreshPackageDetail[]} */
    const packages = data.packages
    for (const pkg of packages) {
      if (pkg.weeklyData) {
        for (const w of pkg.weeklyData) {
          w.startDate = new Date(w.startDate)
          w.endDate = new Date(w.endDate)
        }
      }
    }
    return { packages, timestamp: data.timestamp }
  } catch {
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

/**
 * 写入缓存
 * @param {string} username
 * @param {FreshPackageDetail[]} packages
 */
export function writeCache(username, packages) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ username, packages, timestamp: Date.now() }))
  } catch (e) {
    console.warn("缓存保存失败:", e)
  }
}

/**
 * 清除缓存
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY)
}

/**
 * 纯 API 拉取所有包数据（不含缓存副作用）
 * @param {string} username
 * @returns {Promise<{ packages: FreshPackageDetail[], username: string }>}
 */
export async function fetchRaw(username) {
  const { packages: pkgList, dependents: dependentsMap } = await fetchUserPackages(username)

  /** @type {FreshPackageDetail[]} */
  const pkgDetails = []

  for (const pkg of pkgList) {
    try {
      const meta = await fetchPackageMetadata(pkg.name)
      const downloads = await fetchYearlyWeeklyDownloads(pkg.name)
      const version = meta["dist-tags"]?.latest || pkg.version || "--"
      const publishedAt = meta.time?.[version] || pkg.date || null
      const createdAt = meta.time?.created || null

      // Extract new rank fields
      const latestVerData = version !== "--" ? meta.versions?.[version] : null
      const unpackedSize = latestVerData?.dist?.unpackedSize ?? null
      const dependencyCount = Object.keys(latestVerData?.dependencies || {}).length
      const versionCount = Object.keys(meta.versions || {}).length
      const dependents = dependentsMap[pkg.name] || 0

      // GitHub data
      const github = { owner: null, repo: null, stars: null, lastCommit: null, lastCommitDate: null }
      const ghRepo = parseGitHubRepo(meta)
      if (ghRepo) {
        github.owner = ghRepo.owner
        github.repo = ghRepo.repo
        try {
          const starData = await fetchGitHubStars(ghRepo.owner, ghRepo.repo)
          github.stars = starData.stars
        } catch { /* silent */ }
        try {
          const commitData = await fetchGitHubLastCommit(ghRepo.owner, ghRepo.repo)
          github.lastCommit = commitData.message
          github.lastCommitDate = commitData.date
        } catch { /* silent */ }
      }

      // ActiveAt = max(publishedAt, GitHub commit date)
      let activeAt = publishedAt
      if (github.lastCommitDate && new Date(github.lastCommitDate) > new Date(activeAt || 0)) {
        activeAt = github.lastCommitDate
      }

      pkgDetails.push({
        name: pkg.name,
        version,
        publishedAt,
        createdAt,
        weeklyData: downloads.weekly,
        totalDownloads: downloads.total,
        trend: downloads.trend,
        github,
        activeAt,
        unpackedSize,
        dependencyCount,
        versionCount,
        dependents,
      })
    } catch (err) {
      pkgDetails.push({
        name: pkg.name,
        version: "--",
        publishedAt: null,
        createdAt: null,
        totalDownloads: 0,
        trend: 0,
        github: { owner: null, repo: null, stars: null, lastCommit: null, lastCommitDate: null },
        activeAt: null,
        unpackedSize: null,
        dependencyCount: 0,
        versionCount: 0,
        dependents: 0,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return { packages: pkgDetails, username }
}

/**
 * 加载数据：先读缓存，未命中则 fetchRaw + 写缓存
 * @param {string} username
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<{ packages: FreshPackageDetail[], username: string, fromCache: boolean, timestamp: number }>}
 */
export async function loadData(username, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = readCache(username)
    if (cached) {
      return { packages: cached.packages, username, fromCache: true, timestamp: cached.timestamp }
    }
  }
  const data = await fetchRaw(username)
  writeCache(username, data.packages)
  return { packages: data.packages, username, fromCache: false, timestamp: Date.now() }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/data-loader.js
git commit -m "feat: add shared data-loader module with fetchRaw + loadData + cache"
```

---

### Task 4: Simplify dashboard `loadPackages` to use `loadData`

**Files:**
- Modify: `src/index.js`

- [ ] **Step 1: Update imports**

Replace:
```javascript
import {
  fetchGitHubLastCommit,
  fetchGitHubStars,
  fetchPackageMetadata,
  fetchUserPackages,
  fetchYearlyWeeklyDownloads,
} from "./utils/api.js"
import {
  CACHE_TTL_IN_HOURS,
  clearCache,
  getCache,
  getCacheTTL,
  setCache,
} from "./utils/cache.js"
```

With:
```javascript
import { fetchGitHubLastCommit, fetchGitHubStars, fetchPackageMetadata, fetchYearlyWeeklyDownloads } from "./utils/api.js"
import { loadData, readCache, writeCache, clearCache, fetchRaw, RANKING_TOP_N } from "./utils/data-loader.js"
import { CACHE_TTL_IN_HOURS, getCacheTTL } from "./utils/cache.js"
```

Note: `CACHE_TTL_IN_HOURS` and `getCacheTTL` are still used by `updateCacheInfo()`. The old `getCache` and `setCache` from `cache.js` can be removed since `data-loader.js` provides equivalent.

- [ ] **Step 2: Replace the inline fetch loop + cache check in `loadPackages`**

Find the section starting at cache check (line ~356) through the end of the fetch loop (line ~503). Replace with:

```javascript
  // 加载数据（缓存或实时）
  let pkgDetails, fromCache, cacheTimestamp

  if (!forceRefresh) {
    const cached = readCache(username)
    if (cached) {
      pkgDetails = cached.packages.slice(0, limit)
      fromCache = true
      cacheTimestamp = cached.timestamp

      await renderFromData(pkgDetails, username, limit, fromCache, cacheTimestamp)
      setLoading(false)
      return
    }
  }

  // 缓存未命中或强制刷新
  setLoading(true)
  grid.innerHTML = `<div class="no-results"><span class="big">⏳</span>正在搜索 ${username} 的包...</div>`

  try {
    const data = await fetchRaw(username)
    writeCache(username, data.packages)

    pkgDetails = data.packages.slice(0, limit)

    if (!pkgDetails.length) {
      grid.innerHTML = `<div class="no-results"><span class="big">😕</span>用户 <strong>${username}</strong> 没有找到任何包</div>`
      hottestPkg.textContent = "-"
      hottestTrendPkg.textContent = "-"
      updateTime.textContent = "-"
      updateCacheInfo()
      setLoading(false)
      return
    }

    pkgDetails.sort(byWeeklyDownloadsDesc)

    // 更新统计和缓存
    const timestamp = Date.now()
    updateTime.textContent = getFreshnessLabel(false, null)

    await renderFromData(pkgDetails, username, limit, false, null)
  } catch (err) {
    console.error(err)
    grid.innerHTML = `<div class="no-results"><span class="big">❌</span>${err.message || "加载失败，请检查网络或重试"}</div>`
  }

  setLoading(false)
```

Remove the old code from line ~356 (`// 检查缓存（除非强制刷新）`) through line ~503 (`setCache(username, limit, pkgDetails, timestamp)`).

- [ ] **Step 3: Remove unused imports and functions**

Check if `updateTime.textContent` assignment is needed. In the old code, line ~526 assigned it. In the new code, `renderFromData` already calls `updateTime.textContent = getFreshnessLabel(...)`. But `updateTime.textContent` is also set in the "empty packages" path.

Also verify `parseGitHubRepo` is still needed in index.js — it's used by `renderCards` for the link-building (line ~97). A different `parseGitHubRepo` exists in data-loader.js for the fetch phase. They can coexist (they're identical). Remove the one from index.js if unused, or keep it (it's used inline in `renderCards` via `pkg.github.owner` which is already parsed).

Actually, looking at index.js: `parseGitHubRepo` is defined at line ~94 and is only used within `loadPackages` at line ~432. Since we're removing that inline fetch code, we can delete the `parseGitHubRepo` function from index.js.

- [ ] **Step 4: Commit**

```bash
git add src/index.js
git commit -m "refactor: dashboard uses data-loader for fetch + cache, removes inline fetch loop"
```

---

### Task 5: Build insight ranking page

**Files:**
- Rewrite: `src/insight.html`
- Create: `src/insight.js`

- [ ] **Step 1: Write `src/insight.html`**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>包排行榜 - my-npm-dashboard</title>
  <link rel="stylesheet" href="index.css" />
  <script type="importmap">
    {
      "imports": {
        "chart.js": "https://esm.sh/chart.js@4.5.1"
      }
    }
  </script>
  <style>
    body { padding: 20px; }
    .insight-header {
      max-width: 1000px; margin: 0 auto 1.5rem;
      display: flex; align-items: center; gap: 1rem;
    }
    .insight-header h1 { font-size: 1.25rem; color: #f0e6d0; }
    .back-link { font-size: 0.875rem; color: #58a6ff; }

    /* Tabs */
    .tabs {
      max-width: 1000px; margin: 0 auto 1.5rem;
      display: flex; flex-wrap: wrap; gap: 0.4rem;
    }
    .tab {
      padding: 0.4rem 0.8rem; border-radius: 6px;
      border: 1px solid #30363d; background: #21262d;
      color: #8b949e; font-size: 0.75rem; cursor: pointer;
      transition: all 0.15s;
    }
    .tab:hover { border-color: #58a6ff; color: #e6edf3; }
    .tab.active { border-color: #58a6ff; color: #58a6ff; background: #0d1117; font-weight: 600; }

    /* Hero card */
    .hero {
      max-width: 1000px; margin: 0 auto 1.5rem;
      background: #161b22; border-radius: 12px;
      padding: 1.2rem 1.5rem; outline: 2px solid #58a6ff;
    }
    .hero-rank { font-size: 0.75rem; color: #58a6ff; font-weight: 700; margin-bottom: 0.3rem; }
    .hero-name { font-size: 1.5rem; font-weight: 700; color: #f0e6d0; margin-bottom: 0.5rem; }
    .hero-name a { color: inherit; text-decoration: none; }
    .hero-name a:hover { text-decoration: underline; }
    .hero-primary { font-size: 1.1rem; color: #3fb950; margin-bottom: 0.6rem; }
    .hero-metrics {
      display: flex; flex-wrap: wrap; gap: 0.6rem 1.2rem;
      font-size: 0.8rem; color: #8b949e;
    }
    .hero-metrics span { white-space: nowrap; }
    .hero-metrics strong { color: #e6edf3; }

    /* Chart container */
    .chart-wrap {
      max-width: 1000px; margin: 0 auto 1.5rem;
      background: #161b22; border-radius: 12px; padding: 1rem;
    }
    .chart-wrap canvas { width: 100%; height: 300px; }

    /* Loading / empty */
    .status-msg {
      max-width: 1000px; margin: 2rem auto; text-align: center;
      color: #8b949e; font-size: 1rem;
    }
    .status-msg .big { font-size: 3rem; display: block; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="insight-header">
    <a class="back-link" href="/" onclick="history.back(); return false" title="回到仪表板">← 返回仪表板</a>
    <h1>📊 包排行榜 · <span id="insightUsername">-</span></h1>
  </div>

  <div class="tabs" id="tabs"></div>
  <div class="hero" id="hero"></div>
  <div class="chart-wrap" id="chartWrap"><canvas id="chart"></canvas></div>
  <div class="status-msg" id="statusMsg" style="display:none;"></div>

  <script type="module" src="./insight.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `src/insight.js`**

```javascript
import { Chart, registerables } from "chart.js"
import { loadData, readCache, RANKING_TOP_N } from "./utils/data-loader.js"

Chart.register(...registerables)

// ============================================================
//  Config & State
// ============================================================

const RANKINGS = [
  { key: "weekly-downloads", label: "🔥 最热包",    sortKey: (p) => p.weeklyData?.at(-1)?.total || 0,         format: (v) => v.toLocaleString(), unit: "" },
  { key: "trend",            label: "🚀 势头最猛",  sortKey: (p) => p.trend,                                  format: (v) => `${v}%`, unit: "%" },
  { key: "total-downloads",  label: "📥 下载总量",  sortKey: (p) => p.totalDownloads,                         format: (v) => v.toLocaleString(), unit: "" },
  { key: "stars",            label: "⭐ GitHub Stars", sortKey: (p) => p.github?.stars || 0,                    format: (v) => v.toLocaleString(), unit: "" },
  { key: "unpacked-size",    label: "📦 包体积",    sortKey: (p) => p.unpackedSize ?? 0,                      format: formatBytes, unit: "" },
  { key: "dependencies",     label: "🔗 依赖数",    sortKey: (p) => p.dependencyCount,                        format: (v) => String(v), unit: "个" },
  { key: "dependents",       label: "👥 被依赖数",  sortKey: (p) => p.dependents,                             format: (v) => v.toLocaleString(), unit: "" },
  { key: "versions",         label: "🔢 版本数",    sortKey: (p) => p.versionCount,                           format: (v) => String(v), unit: "个" },
]

function formatBytes(bytes) {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB"]
  let i = 0
  let val = bytes
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++ }
  return `${val.toFixed(1)} ${units[i]}`
}

/** @type {FreshPackageDetail[]} */
let allPackages = []
let currentRank = "weekly-downloads"
/** @type {Chart | null} */
let chartInstance = null

// ============================================================
//  DOM refs
// ============================================================
const tabsEl = document.getElementById("tabs")
const heroEl = document.getElementById("hero")
const chartCanvas = document.getElementById("chart")
const statusMsg = document.getElementById("statusMsg")
const usernameSpan = document.getElementById("insightUsername")

// ============================================================
//  Init
// ============================================================
async function init() {
  const params = new URLSearchParams(window.location.search)
  const username = params.get("username")?.trim()
  const rankParam = params.get("rank")
  if (rankParam && RANKINGS.some((r) => r.key === rankParam)) {
    currentRank = rankParam
  }

  if (!username) {
    showStatus("😕", "请指定 npm 用户名（?username=xxx）")
    return
  }

  usernameSpan.textContent = username

  // Try cache first for instant render
  const cached = readCache(username)
  if (cached) {
    allPackages = cached.packages
    render()
    // If cache is stale, refresh in background
    if (Date.now() - cached.timestamp > 12 * 60 * 60 * 1000) {
      refresh(username)
    }
    return
  }

  // No cache, fetch
  showStatus("⏳", `正在加载 ${username} 的包数据...`)
  await refresh(username)
}

async function refresh(username) {
  try {
    const data = await loadData(username)
    allPackages = data.packages
    render()
  } catch (err) {
    console.error(err)
    showStatus("❌", err.message || "加载失败")
  }
}

function render() {
  hideStatus()
  renderTabs()
  renderRanking(currentRank)
}

// ============================================================
//  Tabs
// ============================================================
function renderTabs() {
  tabsEl.innerHTML = ""
  for (const r of RANKINGS) {
    const tab = document.createElement("span")
    tab.className = "tab" + (r.key === currentRank ? " active" : "")
    tab.textContent = r.label
    tab.addEventListener("click", () => switchRank(r.key))
    tabsEl.appendChild(tab)
  }
}

function switchRank(key) {
  if (key === currentRank) return
  currentRank = key
  renderTabs()
  renderRanking(key)
  // Update URL
  const params = new URLSearchParams(window.location.search)
  params.set("rank", key)
  window.history.replaceState({}, "", "?" + params.toString())
}

// ============================================================
//  Ranking render
// ============================================================
function renderRanking(key) {
  const ranking = RANKINGS.find((r) => r.key === key)
  if (!ranking) return

  // Sort packages by this ranking metric
  const sorted = [...allPackages].sort((a, b) => ranking.sortKey(b) - ranking.sortKey(a))
  const top = sorted.slice(0, RANKING_TOP_N)
  const first = sorted[0]

  renderHero(first, ranking)
  renderChart(top, ranking)
}

// ============================================================
//  Hero card
// ============================================================
function renderHero(pkg, ranking) {
  if (!pkg) {
    heroEl.innerHTML = '<div style="color:#8b949e;">暂无数据</div>'
    return
  }

  const primaryValue = ranking.sortKey(pkg)
  const primaryStr = ranking.format(primaryValue)

  heroEl.innerHTML = `
    <div class="hero-rank">🏆 第1名</div>
    <div class="hero-name"><a href="https://www.npmjs.com/package/${encodeURIComponent(pkg.name)}" target="_blank">${pkg.name}</a></div>
    <div class="hero-primary">${ranking.label}: ${primaryStr}</div>
    <div class="hero-metrics">
      <span>📥 周下载 <strong>${pkg.weeklyData?.at(-1)?.total?.toLocaleString() || 0}</strong></span>
      <span>📥 年下载 <strong>${pkg.totalDownloads.toLocaleString()}</strong></span>
      <span>🚀 趋势 <strong style="color:${pkg.trend > 0 ? "#3fb950" : pkg.trend < 0 ? "#f85149" : "#8b949e"}">${pkg.trend > 0 ? "+" : ""}${pkg.trend}%</strong></span>
      <span>⭐ Stars <strong>${pkg.github?.stars?.toLocaleString() || 0}</strong></span>
      <span>📦 体积 <strong>${formatBytes(pkg.unpackedSize ?? 0)}</strong></span>
      <span>🔗 依赖 <strong>${pkg.dependencyCount}</strong></span>
      <span>👥 被依赖 <strong>${pkg.dependents.toLocaleString()}</strong></span>
      <span>🔢 版本 <strong>${pkg.versionCount}</strong></span>
      <span>🚀 发布 <strong>${pkg.publishedAt ? timeAgo(pkg.publishedAt) : "--"}</strong></span>
    </div>
  `
}

// ============================================================
//  Chart.js bar chart (Top N)
// ============================================================
function renderChart(packages, ranking) {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (!packages.length) {
    chartCanvas.style.display = "none"
    return
  }
  chartCanvas.style.display = "block"

  const labels = packages.map((p) => p.name)
  const values = packages.map((p) => ranking.sortKey(p))
  const firstVal = values[0]
  const colors = packages.map((_, i) =>
    i === 0 ? "rgba(88, 166, 255, 1)" : "rgba(88, 166, 255, 0.35)",
  )

  const ctx = chartCanvas.getContext("2d")
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: ranking.label,
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (_, elements) => {
        if (elements.length) {
          const idx = elements[0].index
          const pkg = packages[idx]
          if (pkg) window.open(`https://www.npmjs.com/package/${encodeURIComponent(pkg.name)}`, "_blank")
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y
              const pkg = packages[ctx.dataIndex]
              if (!pkg) return `${ranking.label}: ${ranking.format(val)}`
              const lines = [`${ranking.label}: ${ranking.format(val)}`]
              if (ranking.key === "weekly-downloads" && pkg.trend) {
                lines.push(`趋势: ${pkg.trend > 0 ? "+" : ""}${pkg.trend}%`)
              }
              return lines
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "#21262d", drawBorder: false },
          ticks: { color: "#8b949e", font: { size: 11 } },
        },
        y: {
          grid: { color: "#21262d", drawBorder: false },
          ticks: {
            color: "#8b949e",
            font: { size: 11 },
            callback: (v) => ranking.format(v),
          },
          beginAtZero: true,
        },
      },
    },
  })
}

// ============================================================
//  Utils
// ============================================================
function showStatus(emoji, msg) {
  statusMsg.style.display = "block"
  statusMsg.innerHTML = `<span class="big">${emoji}</span>${msg}`
}

function hideStatus() {
  statusMsg.style.display = "none"
}

function timeAgo(dateStr) {
  if (!dateStr) return "未知"
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return "刚刚"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月前`
  return `${Math.floor(months / 12)} 年前`
}

// ============================================================
//  Start
// ============================================================
document.addEventListener("DOMContentLoaded", init)
```

- [ ] **Step 3: Commit**

```bash
git add src/insight.html src/insight.js
git commit -m "feat: add insight ranking page with tabs, hero card, and Chart.js bar chart"
```

---

### Task 6: Update `src/utils/cache.js` — consolidate or mark as legacy

The old `cache.js` functions (`getCache`, `setCache`) are still referenced by `updateCacheInfo()` via `getCacheTTL` and `CACHE_TTL_IN_HOURS`. The `data-loader.js` has its own cache layer.

**Files:**
- No change needed if `cache.js` exports `CACHE_TTL_IN_HOURS` and `getCacheTTL` are still used by index.js

Just verify `clearCache` is only imported from one place. In index.js, `clearCache` is imported for the refresh button. Both `cache.js` and `data-loader.js` export `clearCache`. Make sure index.js imports from `data-loader.js`:

```javascript
import { loadData, readCache, writeCache, clearCache, fetchRaw } from "./utils/data-loader.js"
```

The old `cache.js` `getCache`/`setCache` exports are no longer needed but `getCacheTTL` and `CACHE_TTL_IN_HOURS` are still used by `updateCacheInfo()`. Leave `cache.js` as-is.

- [ ] **Step 1: Verify imports in index.js are correct**

Already handled in Task 4. No additional commit needed.

---

### Task 7: Update AGENTS.md with new file information

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add `src/utils/data-loader.js` and `src/insight.js` to architecture section**

Under `## Architecture`, add:
```
- `src/utils/data-loader.js` — shared fetch + cache (used by dashboard + insight)
- `src/insight.html` — ranking page HTML (tabs, hero, Chart.js bar chart)
- `src/insight.js` — ranking page logic (8 ranking metrics, chart rendering)
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md with insight page architecture"
```

---

## Verification

1. `npm run dev` — starts server at localhost:3000
2. Open dashboard, search a username → verify cards render as before
3. Click "🔥 最热包" link in stats-bar → opens insight.html?username=X&rank=weekly-downloads
4. Verify hero card shows #1 package with all metrics
5. Verify Chart.js bar chart shows Top 5 packages
6. Click a different tab → ranking re-sorts, hero + chart update
7. Click bar in chart → opens npmjs.com in new tab
8. Refresh insight page → loads from cache instantly
9. Open insight.html directly (no cache) → loads from APIs and renders
