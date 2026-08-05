import { Chart, registerables } from "chart.js"
import { fetchRaw, RANKING_TOP_N, readCache, writeCache } from "./utils/data-loader.js"
import { timeAgo } from "./utils/light-lodash.js"

Chart.register(...registerables)

/** @import { FreshPackageDetail } from './index.type.js' */

// ============================================================
//  Config & Rankings
// ============================================================

/**
 * @typedef {object} MetricDescriptor
 * @property {string} label
 * @property {(p: import('./index.type.js').FreshPackageDetail) => { value: string, color?: string, title?: string }} get
 */

/** @type {Record<string, MetricDescriptor>} */
const METRIC = {
  weekly: {
    label: "📥 周下载",
    get: (p) => ({ value: (p.weeklyData?.at(-1)?.total ?? 0).toLocaleString() }),
  },
  yearly: {
    label: "📥 年下载",
    get: (p) => ({ value: (p.totalDownloads ?? 0).toLocaleString() }),
  },
  trend: {
    label: "🚀 趋势",
    get: (p) => ({
      value: `${p.trend > 0 ? "+" : ""}${p.trend}%`,
      color: p.trend > 0 ? "#3fb950" : p.trend < 0 ? "#f85149" : "#8b949e",
    }),
  },
  stars: {
    label: "⭐ Stars",
    get: (p) => ({ value: (p.github?.stars ?? 0).toLocaleString() }),
  },
  lastCommit: {
    label: "🕐 最近提交",
    get: (p) => {
      if (!p.github?.lastCommitDate) return { value: "—" }
      const date = new Date(p.github.lastCommitDate)
      return { value: timeAgo(date), title: date.toLocaleString() }
    },
  },
  size: {
    label: "📦 体积",
    get: (p) => ({ value: formatBytes(p.unpackedSize ?? 0) }),
  },
  deps: {
    label: "🔗 依赖",
    get: (p) => ({ value: String(p.dependencyCount ?? 0) }),
  },
  dependents: {
    label: "👥 被依赖",
    get: (p) => ({ value: (p.dependents ?? 0).toLocaleString() }),
  },
  versions: {
    label: "🔢 版本",
    get: (p) => ({ value: String(p.versionCount ?? 0) }),
  },
  version: {
    label: "📌 最新版本",
    get: (p) => ({ value: p.version && p.version !== "--" ? p.version : "—" }),
  },
  publishedAt: {
    label: "🕒 发布时间",
    get: (p) => {
      if (!p.publishedAt) return { value: "—" }
      const date = new Date(p.publishedAt)
      return { value: timeAgo(date), title: date.toLocaleString() }
    },
  },
}

const RANKINGS = [
  {
    key: "weekly-downloads",
    label: "🔥 最热包",
    sortKey: (p) => p.weeklyData?.at(-1)?.total || 0,
    format: (v) => v.toLocaleString(),
    unit: "",
    metrics: [METRIC.weekly, METRIC.yearly, METRIC.trend],
  },
  {
    key: "trend",
    label: "🚀 势头最猛",
    sortKey: (p) => p.trend,
    format: (v) => `${v}%`,
    unit: "%",
    metrics: [METRIC.trend, METRIC.weekly],
  },
  {
    key: "total-downloads",
    label: "📥 下载总量",
    sortKey: (p) => p.totalDownloads,
    format: (v) => v.toLocaleString(),
    unit: "",
    metrics: [METRIC.yearly, METRIC.weekly, METRIC.trend],
  },
  {
    key: "stars",
    label: "⭐ GitHub Stars",
    sortKey: (p) => p.github?.stars || 0,
    format: (v) => v.toLocaleString(),
    unit: "",
    metrics: [METRIC.stars, METRIC.lastCommit],
  },
  {
    key: "unpacked-size",
    label: "📦 包体积",
    sortKey: (p) => p.unpackedSize ?? 0,
    format: formatBytes,
    unit: "",
    ascending: true,
    metrics: [METRIC.size, METRIC.deps],
  },
  {
    key: "dependencies",
    label: "🔗 依赖数",
    sortKey: (p) => p.dependencyCount,
    format: (v) => String(v),
    unit: "个",
    ascending: true,
    metrics: [METRIC.deps, METRIC.size],
  },
  {
    key: "dependents",
    label: "👥 被依赖数",
    sortKey: (p) => p.dependents,
    format: (v) => v.toLocaleString(),
    unit: "",
    metrics: [METRIC.dependents, METRIC.yearly],
  },
  {
    key: "versions",
    label: "🔢 版本数",
    sortKey: (p) => p.versionCount,
    format: (v) => String(v),
    unit: "个",
    metrics: [METRIC.versions, METRIC.version, METRIC.publishedAt],
  },
]

