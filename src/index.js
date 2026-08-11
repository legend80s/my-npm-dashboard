import { Chart, registerables } from "chart.js"
import { MAX_SEARCH_SIZE } from "./utils/api.js"
import { byActiveAtDesc, CACHE_TTL_IN_HOURS, getCache, getCacheTTL } from "./utils/cache.js"
import { clearCache, fetchPackageDetails, fetchRaw, writeCache } from "./utils/data-loader.js"
import { numberToLocaleString, timeAgo as resolveRelativeTime } from "./utils/light-lodash.js"

Chart.register(...registerables)

import "./web-components/simple-counter/index.js"
import "./web-components/badge-dependencies/index.js"
import "./web-components/fancy-separator.js"

const NPMJS_DOMAIN = `https://www.npmjs.com`
const NPMX_DOMAIN = `https://npmx.dev`

/** @type {Set<Chart>} */
const charts = new Set()

/** @import { CacheData, FreshPackageDetail, Hottest, PackageDetail } from './index.type.js' */

// ============================================================
//  1. DOM refs
// ============================================================

const form = /** @type {HTMLFormElement} */ (document.getElementById("searchForm"))

const usernameInput = /** @type {HTMLInputElement} */ (document.getElementById("usernameInput"))

const limitInput = /** @type {HTMLInputElement} */ (document.getElementById("limitInput"))

const searchBtn = /** @type {HTMLButtonElement} */ (document.getElementById("searchBtn"))
// const statusBadge = document.getElementById("statusBadge")
const refreshBtn = /** @type {HTMLButtonElement} */ (document.getElementById("refreshBtn"))
const refreshText = /** @type {HTMLSpanElement} */ (document.getElementById("refreshText"))

const grid = /** @type {HTMLDivElement} */ (document.getElementById("grid"))
// const pkgCount = document.getElementById("pkgCount")
// const totalDownloads = document.getElementById("totalDownloads")

const hottestPkg = /** @type {HTMLDivElement} */ (document.getElementById("hottestPkg"))

const hottestTrendPkg = /** @type {HTMLDivElement} */ (document.getElementById("hottestTrendPkg"))

const updateTime = /** @type {HTMLDivElement} */ (document.getElementById("updateTime"))

const config = {
  pkgLimit: 4,
  MAX_SEARCH_SIZE,
}

// console.log("1 limitInput.value:", limitInput.value)

limitInput.value = String(config.pkgLimit)
limitInput.max = String(config.MAX_SEARCH_SIZE)
// console.log("2 limitInput.value:", limitInput.value)

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

/**
 *
 * @param {string} username
 * @param {number} limit
 */
function setUrlParams(username, limit) {
  const params = new URLSearchParams()

  if (username) {
    params.set("username", username)
  }

  if (limit) {
    params.set("limit", String(limit))
  }

  const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
  window.history.replaceState({}, "", newUrl)
}

// ============================================================
//  3. 状态管理
// ============================================================
let isLoading = false

// function setStatus(text, type = "") {
//   statusBadge.textContent = text
//   statusBadge.className = type ? "status-badge " + type : ""
// }

const old = searchBtn.textContent

/** @param {boolean} loading */
function setLoading(loading) {
  isLoading = loading
  searchBtn.disabled = loading
  refreshBtn.classList.toggle("loading", loading)
  if (loading) {
    searchBtn.style.display = "none"
    // searchBtn.innerHTML = '<span class="loading-spin">⏳</span>'
  } else {
    searchBtn.style.display = "inline-block"
    searchBtn.textContent = old
  }
  // setStatus(loading ? "加载中..." : "", loading ? "loading" : "")
}

// ============================================================
//  5. 数据聚合
// ============================================================

/**
 * 6. 相对时间格式化
 * @param {string} dateStr
 * @returns {string}
 */
