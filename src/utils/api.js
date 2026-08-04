/** @import { NpmPkgDownloadsResp, NpmPkgResp, NpmPkgSearchResp, Package, ShieldIODependents } from './npmjs.type.js' */

import { fetchJSON, sleep } from "./light-lodash.js"

// ============================================================
//  4. npm API 调用（浏览器端直接请求，支持 CORS）
// ============================================================

/** npm search API 单次拉取最大数量 */
// 190 https://registry.npmjs.org/-/v1/search?text=maintainer:antfu&sort=date&size=190 才可以拉取到 2026-7-31 16:14:49 一小时之前发布的 magic-string-stack
export const MAX_SEARCH_SIZE = 3
// export const MAX_SEARCH_SIZE = 100

const DEV = true

const prefix = DEV ? "http://localhost:8787/" : ""

// console.log("DEV:", DEV)

/**
 * https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md#get-v1search
 * 搜索用户维护的所有包，按发布时间排序
 * @param {string} username - npm 用户名
 * @returns {Promise<{ packages: Package[], dependents: Record<string, number> }>}
 */
export async function fetchUserPackages(username, forceRefresh = false) {
  const cacheBust = forceRefresh && DEV ? `&_t=${Date.now()}` : ""
  const url =
    prefix +
    `https://registry.npmjs.org/-/v1/search?` +
    `text=maintainer:${encodeURIComponent(username)}` +
    `&size=${MAX_SEARCH_SIZE}${cacheBust}`
  // ""
  // NPM Bug: not return all by publish time.

  const data = /** @type {NpmPkgSearchResp} */ (await fetchJSON(url, { label: "npm search" }))

  // console.log("data:", data)

  const packages = data.objects.map((o) => o.package)

  // Extract dependents map
  /** @type {Record<string, number>} */
  const dependents = {}
  for (const obj of data.objects) {
    dependents[obj.package.name] = Number(obj.dependents) || 0
  }

  // 客户端按发布时间排序（最新在前）
  packages.sort((a, b) => {
    // return Math.random() - 0.5
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })

  // console.log("packages:", packages)
  // console.log(
  //   "packages:",
  //   packages.map((x) => x.name),
  // )

  return { packages, dependents }
}

/**
 * 获取包完整元数据（含 time 字段）
 * @param {string} pkgName - 包名
 * @returns {Promise<NpmPkgResp>}
 *
 */
export async function fetchPackageMetadata(pkgName, forceRefresh = false) {
  const cacheBust = forceRefresh && DEV ? `?_t=${Date.now()}` : ""
  const url = `${prefix}https://registry.npmjs.org/${encodeURIComponent(pkgName)}${cacheBust}`
  const res = await fetchJSON(url, { label: `获取 ${pkgName} 元数据` })

  // @ts-expect-error
  return res
}

/**
 * 获取最近一年（52周）的周聚合下载量
 * @param {string} pkgName - 包名
 */
