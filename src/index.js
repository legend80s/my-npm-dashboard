import { Chart, registerables } from "chart.js"
import {
  fetchGitHubLastCommit,
  fetchGitHubStars,
  fetchPackageMetadata,
  fetchUserPackages,
  fetchYearlyWeeklyDownloads,
} from "./utils/api.js"
import { clearCache, getCache, getCacheTTL, setCache } from "./utils/cache.js"

Chart.register(...registerables)

/** @import { CacheData, FreshPackageDetail, Hottest, PackageDetail } from './index.type.js' */
/** @import { NpmPkgDownloadsResp, NpmPkgResp, NpmPkgSearchResp } from './utils/npmjs.type.js' */

// ============================================================
//  1. DOM refs
// ============================================================
/** @type {HTMLFormElement} */
// @ts-expect-error
const form = document.getElementById("searchForm")
/** @type {HTMLInputElement} */
// @ts-expect-error
const usernameInput = document.getElementById("usernameInput")
/** @type {HTMLInputElement} */
// @ts-expect-error
const limitInput = document.getElementById("limitInput")
const searchBtn = document.getElementById("searchBtn")
const statusBadge = document.getElementById("statusBadge")
const grid = document.getElementById("grid")
// const pkgCount = document.getElementById("pkgCount")
// const totalDownloads = document.getElementById("totalDownloads")
const hottestPkg = document.getElementById("hottestPkg")
const updateTime = document.getElementById("updateTime")

const config = {
  pkgLimit: 3,
}

console.log("1 limitInput.value:", limitInput.value)

limitInput.value = String(config.pkgLimit)
console.log("2 limitInput.value:", limitInput.value)

// ============================================================
//  2. URL 参数读写
// ============================================================
function getUrlParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    username: params.get("username") || "",
    limit: Number(params.get("limit")) || config.pkgLimit,
  }
}

function setUrlParams(username, limit) {
  const params = new URLSearchParams()
  if (username) params.set("username", username)
  if (limit) params.set("limit", String(limit))
  const newUrl =
    window.location.pathname +
    (params.toString() ? "?" + params.toString() : "")
  window.history.replaceState({}, "", newUrl)
}

// ============================================================
//  3. 状态管理
// ============================================================
let isLoading = false

function setStatus(text, type = "") {
  statusBadge.textContent = text
  statusBadge.className = "status-badge" + (type ? " " + type : "")
}

function setLoading(loading) {
  isLoading = loading
  searchBtn.disabled = loading
  searchBtn.textContent = loading ? "⏳ 加载中..." : "🔍 探出"
  setStatus(loading ? "加载中..." : "就绪", loading ? "loading" : "")
}

// ============================================================
//  5. 数据聚合
// ============================================================

/** 从 package.json 中解析 GitHub repo */
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

// ============================================================
//  6. 相对时间格式化
// ============================================================
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
//  7. 渲染 Mermaid 图表
// ============================================================

function buildMermaidChart(pkgName, weeklyData) {
  if (!weeklyData || weeklyData.length === 0) {
    return `xychart-beta
                    title "${pkgName} 周下载量"
                    x-axis [无数据]
                    line [0]`
  }

  // 生成日期标签（最近 7 天）
  const labels = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }

  // 限制数据点数量，防止图表过于拥挤
  const data = weeklyData.slice(0, 7)
  // 补齐到 7 个点
  while (data.length < 7) data.push(0)

  const labelStr = labels.join(", ")
  const dataStr = data.join(", ")

  return `xychart-beta
                title "${pkgName}"
                x-axis [${labelStr}]
                line [${dataStr}]`
}

/**
 * 使用 Chart.js 渲染周聚合下载量曲线
 * @param {HTMLElement} container - 图表容器DOM元素
 * @param {string} pkgName - 包名
 * @param {Array<{ weekIndex: number; startDate: Date; endDate: Date; total: number; days: { date: string; downloads: any; }[] }>} weeklyData - 周数据数组 [{ weekIndex, startDate, endDate, total, days }]
 */
