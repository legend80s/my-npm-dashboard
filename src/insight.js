import { Chart, registerables } from "chart.js"
import { fetchRaw, RANKING_TOP_N, readCache, writeCache } from "./utils/data-loader.js"
import { $, scrollToElement, URLParams } from "./utils/light-jquery.js"
import { numberToLocaleString, timeAgo } from "./utils/light-lodash.js"

Chart.register(...registerables)

/** @import { FreshPackageDetail } from './index.type.js' */
/** @import { MetricDescriptor, IRanking } from './insight.type.js' */

// ============================================================
//  Config & Rankings
// ============================================================

const urlParams = new URLParams(window.location.href)

/** @satisfies {Record<string, MetricDescriptor>} */
const METRIC = {
  weekly: {
    label: "周下载",
    get: (p) => ({ value: numberToLocaleString(p.weeklyData?.at(-1)?.total) }),
  },
  lastWeek: {
    label: "上周下载",
    get: (p) => ({ value: numberToLocaleString(p.weeklyData?.at(-2)?.total) }),
  },
  yearly: {
    label: "年下载",
    get: (p) => ({ value: numberToLocaleString(p.totalDownloads) }),
  },
  monthly: {
    label: "月下载",
    get: (p) => {
      if ("weeklyData" in p) {
        const last30Days = p.weeklyData.slice(-30)
        return { value: numberToLocaleString(last30Days.reduce((a, b) => a + b.total, 0)) }
      }

      return { value: "0" }
    },
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
    get: (p) => ({ value: numberToLocaleString(p.github?.stars) }),
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
    get: (p) => ({ value: numberToLocaleString(p.dependents) }),
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

/** @type {IRanking[]} */
const RANKINGS = [
  {
    key: "weekly-downloads",
    label: "🔥 最热包",
    labelDescription: "最近 7 天下载量最高的包",
    sortKey: (p) => p.weeklyData?.at(-1)?.total || 0,
    format: (v) => numberToLocaleString(v),
    unit: "",
    metrics: [METRIC.yearly, METRIC.trend],
  },
  {
    key: "trend",
    label: "🚀 势头最猛",
    labelDescription: "最近 7 天下载量增长最快的包",
    sortKey: (p) => p.trend,
    format: (v) => `${v}%`,
    unit: "%",
    metrics: [METRIC.weekly, METRIC.lastWeek],
  },
  {
    key: "total-downloads",
    label: "🏗️ 年下载总量",
    labelDescription: "过去一年下载量最高的包",
    sortKey: (p) => p.totalDownloads,
    format: numberToLocaleString,
    unit: "",
    metrics: [METRIC.monthly, METRIC.weekly, METRIC.trend],
  },
  {
    key: "stars",
    label: "⭐ GitHub Stars",
    labelDescription: new Date().toDateString(),
    sortKey: (p) => p.github?.stars || 0,
    format: (v) => numberToLocaleString(v),
    unit: "",
    metrics: [METRIC.lastCommit],
  },
  {
    key: "unpacked-size",
    label: "📦 包体积",
    labelDescription: "",
    sortKey: (p) => p.unpackedSize ?? 0,
    format: formatBytes,
    unit: "",
    ascending: true,
    metrics: [METRIC.size, METRIC.deps],
  },
  {
    key: "dependencies",
    label: "🔗 依赖数",
    labelDescription: "package.json 中声明的 dependencies",
    sortKey: (p) => p.dependencyCount,
    format: (v) => String(v),
    unit: "个",
    ascending: true,
    metrics: [METRIC.size],
  },
  {
    key: "dependents",
    label: "👥 被依赖数",
    labelDescription: "",
    sortKey: (p) => p.dependents,
    format: (v) => v.toLocaleString(),
    unit: "",
    metrics: [METRIC.monthly, METRIC.weekly],
  },
  {
    key: "versions",
    label: "版本数",
    labelDescription: "",
    sortKey: (p) => p.versionCount,
    format: (v) => String(v),
    unit: "个",
    metrics: [METRIC.version, METRIC.publishedAt],
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
const sectionsEl = /** @type {HTMLElement} */ ($("#sections"))
const sideNavEl = /** @type {HTMLElement} */ ($("#sideNav"))
const toggleAllBtn = /** @type {HTMLElement} */ ($("#toggleAllBtn"))
const statusMsg = /** @type {HTMLElement} */ ($("#statusMsg"))
const usernameSpan = /** @type {HTMLElement} */ ($("#insightUsername"))

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
    // @ts-expect-error
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
    const sorted = [...allPackages].sort((a, b) =>
      r.ascending ? r.sortKey(a) - r.sortKey(b) : r.sortKey(b) - r.sortKey(a),
    )
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
      champ.innerHTML = `<strong>${escapeHtml(first.name)}</strong>`
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

/**
 *
 * @param {string} key
 * @returns
 */
function toggleSection(key) {
  const el = sectionEls[key]
  if (!el) {
    return
  }
  el.classList.toggle("collapsed")
  updateToggleAllLabel()
}

/** @param {boolean} expanded */
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
      scrollToElement(
        // @ts-expect-error
        sectionEls[r.key],
        { offsetTop: -70 },
      )
      urlParams.set("rank", r.key)
      // sectionEls[r.key]?.scrollIntoView()
      // scrollToElementWithOffset(sectionEls[r.key], -0)
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
        if (!entry.isIntersecting) {
          continue
        }
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
  if (!rankParam || !RANKINGS.some((r) => r.key === rankParam)) {
    return
  }

  const el = /** @type {HTMLElement} */ (sectionEls[rankParam])

  setTimeout(() => {
    // el.scrollIntoView({ behavior: "smooth", block: "start" })
    scrollToElement(el, { offsetTop: -70 })
    el.classList.add("flash")
    setTimeout(() => el.classList.remove("flash"), 1500)
  }, 100)
}

// ============================================================
//  Hero card
// ============================================================
/**
 * @param {import('./index.type.js').FreshPackageDetail} pkg
 * @param {IRanking} ranking
 * @param {HTMLElement} container
 */
function renderHero(pkg, ranking, container) {
  if (!pkg) {
    container.innerHTML = '<div style="color:#8b949e;padding:1rem;">暂无数据</div>'
    return
  }

  const primaryValue = ranking.sortKey(pkg)
  const primaryStr = ranking.format(primaryValue)
  const labelDescription = !ranking.labelDescription
    ? ""
    : `<span class="hero-description">（${ranking.labelDescription}）</span>`

  const hero = document.createElement("div")
  hero.className = "hero"
  // <span class="hero-rank">🏆 第1名</span>
  hero.innerHTML = `
    <h2 class="hero-name">
      <span class="hero-rank">🏆</span>
      <a href="https://www.npmjs.com/package/${encodeURIComponent(pkg.name)}" target="_blank">${escapeHtml(pkg.name)}</a>
    </h2>
    <div class="hero-primary">${ranking.label}: ${primaryStr} ${labelDescription}</div>
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
/**
 *
 * @param {FreshPackageDetail[]} packages
 * @param {IRanking} ranking
 * @param {*} container
 * @returns
 */
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
  // const colors = packages.map((_, i) => (i === 0 ? "rgba(88, 166, 255, 1)" : "rgba(88, 166, 255, 0.35)"))
  const macaronColors = [
    "rgba(255, 179, 186, 0.85)", // 粉
    "rgba(255, 223, 186, 0.85)", // 杏
    "rgba(255, 241, 186, 0.85)", // 奶油
    "rgba(186, 225, 186, 0.85)", // 薄荷
    "rgba(186, 212, 255, 0.85)", // 天蓝
    "rgba(212, 186, 255, 0.85)", // 薰衣草
    "rgba(255, 186, 223, 0.85)", // 粉紫
  ]
  const morandiColors = [
    "rgba(192, 173, 165, 0.85)", // 灰粉
    "rgba(185, 178, 160, 0.85)", // 灰杏
    "rgba(178, 190, 181, 0.85)", // 灰绿
    "rgba(173, 185, 196, 0.85)", // 灰蓝
    "rgba(196, 185, 200, 0.85)", // 灰紫
    "rgba(200, 174, 174, 0.85)", // 豆沙
    "rgba(174, 190, 174, 0.85)", // 鼠尾草
  ]
  const tdesignLightColors = [
    "rgba(0, 110, 255, 0.70)", // 品牌蓝
    "rgba(45, 185, 120, 0.70)", // 翠绿
    "rgba(255, 153, 0, 0.70)", // 琥珀
    "rgba(213, 73, 100, 0.70)", // 珊瑚
    "rgba(122, 97, 255, 0.70)", // 紫罗兰
    "rgba(0, 180, 210, 0.70)", // 湖蓝
    "rgba(255, 120, 80, 0.70)", // 橙红
  ]
  const gradientColors = [
    "rgba(255, 179, 171, 0.85)",
    "rgba(255, 205, 171, 0.85)",
    "rgba(255, 232, 171, 0.85)",
    "rgba(214, 255, 171, 0.85)",
    "rgba(171, 255, 214, 0.85)",
    "rgba(171, 232, 255, 0.85)",
    "rgba(171, 205, 255, 0.85)",
  ]

  let colors = [
    "rgba(255, 99, 132, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
  ]
  // colors = gradientColors

  // const max = Math.max(...values)
  // const min = Math.min(...values)
  // colors = values.map((value) => {
  //   const intensity = (value - min) / (max - min)
  //   const lightness = 80 - intensity * 30 // 80% ~ 50%
  //   return `hsl(210, 70%, ${lightness}%)`
  // })

  const borderColors = [
    "rgb(255, 99, 132)",
    "rgb(54, 162, 235)",
    "rgb(255, 206, 86)",
    "rgb(75, 192, 192)",
    "rgb(153, 102, 255)",
  ]

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
          // borderColor: borderColors,
          borderColor: ["black"],
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
/**
 *
 * @param {string} str
 * @returns
 */
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