function timeAgo(dateStr) {
  return resolveRelativeTime(new Date(dateStr))

  // biome-ignore lint/correctness/noUnreachable: <explanation>
  if (!dateStr) {
    return "未知"
  }
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) {
    return "刚刚"
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} 分钟前`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours} 小时前`
  }
  const days = Math.floor(hours / 24)
  if (days < 30) {
    return `${days} 天前`
  }
  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months} 个月前`
  }
  return `${(months / 12).toFixed(1).replace(/.0$/, "")} 年前`
}

// ============================================================
//  7. 渲染图表
// ============================================================
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
  if (!weeklyData || weeklyData.length === 0 || weeklyData.every((w) => w.total === 0)) {
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

    // clean up any previous chart on this container
    // @ts-expect-error
    const prev = container.__chart
    if (prev) {
      charts.delete(prev)
      prev.destroy()
    }

    // 创建图表实例
    const rootStyle = getComputedStyle(document.documentElement)
    // const chartGridColor = "#d8dee4"
    const chartGridColor = rootStyle.getPropertyValue("--border-muted").trim()
    console.log({ chartGridColor })
    // const chartGridColor = rootStyle.getPropertyValue("--border-muted").trim() || "#21262d"
    const chartTickColor = rootStyle.getPropertyValue("--text-muted").trim() || "#8b949e"
    const chartAccentColor = rootStyle.getPropertyValue("--accent-green").trim() || "#58a6ff"

    const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"))

    const crosshairPlugin = {
      id: "crosshair",
      afterDraw(/** @type {Chart} */ chart) {
        if (chart.tooltip?.opacity === 0 || !chart.tooltip?.dataPoints?.length) {
          return
        }
        const dp = chart.tooltip.dataPoints[0]
        // @ts-expect-error
        const x = dp.element.x
        // @ts-expect-error
        const y = dp.element.y
        const { bottom } = chart.chartArea
        // @ts-expect-error
        const color = chart.data.datasets[0].borderColor
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, bottom)
        ctx.lineWidth = 1
        ctx.strokeStyle = /** @type {string} */ (color)
        ctx.setLineDash([4, 3])
        ctx.stroke()
        ctx.restore()
      },
    }

    const chart = new Chart(ctx, {
      type: "line",
      plugins: [crosshairPlugin],
      data: {
        labels: labels,
        datasets: [
          {
            label: "周下载量",
            data: dataPoints,
            borderColor: chartAccentColor,
            backgroundColor: "rgb(173 255 47 / 8%)",
            // backgroundColor: "rgba(88, 166, 255, 0.1)",
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: chartAccentColor,
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
                return ` Weekly: ${numberToLocaleString(week.total)}`
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
              color: chartGridColor,
              // drawOnChartArea: false,
              // drawTicks: false,
            },
            ticks: {
              color: chartTickColor,
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
              color: chartGridColor,
              drawBorder: false,
            },
            ticks: {
              color: chartTickColor,
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
    // @ts-expect-error
    container.__chart = chart
    charts.add(chart)
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
 * @param {number} displayLimit
 * @param {boolean} forceRefresh
 * @returns
 */
async function loadPackages(username, displayLimit, forceRefresh = false) {
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
    hottestPkg.textContent = "-"
    hottestTrendPkg.textContent = "-"
    updateTime.textContent = "-"

    updateCacheInfo()

    return
  }

  const { limit } = getUrlParams()
  console.log("limit:", limit)

  // 尝试从缓存加载
  if (!forceRefresh) {
    const cached = getCache(username, limit)
    if (cached) {
      const pkgDetails = cached.packages.slice(0, displayLimit)

      await renderFromData(pkgDetails, username, displayLimit, true, cached.timestamp)
      setLoading(false)
      return
    }
  }

  // 缓存未命中或强制刷新
  setLoading(true)
  grid.innerHTML = `<div class="no-results" style="color:var(--orange);"><span class="big loading-spin">⏳</span>正在搜索 ${username} 的包...</div>`

  try {
    /** @type {FreshPackageDetail[]} */
    const collected = []
    let statsUpdated = false

    const dataPromise = fetchRaw(username, {
      forceRefresh,
      /** @param {FreshPackageDetail} pkgDetail @param {number} done @param {number} total */
      onPackage(pkgDetail, done, total) {
        refreshText.textContent = `刷新 ${done}/${total}`

        if (done <= displayLimit) {
          collected.push(pkgDetail)
          appendCard(pkgDetail)
        }

        if (done >= 1) {
          const progressEl = grid.querySelector(".no-results")
          progressEl?.remove()
        }

        if (done === Math.min(displayLimit, total) && !statsUpdated) {
          statsUpdated = true
          updateStats(collected, username, false, null)
          reorderCardsByActiveAt(collected)
          setUrlParams(username, displayLimit)
          setLoading(false)
        }
      },
    })

    const data = await dataPromise
    writeCache(username, data.packages)

    if (data.packages.length === 0) {
      grid.innerHTML = `
          <div class="no-results">
              <span class="big">😕</span>
              用户 <strong>${username}</strong> 没有找到任何包
          </div>
      `
      hottestPkg.textContent = "-"
      hottestTrendPkg.textContent = "-"
      updateTime.textContent = "-"
      updateCacheInfo()
      setLoading(false)
    }
  } catch (err) {
    console.error(err)
    grid.innerHTML = `
        <div class="no-results">
            <span class="big">❌</span>
            ${
              // @ts-expect-error
              err.message || "加载失败，请检查网络或重试"
            }
        </div>
    `
    setLoading(false)
  }
}

/**
 * 更新统计信息（hottest/trend）和 UI 状态
 * @param {FreshPackageDetail[]} pkgDetails
 * @param {string} username
 * @param {boolean} fromCache
 * @param {number|null} cacheTimestamp
 */
function updateStats(pkgDetails, username, fromCache, cacheTimestamp) {
  let hottest = { name: "", latestWeekDownloads: 0, downloads: 0 }
  let hottestTrend = { name: "", trend: 0 }

  for (const pkg of pkgDetails) {
    const latest = pkg.weeklyData?.at(-1)?.total
    if (latest && latest > hottest.latestWeekDownloads) {
      hottest = {
        downloads: pkg.totalDownloads,
        name: pkg.name,
        latestWeekDownloads: latest,
      }
    }
    if (pkg.trend > hottestTrend.trend) {
      hottestTrend = { name: pkg.name, trend: pkg.trend }
    }
  }

  renderHottest(hottest, username)
  renderHottestTrend(hottestTrend, username)

  updateTime.textContent = getFreshnessLabel(fromCache, cacheTimestamp)
  updateCacheInfo()

  /** @type {HTMLElement} */
  // @ts-expect-error
  const cacheStatus = document.getElementById("cacheStatus")
  cacheStatus.textContent = fromCache ? "" : "🔄 实时"
  cacheStatus.style.color = fromCache ? "var(--text-muted)" : "var(--accent-green)"

  /** @type {HTMLImageElement} */
  // @ts-expect-error
  const sortAvatar = document.getElementById("sortAvatar")
  sortAvatar.src = `https://avatars.githubusercontent.com/${username}?s=64`
  sortAvatar.hidden = false

  // const sortInfo = /** @type {HTMLElement} */ (document.getElementById("sortInfo"))
  // const usernameElement = sortInfo.querySelector(".text-primary")
  // if (usernameElement && usernameElement.textContent.trim() !== username) {
  //   usernameElement.textContent = username
  // }
}