async function renderChart(container, pkgName, weeklyData) {
  // await nextIdle()
  console.log("container, pkgName, weeklyData", {
    container,
    pkgName,
    weeklyData,
  })
  // 检查数据是否有效
  if (
    !weeklyData ||
    weeklyData.length === 0 ||
    weeklyData.every((w) => w.total === 0)
  ) {
    container.innerHTML = `<div class="chart-placeholder">📊 暂无下载数据</div>`
    return
  }

  try {
    // 准备数据
    const labels = weeklyData.map((w) => {
      // 显示周结束日期 (月/日)
      const end = w.endDate
      return `${end.getMonth() + 1}/${end.getDate()}`
    })
    const dataPoints = weeklyData.map((w) => w.total)
    // 创建 Canvas 元素
    const canvas = document.createElement("canvas")
    container.innerHTML = "" // 清空容器
    container.appendChild(canvas)

    // 创建图表实例
    const ctx = canvas.getContext("2d")
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "周下载量",
            data: dataPoints,
            borderColor: "#58a6ff",
            backgroundColor: "rgba(88, 166, 255, 0.1)",
            borderWidth: 2,
            pointRadius: 0.8,
            pointHoverRadius: 4,
            pointBackgroundColor: "#58a6ff",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              title: (items) => {
                if (!items.length) return ""
                const index = items[0].dataIndex
                const week = weeklyData[index]
                if (!week) return ""
                const start = week.startDate
                const end = week.endDate
                return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
              },
              label: (context) => {
                const index = context.dataIndex
                const week = weeklyData[index]
                if (!week) {
                  return ""
                }
                return ` Weekly: ${week.total.toLocaleString()}`
              },
              // afterLabel: (context) => {
              //   const index = context.dataIndex
              //   const week = weeklyData[index]
              //   if (!week) {
              //     return ""
              //   }
              //   // 显示每日明细
              //   const details = week.days
              //     .map(
              //       (d) =>
              //         `${new Date(d.date).toLocaleDateString()}: ${d.downloads.toLocaleString()}`,
              //     )
              //     .join("; ")
              //   return `每日明细: ${details}`
              // },
            },
          },
        },
        scales: {
          x: {
            // type: "category", // 显式指定类型

            grid: {
              color: "#21262d",
              drawBorder: false,
            },
            ticks: {
              color: "#8b949e",
              font: {
                size: 8,
              },
              maxTicksLimit: 15, // 限制显示标签数量
              maxRotation: 45,
              minRotation: 30,
              autoSkip: true,
              autoSkipPadding: 20,
            },
          },
          y: {
            // type: "linear", // 显式指定类型

            grid: {
              color: "#21262d",
              drawBorder: false,
            },
            ticks: {
              color: "#8b949e",
              font: {
                size: 8,
              },
              callback: (value) => {
                if (value >= 1000) return value / 1000 + "k"
                return value
              },
            },
            beginAtZero: true,
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        hover: {
          mode: "index",
          intersect: false,
        },
      },
    })
  } catch (error) {
    console.error("Chart.js 渲染失败:", error)
    container.innerHTML = `<div class="chart-placeholder">📊 图表加载失败</div>`
  }
}

// ============================================================
//  8. 主流程：加载数据并渲染
// ============================================================

/**
 *
 * @param {string} username
 * @param {number} limit
 * @param {boolean} forceRefresh
 * @returns
 */