export async function fetchYearlyWeeklyDownloads(pkgName, forceRefresh = false) {
  // await sleep(3000)

  // 计算日期范围：从今天往前推 364 天
  const now = new Date()
  const endDate = new Date(now)
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 364)

  /** @param {Date} d */
  const formatDate = (d) => d.toISOString().slice(0, 10)
  const period = `${formatDate(startDate)}:${formatDate(endDate)}`

  const cacheBust = forceRefresh && DEV ? `?_t=${Date.now()}` : ""
  const url = `${prefix}https://api.npmjs.org/downloads/range/${period}/${encodeURIComponent(pkgName)}${cacheBust}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`获取 ${pkgName} 下载量失败: ${res.status}`)
  }

  /** @type {NpmPkgDownloadsResp} */
  const data = await res.json()

  // 按周聚合数据
  const dailyData = data.downloads.map((d) => ({
    day: d.day,
    downloads: d.downloads,
  }))
  const weeklyData = []
  const currentWeek = []
  const weekStart = new Date(startDate)

  // 以 startDate 为起点，按7天一组分组
  const dayMap = new Map()
  dailyData.forEach((d) => {
    dayMap.set(d.day, d.downloads)
  })

  for (let i = 0; i < 52; i++) {
    const weekStartDate = new Date(startDate)
    weekStartDate.setDate(weekStartDate.getDate() + i * 7)
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekEndDate.getDate() + 6)

    let weekTotal = 0
    let hasData = false
    for (let j = 0; j < 7; j++) {
      const day = new Date(weekStartDate)
      day.setDate(day.getDate() + j)
      const dayStr = day.toISOString().slice(0, 10)
      if (dayMap.has(dayStr)) {
        weekTotal += dayMap.get(dayStr)
        hasData = true
      }
    }

    // 如果整周都没有数据（可能未来日期），用0填充
    weeklyData.push({
      weekIndex: i,
      startDate: new Date(weekStartDate),
      endDate: new Date(weekEndDate),
      total: hasData ? weekTotal : 0,
      // 存储每日明细用于tooltip
      days: Array.from({ length: 7 }, (_, j) => {
        const day = new Date(weekStartDate)
        day.setDate(day.getDate() + j)
        const dayStr = day.toISOString().slice(0, 10)
        return { date: dayStr, downloads: dayMap.get(dayStr) || 0 }
      }),
    })
  }

  // 计算趋势：比较最近两周的下载量
  const latest = weeklyData.at(-1)?.total || 0
  const secondHalf = weeklyData.at(-2)?.total || 0
  const trend = latest === 0 ? 0 : Math.round(((latest - secondHalf) / secondHalf) * 100)

  return {
    weekly: weeklyData,
    total: weeklyData.reduce((sum, w) => sum + w.total, 0),
    trend,
  }
}

/**
 * 获取 GitHub Star 数（浏览器端通过 CORS 代理）
 * @param {string} owner
 * @param {string} repo
 */
export async function fetchGitHubStars(owner, repo, forceRefresh = false) {
  // 使用公共 CORS 代理（免费，有请求限制）
  const cacheBust = forceRefresh && DEV ? `?_t=${Date.now()}` : ""
  const url = `${prefix}https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}${cacheBust}`
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      // 不加 User-Agent 可能会被限制，但浏览器默认会带
    },
  })
  if (!res.ok) {
    if (res.status === 403) {
      // 可能触发限流
      return { stars: null, error: "API 限流，请稍后再试" }
    }
    return { stars: null, error: `HTTP ${res.status}` }
  }
  const data = await res.json()
  return { stars: data.stargazers_count || 0, error: null }
}

/**
 * 获取 GitHub 最近一次提交信息
 * @param {string} owner
 * @param {string} repo
 *
 */
export async function fetchGitHubLastCommit(owner, repo, forceRefresh = false) {
  const cacheBust = forceRefresh && DEV ? `&_t=${Date.now()}` : ""
  const url =
    prefix +
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=1${cacheBust}`
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json" },
  })
  if (!res.ok) {
    if (res.status === 403) {
      return { message: null, date: null, error: "API 限流" }
    }
    return { message: null, date: null, error: `HTTP ${res.status}` }
  }
  const data = await res.json()
  if (!data.length) {
    return { message: null, date: null, error: "无提交记录" }
  }
  const commit = data[0].commit
  return {
    message: commit.message.split("\n")[0] || "无提交信息",
    date: commit.committer?.date || null,
    error: null,
  }
}

/**
 *
 * @param {string} pkg
 * @returns {Promise<import('./base.type.js').int>}
 */
export async function fetchDependentsCount(pkg) {
  const url = `https://img.shields.io/librariesio/dependents/npm/${encodeURIComponent(pkg)}.json`

  const json = /** @type {ShieldIODependents} */ (await fetchJSON(url, { label: "fetch Dependents" }))

  return Number(json.value)
}
