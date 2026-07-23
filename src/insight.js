import { Chart, registerables } from "chart.js"
import { readCache, writeCache, fetchRaw, RANKING_TOP_N } from "./utils/data-loader.js"

Chart.register(...registerables)

/** @import { FreshPackageDetail } from './index.type.js' */

// ============================================================
//  Config & Rankings
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

// ============================================================
//  Start
// ============================================================
document.addEventListener("DOMContentLoaded", init)