async function loadPackages(username, limit, forceRefresh = false) {
  if (isLoading) {
    return
  }

  username = username.trim()
  if (!username) {
    grid.innerHTML = `
        <div class="no-results">
            <span class="big">🐿️</span>
            请输入 npm 用户名
        </div>
    `
    // pkgCount.textContent = "-"
    // totalDownloads.textContent = "-"
    hottestPkg.textContent = "-"
    updateTime.textContent = "-"

    updateCacheInfo()

    return
  }

  // 检查缓存（除非强制刷新）
  let pkgDetails = null
  if (!forceRefresh) {
    pkgDetails = getCache(username.trim(), limit)
    if (pkgDetails) {
      // 使用缓存数据
      await renderFromData(pkgDetails, username, limit, true)
      setLoading(false)
      return
    }
  }

  // 缓存未命中或强制刷新，重新加载
  setLoading(true)
  grid.innerHTML = `<div class="no-results"><span class="big">⏳</span>正在“觅食” ${username} 的 ${limit} 个包...</div>`

  try {
    // ---- 8a. 搜索包 ----
    const packages = await fetchUserPackages(username, limit)
    if (!packages.length) {
      grid.innerHTML = `
          <div class="no-results">
              <span class="big">😕</span>
              用户 <strong>${username}</strong> 没有找到任何包
          </div>
      `
      // pkgCount.textContent = "0"
      // totalDownloads.textContent = "0"
      hottestPkg.textContent = "-"
      updateTime.textContent = new Date().toLocaleString()

      updateCacheInfo()

      setLoading(false)
      return
    }

    // 按最近发布时间排序（npm search 已排序，但再确保一下）
    packages.sort((a, b) => new Date(b.date) - new Date(a.date))

    // ---- 8b. 并发获取每个包的详细数据 ----
    const pkgDetails = []
    let grandTotal = 0
    /** @type {Hottest} */
    let hottest = { name: "", downloads: 0, latestWeekDownloads: 0 }

    for (const pkg of packages) {
      try {
        const meta = await fetchPackageMetadata(pkg.name)
        // 使用新的周聚合函数
        const downloads = await fetchYearlyWeeklyDownloads(pkg.name)
        /** @type {string} */
        const version = meta["dist-tags"]?.latest || pkg.version || "--"
        const publishedAt = meta.time?.[version] || pkg.date || null
        const createdAt = meta.time?.created || null

        // 解析 GitHub repo
        const github = {
          owner: null,
          repo: null,
          stars: null,
          lastCommit: null,
          lastCommitDate: null,
        }
        const ghRepo = parseGitHubRepo(meta)
        if (ghRepo) {
          github.owner = ghRepo.owner
          github.repo = ghRepo.repo
          try {
            const starData = await fetchGitHubStars(ghRepo.owner, ghRepo.repo)
            github.stars = starData.stars
          } catch (error) {
            /* 静默 */
            console.log(`[WARN] fetching GitHub stars for`, ghRepo, error)
          }
          try {
            const commitData = await fetchGitHubLastCommit(
              ghRepo.owner,
              ghRepo.repo,
            )
            github.lastCommit = commitData.message
            github.lastCommitDate = commitData.date
          } catch (error) {
            /* 静默 */
            console.log(`[WARN] fetching GitHub last commit for`, ghRepo, error)
          }
        }

        // 计算"最近活跃时间"：max(发布时间, GitHub提交时间)
        let activeAt = publishedAt
        if (
          github.lastCommitDate &&
          new Date(github.lastCommitDate) > new Date(activeAt || 0)
        ) {
          activeAt = github.lastCommitDate
        }

        pkgDetails.push({
          name: pkg.name,
          version,
          publishedAt,
          createdAt,
          // 存储完整的周数据
          weeklyData: downloads.weekly,
          totalDownloads: downloads.total,
          trend: downloads.trend,
          github,
          activeAt,
        })

        grandTotal += downloads.total
        const latestWeekDownloads = downloads.weekly.at(-1)?.total || 0
        if (latestWeekDownloads > hottest.latestWeekDownloads) {
          hottest = {
            name: pkg.name,
            downloads: downloads.total,
            latestWeekDownloads,
          }
        }
      } catch (err) {
        // 单个包失败，添加错误占位
        pkgDetails.push({
          name: pkg.name,
          version: "--",
          publishedAt: null,
          createdAt: null,
          // downloads: [],
          totalDownloads: 0,
          trend: 0,
          github: {
            owner: null,
            repo: null,
            stars: null,
            lastCommit: null,
            lastCommitDate: null,
          },
          activeAt: null,
          error: err.message,
        })
      }
    }

    // ---- 8c. 按活跃度排序 ----
    pkgDetails.sort((a, b) => {
      const da = a.activeAt ? new Date(a.activeAt).getTime() : 0
      const db = b.activeAt ? new Date(b.activeAt).getTime() : 0
      return db - da
    })

    // ---- 8d. 更新统计 ----
    // pkgCount.textContent = pkgDetails.length
    // totalDownloads.textContent = grandTotal.toLocaleString()
    // console.log("hottest.latestWeekDownloads:", hottest.latestWeekDownloads)
    renderHottest(hottest)
    updateTime.textContent = new Date().toLocaleString()

    // 缓存聚合数据
    setCache(username, limit, pkgDetails)

    // ---- 8e. 渲染 ----
    await renderFromData(pkgDetails, username, limit, false)

    // ---- 8f. 更新 URL ----
    // setUrlParams(username, limit) // TODO: WHY
  } catch (err) {
    console.error(err)
    grid.innerHTML = `
        <div class="no-results">
            <span class="big">❌</span>
            ${err.message || "加载失败，请检查网络或重试"}
        </div>
    `
  }

  setLoading(false)
}