/**
 *
 * @param {import('./utils/base.type.js').int} bytes
 * @returns
 */
function formatBytes(bytes) {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB"]
  let i = 0
  let val = bytes
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024
    i++
  }
  return `${val.toFixed(1)} ${units[i]}`
}

/** @type {FreshPackageDetail[]} */
let allPackages = []
/** @type {Chart[]} */
const chartInstances = []
/** @type {Record<string, HTMLElement>} */
const sectionEls = {}

// ============================================================
//  DOM refs
// ============================================================
const sectionsEl = document.getElementById("sections")
const sideNavEl = document.getElementById("sideNav")
const toggleAllBtn = document.getElementById("toggleAllBtn")
const statusMsg = document.getElementById("statusMsg")
const usernameSpan = document.getElementById("insightUsername")

// ============================================================
//  Init
// ============================================================
async function init() {
  const params = new URLSearchParams(window.location.search)
  const username = params.get("username")?.trim()

  if (!username) {
    showStatus("😕", "请指定 npm 用户名（?username=xxx）")
    return
  }

  usernameSpan.textContent = username

  // Try cache first
  const cached = readCache(username)
  if (cached) {
    allPackages = cached.packages
    render()
    return
  }

  // No cache, fetch
  showStatus("⏳", `正在加载 ${username} 的包数据...`)
  try {
    const data = await fetchRaw(username)
    writeCache(username, data.packages)
    allPackages = data.packages
    render()
  } catch (err) {
    console.error(err)
    showStatus("❌", err.message || "加载失败")
  }
}

function render() {
  hideStatus()
  if (!allPackages.length) {
    sectionsEl.innerHTML = ""
    sideNavEl.innerHTML = ""
    toggleAllBtn.style.display = "none"
    showStatus("😕", "暂无数据")
    return
  }
  renderSections()
  renderSideNav()
  enableScrollSpy()
  scrollToRank()
}

// ============================================================
//  Sections (从上到下堆叠，可折叠)
// ============================================================
function renderSections() {
  sectionsEl.innerHTML = ""
  for (const r of RANKINGS) {
    const sorted = [...allPackages].sort((a, b) => (r.ascending ? r.sortKey(a) - r.sortKey(b) : r.sortKey(b) - r.sortKey(a)))
    const top = sorted.slice(0, RANKING_TOP_N)
    const first = sorted[0]

    const section = document.createElement("section")
    section.className = "section"
    section.id = `rank-${r.key}`

    const header = document.createElement("div")
    header.className = "section-header"
    header.title = "点击折叠 / 展开"

    const title = document.createElement("span")
    title.className = "section-title"
    title.textContent = r.label
    header.appendChild(title)

    if (first) {
      const champ = document.createElement("span")
      champ.className = "section-champ"
      champ.innerHTML = `🏆 <strong>${escapeHtml(first.name)}</strong> · ${r.format(r.sortKey(first))}`
      header.appendChild(champ)
    }

    const chevron = document.createElement("span")
    chevron.className = "section-chevron"
    chevron.textContent = "▾"
    header.appendChild(chevron)

    header.addEventListener("click", () => toggleSection(r.key))
    section.appendChild(header)

    const body = document.createElement("div")
    body.className = "section-body"
    section.appendChild(body)

    renderHero(first, r, body)
    renderChart(top, r, body)

    sectionsEl.appendChild(section)
    sectionEls[r.key] = section
  }
  updateToggleAllLabel()
}

function toggleSection(key) {
  const el = sectionEls[key]
  if (!el) return
  el.classList.toggle("collapsed")
  updateToggleAllLabel()
}

function setAll(expanded) {
  for (const r of RANKINGS) {
    sectionEls[r.key]?.classList.toggle("collapsed", !expanded)
  }
  updateToggleAllLabel()
}

function updateToggleAllLabel() {
  const allCollapsed = RANKINGS.every((r) => sectionEls[r.key]?.classList.contains("collapsed"))
  toggleAllBtn.textContent = allCollapsed ? "全部展开" : "全部收起"
}

toggleAllBtn.addEventListener("click", () => {
  const allCollapsed = RANKINGS.every((r) => sectionEls[r.key]?.classList.contains("collapsed"))
  setAll(allCollapsed)
})