/**
 * FLIP 动画：按活跃时间重排已展示的卡片
 * @param {FreshPackageDetail[]} pkgDetails
 */
function reorderCardsByActiveAt(pkgDetails) {
  const cardEls = [...grid.children].filter((el) => !el.classList.contains("no-results"))
  if (cardEls.length < 2) return

  const firstRects = cardEls.map((el) => el.getBoundingClientRect())

  const sorted = [...pkgDetails].sort(byActiveAtDesc)
  const nameToEl = {}
  for (const el of cardEls) {
    nameToEl[el.dataset.pkgName] = el
  }

  for (const pkg of sorted) {
    const el = nameToEl[pkg.name]
    if (el) grid.appendChild(el)
  }

  const lastRects = cardEls.map((el) => el.getBoundingClientRect())

  requestAnimationFrame(() => {
    for (let i = 0; i < cardEls.length; i++) {
      const dx = firstRects[i].left - lastRects[i].left
      const dy = firstRects[i].top - lastRects[i].top
      if (dx === 0 && dy === 0) continue
      cardEls[i].style.transform = `translate(${dx}px, ${dy}px)`
      cardEls[i].style.transition = "none"
    }
    requestAnimationFrame(() => {
      for (const el of cardEls) {
        el.style.transition = "transform 0.5s ease"
        el.style.transform = ""
      }
      setTimeout(() => {
        for (const el of cardEls) {
          el.style.transition = ""
        }
      }, 500)
    })
  })
}

/**
 * 从数据渲染页面（缓存路径用）
 * @param {FreshPackageDetail[]} pkgDetails 包详情
 * @param {string} username 用户名
 * @param {number} limit 包数量限制
 * @param {boolean} fromCache 是否从缓存中读取
 * @param {number | null} cacheTimestamp - 缓存写入时间戳（仅 fromCache=true 时有效）
 * @returns {Promise<void>}
 */
async function renderFromData(pkgDetails, username, limit, fromCache, cacheTimestamp) {
  updateStats(pkgDetails, username, fromCache, cacheTimestamp)

  pkgDetails.sort(byActiveAtDesc)

  await renderCards(pkgDetails)

  setUrlParams(username, limit)
}

/**
 * 更新缓存信息显示
 */