/**
 * 从数据渲染页面（共享渲染逻辑）
 * @param {FreshPackageDetail[]} pkgDetails 包详情
 * @param {string} username 用户名
 * @param {number} limit 包数量限制
 * @param {boolean} fromCache 是否从缓存中读取
 */
async function renderFromData(pkgDetails, username, limit, fromCache) {
  // 更新统计
  // const total = pkgDetails.reduce((sum, p) => sum + (p.totalDownloads || 0), 0)
  /** @type {Hottest} */
  let hottest = { name: "", latestWeekDownloads: 0, downloads: 0 }

  for (const pkg of pkgDetails) {
    const latest = pkg.weeklyData?.at(-1)?.total
    if (latest && latest > hottest.latestWeekDownloads) {
      hottest = {
        downloads: pkg.totalDownloads,
        name: pkg.name,
        latestWeekDownloads: latest,
      }
    }
  }

  // pkgCount.textContent = pkgDetails.length
  // totalDownloads.textContent = total.toLocaleString()
  renderHottest(hottest)

  updateTime.textContent = new Date().toLocaleString()

  // 更新缓存信息
  updateCacheInfo()

  // 显示缓存状态
  const cacheStatus = document.getElementById("cacheStatus")
  if (cacheStatus) {
    cacheStatus.textContent = fromCache ? "📦 缓存" : "🔄 实时"
    cacheStatus.style.color = fromCache ? "#8b949e" : "#3fb950"
  }

  // 渲染卡片
  await renderCards(pkgDetails)

  // 更新 URL
  setUrlParams(username, limit)
}

/**
 * 更新缓存信息显示
 */
function updateCacheInfo() {
  const ttlDisplay = document.getElementById("cacheTTL")
  if (ttlDisplay) {
    ttlDisplay.textContent = getCacheTTL()
  }
}

// ============================================================
//  9. 渲染卡片（含 Mermaid 图表）
// ============================================================
/**
 *
 * @param {FreshPackageDetail[]} pkgDetails
 */