// ============================================================
//  Side nav (左侧锚点导航)
// ============================================================
function renderSideNav() {
  sideNavEl.innerHTML = ""
  for (const r of RANKINGS) {
    const a = document.createElement("a")
    a.href = `#rank-${r.key}`
    a.textContent = r.label
    a.addEventListener("click", (e) => {
      e.preventDefault()
      sectionEls[r.key]?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
    sideNavEl.appendChild(a)
  }
}

function enableScrollSpy() {
  const links = new Map()
  for (const a of sideNavEl.querySelectorAll("a")) {
    links.set(a.hash.slice(1), a)
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        for (const [id, a] of links) {
          a.classList.toggle("active", id === entry.target.id)
        }
      }
    },
    { rootMargin: "-20% 0px -70% 0px" },
  )
  for (const id of links.keys()) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
}

// ============================================================
//  URL rank 参数 → 滚动到对应节并高亮
// ============================================================
function scrollToRank() {
  const params = new URLSearchParams(window.location.search)
  const rankParam = params.get("rank")
  if (!rankParam || !RANKINGS.some((r) => r.key === rankParam)) return
  const el = sectionEls[rankParam]
  if (!el) return
  setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    el.classList.add("flash")
    setTimeout(() => el.classList.remove("flash"), 2000)
  }, 100)
}

// ============================================================
//  Hero card
// ============================================================
/**
 * @param {import('./index.type.js').FreshPackageDetail} pkg
 * @param {{ label: string, sortKey: (p: import('./index.type.js').FreshPackageDetail) => number, format: (v: number) => string, metrics: MetricDescriptor[] }} ranking
 * @param {HTMLElement} container
 */
function renderHero(pkg, ranking, container) {
  if (!pkg) {
    container.innerHTML = '<div style="color:#8b949e;padding:1rem;">暂无数据</div>'
    return
  }

  const primaryValue = ranking.sortKey(pkg)
  const primaryStr = ranking.format(primaryValue)

  const hero = document.createElement("div")
  hero.className = "hero"
  hero.innerHTML = `
    <div class="hero-rank">🏆 第1名</div>
    <div class="hero-name"><a href="https://www.npmjs.com/package/${encodeURIComponent(pkg.name)}" target="_blank">${escapeHtml(pkg.name)}</a></div>
    <div class="hero-primary">${ranking.label}: ${primaryStr}</div>
    <div class="hero-metrics">
      ${ranking.metrics.map((m) => renderMetric(m, pkg)).join("")}
    </div>
  `
  container.appendChild(hero)
}

/**
 * @param {MetricDescriptor} metric
 * @param {import('./index.type.js').FreshPackageDetail} pkg
 */
function renderMetric(metric, pkg) {
  const { value, color, title } = metric.get(pkg)
  const colorStyle = color ? ` style="color:${color}"` : ""
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ""
  return `<span${titleAttr}>${metric.label} <strong${colorStyle}>${escapeHtml(String(value))}</strong></span>`
}

// ============================================================
//  Chart.js bar chart (Top N)
// ============================================================
function renderChart(packages, ranking, container) {
  const wrap = document.createElement("div")
  wrap.className = "chart-wrap"
  const canvas = document.createElement("canvas")
  wrap.appendChild(canvas)
  container.appendChild(wrap)

  if (!packages.length) {
    wrap.style.display = "none"
    return
  }

  const labels = packages.map((p) => p.name)
  const values = packages.map((p) => ranking.sortKey(p))
  const colors = packages.map((_, i) => (i === 0 ? "rgba(88, 166, 255, 1)" : "rgba(88, 166, 255, 0.35)"))

  const rootStyle = getComputedStyle(document.documentElement)
  const gridColor = rootStyle.getPropertyValue("--border-muted").trim() || "#21262d"
  const tickColor = rootStyle.getPropertyValue("--text-muted").trim() || "#8b949e"

  const ctx = canvas.getContext("2d")
  const instance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: ranking.label,
          data: values,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 1.0,
        },
      ],
    },
    options: {
      indexAxis: "y",
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
              const val = ctx.parsed.x
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
          grid: { color: gridColor, drawBorder: false },
          ticks: {
            color: tickColor,
            font: { size: 11 },
            callback: (v) => ranking.format(v),
          },
          beginAtZero: true,
        },
        y: {
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: tickColor, font: { size: 11 } },
        },
      },
    },
  })
  chartInstances.push(instance)
}

// ============================================================
//  Utils
// ============================================================
function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  )
}

function showStatus(emoji, msg) {
  statusMsg.style.display = "block"
  const spinClass = emoji === "⏳" ? " loading-spin" : ""
  statusMsg.innerHTML = `<span class="big${spinClass}">${emoji}</span>${msg}`
}

function hideStatus() {
  statusMsg.style.display = "none"
}

// ============================================================
//  Start
// ============================================================
document.addEventListener("DOMContentLoaded", init)