function updateCacheInfo() {
  const ttlDisplay = document.getElementById("cacheTTL")
  ttlDisplay?.setHTMLUnsafe(
    `TTL <strong>${CACHE_TTL_IN_HOURS}</strong> 小时 | Remaining <strong>${getCacheTTL()}</strong>`,
  )
}

// ============================================================
//  9. 卡片 DOM 创建
// ============================================================
/**
 * 创建单个卡片 DOM 元素（不含图表渲染）
 * @param {FreshPackageDetail} pkg
 * @returns {HTMLElement}
 */
function createCardElement(pkg) {
  const card = document.createElement("article")
  card.className = "card card--package"
  card.dataset.pkgName = pkg.name

  // 构建 GitHub 信息
  let ghInfo = ""
  if (pkg.github.owner && pkg.github.repo) {
    const starDisplay = pkg.github.stars !== null ? pkg.github.stars : "--"
    const commitDisplay = pkg.github.lastCommit || "--"
    const commitTime = pkg.github.lastCommitDate ? timeAgo(pkg.github.lastCommitDate) : ""

    const repoUrl = `https://github.com/${pkg.github.owner}/${pkg.github.repo}`
    const commitUrl = `https://github.com/${pkg.github.owner}/${pkg.github.repo}/commits`

    ghInfo = `
      <div class="card-metrics" style="flex-wrap: nowrap;">
          <a href="${repoUrl}" target="_blank" title="github stars ${starDisplay}">
            <img alt="GitHub Repo stars" style="vertical-align: middle;" src="https://img.shields.io/github/stars/${pkg.github.owner}/${pkg.github.repo}">
          </a>
          <fancy-separator></fancy-separator>
          <a href="${commitUrl}" target="_blank" style="align-items: center;max-width: 77%; white-space:nowrap;" title="GitHub Latest Commit: “${commitDisplay}” · ${new Date(pkg.github.lastCommitDate).toLocaleString()}">
            🖥️ Commit
            <span class="metric"><strong class="ellipsis" style="display: inline-block;max-width: 67%;vertical-align: text-bottom;">${commitDisplay.repeat(1)}</strong>${commitTime ? " · " + commitTime : ""}</span>
          </a>
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
  if ("error" in pkg) {
    card.innerHTML = `
      <div class="card-header">
          <span class="card-name">⚠️ ${pkg.name}</span>
          <span class="card-version">--</span>
      </div>
      <div class="card-metrics" style="color:var(--red);">
          ${pkg.error}
      </div>
    `
    card.className = "card-error"
    return card
  }

  const { name } = pkg

  // 正常卡片
  const trendArrow = pkg.trend > 0 ? "↑" : pkg.trend < 0 ? "↓" : "→"
  const trendColor = pkg.trend > 0 ? "brightgreen" : pkg.trend < 0 ? "yellow" : "lightgrey"
  const trendBadge = `https://img.shields.io/badge/weekly%20trend-${encodeURIComponent(`${trendArrow} ${Math.abs(pkg.trend)}%`)}-${trendColor}?logo=npm&logoColor=cyan&style=flat`

  const publishedDisplay = pkg.publishedAt ? timeAgo(pkg.publishedAt) : "--"
  const createdDisplay = pkg.createdAt ? timeAgo(pkg.createdAt) : "--"

  console.log("pkg.createdAt:", pkg.createdAt)

  // @ts-expect-error
  const latestWeekDownloads = pkg.weeklyData.at(-1).total

  const theme = document.documentElement.dataset.theme
  // console.log("theme:", theme)

  card.innerHTML = `
      <header class="card-header">
          <a class="card-name" href="${NPMJS_DOMAIN}/package/${name}" target="_blank">${name}</a>

          <div style="white-space: nowrap;">
            <img title="v${pkg.version}" src="https://img.shields.io/npm/v/${name}.svg?style=flat" alt="NPM Version" />
            <img src="https://img.shields.io/npm/${latestWeekDownloads > 1000 ? "dw" : "dm"}/${name}.svg?style=flat" alt="npm downloads" />
            <img src="https://img.shields.io/badge/yearly-${numberToLocaleString(pkg.totalDownloads)}-blue?logo=npm&logoColor=cyan&style=flat" alt="Yearly downloads: ${pkg.totalDownloads}" title="Yearly downloads: ${pkg.totalDownloads}" />
          </div>
      </header>
      <div class="chart-container" id="chart-${name.replace(/[^a-zA-Z0-9]/g, "-")}"
          data-pkgname="${name}">
      </div>

      <img class="npmx-embed-downloads-chart" src="https://npmx.dev/api/embed/downloads.svg?packages=${encodeURIComponent(name)}&metric=downloads&mode=${theme}&granularity=weekly&locale=en-US&accent=oklch%280.51+0.13+162.4%29&yLabel=Weekly+Downloads" style="height: 100%;/* aspect-ratio: 1 / 1; */width: 100%;object-fit: cover;">
      
      <div class="card-metrics">
          <a href="${NPMJS_DOMAIN}/package/${name}?activeTab=dependents"><img src="https://img.shields.io/librariesio/dependents/npm/${name}" title="dependents" alt="dependents" style="vertical-align: bottom;" /></a>

          <fancy-separator></fancy-separator>

          <badge-dependencies provider="npm" name="${name}" dependency-count="${pkg.dependencyCount}"></badge-dependencies>
          <fancy-separator></fancy-separator>
          
          <img src="${trendBadge}" title="latest week trend" alt="weekly trend: ${trendArrow} ${Math.abs(pkg.trend)}%" />

          <fancy-separator></fancy-separator>

          <img src="https://img.shields.io/badge/🚀%20发布-${publishedDisplay}-brightgreen?logoColor=cyan" title="${new Date(pkg.publishedAt).toLocaleString()}" alt="weekly trend: ↑ 1%">
          
          <fancy-separator></fancy-separator>
          
          <img src="https://img.shields.io/badge/🤰%20诞生于-${createdDisplay}-brightgreen?logoColor=cyan" title="${new Date(pkg.createdAt).toLocaleString()}" alt="weekly trend: ↑ 1%">
      </div>
      ${ghInfo}
  `
  // <span class="metric" title="${new Date(pkg.publishedAt).toLocaleString()}">🚀 发布 <strong>${publishedDisplay}</strong></span>
  // <span class="metric" title="${new Date(pkg.createdAt).toLocaleString()}">🤰 诞生于 <strong>${createdDisplay}</strong></span>
  {
    /* <span class="slash" style="
  height: 1.2em;
  transform: rotate(22deg);
  width: 0.16em;
  background: var(--color-primary);
  border-radius: 1em;
"></span> */
  }
  //   <span class="dot" style="
  //   border: 1px solid;
  //   width: 0.5em;
  //   aspect-ratio: 1;
  //   border-radius: 50%;
  //   background: var(--color-primary);
  // "></span>
  return card
}

/**
 * 追加单张卡片到 grid（含图表渲染）
 * @param {FreshPackageDetail} pkg
 */
function appendCard(pkg) {
  const card = createCardElement(pkg)
  grid.appendChild(card)

  if (card.classList.contains("card-error")) {
    return
  }

  const container = card.querySelector(".chart-container")
  renderChart(
    // @ts-expect-error
    container,
    pkg.name,
    pkg.weeklyData,
  )
}

// ============================================================
//  9B. 批量渲染卡片（含图表）
// ============================================================
/**
 * @param {FreshPackageDetail[]} pkgDetails
 */
async function renderCards(pkgDetails) {
  grid.innerHTML = ""
  const cardElements = []

  for (const pkg of pkgDetails) {
    const card = createCardElement(pkg)
    grid.appendChild(card)
    cardElements.push({ element: card, pkg })
  }

  for (let { element, pkg } of cardElements) {
    const container = element.querySelector(".chart-container")
    console.log("renderChart 1", pkg)

    if ("error" in pkg) {
      // fetch
      pkg = await fetchPackageDetails(pkg)
    }

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
  const { username, limit } = getUrlParams()

  if (username) {
    usernameInput.value = username
    limitInput.value = String(limit)
    // 尝试从缓存加载，无需强制刷新
    loadPackages(username, limit, false)

    usernameInput.parentElement?.insertAdjacentHTML(
      "beforeend",
      `<img src="https://avatars.githubusercontent.com/${username}?s=128" alt="github user icon" style="width: 5vw; border-radius: 50%;" />`,
      // `<img src="https://unavatar.io/npm/${username}?size=16" alt="" style="width:2.5rem;border-radius: 50%;" />`,
    )
  }

  // 表单提交
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const username = usernameInput.value.trim()
    const limit = Number(limitInput.value) || config.pkgLimit
    if (username) {
      window.location.href = `?username=${username}&limit=${limit}`
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
 * @param {string} username
 */
function renderHottest({ name, latestWeekDownloads }, username) {
  const [startLeaf, endLeaf] = makeLeaves("text-gold")
  hottestPkg.innerHTML = name
    ? `<div style="display: flex; align-items: center;">
    ${startLeaf}
      <a href="${NPMJS_DOMAIN}/${encodeURIComponent(name)}" title="当前最热包 🔥 | 前往 npm" style="color:inherit; font-weight: bold;" target="_blank">
        ${name}
      </a>
    ${endLeaf}
    <span style="margin-inline-start: 0.2em;">(🔥</span><a href="insight.html?username=${encodeURIComponent(username)}&rank=weekly-downloads" target="_self" title="📊 前往洞察页面" style="font-size: 60%;">
      Last 7 Days Downloads <span class='text-primary' style='font-family: Georgia; font-size: calc(20 / 16 * 1rem)'>${numberToLocaleString(latestWeekDownloads)}</span>
    </a>)
    </div>`
    : "-"
}

/**
 * @param {{ name: string; trend: number }} trend
 * @param {string} username
 */
function renderHottestTrend({ name, trend }, username) {
  const [startLeaf, endLeaf] = makeLeaves()

  hottestTrendPkg.innerHTML = name
    ? `${startLeaf}
      <a href="${NPMJS_DOMAIN}/package/${encodeURIComponent(name)}" target="_blank" title="当前增速最快包 🚀 | 前往 npm" style="color:inherit;">
        ${name}
      </a>
    ${endLeaf} <span style="margin-inline-start: 0.2em;">(</span><a href="insight.html?username=${encodeURIComponent(username)}&rank=trend" target="_self" title="📊 前往洞察页面" class='text-primary' style="font-size: 110%;">🚀+${trend}%</a>)`
    : "<span style='font-size: 0.8em;'>（无）<span style='font-size:80%;'>近期无下载量攀升的包</span></span>"
}

/**
 * 生成数据新鲜度标签
 * @param {boolean} fromCache - 数据是否来自缓存
 * @param {number|null} cacheTimestamp - 缓存时间戳（毫秒）
 * @returns {string} 展示用的时间标签
 * @example
 * ### 效果预览
 *
 * | 场景 | `updateTime` 显示 |
 * | :--- | :--- |
 * | **实时加载** | `🔄 实时数据 · 7/23/2026, 11:20:08 AM` |
 * | **缓存加载（5分钟前）** | `📦 缓存数据 · 7/23/2026, 11:15:00 AM (5 分钟前)` |
 * | **缓存加载（2小时前）** | `📦 缓存数据 · 7/23/2026, 9:20:00 AM (2 小时前)` |
 * | **缓存加载（1天前）** | `📦 缓存数据 · 7/22/2026, 10:00:00 AM (1 天前)` |
 * | **无数据** | `-` |
 *
 * 这样用户一眼就能知道数据是实时的还是缓存的，以及缓存了多久，方便判断数据的"新鲜度"。
 */
function getFreshnessLabel(fromCache, cacheTimestamp) {
  // ---- 优化：显示有意义的时间信息 ----
  const now = Date.now()
  let timeDisplay = ""

  if (fromCache && cacheTimestamp) {
    const elapsed = now - cacheTimestamp
    const elapsedMinutes = Math.floor(elapsed / (60 * 1000))
    const elapsedHours = Math.floor(elapsed / (60 * 60 * 1000))
    const elapsedDays = Math.floor(elapsed / (24 * 60 * 60 * 1000))

    let relativeTime
    if (elapsedDays > 0) {
      relativeTime = `${elapsedDays} 天前`
    } else if (elapsedHours > 0) {
      relativeTime = `${elapsedHours} 小时前`
    } else if (elapsedMinutes > 0) {
      relativeTime = `${elapsedMinutes} 分钟前`
    } else {
      relativeTime = "刚刚"
    }

    const cacheTimeStr = new Date(cacheTimestamp).toLocaleString()
    timeDisplay = `📦 缓存数据 · ${cacheTimeStr} (${relativeTime})`
  } else {
    // 实时数据
    const realTimeStr = new Date(now).toLocaleString()
    timeDisplay = `🔄 实时数据 · ${realTimeStr}`
  }

  return timeDisplay
}

/**
 * @param {string} [className]
 * @returns {[startLeaf: string, endLeaf: string]}
 */
function makeLeaves(className) {
  const endLeaf = makeEndLeaf(className)

  const startLeaf = endLeaf.replace("transform: scaleX(-1)", "")

  return [startLeaf, endLeaf]
}

/**
 * copy from https://cn.guidetoiceland.is/travel-iceland/drive/reykjavik
 * @param {string} [className]
 * @returns {string}
 */
function makeEndLeaf(className = "text-primary") {
  return `<svg viewBox="0 0 22 39" class="${className} reviewScoreLeaf" style="width: 1em; transform: scaleX(-1)" fill="currentColor">
            <title>left-reviewScoreLeaf</title>
            <path d="M16.431 36.965c-.094-.03-.188-.048-.268-.09-.689-.364-1.378-.73-2.052-1.112-.116-.066-.189-.221-.203-.34-.08-.635-.102-1.275-.225-1.903a3.243 3.243 0 00-.464-1.148c-.66-.998-1.378-1.973-2.081-2.966-.218 1.465-.21 2.924.246 4.402-.087-.06-.174-.12-.254-.192a67.614 67.614 0 01-1.544-1.507c-.08-.084-.138-.251-.094-.34.681-1.233.522-2.483.167-3.745-.225-.813-.443-1.626-.653-2.446-.05-.197-.058-.4-.152-.604-.87 1.627-1.233 3.314-.805 5.174-.123-.114-.196-.15-.225-.204a129.72 129.72 0 01-1.457-2.524c-.051-.09-.044-.245.021-.317.733-.819 1.204-1.722 1.32-2.733.138-1.238.218-2.482.319-3.72a.759.759 0 00-.036-.304c-.653.67-1.131 1.429-1.653 2.17-.537.766-.776 1.597-.798 2.476-.036 0-.065.006-.102.006-.08-.28-.18-.556-.232-.837a59.824 59.824 0 01-.333-1.98c-.015-.071.014-.185.072-.227.725-.532 1.247-1.184 1.69-1.884.805-1.262 1.269-2.631 1.755-3.995.029-.083.05-.167.029-.287-.363.305-.726.61-1.088.91-.24.197-.464.406-.718.591-.928.688-1.436 1.555-1.668 2.548-.021.084-.065.156-.094.233-.029-.006-.058-.006-.087-.012.029-.466.036-.939.087-1.405.065-.562.174-1.124.283-1.686a.461.461 0 01.21-.282c1.32-.7 2.4-1.572 3.19-2.715.443-.646 1.038-1.214 1.567-1.818.094-.107.196-.21.275-.34-1.718.574-3.284 1.315-4.394 2.595l-.101-.066c.224-.496.435-.999.674-1.49.225-.484.471-.872 1.196-1.088 1.284-.382 2.335-1.142 3.38-1.871.543-.383 1.094-.748 1.646-1.125.123-.09.246-.185.348-.31-.82.023-1.596.215-2.342.46-.747.245-1.458.556-2.22.849.037-.072.066-.15.124-.215.428-.485.856-.963 1.298-1.436a.502.502 0 01.326-.137c1.429-.03 2.748-.377 4.017-.891.682-.275 1.385-.515 2.074-.772a.737.737 0 00.268-.161 12.32 12.32 0 00-4.698.233c.08-.072.145-.143.232-.203.152-.114.311-.222.464-.335.587-.455 1.138-.802 2.088-.634 1.378.24 2.792.024 4.177-.12.5-.054 1.008-.095 1.508-.15a.496.496 0 00.247-.095c-1.64-.544-3.285-1.035-5.112-.658a2.907 2.907 0 00-.131-.137c.094-.024.196-.024.275-.066.276-.144.544-.293.805-.455a4.875 4.875 0 011.835-.705 3.626 3.626 0 001.922-.957c.493-.473.971-.963 1.442-1.453.116-.12.182-.276.276-.413h-.218c-.26.084-.514.173-.783.257-.819.251-1.682.43-2.458.76-.826.352-1.407.927-1.465 1.764-.007.078-.137.173-.232.227-.826.407-1.66.801-2.494 1.202-.043.024-.109.024-.16.03-.021-.018-.043-.03-.072-.048 1.341-.945 1.87-2.195 2.16-3.612-1.558.718-2.863 1.573-3.675 2.829-.334.508-.312 1.082-.08 1.644.167-.03.29-.053.413-.077.015.018.022.036.036.053-.776.598-1.559 1.197-2.335 1.795.559-1.394 0-2.745-.123-4.115-.602.76-1.182 1.513-1.653 2.314-.638 1.083-.515 2.201.007 3.296.08.167.05.269-.058.406-.493.616-.964 1.238-1.443 1.854-.043.054-.094.102-.138.156-.029 0-.058 0-.087-.006.087-1.447.095-2.883-.913-4.192-.066.125-.124.22-.16.322-.34.97-.718 1.932-1.008 2.913-.311 1.029.138 1.944.812 2.78.138.168.189.276.11.461-.334.838-.653 1.68-.98 2.518-.029.084-.072.162-.108.245-.08-.071-.095-.125-.087-.179.087-.915-.204-1.752-.776-2.53-.24-.323-.45-.658-.682-.98-.218-.3-.457-.587-.682-.88-.043.006-.087.018-.137.024-.044 1.059-.11 2.123-.116 3.182-.008.765.18 1.507.667 2.17.326.45.732.862 1.392.934-.073 1.19-.145 2.374-.225 3.564-.573-1.896-2.32-3.056-3.915-4.318-.015.144.021.263.058.389.217.861.391 1.74.667 2.59.406 1.267 1.16 2.362 2.646 2.984.232.095.493.137.747.209.283 1.082.58 2.219.892 3.433-.094-.096-.138-.126-.167-.168-.471-.741-1.16-1.321-1.994-1.776C2.132 23.856 1.06 23.294 0 22.732v.12c.044.041.102.083.13.13.472.79.965 1.58 1.415 2.381.819 1.471 2.131 2.452 4.024 2.907.428.101.464.083.53-.24.68 1.065 1.37 2.141 2.11 3.296-1.988-1.376-4.293-1.86-6.679-2.117.37.305.79.568 1.088.909.892 1.022 2.059 1.758 3.386 2.332 1.08.466 2.24.646 3.466.448.109-.017.283.066.377.144.74.634 1.501 1.292 2.262 1.944.073.06.138.131.204.197l-.051.06c-1.16-.341-2.364-.467-3.59-.43-1.203.035-2.407.107-3.669.167.08.101.095.125.11.131 1.725.76 3.436 1.567 5.416 1.812 1.225.15 2.4.036 3.502-.46.101-.048.29-.012.406.036 1.08.496 2.16 1.005 3.241 1.507"></path>
          </svg>`
}

const settings = /** @type {HTMLElement} */ (document.getElementById("settings"))

// 监听自定义 change 事件
// @ts-expect-error
settings.addEventListener(
  "chart-provider-change",
  (/** @type {CustomEvent<{ provider: 'npmx' | 'chart.js' }>} */ e) => {
    const provider = e.detail.provider
    console.log("当前 provider:", provider)
    document.documentElement.setAttribute("data-provider", provider)
    localStorage.setItem("provider", provider)
    // 更新页面其他元素

    // change all the a links from npmjs.com to npmx.dev
    const [from, to] = provider === "npmx" ? [NPMJS_DOMAIN, NPMX_DOMAIN] : [NPMX_DOMAIN, NPMJS_DOMAIN]
    const [fromKeyword, toKeyword] = provider === "npmx" ? ["npm", "npmx"] : ["npmx", "npm"]

    document.querySelectorAll(`a[href^='${from}']`).forEach((a) => {
      const link = /** @type {HTMLAnchorElement} */ (a)

      link.href = link.href.replace(from, to)
      link.title = link.title.replace(fromKeyword, toKeyword)
    })

    document.querySelectorAll("badge-dependencies").forEach((element) => {
      element.setAttribute("provider", provider === "npmx" ? "npmx" : "npm")
    })
  },
)

// theme-change
function updateAllChartColors() {
  const s = getComputedStyle(document.documentElement)
  const gridColor = s.getPropertyValue("--border-muted").trim()
  const tickColor = s.getPropertyValue("--text-muted").trim()
  const accentColor = s.getPropertyValue("--accent-green").trim()

  for (const chart of charts) {
    // @ts-expect-error
    chart.options.scales.x.grid.color = gridColor
    // @ts-expect-error
    chart.options.scales.x.ticks.color = tickColor
    // @ts-expect-error
    chart.options.scales.y.grid.color = gridColor
    // @ts-expect-error
    chart.options.scales.y.ticks.color = tickColor
    // @ts-expect-error
    chart.data.datasets[0].borderColor = accentColor
    // @ts-expect-error
    chart.data.datasets[0].pointBackgroundColor = accentColor
    chart.update("none")
  }
}

// @ts-expect-error
settings.addEventListener("theme-change", (/** @type {CustomEvent<{ theme: string }>} */ e) => {
  const theme = e.detail.theme
  console.log("当前主题:", theme)

  document.documentElement.setAttribute("data-theme", theme)
  localStorage.setItem("theme", theme)

  updateAllChartColors()

  // update all the npmx embed charts
  const imgs = /** @type {NodeListOf<HTMLImageElement>} */ (document.querySelectorAll(".npmx-embed-downloads-chart"))
  imgs.forEach((img) => {
    const src = new URL(img.src)
    src.searchParams.set("mode", theme === "dark" ? "dark" : "light")
    img.src = src.toString()
  })
})