async function renderCards(pkgDetails) {
  // 先清空并生成卡片 DOM
  grid.innerHTML = ""
  const cardElements = []

  for (const pkg of pkgDetails) {
    const card = document.createElement("a")
    card.className = "card"

    // 点击跳转 npm
    card.href = `https://www.npmjs.com/package/${pkg.name}`
    card.target = "_blank"

    // 构建 GitHub 信息
    let ghInfo = ""
    if (pkg.github.owner && pkg.github.repo) {
      const starDisplay = pkg.github.stars !== null ? pkg.github.stars : "--"
      const commitDisplay = pkg.github.lastCommit || "--"
      const commitTime = pkg.github.lastCommitDate
        ? timeAgo(pkg.github.lastCommitDate)
        : ""
      ghInfo = `
        <div class="card-metrics">
            <span class="metric">⭐ <strong>${starDisplay}</strong></span>
            <span class="metric">💻 <strong>${commitDisplay}</strong>${commitTime ? " · " + commitTime : ""}</span>
        </div>
      `
    } else {
      ghInfo = `
        <div class="card-metrics">
            <span class="metric">⭐ <strong>--</strong></span>
            <span class="metric">💻 <strong>暂无 GitHub 数据</strong></span>
        </div>
      `
    }

    // 错误状态
    if (pkg.error) {
      card.innerHTML = `
        <div class="card-header">
            <span class="card-name">⚠️ ${pkg.name}</span>
            <span class="card-version">--</span>
        </div>
        <div class="card-metrics" style="color:#f85149;">
            ${pkg.error}
        </div>
      `
      card.className = "card-error"
      grid.appendChild(card)
      continue
    }

    // 正常卡片
    const trendClass =
      pkg.trend > 0 ? "trend-up" : pkg.trend < 0 ? "trend-down" : "trend-flat"
    const trendArrow = pkg.trend > 0 ? "↑" : pkg.trend < 0 ? "↓" : "→"

    const publishedDisplay = pkg.publishedAt ? timeAgo(pkg.publishedAt) : "--"
    const createdDisplay = pkg.createdAt
      ? new Date(pkg.createdAt).toISOString().slice(0, 10)
      : "--"

    // 将 .chart-container 的占位内容改为空，并添加 data 属性
    card.innerHTML = `
                    <div class="card-header">
                        <span class="card-name">📦 ${pkg.name}</span>
                        <span class="card-version">v${pkg.version}</span>
                    </div>
                    <div class="chart-container" id="chart-${pkg.name.replace(/[^a-zA-Z0-9]/g, "-")}" 
                        data-pkgname="${pkg.name}">
                        <!-- Chart.js 将在此渲染 Canvas -->
                    </div>
                    <div class="card-metrics">
                        <span class="metric">📥 <strong>${pkg.totalDownloads.toLocaleString()}</strong></span>
                        <span class="metric ${trendClass}">${trendArrow} ${Math.abs(pkg.trend)}%</span>
                        <span class="metric" title="${new Date(pkg.publishedAt).toLocaleString()}">📅 发布 <strong>${publishedDisplay}</strong></span>
                        <span class="metric" title="${new Date(pkg.createdAt).toLocaleString()}">🕐 创建 <strong>${createdDisplay}</strong></span>
                    </div>
                    ${ghInfo}
                `

    grid.appendChild(card)
    cardElements.push({ element: card, pkg })
  }

  // 异步渲染 Mermaid 图表
  for (const { element, pkg } of cardElements) {
    const container = element.querySelector(".chart-container")

    await renderChart(
      // @ts-expect-error
      container,
      pkg.name,
      pkg.weeklyData,
    )
  }
}

// ============================================================
//  11. 初始化：读取 URL 参数，自动加载
// ============================================================

function init() {
  const params = getUrlParams()
  if (params.username) {
    usernameInput.value = params.username
    limitInput.value = String(params.limit)
    // 尝试从缓存加载，无需强制刷新
    loadPackages(params.username, params.limit, false)
  }

  // 表单提交
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const username = usernameInput.value.trim()
    const limit = Number(limitInput.value) || config.pkgLimit
    if (username) {
      loadPackages(username, limit, false) // 正常加载，使用缓存
    } else {
      usernameInput.focus()
    }
  })

  // 刷新按钮（新增）
  // @ts-expect-error
  document.getElementById("refreshBtn").addEventListener("click", () => {
    const username = usernameInput.value.trim()
    const limit = Number(limitInput.value) || config.pkgLimit
    if (username) {
      clearCache() // 清除缓存
      loadPackages(username, limit, true) // 强制刷新
    } else {
      usernameInput.focus()
    }
  })

  // 回车快速搜索
  usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      form.dispatchEvent(new Event("submit"))
    }
  })

  // 更新缓存信息
  updateCacheInfo()
}

// 启动
document.addEventListener("DOMContentLoaded", init)

// 4. 组合：等待下一帧 + 空闲（确保至少一帧）
// function nextIdle(options = {}) {
//   const start = Date.now()

//   return new Promise((resolve) => {
//     // 先等待一帧，确保 DOM 已更新
//     requestAnimationFrame(() => {
//       console.log("requestAnimationFrame 等待一帧", Date.now() - start)
//       // 然后在空闲时执行
//       if ("requestIdleCallback" in window) {
//         requestIdleCallback(() => {
//           console.log("requestIdleCallback 空闲", Date.now() - start)
//           resolve({ duration: Date.now() - start })
//         }, options)
//       } else {
//         setTimeout(resolve, 1)
//       }
//     })
//   })
// }

/**
 * @param {Hottest} hottest
 */
function renderHottest(hottest) {
  hottestPkg.textContent = hottest.name
    ? `${hottest.name} (Latest week downloads: ${hottest.latestWeekDownloads.toLocaleString()})`
    : "-"
}
